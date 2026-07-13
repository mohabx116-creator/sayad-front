import { useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { Link, useParams } from 'react-router-dom';

import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/GridLegacy';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';

import { useDispatch } from 'store';
import { openSnackbar } from 'store/slices/snackbar';
import MainCard from 'ui-component/cards/MainCard';
import Breadcrumbs from 'ui-component/extended/Breadcrumbs';
import Loader from 'ui-component/Loader';
import PermissionGuard from 'modules/Administration/components/PermissionGuard';
import {
  activateParty,
  correctPartyOpeningBalance,
  deactivateParty,
  getPartyOpeningBalance,
  setPartyOpeningBalance
} from '../api/partiesApi';
import OpeningBalanceDialog from '../components/OpeningBalanceDialog';
import PartyBalance from '../components/PartyBalance';
import PartyClassificationChips from '../components/PartyClassificationChips';
import PartyStatusChip from '../components/PartyStatusChip';
import { useParty, usePartyStatement } from '../hooks/useParties';
import type { CorrectOpeningBalanceRequest, OpeningBalanceDto, OpeningBalanceRequest } from '../types/parties.types';
import { PARTIES_PERMISSIONS } from '../utils/parties.constants';

export default function PartyDetailsPage() {
  const { id } = useParams();
  const intl = useIntl();
  const dispatch = useDispatch();
  const [openingDialog, setOpeningDialog] = useState<OpeningBalanceDto | null>(null);
  const [isSavingOpening, setIsSavingOpening] = useState(false);
  const { party, error, isLoading, mutate: mutateParty } = useParty(id);
  const { statement, isLoading: statementLoading, mutate: mutateStatement } = usePartyStatement(id, { page: 1, pageSize: 5 });

  const notify = (message: string, severity: 'success' | 'error' = 'success') => {
    dispatch(openSnackbar({ open: true, message, variant: 'alert', severity }));
  };

  const refresh = async () => {
    await Promise.all([mutateParty(), mutateStatement()]);
  };

  const runAction = async (action: () => Promise<unknown>) => {
    try {
      await action();
      await refresh();
      notify(intl.formatMessage({ id: 'parties-action-success' }));
    } catch (actionError) {
      notify(actionError instanceof Error ? actionError.message : intl.formatMessage({ id: 'parties-action-failed' }), 'error');
    }
  };

  const openOpeningBalanceDialog = async () => {
    if(!id) return;
    try {
      setOpeningDialog(await getPartyOpeningBalance(id));
    } catch (dialogError) {
      notify(dialogError instanceof Error ? dialogError.message : intl.formatMessage({ id: 'parties-action-failed' }), 'error');
    }
  };

  const saveOpeningBalance = async (action: () => Promise<unknown>) => {
    try {
      setIsSavingOpening(true);
      await action();
      setOpeningDialog(null);
      await refresh();
      notify(intl.formatMessage({ id: 'parties-action-success' }));
    } catch (saveError) {
      notify(saveError instanceof Error ? saveError.message : intl.formatMessage({ id: 'parties-action-failed' }), 'error');
    } finally {
      setIsSavingOpening(false);
    }
  };

  return (
    <>
      <Breadcrumbs custom heading="party-details" links={[{ title: 'parties', to: '/parties' }, { title: 'party-details' }]} />
      <Stack spacing={2}>
        <MainCard
          title={<FormattedMessage id="party-details" />}
          secondary={
            party && (
              <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
                <Button component={Link} to="/parties"><FormattedMessage id="parties" /></Button>
                <PermissionGuard permission={PARTIES_PERMISSIONS.update}>
                  <Button component={Link} to={`/parties/${party.id}/edit`} variant="outlined"><FormattedMessage id="edit" /></Button>
                </PermissionGuard>
                <PermissionGuard permission={PARTIES_PERMISSIONS.openingBalanceManage}>
                  <Button variant="outlined" onClick={openOpeningBalanceDialog}><FormattedMessage id="manage-opening-balance" /></Button>
                </PermissionGuard>
                <PermissionGuard permission={PARTIES_PERMISSIONS.statementView}>
                  <Button component={Link} to={`/parties/${party.id}/statement`} variant="outlined"><FormattedMessage id="view-full-statement" /></Button>
                </PermissionGuard>
                <PermissionGuard permission={party.isActive ? PARTIES_PERMISSIONS.deactivate : PARTIES_PERMISSIONS.activate}>
                  <Button color={party.isActive ? 'warning' : 'success'} variant="contained" onClick={() => runAction(() => (party.isActive ? deactivateParty(party.id) : activateParty(party.id)))}>
                    <FormattedMessage id={party.isActive ? 'deactivate' : 'activate'} />
                  </Button>
                </PermissionGuard>
              </Stack>
            )
          }
        >
          {isLoading && <Loader />}
          {error && <Typography color="error"><FormattedMessage id="parties-load-error" /></Typography>}
          {!party && !isLoading && !error && <Typography><FormattedMessage id="parties-empty" /></Typography>}
          {party && (
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}><Typography variant="subtitle2"><FormattedMessage id="party-code" /></Typography><Typography>{party.code}</Typography></Grid>
              <Grid item xs={12} md={4}><Typography variant="subtitle2"><FormattedMessage id="name-arabic" /></Typography><Typography>{party.nameArabic}</Typography></Grid>
              <Grid item xs={12} md={4}><Typography variant="subtitle2"><FormattedMessage id="name-english" /></Typography><Typography>{party.nameEnglish ?? '-'}</Typography></Grid>
              <Grid item xs={12} md={4}><Typography variant="subtitle2"><FormattedMessage id="status" /></Typography><PartyStatusChip isActive={party.isActive} /></Grid>
              <Grid item xs={12} md={4}><Typography variant="subtitle2"><FormattedMessage id="party-classification" /></Typography><PartyClassificationChips isCustomer={party.isCustomer} isSupplier={party.isSupplier} /></Grid>
              <Grid item xs={12} md={4}><Typography variant="subtitle2"><FormattedMessage id="balance" /></Typography><PartyBalance balance={party.balance} balanceNature={party.balanceNature} /></Grid>
              <Grid item xs={12} md={4}><Typography variant="subtitle2"><FormattedMessage id="created-date" /></Typography><Typography>{new Date(party.createdAtUtc).toLocaleString()}</Typography></Grid>
              <Grid item xs={12} md={4}><Typography variant="subtitle2"><FormattedMessage id="primary-phone" /></Typography><Typography>{party.primaryPhone ?? '-'}</Typography></Grid>
              <Grid item xs={12} md={4}><Typography variant="subtitle2"><FormattedMessage id="secondary-phone" /></Typography><Typography>{party.secondaryPhone ?? '-'}</Typography></Grid>
              <Grid item xs={12} md={4}><Typography variant="subtitle2"><FormattedMessage id="email" /></Typography><Typography>{party.email ?? '-'}</Typography></Grid>
              <Grid item xs={12}><Typography variant="subtitle2"><FormattedMessage id="address" /></Typography><Typography>{party.address ?? '-'}</Typography></Grid>
              <Grid item xs={12}><Typography variant="subtitle2"><FormattedMessage id="notes" /></Typography><Typography>{party.notes ?? '-'}</Typography></Grid>
            </Grid>
          )}
        </MainCard>

        <PermissionGuard permission={PARTIES_PERMISSIONS.statementView}>
          <MainCard title={<FormattedMessage id="party-statement-preview" />}>
            {statementLoading && <Loader />}
            {statement && (
              <>
                <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: 'wrap' }}>
                  <Chip label={<><FormattedMessage id="opening-balance" />: {statement.openingBalance.amount.toFixed(2)} {statement.openingBalance.balanceNature}</>} />
                  <Chip color="primary" label={<><FormattedMessage id="current-balance" />: {statement.closingBalance.toFixed(2)} {statement.closingBalanceNature}</>} />
                </Stack>
                {statement.entries.length === 0 ? (
                  <Typography><FormattedMessage id="party-statement-empty" /></Typography>
                ) : (
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell><FormattedMessage id="date" /></TableCell>
                          <TableCell><FormattedMessage id="description" /></TableCell>
                          <TableCell><FormattedMessage id="debit" /></TableCell>
                          <TableCell><FormattedMessage id="credit" /></TableCell>
                          <TableCell><FormattedMessage id="running-balance" /></TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {statement.entries.map((entry) => (
                          <TableRow key={entry.id}>
                            <TableCell>{entry.entryDate}</TableCell>
                            <TableCell>{entry.descriptionArabic}</TableCell>
                            <TableCell>{entry.debitAmount.toFixed(2)}</TableCell>
                            <TableCell>{entry.creditAmount.toFixed(2)}</TableCell>
                            <TableCell><PartyBalance balance={entry.runningBalance} balanceNature={entry.runningBalanceNature} /></TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </>
            )}
          </MainCard>
        </PermissionGuard>
      </Stack>
      {id && openingDialog && (
        <OpeningBalanceDialog
          openingBalance={openingDialog}
          isSaving={isSavingOpening}
          onClose={() => setOpeningDialog(null)}
          onCreate={(values: OpeningBalanceRequest) => saveOpeningBalance(() => setPartyOpeningBalance(id, values))}
          onCorrect={(values: CorrectOpeningBalanceRequest) => saveOpeningBalance(() => correctPartyOpeningBalance(id, values))}
        />
      )}
    </>
  );
}
