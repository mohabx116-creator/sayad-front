import { useMemo, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { Link, useParams } from 'react-router-dom';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
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

export default function TreasuryReceiptDetailsPage() {
  const { id } = useParams();
  const intl = useIntl();
  const dispatch = useDispatch();
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
          <MainCard sx={{ border: '1px solid', borderColor: 'divider', boxShadow: 'none', borderRadius: 2, mb: 3 }} content={false}>
            <Box sx={{ p: 3 }}>
              <Typography variant="h4" fontWeight={600} gutterBottom>
                <FormattedMessage id="basic-information" />
              </Typography>
              <Grid container spacing={3} sx={{ mt: 1 }}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary" display="block">
                    <FormattedMessage id="receipt-number" defaultMessage="رقم الإيصال" />
                  </Typography>
                  <Typography variant="body1" fontWeight={500}>
                    {receipt.number}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary" display="block">
                    <FormattedMessage id="date" />
                  </Typography>
                  <Typography variant="body1" fontWeight={500}>
                    {receipt.receiptDate}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary" display="block">
                    <FormattedMessage id="treasury-account" defaultMessage="الحساب" />
                  </Typography>
                  <Typography variant="body1" fontWeight={500}>
                    {receipt.treasuryAccountCode} - {receipt.treasuryAccountNameArabic}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary" display="block">
                    <FormattedMessage id="party" />
                  </Typography>
                  <Typography variant="body1" fontWeight={500}>
                    {receipt.partyCode} - {receipt.partyNameArabic}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary" display="block">
                    <FormattedMessage id="reference-number" defaultMessage="المرجع" />
                  </Typography>
                  <Typography variant="body1" fontWeight={500}>
                    {receipt.relatedDocumentNumber ?? '-'}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary" display="block">
                    <FormattedMessage id="reason" />
                  </Typography>
                  <Box sx={{ mt: 0.5 }}>
                    <TreasuryPurposeChip purpose={receipt.reason ?? ''} />
                  </Box>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="caption" color="text.secondary" display="block">
                    <FormattedMessage id="notes" />
                  </Typography>
                  <Typography variant="body1">{receipt.notes ?? '-'}</Typography>
                </Grid>
              </Grid>
            </Box>
          </MainCard>

          <MainCard sx={{ border: '1px solid', borderColor: 'divider', boxShadow: 'none', borderRadius: 2 }} content={false}>
            <Box sx={{ p: 3 }}>
              <Typography variant="h4" fontWeight={600} gutterBottom>
                <FormattedMessage id="invoice-allocations" defaultMessage="تخصيص الفواتير" />
              </Typography>
              <TreasuryAllocationSummaryTable allocations={allocationSummary} />
            </Box>
          </MainCard>
        </Grid>

        <Grid item xs={12} md={4}>
          <MainCard sx={{ border: '1px solid', borderColor: 'divider', boxShadow: 'none', borderRadius: 2, bgcolor: 'grey.50' }} content={false}>
            <Box sx={{ p: 3 }}>
              <Typography variant="h4" fontWeight={600} gutterBottom>
                <FormattedMessage id="totals-summary" />
              </Typography>
              <Stack spacing={2} sx={{ mt: 2 }}>
                <Chip label={<><FormattedMessage id="amount" />: {receipt.totalAmount.toFixed(2)}</>} />
                <Chip label={<><FormattedMessage id="allocated-amount" />: {receipt.allocations.reduce((sum, allocation) => sum + allocation.amount, 0).toFixed(2)}</>} />
                <Chip color="primary" label={<><FormattedMessage id="status" />: <TreasuryStatusChip status={receipt.status} /></>} sx={{ justifyContent: 'flex-start' }} />
              </Stack>
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
