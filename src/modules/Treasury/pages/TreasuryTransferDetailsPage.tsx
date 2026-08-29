import { useEffect, useMemo, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { Link, useParams } from 'react-router-dom';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/GridLegacy';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { IconArrowLeft, IconArrowRight, IconCheck, IconEdit, IconExternalLink, IconX } from '@tabler/icons-react';

import { useDispatch } from 'store';
import { openSnackbar } from 'store/slices/snackbar';
import MainCard from 'ui-component/cards/MainCard';
import Breadcrumbs from 'ui-component/extended/Breadcrumbs';
import Loader from 'ui-component/Loader';
import PermissionGuard from 'modules/Administration/components/PermissionGuard';
import CodeNameLabel from 'shared/components/CodeNameLabel';
import TreasuryStatusChip from '../components/TreasuryStatusChip';
import TreasuryConfirmationDialog, { TreasuryActionType } from '../components/TreasuryConfirmationDialog';
import { cancelTreasuryTransfer, postTreasuryTransfer } from '../api/treasuryApi';
import { useTreasuryAccount, useTreasuryTransfer } from '../hooks/useTreasury';
import { TREASURY_DOCUMENT_STATUS, TREASURY_PERMISSIONS } from '../utils/treasury.constants';
import { refreshTreasuryViews } from '../utils/treasuryRefresh';
import { getDocumentDisplayNumber } from 'shared/utils/documentDisplay';
import { useBrowserTitle } from 'shared/hooks/useBrowserTitle';

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

export default function TreasuryTransferDetailsPage() {
  const { id } = useParams();
  const intl = useIntl();
  const dispatch = useDispatch();
  const { transfer, isLoading, mutate } = useTreasuryTransfer(id);
  const { account: fromAccount } = useTreasuryAccount(transfer?.fromAccountId);
  const { account: toAccount } = useTreasuryAccount(transfer?.toAccountId);
  const [actionDialog, setActionDialog] = useState<{ open: boolean; action: TreasuryActionType }>({ open: false, action: 'post' });
  const [isProcessing, setIsProcessing] = useState(false);
  const transferDisplayNumber = getDocumentDisplayNumber(transfer?.displayNumber, transfer?.number);
  useBrowserTitle(transfer ? [transferDisplayNumber] : []);

  const notify = (message: string, severity: 'success' | 'error' = 'success') => {
    dispatch(openSnackbar({ open: true, message, variant: 'alert', severity }));
  };

  const canEdit = transfer?.status === TREASURY_DOCUMENT_STATUS.DRAFT;
  const showPreview = transfer?.status === TREASURY_DOCUMENT_STATUS.DRAFT;

  const sourceBalance = fromAccount?.balance ?? null;
  const destinationBalance = toAccount?.balance ?? null;
  const sourceProjectedBalance = useMemo(
    () => (sourceBalance === null ? null : sourceBalance - (transfer?.amount ?? 0)),
    [sourceBalance, transfer?.amount]
  );
  const destinationProjectedBalance = useMemo(
    () => (destinationBalance === null ? null : destinationBalance + (transfer?.amount ?? 0)),
    [destinationBalance, transfer?.amount]
  );

  const handleConfirm = async (reason?: string) => {
    if (!id || !transfer) {
      return;
    }

    setIsProcessing(true);
    try {
      if (actionDialog.action === 'post') {
        await postTreasuryTransfer(id, transfer.rowVersion);
        notify(intl.formatMessage({ id: 'treasury.transfer-posted', defaultMessage: 'تم اعتماد التحويل بنجاح.' }));
      } else {
        await cancelTreasuryTransfer(id, { reason: reason ?? '', rowVersion: transfer.rowVersion });
        notify(intl.formatMessage({ id: 'treasury.transfer-cancelled', defaultMessage: 'تم إلغاء التحويل وعكس أثره بنجاح.' }));
      }
      await refreshTreasuryViews();
      await mutate();
    } catch (error) {
      notify(error instanceof Error ? error.message : intl.formatMessage({ id: 'treasury.action-failed', defaultMessage: 'فشلت العملية.' }), 'error');
    } finally {
      setIsProcessing(false);
      setActionDialog({ open: false, action: 'post' });
    }
  };

  useEffect(() => {
    if (!transfer) {
      return;
    }
  }, [transfer, transferDisplayNumber]);

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
              <Typography variant="h3" fontWeight={700}>{transferDisplayNumber}</Typography>
              <TreasuryStatusChip status={transfer.status} />
              <Chip
                variant="outlined"
                size="small"
                label={transfer.accountingPostingStatus}
                color={transfer.accountingPostingStatus.includes('عكس') ? 'info' : transfer.isAccountingPosted ? 'success' : transfer.accountingPostingStatus.includes('سجل سابق') ? 'warning' : 'default'}
              />
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              {transfer.fromAccountCode} <IconArrowRight size={12} style={{ verticalAlign: 'middle' }} /> {transfer.toAccountCode}
            </Typography>
          </Box>
          <Stack direction="row" spacing={1} flexWrap="wrap">
            <Button component={Link} to="/treasury/transfers" variant="outlined" color="inherit" startIcon={<IconArrowLeft size={18} />}>
              <FormattedMessage id="back" defaultMessage="رجوع" />
            </Button>
            {canEdit && (
              <PermissionGuard permission={TREASURY_PERMISSIONS.transfersUpdate}>
                <Button component={Link} to={`/treasury/transfers/${transfer.id}/edit`} variant="outlined" startIcon={<IconEdit size={18} />}>
                  <FormattedMessage id="edit" defaultMessage="تعديل" />
                </Button>
              </PermissionGuard>
            )}
            {transfer.status === TREASURY_DOCUMENT_STATUS.DRAFT && (
              <PermissionGuard permission={TREASURY_PERMISSIONS.transfersPost}>
                <Button variant="contained" onClick={() => setActionDialog({ open: true, action: 'post' })} startIcon={<IconCheck size={18} />}>
                  <FormattedMessage id="post" defaultMessage="اعتماد التحويل" />
                </Button>
              </PermissionGuard>
            )}
            {transfer.status === TREASURY_DOCUMENT_STATUS.POSTED && (
              <PermissionGuard permission={TREASURY_PERMISSIONS.transfersCancel}>
                <Button variant="outlined" color="error" onClick={() => setActionDialog({ open: true, action: 'cancel' })} startIcon={<IconX size={18} />}>
                  <FormattedMessage id="cancel-document" defaultMessage="إلغاء التحويل وعكس أثره" />
                </Button>
              </PermissionGuard>
            )}
          </Stack>
        </Box>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <MainCard sx={{ border: '1px solid', borderColor: 'divider', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', borderRadius: 3 }} content={false}>
            <Box sx={{ p: 3, pb: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
              <Typography variant="h5" fontWeight={700}>
                <FormattedMessage id="basic-information" defaultMessage="المعلومات الأساسية" />
              </Typography>
            </Box>
            <Box sx={{ p: 3 }}>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <InfoRow label={<FormattedMessage id="transfer-number" defaultMessage="رقم التحويل" />}>
                    {transferDisplayNumber}
                  </InfoRow>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <InfoRow label={<FormattedMessage id="date" defaultMessage="التاريخ" />}>
                    {transfer.transferDate}
                  </InfoRow>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <InfoRow label={<FormattedMessage id="from-account" defaultMessage="الحساب المحول منه" />}>
                    <CodeNameLabel code={transfer.fromAccountCode} nameArabic={transfer.fromAccountNameArabic} />
                  </InfoRow>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <InfoRow label={<FormattedMessage id="source-accounting-account" defaultMessage="الحساب المحاسبي للمصدر" />}>
                    {transfer.sourceAccountingAccountCode && transfer.sourceAccountingAccountArabicName
                      ? `${transfer.sourceAccountingAccountCode} — ${transfer.sourceAccountingAccountArabicName}`
                      : '—'}
                  </InfoRow>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <InfoRow label={<FormattedMessage id="to-account" defaultMessage="الحساب المحول إليه" />}>
                    <CodeNameLabel code={transfer.toAccountCode} nameArabic={transfer.toAccountNameArabic} />
                  </InfoRow>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <InfoRow label={<FormattedMessage id="destination-accounting-account" defaultMessage="الحساب المحاسبي للوجهة" />}>
                    {transfer.destinationAccountingAccountCode && transfer.destinationAccountingAccountArabicName
                      ? `${transfer.destinationAccountingAccountCode} — ${transfer.destinationAccountingAccountArabicName}`
                      : '—'}
                  </InfoRow>
                </Grid>
                {transfer.accountingJournalEntryId && (
                  <Grid item xs={12} sm={6}>
                    <InfoRow label={<FormattedMessage id="accounting-journal-entry" defaultMessage="القيد المحاسبي" />}>
                      <Button component={Link} to={`/accounting/journal-entries/${transfer.accountingJournalEntryId}`} size="small" variant="text" startIcon={<IconExternalLink size={16} />}>
                        {transfer.accountingEntryNumber ?? transfer.accountingJournalEntryId}
                      </Button>
                    </InfoRow>
                  </Grid>
                )}
                {transfer.notes && (
                  <Grid item xs={12}>
                    <InfoRow label={<FormattedMessage id="notes" defaultMessage="ملاحظات" />}>
                      {transfer.notes}
                    </InfoRow>
                  </Grid>
                )}
              </Grid>
            </Box>
          </MainCard>
        </Grid>

        <Grid item xs={12} md={4}>
          <MainCard
            content={false}
            sx={{
              border: '1px solid',
              borderColor: 'secondary.main',
              boxShadow: '0 4px 16px rgba(240,147,251,0.12)',
              borderRadius: 3,
              overflow: 'hidden',
              position: { md: 'sticky' },
              top: { md: 24 }
            }}
          >
            <Box
              sx={{
                p: 3,
                background: 'linear-gradient(135deg, #4f8cff 0%, #2f5bd3 100%)',
                color: '#fff'
              }}
            >
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.75)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                <FormattedMessage id="transfer-amount" defaultMessage="مبلغ التحويل" />
              </Typography>
              <Typography variant="h2" fontWeight={800} sx={{ mt: 0.5 }}>
                {transfer.amount.toFixed(2)}
              </Typography>
            </Box>

            <Box sx={{ p: 3 }}>
              {showPreview && (
                <Box sx={{ p: 2, borderRadius: 2, bgcolor: 'grey.50', border: '1px solid', borderColor: 'divider', mb: 3 }}>
                  <Typography variant="caption" color="text.secondary" fontWeight={600} display="block" sx={{ mb: 1 }}>
                    <FormattedMessage id="treasury.transfer-preview" defaultMessage="الأرصدة قبل التأكيد" />
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <Typography variant="body2" color="text.secondary">
                        <FormattedMessage id="from-account" defaultMessage="الحساب المحول منه" />
                      </Typography>
                      <Typography variant="body2" fontWeight={700} sx={{ mt: 0.5 }}>
                        {fromAccount ? <CodeNameLabel code={fromAccount.code} nameArabic={fromAccount.nameArabic} /> : '—'}
                      </Typography>
                      <Typography variant="body2" sx={{ mt: 0.5 }}>
                        <FormattedMessage id="current-balance" defaultMessage="الرصيد الحالي" />: {sourceBalance === null ? '—' : sourceBalance.toFixed(2)} {fromAccount?.currencyCode ?? ''}
                      </Typography>
                      <Typography variant="body2" fontWeight={700} sx={{ mt: 0.5 }}>
                        <FormattedMessage id="balance-after-transfer" defaultMessage="الرصيد بعد التحويل" />: {sourceProjectedBalance === null ? '—' : sourceProjectedBalance.toFixed(2)} {fromAccount?.currencyCode ?? ''}
                      </Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="body2" color="text.secondary">
                        <FormattedMessage id="to-account" defaultMessage="الحساب المحول إليه" />
                      </Typography>
                      <Typography variant="body2" fontWeight={700} sx={{ mt: 0.5 }}>
                        {toAccount ? <CodeNameLabel code={toAccount.code} nameArabic={toAccount.nameArabic} /> : '—'}
                      </Typography>
                      <Typography variant="body2" sx={{ mt: 0.5 }}>
                        <FormattedMessage id="current-balance" defaultMessage="الرصيد الحالي" />: {destinationBalance === null ? '—' : destinationBalance.toFixed(2)} {toAccount?.currencyCode ?? ''}
                      </Typography>
                      <Typography variant="body2" fontWeight={700} sx={{ mt: 0.5 }}>
                        <FormattedMessage id="balance-after-transfer" defaultMessage="الرصيد بعد التحويل" />: {destinationProjectedBalance === null ? '—' : destinationProjectedBalance.toFixed(2)} {toAccount?.currencyCode ?? ''}
                      </Typography>
                    </Grid>
                  </Grid>
                </Box>
              )}

              <Box sx={{ p: 2, borderRadius: 2, bgcolor: 'grey.50', border: '1px solid', borderColor: 'divider', mb: 3 }}>
                <Typography variant="caption" color="text.secondary" fontWeight={600} display="block" sx={{ mb: 1 }}>
                  <FormattedMessage id="transfer-route" defaultMessage="مسار التحويل" />
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="body2" fontWeight={700} color="text.primary">{transfer.fromAccountCode}</Typography>
                  <IconArrowRight size={14} color="var(--mui-palette-text-secondary)" />
                  <Typography variant="body2" fontWeight={700} color="text.primary">{transfer.toAccountCode}</Typography>
                </Box>
              </Box>

              <Box sx={{ pt: 2, borderTop: '1px dashed', borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2" color="text.secondary" fontWeight={500}>
                  <FormattedMessage id="status" defaultMessage="الحالة" />
                </Typography>
                <TreasuryStatusChip status={transfer.status} />
              </Box>
            </Box>
          </MainCard>
        </Grid>
      </Grid>

      <TreasuryConfirmationDialog
        open={actionDialog.open}
        action={actionDialog.action}
        titleId={actionDialog.action === 'post' ? 'treasury.confirm.post.title' : 'treasury.confirm.cancel.title'}
        messageId={actionDialog.action === 'post' ? 'treasury.confirm.post.message' : 'treasury.confirm.cancel.message'}
        requireReason={actionDialog.action === 'cancel'}
        isProcessing={isProcessing}
        onConfirm={handleConfirm}
        onClose={() => setActionDialog({ open: false, action: 'post' })}
      />
    </Box>
  );
}
