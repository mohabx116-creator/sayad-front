import { Link } from 'react-router-dom';
import { useMemo, useState } from 'react';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import FormControlLabel from '@mui/material/FormControlLabel';
import Grid from '@mui/material/GridLegacy';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import { IconArrowRight, IconChartBar, IconExternalLink } from '@tabler/icons-react';
import { FormattedMessage, useIntl } from 'react-intl';

import Breadcrumbs from 'ui-component/extended/Breadcrumbs';
import MainCard from 'ui-component/cards/MainCard';
import PageTitle from 'ui-component/PageTitle';

import { useIncomeStatementReport } from '../hooks/useAccountingReports';
import type { IncomeStatementParams, IncomeStatementRowDto } from '../types/report.types';

function formatAmount(locale: string, value: number) {
  return new Intl.NumberFormat(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value);
}

function formatDateInput(value: Date) {
  return value.toISOString().slice(0, 10);
}

function buildDrilldownUrl(row: IncomeStatementRowDto, fromDate: string, toDate: string) {
  const query = new URLSearchParams({
    accountId: row.accountId,
    fromDate,
    toDate,
    includeDescendants: 'true'
  });

  return `/accounting/reports/general-ledger?${query.toString()}`;
}

export default function IncomeStatementPage() {
  const intl = useIntl();
  const today = useMemo(() => formatDateInput(new Date()), []);
  const startOfMonth = useMemo(() => {
    const date = new Date();
    return formatDateInput(new Date(date.getFullYear(), date.getMonth(), 1));
  }, []);
  const [params, setParams] = useState<IncomeStatementParams>({
    fromDate: startOfMonth,
    toDate: today,
    includeZeroBalances: false,
    includeInactiveAccounts: false,
    includeHeaderAccounts: true,
    search: ''
  });

  const reportParams = useMemo(
    () => ({
      ...params,
      search: params.search?.trim() || undefined
    }),
    [params]
  );
  const { report, error, isLoading } = useIncomeStatementReport(reportParams);

  const handleApply = () => {
    setParams((current) => ({ ...current }));
  };

  const renderSection = (titleId: string, defaultTitle: string, rows: IncomeStatementRowDto[], total: number, accountCount: number) => (
    <MainCard
      title={
        <Stack direction="row" spacing={1.5} alignItems="center" justifyContent="space-between" flexWrap="wrap">
          <Stack direction="row" spacing={1} alignItems="center">
            <IconChartBar size={18} />
            <Typography variant="h6" component="span">
              <FormattedMessage id={titleId} defaultMessage={defaultTitle} />
            </Typography>
            <Chip size="small" variant="outlined" label={`${accountCount}`} />
          </Stack>
          <Typography variant="subtitle1" fontWeight={700}>
            {formatAmount(intl.locale, total)}
          </Typography>
        </Stack>
      }
      contentSX={{ p: 0 }}
    >
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>
              <FormattedMessage id="account-code" defaultMessage="Account code" />
            </TableCell>
            <TableCell>
              <FormattedMessage id="account" defaultMessage="Account" />
            </TableCell>
            <TableCell align="right">
              <FormattedMessage id="debit" defaultMessage="Debit" />
            </TableCell>
            <TableCell align="right">
              <FormattedMessage id="credit" defaultMessage="Credit" />
            </TableCell>
            <TableCell align="right">
              <FormattedMessage id="net-balance" defaultMessage="Net balance" />
            </TableCell>
            <TableCell align="center">
              <FormattedMessage id="actions" defaultMessage="Actions" />
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {isLoading ? (
            Array.from({ length: 6 }).map((_, index) => (
              <TableRow key={index}>
                <TableCell><Skeleton width={90} /></TableCell>
                <TableCell><Skeleton width={240} /></TableCell>
                <TableCell align="right"><Skeleton width={80} sx={{ ml: 'auto' }} /></TableCell>
                <TableCell align="right"><Skeleton width={80} sx={{ ml: 'auto' }} /></TableCell>
                <TableCell align="right"><Skeleton width={90} sx={{ ml: 'auto' }} /></TableCell>
                <TableCell align="center"><Skeleton width={140} sx={{ mx: 'auto' }} /></TableCell>
              </TableRow>
            ))
          ) : rows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                <Typography color="text.secondary">
                  <FormattedMessage id="income-statement-empty" defaultMessage="No accounts matched the selected filters." />
                </Typography>
              </TableCell>
            </TableRow>
          ) : (
            rows.map((row) => (
              <TableRow key={row.accountId} hover sx={row.isAbnormalBalance ? { bgcolor: 'warning.lighter' } : undefined}>
                <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.accountCode}</TableCell>
                <TableCell>
                  <Stack spacing={0.25}>
                    <Typography variant="body2" fontWeight={600}>
                      {row.accountArabicName}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {row.hierarchyPath}
                    </Typography>
                  </Stack>
                </TableCell>
                <TableCell align="right">{formatAmount(intl.locale, row.debitAmount)}</TableCell>
                <TableCell align="right">{formatAmount(intl.locale, row.creditAmount)}</TableCell>
                <TableCell align="right">
                  <Stack spacing={0.75} alignItems="flex-end">
                    <Typography variant="body2" fontWeight={700} color={row.isAbnormalBalance ? 'error.main' : 'text.primary'}>
                      {formatAmount(intl.locale, row.netAmount)}
                    </Typography>
                    {row.isAbnormalBalance && (
                      <Chip size="small" color="warning" variant="outlined" label={row.normalBalanceLabel} />
                    )}
                  </Stack>
                </TableCell>
                <TableCell align="center">
                  <Stack direction="row" spacing={1} justifyContent="center" flexWrap="wrap">
                    <Button
                      component={Link}
                      to={`/accounting/chart-of-accounts/${row.accountId}`}
                      size="small"
                      startIcon={<IconExternalLink size={16} />}
                    >
                      <FormattedMessage id="account" defaultMessage="Account" />
                    </Button>
                    <Button
                      component={Link}
                      to={buildDrilldownUrl(row, report?.fromDate ?? params.fromDate ?? startOfMonth, report?.toDate ?? params.toDate ?? today)}
                      size="small"
                      variant="outlined"
                      startIcon={<IconArrowRight size={16} />}
                    >
                      <FormattedMessage id="view-general-ledger" defaultMessage="View general ledger" />
                    </Button>
                  </Stack>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </MainCard>
  );

  return (
    <Box>
      <Breadcrumbs
        custom
        heading="income-statement-report"
        links={[
          { title: 'general-ledger', to: '/accounting' },
          { title: 'accounting-reports', to: '/accounting/reports/general-ledger' },
          { title: 'income-statement-report' }
        ]}
      />
      <Stack spacing={3}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 2, flexWrap: 'wrap' }}>
          <Box>
            <PageTitle>
              <FormattedMessage id="income-statement-report" defaultMessage="Income Statement Report" />
            </PageTitle>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              <FormattedMessage
                id="income-statement-report-description"
                defaultMessage="Review revenue and expense rollups, abnormal balances, and net profit or loss with drilldown to the general ledger."
              />
            </Typography>
          </Box>
          {report && (
            <Stack direction="row" spacing={1} flexWrap="wrap" justifyContent="flex-end">
              <Chip
                color={report.resultType === 'Profit' ? 'success' : report.resultType === 'Loss' ? 'error' : 'default'}
                variant="outlined"
                label={intl.formatMessage({
                  id: report.resultType === 'Profit' ? 'profit' : report.resultType === 'Loss' ? 'loss' : 'break-even',
                  defaultMessage: report.resultType === 'Profit' ? 'Profit' : report.resultType === 'Loss' ? 'Loss' : 'Break even'
                })}
                sx={{ fontWeight: 600 }}
              />
              <Chip
                variant="outlined"
                label={`${intl.formatMessage({ id: 'total-revenue', defaultMessage: 'Total revenue' })}: ${formatAmount(intl.locale, report.totalRevenue)}`}
              />
              <Chip
                variant="outlined"
                label={`${intl.formatMessage({ id: 'total-expenses', defaultMessage: 'Total expenses' })}: ${formatAmount(intl.locale, report.totalExpenses)}`}
              />
            </Stack>
          )}
        </Box>

        <Card sx={{ p: 2, borderRadius: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={3}>
              <TextField
                type="date"
                fullWidth
                label={<FormattedMessage id="date-from" />}
                value={params.fromDate}
                onChange={(event) => setParams((current) => ({ ...current, fromDate: event.target.value }))}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                type="date"
                fullWidth
                label={<FormattedMessage id="date-to" />}
                value={params.toDate}
                onChange={(event) => setParams((current) => ({ ...current, toDate: event.target.value }))}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <FormControlLabel
                control={
                  <Switch
                    checked={params.includeZeroBalances ?? false}
                    onChange={(event) => setParams((current) => ({ ...current, includeZeroBalances: event.target.checked }))}
                  />
                }
                label={<FormattedMessage id="include-zero-balances" defaultMessage="Include zero balances" />}
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <FormControlLabel
                control={
                  <Switch
                    checked={params.includeInactiveAccounts ?? false}
                    onChange={(event) => setParams((current) => ({ ...current, includeInactiveAccounts: event.target.checked }))}
                  />
                }
                label={<FormattedMessage id="include-inactive-accounts" defaultMessage="Include inactive" />}
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <FormControlLabel
                control={
                  <Switch
                    checked={params.includeHeaderAccounts ?? true}
                    onChange={(event) => setParams((current) => ({ ...current, includeHeaderAccounts: event.target.checked }))}
                  />
                }
                label={<FormattedMessage id="include-header-rows" defaultMessage="Include header rows" />}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label={<FormattedMessage id="search" defaultMessage="Search" />}
                value={params.search ?? ''}
                onChange={(event) => setParams((current) => ({ ...current, search: event.target.value }))}
                helperText={<FormattedMessage id="income-statement-search-helper" defaultMessage="Filter by code, Arabic name, or English name." />}
              />
            </Grid>
            <Grid item xs={12} md={2} sx={{ display: 'flex', alignItems: 'center' }}>
              <Button variant="contained" onClick={handleApply} sx={{ width: '100%' }}>
                <FormattedMessage id="apply-filters" defaultMessage="Apply filters" />
              </Button>
            </Grid>
          </Grid>
        </Card>

        {error && (
          <Alert severity="error">
            {error instanceof Error
              ? error.message
              : intl.formatMessage({ id: 'income-statement-load-error', defaultMessage: 'Unable to load the income statement report.' })}
          </Alert>
        )}

        {isLoading && !report && (
          <Alert severity="info">
            <FormattedMessage id="loading" defaultMessage="Loading..." />
          </Alert>
        )}

        {report && (
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <Card sx={{ p: 2.5, borderRadius: 3 }}>
                <Typography variant="overline" color="text.secondary">
                  <FormattedMessage id="total-revenue" defaultMessage="Total revenue" />
                </Typography>
                <Typography variant="h4" fontWeight={800} sx={{ mt: 1 }}>
                  {formatAmount(intl.locale, report.totalRevenue)}
                </Typography>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card sx={{ p: 2.5, borderRadius: 3 }}>
                <Typography variant="overline" color="text.secondary">
                  <FormattedMessage id="total-expenses" defaultMessage="Total expenses" />
                </Typography>
                <Typography variant="h4" fontWeight={800} sx={{ mt: 1 }}>
                  {formatAmount(intl.locale, report.totalExpenses)}
                </Typography>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card sx={{ p: 2.5, borderRadius: 3 }}>
                <Typography variant="overline" color="text.secondary">
                  <FormattedMessage id="net-profit-or-loss" defaultMessage="Net profit or loss" />
                </Typography>
                <Typography
                  variant="h4"
                  fontWeight={800}
                  sx={{ mt: 1 }}
                  color={report.netProfitOrLoss > 0 ? 'success.main' : report.netProfitOrLoss < 0 ? 'error.main' : 'text.primary'}
                >
                  {formatAmount(intl.locale, report.netProfitOrLoss)}
                </Typography>
              </Card>
            </Grid>
            <Grid item xs={12}>
              <Alert severity={report.hasActivity ? 'success' : 'info'}>
                {report.hasActivity
                  ? intl.formatMessage({
                      id: 'income-statement-has-activity',
                      defaultMessage: 'The selected period contains posting activity.'
                    })
                  : intl.formatMessage({
                      id: 'income-statement-no-activity',
                      defaultMessage: 'The selected period has no posting activity.'
                    })}
              </Alert>
            </Grid>
          </Grid>
        )}

        {report ? (
          <>
            {renderSection('income-statement-revenue', 'Revenue', report.revenueRows, report.totalRevenue, report.revenueAccountCount)}
            {renderSection('income-statement-expense', 'Expenses', report.expenseRows, report.totalExpenses, report.expenseAccountCount)}
          </>
        ) : !isLoading && !error ? (
          <Alert severity="info">
            <FormattedMessage id="income-statement-empty" defaultMessage="No accounts matched the selected filters." />
          </Alert>
        ) : null}
      </Stack>
    </Box>
  );
}
