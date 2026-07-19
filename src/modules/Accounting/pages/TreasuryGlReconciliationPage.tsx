import { Link, useLocation } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import FormControlLabel from '@mui/material/FormControlLabel';
import Grid from '@mui/material/GridLegacy';
import MenuItem from '@mui/material/MenuItem';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import { IconArrowRight, IconReportAnalytics } from '@tabler/icons-react';
import { FormattedMessage, useIntl } from 'react-intl';

import Breadcrumbs from 'ui-component/extended/Breadcrumbs';
import MainCard from 'ui-component/cards/MainCard';
import PageTitle from 'ui-component/PageTitle';

import { useTreasuryAccounts } from 'modules/Treasury/hooks/useTreasury';
import { useTreasuryGlReconciliationReport } from '../hooks/useAccountingReports';
import type { TreasuryGlReconciliationParams, TreasuryGlReconciliationRowDto } from '../types/report.types';

type TreasuryLookupOption = {
  id: string;
  code: string;
  nameArabic: string;
  nameEnglish: string | null;
};

function formatAmount(locale: string, value: number) {
  return new Intl.NumberFormat(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value);
}

function formatDateInput(value: Date) {
  return value.toISOString().slice(0, 10);
}

function parseBoolean(value: string | null) {
  return value === 'true' || value === '1';
}

function parseQueryParams(search: string, defaults: TreasuryGlReconciliationParams) {
  const params = new URLSearchParams(search);
  return {
    ...defaults,
    asOfDate: params.get('asOfDate') || defaults.asOfDate,
    treasuryAccountId: params.get('treasuryAccountId') || params.get('accountId') || defaults.treasuryAccountId,
    search: params.get('search') ?? defaults.search,
    includeInactiveAccounts: parseBoolean(params.get('includeInactiveAccounts')) || defaults.includeInactiveAccounts,
    includeZeroBalances: parseBoolean(params.get('includeZeroBalances')) || defaults.includeZeroBalances,
    onlyDifferences: parseBoolean(params.get('onlyDifferences')) || defaults.onlyDifferences,
    includeUnmappedAccounts: parseBoolean(params.get('includeUnmappedAccounts')) || defaults.includeUnmappedAccounts,
    page: Number(params.get('page') || defaults.page || 1),
    pageSize: Number(params.get('pageSize') || defaults.pageSize || 10)
  };
}

function buildGeneralLedgerUrl(accountId: string, asOfDate: string) {
  const query = new URLSearchParams({
    accountId,
    fromDate: '1900-01-01',
    toDate: asOfDate,
    page: '1',
    pageSize: '100'
  });
  return `/accounting/reports/general-ledger?${query.toString()}`;
}

function buildTreasuryAccountUrl(accountId: string) {
  return `/treasury/accounts/${accountId}`;
}

function buildTreasuryStatementUrl(accountId: string, asOfDate: string) {
  const query = new URLSearchParams({
    accountId,
    dateFrom: '1900-01-01',
    dateTo: asOfDate
  });
  return `/treasury/statements?${query.toString()}`;
}

function formatQueryDate(value: string | undefined) {
  return value && value.length > 0 ? value : undefined;
}

export default function TreasuryGlReconciliationPage() {
  const intl = useIntl();
  const location = useLocation();
  const today = useMemo(() => formatDateInput(new Date()), []);
  const [treasuryLookupSearch, setTreasuryLookupSearch] = useState('');
  const [params, setParams] = useState<TreasuryGlReconciliationParams>({
    asOfDate: today,
    treasuryAccountId: '',
    search: '',
    includeInactiveAccounts: false,
    includeZeroBalances: false,
    onlyDifferences: false,
    includeUnmappedAccounts: false,
    page: 1,
    pageSize: 10
  });

  useEffect(() => {
    setParams((current) => parseQueryParams(location.search, { ...current, asOfDate: current.asOfDate || today }));
  }, [location.search, today]);

  const reportParams = useMemo(
    () => ({
      ...params,
      asOfDate: formatQueryDate(params.asOfDate),
      treasuryAccountId: params.treasuryAccountId || undefined,
      search: params.search?.trim() || undefined
    }),
    [params]
  );
  const { report, error, isLoading, mutate } = useTreasuryGlReconciliationReport(reportParams);
  const { items: treasuryAccounts, isLoading: accountsLoading } = useTreasuryAccounts({
    page: 1,
    pageSize: 100,
    search: treasuryLookupSearch.trim() || undefined,
    sortBy: 'nameArabic',
    sortDirection: 'asc'
  });

  const selectedTreasuryAccount = useMemo<TreasuryLookupOption | null>(() => {
    if (!params.treasuryAccountId) {
      return null;
    }

    const fromLookup = treasuryAccounts.find((account) => account.id === params.treasuryAccountId);
    if (fromLookup) {
      return {
        id: fromLookup.id,
        code: fromLookup.code,
        nameArabic: fromLookup.nameArabic,
        nameEnglish: fromLookup.nameEnglish
      };
    }

    const fromReport = report?.rows.find((row) => row.treasuryAccountId === params.treasuryAccountId);
    if (fromReport) {
      return {
        id: fromReport.treasuryAccountId,
        code: fromReport.treasuryCode,
        nameArabic: fromReport.treasuryArabicName,
        nameEnglish: fromReport.treasuryEnglishName
      };
    }

    return {
      id: params.treasuryAccountId,
      code: params.treasuryAccountId,
      nameArabic: params.treasuryAccountId,
      nameEnglish: null
    };
  }, [params.treasuryAccountId, report?.rows, treasuryAccounts]);

  const treasuryAccountOptions = useMemo<TreasuryLookupOption[]>(() => {
    if (!selectedTreasuryAccount) {
      return treasuryAccounts;
    }

    if (treasuryAccounts.some((account) => account.id === selectedTreasuryAccount.id)) {
      return treasuryAccounts;
    }

    return [selectedTreasuryAccount, ...treasuryAccounts];
  }, [selectedTreasuryAccount, treasuryAccounts]);

  const rows = report?.rows ?? [];

  const summaryCards = report
    ? [
        { id: 'treasury-account-count', defaultMessage: 'Treasury accounts', value: report.treasuryAccountCount, isCount: true },
        { id: 'valid-mapped-account-count', defaultMessage: 'Valid mappings', value: report.validMappedAccountCount, isCount: true },
        { id: 'unmapped-account-count', defaultMessage: 'Unmapped accounts', value: report.unmappedAccountCount, isCount: true },
        { id: 'invalid-mapping-count', defaultMessage: 'Invalid mappings', value: report.invalidMappingCount, isCount: true },
        { id: 'reconciled-account-count', defaultMessage: 'Reconciled accounts', value: report.reconciledAccountCount, isCount: true },
        { id: 'unreconciled-account-count', defaultMessage: 'Unreconciled accounts', value: report.unreconciledAccountCount, isCount: true },
        { id: 'hidden-row-count', defaultMessage: 'Hidden rows', value: report.hiddenRowCount, isCount: true },
        { id: 'total-reconciliation-difference', defaultMessage: 'Reconciliation difference', value: report.totalReconciliationDifference }
      ]
    : [];

  const renderRows = () => {
    if (isLoading) {
      return Array.from({ length: 5 }).map((_, index) => (
        <TableRow key={index}>
          <TableCell><Skeleton width={160} /></TableCell>
          <TableCell><Skeleton width={180} /></TableCell>
          <TableCell align="right"><Skeleton width={90} sx={{ ml: 'auto' }} /></TableCell>
          <TableCell align="right"><Skeleton width={90} sx={{ ml: 'auto' }} /></TableCell>
          <TableCell align="right"><Skeleton width={90} sx={{ ml: 'auto' }} /></TableCell>
          <TableCell align="right"><Skeleton width={90} sx={{ ml: 'auto' }} /></TableCell>
          <TableCell align="right"><Skeleton width={90} sx={{ ml: 'auto' }} /></TableCell>
          <TableCell align="right"><Skeleton width={90} sx={{ ml: 'auto' }} /></TableCell>
          <TableCell align="right"><Skeleton width={90} sx={{ ml: 'auto' }} /></TableCell>
          <TableCell align="center"><Skeleton width={120} sx={{ mx: 'auto' }} /></TableCell>
          <TableCell align="center"><Skeleton width={140} sx={{ mx: 'auto' }} /></TableCell>
        </TableRow>
      ));
    }

    if (rows.length === 0) {
      return (
        <TableRow>
          <TableCell colSpan={11} align="center" sx={{ py: 4 }}>
            <Typography color="text.secondary">
              <FormattedMessage id="treasury-gl-reconciliation-empty" defaultMessage="No treasury reconciliation rows matched the selected filters." />
            </Typography>
          </TableCell>
        </TableRow>
      );
    }

    return rows.map((row: TreasuryGlReconciliationRowDto) => {
      const statusLabel = !row.accountingAccountId
        ? intl.formatMessage({ id: 'unmapped', defaultMessage: 'Unmapped' })
        : row.hasConfigurationWarning
          ? intl.formatMessage({ id: 'configuration-warning', defaultMessage: 'Configuration warning' })
          : row.isReconciled
            ? intl.formatMessage({ id: 'reconciled', defaultMessage: 'Reconciled' })
            : intl.formatMessage({ id: 'not-reconciled', defaultMessage: 'Not reconciled' });
      const statusColor = !row.accountingAccountId
        ? 'default'
        : row.hasConfigurationWarning
          ? 'warning'
          : row.isReconciled
            ? 'success'
            : 'error';

      return (
        <TableRow key={row.treasuryAccountId} hover sx={{ bgcolor: row.hasConfigurationWarning ? 'warning.lighter' : undefined }}>
          <TableCell>
            <Stack spacing={0.5}>
              <Typography variant="body2" fontWeight={700}>
                {row.treasuryCode}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {row.treasuryArabicName}
              </Typography>
              {row.treasuryEnglishName && (
                <Typography variant="caption" color="text.secondary">
                  {row.treasuryEnglishName}
                </Typography>
              )}
              <Typography variant="caption" color="text.secondary">
                {row.treasuryType}
              </Typography>
            </Stack>
          </TableCell>
          <TableCell>
            <Stack spacing={0.5}>
              <Typography variant="body2" fontWeight={700}>
                {row.accountingAccountCode || '-'}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {row.accountingAccountArabicName || '-'}
              </Typography>
              {row.accountingAccountEnglishName && (
                <Typography variant="caption" color="text.secondary">
                  {row.accountingAccountEnglishName}
                </Typography>
              )}
              {row.isSharedMapping && (
                <Chip size="small" variant="outlined" color="info" label={`${row.sharedTreasuryAccountCount} treasury accounts`} />
              )}
            </Stack>
          </TableCell>
          <TableCell align="right">{formatAmount(intl.locale, row.openingBalance)}</TableCell>
          <TableCell align="right">{formatAmount(intl.locale, row.receiptTotal)}</TableCell>
          <TableCell align="right">{formatAmount(intl.locale, row.paymentTotal)}</TableCell>
          <TableCell align="right">{formatAmount(intl.locale, row.incomingTransferTotal)}</TableCell>
          <TableCell align="right">{formatAmount(intl.locale, row.outgoingTransferTotal)}</TableCell>
          <TableCell align="right">
            <Typography fontWeight={700}>{formatAmount(intl.locale, row.operationalTreasuryBalance)}</Typography>
          </TableCell>
          <TableCell align="right">
            <Typography fontWeight={700}>{formatAmount(intl.locale, row.generalLedgerBalance)}</Typography>
          </TableCell>
          <TableCell align="right">
            <Typography fontWeight={700} color={row.reconciliationDifference === 0 ? 'success.main' : 'error.main'}>
              {formatAmount(intl.locale, row.reconciliationDifference)}
            </Typography>
          </TableCell>
          <TableCell align="center">
            <Chip size="small" color={statusColor as 'default' | 'success' | 'warning' | 'error'} variant="outlined" label={statusLabel} />
          </TableCell>
          <TableCell>
            <Stack spacing={0.75} sx={{ minWidth: 280 }}>
              <Stack direction="row" spacing={1} flexWrap="wrap">
                <Button component={Link} to={buildTreasuryAccountUrl(row.treasuryAccountId)} size="small" variant="outlined" startIcon={<IconArrowRight size={16} />}>
                  <FormattedMessage id="treasury-account" defaultMessage="Treasury Account" />
                </Button>
                <Button component={Link} to={buildTreasuryStatementUrl(row.treasuryAccountId, report?.asOfDate ?? params.asOfDate ?? today)} size="small" variant="text">
                  <FormattedMessage id="statement" defaultMessage="Statement" />
                </Button>
                {row.accountingAccountId && (
                  <Button component={Link} to={buildGeneralLedgerUrl(row.accountingAccountId, report?.asOfDate ?? params.asOfDate ?? today)} size="small" variant="text">
                    <FormattedMessage id="general-ledger-report" defaultMessage="General Ledger Report" />
                  </Button>
                )}
              </Stack>
              {row.hasConfigurationWarning && row.configurationWarnings.map((warning) => (
                <Typography key={warning} variant="caption" color="warning.main">
                  {warning}
                </Typography>
              ))}
              {row.hasIntegrityWarning && row.integrityWarnings.map((warning) => (
                <Typography key={warning} variant="caption" color="error.main">
                  {warning}
                </Typography>
              ))}
              <Chip size="small" color={statusColor as 'default' | 'success' | 'warning' | 'error'} variant="outlined" label={statusLabel} sx={{ alignSelf: 'flex-start' }} />
            </Stack>
          </TableCell>
        </TableRow>
      );
    });
  };

  return (
    <Box>
      <Breadcrumbs
        custom
        heading="treasury-gl-reconciliation-report"
        links={[
          { title: 'general-ledger', to: '/accounting' },
          { title: 'accounting-reports', to: '/accounting/reports/general-ledger' },
          { title: 'treasury-gl-reconciliation-report' }
        ]}
      />

      <Stack spacing={3}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 2, flexWrap: 'wrap' }}>
          <Box>
            <PageTitle>
              <FormattedMessage id="treasury-gl-reconciliation-report" defaultMessage="Treasury to General Ledger Reconciliation" />
            </PageTitle>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              <FormattedMessage
                id="treasury-gl-reconciliation-report-description"
                defaultMessage="Compare treasury balances with the mapped general ledger accounts, inspect warnings, and drill into the source treasury and ledger activity."
              />
            </Typography>
          </Box>
          {report && (
            <Stack direction="row" spacing={1} flexWrap="wrap" alignItems="center">
              <Chip variant="outlined" color={report.isFullyReconciled ? 'success' : 'warning'} label={report.isFullyReconciled ? intl.formatMessage({ id: 'treasury-gl-reconciliation-reconciled', defaultMessage: 'Fully reconciled' }) : intl.formatMessage({ id: 'treasury-gl-reconciliation-not-reconciled', defaultMessage: 'Reconciliation differences exist' })} />
              <Chip variant="outlined" label={`${intl.formatMessage({ id: 'as-of-date', defaultMessage: 'As of date' })}: ${report.asOfDate}`} />
            </Stack>
          )}
        </Box>

        <Card sx={{ p: 2, borderRadius: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={2.4}>
              <TextField
                type="date"
                fullWidth
                label={<FormattedMessage id="as-of-date" defaultMessage="As of date" />}
                value={params.asOfDate ?? ''}
                onChange={(event) => setParams((current) => ({ ...current, asOfDate: event.target.value, page: 1 }))}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={2.4}>
              <TextField
                select
                fullWidth
                label={<FormattedMessage id="treasury-account" defaultMessage="Treasury account" />}
                value={params.treasuryAccountId ?? ''}
                onChange={(event) => setParams((current) => ({ ...current, treasuryAccountId: event.target.value || undefined, page: 1 }))}
              >
                <MenuItem value="">
                  <FormattedMessage id="all" defaultMessage="All" />
                </MenuItem>
                {accountsLoading && (
                  <MenuItem value="" disabled>
                    <FormattedMessage id="loading" defaultMessage="Loading..." />
                  </MenuItem>
                )}
                {treasuryAccountOptions.map((account) => (
                  <MenuItem key={account.id} value={account.id}>
                    {account.code} - {account.nameArabic}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} md={2.4}>
              <TextField
                fullWidth
                label={<FormattedMessage id="search" defaultMessage="Search" />}
                value={params.search ?? ''}
                onChange={(event) => setParams((current) => ({ ...current, search: event.target.value, page: 1 }))}
                helperText={<FormattedMessage id="treasury-gl-reconciliation-search-helper" defaultMessage="Search by treasury code, treasury name, mapped GL code, or mapped GL name." />}
              />
            </Grid>
            <Grid item xs={12} md={2.4}>
              <TextField
                fullWidth
                label={<FormattedMessage id="treasury-search" defaultMessage="Treasury lookup search" />}
                value={treasuryLookupSearch}
                onChange={(event) => setTreasuryLookupSearch(event.target.value)}
                helperText={<FormattedMessage id="treasury-search-helper" defaultMessage="Filter the treasury selector by code or Arabic name." />}
              />
            </Grid>
            <Grid item xs={12} md={2.4}>
              <Button variant="outlined" onClick={() => mutate()} startIcon={<IconReportAnalytics size={16} />} sx={{ width: '100%', height: '100%' }}>
                <FormattedMessage id="refresh" defaultMessage="Refresh" />
              </Button>
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControlLabel
                control={
                  <Switch
                    checked={params.includeInactiveAccounts ?? false}
                    onChange={(event) => setParams((current) => ({ ...current, includeInactiveAccounts: event.target.checked, page: 1 }))}
                  />
                }
                label={<FormattedMessage id="include-inactive-accounts" defaultMessage="Include inactive" />}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControlLabel
                control={
                  <Switch
                    checked={params.includeZeroBalances ?? false}
                    onChange={(event) => setParams((current) => ({ ...current, includeZeroBalances: event.target.checked, page: 1 }))}
                  />
                }
                label={<FormattedMessage id="include-zero-balances" defaultMessage="Include zero balances" />}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControlLabel
                control={
                  <Switch
                    checked={params.onlyDifferences ?? false}
                    onChange={(event) => setParams((current) => ({ ...current, onlyDifferences: event.target.checked, page: 1 }))}
                  />
                }
                label={<FormattedMessage id="only-differences" defaultMessage="Only differences" />}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControlLabel
                control={
                  <Switch
                    checked={params.includeUnmappedAccounts ?? false}
                    onChange={(event) => setParams((current) => ({ ...current, includeUnmappedAccounts: event.target.checked, page: 1 }))}
                  />
                }
                label={<FormattedMessage id="include-unmapped-accounts" defaultMessage="Include unmapped" />}
              />
            </Grid>
          </Grid>
        </Card>

        {error && (
          <Alert
            severity="error"
            action={
              <Button color="inherit" size="small" onClick={() => mutate()}>
                <FormattedMessage id="retry" defaultMessage="Retry" />
              </Button>
            }
          >
            {error instanceof Error ? error.message : intl.formatMessage({ id: 'treasury-gl-reconciliation-load-error', defaultMessage: 'Unable to load the treasury reconciliation report.' })}
          </Alert>
        )}

        {report && (
          <>
            <Grid container spacing={2}>
              {summaryCards.map(({ id, defaultMessage, value, isCount }) => (
                <Grid item xs={12} md={3} key={id}>
                  <Card sx={{ p: 2.5, borderRadius: 3 }}>
                    <Typography variant="overline" color="text.secondary">
                      <FormattedMessage id={id} defaultMessage={defaultMessage} />
                    </Typography>
                    <Typography variant="h4" fontWeight={800} sx={{ mt: 1 }}>
                      {isCount ? value : formatAmount(intl.locale, value)}
                    </Typography>
                  </Card>
                </Grid>
              ))}
            </Grid>

            <Stack direction="row" spacing={1} flexWrap="wrap">
              <Chip color={report.isFullyReconciled ? 'success' : 'error'} variant="outlined" label={report.isFullyReconciled ? intl.formatMessage({ id: 'treasury-gl-reconciliation-reconciled', defaultMessage: 'Treasury balances are reconciled to the general ledger.' }) : intl.formatMessage({ id: 'treasury-gl-reconciliation-not-reconciled', defaultMessage: 'Treasury balances do not fully reconcile to the general ledger.' })} />
              {report.hasConfigurationWarnings && (
                <Chip color="warning" variant="outlined" label={intl.formatMessage({ id: 'configuration-warning', defaultMessage: 'Configuration warning' })} />
              )}
              {report.hasIntegrityWarnings && (
                <Chip color="error" variant="outlined" label={intl.formatMessage({ id: 'integrity-warning', defaultMessage: 'Integrity warning' })} />
              )}
            </Stack>

            {!report.rows.length && (
              <Alert severity="info">
                {report.treasuryAccountCount === 0
                  ? intl.formatMessage({ id: 'treasury-gl-reconciliation-empty-treasuries', defaultMessage: 'No treasury accounts are available for reconciliation.' })
                  : report.validMappedAccountCount === 0
                    ? intl.formatMessage({ id: 'treasury-gl-reconciliation-empty-mapped', defaultMessage: 'No treasury accounts are mapped to the general ledger.' })
                    : intl.formatMessage({ id: 'treasury-gl-reconciliation-empty', defaultMessage: 'No treasury reconciliation rows matched the selected filters.' })}
              </Alert>
            )}

            {report.hasConfigurationWarnings && (
              <Alert severity="warning">
                <FormattedMessage id="treasury-gl-reconciliation-configuration-warning" defaultMessage="One or more treasury accounts have mapping or configuration issues that require attention." />
              </Alert>
            )}

            {report.hasIntegrityWarnings && (
              <Alert severity="warning">
                <FormattedMessage id="treasury-gl-reconciliation-integrity-warning" defaultMessage="One or more treasury accounts have stored balance or reconciliation differences that require review." />
              </Alert>
            )}

            <MainCard
              title={
                <Stack direction="row" spacing={1.5} alignItems="center" justifyContent="space-between" flexWrap="wrap">
                  <Stack direction="row" spacing={1} alignItems="center">
                    <IconReportAnalytics size={18} />
                    <Typography variant="h6" component="span">
                      <FormattedMessage id="treasury-gl-reconciliation-rows" defaultMessage="Reconciliation rows" />
                    </Typography>
                    <Chip size="small" variant="outlined" label={report.totalCount.toString()} />
                  </Stack>
                  <Typography variant="subtitle1" fontWeight={800}>
                    {formatAmount(intl.locale, report.totalReconciliationDifference)}
                  </Typography>
                </Stack>
              }
              contentSX={{ p: 0 }}
            >
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell><FormattedMessage id="treasury-account" defaultMessage="Treasury" /></TableCell>
                    <TableCell><FormattedMessage id="mapped-account" defaultMessage="Mapped GL account" /></TableCell>
                    <TableCell align="right"><FormattedMessage id="opening-balance" defaultMessage="Opening" /></TableCell>
                    <TableCell align="right"><FormattedMessage id="receipts" defaultMessage="Receipts" /></TableCell>
                    <TableCell align="right"><FormattedMessage id="payments" defaultMessage="Payments" /></TableCell>
                    <TableCell align="right"><FormattedMessage id="incoming-transfers" defaultMessage="Incoming transfers" /></TableCell>
                    <TableCell align="right"><FormattedMessage id="outgoing-transfers" defaultMessage="Outgoing transfers" /></TableCell>
                    <TableCell align="right"><FormattedMessage id="operational-balance" defaultMessage="Operational balance" /></TableCell>
                    <TableCell align="right"><FormattedMessage id="general-ledger-balance" defaultMessage="General ledger" /></TableCell>
                    <TableCell align="right"><FormattedMessage id="difference" defaultMessage="Difference" /></TableCell>
                    <TableCell align="center"><FormattedMessage id="status" defaultMessage="Status" /></TableCell>
                    <TableCell align="center"><FormattedMessage id="actions" defaultMessage="Actions" /></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>{renderRows()}</TableBody>
              </Table>
              <TablePagination
                component="div"
                count={report.totalCount}
                page={Math.max(0, report.page - 1)}
                onPageChange={(_, nextPage) => setParams((current) => ({ ...current, page: nextPage + 1 }))}
                rowsPerPage={report.pageSize}
                onRowsPerPageChange={(event) => setParams((current) => ({ ...current, page: 1, pageSize: Number(event.target.value) }))}
                rowsPerPageOptions={[10, 20, 50, 100]}
              />
            </MainCard>
          </>
        )}
      </Stack>
    </Box>
  );
}
