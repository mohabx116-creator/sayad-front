import { useEffect, useMemo, useState } from 'react';
import { useIntl } from 'react-intl';
import { useNavigate, useParams } from 'react-router-dom';
import { useSWRConfig } from 'swr';

import Box from '@mui/material/Box';
import Grid from '@mui/material/GridLegacy';

import { useDispatch } from 'store';
import { openSnackbar } from 'store/slices/snackbar';
import type { PartyDto } from 'modules/Parties/types/parties.types';

import TreasuryAllocationTable, { type TreasuryAllocationRow } from '../components/TreasuryAllocationTable';
import TreasuryVoucherForm, { type VoucherFormState } from '../components/TreasuryVoucherForm';
import { createTreasuryReceipt, getTreasuryReceipt, postTreasuryReceipt, updateTreasuryReceipt } from '../api/treasuryApi';
import { useEligibleSalesInvoices, useTreasuryAccounts, useTreasuryLookups } from '../hooks/useTreasury';
import { useParties } from 'modules/Parties/hooks/useParties';
import { TREASURY_ALLOCATION_TYPES, TREASURY_PERMISSIONS, RECEIPT_PURPOSES } from '../utils/treasury.constants';
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
    totalAmount: 0
  });
  const [allocationMap, setAllocationMap] = useState<Record<string, number>>({});
  const [isSaving, setIsSaving] = useState(false);

  const { items: accounts, isLoading: accountsLoading } = useTreasuryAccounts({ page: 1, pageSize: 200, status: 'Active' });
  const { items: parties, isLoading: partiesLoading } = useParties({ page: 1, pageSize: 200, isCustomer: true });
  const { lookups } = useTreasuryLookups();
  const { receipt, isLoading: receiptLoading } = useTreasuryReceiptData(id);
  const { items: eligibleInvoices, isLoading: eligibleLoading } = useEligibleSalesInvoices(form.partyId || undefined, 1, 200);

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
    if (!isEdit && form.partyId) {
      setAllocationMap({});
    }
  }, [form.partyId, isEdit]);

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
          <TreasuryVoucherForm
            type="receipt"
            isEdit={isEdit}
            isLoading={accountsLoading || partiesLoading || eligibleLoading}
            isSaving={isSaving}
            status={receipt?.status}
            voucherNumber={receipt?.number}
            form={form}
            setForm={setForm}
            accounts={accounts}
            parties={parties as PartyDto[]}
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
