import { useState, useMemo } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { Link } from 'react-router-dom';

import Autocomplete from '@mui/material/Autocomplete';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Grid from '@mui/material/GridLegacy';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import MenuItem from '@mui/material/MenuItem';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';
import CancelIcon from '@mui/icons-material/Cancel';
import DraftsIcon from '@mui/icons-material/Drafts';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import ReceiptIcon from '@mui/icons-material/Receipt';
import { IconFileDescription, IconFilter, IconRefresh, IconSearch } from '@tabler/icons-react';

import Breadcrumbs from 'ui-component/extended/Breadcrumbs';
import HoverDataCard from 'ui-component/cards/HoverDataCard';
import Loader from 'ui-component/Loader';
import MainCard from 'ui-component/cards/MainCard';
import PermissionGuard from 'modules/Administration/components/PermissionGuard';
import SalesStatusChip from '../components/SalesStatusChip';
import { useSalesInvoicesReport } from '../hooks/useSales';
import { SALES_PERMISSIONS } from '../utils/sales.constants';
import { useParties } from 'modules/Parties/hooks/useParties';
import { formatTreasuryMoney } from 'modules/Treasury/utils/treasury.format';
import { getDocumentDisplayNumber } from 'shared/utils/documentDisplay';

// ----- helpers -----

function formatDate(value: string | null | undefined, locale: string) {
  if (!value) return '-';
  const d = new Date(`${value}T00:00:00`);
  return Number.isNaN(d.getTime()) ? value : d.toLocaleDateString(locale);
}

const getInitials = (name: string) => {
  if (!name) return '';
  const words = name.split(' ');
  if (words.length === 1) return words[0].substring(0, 2);
  return `${words[0][0]}${words[1][0]}`;
};

// ----- page -----

export default function SalesInvoicesReportPage() {
  const intl = useIntl();

  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');
  const [customerId, setCustomerId] = useState('');
  const [status, setStatus] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  // load customer list (server-backed, customers only)
  const { items: customers } = useParties({ page: 1, pageSize: 100, isCustomer: true, sortBy: 'nameArabic' });
  const customerLookup = useMemo(() => new Map(customers.map((c) => [c.id, c])), [customers]);

  const { report, isLoading, error, mutate } = useSalesInvoicesReport({
    page: page + 1,
    pageSize,
    search,
    customerId,
    status,
    dateFrom,
    dateTo,
    sortBy: 'invoiceDate',
    sortDirection: 'desc'
  });

  const resetFilters = () => {
    setSearch('');
    setCustomerId('');
    setStatus('');
    setDateFrom('');
    setDateTo('');
    setPage(0);
  };

  const hasFilters = !!(search || customerId || status || dateFrom || dateTo);

  const summary = report?.summary;

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 3 }}>
        <Breadcrumbs
          custom
          heading="sales-invoices-report"
          links={[{ title: 'sales', to: '/sales/invoices' }, { title: 'sales-invoices-report' }]}
        />
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography variant="h2" sx={{ fontWeight: 700, color: 'text.primary' }}>
              <FormattedMessage id="sales.reports.invoices.title" defaultMessage="Sales Invoices Report" />
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
              <FormattedMessage
                id="sales.reports.invoices.subtitle"
                defaultMessage="Analyze sales invoices, customers, and values for a selected period"
              />
            </Typography>
          </Box>
          <Tooltip title={intl.formatMessage({ id: 'app.refresh', defaultMessage: 'Refresh' })}>
            <IconButton onClick={() => mutate()} color="primary">
              <IconRefresh size={20} />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Summary Cards — four approved cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>

        {/* 1. Total Invoices */}
        <Grid item xs={12} sm={6} md={3}>
          {isLoading && !report ? (
            <Skeleton variant="rectangular" height={100} sx={{ borderRadius: 2 }} />
          ) : (
            <HoverDataCard
              title={intl.formatMessage({ id: 'sales.reports.totalInvoices', defaultMessage: 'Total Invoices' })}
              iconPrimary={ReceiptIcon}
              primary={summary?.totalInvoices ?? 0}
              secondary={intl.formatMessage({ id: 'sales.reports.allInvoices', defaultMessage: 'All matching invoices' })}
              color="primary.main"
            />
          )}
        </Grid>

        {/* 2. Posted Sales Value — one entry per currency */}
        {isLoading && !report ? (
          <Grid item xs={12} sm={6} md={3}>
            <Skeleton variant="rectangular" height={100} sx={{ borderRadius: 2 }} />
          </Grid>
        ) : summary && summary.postedSales && summary.postedSales.length > 0 ? (
          summary.postedSales.map((currencyTotal) => (
            <Grid item xs={12} sm={6} md={3} key={currencyTotal.currencyCode}>
              <HoverDataCard
                title={`${intl.formatMessage({ id: 'sales.reports.postedSales', defaultMessage: 'Posted Sales Value' })} (${currencyTotal.currencyCode})`}
                iconPrimary={AttachMoneyIcon}
                primary={formatTreasuryMoney(currencyTotal.totalValue, currencyTotal.currencyCode)}
                secondary={intl.formatMessage({ id: 'sales.reports.postedOnly', defaultMessage: 'Posted invoices only' })}
                color="success.main"
              />
            </Grid>
          ))
        ) : (
          <Grid item xs={12} sm={6} md={3}>
            <HoverDataCard
              title={intl.formatMessage({ id: 'sales.reports.postedSales', defaultMessage: 'Posted Sales Value' })}
              iconPrimary={AttachMoneyIcon}
              primary={intl.formatMessage({ id: 'sales.reports.noPostedSales', defaultMessage: '—' })}
              secondary={intl.formatMessage({ id: 'sales.reports.postedOnly', defaultMessage: 'Posted invoices only' })}
              color="success.main"
            />
          </Grid>
        )}

        {/* 3. Draft Invoices */}
        <Grid item xs={12} sm={6} md={3}>
          {isLoading && !report ? (
            <Skeleton variant="rectangular" height={100} sx={{ borderRadius: 2 }} />
          ) : (
            <HoverDataCard
              title={intl.formatMessage({ id: 'sales.reports.draftInvoices', defaultMessage: 'Draft Invoices' })}
              iconPrimary={DraftsIcon}
              primary={summary?.draftInvoices ?? 0}
              secondary={intl.formatMessage({ id: 'sales.reports.draftStatus', defaultMessage: 'Draft status' })}
              color="warning.main"
            />
          )}
        </Grid>

        {/* 4. Cancelled Invoices */}
        <Grid item xs={12} sm={6} md={3}>
          {isLoading && !report ? (
            <Skeleton variant="rectangular" height={100} sx={{ borderRadius: 2 }} />
          ) : (
            <HoverDataCard
              title={intl.formatMessage({ id: 'sales.reports.cancelledInvoices', defaultMessage: 'Cancelled Invoices' })}
              iconPrimary={CancelIcon}
              primary={summary?.cancelledInvoices ?? 0}
              secondary={intl.formatMessage({ id: 'sales.reports.cancelledStatus', defaultMessage: 'Cancelled status' })}
              color="error.main"
            />
          )}
        </Grid>

      </Grid>

      {/* Table + Filters */}
      <PermissionGuard permission={SALES_PERMISSIONS.invoicesView}>
        <MainCard
          content={false}
          title={
            <Stack direction="row" flexWrap="wrap" gap={2} alignItems="center">
              {/* Search */}
              <Box sx={{ flexGrow: 1, minWidth: { xs: '100%', sm: 260 } }}>
                <TextField
                  size="small"
                  fullWidth
                  placeholder={intl.formatMessage({ id: 'sales.reports.searchInvoices', defaultMessage: 'Search invoices...' })}
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(0); }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <IconSearch stroke={1.5} size="16px" />
                      </InputAdornment>
                    )
                  }}
                />
              </Box>

              {/* Customer autocomplete */}
              <Box sx={{ minWidth: { xs: '100%', sm: 220 }, flexGrow: 1 }}>
                <Autocomplete
                  size="small"
                  options={customers}
                  getOptionLabel={(option) => (intl.locale === 'ar' ? option.nameArabic : (option.nameEnglish || option.nameArabic)) || ''}
                  value={customerLookup.get(customerId) || null}
                  onChange={(_, newValue) => { setCustomerId(newValue?.id || ''); setPage(0); }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      placeholder={intl.formatMessage({ id: 'sales.reports.customer', defaultMessage: 'Customer' })}
                      InputProps={{
                        ...params.InputProps,
                        startAdornment: (
                          <>
                            <InputAdornment position="start">
                              <IconFilter stroke={1.5} size="16px" />
                            </InputAdornment>
                            {params.InputProps.startAdornment}
                          </>
                        )
                      }}
                    />
                  )}
                />
              </Box>

              {/* Status */}
              <TextField
                select
                size="small"
                value={status}
                onChange={(e) => { setStatus(e.target.value); setPage(0); }}
                sx={{ minWidth: { xs: '100%', sm: 150 } }}
                SelectProps={{ displayEmpty: true }}
              >
                <MenuItem value="">
                  <FormattedMessage id="sales.reports.allStatuses" defaultMessage="All Statuses" />
                </MenuItem>
                <MenuItem value="Draft">
                  <FormattedMessage id="sales.status.draft" defaultMessage="Draft" />
                </MenuItem>
                <MenuItem value="Posted">
                  <FormattedMessage id="sales.status.posted" defaultMessage="Posted" />
                </MenuItem>
                <MenuItem value="Cancelled">
                  <FormattedMessage id="sales.status.cancelled" defaultMessage="Cancelled" />
                </MenuItem>
              </TextField>

              {/* Date From */}
              <TextField
                type="date"
                size="small"
                value={dateFrom}
                onChange={(e) => { setDateFrom(e.target.value); setPage(0); }}
                label={<FormattedMessage id="app.dateFrom" defaultMessage="Date From" />}
                InputLabelProps={{ shrink: true }}
                sx={{ minWidth: { xs: '100%', sm: 150 } }}
              />

              {/* Date To */}
              <TextField
                type="date"
                size="small"
                value={dateTo}
                onChange={(e) => { setDateTo(e.target.value); setPage(0); }}
                label={<FormattedMessage id="app.dateTo" defaultMessage="Date To" />}
                InputLabelProps={{ shrink: true }}
                sx={{ minWidth: { xs: '100%', sm: 150 } }}
              />

              {/* Clear Filters */}
              {hasFilters && (
                <Button color="error" onClick={resetFilters} startIcon={<IconRefresh size={16} />}>
                  <FormattedMessage id="app.clearFilters" defaultMessage="Clear Filters" />
                </Button>
              )}
            </Stack>
          }
        >
          {isLoading && !report ? (
            <Box sx={{ p: 5 }}>
              <Loader />
            </Box>
          ) : error ? (
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <Typography color="error" gutterBottom>
                <FormattedMessage id="sales.reports.loadError" defaultMessage="Failed to load sales report." />
              </Typography>
              <Button variant="outlined" onClick={() => mutate()} startIcon={<IconRefresh size={16} />}>
                <FormattedMessage id="app.retry" defaultMessage="Retry" />
              </Button>
            </Box>
          ) : (
            <>
              <TableContainer>
                <Table sx={{ minWidth: 750 }}>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ pl: 3 }}>
                        <FormattedMessage id="sales.invoice.number" defaultMessage="Invoice No." />
                      </TableCell>
                      <TableCell>
                        <FormattedMessage id="sales.invoice.date" defaultMessage="Date" />
                      </TableCell>
                      <TableCell>
                        <FormattedMessage id="sales.invoice.customer" defaultMessage="Customer" />
                      </TableCell>
                      <TableCell align="right">
                        <FormattedMessage id="sales.reports.itemCount" defaultMessage="Items" />
                      </TableCell>
                      <TableCell align="right">
                        <FormattedMessage id="sales.invoice.total" defaultMessage="Total" />
                      </TableCell>
                      <TableCell align="center">
                        <FormattedMessage id="sales.invoice.status" defaultMessage="Status" />
                      </TableCell>
                      <TableCell align="right" sx={{ pr: 3 }}>
                        <FormattedMessage id="app.actions" defaultMessage="Actions" />
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {!report || report.rows.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} align="center" sx={{ py: 5 }}>
                          <Typography variant="subtitle1" color="textSecondary">
                            <FormattedMessage id="sales.reports.noData" defaultMessage="No sales invoices found." />
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      report.rows.map((row) => {
                        const customerName =
                          (intl.locale === 'ar' ? row.customerNameArabic : (row.customerNameEnglish || row.customerNameArabic)) ?? '';
                        return (
                          <TableRow hover key={row.invoiceId}>
                            <TableCell sx={{ pl: 3 }}>
                              <Typography variant="subtitle2">{getDocumentDisplayNumber(row.invoiceDisplayNumber, row.invoiceNumber)}</Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" dir="ltr">
                                {formatDate(row.invoiceDate, intl.locale)}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Stack direction="row" alignItems="center" spacing={1.5}>
                                <Avatar sx={{ width: 32, height: 32, fontSize: '0.8rem' }}>
                                  {getInitials(customerName)}
                                </Avatar>
                                <Typography variant="subtitle2" noWrap sx={{ maxWidth: 180 }}>
                                  {customerName}
                                </Typography>
                              </Stack>
                            </TableCell>
                            <TableCell align="right">
                              <Typography variant="body2">{row.itemCount}</Typography>
                            </TableCell>
                            <TableCell align="right">
                              <Typography variant="subtitle2" dir="ltr">
                                {formatTreasuryMoney(row.grandTotal, row.currencyCode)}
                              </Typography>
                            </TableCell>
                            <TableCell align="center">
                              <SalesStatusChip status={row.status} />
                            </TableCell>
                            <TableCell align="right" sx={{ pr: 3 }}>
                              <Tooltip title={intl.formatMessage({ id: 'sales.reports.viewInvoice', defaultMessage: 'View Invoice' })}>
                                <IconButton component={Link} to={`/sales/invoices/${row.invoiceId}`} color="primary" size="small">
                                  <IconFileDescription stroke={1.5} size="1.2rem" />
                                </IconButton>
                              </Tooltip>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
              <TablePagination
                component="div"
                count={report?.totalCount ?? 0}
                rowsPerPage={pageSize}
                page={page}
                onPageChange={(_, newPage) => setPage(newPage)}
                onRowsPerPageChange={(e) => {
                  setPageSize(parseInt(e.target.value, 10));
                  setPage(0);
                }}
                rowsPerPageOptions={[5, 10, 25, 50]}
                showFirstButton
                showLastButton
              />
            </>
          )}
        </MainCard>
      </PermissionGuard>
    </Box>
  );
}
