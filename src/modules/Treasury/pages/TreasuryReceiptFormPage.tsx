import { useEffect, useMemo, useState } from 'react';
import { useRef } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { useNavigate, useParams } from 'react-router-dom';
import { useSWRConfig } from 'swr';

import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Grid from '@mui/material/GridLegacy';

import { useDispatch } from 'store';
import { openSnackbar } from 'store/slices/snackbar';
import type { PartyDto } from 'modules/Parties/types/parties.types';

import TreasuryAllocationTable, { type TreasuryAllocationRow } from '../components/TreasuryAllocationTable';
import TreasuryVoucherForm, { type VoucherFormState } from '../components/TreasuryVoucherForm';
import { createTreasuryReceipt, getTreasuryReceipt, postTreasuryReceipt, updateTreasuryReceipt } from '../api/treasuryApi';
import { useEligibleSalesInvoices, useTreasuryAccounts, useTreasuryLookups } from '../hooks/useTreasury';
import { useAccountingAccounts } from 'modules/Accounting/hooks/useAccounting';
import { useParties } from 'modules/Parties/hooks/useParties';
import { TREASURY_ALLOCATION_TYPES, TREASURY_PERMISSIONS, RECEIPT_PURPOSES, TREASURY_LOOKUP_PAGE_SIZE } from '../utils/treasury.constants';
import type { TreasuryAllocationInput } from '../types/treasury.types';
import Loader from 'ui-component/Loader';

export default function TreasuryReceiptFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const intl = useIntl();
  const dispatch = useDispatch();
  const { mutate: mutateTreasury } = useSWRConfig();
  const isEdit = Boolean(id);

  const [form, setForm] = useState<VoucherFormState>({
    treasuryAccountId: '',
    partyId: '',
    voucherDate: new Date().toISOString().slice(0, 10),
    paymentMethod: '',
    relatedDocumentNumber: '',
    reason: '',
    notes: '',
    offsetAccountingAccountId: '',
    totalAmount: 0
  });
  const [allocationMap, setAllocationMap] = useState<Record<string, number>>({});
  const [isSaving, setIsSaving] = useState(false);
  const previousPartyId = useRef('');

  const { items: accounts, isLoading: accountsLoading, error: accountsError, mutate: mutateAccounts } = useTreasuryAccounts({ page: 1, pageSize: TREASURY_LOOKUP_PAGE_SIZE, isActive: true });
  const { items: parties, isLoading: partiesLoading, error: partiesError, mutate: mutateParties } = useParties({ page: 1, pageSize: TREASURY_LOOKUP_PAGE_SIZE, isActive: true });
  const { lookups, error: lookupsError, mutate: mutateLookups } = useTreasuryLookups();
  const { items: accountingAccounts, isLoading: accountingAccountsLoading, error: accountingAccountsError, mutate: mutateAccountingAccounts } = useAccountingAccounts({ page: 1, pageSize: TREASURY_LOOKUP_PAGE_SIZE, isActive: true, isPosting: true });
  const { receipt, isLoading: receiptLoading } = useTreasuryReceiptData(id);
  const { items: eligibleInvoices, isLoading: eligibleLoading, error: eligibleError, mutate: mutateEligibleInvoices } = useEligibleSalesInvoices(form.partyId || undefined, 1, TREASURY_LOOKUP_PAGE_SIZE);
  const selectedParty = useMemo(() => parties.find((party) => party.id === form.partyId) ?? null, [form.partyId, parties]);
  const selectedTreasuryAccount = useMemo(() => accounts.find((account) => account.id === form.treasuryAccountId) ?? null, [accounts, form.treasuryAccountId]);
  const offsetAccounts = useMemo(() => accountingAccounts.filter((account) => account.id !== selectedTreasuryAccount?.accountingAccountId), [accountingAccounts, selectedTreasuryAccount?.accountingAccountId]);

  useEffect(() => {
    if (!receipt) return;

    setForm({
      treasuryAccountId: receipt.treasuryAccountId,
      partyId: receipt.partyId,
      voucherDate: receipt.receiptDate,
      paymentMethod: receipt.paymentMethod,
      relatedDocumentNumber: receipt.relatedDocumentNumber ?? '',
      reason: receipt.reason ?? '',
      notes: receipt.notes ?? '',
      offsetAccountingAccountId: receipt.offsetAccountingAccountId ?? '',
      totalAmount: receipt.totalAmount
    });

    setAllocationMap(
      receipt.allocations.reduce<Record<string, number>>((accumulator, allocation) => {
        if (allocation.sourceDocumentNumber) {
          accumulator[allocation.sourceDocumentNumber] = allocation.amount;
        }
        return accumulator;
      }, {})
    );
  }, [receipt]);

  useEffect(() => {
    if (previousPartyId.current && previousPartyId.current !== form.partyId) {
      setAllocationMap({});
    }
    previousPartyId.current = form.partyId;
  }, [form.partyId]);

  useEffect(() => {
    if (selectedParty?.isCustomer && form.offsetAccountingAccountId) {
      setForm((current) => ({ ...current, offsetAccountingAccountId: '' }));
    }
  }, [form.offsetAccountingAccountId, selectedParty?.isCustomer, setForm]);

  const eligibleInvoiceMap = useMemo(() => new Map(eligibleInvoices.map((invoice) => [invoice.invoiceId, invoice.invoiceNumber])), [eligibleInvoices]);
  const allocationRows = useMemo<TreasuryAllocationRow[]>(
    () =>
      eligibleInvoices.map((invoice) => ({
        ...invoice,
        allocatedAmount: allocationMap[invoice.invoiceNumber] ?? 0
      })),
    [allocationMap, eligibleInvoices]
  );
  const totalAllocated = useMemo(() => allocationRows.reduce((sum, row) => sum + row.allocatedAmount, 0), [allocationRows]);

  const notify = (message: string, severity: 'success' | 'error' = 'success') => {
    dispatch(openSnackbar({ open: true, message, variant: 'alert', severity }));
  };

  const buildAllocations = (): TreasuryAllocationInput[] =>
    allocationRows
      .filter((row) => row.allocatedAmount > 0)
      .map((row) => ({
        allocationType: TREASURY_ALLOCATION_TYPES.INVOICE_SETTLEMENT,
        sourceDocumentType: 'SalesInvoice',
        sourceDocumentNumber: row.invoiceNumber,
        amount: row.allocatedAmount,
        notes: null
      }));

  const handleAllocationChange = (invoiceId: string, amount: number) => {
    const invoiceNumber = eligibleInvoiceMap.get(invoiceId);
    if (!invoiceNumber) {
      return;
    }

    setAllocationMap((current) => ({ ...current, [invoiceNumber]: amount }));
  };

  const handleSubmit = async (actionType: 'draft' | 'post') => {
    try {
      setIsSaving(true);
      const request = {
        treasuryAccountId: form.treasuryAccountId,
        partyId: form.partyId,
        receiptDate: form.voucherDate,
        paymentMethod: form.paymentMethod,
        relatedDocumentNumber: form.relatedDocumentNumber || null,
        reason: form.reason || null,
        notes: form.notes || null,
        offsetAccountingAccountId: selectedParty?.isCustomer ? null : form.offsetAccountingAccountId || null,
        allocations: buildAllocations()
      };

      let savedReceipt = receipt;
      if (isEdit && receipt) {
        savedReceipt = await updateTreasuryReceipt(receipt.id, { ...request, rowVersion: receipt.rowVersion });
      } else {
        savedReceipt = await createTreasuryReceipt(request);
      }

      if (actionType === 'post' && savedReceipt) {
        savedReceipt = await postTreasuryReceipt(savedReceipt.id, savedReceipt.rowVersion);
      }

      await mutateTreasury((key) => typeof key === 'string' && key.startsWith('/api/treasury/'));
      await Promise.all([mutateAccounts(), mutateParties(), mutateLookups(), mutateEligibleInvoices(), mutateAccountingAccounts()]);
      notify(intl.formatMessage({ id: 'treasury.receipt-saved', defaultMessage: 'تم حفظ الإيصال بنجاح.' }));
      navigate(`/treasury/receipts/${savedReceipt?.id ?? receipt?.id}`);
    } catch (error) {
      notify(error instanceof Error ? error.message : intl.formatMessage({ id: 'treasury.action-failed', defaultMessage: 'فشلت العملية.' }), 'error');
    } finally {
      setIsSaving(false);
    }
  };

  if (isEdit && receiptLoading) {
    return <Loader />;
  }

  return (
    <Box>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          {(accountsError || partiesError || lookupsError || eligibleError || accountingAccountsError) && (
            <Alert
              severity="error"
              action={
                <Button
                  color="inherit"
                  size="small"
                  onClick={() => {
                    void Promise.all([mutateAccounts(), mutateParties(), mutateLookups(), mutateEligibleInvoices(), mutateAccountingAccounts()]);
                  }}
                >
                  <FormattedMessage id="retry" defaultMessage="إعادة المحاولة" />
                </Button>
              }
              sx={{ mb: 3 }}
            >
              <FormattedMessage id="treasury.lookup-load-error" defaultMessage="تعذر تحميل البيانات" />
            </Alert>
          )}
          <TreasuryVoucherForm
            type="receipt"
            isEdit={isEdit}
            isLoading={accountsLoading || partiesLoading || eligibleLoading || accountingAccountsLoading}
            isSaving={isSaving}
            status={receipt?.status}
            voucherNumber={receipt?.number}
            form={form}
            setForm={setForm}
            accounts={accounts}
            parties={parties as PartyDto[]}
            offsetAccounts={offsetAccounts}
            paymentMethods={lookups?.paymentMethods ?? []}
            purposes={RECEIPT_PURPOSES}
            allocationsTitle="تسوية فاتورة بيع"
            allocationsElement={
              <TreasuryAllocationTable
                invoices={allocationRows}
                onAllocationChange={handleAllocationChange}
                maxTotalAllocation={form.totalAmount}
              />
            }
            totalAllocated={totalAllocated}
            postPermission={TREASURY_PERMISSIONS.receiptsPost}
            lookupError={accountsError || partiesError || lookupsError || eligibleError || accountingAccountsError ? intl.formatMessage({ id: 'treasury.lookup-load-error', defaultMessage: 'تعذر تحميل البيانات' }) : null}
            onRetryLookups={() => {
              void Promise.all([mutateAccounts(), mutateParties(), mutateLookups(), mutateEligibleInvoices(), mutateAccountingAccounts()]);
            }}
            onSubmit={handleSubmit}
            backUrl="/treasury/receipts"
          />
        </Grid>
      </Grid>
    </Box>
  );
}

function useTreasuryReceiptData(id?: string) {
  const [receipt, setReceipt] = useState<Awaited<ReturnType<typeof getTreasuryReceipt>> | null>(null);
  const [isLoading, setIsLoading] = useState(Boolean(id));

  useEffect(() => {
    let isMounted = true;
    if (!id) {
      setReceipt(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    getTreasuryReceipt(id)
      .then((data) => {
        if (isMounted) {
          setReceipt(data);
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [id]);

  return { receipt, isLoading };
}
