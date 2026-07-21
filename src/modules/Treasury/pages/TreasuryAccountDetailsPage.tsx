import { useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useSWRConfig } from 'swr';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/GridLegacy';
import Typography from '@mui/material/Typography';

import { IconArrowLeft, IconCheck, IconEdit, IconReport, IconTrash, IconX } from '@tabler/icons-react';

import useAuth from 'hooks/useAuth';
import { useDispatch } from 'store';
import { openSnackbar } from 'store/slices/snackbar';
import MainCard from 'ui-component/cards/MainCard';
import Breadcrumbs from 'ui-component/extended/Breadcrumbs';
import PageTitle from 'ui-component/PageTitle';
import Loader from 'ui-component/Loader';
import PermissionGuard from 'modules/Administration/components/PermissionGuard';

import { activateTreasuryAccount, deactivateTreasuryAccount, finalDeleteTreasuryAccount } from '../api/treasuryApi';
import { useTreasuryAccount, useTreasuryAccountDeletionPreview, useTreasuryStatement } from '../hooks/useTreasury';
import { TREASURY_PERMISSIONS } from '../utils/treasury.constants';
import TreasuryBalanceSummary from '../components/TreasuryBalanceSummary';
import TreasuryFinalDeleteDialog from '../components/TreasuryFinalDeleteDialog';
import TreasuryConfirmationDialog, { TreasuryActionType } from '../components/TreasuryConfirmationDialog';
import TreasuryMovementTable from '../components/TreasuryMovementTable';
import { formatTreasuryMoney } from '../utils/treasury.format';

export default function TreasuryAccountDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useAuth();
  const { mutate: mutateTreasury } = useSWRConfig();

  const { account, isLoading, mutate } = useTreasuryAccount(id);
  const { statement, isLoading: isStatementLoading } = useTreasuryStatement(id ? { treasuryAccountId: id, page: 1, pageSize: 5 } : null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const { preview: deletionPreview, isLoading: isDeletionPreviewLoading } = useTreasuryAccountDeletionPreview(id, deleteDialogOpen);

  const [actionDialog, setActionDialog] = useState<{ open: boolean; action: TreasuryActionType; code: string }>({
    open: false,
    action: 'activate',
    code: ''
  });
  const [isProcessing, setIsProcessing] = useState(false);

  const notify = (message: string, severity: 'success' | 'error' = 'success') => {
    dispatch(openSnackbar({ open: true, message, variant: 'alert', severity }));
  };

  const handleConfirmAction = async () => {
    if (!id || !account) {
      return;
    }

    setIsProcessing(true);
    try {
      const currentRowVersion = account.rowVersion;
      if (actionDialog.action === 'activate') {
        await activateTreasuryAccount(id, currentRowVersion);
        notify('تم تفعيل الحساب بنجاح.');
      } else if (actionDialog.action === 'deactivate') {
        await deactivateTreasuryAccount(id, currentRowVersion);
        notify('تم إيقاف الحساب بنجاح.');
      }

      await mutateTreasury((key) => typeof key === 'string' && key.startsWith('/api/treasury/'));
      await mutate();
    } catch (error) {
      notify(error instanceof Error ? error.message : 'فشلت العملية.', 'error');
    } finally {
      setIsProcessing(false);
      setActionDialog({ open: false, action: 'activate', code: '' });
    }
  };

  if (isLoading || !account) return <Loader />;

  const canDeleteAccount = Boolean(user?.isSystemOwner);

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Breadcrumbs
          custom
          card={false}
          title={false}
          divider={false}
          heading="account-details"
          links={[{ title: 'treasury', to: '/treasury' }, { title: 'treasury-accounts', to: '/treasury/accounts' }]}
          sx={{ mb: 0 }}
        />
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mt: 1, gap: 2, flexWrap: 'wrap' }}>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
              <PageTitle>{account.nameArabic}</PageTitle>
              <Chip
                size="small"
                label={<FormattedMessage id={account.isActive ? 'active' : 'inactive'} defaultMessage={account.isActive ? 'نشط' : 'موقوف'} />}
                color={account.isActive ? 'success' : 'default'}
                variant="outlined"
              />
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              {account.code} • {account.accountTypeLabel}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <PermissionGuard permission={TREASURY_PERMISSIONS.statementsView}>
              <Button component={Link} to={`/treasury/statements?accountId=${account.id}`} variant="outlined" startIcon={<IconReport size={18} />} sx={{ borderRadius: 2 }}>
                <FormattedMessage id="statement" defaultMessage="كشف الحساب" />
              </Button>
            </PermissionGuard>

            <PermissionGuard permission={TREASURY_PERMISSIONS.accountsUpdate}>
              <Button component={Link} to={`/treasury/accounts/${account.id}/edit`} variant="outlined" color="secondary" startIcon={<IconEdit size={18} />} sx={{ borderRadius: 2 }}>
                <FormattedMessage id="edit" defaultMessage="تعديل" />
              </Button>
            </PermissionGuard>

            {account.isActive ? (
              <PermissionGuard permission={TREASURY_PERMISSIONS.accountsDeactivate}>
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<IconX size={18} />}
                  onClick={() => setActionDialog({ open: true, action: 'deactivate', code: '' })}
                  sx={{ borderRadius: 2 }}
                >
                  <FormattedMessage id="deactivate" defaultMessage="إيقاف" />
                </Button>
              </PermissionGuard>
            ) : (
              <PermissionGuard permission={TREASURY_PERMISSIONS.accountsActivate}>
                <Button
                  variant="outlined"
                  color="success"
                  startIcon={<IconCheck size={18} />}
                  onClick={() => setActionDialog({ open: true, action: 'activate', code: '' })}
                  sx={{ borderRadius: 2 }}
                >
                  <FormattedMessage id="activate" defaultMessage="تفعيل" />
                </Button>
              </PermissionGuard>
            )}

            {canDeleteAccount && (
              <Button
                variant="outlined"
                color="error"
                startIcon={<IconTrash size={18} />}
                onClick={() => setDeleteDialogOpen(true)}
                sx={{ borderRadius: 2 }}
              >
                <FormattedMessage id="delete-permanent" defaultMessage="حذف نهائي" />
              </Button>
            )}
          </Box>
        </Box>
      </Box>

      <TreasuryBalanceSummary
        openingBalance={account.openingBalance}
        totalReceipts={account.debitTotal}
        totalPayments={account.creditTotal}
        closingBalance={account.balance}
        currencyCode={account.currencyCode}
      />

      <Grid container spacing={3}>
        <Grid item xs={12} md={7}>
          <MainCard sx={{ border: '1px solid', borderColor: 'divider', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', borderRadius: 3, height: '100%' }} content={false}>
            <Box sx={{ p: 3, pb: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
              <Typography variant="h5" fontWeight={700}>
                <FormattedMessage id="account-details" defaultMessage="تفاصيل الحساب" />
              </Typography>
            </Box>
            <Box sx={{ p: 3 }}>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary" display="block" fontWeight={600} sx={{ mb: 0.25 }}>
                    <FormattedMessage id="code" defaultMessage="الكود" />
                  </Typography>
                  <Typography variant="body1" fontWeight={500}>
                    {account.code}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary" display="block" fontWeight={600} sx={{ mb: 0.25 }}>
                    <FormattedMessage id="account-type" defaultMessage="نوع الحساب" />
                  </Typography>
                  <Typography variant="body1" fontWeight={500}>
                    {account.accountTypeLabel}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary" display="block" fontWeight={600} sx={{ mb: 0.25 }}>
                    <FormattedMessage id="mapping" defaultMessage="الربط المحاسبي" />
                  </Typography>
                  <Typography variant="body1" fontWeight={500}>
                    {account.isAccountingMapped && account.accountingAccountId && account.accountingAccountCode && account.accountingAccountArabicName ? (
                      <Button component={Link} to={`/accounting/chart-of-accounts/${account.accountingAccountId}`} variant="text" size="small" sx={{ p: 0, minWidth: 0, fontWeight: 500 }}>
                        {account.accountingAccountCode} - {account.accountingAccountArabicName}
                      </Button>
                    ) : (
                      '-'
                    )}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary" display="block" fontWeight={600} sx={{ mb: 0.25 }}>
                    <FormattedMessage id="name-arabic" defaultMessage="الاسم بالعربية" />
                  </Typography>
                  <Typography variant="body1" fontWeight={500}>
                    {account.nameArabic}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary" display="block" fontWeight={600} sx={{ mb: 0.25 }}>
                    <FormattedMessage id="name-english" defaultMessage="الاسم بالإنجليزية" />
                  </Typography>
                  <Typography variant="body1" fontWeight={500}>
                    {account.nameEnglish || '-'}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary" display="block" fontWeight={600} sx={{ mb: 0.25 }}>
                    <FormattedMessage id="current-balance" defaultMessage="الرصيد الحالي" />
                  </Typography>
                  <Typography variant="body1" fontWeight={700}>
                    {formatTreasuryMoney(account.balance, account.currencyCode)}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary" display="block" fontWeight={600} sx={{ mb: 0.25 }}>
                    <FormattedMessage id="balance-nature" defaultMessage="اتجاه الرصيد" />
                  </Typography>
                  <Typography variant="body1" fontWeight={500}>
                    {account.balanceNature === 'Debit' ? 'مدين - رصيد موجب' : account.balanceNature === 'Credit' ? 'دائن - رصيد سالب' : 'مستقر'}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="caption" color="text.secondary" display="block" fontWeight={600} sx={{ mb: 0.25 }}>
                    <FormattedMessage id="notes" defaultMessage="ملاحظات" />
                  </Typography>
                  <Typography variant="body1">{account.notes || '-'}</Typography>
                </Grid>
              </Grid>
            </Box>
          </MainCard>
        </Grid>

        <Grid item xs={12} md={5}>
          <MainCard
            content={false}
            sx={{
              border: '1px solid',
              borderColor: 'primary.main',
              boxShadow: '0 4px 16px rgba(94,114,228,0.12)',
              borderRadius: 3,
              height: '100%'
            }}
          >
            <Box sx={{ p: 3, pb: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
              <Typography variant="h5" fontWeight={700}>
                <FormattedMessage id="recent-movements" defaultMessage="أحدث الحركات" />
              </Typography>
            </Box>
            <Box sx={{ p: 3 }}>
              {isStatementLoading ? (
                <Loader />
              ) : statement ? (
                <TreasuryMovementTable movements={statement.movements} page={statement.page} totalPages={statement.totalPages} isLoading={false} currencyCode={account.currencyCode} />
              ) : (
                <Typography color="text.secondary">
                  <FormattedMessage id="treasury.empty" defaultMessage="لا توجد سجلات." />
                </Typography>
              )}
            </Box>
          </MainCard>
        </Grid>
      </Grid>

      <Box sx={{ mt: 3 }}>
        <Button onClick={() => navigate(-1)} startIcon={<IconArrowLeft size={18} />} color="inherit">
          <FormattedMessage id="back" defaultMessage="رجوع" />
        </Button>
      </Box>

      <TreasuryConfirmationDialog
        open={actionDialog.open}
        action={actionDialog.action}
        isProcessing={isProcessing}
        onConfirm={handleConfirmAction}
        onClose={() => setActionDialog({ open: false, action: 'activate', code: '' })}
      />

      <TreasuryFinalDeleteDialog
        open={deleteDialogOpen}
        preview={deletionPreview}
        isLoading={isDeletionPreviewLoading}
        isProcessing={isProcessing}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={async (request) => {
          if (!id || !account) {
            return;
          }

          setIsProcessing(true);
          try {
            await finalDeleteTreasuryAccount(id, request);
            notify('تم حذف الحساب نهائيًا.');
            await mutateTreasury((key) => typeof key === 'string' && key.startsWith('/api/treasury/'));
            await mutate();
            navigate('/treasury/accounts');
          } catch (error) {
            notify(error instanceof Error ? error.message : 'فشلت العملية.', 'error');
          } finally {
            setIsProcessing(false);
            setDeleteDialogOpen(false);
          }
        }}
      />
    </Box>
  );
}
