import { useState } from 'react';
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
import TreasuryConfirmationDialog, { TreasuryActionType } from '../components/TreasuryConfirmationDialog';
import { cancelTreasuryTransfer, postTreasuryTransfer } from '../api/treasuryApi';
import { useTreasuryTransfer } from '../hooks/useTreasury';
import { TREASURY_DOCUMENT_STATUS, TREASURY_PERMISSIONS } from '../utils/treasury.constants';

export default function TreasuryTransferDetailsPage() {
  const { id } = useParams();
  const intl = useIntl();
  const dispatch = useDispatch();
  const { transfer, isLoading, mutate } = useTreasuryTransfer(id);
  const [actionDialog, setActionDialog] = useState<{ open: boolean; action: TreasuryActionType }>({ open: false, action: 'post' });
  const [isProcessing, setIsProcessing] = useState(false);

  const notify = (message: string, severity: 'success' | 'error' = 'success') => {
    dispatch(openSnackbar({ open: true, message, variant: 'alert', severity }));
  };

  const canEdit = transfer?.status === TREASURY_DOCUMENT_STATUS.DRAFT;

  const handleConfirm = async (reason?: string) => {
    if (!id || !transfer) {
      return;
    }

    setIsProcessing(true);
    try {
      if (actionDialog.action === 'post') {
        await postTreasuryTransfer(id, transfer.rowVersion);
        notify(intl.formatMessage({ id: 'treasury.transfer-posted', defaultMessage: 'تم ترحيل التحويل بنجاح.' }));
      } else {
        await cancelTreasuryTransfer(id, { reason: reason ?? '', rowVersion: transfer.rowVersion });
        notify(intl.formatMessage({ id: 'treasury.transfer-cancelled', defaultMessage: 'تم إلغاء التحويل بنجاح.' }));
      }
      await mutate();
    } catch (error) {
      notify(error instanceof Error ? error.message : intl.formatMessage({ id: 'treasury.action-failed', defaultMessage: 'فشلت العملية.' }), 'error');
    } finally {
      setIsProcessing(false);
      setActionDialog({ open: false, action: 'post' });
    }
  };

  if (isLoading || !transfer) {
    return <Loader />;
  }

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Breadcrumbs custom card={false} title={false} divider={false} heading="transfer-details" links={[{ title: 'treasury', to: '/treasury' }, { title: 'transfers', to: '/treasury/transfers' }]} sx={{ mb: 0 }} />
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 2, flexWrap: 'wrap', mt: 1 }}>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
              <Typography variant="h3" fontWeight={700}>{transfer.number}</Typography>
              <TreasuryStatusChip status={transfer.status} />
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              {transfer.fromAccountCode}{' -> '}{transfer.toAccountCode}
            </Typography>
          </Box>
          <Stack direction="row" spacing={1} flexWrap="wrap">
            <Button component={Link} to="/treasury/transfers" variant="outlined" color="inherit" startIcon={<IconArrowLeft size={18} />}>
              <FormattedMessage id="back" />
            </Button>
            {canEdit && (
              <PermissionGuard permission={TREASURY_PERMISSIONS.transfersUpdate}>
                <Button component={Link} to={`/treasury/transfers/${transfer.id}/edit`} variant="outlined" startIcon={<IconEdit size={18} />}>
                  <FormattedMessage id="edit" />
                </Button>
              </PermissionGuard>
            )}
            {transfer.status === TREASURY_DOCUMENT_STATUS.DRAFT && (
              <PermissionGuard permission={TREASURY_PERMISSIONS.transfersPost}>
                <Button variant="contained" onClick={() => setActionDialog({ open: true, action: 'post' })} startIcon={<IconCheck size={18} />}>
                  <FormattedMessage id="post" />
                </Button>
              </PermissionGuard>
            )}
            {transfer.status === TREASURY_DOCUMENT_STATUS.POSTED && (
              <PermissionGuard permission={TREASURY_PERMISSIONS.transfersCancel}>
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
          <MainCard sx={{ border: '1px solid', borderColor: 'divider', boxShadow: 'none', borderRadius: 2 }} content={false}>
            <Box sx={{ p: 3 }}>
              <Typography variant="h4" fontWeight={600} gutterBottom>
                <FormattedMessage id="basic-information" />
              </Typography>
              <Grid container spacing={3} sx={{ mt: 1 }}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary" display="block"><FormattedMessage id="transfer-number" defaultMessage="رقم التحويل" /></Typography>
                  <Typography variant="body1" fontWeight={500}>{transfer.number}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary" display="block"><FormattedMessage id="date" /></Typography>
                  <Typography variant="body1" fontWeight={500}>{transfer.transferDate}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary" display="block"><FormattedMessage id="from-account" defaultMessage="من حساب" /></Typography>
                  <Typography variant="body1" fontWeight={500}>{transfer.fromAccountCode} - {transfer.fromAccountNameArabic}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary" display="block"><FormattedMessage id="to-account" defaultMessage="إلى حساب" /></Typography>
                  <Typography variant="body1" fontWeight={500}>{transfer.toAccountCode} - {transfer.toAccountNameArabic}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary" display="block"><FormattedMessage id="amount" /></Typography>
                  <Typography variant="body1" fontWeight={500}>{transfer.amount.toFixed(2)}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary" display="block"><FormattedMessage id="notes" /></Typography>
                  <Typography variant="body1">{transfer.notes ?? '-'}</Typography>
                </Grid>
              </Grid>
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
                <Chip label={<><FormattedMessage id="amount" />: {transfer.amount.toFixed(2)}</>} />
                <Chip color="primary" label={<><FormattedMessage id="status" />: <TreasuryStatusChip status={transfer.status} /></>} sx={{ justifyContent: 'flex-start' }} />
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
