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

import { IconArrowRight, IconFileInvoice } from '@tabler/icons-react';
import { FormattedMessage, useIntl } from 'react-intl';

import Breadcrumbs from 'ui-component/extended/Breadcrumbs';
import MainCard from 'ui-component/cards/MainCard';
import PageTitle from 'ui-component/PageTitle';

import { useParties } from 'modules/Parties/hooks/useParties';
import { useSupplierPayablesAgingReport } from '../hooks/useAccountingReports';
import type { SupplierPayablesAgingInvoiceRowDto, SupplierPayablesAgingParams, SupplierPayablesAgingSupplierRowDto } from '../types/report.types';

type SupplierLookupOption = {
  id: string;
  code: string;
  nameArabic: string;
  nameEnglish: string | null;
};

function formatAmount(locale: string, value: number) {
  return new Intl.NumberFormat(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value);
}

function formatDate(value: string | null | undefined, locale: string) {
  if (!value) {
    return '-';
  }

  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString(locale);
}

function formatDateInput(value: Date) {
  return value.toISOString().slice(0, 10);
}

function buildInvoiceUrl(invoiceId: string) {
  return `/purchases/invoices/${invoiceId}`;
}

function buildSupplierUrl(supplierId: string) {
  return `/parties/${supplierId}`;
}

function buildSupplierStatementUrl(supplierId: string, asOfDate: string) {
  return `/parties/${supplierId}/statement?asOfDate=${encodeURIComponent(asOfDate)}`;
}

function buildSupplierAgingUrl(params: { supplierId: string; asOfDate: string }) {
  return `/accounting/reports/supplier-payables-aging?supplierId=${encodeURIComponent(params.supplierId)}&asOfDate=${encodeURIComponent(params.asOfDate)}`;
}

function buildGeneralLedgerUrl(accountId: string, asOfDate: string) {
  return `/accounting/reports/general-ledger?accountId=${encodeURIComponent(accountId)}&fromDate=${encodeURIComponent(asOfDate)}&toDate=${encodeURIComponent(asOfDate)}&page=1&pageSize=100`;
}

function parseQueryParams(search: string, defaults: SupplierPayablesAgingParams) {
  const params = new URLSearchParams(search);
  const parseBoolean = (value: string | null | undefined) => value === 'true' || value === '1';

  return {
    ...defaults,
    asOfDate: params.get('asOfDate') || defaults.asOfDate,
    supplierId: params.get('supplierId') || undefined,
    search: params.get('search') ?? defaults.search,
    agingBucket: params.get('agingBucket') || undefined,
    includeZeroBalances: parseBoolean(params.get('includeZeroBalances')) || defaults.includeZeroBalances,
    includeSupplierAdvances: parseBoolean(params.get('includeSupplierAdvances')) || defaults.includeSupplierAdvances,
    onlyOverdue: parseBoolean(params.get('onlyOverdue')) || defaults.onlyOverdue,
    page: Number(params.get('page') || defaults.page || 1),
    pageSize: Number(params.get('pageSize') || defaults.pageSize || 10)
  };
}

export default function SupplierPayablesAgingPage() {
  const intl = useIntl();
  const location = useLocation();
  const today = useMemo(() => formatDateInput(new Date()), []);
  const firstDay = useMemo(() => formatDateInput(new Date(new Date().getFullYear(), new Date().getMonth(), 1)), []);
  const [supplierLookupSearch, setSupplierLookupSearch] = useState('');
  const [params, setParams] = useState<SupplierPayablesAgingParams>({
    asOfDate: today,
    search: '',
    agingBucket: '',
    includeZeroBalances: false,
    includeSupplierAdvances: false,
    onlyOverdue: false,
    page: 1,
    pageSize: 10
  });

  useEffect(() => {
    setParams((current) => parseQueryParams(location.search, { ...current, asOfDate: current.asOfDate || today }));
  }, [location.search, today]);

  const reportParams = useMemo(
    () => ({
      ...params,
      search: params.search?.trim() || undefined,
      supplierId: params.supplierId || undefined
    }),
    [params]
  );
  const { report, error, isLoading, mutate } = useSupplierPayablesAgingReport(reportParams);
  const { items: parties, isLoading: suppliersLoading } = useParties({
    page: 1,
    pageSize: 100,
    isSupplier: true,
    isActive: true,
    sortBy: 'nameArabic',
    search: supplierLookupSearch.trim() || undefined
  });

  const selectedSupplier = useMemo(() => {
    if (!params.supplierId) {
      return null;
    }

    const fromLookup = parties.find((supplier) => supplier.id === params.supplierId);
    if (fromLookup) {
      return {
        id: fromLookup.id,
        code: fromLookup.code,
        nameArabic: fromLookup.nameArabic,
        nameEnglish: fromLookup.nameEnglish
      };
    }

    const fromReport = report?.supplierRows.find((supplier) => supplier.supplierId === params.supplierId);
    if (fromReport) {
      return {
        id: fromReport.supplierId,
        code: fromReport.supplierCode,
        nameArabic: fromReport.supplierArabicName,
        nameEnglish: fromReport.supplierEnglishName
      };
    }

    return {
      id: params.supplierId,
      code: params.supplierId,
      nameArabic: params.supplierId,
      nameEnglish: null
    };
  }, [parties, params.supplierId, report?.supplierRows]);

  const supplierOptions = useMemo<SupplierLookupOption[]>(() => {
    if (!selectedSupplier) {
      return parties;
    }

    if (parties.some((supplier) => supplier.id === selectedSupplier.id)) {
      return parties;
    }

    return [selectedSupplier, ...parties];
  }, [parties, selectedSupplier]);

  const invoiceRows = report?.invoiceRows ?? [];
  const supplierRows = report?.supplierRows ?? [];

  const summaryCards = report
    ? [
        { id: 'supplier-count', defaultMessage: 'Suppliers', value: report.supplierCount, isCount: true },
        { id: 'invoice-count', defaultMessage: 'Invoices', value: report.invoiceCount, isCount: true },
        { id: 'outstanding-invoices-total', defaultMessage: 'Outstanding invoices', value: report.totalOutstandingInvoices },
        { id: 'unallocated-supplier-debit', defaultMessage: 'Supplier advances', value: report.totalUnallocatedSupplierDebit },
        { id: 'net-supplier-payable', defaultMessage: 'Net supplier payable', value: report.netSupplierPayable },
        { id: 'overdue-amount', defaultMessage: 'Overdue amount', value: report.overdueAmount },
        { id: 'reconciliation-difference', defaultMessage: 'Reconciliation difference', value: report.reconciliationDifference },
        { id: 'overdue-suppliers', defaultMessage: 'Overdue suppliers', value: report.overdueSupplierCount, isCount: true }
      ]
    : [];

  const renderInvoiceRows = () => {
    if (isLoading) {
      return Array.from({ length: 5 }).map((_, index) => (
        <TableRow key={index}>
          <TableCell><Skeleton width={120} /></TableCell>
          <TableCell><Skeleton width={180} /></TableCell>
          <TableCell><Skeleton width={120} /></TableCell>
          <TableCell align="right"><Skeleton width={90} sx={{ ml: 'auto' }} /></TableCell>
          <TableCell align="right"><Skeleton width={90} sx={{ ml: 'auto' }} /></TableCell>
          <TableCell align="right"><Skeleton width={90} sx={{ ml: 'auto' }} /></TableCell>
          <TableCell align="center"><Skeleton width={120} sx={{ mx: 'auto' }} /></TableCell>
        </TableRow>
      ));
    }

    if (invoiceRows.length === 0) {
      return (
        <TableRow>
          <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
            <Typography color="text.secondary">
              <FormattedMessage id="supplier-aging-empty-invoices" defaultMessage="No overdue or open invoices matched the selected filters." />
            </Typography>
          </TableCell>
        </TableRow>
      );
    }

    return invoiceRows.map((row: SupplierPayablesAgingInvoiceRowDto) => (
      <TableRow key={row.purchaseInvoiceId} hover sx={{ bgcolor: row.hasIntegrityWarning ? 'warning.lighter' : undefined }}>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>
          <Stack spacing={0.5}>
            <Typography variant="body2" fontWeight={700}>
              {row.invoiceNumber}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {row.supplierInvoiceNumber || row.supplierCode}
            </Typography>
          </Stack>
        </TableCell>
        <TableCell>
          <Stack spacing={0.5}>
            <Typography variant="body2" fontWeight={700}>
              {row.supplierArabicName}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {row.supplierEnglishName || row.supplierCode}
            </Typography>
          </Stack>
        </TableCell>
        <TableCell>
          <Stack spacing={0.5}>
            <Typography variant="body2">{formatDate(row.invoiceDate, intl.locale)}</Typography>
            <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
              <Chip size="small" variant="outlined" label={row.agingBucketLabel} />
              {row.isDueDateEstimated && <Chip size="small" color="warning" variant="outlined" label={<FormattedMessage id="estimated-due-date" defaultMessage="Estimated due date" />} />}
              {row.hasIntegrityWarning && <Chip size="small" color="error" variant="outlined" label={<FormattedMessage id="integrity-warning" defaultMessage="Integrity warning" />} />}
            </Stack>
          </Stack>
        </TableCell>
        <TableCell align="right">{formatAmount(intl.locale, row.grossInvoiceAmount)}</TableCell>
        <TableCell align="right">{formatAmount(intl.locale, row.appliedPurchaseReturns)}</TableCell>
        <TableCell align="right">
          <Typography fontWeight={700} color={row.outstandingAmount < 0 ? 'error.main' : 'text.primary'}>
            {formatAmount(intl.locale, row.outstandingAmount)}
          </Typography>
        </TableCell>
        <TableCell align="center">
          <Stack spacing={1} alignItems="center">
            <Typography variant="body2" fontWeight={700} color={row.isOverdue ? 'error.main' : 'text.primary'}>
              {row.daysPastDue}
            </Typography>
            {row.isOverdue ? (
              <Chip size="small" color="error" variant="outlined" label={<FormattedMessage id="overdue" defaultMessage="Overdue" />} />
            ) : (
              <Chip size="small" variant="outlined" label={<FormattedMessage id="current" defaultMessage="Current" />} />
            )}
          </Stack>
        </TableCell>
        <TableCell align="center">
          <Stack direction="row" spacing={1} justifyContent="center" flexWrap="wrap">
            <Button component={Link} to={buildInvoiceUrl(row.purchaseInvoiceId)} size="small" variant="outlined" startIcon={<IconArrowRight size={16} />}>
              <FormattedMessage id="invoice" defaultMessage="Invoice" />
            </Button>
            <Button component={Link} to={buildSupplierUrl(row.supplierId)} size="small" variant="text">
              <FormattedMessage id="supplier" defaultMessage="Supplier" />
            </Button>
          </Stack>
        </TableCell>
      </TableRow>
    ));
  };

  const renderSupplierRows = () => {
    if (isLoading) {
      return Array.from({ length: 5 }).map((_, index) => (
        <TableRow key={index}>
          <TableCell><Skeleton width={120} /></TableCell>
          <TableCell><Skeleton width={200} /></TableCell>
          <TableCell align="right"><Skeleton width={70} sx={{ ml: 'auto' }} /></TableCell>
          <TableCell align="right"><Skeleton width={90} sx={{ ml: 'auto' }} /></TableCell>
          <TableCell align="right"><Skeleton width={90} sx={{ ml: 'auto' }} /></TableCell>
          <TableCell align="right"><Skeleton width={90} sx={{ ml: 'auto' }} /></TableCell>
          <TableCell align="center"><Skeleton width={120} sx={{ mx: 'auto' }} /></TableCell>
        </TableRow>
      ));
    }

    if (supplierRows.length === 0) {
      return (
        <TableRow>
          <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
            <Typography color="text.secondary">
              <FormattedMessage id="supplier-aging-empty-suppliers" defaultMessage="No supplier balances matched the selected filters." />
            </Typography>
          </TableCell>
        </TableRow>
      );
    }

    return supplierRows.map((row: SupplierPayablesAgingSupplierRowDto) => (
      <TableRow key={row.supplierId} hover sx={{ bgcolor: row.hasIntegrityWarnings ? 'warning.lighter' : undefined }}>
        <TableCell>{row.supplierCode}</TableCell>
        <TableCell>
          <Stack spacing={0.5}>
            <Typography variant="body2" fontWeight={700}>
              {row.supplierArabicName}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {row.supplierEnglishName || row.supplierCode}
            </Typography>
          </Stack>
        </TableCell>
        <TableCell align="right">{row.invoiceCount}</TableCell>
        <TableCell align="right">{formatAmount(intl.locale, row.totalOutstandingInvoices)}</TableCell>
        <TableCell align="right">{formatAmount(intl.locale, row.supplierAdvanceBalance)}</TableCell>
        <TableCell align="right">
          <Typography fontWeight={700} color={row.netSupplierPayable < 0 ? 'error.main' : 'success.main'}>
            {formatAmount(intl.locale, row.netSupplierPayable)}
          </Typography>
        </TableCell>
        <TableCell align="center">
          <Stack direction="row" spacing={1} justifyContent="center" flexWrap="wrap">
            <Chip size="small" variant="outlined" label={row.hasOverdueInvoices ? intl.formatMessage({ id: 'overdue', defaultMessage: 'Overdue' }) : intl.formatMessage({ id: 'current', defaultMessage: 'Current' })} />
            <Button component={Link} to={buildSupplierAgingUrl({ supplierId: row.supplierId, asOfDate: report?.asOfDate ?? params.asOfDate ?? firstDay })} size="small" variant="outlined" startIcon={<IconArrowRight size={16} />}>
              <FormattedMessage id="aging" defaultMessage="Aging" />
            </Button>
          </Stack>
        </TableCell>
      </TableRow>
    ));
  };

  return (
    <Box>
      <Breadcrumbs
        custom
        heading="supplier-payables-aging-report"
        links={[
          { title: 'general-ledger', to: '/accounting' },
          { title: 'accounting-reports', to: '/accounting/reports/general-ledger' },
          { title: 'supplier-payables-aging-report' }
        ]}
      />

      <Stack spacing={3}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 2, flexWrap: 'wrap' }}>
          <Box>
            <PageTitle>
              <FormattedMessage id="supplier-payables-aging-report" defaultMessage="Supplier Payables Aging" />
            </PageTitle>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              <FormattedMessage
                id="supplier-payables-aging-report-description"
                defaultMessage="Track open supplier balances, aging buckets, advances, and reconciliation to the mapped Supplier Control account."
              />
            </Typography>
          </Box>
          {report?.supplierControlAccountingAccountCode && (
            <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
              <Chip
                variant="outlined"
                label={`${report.supplierControlAccountingAccountCode} - ${report.supplierControlAccountingAccountArabicName || ''}`.trim()}
              />
              {report.supplierControlAccountingAccountId && (
                <Button
                  component={Link}
                  to={buildGeneralLedgerUrl(report.supplierControlAccountingAccountId, report.asOfDate)}
                  size="small"
                  variant="outlined"
                  startIcon={<IconArrowRight size={16} />}
                >
                  <FormattedMessage id="general-ledger-report" defaultMessage="General Ledger Report" />
                </Button>
              )}
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
                label={<FormattedMessage id="supplier" defaultMessage="Supplier" />}
                value={params.supplierId ?? ''}
                onChange={(event) => setParams((current) => ({ ...current, supplierId: event.target.value || undefined, page: 1 }))}
              >
                <MenuItem value="">
                  <FormattedMessage id="all-suppliers" defaultMessage="All suppliers" />
                </MenuItem>
                {suppliersLoading && (
                  <MenuItem value="" disabled>
                    <FormattedMessage id="loading" defaultMessage="Loading..." />
                  </MenuItem>
                )}
                {supplierOptions.map((supplier) => (
                  <MenuItem key={supplier.id} value={supplier.id}>
                    {supplier.code} - {supplier.nameArabic}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} md={2.4}>
              <TextField
                fullWidth
                label={<FormattedMessage id="supplier-search" defaultMessage="Supplier search" />}
                value={supplierLookupSearch}
                onChange={(event) => setSupplierLookupSearch(event.target.value)}
                helperText={<FormattedMessage id="supplier-search-helper" defaultMessage="Filter the supplier selector by code or Arabic name." />}
              />
            </Grid>
            <Grid item xs={12} md={2.4}>
              <TextField
                fullWidth
                label={<FormattedMessage id="report-search" defaultMessage="Report search" />}
                value={params.search ?? ''}
                onChange={(event) => setParams((current) => ({ ...current, search: event.target.value, page: 1 }))}
              />
            </Grid>
            <Grid item xs={12} md={2.4}>
              <TextField
                select
                fullWidth
                label={<FormattedMessage id="aging-bucket" defaultMessage="Aging bucket" />}
                value={params.agingBucket ?? ''}
                onChange={(event) => setParams((current) => ({ ...current, agingBucket: event.target.value || undefined, page: 1 }))}
              >
                <MenuItem value="">
                  <FormattedMessage id="all-buckets" defaultMessage="All buckets" />
                </MenuItem>
                {[
                  { value: 'Current', label: 'Current' },
                  { value: 'Days1To30', label: '1-30 days' },
                  { value: 'Days31To60', label: '31-60 days' },
                  { value: 'Days61To90', label: '61-90 days' },
                  { value: 'Over90', label: 'Over 90 days' }
                ].map((bucket) => (
                  <MenuItem key={bucket.value} value={bucket.value}>
                    {bucket.label}
                  </MenuItem>
                ))}
              </TextField>
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
                    checked={params.includeSupplierAdvances ?? false}
                    onChange={(event) => setParams((current) => ({ ...current, includeSupplierAdvances: event.target.checked, page: 1 }))}
                  />
                }
                label={<FormattedMessage id="include-supplier-advances" defaultMessage="Include supplier advances" />}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControlLabel
                control={
                  <Switch
                    checked={params.onlyOverdue ?? false}
                    onChange={(event) => setParams((current) => ({ ...current, onlyOverdue: event.target.checked, page: 1 }))}
                  />
                }
                label={<FormattedMessage id="only-overdue" defaultMessage="Only overdue" />}
              />
            </Grid>
            <Grid item xs={12} md={3} sx={{ display: 'flex', alignItems: 'center' }}>
              <Button variant="outlined" onClick={() => mutate()} startIcon={<IconFileInvoice size={16} />} sx={{ width: '100%' }}>
                <FormattedMessage id="refresh" defaultMessage="Refresh" />
              </Button>
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
            {error instanceof Error ? error.message : intl.formatMessage({ id: 'supplier-aging-load-error', defaultMessage: 'Unable to load the supplier payables aging report.' })}
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
              <Chip color={report.isReconciled ? 'success' : 'error'} variant="outlined" label={report.isReconciled ? intl.formatMessage({ id: 'reconciled', defaultMessage: 'Reconciled' }) : intl.formatMessage({ id: 'not-reconciled', defaultMessage: 'Not reconciled' })} />
              <Chip variant="outlined" label={`${intl.formatMessage({ id: 'supplier-control', defaultMessage: 'Supplier control' })}: ${report.supplierControlAccountingAccountCode || '-'}`} />
            </Stack>

            {report.isReconciled ? (
              <Alert severity="success">
                <FormattedMessage id="supplier-aging-reconciled-message" defaultMessage="The aging report reconciles to the mapped Supplier Control ledger balance." />
              </Alert>
            ) : (
              <Alert severity="warning">
                <FormattedMessage id="supplier-aging-not-reconciled-message" defaultMessage="The aging report does not fully reconcile to the mapped Supplier Control ledger balance." />
              </Alert>
            )}

            {report.hasIntegrityWarnings && (
              <Alert severity="warning">
                <FormattedMessage id="supplier-aging-integrity-warning" defaultMessage="One or more invoices or payments require attention because of an integrity warning." />
              </Alert>
            )}

            {!report.invoiceRows.length && !report.supplierRows.length && (
              <Alert severity="info">
                <FormattedMessage id="supplier-aging-empty-period" defaultMessage="No open supplier payables were found for the selected filters." />
              </Alert>
            )}

            <MainCard
              title={
                <Stack direction="row" spacing={1.5} alignItems="center" justifyContent="space-between" flexWrap="wrap">
                  <Stack direction="row" spacing={1} alignItems="center">
                    <IconFileInvoice size={18} />
                    <Typography variant="h6" component="span">
                      <FormattedMessage id="supplier-aging-invoice-rows" defaultMessage="Invoice aging rows" />
                    </Typography>
                    <Chip size="small" variant="outlined" label={report.invoiceRows.length.toString()} />
                  </Stack>
                  <Typography variant="subtitle1" fontWeight={800}>
                    {formatAmount(intl.locale, report.netSupplierPayable)}
                  </Typography>
                </Stack>
              }
              contentSX={{ p: 0 }}
            >
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell><FormattedMessage id="invoice-number" defaultMessage="Invoice" /></TableCell>
                    <TableCell><FormattedMessage id="supplier" defaultMessage="Supplier" /></TableCell>
                    <TableCell><FormattedMessage id="invoice-date" defaultMessage="Dates / status" /></TableCell>
                    <TableCell align="right"><FormattedMessage id="gross-amount" defaultMessage="Gross" /></TableCell>
                    <TableCell align="right"><FormattedMessage id="purchase-returns" defaultMessage="Purchase returns" /></TableCell>
                    <TableCell align="right"><FormattedMessage id="outstanding-amount" defaultMessage="Outstanding" /></TableCell>
                    <TableCell align="center"><FormattedMessage id="actions" defaultMessage="Actions" /></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>{renderInvoiceRows()}</TableBody>
              </Table>
              <TablePagination
                component="div"
                count={report.totalCount}
                page={Math.max(0, report.page - 1)}
                onPageChange={(_, page) => setParams((current) => ({ ...current, page: page + 1 }))}
                rowsPerPage={report.pageSize}
                onRowsPerPageChange={(event) => setParams((current) => ({ ...current, page: 1, pageSize: Number(event.target.value) }))}
                rowsPerPageOptions={[10, 20, 50, 100]}
              />
            </MainCard>

            <MainCard
              title={
                <Stack direction="row" spacing={1.5} alignItems="center" justifyContent="space-between" flexWrap="wrap">
                  <Stack direction="row" spacing={1} alignItems="center">
                    <IconFileInvoice size={18} />
                    <Typography variant="h6" component="span">
                      <FormattedMessage id="supplier-aging-supplier-rows" defaultMessage="Supplier rollup" />
                    </Typography>
                    <Chip size="small" variant="outlined" label={supplierRows.length.toString()} />
                  </Stack>
                  <Typography variant="subtitle1" fontWeight={800}>
                    {formatAmount(intl.locale, report.supplierControlLedgerBalance)}
                  </Typography>
                </Stack>
              }
              contentSX={{ p: 0 }}
            >
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell><FormattedMessage id="supplier-code" defaultMessage="Code" /></TableCell>
                    <TableCell><FormattedMessage id="supplier" defaultMessage="Supplier" /></TableCell>
                    <TableCell align="right"><FormattedMessage id="invoice-count" defaultMessage="Invoices" /></TableCell>
                    <TableCell align="right"><FormattedMessage id="outstanding-invoices" defaultMessage="Outstanding" /></TableCell>
                    <TableCell align="right"><FormattedMessage id="supplier-advances" defaultMessage="Advances" /></TableCell>
                    <TableCell align="right"><FormattedMessage id="net-supplier-payable" defaultMessage="Net payable" /></TableCell>
                    <TableCell align="center"><FormattedMessage id="actions" defaultMessage="Actions" /></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>{renderSupplierRows()}</TableBody>
              </Table>
            </MainCard>
          </>
        )}
      </Stack>
    </Box>
  );
}
