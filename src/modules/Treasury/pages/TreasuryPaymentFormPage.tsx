import { useEffect, useMemo, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useSWRConfig } from 'swr';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Grid from '@mui/material/GridLegacy';
import MainCard from 'ui-component/cards/MainCard';
import Typography from '@mui/material/Typography';
import { IconExternalLink } from '@tabler/icons-react';

import { useDispatch } from 'store';
import { openSnackbar } from 'store/slices/snackbar';
import type { PartyDto } from 'modules/Parties/types/parties.types';
import { useParties } from 'modules/Parties/hooks/useParties';

import TreasuryAllocationTable, { type TreasuryAllocationRow } from '../components/TreasuryAllocationTable';
import TreasuryVoucherForm, { type VoucherFormState } from '../components/TreasuryVoucherForm';
import { createTreasuryPayment, getTreasuryPayment, postTreasuryPayment, updateTreasuryPayment } from '../api/treasuryApi';
import { useEligiblePurchaseInvoices, useTreasuryAccounts } from '../hooks/useTreasury';
import { TREASURY_ALLOCATION_TYPES, PAYMENT_PURPOSES, TREASURY_PERMISSIONS } from '../utils/treasury.constants';
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
    relatedDocumentNumber: '',
    reason: '',
    notes: '',
    totalAmount: 0
  });
  const [allocationMap, setAllocationMap] = useState<Record<string, number>>({});
  const [isSaving, setIsSaving] = useState(false);

  const { items: accounts, isLoading: accountsLoading } = useTreasuryAccounts({ page: 1, pageSize: 200, status: 'Active' });
  const { items: parties, isLoading: partiesLoading } = useParties({ page: 1, pageSize: 200, isSupplier: true });
  const { payment, isLoading: paymentLoading } = useTreasuryPaymentData(id);
  const { items: eligibleInvoices, isLoading: eligibleLoading } = useEligiblePurchaseInvoices(form.partyId || undefined, 1, 200);

  useEffect(() => {
    if (!payment) return;

    setForm({
      treasuryAccountId: payment.treasuryAccountId,
      partyId: payment.partyId,
      voucherDate: payment.paymentDate,
      relatedDocumentNumber: payment.relatedDocumentNumber ?? '',
      reason: payment.reason ?? '',
      notes: payment.notes ?? '',
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
        relatedDocumentNumber: form.relatedDocumentNumber || null,
        reason: form.reason || null,
        notes: form.notes || null,
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
          <TreasuryVoucherForm
            type="payment"
            isEdit={isEdit}
            isLoading={accountsLoading || partiesLoading || eligibleLoading}
            isSaving={isSaving}
            status={payment?.status}
            voucherNumber={payment?.number}
            form={form}
            setForm={setForm}
            accounts={accounts}
            parties={parties as PartyDto[]}
            purposes={PAYMENT_PURPOSES}
            allocationsTitle="سداد فاتورة شراء"
            allocationsElement={<TreasuryAllocationTable invoices={allocationRows} onAllocationChange={handleAllocationChange} maxTotalAllocation={form.totalAmount} />}
            totalAllocated={totalAllocated}
            postPermission={TREASURY_PERMISSIONS.paymentsPost}
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
