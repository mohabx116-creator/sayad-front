import { useMemo, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { Link, useParams } from 'react-router-dom';
import { useSWRConfig } from 'swr';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/GridLegacy';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { IconArrowLeft, IconCheck, IconEdit, IconExternalLink, IconX } from '@tabler/icons-react';

import { useDispatch } from 'store';
import { openSnackbar } from 'store/slices/snackbar';
import MainCard from 'ui-component/cards/MainCard';
import Breadcrumbs from 'ui-component/extended/Breadcrumbs';
import Loader from 'ui-component/Loader';
import PermissionGuard from 'modules/Administration/components/PermissionGuard';
import TreasuryStatusChip from '../components/TreasuryStatusChip';
import TreasuryPurposeChip from '../components/TreasuryPurposeChip';
import TreasuryConfirmationDialog, { TreasuryActionType } from '../components/TreasuryConfirmationDialog';
import TreasuryAllocationSummaryTable from '../components/TreasuryAllocationSummaryTable';
import { cancelTreasuryPayment, postTreasuryPayment } from '../api/treasuryApi';
import { useTreasuryPayment } from '../hooks/useTreasury';
import { TREASURY_DOCUMENT_STATUS, TREASURY_PERMISSIONS } from '../utils/treasury.constants';
import { getTreasurySourceDocumentLabel } from '../utils/treasury.labels';

function InfoRow({ label, children }: { label: React.ReactNode; children: React.ReactNode }) {
  return (
    <Box>
      <Typography variant="caption" color="text.secondary" display="block" fontWeight={600} sx={{ mb: 0.25, textTransform: 'uppercase', letterSpacing: 0.5, fontSize: '0.7rem' }}>
        {label}
      </Typography>
      <Typography variant="body2" fontWeight={500}>
        {children}
      </Typography>
    </Box>
  );
}

export default function TreasuryPaymentDetailsPage() {
  const { id } = useParams();
  const intl = useIntl();
  const dispatch = useDispatch();
  const { mutate: mutateTreasury } = useSWRConfig();
  const { payment, isLoading, mutate } = useTreasuryPayment(id);
  const [actionDialog, setActionDialog] = useState<{ open: boolean; action: TreasuryActionType }>({ open: false, action: 'post' });
  const [isProcessing, setIsProcessing] = useState(false);

  const notify = (message: string, severity: 'success' | 'error' = 'success') => {
    dispatch(openSnackbar({ open: true, message, variant: 'alert', severity }));
  };

  const isExpenseOwned = payment?.sourceDocumentType === 'Expense' && Boolean(payment.sourceDocumentId);
  const canEdit = payment?.status === TREASURY_DOCUMENT_STATUS.DRAFT && !isExpenseOwned;
  const canPost = payment?.status === TREASURY_DOCUMENT_STATUS.DRAFT && !isExpenseOwned;
  const canCancel = payment?.status === TREASURY_DOCUMENT_STATUS.POSTED && !isExpenseOwned;

  const handleConfirm = async (reason?: string) => {
    if (!id || !payment || isExpenseOwned) {
      return;
    }

    setIsProcessing(true);
    try {
      if (actionDialog.action === 'post') {
        await postTreasuryPayment(id, payment.rowVersion);
        notify(intl.formatMessage({ id: 'treasury.payment-posted', defaultMessage: 'تم ترحيل سند الصرف بنجاح.' }));
      } else {
        await cancelTreasuryPayment(id, { reason: reason ?? '', rowVersion: payment.rowVersion });
        notify(intl.formatMessage({ id: 'treasury.payment-cancelled', defaultMessage: 'تم إلغاء سند الصرف بنجاح.' }));
      }

      await mutate();
      await mutateTreasury((key) => typeof key === 'string' && (key.startsWith('/api/treasury/') || key.startsWith('/api/parties/') || key.startsWith('/api/purchases/invoices') || key.startsWith('/api/expenses/')));
    } catch (error) {
      notify(error instanceof Error ? error.message : intl.formatMessage({ id: 'treasury.action-failed', defaultMessage: 'فشلت العملية.' }), 'error');
    } finally {
      setIsProcessing(false);
      setActionDialog({ open: false, action: 'post' });
    }
  };

  const allocationSummary = useMemo(() => payment?.allocations ?? [], [payment]);

  if (isLoading || !payment) {
    return <Loader />;
  }

  const totalAllocated = payment.allocations.reduce((sum, a) => sum + a.amount, 0);
  const unallocated = payment.totalAmount - totalAllocated;

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Breadcrumbs custom card={false} title={false} divider={false} heading="payment-details" links={[{ title: 'treasury', to: '/treasury' }, { title: 'payments', to: '/treasury/payments' }]} sx={{ mb: 0 }} />
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 2, flexWrap: 'wrap', mt: 1 }}>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
              <Typography variant="h3" fontWeight={700}>
                {payment.number}
              </Typography>
              <TreasuryStatusChip status={payment.status} />
              <Chip
                variant="outlined"
                size="small"
                label={payment.accountingPostingStatus}
                color={payment.isAccountingDeferredToExpense ? 'warning' : payment.isAccountingPosted ? 'success' : 'default'}
              />
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              {payment.treasuryAccountCode} - {payment.treasuryAccountNameArabic}
            </Typography>
          </Box>
          <Stack direction="row" spacing={1} flexWrap="wrap">
            <Button component={Link} to="/treasury/payments" variant="outlined" color="inherit" startIcon={<IconArrowLeft size={18} />}>
              <FormattedMessage id="back" />
            </Button>
            {canEdit && (
              <PermissionGuard permission={TREASURY_PERMISSIONS.paymentsUpdate}>
                <Button component={Link} to={`/treasury/payments/${payment.id}/edit`} variant="outlined" startIcon={<IconEdit size={18} />}>
                  <FormattedMessage id="edit" />
                </Button>
              </PermissionGuard>
            )}
            {canPost && (
              <PermissionGuard permission={TREASURY_PERMISSIONS.paymentsPost}>
                <Button variant="contained" onClick={() => setActionDialog({ open: true, action: 'post' })} startIcon={<IconCheck size={18} />}>
                  <FormattedMessage id="post" />
                </Button>
              </PermissionGuard>
            )}
            {canCancel && (
              <PermissionGuard permission={TREASURY_PERMISSIONS.paymentsCancel}>
                <Button variant="outlined" color="error" onClick={() => setActionDialog({ open: true, action: 'cancel' })} startIcon={<IconX size={18} />}>
                  <FormattedMessage id="cancel-document" />
                </Button>
              </PermissionGuard>
            )}
          </Stack>
        </Box>
      </Box>

      {isExpenseOwned && payment.sourceDocumentId && (
        <MainCard sx={{ border: '1px solid', borderColor: 'warning.main', bgcolor: 'warning.lighter', borderRadius: 3, mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, flexWrap: 'wrap' }}>
            <Box>
              <Typography variant="h5" fontWeight={700}>
                سند مرتبط بمصروف
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                هذا السند تم إنشاؤه من مصروف، ولا يمكن تعديله من شاشة سندات الصرف. راجع مستند المصروف المرتبط.
              </Typography>
            </Box>
            <Button component={Link} to={`/expenses/${payment.sourceDocumentId}`} variant="contained" color="warning" startIcon={<IconExternalLink size={18} />}>
              <FormattedMessage id="expenses.details" defaultMessage="فتح المصروف" />
            </Button>
          </Box>
        </MainCard>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <MainCard sx={{ border: '1px solid', borderColor: 'divider', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', borderRadius: 3, mb: 3 }} content={false}>
            <Box sx={{ p: 3, pb: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
              <Typography variant="h5" fontWeight={700}>
                <FormattedMessage id="basic-information" />
              </Typography>
            </Box>
            <Box sx={{ p: 3 }}>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <InfoRow label={<FormattedMessage id="payment-number" defaultMessage="رقم سند الصرف" />}>
                    {payment.number}
                  </InfoRow>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <InfoRow label={<FormattedMessage id="date" />}>
                    {payment.paymentDate}
                  </InfoRow>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <InfoRow label={<FormattedMessage id="treasury-account" defaultMessage="حساب الخزينة" />}>
                    {payment.treasuryAccountCode} - {payment.treasuryAccountNameArabic}
                  </InfoRow>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <InfoRow label={<FormattedMessage id="treasury-account-gl" defaultMessage="الحساب المحاسبي للخزينة" />}>
                    {payment.treasuryAccountAccountingAccountCode ?? '-'} - {payment.treasuryAccountAccountingAccountArabicName ?? '-'}
                  </InfoRow>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <InfoRow label={<FormattedMessage id="party" />}>
                    {payment.partyCode} - {payment.partyNameArabic}
                  </InfoRow>
                </Grid>
                {payment.accountingControlAccountCode && payment.accountingControlAccountArabicName && (
                  <Grid item xs={12} sm={6}>
                    <InfoRow label={<FormattedMessage id="accounting-control-account" defaultMessage="حساب الرقابة المحاسبي" />}>
                      {payment.accountingControlAccountCode} - {payment.accountingControlAccountArabicName}
                    </InfoRow>
                  </Grid>
                )}
                {payment.offsetAccountingAccountCode && payment.offsetAccountingAccountArabicName && (
                  <Grid item xs={12} sm={6}>
                    <InfoRow label={<FormattedMessage id="offset-account" defaultMessage="الحساب المحاسبي المقابل" />}>
                      {payment.offsetAccountingAccountCode} - {payment.offsetAccountingAccountArabicName}
                    </InfoRow>
                  </Grid>
                )}
                <Grid item xs={12} sm={6}>
                  <InfoRow label={<FormattedMessage id="reference-number" defaultMessage="رقم المرجع" />}>
                    {payment.relatedDocumentNumber ?? '-'}
                  </InfoRow>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <InfoRow label={<FormattedMessage id="payment-method" defaultMessage="طريقة الدفع" />}>
                    {payment.paymentMethodLabel}
                  </InfoRow>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box>
                    <Typography variant="caption" color="text.secondary" display="block" fontWeight={600} sx={{ mb: 0.25, textTransform: 'uppercase', letterSpacing: 0.5, fontSize: '0.7rem' }}>
                      <FormattedMessage id="reason" defaultMessage="سبب الصرف" />
                    </Typography>
                    <TreasuryPurposeChip purpose={payment.reason ?? ''} />
                  </Box>
                </Grid>
                {payment.sourceDocumentType && (
                  <Grid item xs={12} sm={6}>
                    <InfoRow label={<FormattedMessage id="source-document-type" defaultMessage="المستند المرتبط" />}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography fontWeight={600}>{getTreasurySourceDocumentLabel(payment.sourceDocumentType)}</Typography>
                        {payment.sourceDocumentId && (
                          <Button component={Link} to={`/expenses/${payment.sourceDocumentId}`} size="small" variant="text" startIcon={<IconExternalLink size={16} />}>
                            <FormattedMessage id="expenses.details" defaultMessage="فتح المصروف" />
                          </Button>
                        )}
                      </Box>
                    </InfoRow>
                  </Grid>
                )}
                {payment.notes && (
                  <Grid item xs={12}>
                    <InfoRow label={<FormattedMessage id="notes" />}>
                      {payment.notes}
                    </InfoRow>
                  </Grid>
                )}
                {payment.accountingJournalEntryId && (
                  <Grid item xs={12}>
                    <InfoRow label={<FormattedMessage id="accounting-journal-entry" defaultMessage="القيد المحاسبي" />}>
                      <Button component={Link} to={`/accounting/journal-entries/${payment.accountingJournalEntryId}`} size="small" variant="text" startIcon={<IconExternalLink size={16} />}>
                        {payment.accountingEntryNumber ?? payment.accountingJournalEntryId}
                      </Button>
                    </InfoRow>
                  </Grid>
                )}
              </Grid>
            </Box>
          </MainCard>

          <MainCard sx={{ border: '1px solid', borderColor: 'divider', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', borderRadius: 3 }} content={false}>
            <Box sx={{ p: 3, pb: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
              <Typography variant="h5" fontWeight={700}>
                <FormattedMessage id="invoice-allocations" defaultMessage="الفواتير المسددة" />
              </Typography>
            </Box>
            <Box sx={{ p: 3 }}>
              <TreasuryAllocationSummaryTable allocations={allocationSummary} />
            </Box>
          </MainCard>
        </Grid>

        <Grid item xs={12} md={4}>
          <MainCard
            content={false}
            sx={{
              border: '1px solid',
              borderColor: 'error.main',
              boxShadow: '0 4px 16px rgba(248,87,166,0.12)',
              borderRadius: 3,
              overflow: 'hidden',
              position: { md: 'sticky' },
              top: { md: 24 }
            }}
          >
            <Box
              sx={{
                p: 3,
                background: 'linear-gradient(135deg, #f857a6 0%, #ff5858 100%)',
                color: '#fff'
              }}
            >
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.75)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                <FormattedMessage id="totals-summary" defaultMessage="ملخص مالي" />
              </Typography>
              <Typography variant="h2" fontWeight={800} sx={{ mt: 0.5 }}>
                {payment.totalAmount.toFixed(2)}
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.75)', mt: 0.25 }}>
                <FormattedMessage id="total-amount" defaultMessage="إجمالي السند" />
              </Typography>
            </Box>

            <Box sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="body2" color="text.secondary" fontWeight={500}>
                  <FormattedMessage id="allocated-amount" defaultMessage="المبلغ المخصص" />
                </Typography>
                <Typography variant="body1" fontWeight={700} color="success.dark">
                  {totalAllocated.toFixed(2)}
                </Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="body2" color="text.secondary" fontWeight={500}>
                  <FormattedMessage id="unallocated-amount" defaultMessage="غير مخصص" />
                </Typography>
                <Typography variant="body1" fontWeight={700} color={unallocated > 0 ? 'warning.dark' : 'text.primary'}>
                  {unallocated.toFixed(2)}
                </Typography>
              </Box>

              <Box sx={{ pt: 2, borderTop: '1px dashed', borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2" color="text.secondary" fontWeight={500}>
                  <FormattedMessage id="status" />
                </Typography>
                <TreasuryStatusChip status={payment.status} />
              </Box>
            </Box>
          </MainCard>
        </Grid>
      </Grid>

      <TreasuryConfirmationDialog
        open={actionDialog.open}
        action={actionDialog.action}
        requireReason={actionDialog.action === 'cancel'}
        isProcessing={isProcessing}
        onConfirm={handleConfirm}
        onClose={() => setActionDialog({ open: false, action: 'post' })}
      />
    </Box>
  );
}
