import { useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useSWRConfig } from 'swr';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/GridLegacy';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { IconArrowLeft, IconCheck, IconEdit, IconMinus, IconPlus, IconX } from '@tabler/icons-react';

import useAuth from 'hooks/useAuth';
import { useDispatch } from 'store';
import { openSnackbar } from 'store/slices/snackbar';
import MainCard from 'ui-component/cards/MainCard';
import Breadcrumbs from 'ui-component/extended/Breadcrumbs';
import Loader from 'ui-component/Loader';
import PermissionGuard from 'modules/Administration/components/PermissionGuard';

import { activateTreasuryAccount, createTreasuryCashIn, createTreasuryCashOut, deactivateTreasuryAccount } from '../api/treasuryApi';
import TreasuryBalanceSummary from '../components/TreasuryBalanceSummary';
import TreasuryCashMovementDialog, { TreasuryCashMovementFormValue } from '../components/TreasuryCashMovementDialog';
import TreasuryConfirmationDialog, { TreasuryActionType } from '../components/TreasuryConfirmationDialog';
import TreasuryMovementTable from '../components/TreasuryMovementTable';
import { useTreasuryAccount, useTreasuryStatement } from '../hooks/useTreasury';
import { TREASURY_PERMISSIONS } from '../utils/treasury.constants';
import { formatTreasuryMoney } from '../utils/treasury.format';

function InfoRow({ label, children }: { label: React.ReactNode; children: React.ReactNode }) {
  return (
    <Box>
      <Typography
        variant="caption"
        color="text.secondary"
        display="block"
        fontWeight={600}
        sx={{ mb: 0.25, textTransform: 'uppercase', letterSpacing: 0.5, fontSize: '0.7rem' }}
      >
        {label}
      </Typography>
      <Typography variant="body2" fontWeight={500}>
        {children}
      </Typography>
    </Box>
  );
}

export default function TreasuryAccountDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const intl = useIntl();
  const dispatch = useDispatch();
  const { user } = useAuth();
  const { mutate: mutateTreasury } = useSWRConfig();

  const { account, isLoading, mutate } = useTreasuryAccount(id);
  const { statement, isLoading: isStatementLoading, mutate: mutateStatement } = useTreasuryStatement(
    id ? { treasuryAccountId: id, page: 1, pageSize: 20 } : null
  );

  const [actionDialog, setActionDialog] = useState<{ open: boolean; action: TreasuryActionType }>({ open: false, action: 'activate' });
  const [cashDialog, setCashDialog] = useState<{ open: boolean; mode: 'in' | 'out' }>({ open: false, mode: 'in' });
  const [isProcessing, setIsProcessing] = useState(false);

  const notify = (message: string, severity: 'success' | 'error' = 'success') => {
    dispatch(openSnackbar({ open: true, message, variant: 'alert', severity }));
  };

  const refreshTreasury = async () => {
    await mutateTreasury((key) => typeof key === 'string' && key.startsWith('/api/treasury/'));
    await mutate();
    await mutateStatement();
  };

  const handleConfirmAction = async () => {
    if (!id || !account) {
      return;
    }

    setIsProcessing(true);
    try {
      if (actionDialog.action === 'activate') {
        await activateTreasuryAccount(id, account.rowVersion);
        notify(intl.formatMessage({ id: 'cashbox-activated', defaultMessage: 'Cashbox activated successfully.' }));
      } else {
        await deactivateTreasuryAccount(id, account.rowVersion);
        notify(intl.formatMessage({ id: 'cashbox-deactivated', defaultMessage: 'Cashbox deactivated successfully.' }));
      }

      await refreshTreasury();
    } catch (error) {
      notify(error instanceof Error ? error.message : intl.formatMessage({ id: 'action-failed', defaultMessage: 'The operation failed.' }), 'error');
    } finally {
      setIsProcessing(false);
      setActionDialog({ open: false, action: 'activate' });
    }
  };

  const handleCashSubmit = async (value: TreasuryCashMovementFormValue) => {
    if (!id || !account) {
      return;
    }

    setIsProcessing(true);
    try {
      const request = {
        transactionDate: value.transactionDate,
        amount: value.amount,
        reason: value.reason,
        notes: value.notes
      };

      if (cashDialog.mode === 'in') {
        await createTreasuryCashIn(id, request);
        notify(intl.formatMessage({ id: 'cash-in-success', defaultMessage: 'Cash in recorded successfully.' }));
      } else {
        await createTreasuryCashOut(id, request);
        notify(intl.formatMessage({ id: 'cash-out-success', defaultMessage: 'Cash out recorded successfully.' }));
      }

      setCashDialog({ open: false, mode: cashDialog.mode });
      await refreshTreasury();
    } catch (error) {
      notify(error instanceof Error ? error.message : intl.formatMessage({ id: 'action-failed', defaultMessage: 'The operation failed.' }), 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading || !account) {
    return <Loader />;
  }

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Breadcrumbs
          custom
          card={false}
          title={false}
          divider={false}
          heading="account-details"
          links={[{ title: 'treasury', to: '/treasury' }, { title: 'cashboxes', to: '/treasury/accounts' }]}
          sx={{ mb: 0 }}
        />
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mt: 1, gap: 2, flexWrap: 'wrap' }}>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
              <Typography variant="h3" fontWeight={700}>
                {account.nameArabic}
              </Typography>
              <Chip
                size="small"
                label={<FormattedMessage id={account.isActive ? 'active' : 'inactive'} defaultMessage={account.isActive ? 'Active' : 'Inactive'} />}
                color={account.isActive ? 'success' : 'default'}
                variant="outlined"
              />
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              {account.code} • {account.accountTypeLabel}
            </Typography>
          </Box>
          <Stack direction="row" spacing={1} flexWrap="wrap">
            <PermissionGuard permission={TREASURY_PERMISSIONS.receiptsCreate}>
              <Button
                variant="contained"
                startIcon={<IconPlus size={18} />}
                onClick={() => setCashDialog({ open: true, mode: 'in' })}
                sx={{ borderRadius: 2 }}
              >
                <FormattedMessage id="cash-in" defaultMessage="Cash In" />
              </Button>
            </PermissionGuard>
            <PermissionGuard permission={TREASURY_PERMISSIONS.paymentsCreate}>
              <Button
                variant="outlined"
                color="secondary"
                startIcon={<IconMinus size={18} />}
                onClick={() => setCashDialog({ open: true, mode: 'out' })}
                sx={{ borderRadius: 2 }}
              >
                <FormattedMessage id="cash-out" defaultMessage="Cash Out" />
              </Button>
            </PermissionGuard>
            <PermissionGuard permission={TREASURY_PERMISSIONS.accountsUpdate}>
              <Button component={Link} to={`/treasury/accounts/${account.id}/edit`} variant="outlined" color="secondary" startIcon={<IconEdit size={18} />} sx={{ borderRadius: 2 }}>
                <FormattedMessage id="edit" defaultMessage="Edit" />
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
                  <FormattedMessage id="deactivate" defaultMessage="Deactivate" />
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
                  <FormattedMessage id="activate" defaultMessage="Activate" />
                </Button>
              </PermissionGuard>
            )}
          </Stack>
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
                <FormattedMessage id="cashbox-details" defaultMessage="Cashbox Details" />
              </Typography>
            </Box>
            <Box sx={{ p: 3 }}>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <InfoRow label={<FormattedMessage id="code" defaultMessage="Code" />}>{account.code}</InfoRow>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <InfoRow label={<FormattedMessage id="cashbox-name" defaultMessage="Cashbox Name" />}>{account.nameArabic}</InfoRow>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <InfoRow label={<FormattedMessage id="currency" defaultMessage="Currency" />}>{account.currencyCode}</InfoRow>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <InfoRow label={<FormattedMessage id="account-type" defaultMessage="Account Type" />}>{account.accountTypeLabel}</InfoRow>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <InfoRow label={<FormattedMessage id="opening-balance" defaultMessage="Opening Balance" />}>
                    {formatTreasuryMoney(account.openingBalance, account.currencyCode)}
                  </InfoRow>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <InfoRow label={<FormattedMessage id="current-balance" defaultMessage="Current Balance" />}>
                    {formatTreasuryMoney(account.balance, account.currencyCode)}
                  </InfoRow>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <InfoRow label={<FormattedMessage id="last-movement" defaultMessage="Last Movement" />}>
                    {account.lastMovementDate ?? '-'}
                  </InfoRow>
                </Grid>
                <Grid item xs={12}>
                  <InfoRow label={<FormattedMessage id="notes" defaultMessage="Notes" />}>{account.notes || '-'}</InfoRow>
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
                <FormattedMessage id="movement-history" defaultMessage="Movement History" />
              </Typography>
            </Box>
            <Box sx={{ p: 3 }}>
              {isStatementLoading ? (
                <Loader />
              ) : statement ? (
                <TreasuryMovementTable
                  movements={statement.movements}
                  page={statement.page}
                  totalPages={statement.totalPages}
                  isLoading={false}
                  currencyCode={account.currencyCode}
                />
              ) : (
                <Typography color="text.secondary">
                  <FormattedMessage id="treasury.empty" defaultMessage="No records found." />
                </Typography>
              )}
            </Box>
          </MainCard>
        </Grid>
      </Grid>

      <Box sx={{ mt: 3 }}>
        <Button onClick={() => navigate(-1)} startIcon={<IconArrowLeft size={18} />} color="inherit">
          <FormattedMessage id="back" defaultMessage="Back" />
        </Button>
      </Box>

      <TreasuryConfirmationDialog
        open={actionDialog.open}
        action={actionDialog.action}
        isProcessing={isProcessing}
        onConfirm={handleConfirmAction}
        onClose={() => setActionDialog({ open: false, action: 'activate' })}
      />

      <TreasuryCashMovementDialog
        open={cashDialog.open}
        mode={cashDialog.mode}
        accountName={account.nameArabic}
        isSubmitting={isProcessing}
        onClose={() => setCashDialog({ open: false, mode: cashDialog.mode })}
        onSubmit={handleCashSubmit}
      />
    </Box>
  );
}
