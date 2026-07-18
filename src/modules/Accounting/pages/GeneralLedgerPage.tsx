import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

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

import { IconEye } from '@tabler/icons-react';
import { FormattedMessage, useIntl } from 'react-intl';

import Breadcrumbs from 'ui-component/extended/Breadcrumbs';
import MainCard from 'ui-component/cards/MainCard';
import PageTitle from 'ui-component/PageTitle';

import { useAccountingAccounts } from '../hooks/useAccounting';
import { useGeneralLedgerReport } from '../hooks/useAccountingReports';
import type { GeneralLedgerParams } from '../types/report.types';

function formatAmount(locale: string, value: number) {
  return new Intl.NumberFormat(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value);
}

function formatDate(locale: string, value: string) {
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString(locale);
}

export default function GeneralLedgerPage() {
  const intl = useIntl();
  const [searchParams] = useSearchParams();
  const hasQueryParams = searchParams.has('accountId') || searchParams.has('fromDate') || searchParams.has('toDate') || searchParams.has('includeDescendants');
  const initialFromDate = searchParams.get('fromDate') ?? (hasQueryParams ? '' : new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().slice(0, 10));
  const initialToDate = searchParams.get('toDate') ?? new Date().toISOString().slice(0, 10);
  const initialAccountId = searchParams.get('accountId') ?? '';
  const initialPage = Number.parseInt(searchParams.get('page') ?? '1', 10);
  const initialPageSize = Number.parseInt(searchParams.get('pageSize') ?? '10', 10);
  const includeDescendants = searchParams.get('includeDescendants');
  const [accountSearch, setAccountSearch] = useState('');
  const [selectedAccountId, setSelectedAccountId] = useState(initialAccountId);
  const [params, setParams] = useState<GeneralLedgerParams>({
    accountId: initialAccountId,
    fromDate: initialFromDate,
    toDate: initialToDate,
    page: Number.isFinite(initialPage) && initialPage > 0 ? initialPage : 1,
    pageSize: Number.isFinite(initialPageSize) && initialPageSize > 0 ? initialPageSize : 10,
    includeDescendants: includeDescendants === null ? true : includeDescendants !== 'false'
  });

  const { items: accounts, isLoading: accountsLoading } = useAccountingAccounts({
    page: 1,
    pageSize: 100,
    search: accountSearch.trim() || undefined,
    isPosting: true,
    sortBy: 'code',
    sortDirection: 'asc'
  });

  useEffect(() => {
    if (!selectedAccountId && accounts.length > 0) {
      setSelectedAccountId(accounts[0].id);
    }
  }, [accounts, selectedAccountId]);

  const selectedAccount = useMemo(() => accounts.find((account) => account.id === selectedAccountId) ?? null, [accounts, selectedAccountId]);
  const reportParams = selectedAccountId
    ? {
        ...params,
        accountId: selectedAccountId
      }
    : null;
  const { report, error, isLoading } = useGeneralLedgerReport(reportParams);
  const selectedAccountOption = useMemo(() => report?.account ?? selectedAccount, [report, selectedAccount]);

  const accountOptions = useMemo(() => {
    if (!selectedAccountId) {
      return accounts;
    }

    if (accounts.some((account) => account.id === selectedAccountId)) {
      return accounts;
    }

    return [
      selectedAccountOption ?? {
        id: selectedAccountId,
        code: selectedAccountId,
        nameArabic: selectedAccountId,
        nameEnglish: null,
        accountType: 'Asset',
        accountTypeLabel: 'Asset',
        normalBalance: 'Debit',
        normalBalanceLabel: 'Debit',
        parentId: null,
        parentCode: null,
        parentNameArabic: null,
        hierarchyPath: selectedAccountId,
        hierarchyLevel: 0,
        isPosting: true,
        isActive: true,
        isSystem: false
      },
      ...accounts
    ];
  }, [accounts, selectedAccountId, selectedAccountOption]);

  const handleApply = () => {
    setParams((current) => ({
      ...current,
      page: 1
    }));
  };

  const summaryAccount = report?.account ?? selectedAccount;

  return (
    <Box>
      <Breadcrumbs custom heading="general-ledger-report" links={[{ title: 'general-ledger', to: '/accounting' }, { title: 'general-ledger-report' }]} />
      <Stack spacing={3}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 2, flexWrap: 'wrap' }}>
          <Box>
            <PageTitle>
              <FormattedMessage id="general-ledger-report" defaultMessage="General Ledger Report" />
            </PageTitle>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              <FormattedMessage
                id="general-ledger-report-description"
                defaultMessage="Review the ledger for one posting account and its descendants with running balances and journal entry links."
              />
            </Typography>
          </Box>
          {summaryAccount && (
            <Chip
              color="primary"
              variant="outlined"
              label={`${summaryAccount.code} - ${summaryAccount.nameArabic}`}
              sx={{ fontWeight: 600 }}
            />
          )}
        </Box>

        <Card sx={{ p: 2, borderRadius: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label={<FormattedMessage id="account-search" defaultMessage="Account search" />}
                value={accountSearch}
                onChange={(event) => setAccountSearch(event.target.value)}
                helperText={<FormattedMessage id="account-search-helper" defaultMessage="Filter posting accounts by code or Arabic name." />}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                select
                fullWidth
                label={<FormattedMessage id="account" defaultMessage="Account" />}
                value={selectedAccountId}
                onChange={(event) => setSelectedAccountId(event.target.value)}
              >
                {accountsLoading && (
                  <MenuItem value="">
                    <FormattedMessage id="loading" defaultMessage="Loading..." />
                  </MenuItem>
                )}
                {accountOptions.map((account) => (
                  <MenuItem key={account.id} value={account.id}>
                    {account.code} - {account.nameArabic}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} md={2}>
              <TextField
                type="date"
                fullWidth
                label={<FormattedMessage id="date-from" />}
                value={params.fromDate}
                onChange={(event) => setParams((current) => ({ ...current, fromDate: event.target.value }))}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <TextField
                type="date"
                fullWidth
                label={<FormattedMessage id="date-to" />}
                value={params.toDate}
                onChange={(event) => setParams((current) => ({ ...current, toDate: event.target.value }))}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControlLabel
                control={
                  <Switch
                    checked={params.includeDescendants ?? true}
                    onChange={(event) => setParams((current) => ({ ...current, includeDescendants: event.target.checked }))}
                  />
                }
                label={<FormattedMessage id="include-descendants" defaultMessage="Include descendants" />}
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
            {error instanceof Error ? error.message : intl.formatMessage({ id: 'general-ledger-load-error', defaultMessage: 'Unable to load the general ledger report.' })}
          </Alert>
        )}

        {summaryAccount ? (
          <>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <Card sx={{ p: 2.5, borderRadius: 3 }}>
                  <Typography variant="overline" color="text.secondary">
                    <FormattedMessage id="opening-balance" defaultMessage="Opening balance" />
                  </Typography>
                  <Typography variant="h4" fontWeight={800} sx={{ mt: 1 }}>
                    {formatAmount(intl.locale, report?.openingBalance ?? 0)}
                  </Typography>
                </Card>
              </Grid>
              <Grid item xs={12} md={4}>
                <Card sx={{ p: 2.5, borderRadius: 3 }}>
                  <Typography variant="overline" color="text.secondary">
                    <FormattedMessage id="period-change" defaultMessage="Period change" />
                  </Typography>
                  <Typography variant="h4" fontWeight={800} sx={{ mt: 1 }}>
                    {formatAmount(intl.locale, report?.periodChange ?? 0)}
                  </Typography>
                </Card>
              </Grid>
              <Grid item xs={12} md={4}>
                <Card sx={{ p: 2.5, borderRadius: 3 }}>
                  <Typography variant="overline" color="text.secondary">
                    <FormattedMessage id="closing-balance" defaultMessage="Closing balance" />
                  </Typography>
                  <Typography variant="h4" fontWeight={800} sx={{ mt: 1 }}>
                    {formatAmount(intl.locale, report?.closingBalance ?? 0)}
                  </Typography>
                </Card>
              </Grid>
            </Grid>

            <MainCard contentSX={{ p: 0 }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>
                      <FormattedMessage id="date" />
                    </TableCell>
                    <TableCell>
                      <FormattedMessage id="journal-entry-number" defaultMessage="Journal entry number" />
                    </TableCell>
                    <TableCell>
                      <FormattedMessage id="source-document-type" />
                    </TableCell>
                    <TableCell>
                      <FormattedMessage id="description" />
                    </TableCell>
                    <TableCell align="right">
                      <FormattedMessage id="debit" />
                    </TableCell>
                    <TableCell align="right">
                      <FormattedMessage id="credit" />
                    </TableCell>
                    <TableCell align="right">
                      <FormattedMessage id="running-balance" defaultMessage="Running balance" />
                    </TableCell>
                    <TableCell align="center">
                      <FormattedMessage id="actions" />
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {isLoading ? (
                    Array.from({ length: 5 }).map((_, index) => (
                      <TableRow key={index}>
                        <TableCell><Skeleton width={100} /></TableCell>
                        <TableCell><Skeleton width={100} /></TableCell>
                        <TableCell><Skeleton width={120} /></TableCell>
                        <TableCell><Skeleton width={220} /></TableCell>
                        <TableCell align="right"><Skeleton width={80} sx={{ ml: 'auto' }} /></TableCell>
                        <TableCell align="right"><Skeleton width={80} sx={{ ml: 'auto' }} /></TableCell>
                        <TableCell align="right"><Skeleton width={100} sx={{ ml: 'auto' }} /></TableCell>
                        <TableCell align="center"><Skeleton width={56} sx={{ mx: 'auto' }} /></TableCell>
                      </TableRow>
                    ))
                  ) : (report?.rows.length ?? 0) === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                        <Typography color="text.secondary">
                          <FormattedMessage id="general-ledger-empty" defaultMessage="No ledger movements found for the selected account and date range." />
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    report?.rows.map((row) => (
                      <TableRow key={`${row.journalEntryId}-${row.lineNumber}`} hover>
                        <TableCell>{formatDate(intl.locale, row.entryDate)}</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>{row.entryNumber}</TableCell>
                        <TableCell>{row.sourceTypeLabel}</TableCell>
                        <TableCell>
                          <Stack spacing={0.25}>
                            <Typography variant="body2">{row.descriptionArabic || row.descriptionEnglish || '—'}</Typography>
                            <Typography variant="caption" color="text.secondary">
                              {row.accountCode} - {row.accountNameArabic}
                            </Typography>
                          </Stack>
                        </TableCell>
                        <TableCell align="right">{formatAmount(intl.locale, row.debitAmount)}</TableCell>
                        <TableCell align="right">{formatAmount(intl.locale, row.creditAmount)}</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 700 }}>
                          {formatAmount(intl.locale, row.runningBalance)}
                        </TableCell>
                        <TableCell align="center">
                          <Button component={Link} to={`/accounting/journal-entries/${row.journalEntryId}`} size="small" startIcon={<IconEye size={16} />}>
                            <FormattedMessage id="details" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
              {report && (
                <TablePagination
                  component="div"
                  count={report.totalCount}
                  page={report.page - 1}
                  onPageChange={(_, nextPage) => setParams((current) => ({ ...current, page: nextPage + 1 }))}
                  rowsPerPage={report.pageSize}
                  onRowsPerPageChange={(event) => setParams((current) => ({ ...current, pageSize: parseInt(event.target.value, 10), page: 1 }))}
                  rowsPerPageOptions={[10, 20, 50]}
                />
              )}
            </MainCard>
          </>
        ) : (
          <Alert severity="info">
            <FormattedMessage id="general-ledger-select-account" defaultMessage="Select a posting account to view the ledger report." />
          </Alert>
        )}
      </Stack>
    </Box>
  );
}
