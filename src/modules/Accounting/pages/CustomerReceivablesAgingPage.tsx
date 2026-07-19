import { Link } from 'react-router-dom';
import { useMemo, useState } from 'react';

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
import { useCustomerReceivablesAgingReport } from '../hooks/useAccountingReports';
import type { CustomerReceivablesAgingCustomerRowDto, CustomerReceivablesAgingInvoiceRowDto, CustomerReceivablesAgingParams } from '../types/report.types';

type CustomerLookupOption = {
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
  return `/sales/invoices/${invoiceId}`;
}

function buildPartyUrl(partyId: string) {
  return `/parties/${partyId}`;
}

function buildPartyStatementUrl(partyId: string, asOfDate: string) {
  return `/parties/${partyId}/statement?asOfDate=${encodeURIComponent(asOfDate)}`;
}

export default function CustomerReceivablesAgingPage() {
  const intl = useIntl();
  const today = useMemo(() => formatDateInput(new Date()), []);
  const firstDay = useMemo(() => formatDateInput(new Date(new Date().getFullYear(), new Date().getMonth(), 1)), []);
  const [customerLookupSearch, setCustomerLookupSearch] = useState('');
  const [params, setParams] = useState<CustomerReceivablesAgingParams>({
    asOfDate: today,
    search: '',
    agingBucket: '',
    includeZeroBalances: false,
    includeCustomerCredits: false,
    onlyOverdue: false,
    page: 1,
    pageSize: 10
  });

  const reportParams = useMemo(
    () => ({
      ...params,
      search: params.search?.trim() || undefined,
      customerId: params.customerId || undefined
    }),
    [params]
  );
  const { report, error, isLoading, mutate } = useCustomerReceivablesAgingReport(reportParams);
  const { items: parties, isLoading: customersLoading } = useParties({
    page: 1,
    pageSize: 100,
    isCustomer: true,
    isActive: true,
    sortBy: 'nameArabic',
    search: customerLookupSearch.trim() || undefined
  });

  const selectedCustomer = useMemo(() => {
    if (!params.customerId) {
      return null;
    }

    const fromLookup = parties.find((customer) => customer.id === params.customerId);
    if (fromLookup) {
      return {
        id: fromLookup.id,
        code: fromLookup.code,
        nameArabic: fromLookup.nameArabic,
        nameEnglish: fromLookup.nameEnglish
      };
    }

    const fromReport = report?.customerRows.find((customer) => customer.customerId === params.customerId);
    if (fromReport) {
      return {
        id: fromReport.customerId,
        code: fromReport.customerCode,
        nameArabic: fromReport.customerArabicName,
        nameEnglish: fromReport.customerEnglishName
      };
    }

    return {
      id: params.customerId,
      code: params.customerId,
      nameArabic: params.customerId,
      nameEnglish: null
    };
  }, [parties, params.customerId, report?.customerRows]);

  const customerOptions = useMemo<CustomerLookupOption[]>(() => {
    if (!selectedCustomer) {
      return parties;
    }

    if (parties.some((customer) => customer.id === selectedCustomer.id)) {
      return parties;
    }

    return [selectedCustomer, ...parties];
  }, [parties, selectedCustomer]);

  const invoiceRows = report?.invoiceRows ?? [];
  const customerRows = report?.customerRows ?? [];

  const summaryCards = report
    ? [
        { id: 'customer-count', defaultMessage: 'Customers', value: report.customerCount, isCount: true },
        { id: 'invoice-count', defaultMessage: 'Invoices', value: report.invoiceCount, isCount: true },
        { id: 'outstanding-invoices-total', defaultMessage: 'Outstanding invoices', value: report.totalOutstandingInvoices },
        { id: 'unallocated-customer-credit', defaultMessage: 'Customer credits', value: report.totalUnallocatedCustomerCredit },
        { id: 'net-receivable', defaultMessage: 'Net receivable', value: report.netReceivable },
        { id: 'overdue-amount', defaultMessage: 'Overdue amount', value: report.overdueAmount },
        { id: 'reconciliation-difference', defaultMessage: 'Reconciliation difference', value: report.reconciliationDifference },
        { id: 'overdue-customers', defaultMessage: 'Overdue customers', value: report.overdueCustomerCount, isCount: true }
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
              <FormattedMessage id="customer-aging-empty-invoices" defaultMessage="No overdue or open invoices matched the selected filters." />
            </Typography>
          </TableCell>
        </TableRow>
      );
    }

    return invoiceRows.map((row: CustomerReceivablesAgingInvoiceRowDto) => (
      <TableRow key={row.salesInvoiceId} hover sx={{ bgcolor: row.hasIntegrityWarning ? 'warning.lighter' : undefined }}>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>
          <Stack spacing={0.5}>
            <Typography variant="body2" fontWeight={700}>
              {row.invoiceNumber}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {row.customerCode}
            </Typography>
          </Stack>
        </TableCell>
        <TableCell>
          <Stack spacing={0.5}>
            <Typography variant="body2" fontWeight={700}>
              {row.customerArabicName}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {row.customerEnglishName || row.customerCode}
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
        <TableCell align="right">{formatAmount(intl.locale, row.appliedSalesReturns)}</TableCell>
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
            <Button component={Link} to={buildInvoiceUrl(row.salesInvoiceId)} size="small" variant="outlined" startIcon={<IconArrowRight size={16} />}>
              <FormattedMessage id="invoice" defaultMessage="Invoice" />
            </Button>
            <Button component={Link} to={buildPartyUrl(row.customerId)} size="small" variant="text">
              <FormattedMessage id="customer" defaultMessage="Customer" />
            </Button>
          </Stack>
        </TableCell>
      </TableRow>
    ));
  };

  const renderCustomerRows = () => {
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

    if (customerRows.length === 0) {
      return (
        <TableRow>
          <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
            <Typography color="text.secondary">
              <FormattedMessage id="customer-aging-empty-customers" defaultMessage="No customer balances matched the selected filters." />
            </Typography>
          </TableCell>
        </TableRow>
      );
    }

    return customerRows.map((row: CustomerReceivablesAgingCustomerRowDto) => (
      <TableRow key={row.customerId} hover sx={{ bgcolor: row.hasIntegrityWarnings ? 'warning.lighter' : undefined }}>
        <TableCell>{row.customerCode}</TableCell>
        <TableCell>
          <Stack spacing={0.5}>
            <Typography variant="body2" fontWeight={700}>
              {row.customerArabicName}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {row.customerEnglishName || row.customerCode}
            </Typography>
          </Stack>
        </TableCell>
        <TableCell align="right">{row.invoiceCount}</TableCell>
        <TableCell align="right">{formatAmount(intl.locale, row.totalOutstandingInvoices)}</TableCell>
        <TableCell align="right">{formatAmount(intl.locale, row.customerCreditBalance)}</TableCell>
        <TableCell align="right">
          <Typography fontWeight={700} color={row.netReceivable < 0 ? 'error.main' : 'success.main'}>
            {formatAmount(intl.locale, row.netReceivable)}
          </Typography>
        </TableCell>
        <TableCell align="center">
          <Stack direction="row" spacing={1} justifyContent="center" flexWrap="wrap">
            <Chip size="small" variant="outlined" label={row.hasOverdueInvoices ? intl.formatMessage({ id: 'overdue', defaultMessage: 'Overdue' }) : intl.formatMessage({ id: 'current', defaultMessage: 'Current' })} />
            <Button component={Link} to={buildPartyStatementUrl(row.customerId, report?.asOfDate ?? params.asOfDate ?? firstDay)} size="small" variant="outlined" startIcon={<IconArrowRight size={16} />}>
              <FormattedMessage id="statement" defaultMessage="Statement" />
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
        heading="customer-receivables-aging-report"
        links={[
          { title: 'general-ledger', to: '/accounting' },
          { title: 'accounting-reports', to: '/accounting/reports/general-ledger' },
          { title: 'customer-receivables-aging-report' }
        ]}
      />

      <Stack spacing={3}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 2, flexWrap: 'wrap' }}>
          <Box>
            <PageTitle>
              <FormattedMessage id="customer-receivables-aging-report" defaultMessage="Customer Receivables Aging" />
            </PageTitle>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              <FormattedMessage
                id="customer-receivables-aging-description"
                defaultMessage="Track open customer balances, aging buckets, and reconciliation to the mapped Customer Control account."
              />
            </Typography>
          </Box>
          {report?.customerControlAccountingAccountCode && (
            <Chip
              variant="outlined"
              label={`${report.customerControlAccountingAccountCode} - ${report.customerControlAccountingAccountArabicName || ''}`.trim()}
            />
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
                label={<FormattedMessage id="customer" defaultMessage="Customer" />}
                value={params.customerId ?? ''}
                onChange={(event) => setParams((current) => ({ ...current, customerId: event.target.value || undefined, page: 1 }))}
              >
                <MenuItem value="">
                  <FormattedMessage id="all-customers" defaultMessage="All customers" />
                </MenuItem>
                {customersLoading && (
                  <MenuItem value="" disabled>
                    <FormattedMessage id="loading" defaultMessage="Loading..." />
                  </MenuItem>
                )}
                {customerOptions.map((customer) => (
                  <MenuItem key={customer.id} value={customer.id}>
                    {customer.code} - {customer.nameArabic}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} md={2.4}>
              <TextField
                fullWidth
                label={<FormattedMessage id="customer-search" defaultMessage="Customer search" />}
                value={customerLookupSearch}
                onChange={(event) => setCustomerLookupSearch(event.target.value)}
                helperText={<FormattedMessage id="customer-search-helper" defaultMessage="Filter the customer selector by code or Arabic name." />}
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
                    checked={params.includeCustomerCredits ?? false}
                    onChange={(event) => setParams((current) => ({ ...current, includeCustomerCredits: event.target.checked, page: 1 }))}
                  />
                }
                label={<FormattedMessage id="include-customer-credits" defaultMessage="Include customer credits" />}
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
            {error instanceof Error ? error.message : intl.formatMessage({ id: 'customer-aging-load-error', defaultMessage: 'Unable to load the customer receivables aging report.' })}
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
              <Chip variant="outlined" label={`${intl.formatMessage({ id: 'customer-control', defaultMessage: 'Customer control' })}: ${report.customerControlAccountingAccountCode || '-'}`} />
            </Stack>

            {report.isReconciled ? (
              <Alert severity="success">
                <FormattedMessage id="customer-aging-reconciled-message" defaultMessage="The receivables aging report reconciles to the mapped Customer Control ledger balance." />
              </Alert>
            ) : (
              <Alert severity="warning">
                <FormattedMessage id="customer-aging-not-reconciled-message" defaultMessage="The aging report does not fully reconcile to the mapped Customer Control ledger balance." />
              </Alert>
            )}

            {report.hasIntegrityWarnings && (
              <Alert severity="warning">
                <FormattedMessage id="customer-aging-integrity-warning" defaultMessage="One or more invoices or receipts require attention because of an integrity warning." />
              </Alert>
            )}

            {!report.invoiceRows.length && !report.customerRows.length && (
              <Alert severity="info">
                <FormattedMessage id="customer-aging-empty-period" defaultMessage="No open customer receivables were found for the selected filters." />
              </Alert>
            )}

            <MainCard
              title={
                <Stack direction="row" spacing={1.5} alignItems="center" justifyContent="space-between" flexWrap="wrap">
                  <Stack direction="row" spacing={1} alignItems="center">
                    <IconFileInvoice size={18} />
                    <Typography variant="h6" component="span">
                      <FormattedMessage id="customer-aging-invoice-rows" defaultMessage="Invoice aging rows" />
                    </Typography>
                    <Chip size="small" variant="outlined" label={report.invoiceRows.length.toString()} />
                  </Stack>
                  <Typography variant="subtitle1" fontWeight={800}>
                    {formatAmount(intl.locale, report.netReceivable)}
                  </Typography>
                </Stack>
              }
              contentSX={{ p: 0 }}
            >
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell><FormattedMessage id="invoice-number" defaultMessage="Invoice" /></TableCell>
                    <TableCell><FormattedMessage id="customer" defaultMessage="Customer" /></TableCell>
                    <TableCell><FormattedMessage id="invoice-date" defaultMessage="Dates / status" /></TableCell>
                    <TableCell align="right"><FormattedMessage id="gross-amount" defaultMessage="Gross" /></TableCell>
                    <TableCell align="right"><FormattedMessage id="sales-returns" defaultMessage="Sales returns" /></TableCell>
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
                      <FormattedMessage id="customer-aging-customer-rows" defaultMessage="Customer rollup" />
                    </Typography>
                    <Chip size="small" variant="outlined" label={customerRows.length.toString()} />
                  </Stack>
                  <Typography variant="subtitle1" fontWeight={800}>
                    {formatAmount(intl.locale, report.customerControlLedgerBalance)}
                  </Typography>
                </Stack>
              }
              contentSX={{ p: 0 }}
            >
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell><FormattedMessage id="customer-code" defaultMessage="Code" /></TableCell>
                    <TableCell><FormattedMessage id="customer" defaultMessage="Customer" /></TableCell>
                    <TableCell align="right"><FormattedMessage id="invoice-count" defaultMessage="Invoices" /></TableCell>
                    <TableCell align="right"><FormattedMessage id="outstanding-invoices" defaultMessage="Outstanding" /></TableCell>
                    <TableCell align="right"><FormattedMessage id="customer-credits" defaultMessage="Credits" /></TableCell>
                    <TableCell align="right"><FormattedMessage id="net-receivable" defaultMessage="Net receivable" /></TableCell>
                    <TableCell align="center"><FormattedMessage id="actions" defaultMessage="Actions" /></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>{renderCustomerRows()}</TableBody>
              </Table>
            </MainCard>
          </>
        )}
      </Stack>
    </Box>
  );
}
