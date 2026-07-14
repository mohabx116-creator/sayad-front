import { useMemo, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { Link, useParams } from 'react-router-dom';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/GridLegacy';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { IconArrowLeft, IconCheck, IconEdit, IconX } from '@tabler/icons-react';

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
  const { payment, isLoading, mutate } = useTreasuryPayment(id);
  const [actionDialog, setActionDialog] = useState<{ open: boolean; action: TreasuryActionType }>({ open: false, action: 'post' });
  const [isProcessing, setIsProcessing] = useState(false);

  const notify = (message: string, severity: 'success' | 'error' = 'success') => {
    dispatch(openSnackbar({ open: true, message, variant: 'alert', severity }));
  };

  const canEdit = payment?.status === TREASURY_DOCUMENT_STATUS.DRAFT;

  const handleConfirm = async (reason?: string) => {
    if (!id || !payment) {
      return;
    }

    setIsProcessing(true);
    try {
      if (actionDialog.action === 'post') {
        await postTreasuryPayment(id, payment.rowVersion);
        notify(intl.formatMessage({ id: 'treasury.payment-posted', defaultMessage: 'تم ترحيل السند بنجاح.' }));
      } else {
        await cancelTreasuryPayment(id, { reason: reason ?? '', rowVersion: payment.rowVersion });
        notify(intl.formatMessage({ id: 'treasury.payment-cancelled', defaultMessage: 'تم إلغاء السند بنجاح.' }));
      }
      await mutate();
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
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              {payment.treasuryAccountCode} — {payment.treasuryAccountNameArabic}
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
            {payment.status === TREASURY_DOCUMENT_STATUS.DRAFT && (
              <PermissionGuard permission={TREASURY_PERMISSIONS.paymentsPost}>
                <Button variant="contained" onClick={() => setActionDialog({ open: true, action: 'post' })} startIcon={<IconCheck size={18} />}>
                  <FormattedMessage id="post" />
                </Button>
              </PermissionGuard>
            )}
            {payment.status === TREASURY_DOCUMENT_STATUS.POSTED && (
              <PermissionGuard permission={TREASURY_PERMISSIONS.paymentsCancel}>
                <Button variant="outlined" color="error" onClick={() => setActionDialog({ open: true, action: 'cancel' })} startIcon={<IconX size={18} />}>
                  <FormattedMessage id="cancel-document" />
                </Button>
              </PermissionGuard>
            )}
          </Stack>
        </Box>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          {/* Basic info card */}
          <MainCard sx={{ border: '1px solid', borderColor: 'divider', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', borderRadius: 3, mb: 3 }} content={false}>
            <Box sx={{ p: 3, pb: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
              <Typography variant="h5" fontWeight={700}>
                <FormattedMessage id="basic-information" />
              </Typography>
            </Box>
            <Box sx={{ p: 3 }}>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <InfoRow label={<FormattedMessage id="payment-number" defaultMessage="رقم السند" />}>
                    {payment.number}
                  </InfoRow>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <InfoRow label={<FormattedMessage id="date" />}>
                    {payment.paymentDate}
                  </InfoRow>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <InfoRow label={<FormattedMessage id="treasury-account" defaultMessage="الحساب" />}>
                    {payment.treasuryAccountCode} — {payment.treasuryAccountNameArabic}
                  </InfoRow>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <InfoRow label={<FormattedMessage id="party" />}>
                    {payment.partyCode} — {payment.partyNameArabic}
                  </InfoRow>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <InfoRow label={<FormattedMessage id="reference-number" defaultMessage="المرجع" />}>
                    {payment.relatedDocumentNumber ?? '-'}
                  </InfoRow>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box>
                    <Typography variant="caption" color="text.secondary" display="block" fontWeight={600} sx={{ mb: 0.25, textTransform: 'uppercase', letterSpacing: 0.5, fontSize: '0.7rem' }}>
                      <FormattedMessage id="reason" />
                    </Typography>
                    <TreasuryPurposeChip purpose={payment.reason ?? ''} />
                  </Box>
                </Grid>
                {payment.notes && (
                  <Grid item xs={12}>
                    <InfoRow label={<FormattedMessage id="notes" />}>
                      {payment.notes}
                    </InfoRow>
                  </Grid>
                )}
              </Grid>
            </Box>
          </MainCard>

          {/* Allocations card */}
          <MainCard sx={{ border: '1px solid', borderColor: 'divider', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', borderRadius: 3 }} content={false}>
            <Box sx={{ p: 3, pb: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
              <Typography variant="h5" fontWeight={700}>
                <FormattedMessage id="invoice-allocations" defaultMessage="تخصيص الفواتير" />
              </Typography>
            </Box>
            <Box sx={{ p: 3 }}>
              <TreasuryAllocationSummaryTable allocations={allocationSummary} />
            </Box>
          </MainCard>
        </Grid>

        {/* Summary sidebar */}
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
            {/* Gradient header */}
            <Box
              sx={{
                p: 3,
                background: 'linear-gradient(135deg, #f857a6 0%, #ff5858 100%)',
                color: '#fff'
              }}
            >
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.75)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                <FormattedMessage id="totals-summary" defaultMessage="الملخص المالي" />
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
