import { FormattedMessage } from 'react-intl';
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

import MainCard from 'ui-component/cards/MainCard';
import Breadcrumbs from 'ui-component/extended/Breadcrumbs';
import Loader from 'ui-component/Loader';
import PermissionGuard from 'modules/Administration/components/PermissionGuard';
import PartyBalance from '../components/PartyBalance';
import PartyClassificationChips from '../components/PartyClassificationChips';
import PartyStatusChip from '../components/PartyStatusChip';
import { useParty, usePartyStatement } from '../hooks/useParties';
import { PARTIES_PERMISSIONS } from '../utils/parties.constants';

export default function PartyDetailsPage() {
  const { id } = useParams();
  const { party, error, isLoading } = useParty(id);
  const { statement, isLoading: statementLoading } = usePartyStatement(id);

  return (
    <>
      <Breadcrumbs custom heading="party-details" links={[{ title: 'parties', to: '/parties' }, { title: 'party-details' }]} />
      <Stack spacing={2}>
        <MainCard
          title={<FormattedMessage id="party-details" />}
          secondary={<Button component={Link} to="/parties"><FormattedMessage id="parties" /></Button>}
        >
          {isLoading && <Loader />}
          {error && <Typography color="error"><FormattedMessage id="parties-load-error" /></Typography>}
          {!party && !isLoading && !error && <Typography><FormattedMessage id="parties-empty" /></Typography>}
          {party && (
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <Typography variant="subtitle2"><FormattedMessage id="party-code" /></Typography>
                <Typography>{party.code}</Typography>
              </Grid>
              <Grid item xs={12} md={4}>
                <Typography variant="subtitle2"><FormattedMessage id="name-arabic" /></Typography>
                <Typography>{party.nameArabic}</Typography>
              </Grid>
              <Grid item xs={12} md={4}>
                <Typography variant="subtitle2"><FormattedMessage id="name-english" /></Typography>
                <Typography>{party.nameEnglish ?? '-'}</Typography>
              </Grid>
              <Grid item xs={12} md={4}>
                <Typography variant="subtitle2"><FormattedMessage id="status" /></Typography>
                <PartyStatusChip isActive={party.isActive} />
              </Grid>
              <Grid item xs={12} md={4}>
                <Typography variant="subtitle2"><FormattedMessage id="party-classification" /></Typography>
                <PartyClassificationChips isCustomer={party.isCustomer} isSupplier={party.isSupplier} />
              </Grid>
              <Grid item xs={12} md={4}>
                <Typography variant="subtitle2"><FormattedMessage id="balance" /></Typography>
                <PartyBalance balance={party.balance} balanceNature={party.balanceNature} />
              </Grid>
              <Grid item xs={12} md={4}>
                <Typography variant="subtitle2"><FormattedMessage id="created-date" /></Typography>
                <Typography>{new Date(party.createdAtUtc).toLocaleString()}</Typography>
              </Grid>
              <Grid item xs={12} md={4}>
                <Typography variant="subtitle2"><FormattedMessage id="primary-phone" /></Typography>
                <Typography>{party.primaryPhone ?? '-'}</Typography>
              </Grid>
              <Grid item xs={12} md={4}>
                <Typography variant="subtitle2"><FormattedMessage id="secondary-phone" /></Typography>
                <Typography>{party.secondaryPhone ?? '-'}</Typography>
              </Grid>
              <Grid item xs={12} md={4}>
                <Typography variant="subtitle2"><FormattedMessage id="email" /></Typography>
                <Typography>{party.email ?? '-'}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2"><FormattedMessage id="address" /></Typography>
                <Typography>{party.address ?? '-'}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2"><FormattedMessage id="notes" /></Typography>
                <Typography>{party.notes ?? '-'}</Typography>
              </Grid>
            </Grid>
          )}
        </MainCard>

        <PermissionGuard permission={PARTIES_PERMISSIONS.statementView}>
          <MainCard title={<FormattedMessage id="party-statement" />}>
            {statementLoading && <Loader />}
            {!statementLoading && (
              <>
                {statement && (
                  <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: 'wrap' }}>
                    <Chip label={<><FormattedMessage id="opening-balance" />: {statement.openingBalance.amount.toFixed(2)}</>} />
                    <Chip label={<><FormattedMessage id="debit" />: {statement.debitTotal.toFixed(2)}</>} />
                    <Chip label={<><FormattedMessage id="credit" />: {statement.creditTotal.toFixed(2)}</>} />
                    <Chip color="primary" label={<><FormattedMessage id="current-balance" />: {statement.closingBalance.toFixed(2)} {statement.closingBalanceNature}</>} />
                  </Stack>
                )}
                {!statement || statement.entries.length === 0 ? (
                  <Typography><FormattedMessage id="party-statement-empty" /></Typography>
                ) : (
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell><FormattedMessage id="date" /></TableCell>
                          <TableCell><FormattedMessage id="reference" /></TableCell>
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
                            <TableCell>{entry.referenceNumber ?? entry.referenceType}</TableCell>
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
    </>
  );
}
