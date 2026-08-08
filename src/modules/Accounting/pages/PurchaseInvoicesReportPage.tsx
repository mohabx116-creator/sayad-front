import { useMemo, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { Link } from 'react-router-dom';

import Autocomplete from '@mui/material/Autocomplete';
import Avatar from '@mui/material/Avatar';
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

import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import CancelIcon from '@mui/icons-material/Cancel';
import DraftsIcon from '@mui/icons-material/Drafts';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import ReceiptIcon from '@mui/icons-material/Receipt';
import { IconFilter, IconRefresh, IconSearch } from '@tabler/icons-react';

import Breadcrumbs from 'ui-component/extended/Breadcrumbs';
import HoverDataCard from 'ui-component/cards/HoverDataCard';
import Loader from 'ui-component/Loader';
import MainCard from 'ui-component/cards/MainCard';
import PermissionGuard from 'modules/Administration/components/PermissionGuard';
import PurchaseStatusChip from 'modules/Purchases/components/PurchaseStatusChip';
import { useParties } from 'modules/Parties/hooks/useParties';
import { formatTreasuryMoney } from 'modules/Treasury/utils/treasury.format';
import { ACCOUNTING_PERMISSIONS } from '../utils/accounting.constants';
import { usePurchaseInvoicesReport } from '../hooks/useAccountingReports';

type SupplierLookupOption = {
  id: string;
  code: string;
  nameArabic: string;
  nameEnglish: string | null;
};

function formatDate(value: string | null | undefined, locale: string) {
  if (!value) {
    return '-';
  }

  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString(locale);
}

function getInitials(name: string) {
  if (!name) {
    return '';
  }

  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) {
    return '';
  }

  if (words.length === 1) {
    return words[0].slice(0, 2);
  }

  return `${words[0][0]}${words[1][0]}`.toUpperCase();
}

export default function PurchaseInvoicesReportPage() {
  const intl = useIntl();
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');
  const [supplierId, setSupplierId] = useState('');
  const [status, setStatus] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const { items: suppliers } = useParties({ page: 1, pageSize: 100, isSupplier: true, sortBy: 'nameArabic' });
  const supplierLookup = useMemo(() => new Map(suppliers.map((supplier) => [supplier.id, supplier])), [suppliers]);

  const reportParams = useMemo(
    () => ({
      page: page + 1,
      pageSize,
      search: search.trim() || undefined,
      supplierId: supplierId || undefined,
      status: status || undefined,
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined,
      sortBy: 'invoiceDate',
      sortDirection: 'desc'
    }),
    [dateFrom, dateTo, page, pageSize, search, status, supplierId]
  );

  const { report, isLoading, error, mutate } = usePurchaseInvoicesReport(reportParams);

  const selectedSupplier = useMemo<SupplierLookupOption | null>(() => {
    if (!supplierId) {
      return null;
    }

    const fromLookup = suppliers.find((supplier) => supplier.id === supplierId);
    if (fromLookup) {
      return {
        id: fromLookup.id,
        code: fromLookup.code,
        nameArabic: fromLookup.nameArabic,
        nameEnglish: fromLookup.nameEnglish
      };
    }

    const fromReport = report?.rows.find((row) => row.supplierId === supplierId);
    if (fromReport) {
      return {
        id: fromReport.supplierId,
        code: fromReport.supplierCode,
        nameArabic: fromReport.supplierNameArabic,
        nameEnglish: fromReport.supplierNameEnglish
      };
    }

    return {
      id: supplierId,
      code: supplierId,
      nameArabic: supplierId,
      nameEnglish: null
    };
  }, [report?.rows, supplierId, suppliers]);

  const supplierOptions = useMemo<SupplierLookupOption[]>(() => {
    if (!selectedSupplier) {
      return suppliers;
    }

    if (suppliers.some((supplier) => supplier.id === selectedSupplier.id)) {
      return suppliers;
    }

    return [selectedSupplier, ...suppliers];
  }, [selectedSupplier, suppliers]);

  const hasFilters = Boolean(search || supplierId || status || dateFrom || dateTo);
  const summary = report?.summary;
  const rows = report?.rows ?? [];

  const resetFilters = () => {
    setSearch('');
    setSupplierId('');
    setStatus('');
    setDateFrom('');
    setDateTo('');
    setPage(0);
  };

  return (
    <PermissionGuard permission={ACCOUNTING_PERMISSIONS.reportsView}>
      <Box>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 3 }}>
          <Breadcrumbs
            custom
            heading="purchase-invoices-report"
            links={[{ title: 'money', to: '/accounting' }, { title: 'accounting-reports', to: '/accounting/reports/general-ledger' }, { title: 'purchase-invoices-report' }]}
          />
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 2 }}>
            <Box>
              <Typography variant="h2" sx={{ fontWeight: 700, color: 'text.primary' }}>
                <FormattedMessage id="purchase-invoices-report" defaultMessage="Purchase Invoices Report" />
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
                <FormattedMessage
                  id="purchase-invoices-report-description"
                  defaultMessage="Analyze purchase invoices, suppliers, posting status, and values for a selected period."
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

        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            {isLoading && !report ? (
              <Skeleton variant="rectangular" height={100} sx={{ borderRadius: 2 }} />
            ) : (
              <HoverDataCard
                title={intl.formatMessage({ id: 'total-purchase-invoices', defaultMessage: 'Total Purchase Invoices' })}
                iconPrimary={ReceiptIcon}
                primary={summary?.totalInvoices ?? 0}
                secondary={intl.formatMessage({ id: 'sales.reports.allInvoices', defaultMessage: 'All matching invoices' })}
                color="primary.main"
              />
            )}
          </Grid>

          {isLoading && !report ? (
            <Grid item xs={12} sm={6} md={3}>
              <Skeleton variant="rectangular" height={100} sx={{ borderRadius: 2 }} />
            </Grid>
          ) : summary?.postedPurchases?.length ? (
            summary.postedPurchases.map((currencyTotal) => (
              <Grid item xs={12} sm={6} md={3} key={currencyTotal.currencyCode}>
                <HoverDataCard
                  title={`${intl.formatMessage({ id: 'purchase-invoices-report.postedPurchases', defaultMessage: 'Posted Purchases' })} (${currencyTotal.currencyCode})`}
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
                title={intl.formatMessage({ id: 'purchase-invoices-report.postedPurchases', defaultMessage: 'Posted Purchases' })}
                iconPrimary={AttachMoneyIcon}
                primary={intl.formatMessage({ id: 'sales.reports.noPostedSales', defaultMessage: '—' })}
                secondary={intl.formatMessage({ id: 'sales.reports.postedOnly', defaultMessage: 'Posted invoices only' })}
                color="success.main"
              />
            </Grid>
          )}

          <Grid item xs={12} sm={6} md={3}>
            {isLoading && !report ? (
              <Skeleton variant="rectangular" height={100} sx={{ borderRadius: 2 }} />
            ) : (
              <HoverDataCard
                title={intl.formatMessage({ id: 'draft-purchase-invoices', defaultMessage: 'Draft Invoices' })}
                iconPrimary={DraftsIcon}
                primary={summary?.draftInvoices ?? 0}
                secondary={intl.formatMessage({ id: 'sales.reports.draftStatus', defaultMessage: 'Draft status' })}
                color="warning.main"
              />
            )}
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            {isLoading && !report ? (
              <Skeleton variant="rectangular" height={100} sx={{ borderRadius: 2 }} />
            ) : (
              <HoverDataCard
                title={intl.formatMessage({ id: 'cancelled-purchase-invoices', defaultMessage: 'Cancelled Invoices' })}
                iconPrimary={CancelIcon}
                primary={summary?.cancelledInvoices ?? 0}
                secondary={intl.formatMessage({ id: 'sales.reports.cancelledStatus', defaultMessage: 'Cancelled status' })}
                color="error.main"
              />
            )}
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            {isLoading && !report ? (
              <Skeleton variant="rectangular" height={100} sx={{ borderRadius: 2 }} />
            ) : (
              <HoverDataCard
                title={intl.formatMessage({ id: 'purchase-invoices-report.uniqueSuppliers', defaultMessage: 'Unique Suppliers' })}
                iconPrimary={PeopleAltIcon}
                primary={summary?.uniqueSuppliers ?? 0}
                secondary={intl.formatMessage({
                  id: 'purchase-invoices-report.uniqueSuppliersSecondary',
                  defaultMessage: 'Suppliers with matching invoices'
                })}
                color="info.main"
              />
            )}
          </Grid>
        </Grid>

        <MainCard
          content={false}
          title={
            <Stack direction="row" flexWrap="wrap" gap={2} alignItems="center">
                <Box sx={{ flexGrow: 1, minWidth: { xs: '100%', sm: 260 } }}>
                  <TextField
                    size="small"
                    fullWidth
                    placeholder={intl.formatMessage({ id: 'sales.reports.searchInvoices', defaultMessage: 'Search invoices...' })}
                    value={search}
                    onChange={(event) => {
                      setSearch(event.target.value);
                      setPage(0);
                    }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <IconSearch stroke={1.5} size="16px" />
                        </InputAdornment>
                      )
                    }}
                  />
                </Box>

                <Box sx={{ minWidth: { xs: '100%', sm: 220 }, flexGrow: 1 }}>
                  <Autocomplete
                    size="small"
                    options={supplierOptions}
                    getOptionLabel={(option) =>
                      (intl.locale === 'ar' ? option.nameArabic : option.nameEnglish || option.nameArabic) || ''
                    }
                    value={supplierLookup.get(supplierId) || selectedSupplier || null}
                    onChange={(_, newValue) => {
                      setSupplierId(newValue?.id || '');
                      setPage(0);
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        placeholder={intl.formatMessage({ id: 'supplier', defaultMessage: 'Supplier' })}
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

                <TextField
                  select
                  size="small"
                  value={status}
                  onChange={(event) => {
                    setStatus(event.target.value);
                    setPage(0);
                  }}
                  sx={{ minWidth: { xs: '100%', sm: 150 } }}
                  SelectProps={{ displayEmpty: true }}
                >
                  <MenuItem value="">
                    <FormattedMessage id="sales.reports.allStatuses" defaultMessage="All statuses" />
                  </MenuItem>
                  <MenuItem value="Draft">
                    <FormattedMessage id="purchases.status.draft" defaultMessage="Draft" />
                  </MenuItem>
                  <MenuItem value="Posted">
                    <FormattedMessage id="purchases.status.posted" defaultMessage="Posted" />
                  </MenuItem>
                  <MenuItem value="Cancelled">
                    <FormattedMessage id="purchases.status.cancelled" defaultMessage="Cancelled" />
                  </MenuItem>
                </TextField>

                <TextField
                  type="date"
                  size="small"
                  value={dateFrom}
                  onChange={(event) => {
                    setDateFrom(event.target.value);
                    setPage(0);
                  }}
                  label={<FormattedMessage id="app.dateFrom" defaultMessage="Date From" />}
                  InputLabelProps={{ shrink: true }}
                  sx={{ minWidth: { xs: '100%', sm: 150 } }}
                />

                <TextField
                  type="date"
                  size="small"
                  value={dateTo}
                  onChange={(event) => {
                    setDateTo(event.target.value);
                    setPage(0);
                  }}
                  label={<FormattedMessage id="app.dateTo" defaultMessage="Date To" />}
                  InputLabelProps={{ shrink: true }}
                  sx={{ minWidth: { xs: '100%', sm: 150 } }}
                />

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
                  <FormattedMessage id="purchase-invoices-report.loadError" defaultMessage="Failed to load purchase report." />
                </Typography>
                <Button variant="outlined" onClick={() => mutate()} startIcon={<IconRefresh size={16} />}>
                  <FormattedMessage id="app.retry" defaultMessage="Retry" />
                </Button>
              </Box>
            ) : (
              <>
                <TableContainer>
                  <Table sx={{ minWidth: 980 }}>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ pl: 3 }}>
                          <FormattedMessage id="invoice-number" defaultMessage="Invoice No." />
                        </TableCell>
                        <TableCell>
                          <FormattedMessage id="invoice-date" defaultMessage="Date" />
                        </TableCell>
                        <TableCell>
                          <FormattedMessage id="supplier" defaultMessage="Supplier" />
                        </TableCell>
                        <TableCell align="right">
                          <FormattedMessage id="purchase-invoices-report.lineCount" defaultMessage="Lines" />
                        </TableCell>
                        <TableCell align="right">
                          <FormattedMessage id="grand-total" defaultMessage="Grand Total" />
                        </TableCell>
                        <TableCell align="right">
                          <FormattedMessage id="paid-amount" defaultMessage="Paid amount" />
                        </TableCell>
                        <TableCell align="right">
                          <FormattedMessage id="purchase-invoices-report.remainingAmount" defaultMessage="Remaining Amount" />
                        </TableCell>
                        <TableCell align="center">
                          <FormattedMessage id="currency" defaultMessage="Currency" />
                        </TableCell>
                        <TableCell align="center">
                          <FormattedMessage id="status" defaultMessage="Status" />
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {!report || rows.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={9} align="center" sx={{ py: 5 }}>
                            <Typography variant="subtitle1" color="textSecondary">
                              <FormattedMessage
                                id="purchase-invoices-report.noData"
                                defaultMessage="No purchase invoices found."
                              />
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ) : (
                        rows.map((row) => {
                          const invoiceId = row.purchaseInvoiceId || row.invoiceId || row.invoiceNumber;
                          const supplierName =
                            (intl.locale === 'ar'
                              ? row.supplierNameArabic
                              : row.supplierNameEnglish || row.supplierNameArabic) ?? '';

                          return (
                            <TableRow hover key={invoiceId}>
                              <TableCell sx={{ pl: 3 }}>
                                <Typography
                                  component={Link}
                                  to={`/purchases/invoices/${invoiceId}`}
                                  color="primary"
                                  sx={{ textDecoration: 'none', fontWeight: 600 }}
                                >
                                  {row.invoiceNumber}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Typography variant="body2" dir="ltr">
                                  {formatDate(row.invoiceDate, intl.locale)}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Stack direction="row" alignItems="center" spacing={1.5}>
                                  <Avatar sx={{ width: 32, height: 32, fontSize: '0.8rem' }}>{getInitials(supplierName)}</Avatar>
                                  <Box sx={{ minWidth: 0 }}>
                                    <Typography variant="subtitle2" noWrap sx={{ maxWidth: 220 }}>
                                      {supplierName}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary" noWrap>
                                      {row.supplierCode}
                                    </Typography>
                                  </Box>
                                </Stack>
                              </TableCell>
                              <TableCell align="right">
                                <Typography variant="body2">{row.lineCount}</Typography>
                              </TableCell>
                              <TableCell align="right">
                                <Typography variant="subtitle2" dir="ltr">
                                  {formatTreasuryMoney(row.grandTotal, row.currencyCode)}
                                </Typography>
                              </TableCell>
                              <TableCell align="right">
                                <Typography variant="body2" dir="ltr">
                                  {row.paidAmount === null || row.paidAmount === undefined
                                    ? '-'
                                    : formatTreasuryMoney(row.paidAmount, row.currencyCode)}
                                </Typography>
                              </TableCell>
                              <TableCell align="right">
                                <Typography
                                  variant="body2"
                                  dir="ltr"
                                  color={row.remainingAmount !== null && row.remainingAmount > 0 ? 'error.main' : 'text.primary'}
                                  fontWeight={700}
                                >
                                  {row.remainingAmount === null || row.remainingAmount === undefined
                                    ? '-'
                                    : formatTreasuryMoney(row.remainingAmount, row.currencyCode)}
                                </Typography>
                              </TableCell>
                              <TableCell align="center">
                                <Typography variant="body2" dir="ltr">
                                  {row.currencyCode}
                                </Typography>
                              </TableCell>
                              <TableCell align="center">
                                <PurchaseStatusChip status={row.status} />
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
                  onRowsPerPageChange={(event) => {
                    setPageSize(parseInt(event.target.value, 10));
                    setPage(0);
                  }}
                  rowsPerPageOptions={[5, 10, 25, 50]}
                  showFirstButton
                  showLastButton
                />
              </>
            )}
        </MainCard>
      </Box>
    </PermissionGuard>
  );
}
