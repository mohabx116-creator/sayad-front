import { useMemo, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { Link, useParams } from 'react-router-dom';
import { useSWRConfig } from 'swr';

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
import { cancelTreasuryReceipt, postTreasuryReceipt } from '../api/treasuryApi';
import { useTreasuryReceipt } from '../hooks/useTreasury';
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

export default function TreasuryReceiptDetailsPage() {
  const { id } = useParams();
  const intl = useIntl();
  const dispatch = useDispatch();
  const { mutate: mutateTreasury } = useSWRConfig();
  const { receipt, isLoading, mutate } = useTreasuryReceipt(id);
  const [actionDialog, setActionDialog] = useState<{ open: boolean; action: TreasuryActionType }>({ open: false, action: 'post' });
  const [isProcessing, setIsProcessing] = useState(false);

  const notify = (message: string, severity: 'success' | 'error' = 'success') => {
    dispatch(openSnackbar({ open: true, message, variant: 'alert', severity }));
  };

  const canEdit = receipt?.status === TREASURY_DOCUMENT_STATUS.DRAFT;

  const handleConfirm = async (reason?: string) => {
    if (!id || !receipt) {
      return;
    }

    setIsProcessing(true);
    try {
      if (actionDialog.action === 'post') {
        await postTreasuryReceipt(id, receipt.rowVersion);
        notify(intl.formatMessage({ id: 'treasury.receipt-posted', defaultMessage: 'تم ترحيل الإيصال بنجاح.' }));
      } else {
        await cancelTreasuryReceipt(id, { reason: reason ?? '', rowVersion: receipt.rowVersion });
        notify(intl.formatMessage({ id: 'treasury.receipt-cancelled', defaultMessage: 'تم إلغاء الإيصال بنجاح.' }));
      }

      await mutate();
      await mutateTreasury((key) => typeof key === 'string' && key.startsWith('/api/treasury/'));
    } catch (error) {
      notify(error instanceof Error ? error.message : intl.formatMessage({ id: 'treasury.action-failed', defaultMessage: 'فشلت العملية.' }), 'error');
    } finally {
      setIsProcessing(false);
      setActionDialog({ open: false, action: 'post' });
    }
  };

  const allocationSummary = useMemo(() => receipt?.allocations ?? [], [receipt]);

  if (isLoading || !receipt) {
    return <Loader />;
  }

  const totalAllocated = receipt.allocations.reduce((sum, a) => sum + a.amount, 0);
  const unallocated = receipt.totalAmount - totalAllocated;

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Breadcrumbs custom card={false} title={false} divider={false} heading="receipt-details" links={[{ title: 'treasury', to: '/treasury' }, { title: 'receipts', to: '/treasury/receipts' }]} sx={{ mb: 0 }} />
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 2, flexWrap: 'wrap', mt: 1 }}>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
              <Typography variant="h3" fontWeight={700}>
                {receipt.number}
              </Typography>
              <TreasuryStatusChip status={receipt.status} />
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              {receipt.treasuryAccountCode} - {receipt.treasuryAccountNameArabic}
            </Typography>
          </Box>
          <Stack direction="row" spacing={1} flexWrap="wrap">
            <Button component={Link} to="/treasury/receipts" variant="outlined" color="inherit" startIcon={<IconArrowLeft size={18} />}>
              <FormattedMessage id="back" />
            </Button>
            {canEdit && (
              <PermissionGuard permission={TREASURY_PERMISSIONS.receiptsUpdate}>
                <Button component={Link} to={`/treasury/receipts/${receipt.id}/edit`} variant="outlined" startIcon={<IconEdit size={18} />}>
                  <FormattedMessage id="edit" />
                </Button>
              </PermissionGuard>
            )}
            {receipt.status === TREASURY_DOCUMENT_STATUS.DRAFT && (
              <PermissionGuard permission={TREASURY_PERMISSIONS.receiptsPost}>
                <Button variant="contained" onClick={() => setActionDialog({ open: true, action: 'post' })} startIcon={<IconCheck size={18} />}>
                  <FormattedMessage id="post" />
                </Button>
              </PermissionGuard>
            )}
            {receipt.status === TREASURY_DOCUMENT_STATUS.POSTED && (
              <PermissionGuard permission={TREASURY_PERMISSIONS.receiptsCancel}>
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
          <MainCard sx={{ border: '1px solid', borderColor: 'divider', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', borderRadius: 3, mb: 3 }} content={false}>
            <Box sx={{ p: 3, pb: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
              <Typography variant="h5" fontWeight={700}>
                <FormattedMessage id="basic-information" />
              </Typography>
            </Box>
            <Box sx={{ p: 3 }}>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <InfoRow label={<FormattedMessage id="receipt-number" defaultMessage="رقم الإيصال" />}>
                    {receipt.number}
                  </InfoRow>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <InfoRow label={<FormattedMessage id="date" />}>
                    {receipt.receiptDate}
                  </InfoRow>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <InfoRow label={<FormattedMessage id="treasury-account" defaultMessage="حساب الخزينة" />}>
                    {receipt.treasuryAccountCode} - {receipt.treasuryAccountNameArabic}
                  </InfoRow>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <InfoRow label={<FormattedMessage id="party" />}>
                    {receipt.partyCode} - {receipt.partyNameArabic}
                  </InfoRow>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <InfoRow label={<FormattedMessage id="reference-number" defaultMessage="رقم المرجع" />}>
                    {receipt.relatedDocumentNumber ?? '-'}
                  </InfoRow>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box>
                    <Typography variant="caption" color="text.secondary" display="block" fontWeight={600} sx={{ mb: 0.25, textTransform: 'uppercase', letterSpacing: 0.5, fontSize: '0.7rem' }}>
                      <FormattedMessage id="reason" />
                    </Typography>
                    <TreasuryPurposeChip purpose={receipt.reason ?? ''} />
                  </Box>
                </Grid>
                {receipt.notes && (
                  <Grid item xs={12}>
                    <InfoRow label={<FormattedMessage id="notes" />}>
                      {receipt.notes}
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
              borderColor: 'primary.main',
              boxShadow: '0 4px 16px rgba(94,114,228,0.12)',
              borderRadius: 3,
              overflow: 'hidden',
              position: { md: 'sticky' },
              top: { md: 24 }
            }}
          >
            <Box
              sx={{
                p: 3,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: '#fff'
              }}
            >
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.75)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                <FormattedMessage id="totals-summary" defaultMessage="ملخص مالي" />
              </Typography>
              <Typography variant="h2" fontWeight={800} sx={{ mt: 0.5 }}>
                {receipt.totalAmount.toFixed(2)}
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.75)', mt: 0.25 }}>
                <FormattedMessage id="total-amount" defaultMessage="إجمالي الإيصال" />
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
                <TreasuryStatusChip status={receipt.status} />
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
