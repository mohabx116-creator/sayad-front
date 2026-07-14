import { useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { Link, useParams, useNavigate } from 'react-router-dom';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Grid from '@mui/material/GridLegacy';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';

import { IconEdit, IconCheck, IconX, IconReport, IconArrowLeft } from '@tabler/icons-react';

import { useDispatch } from 'store';
import { openSnackbar } from 'store/slices/snackbar';
import MainCard from 'ui-component/cards/MainCard';
import Breadcrumbs from 'ui-component/extended/Breadcrumbs';
import PageTitle from 'ui-component/PageTitle';
import Loader from 'ui-component/Loader';

import { useTreasuryAccount } from '../hooks/useTreasury';
import { activateTreasuryAccount, deactivateTreasuryAccount } from '../api/treasuryApi';
import PermissionGuard from 'modules/Administration/components/PermissionGuard';
import { TREASURY_PERMISSIONS } from '../utils/treasury.constants';
import TreasuryConfirmationDialog, { TreasuryActionType } from '../components/TreasuryConfirmationDialog';

export default function TreasuryAccountDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const intl = useIntl();
  const dispatch = useDispatch();

  const { account, isLoading, mutate } = useTreasuryAccount(id);
  
  const [actionDialog, setActionDialog] = useState<{ open: boolean; action: TreasuryActionType }>({
    open: false,
    action: 'activate'
  });
  const [isProcessing, setIsProcessing] = useState(false);

  const notify = (message: string, severity: 'success' | 'error' = 'success') => {
    dispatch(openSnackbar({ open: true, message, variant: 'alert', severity }));
  };

  const handleConfirmAction = async () => {
    if (!id) return;
    setIsProcessing(true);
    try {
      if (actionDialog.action === 'activate') {
        await activateTreasuryAccount(id);
        notify(intl.formatMessage({ id: 'account-activated', defaultMessage: 'تم تفعيل الحساب بنجاح' }));
      } else if (actionDialog.action === 'deactivate') {
        await deactivateTreasuryAccount(id);
        notify(intl.formatMessage({ id: 'account-deactivated', defaultMessage: 'تم إيقاف الحساب بنجاح' }));
      }
      mutate();
    } catch (error) {
      notify(error instanceof Error ? error.message : intl.formatMessage({ id: 'action-failed', defaultMessage: 'فشلت العملية' }), 'error');
    } finally {
      setIsProcessing(false);
      setActionDialog({ ...actionDialog, open: false });
    }
  };

  if (isLoading || !account) return <Loader />;

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
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mt: 1 }}>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <PageTitle>{account.nameArabic}</PageTitle>
              <Chip 
                size="small" 
                label={<FormattedMessage id={account.isActive ? 'active' : 'inactive'} defaultMessage={account.isActive ? 'نشط' : 'غير نشط'} />} 
                color={account.isActive ? 'success' : 'default'} 
                variant="outlined" 
              />
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              {account.code} • {account.accountTypeLabel}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <PermissionGuard permission={TREASURY_PERMISSIONS.statementsView}>
              <Button
                component={Link}
                to={`/treasury/statements?accountId=${account.id}`}
                variant="outlined"
                startIcon={<IconReport size={18} />}
                sx={{ borderRadius: 2 }}
              >
                <FormattedMessage id="statement" defaultMessage="كشف حساب" />
              </Button>
            </PermissionGuard>
            
            <PermissionGuard permission={TREASURY_PERMISSIONS.accountsUpdate}>
              <Button
                component={Link}
                to={`/treasury/accounts/${account.id}/edit`}
                variant="outlined"
                color="secondary"
                startIcon={<IconEdit size={18} />}
                sx={{ borderRadius: 2 }}
              >
                <FormattedMessage id="edit" defaultMessage="تعديل" />
              </Button>
            </PermissionGuard>
            
            {account.isActive ? (
              <PermissionGuard permission={TREASURY_PERMISSIONS.accountsDeactivate}>
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<IconX size={18} />}
                  onClick={() => setActionDialog({ open: true, action: 'deactivate' })}
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
                  onClick={() => setActionDialog({ open: true, action: 'activate' })}
                  sx={{ borderRadius: 2 }}
                >
                  <FormattedMessage id="activate" defaultMessage="تفعيل" />
                </Button>
              </PermissionGuard>
            )}
          </Box>
        </Box>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <MainCard sx={{ border: '1px solid', borderColor: 'divider', boxShadow: 'none', borderRadius: 2, height: '100%' }}>
            <Typography variant="h4" fontWeight={600} gutterBottom><FormattedMessage id="account-details" defaultMessage="تفاصيل الحساب" /></Typography>
            
            <Grid container spacing={3} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <Typography variant="caption" color="text.secondary" display="block"><FormattedMessage id="code" defaultMessage="الكود" /></Typography>
                <Typography variant="body1" fontWeight={500}>{account.code}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="caption" color="text.secondary" display="block"><FormattedMessage id="account-type" defaultMessage="نوع الحساب" /></Typography>
                <Typography variant="body1" fontWeight={500}>{account.accountTypeLabel}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="caption" color="text.secondary" display="block"><FormattedMessage id="name-arabic" defaultMessage="الاسم (عربي)" /></Typography>
                <Typography variant="body1" fontWeight={500}>{account.nameArabic}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="caption" color="text.secondary" display="block"><FormattedMessage id="name-english" defaultMessage="الاسم (إنجليزي)" /></Typography>
                <Typography variant="body1" fontWeight={500}>{account.nameEnglish || '-'}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="caption" color="text.secondary" display="block"><FormattedMessage id="notes" defaultMessage="ملاحظات" /></Typography>
                <Typography variant="body1">{account.notes || '-'}</Typography>
              </Grid>
            </Grid>
          </MainCard>
        </Grid>

        <Grid item xs={12} md={4}>
          <MainCard sx={{ border: '1px solid', borderColor: 'primary.main', bgcolor: 'primary.light', boxShadow: 'none', borderRadius: 2, height: '100%' }}>
            <Typography variant="h4" color="primary.dark" fontWeight={600} gutterBottom><FormattedMessage id="balance-summary" defaultMessage="ملخص الرصيد" /></Typography>
            
            <Box sx={{ mt: 3 }}>
              <Typography variant="caption" color="primary.main" fontWeight={600} display="block">
                <FormattedMessage id="current-balance" defaultMessage="الرصيد الحالي" />
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
                <Typography variant="h2" color="primary.dark" fontWeight={800}>{account.balance.toFixed(2)}</Typography>
                <Typography variant="body2" color="primary.main" fontWeight={700}>{account.currencyCode}</Typography>
              </Box>
              <Typography variant="body2" color="primary.main" sx={{ mt: 0.5 }}>
                {account.balanceNature === 'Debit' ? 'مدين (رصيد متاح)' : 'دائن (سحب على المكشوف / التزام)'}
              </Typography>
            </Box>

            <Box sx={{ mt: 4, pt: 3, borderTop: '1px dashed', borderColor: 'primary.main' }}>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="caption" color="primary.main" display="block"><FormattedMessage id="opening-balance" defaultMessage="الرصيد الافتتاحي" /></Typography>
                  <Typography variant="body1" color="primary.dark" fontWeight={600}>{account.openingBalance.toFixed(2)}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="primary.main" display="block"><FormattedMessage id="currency" defaultMessage="العملة" /></Typography>
                  <Typography variant="body1" color="primary.dark" fontWeight={600}>{account.currencyCode}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="primary.main" display="block"><FormattedMessage id="total-receipts" defaultMessage="إجمالي المقبوضات" /></Typography>
                  <Typography variant="body1" color="success.dark" fontWeight={600}>{account.debitTotal.toFixed(2)}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="primary.main" display="block"><FormattedMessage id="total-payments" defaultMessage="إجمالي المدفوعات" /></Typography>
                  <Typography variant="body1" color="error.dark" fontWeight={600}>{account.creditTotal.toFixed(2)}</Typography>
                </Grid>
              </Grid>
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
        onClose={() => setActionDialog({ ...actionDialog, open: false })}
      />
    </Box>
  );
}
