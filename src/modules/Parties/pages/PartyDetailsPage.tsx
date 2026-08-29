import { useState } from 'react';
import { useBrowserTitle } from 'shared/hooks/useBrowserTitle';
import { useIntl } from 'react-intl';
import { Link, useParams } from 'react-router-dom';

import Button from '@mui/material/Button';
import Grid from '@mui/material/GridLegacy';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { IconToggleLeft, IconToggleRight } from '@tabler/icons-react';

import { activateParty, deactivateParty } from '../api/partiesApi';
import PartySettlementDialog from '../components/PartySettlementDialog';
import PartyClassificationChips from '../components/PartyClassificationChips';
import PartyStatusChip from '../components/PartyStatusChip';
import { useParty } from '../hooks/useParties';
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

export default function PartyDetailsPage() {
  const { id } = useParams();
  const intl = useIntl();
  const dispatch = useDispatch();
  const { party, error, isLoading, mutate } = useParty(id);
  const [cashTransactionMode, setCashTransactionMode] = useState<'receipt' | 'payment' | null>(null);

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

  const closeCashTransactionDialog = () => setCashTransactionMode(null);
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
              <PermissionGuard
                allPermissions={[TREASURY_PERMISSIONS.receiptsCreate, TREASURY_PERMISSIONS.receiptsPost]}
                fallback={null}
              >
                {party.isCustomer && (
                  <Button variant="contained" color="success" onClick={() => setCashTransactionMode('receipt')}>
                    <FormattedMessage id="party-customer-receipt-submit" />
                  </Button>
                )}
              </PermissionGuard>
              <PermissionGuard
                allPermissions={[TREASURY_PERMISSIONS.paymentsCreate, TREASURY_PERMISSIONS.paymentsPost]}
                fallback={null}
              >
                {party.isSupplier && (
                  <Button variant="contained" color="warning" onClick={() => setCashTransactionMode('payment')}>
                    <FormattedMessage id="party-supplier-payment-submit" />
                  </Button>
                )}
              </PermissionGuard>
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
          </Grid>
        )}
      </MainCard>
      {party && id && (
        <PartySettlementDialog
          open={cashTransactionMode !== null}
          mode={cashTransactionMode ?? 'receipt'}
          partyId={id}
          partyName={resolveLocalizedText(intl.locale, party.nameArabic, party.nameEnglish, party.nameArabic)}
          onClose={closeCashTransactionDialog}
          onSaved={async () => {
            await mutate();
          }}
        />
      )}
    </>
  );
}
