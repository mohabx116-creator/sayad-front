import { useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { Link, useParams } from 'react-router-dom';

import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/GridLegacy';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import MainCard from 'ui-component/cards/MainCard';
import Breadcrumbs from 'ui-component/extended/Breadcrumbs';
import Loader from 'ui-component/Loader';
import PartyBalance from '../components/PartyBalance';
import { usePartyStatement } from '../hooks/useParties';

export default function PartyStatementPage() {
  const { id } = useParams();
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [entryType, setEntryType] = useState('');
  const { statement, error, isLoading } = usePartyStatement(id, {
    page: page + 1,
    pageSize,
    fromDate,
    toDate,
    entryType
  });

  return (
    <>
      <Breadcrumbs custom heading="party-statement" links={[{ title: 'parties', to: '/parties' }, { title: 'party-details', to: id ? `/parties/${id}` : '/parties' }, { title: 'party-statement' }]} />
      <MainCard
        title={<FormattedMessage id="party-statement" />}
        secondary={<Button component={Link} to={id ? `/parties/${id}` : '/parties'}><FormattedMessage id="party-details" /></Button>}
      >
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={12} md={3}>
            <TextField fullWidth type="date" label={<FormattedMessage id="from-date" />} value={fromDate} onChange={(event) => { setFromDate(event.target.value); setPage(0); }} InputLabelProps={{ shrink: true }} />
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField fullWidth type="date" label={<FormattedMessage id="to-date" />} value={toDate} onChange={(event) => { setToDate(event.target.value); setPage(0); }} InputLabelProps={{ shrink: true }} />
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField fullWidth select label={<FormattedMessage id="entry-type" />} value={entryType} onChange={(event) => { setEntryType(event.target.value); setPage(0); }}>
              <MenuItem value=""><FormattedMessage id="all" /></MenuItem>
              <MenuItem value="OpeningBalance"><FormattedMessage id="opening-balance" /></MenuItem>
              <MenuItem value="OpeningBalanceReversal"><FormattedMessage id="opening-balance-reversal" /></MenuItem>
            </TextField>
          </Grid>
        </Grid>
        {isLoading && <Loader />}
        {error && <Typography color="error"><FormattedMessage id="parties-load-error" /></Typography>}
        {statement && (
          <>
            <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: 'wrap' }}>
              <Chip label={<><FormattedMessage id="opening-balance" />: {statement.openingBalance.amount.toFixed(2)} {statement.openingBalance.balanceNature}</>} />
              <Chip label={<><FormattedMessage id="brought-forward" />: {statement.broughtForwardBalance.toFixed(2)} {statement.broughtForwardNature}</>} />
              <Chip label={<><FormattedMessage id="debit" />: {statement.debitTotal.toFixed(2)}</>} />
              <Chip label={<><FormattedMessage id="credit" />: {statement.creditTotal.toFixed(2)}</>} />
              <Chip color="primary" label={<><FormattedMessage id="current-balance" />: {statement.closingBalance.toFixed(2)} {statement.closingBalanceNature}</>} />
            </Stack>
            {statement.entries.length === 0 ? (
              <Typography><FormattedMessage id="party-statement-empty" /></Typography>
            ) : (
              <>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell><FormattedMessage id="date" /></TableCell>
                        <TableCell><FormattedMessage id="entry-type" /></TableCell>
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
                          <TableCell>{entry.entryType}</TableCell>
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
                <TablePagination
                  component="div"
                  count={statement.totalCount}
                  page={page}
                  rowsPerPage={pageSize}
                  onPageChange={(_, nextPage) => setPage(nextPage)}
                  onRowsPerPageChange={(event) => { setPageSize(parseInt(event.target.value, 10)); setPage(0); }}
                />
              </>
            )}
          </>
        )}
      </MainCard>
    </>
  );
}
