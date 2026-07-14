import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { FormattedMessage } from 'react-intl';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Grid from '@mui/material/GridLegacy';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import Breadcrumbs from 'ui-component/extended/Breadcrumbs';
import PageTitle from 'ui-component/PageTitle';
import Loader from 'ui-component/Loader';
import MainCard from 'ui-component/cards/MainCard';

import { useTreasuryAccounts, useTreasuryLookups, useTreasuryStatement } from '../hooks/useTreasury';
import TreasuryBalanceSummary from '../components/TreasuryBalanceSummary';
import TreasuryMovementTable from '../components/TreasuryMovementTable';

export default function TreasuryStatementsPage() {
  const [searchParams] = useSearchParams();
  const [treasuryAccountId, setTreasuryAccountId] = useState(searchParams.get('accountId') ?? searchParams.get('treasuryAccountId') ?? '');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [movementType, setMovementType] = useState('');
  const [page, setPage] = useState(1);

  const { items: accounts } = useTreasuryAccounts({ page: 1, pageSize: 200, status: 'Active' });
  const { lookups } = useTreasuryLookups();
  const { statement, isLoading, error } = useTreasuryStatement(
    treasuryAccountId
      ? {
          treasuryAccountId,
          dateFrom: dateFrom || undefined,
          dateTo: dateTo || undefined,
          movementType: movementType || undefined,
          page,
          pageSize: 20
        }
      : null
  );

  useEffect(() => {
    if (!treasuryAccountId && accounts.length > 0) {
      setTreasuryAccountId(accounts[0].id);
    }
  }, [accounts, treasuryAccountId]);

  useEffect(() => {
    setPage(1);
  }, [treasuryAccountId, dateFrom, dateTo, movementType]);

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Breadcrumbs custom card={false} title={false} divider={false} heading="statements" links={[{ title: 'treasury', to: '/treasury' }, { title: 'statements' }]} sx={{ mb: 0 }} />
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 2, flexWrap: 'wrap', mt: 1 }}>
          <Box>
            <PageTitle>
              <FormattedMessage id="statements" defaultMessage="كشوف الحساب" />
            </PageTitle>
            <Typography variant="body2" color="text.secondary">
              <FormattedMessage id="treasury-home.statements-desc" defaultMessage="مراجعة الحركات اليومية والرصيد التراكمي." />
            </Typography>
          </Box>
          <Button component={Link} to="/treasury/accounts" variant="outlined" color="inherit">
            <FormattedMessage id="treasury-accounts" />
          </Button>
        </Box>
      </Box>

      <MainCard sx={{ border: '1px solid', borderColor: 'divider', boxShadow: 'none', borderRadius: 2, mb: 3 }} content={false}>
        <Box sx={{ p: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <TextField select fullWidth label={<FormattedMessage id="treasury-account" defaultMessage="الحساب" />} value={treasuryAccountId} onChange={(event) => setTreasuryAccountId(event.target.value)}>
                {accounts.map((account) => (
                  <MenuItem key={account.id} value={account.id}>
                    {account.code} - {account.nameArabic}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} md={2}>
              <TextField type="date" fullWidth label={<FormattedMessage id="date-from" />} value={dateFrom} onChange={(event) => setDateFrom(event.target.value)} InputLabelProps={{ shrink: true }} />
            </Grid>
            <Grid item xs={12} md={2}>
              <TextField type="date" fullWidth label={<FormattedMessage id="date-to" />} value={dateTo} onChange={(event) => setDateTo(event.target.value)} InputLabelProps={{ shrink: true }} />
            </Grid>
            <Grid item xs={12} md={2}>
              <TextField select fullWidth label={<FormattedMessage id="movement-type" />} value={movementType} onChange={(event) => setMovementType(event.target.value)}>
                <MenuItem value="">
                  <FormattedMessage id="all" />
                </MenuItem>
                {lookups?.movementTypes.map((item) => (
                  <MenuItem key={item.value} value={item.value}>
                    {item.labelArabic}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
          </Grid>
        </Box>
      </MainCard>

      {!treasuryAccountId ? (
        <Typography color="text.secondary">
          <FormattedMessage id="treasury.select-account" defaultMessage="اختر حساب خزينة لعرض الكشف." />
        </Typography>
      ) : isLoading ? (
        <Loader />
      ) : error ? (
        <Typography color="error">
          <FormattedMessage id="treasury.statement-load-error" defaultMessage="تعذر تحميل كشف الحساب." />
        </Typography>
      ) : statement ? (
        <>
          <TreasuryBalanceSummary
            openingBalance={statement.openingBalance}
            totalReceipts={statement.debitTotal}
            totalPayments={statement.creditTotal}
            closingBalance={statement.closingBalance}
            currencyCode={statement.currencyCode}
          />
          <MainCard sx={{ border: '1px solid', borderColor: 'divider', boxShadow: 'none', borderRadius: 2 }} content={false}>
            <Box sx={{ p: 3 }}>
              <TreasuryMovementTable movements={statement.movements} page={statement.page} totalPages={statement.totalPages} onPageChange={setPage} isLoading={isLoading} />
            </Box>
          </MainCard>
        </>
      ) : null}
    </Box>
  );
}
