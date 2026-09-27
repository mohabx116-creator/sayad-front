import { useState } from 'react';
import { useSWRConfig } from 'swr';
import { useBrowserTitle } from 'shared/hooks/useBrowserTitle';
import { useIntl } from 'react-intl';
import { Link, useParams } from 'react-router-dom';

import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Grid from '@mui/material/GridLegacy';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { IconToggleLeft, IconToggleRight } from '@tabler/icons-react';

import { activateParty, correctPartyOpeningBalance, deactivateParty, setPartyOpeningBalance } from '../api/partiesApi';
import type { CorrectOpeningBalanceRequest, OpeningBalanceRequest, PartySettlementDirection } from '../types/parties.types';
import OpeningBalanceDialog from '../components/OpeningBalanceDialog';
import PartySettlementDialog from '../components/PartySettlementDialog';
import PartyClassificationChips from '../components/PartyClassificationChips';
import PartyStatusChip from '../components/PartyStatusChip';
import { useParty, usePartyOpeningBalance } from '../hooks/useParties';
import { FormattedMessage } from 'react-intl';
import MainCard from 'ui-component/cards/MainCard';
import Breadcrumbs from 'ui-component/extended/Breadcrumbs';
import Loader from 'ui-component/Loader';
import { useDispatch } from 'store';
import { openSnackbar } from 'store/slices/snackbar';
import PermissionGuard from 'modules/Administration/components/PermissionGuard';
import { PARTIES_PERMISSIONS } from '../utils/parties.constants';
import { TREASURY_PERMISSIONS } from 'modules/Treasury/utils/treasury.constants';
import { resolveLocalizedText } from 'shared/utils/localizedText';
import useAuth from 'hooks/useAuth';
import { hasPermission } from 'modules/Administration/utils/permission-utils';

export default function PartyDetailsPage() {
  const { id } = useParams();
  const intl = useIntl();
  const dispatch = useDispatch();
  const { user } = useAuth();
  const { mutate: mutateGlobal } = useSWRConfig();
  const { party, error, isLoading, mutate } = useParty(id);
  const canViewOpeningBalance = hasPermission(user, PARTIES_PERMISSIONS.openingBalanceView);
  const { openingBalance, error: openingBalanceError, isLoading: openingBalanceLoading } = usePartyOpeningBalance(id, canViewOpeningBalance);
  const { openingBalance: customerOpeningBalance, error: customerOpeningBalanceError, isLoading: customerOpeningBalanceLoading } = usePartyOpeningBalance(id, canViewOpeningBalance && !!party?.isCustomer && !!party?.isSupplier, 'Customer');
  const { openingBalance: supplierOpeningBalance, error: supplierOpeningBalanceError, isLoading: supplierOpeningBalanceLoading } = usePartyOpeningBalance(id, canViewOpeningBalance && !!party?.isCustomer && !!party?.isSupplier, 'Supplier');
  const [cashTransaction, setCashTransaction] = useState<{
    mode: 'receipt' | 'payment';
    direction: PartySettlementDirection;
  } | null>(null);
  const [openingBalanceDialogOpen, setOpeningBalanceDialogOpen] = useState(false);
  const [isSavingOpeningBalance, setIsSavingOpeningBalance] = useState(false);
  const [openingBalanceSide, setOpeningBalanceSide] = useState<'Customer' | 'Supplier' | null>(null);

  const notify = (message: string, severity: 'success' | 'error' = 'success') => {
    dispatch(openSnackbar({ open: true, message, variant: 'alert', severity }));
  };

  const toggleStatus = async () => {
    if (!id || !party) return;
    try {
      await (party.isActive ? deactivateParty(id) : activateParty(id));
      await mutate();
      notify(intl.formatMessage({ id: 'parties-action-success' }));
    } catch (actionError) {
      notify(actionError instanceof Error ? actionError.message : intl.formatMessage({ id: 'parties-action-failed' }), 'error');
    }
  };

  const closeCashTransactionDialog = () => setCashTransaction(null);
  const settlementDirection =
    party && party.balanceNature === 'Debit'
      ? party.isCustomer
        ? party.isSupplier
          ? null
          : 'CustomerReceipt'
        : party.isSupplier
          ? 'SupplierReceipt'
          : null
      : party && party.balanceNature === 'Credit'
        ? party.isCustomer
          ? party.isSupplier
            ? null
            : 'CustomerRefund'
          : party.isSupplier
            ? 'SupplierPayment'
            : null
        : null;
  const settlementMode = settlementDirection === 'CustomerReceipt' || settlementDirection === 'SupplierReceipt' ? 'receipt' : 'payment';
  const refreshPartyData = async () => {
    await mutateGlobal((key) => typeof key === 'string' && key.startsWith('/api/parties'));
  };

  const saveOpeningBalance = async (request: OpeningBalanceRequest | CorrectOpeningBalanceRequest) => {
    if (!id) return;
    try {
      setIsSavingOpeningBalance(true);
      const selectedOpening = openingBalanceSide === 'Customer' ? customerOpeningBalance : openingBalanceSide === 'Supplier' ? supplierOpeningBalance : openingBalance;
      if (selectedOpening?.entryId) {
        await correctPartyOpeningBalance(id, request as CorrectOpeningBalanceRequest, openingBalanceSide ?? undefined);
        notify(intl.formatMessage({ id: 'opening-balance-corrected-success' }));
      } else {
        await setPartyOpeningBalance(id, { ...(request as OpeningBalanceRequest), side: openingBalanceSide ?? undefined });
        notify(intl.formatMessage({ id: 'opening-balance-created-success' }));
      }
      await refreshPartyData();
      setOpeningBalanceDialogOpen(false);
      setOpeningBalanceSide(null);
    } catch (actionError) {
      notify(actionError instanceof Error ? actionError.message : intl.formatMessage({ id: 'parties-action-failed' }), 'error');
    } finally {
      setIsSavingOpeningBalance(false);
    }
  };
  useBrowserTitle(party ? [resolveLocalizedText(intl.locale, party.nameArabic, party.nameEnglish, party.nameArabic)] : []);

  return (
    <>
      <Breadcrumbs custom heading="party-details" links={[{ title: 'parties', to: '/parties' }, { title: 'party-details' }]} />
      <MainCard
        title={<FormattedMessage id="party-details" />}
        secondary={
          party ? (
            <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
              <Button component={Link} to="/parties" color="inherit">
                <FormattedMessage id="parties" />
              </Button>
              <PermissionGuard permission={PARTIES_PERMISSIONS.statementView}>
                <Button component={Link} to={`/parties/${party.id}/statement`} variant="outlined">
                  <FormattedMessage id="party-account-statement" />
                </Button>
              </PermissionGuard>
              {settlementDirection && (
                <PermissionGuard
                  allPermissions={
                    settlementMode === 'receipt'
                      ? [TREASURY_PERMISSIONS.receiptsCreate, TREASURY_PERMISSIONS.receiptsPost]
                      : [TREASURY_PERMISSIONS.paymentsCreate, TREASURY_PERMISSIONS.paymentsPost]
                  }
                  fallback={null}
                >
                  <Button
                    variant="contained"
                    color={settlementMode === 'receipt' ? 'success' : 'warning'}
                    onClick={() => setCashTransaction({ mode: settlementMode, direction: settlementDirection })}
                  >
                    <FormattedMessage
                      id={
                        settlementDirection === 'CustomerReceipt'
                          ? 'party-customer-receipt-submit'
                          : settlementDirection === 'CustomerRefund'
                            ? 'party-customer-payment-submit'
                            : settlementDirection === 'SupplierReceipt'
                              ? 'party-supplier-receipt-submit'
                              : 'party-supplier-payment-submit'
                      }
                    />
                  </Button>
                </PermissionGuard>
              )}
              <PermissionGuard permission={PARTIES_PERMISSIONS.update}>
                <Button component={Link} to={`/parties/${party.id}/edit`} variant="outlined">
                  <FormattedMessage id="edit" />
                </Button>
              </PermissionGuard>
              <PermissionGuard permission={party.isActive ? PARTIES_PERMISSIONS.deactivate : PARTIES_PERMISSIONS.activate}>
                <Button
                  variant="contained"
                  color={party.isActive ? 'warning' : 'success'}
                  onClick={toggleStatus}
                  startIcon={party.isActive ? <IconToggleLeft size={18} /> : <IconToggleRight size={18} />}
                >
                  <FormattedMessage id={party.isActive ? 'deactivate' : 'activate'} />
                </Button>
              </PermissionGuard>
            </Stack>
          ) : null
        }
      >
        {isLoading && <Loader />}
        {error && <Typography color="error"><FormattedMessage id="parties-load-error" /></Typography>}
        {!party && !isLoading && !error && <Typography><FormattedMessage id="parties-empty" /></Typography>}
        {party && (
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2"><FormattedMessage id="party-name" /></Typography>
              <Typography>{resolveLocalizedText(intl.locale, party.nameArabic, party.nameEnglish, party.nameArabic)}</Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2"><FormattedMessage id="party-classification" /></Typography>
              <PartyClassificationChips isCustomer={party.isCustomer} isSupplier={party.isSupplier} />
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2"><FormattedMessage id="party-mobile-number" /></Typography>
              <Typography dir="ltr">{party.primaryPhone ?? '-'}</Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2"><FormattedMessage id="status" /></Typography>
              <PartyStatusChip isActive={party.isActive} />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle2"><FormattedMessage id="party-address" /></Typography>
              <Typography>{party.address ?? '-'}</Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle2"><FormattedMessage id="party-notes" /></Typography>
              <Typography>{party.notes ?? '-'}</Typography>
            </Grid>
            <Grid item xs={12}>
              <PermissionGuard permission={PARTIES_PERMISSIONS.openingBalanceView}>
                <MainCard
                  title={<FormattedMessage id="opening-balance" />}
                  secondary={
                    <PermissionGuard permission={PARTIES_PERMISSIONS.openingBalanceManage}>
                      {!openingBalanceError && !(party.isCustomer && party.isSupplier) ? (
                        <Button variant="outlined" onClick={() => setOpeningBalanceDialogOpen(true)} disabled={openingBalanceLoading}>
                          <FormattedMessage id={openingBalance?.entryId ? 'correct-opening-balance' : 'add-opening-balance'} />
                        </Button>
                      ) : null}
                    </PermissionGuard>
                  }
                >
                  {party.isCustomer && party.isSupplier && <Alert severity="info"><FormattedMessage id="opening-balance-dual-party-help" /></Alert>}
                  {openingBalanceLoading && <Loader />}
                  {!openingBalanceLoading && openingBalanceError && (
                    <Alert severity="error"><FormattedMessage id="opening-balance-load-error" /></Alert>
                  )}
                  {!openingBalanceLoading && !openingBalanceError && !openingBalance?.entryId && (
                    <Typography color="text.secondary"><FormattedMessage id="no-opening-balance" /></Typography>
                  )}
                  {!openingBalanceLoading && !openingBalanceError && openingBalance?.entryId && (
                    <Stack spacing={0.5}>
                      <Typography variant="h4">
                        {intl.formatNumber(openingBalance.amount, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </Typography>
                      <Typography color="text.secondary">
                        <FormattedMessage id={openingBalance.balanceNature === 'Debit' ? 'parties.statement.debit-against-party' : 'parties.statement.credit-for-party'} />
                      </Typography>
                      {openingBalance.entryDate && <Typography variant="caption">{openingBalance.entryDate}</Typography>}
                    </Stack>
                  )}
                </MainCard>
                {party.isCustomer && party.isSupplier && (
                  <Grid container spacing={2} sx={{ mt: 1 }}>
                    {([['Customer', customerOpeningBalance, customerOpeningBalanceError, customerOpeningBalanceLoading], ['Supplier', supplierOpeningBalance, supplierOpeningBalanceError, supplierOpeningBalanceLoading]] as const).map(([side, value, sideError, sideLoading]) => (
                      <Grid item xs={12} md={6} key={side}>
                        <MainCard
                          title={<FormattedMessage id={side === 'Customer' ? 'customer-opening-balance' : 'supplier-opening-balance'} />}
                          secondary={<PermissionGuard permission={PARTIES_PERMISSIONS.openingBalanceManage}><Button variant="outlined" onClick={() => { setOpeningBalanceSide(side); setOpeningBalanceDialogOpen(true); }} disabled={sideLoading || !!sideError}><FormattedMessage id={value?.entryId ? 'correct-opening-balance' : 'add-opening-balance'} /></Button></PermissionGuard>}
                        >
                          {sideLoading && <Loader />}
                          {!sideLoading && sideError && <Alert severity="error"><FormattedMessage id="opening-balance-load-error" /></Alert>}
                          {!sideLoading && !sideError && !value?.entryId && <Typography color="text.secondary"><FormattedMessage id="no-opening-balance" /></Typography>}
                          {!sideLoading && !sideError && value?.entryId && <Stack spacing={0.5}><Typography variant="h4">{intl.formatNumber(value.amount, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Typography><Typography color="text.secondary"><FormattedMessage id={value.balanceNature === 'Debit' ? 'parties.statement.debit-against-party' : 'parties.statement.credit-for-party'} /></Typography>{value.entryDate && <Typography variant="caption">{value.entryDate}</Typography>}</Stack>}
                        </MainCard>
                      </Grid>
                    ))}
                  </Grid>
                )}
              </PermissionGuard>
            </Grid>
          </Grid>
        )}
      </MainCard>
      {party && id && openingBalanceDialogOpen && (
        <OpeningBalanceDialog
          openingBalance={(openingBalanceSide === 'Customer' ? customerOpeningBalance : openingBalanceSide === 'Supplier' ? supplierOpeningBalance : openingBalance) ?? { entryId: null, entryDate: null, amount: 0, balanceNature: 'Settled', notes: null }}
          isSaving={isSavingOpeningBalance}
          onClose={() => setOpeningBalanceDialogOpen(false)}
          onCreate={async (request) => saveOpeningBalance(request)}
          onCorrect={async (request) => saveOpeningBalance(request)}
          side={openingBalanceSide ?? undefined}
        />
      )}
      {party && id && (
        <PartySettlementDialog
          open={cashTransaction !== null}
          mode={cashTransaction?.mode ?? 'receipt'}
          settlementDirection={cashTransaction?.direction}
          maxSettlementAmount={party.balance}
          partyId={id}
          partyName={resolveLocalizedText(intl.locale, party.nameArabic, party.nameEnglish, party.nameArabic)}
          onClose={closeCashTransactionDialog}
          onSaved={async () => refreshPartyData()}
        />
      )}
    </>
  );
}
