import { useEffect, useMemo, useRef, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useSWRConfig } from 'swr';

import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Grid from '@mui/material/GridLegacy';
import MainCard from 'ui-component/cards/MainCard';
import Typography from '@mui/material/Typography';
import { IconExternalLink } from '@tabler/icons-react';

import { useDispatch } from 'store';
import { openSnackbar } from 'store/slices/snackbar';
import { useAccountingAccounts } from 'modules/Accounting/hooks/useAccounting';
import type { PartyDto } from 'modules/Parties/types/parties.types';
import { useParties } from 'modules/Parties/hooks/useParties';

import TreasuryAllocationTable, { type TreasuryAllocationRow } from '../components/TreasuryAllocationTable';
import TreasuryVoucherForm, { type VoucherFormState } from '../components/TreasuryVoucherForm';
import { createTreasuryPayment, getTreasuryPayment, postTreasuryPayment, updateTreasuryPayment } from '../api/treasuryApi';
import { useEligiblePurchaseInvoices, useTreasuryAccounts, useTreasuryLookups } from '../hooks/useTreasury';
import { TREASURY_ALLOCATION_TYPES, PAYMENT_PURPOSES, TREASURY_PERMISSIONS, TREASURY_LOOKUP_PAGE_SIZE } from '../utils/treasury.constants';
import type { TreasuryAllocationInput } from '../types/treasury.types';
import Loader from 'ui-component/Loader';

export default function TreasuryPaymentFormPage() {
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
  const {
    items: accountingAccounts,
    isLoading: accountingAccountsLoading,
    error: accountingAccountsError,
    mutate: mutateAccountingAccounts
  } = useAccountingAccounts({ page: 1, pageSize: TREASURY_LOOKUP_PAGE_SIZE, isActive: true, isPosting: true });
  const { lookups, error: lookupsError, mutate: mutateLookups } = useTreasuryLookups();
  const { payment, isLoading: paymentLoading } = useTreasuryPaymentData(id);
  const { items: eligibleInvoices, isLoading: eligibleLoading, error: eligibleError, mutate: mutateEligibleInvoices } = useEligiblePurchaseInvoices(form.partyId || undefined, 1, TREASURY_LOOKUP_PAGE_SIZE);
  const selectedParty = parties.find((party) => party.id === form.partyId) ?? null;
  const selectedTreasuryAccount = accounts.find((account) => account.id === form.treasuryAccountId) ?? null;
  const offsetAccounts = useMemo(() => {
    const treasuryAccountingAccountId = selectedTreasuryAccount?.accountingAccountId ?? null;
    return accountingAccounts.filter((account) => account.id !== treasuryAccountingAccountId);
  }, [accountingAccounts, selectedTreasuryAccount?.accountingAccountId]);

  useEffect(() => {
    if (!payment) return;

    setForm({
      treasuryAccountId: payment.treasuryAccountId,
      partyId: payment.partyId,
      voucherDate: payment.paymentDate,
      paymentMethod: payment.paymentMethod,
      relatedDocumentNumber: payment.relatedDocumentNumber ?? '',
      reason: payment.reason ?? '',
      notes: payment.notes ?? '',
      offsetAccountingAccountId: '',
      totalAmount: payment.totalAmount
    });

    setAllocationMap(
      payment.allocations.reduce<Record<string, number>>((accumulator, allocation) => {
        if (allocation.sourceDocumentNumber) {
          accumulator[allocation.sourceDocumentNumber] = allocation.amount;
        }
        return accumulator;
      }, {})
    );
  }, [payment]);

  useEffect(() => {
    if (previousPartyId.current && previousPartyId.current !== form.partyId) {
      setAllocationMap({});
    }
    previousPartyId.current = form.partyId;
  }, [form.partyId]);

  useEffect(() => {
    if (selectedParty?.isSupplier && form.offsetAccountingAccountId) {
      setForm((current) => (current.offsetAccountingAccountId ? { ...current, offsetAccountingAccountId: '' } : current));
      return;
    }

    if (form.offsetAccountingAccountId && !offsetAccounts.some((account) => account.id === form.offsetAccountingAccountId)) {
      setForm((current) => (current.offsetAccountingAccountId ? { ...current, offsetAccountingAccountId: '' } : current));
    }
  }, [form.offsetAccountingAccountId, offsetAccounts, selectedParty?.isSupplier, setForm]);

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
  const isExpenseOwned = payment?.sourceDocumentType === 'Expense' && Boolean(payment.sourceDocumentId);

  const notify = (message: string, severity: 'success' | 'error' = 'success') => {
    dispatch(openSnackbar({ open: true, message, variant: 'alert', severity }));
  };

  const buildAllocations = (): TreasuryAllocationInput[] =>
    allocationRows
      .filter((row) => row.allocatedAmount > 0)
      .map((row) => ({
        allocationType: TREASURY_ALLOCATION_TYPES.INVOICE_SETTLEMENT,
        sourceDocumentType: 'PurchaseInvoice',
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
        paymentDate: form.voucherDate,
        paymentMethod: form.paymentMethod,
        relatedDocumentNumber: form.relatedDocumentNumber || null,
        reason: form.reason || null,
        notes: form.notes || null,
        offsetAccountingAccountId: selectedParty?.isSupplier ? null : form.offsetAccountingAccountId || null,
        allocations: buildAllocations()
      };

      let savedPayment = payment;
      if (isEdit && payment) {
        savedPayment = await updateTreasuryPayment(payment.id, { ...request, rowVersion: payment.rowVersion });
      } else {
        savedPayment = await createTreasuryPayment(request);
      }

      if (actionType === 'post' && savedPayment) {
        savedPayment = await postTreasuryPayment(savedPayment.id, savedPayment.rowVersion);
      }

      await mutateTreasury((key) => typeof key === 'string' && (key.startsWith('/api/treasury/') || key.startsWith('/api/parties/') || key.startsWith('/api/purchases/invoices') || key.startsWith('/api/expenses/')));
      await Promise.all([mutateAccounts(), mutateParties(), mutateAccountingAccounts(), mutateLookups(), mutateEligibleInvoices()]);
      notify(intl.formatMessage({ id: 'treasury.payment-saved', defaultMessage: 'تم حفظ سند الصرف بنجاح.' }));
      navigate(`/treasury/payments/${savedPayment?.id ?? payment?.id}`);
    } catch (error) {
      notify(error instanceof Error ? error.message : intl.formatMessage({ id: 'treasury.action-failed', defaultMessage: 'فشلت العملية.' }), 'error');
    } finally {
      setIsSaving(false);
    }
  };

  if (isEdit && paymentLoading) {
    return <Loader />;
  }

  if (isEdit && isExpenseOwned && payment) {
    return (
      <Box>
        <MainCard sx={{ border: '1px solid', borderColor: 'warning.main', bgcolor: 'warning.lighter', borderRadius: 3 }}>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            هذا السند تم إنشاؤه من مصروف
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            لا يمكن تعديل سند الصرف أو ترحيله أو إلغاؤه من شاشة الصرف لأنه مرتبط بالمصروف الأصلي.
          </Typography>
          <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
            <Button component={Link} to={`/expenses/${payment.sourceDocumentId}`} variant="contained" color="warning" startIcon={<IconExternalLink size={18} />}>
              <FormattedMessage id="expenses.details" defaultMessage="تفاصيل المصروف" />
            </Button>
            <Button component={Link} to={`/treasury/payments/${payment.id}`} variant="outlined" color="inherit">
              <FormattedMessage id="back" defaultMessage="رجوع" />
            </Button>
          </Box>
        </MainCard>
      </Box>
    );
  }

  return (
    <Box>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          {(accountsError || partiesError || lookupsError || eligibleError) && (
            <Alert
              severity="error"
              action={
                <Button
                  color="inherit"
                  size="small"
        onClick={() => {
                      void Promise.all([mutateAccounts(), mutateParties(), mutateAccountingAccounts(), mutateLookups(), mutateEligibleInvoices()]);
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
            type="payment"
            isEdit={isEdit}
            isLoading={accountsLoading || partiesLoading || accountingAccountsLoading || eligibleLoading}
            isSaving={isSaving}
            status={payment?.status}
            voucherNumber={payment?.number}
            form={form}
            setForm={setForm}
            accounts={accounts}
            parties={parties as PartyDto[]}
            offsetAccounts={offsetAccounts}
            paymentMethods={lookups?.paymentMethods ?? []}
            purposes={PAYMENT_PURPOSES}
            allocationsTitle="سداد فاتورة شراء"
            allocationsElement={<TreasuryAllocationTable invoices={allocationRows} onAllocationChange={handleAllocationChange} maxTotalAllocation={form.totalAmount} />}
            totalAllocated={totalAllocated}
            postPermission={TREASURY_PERMISSIONS.paymentsPost}
            lookupError={accountsError || partiesError || accountingAccountsError || lookupsError || eligibleError ? intl.formatMessage({ id: 'treasury.lookup-load-error', defaultMessage: 'تعذر تحميل البيانات' }) : null}
            onRetryLookups={() => {
              void Promise.all([mutateAccounts(), mutateParties(), mutateAccountingAccounts(), mutateLookups(), mutateEligibleInvoices()]);
            }}
            onSubmit={handleSubmit}
            backUrl="/treasury/payments"
          />
        </Grid>
      </Grid>
    </Box>
  );
}

function useTreasuryPaymentData(id?: string) {
  const [payment, setPayment] = useState<Awaited<ReturnType<typeof getTreasuryPayment>> | null>(null);
  const [isLoading, setIsLoading] = useState(Boolean(id));

  useEffect(() => {
    let isMounted = true;
    if (!id) {
      setPayment(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    getTreasuryPayment(id)
      .then((data) => {
        if (isMounted) {
          setPayment(data);
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

  return { payment, isLoading };
}
