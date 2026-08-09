import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { FormattedMessage, useIntl } from 'react-intl';

import Alert from '@mui/material/Alert';
import Autocomplete from '@mui/material/Autocomplete';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/GridLegacy';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
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
import CategoryIcon from '@mui/icons-material/Category';
import PercentIcon from '@mui/icons-material/Percent';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import ReceiptIcon from '@mui/icons-material/Receipt';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { IconFilter, IconRefresh, IconSearch } from '@tabler/icons-react';

import Breadcrumbs from 'ui-component/extended/Breadcrumbs';
import HoverDataCard from 'ui-component/cards/HoverDataCard';
import Loader from 'ui-component/Loader';
import MainCard from 'ui-component/cards/MainCard';
import PermissionGuard from 'modules/Administration/components/PermissionGuard';
import { useParties } from 'modules/Parties/hooks/useParties';
import { useInventoryItems } from 'modules/Inventory/hooks/useInventory';
import { formatTreasuryMoney } from 'modules/Treasury/utils/treasury.format';
import { ACCOUNTING_PERMISSIONS } from '../utils/accounting.constants';
import { useSalesProfitabilityReport } from '../hooks/useAccountingReports';

type LookupOption = {
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

function formatNumber(locale: string, value: number, digits = 2) {
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits
  }).format(value);
}

function formatPercent(locale: string, value: number) {
  return `${formatNumber(locale, value, 2)}%`;
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
    return words[0].slice(0, 2).toUpperCase();
  }

  return `${words[0][0]}${words[1][0]}`.toUpperCase();
}

function getDisplayName(locale: string, nameArabic: string, nameEnglish?: string | null) {
  return (locale === 'ar' ? nameArabic : nameEnglish || nameArabic) || '';
}

export default function SalesProfitabilityReportPage() {
  const intl = useIntl();
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');
  const [customerId, setCustomerId] = useState('');
  const [itemId, setItemId] = useState('');
  const [currencyCode, setCurrencyCode] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const { items: customers } = useParties({ page: 1, pageSize: 100, isCustomer: true, sortBy: 'nameArabic' });
  const { items: inventoryItems } = useInventoryItems({ page: 1, pageSize: 100, sortBy: 'nameArabic' });

  const customerLookup = useMemo(
    () =>
      new Map(
        customers.map((customer) => [
          customer.id,
          {
            id: customer.id,
            code: customer.code,
            nameArabic: customer.nameArabic,
            nameEnglish: customer.nameEnglish ?? null
          } satisfies LookupOption
        ])
      ),
    [customers]
  );
  const itemLookup = useMemo(
    () =>
      new Map(
        inventoryItems.map((item) => [
          item.id,
          {
            id: item.id,
            code: item.code,
            nameArabic: item.nameArabic,
            nameEnglish: item.nameEnglish ?? null
          } satisfies LookupOption
        ])
      ),
    [inventoryItems]
  );

  const reportParams = useMemo(
    () => ({
      page: page + 1,
      pageSize,
      search: search.trim() || undefined,
      customerId: customerId || undefined,
      itemId: itemId || undefined,
      currencyCode: currencyCode.trim().toUpperCase() || undefined,
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined,
      sortBy: 'invoiceDate',
      sortDirection: 'desc'
    }),
    [currencyCode, customerId, dateFrom, dateTo, itemId, page, pageSize, search]
  );

  const { report, isLoading, error, mutate } = useSalesProfitabilityReport(reportParams);

  const selectedCustomer = useMemo<LookupOption | null>(() => {
    if (!customerId) {
      return null;
    }

    const fromLookup = customers.find((customer) => customer.id === customerId);
    if (fromLookup) {
      return {
        id: fromLookup.id,
        code: fromLookup.code,
        nameArabic: fromLookup.nameArabic,
        nameEnglish: fromLookup.nameEnglish ?? null
      };
    }

    const fromReport = report?.rows.find((row) => row.customerId === customerId);
    if (fromReport) {
      return {
        id: fromReport.customerId,
        code: fromReport.customerCode,
        nameArabic: fromReport.customerNameArabic,
        nameEnglish: fromReport.customerNameEnglish
      };
    }

    return {
      id: customerId,
      code: customerId,
      nameArabic: customerId,
      nameEnglish: null
    };
  }, [customerId, customers, report?.rows]);

  const selectedItem = useMemo<LookupOption | null>(() => {
    if (!itemId) {
      return null;
    }

    const fromLookup = inventoryItems.find((item) => item.id === itemId);
    if (fromLookup) {
      return {
        id: fromLookup.id,
        code: fromLookup.code,
        nameArabic: fromLookup.nameArabic,
        nameEnglish: fromLookup.nameEnglish ?? null
      };
    }

    const fromReport = report?.rows.find((row) => row.itemId === itemId);
    if (fromReport) {
      return {
        id: fromReport.itemId,
        code: fromReport.itemCode,
        nameArabic: fromReport.itemNameArabic,
        nameEnglish: fromReport.itemNameEnglish
      };
    }

    return {
      id: itemId,
      code: itemId,
      nameArabic: itemId,
      nameEnglish: null
    };
  }, [inventoryItems, itemId, report?.rows]);

  const customerOptions = useMemo<LookupOption[]>(() => {
    const normalizedCustomers: LookupOption[] = customers.map((customer) => ({
      id: customer.id,
      code: customer.code,
      nameArabic: customer.nameArabic,
      nameEnglish: customer.nameEnglish ?? null
    }));

    if (!selectedCustomer) {
      return normalizedCustomers;
    }

    if (normalizedCustomers.some((customer) => customer.id === selectedCustomer.id)) {
      return normalizedCustomers;
    }

    return [selectedCustomer, ...normalizedCustomers];
  }, [customers, selectedCustomer]);

  const itemOptions = useMemo<LookupOption[]>(() => {
    const normalizedItems: LookupOption[] = inventoryItems.map((item) => ({
      id: item.id,
      code: item.code,
      nameArabic: item.nameArabic,
      nameEnglish: item.nameEnglish ?? null
    }));

    if (!selectedItem) {
      return normalizedItems;
    }

    if (normalizedItems.some((item) => item.id === selectedItem.id)) {
      return normalizedItems;
    }

    return [selectedItem, ...normalizedItems];
  }, [inventoryItems, selectedItem]);

  const summary = report?.summary;
  const rows = report?.rows ?? [];
  const hasFilters = Boolean(search || customerId || itemId || currencyCode || dateFrom || dateTo);
  const showCoverageWarning = (summary?.uncostedLines ?? 0) > 0;

  const resetFilters = () => {
    setSearch('');
    setCustomerId('');
    setItemId('');
    setCurrencyCode('');
    setDateFrom('');
    setDateTo('');
    setPage(0);
  };

  const unavailableLabel = intl.formatMessage({
    id: 'sales-profitability-report.costUnavailable',
    defaultMessage: 'Cost unavailable'
  });

  const renderCurrencyCards = (
    items: { currencyCode: string; totalValue: number }[] | undefined,
    titleId: string,
    defaultTitle: string,
    secondaryId: string,
    secondaryDefault: string,
    color: 'primary.main' | 'success.main' | 'warning.main'
  ) => {
    if (isLoading && !report) {
      return (
        <Grid item xs={12} sm={6} md={4}>
          <Skeleton variant="rectangular" height={100} sx={{ borderRadius: 2 }} />
        </Grid>
      );
    }

    if (items && items.length > 0) {
      return items.map((currencyTotal) => (
        <Grid item xs={12} sm={6} md={4} key={`${titleId}-${currencyTotal.currencyCode}`}>
          <HoverDataCard
            title={`${intl.formatMessage({ id: titleId, defaultMessage: defaultTitle })} (${currencyTotal.currencyCode})`}
            iconPrimary={AttachMoneyIcon}
            primary={formatTreasuryMoney(currencyTotal.totalValue, currencyTotal.currencyCode)}
            secondary={intl.formatMessage({ id: secondaryId, defaultMessage: secondaryDefault })}
            color={color}
          />
        </Grid>
      ));
    }

    return (
      <Grid item xs={12} sm={6} md={4}>
        <HoverDataCard
          title={intl.formatMessage({ id: titleId, defaultMessage: defaultTitle })}
          iconPrimary={AttachMoneyIcon}
          primary={intl.formatMessage({ id: 'sales.reports.noPostedSales', defaultMessage: '—' })}
          secondary={intl.formatMessage({ id: secondaryId, defaultMessage: secondaryDefault })}
          color={color}
        />
      </Grid>
    );
  };

  const renderValue = (
    value: number | null | undefined,
    kind: 'money' | 'number' | 'percent' | 'unit',
    currencyCodeValue?: string
  ) => {
    if (value === null || value === undefined) {
      return (
        <Typography variant="body2" color="warning.main" fontWeight={600}>
          {unavailableLabel}
        </Typography>
      );
    }

    if (kind === 'money') {
      return (
        <Typography variant="subtitle2" dir="ltr">
          {formatTreasuryMoney(value, currencyCodeValue || 'EGP')}
        </Typography>
      );
    }

    if (kind === 'percent') {
      return (
        <Typography variant="body2" dir="ltr">
          {formatPercent(intl.locale, value)}
        </Typography>
      );
    }

    return (
      <Typography variant="body2" dir="ltr">
        {formatNumber(intl.locale, value, kind === 'unit' ? 6 : 2)}
      </Typography>
    );
  };

  return (
    <PermissionGuard permission={ACCOUNTING_PERMISSIONS.reportsView}>
      <Box>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 3 }}>
          <Breadcrumbs
            custom
            heading="sales-profitability-report"
            links={[
              { title: 'money', to: '/accounting' },
              { title: 'accounting-reports', to: '/accounting/reports/general-ledger' },
              { title: 'sales-profitability-report' }
            ]}
          />
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 2 }}>
            <Box>
              <Typography variant="h2" sx={{ fontWeight: 700, color: 'text.primary' }}>
                <FormattedMessage id="sales-profitability-report" defaultMessage="Sales Profitability Report" />
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
                <FormattedMessage
                  id="sales-profitability-report-description"
                  defaultMessage="Review posted sales profitability using historical cost snapshots and explicit coverage indicators."
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
                title={intl.formatMessage({ id: 'sales-profitability-report.totalInvoices', defaultMessage: 'Total Invoices' })}
                iconPrimary={ReceiptIcon}
                primary={summary?.totalInvoices ?? 0}
                secondary={intl.formatMessage({
                  id: 'sales-profitability-report.totalInvoicesSecondary',
                  defaultMessage: 'Posted sales invoices only'
                })}
                color="primary.main"
              />
            )}
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            {isLoading && !report ? (
              <Skeleton variant="rectangular" height={100} sx={{ borderRadius: 2 }} />
            ) : (
              <HoverDataCard
                title={intl.formatMessage({ id: 'sales-profitability-report.uniqueCustomers', defaultMessage: 'Unique Customers' })}
                iconPrimary={PeopleAltIcon}
                primary={summary?.uniqueCustomers ?? 0}
                secondary={intl.formatMessage({
                  id: 'sales-profitability-report.uniqueCustomersSecondary',
                  defaultMessage: 'Customers with matching rows'
                })}
                color="info.main"
              />
            )}
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            {isLoading && !report ? (
              <Skeleton variant="rectangular" height={100} sx={{ borderRadius: 2 }} />
            ) : (
              <HoverDataCard
                title={intl.formatMessage({ id: 'sales-profitability-report.uniqueItems', defaultMessage: 'Unique Items' })}
                iconPrimary={CategoryIcon}
                primary={summary?.uniqueItems ?? 0}
                secondary={intl.formatMessage({
                  id: 'sales-profitability-report.uniqueItemsSecondary',
                  defaultMessage: 'Items appearing in the report'
                })}
                color="secondary.main"
              />
            )}
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            {isLoading && !report ? (
              <Skeleton variant="rectangular" height={100} sx={{ borderRadius: 2 }} />
            ) : (
              <HoverDataCard
                title={intl.formatMessage({ id: 'sales-profitability-report.totalLines', defaultMessage: 'Total Lines' })}
                iconPrimary={ReceiptIcon}
                primary={summary?.totalLines ?? 0}
                secondary={intl.formatMessage({
                  id: 'sales-profitability-report.totalLinesSecondary',
                  defaultMessage: 'All matching invoice lines'
                })}
                color="primary.main"
              />
            )}
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            {isLoading && !report ? (
              <Skeleton variant="rectangular" height={100} sx={{ borderRadius: 2 }} />
            ) : (
              <HoverDataCard
                title={intl.formatMessage({ id: 'sales-profitability-report.costedLines', defaultMessage: 'Costed Lines' })}
                iconPrimary={AttachMoneyIcon}
                primary={summary?.costedLines ?? 0}
                secondary={intl.formatMessage({
                  id: 'sales-profitability-report.costedLinesSecondary',
                  defaultMessage: 'Lines with known historical cost'
                })}
                color="success.main"
              />
            )}
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            {isLoading && !report ? (
              <Skeleton variant="rectangular" height={100} sx={{ borderRadius: 2 }} />
            ) : (
              <HoverDataCard
                title={intl.formatMessage({ id: 'sales-profitability-report.uncostedLines', defaultMessage: 'Uncosted Lines' })}
                iconPrimary={ErrorOutlineIcon}
                primary={summary?.uncostedLines ?? 0}
                secondary={intl.formatMessage({
                  id: 'sales-profitability-report.uncostedLinesSecondary',
                  defaultMessage: 'Lines without historical cost'
                })}
                color="warning.main"
              />
            )}
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            {isLoading && !report ? (
              <Skeleton variant="rectangular" height={100} sx={{ borderRadius: 2 }} />
            ) : (
              <HoverDataCard
                title={intl.formatMessage({ id: 'sales-profitability-report.costCoveragePercent', defaultMessage: 'Cost Coverage' })}
                iconPrimary={PercentIcon}
                primary={summary ? formatPercent(intl.locale, summary.costCoveragePercent) : '—'}
                secondary={intl.formatMessage({
                  id: 'sales-profitability-report.costCoveragePercentSecondary',
                  defaultMessage: 'Costed lines divided by total lines'
                })}
                color={(summary?.uncostedLines ?? 0) > 0 ? 'warning.main' : 'success.main'}
              />
            )}
          </Grid>
        </Grid>

        {showCoverageWarning && summary && (
          <Box sx={{ mb: 3 }}>
            <Alert severity="warning" variant="outlined">
              <Stack spacing={0.5}>
                <Typography variant="subtitle2" fontWeight={700}>
                  <FormattedMessage
                    id="sales-profitability-report.costCoverageWarningTitle"
                    defaultMessage="Partial profit coverage"
                  />
                </Typography>
                <Typography variant="body2">
                  <FormattedMessage
                    id="sales-profitability-report.costCoverageWarning"
                    defaultMessage="Profit totals cover only the lines with known historical cost. They are not full company profit totals."
                  />
                </Typography>
              </Stack>
            </Alert>
          </Box>
        )}

        <Grid container spacing={3} sx={{ mb: 3 }}>
          {renderCurrencyCards(
            summary?.totalSalesPerCurrency,
            'sales-profitability-report.totalSalesPerCurrency',
            'Total Sales',
            'sales-profitability-report.totalSalesPerCurrencySecondary',
            'Posted sales grouped by currency',
            'primary.main'
          )}
        </Grid>

        <Grid container spacing={3} sx={{ mb: 3 }}>
          {renderCurrencyCards(
            summary?.knownCostPerCurrency,
            'sales-profitability-report.knownCostPerCurrency',
            'Known Cost',
            'sales-profitability-report.knownCostPerCurrencySecondary',
            'Costed lines grouped by currency',
            'warning.main'
          )}
        </Grid>

        <Grid container spacing={3} sx={{ mb: 3 }}>
          {renderCurrencyCards(
            summary?.knownGrossProfitPerCurrency,
            'sales-profitability-report.knownGrossProfitPerCurrency',
            'Known Gross Profit',
            'sales-profitability-report.knownGrossProfitPerCurrencySecondary',
            'Profit from costed lines only',
            'success.main'
          )}
        </Grid>

        <MainCard
          content={false}
          title={
            <Stack direction="row" flexWrap="wrap" gap={2} alignItems="center">
              <Box sx={{ flexGrow: 1, minWidth: { xs: '100%', sm: 260 } }}>
                <TextField
                  size="small"
                  fullWidth
                  placeholder={intl.formatMessage({
                    id: 'sales-profitability-report.searchPlaceholder',
                    defaultMessage: 'Search profitability...'
                  })}
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

              <Box sx={{ minWidth: { xs: '100%', sm: 240 }, flexGrow: 1 }}>
                <Autocomplete
                  size="small"
                  options={customerOptions}
                  getOptionLabel={(option) => `${option.code} - ${getDisplayName(intl.locale, option.nameArabic, option.nameEnglish)}`}
                  value={customerLookup.get(customerId) || selectedCustomer || null}
                  onChange={(_, newValue) => {
                    setCustomerId(newValue?.id || '');
                    setPage(0);
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      placeholder={intl.formatMessage({ id: 'customer', defaultMessage: 'Customer' })}
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

              <Box sx={{ minWidth: { xs: '100%', sm: 240 }, flexGrow: 1 }}>
                <Autocomplete
                  size="small"
                  options={itemOptions}
                  getOptionLabel={(option) => `${option.code} - ${getDisplayName(intl.locale, option.nameArabic, option.nameEnglish)}`}
                  value={itemLookup.get(itemId) || selectedItem || null}
                  onChange={(_, newValue) => {
                    setItemId(newValue?.id || '');
                    setPage(0);
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      placeholder={intl.formatMessage({ id: 'item', defaultMessage: 'Item' })}
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
                size="small"
                value={currencyCode}
                onChange={(event) => {
                  setCurrencyCode(event.target.value);
                  setPage(0);
                }}
                sx={{ minWidth: { xs: '100%', sm: 130 } }}
                label={<FormattedMessage id="currency-code" defaultMessage="Currency Code" />}
                placeholder="EGP"
              />

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
                <FormattedMessage
                  id="sales-profitability-report.loadError"
                  defaultMessage="Failed to load sales profitability report."
                />
              </Typography>
              <Button variant="outlined" onClick={() => mutate()} startIcon={<IconRefresh size={16} />}>
                <FormattedMessage id="app.retry" defaultMessage="Retry" />
              </Button>
            </Box>
          ) : (
            <>
              <TableContainer>
                <Table sx={{ minWidth: 1900 }}>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ pl: 3 }}>
                        <FormattedMessage id="invoice-number" defaultMessage="Invoice No." />
                      </TableCell>
                      <TableCell>
                        <FormattedMessage id="invoice-date" defaultMessage="Date" />
                      </TableCell>
                      <TableCell>
                        <FormattedMessage id="customer" defaultMessage="Customer" />
                      </TableCell>
                      <TableCell>
                        <FormattedMessage id="item" defaultMessage="Item" />
                      </TableCell>
                      <TableCell align="right">
                        <FormattedMessage id="sales-profitability-report.quantitySold" defaultMessage="Quantity Sold" />
                      </TableCell>
                      <TableCell align="right">
                        <FormattedMessage id="sales-profitability-report.salesAmount" defaultMessage="Sales Amount" />
                      </TableCell>
                      <TableCell align="right">
                        <FormattedMessage id="sales-profitability-report.historicalUnitCost" defaultMessage="Historical Unit Cost" />
                      </TableCell>
                      <TableCell align="right">
                        <FormattedMessage id="sales-profitability-report.costAmount" defaultMessage="Cost Amount" />
                      </TableCell>
                      <TableCell align="right">
                        <FormattedMessage id="sales-profitability-report.grossProfit" defaultMessage="Gross Profit" />
                      </TableCell>
                      <TableCell align="right">
                        <FormattedMessage id="sales-profitability-report.grossMarginPercent" defaultMessage="Gross Margin %" />
                      </TableCell>
                      <TableCell align="center">
                        <FormattedMessage id="currency" defaultMessage="Currency" />
                      </TableCell>
                      <TableCell align="center">
                        <FormattedMessage id="sales-profitability-report.costAvailable" defaultMessage="Cost Available" />
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {!report || rows.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={12} align="center" sx={{ py: 5 }}>
                          <Typography variant="subtitle1" color="textSecondary">
                            <FormattedMessage
                              id="sales-profitability-report.noData"
                              defaultMessage="No profitability rows found."
                            />
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      rows.map((row, index) => {
                        const customerName = getDisplayName(intl.locale, row.customerNameArabic, row.customerNameEnglish);
                        const itemName = getDisplayName(intl.locale, row.itemNameArabic, row.itemNameEnglish);
                        return (
                          <TableRow hover key={`${row.invoiceId}-${row.itemId}-${index}`}>
                            <TableCell sx={{ pl: 3 }}>
                              <Typography
                                component={Link}
                                to={`/sales/invoices/${row.invoiceId}`}
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
                                <Avatar sx={{ width: 32, height: 32, fontSize: '0.8rem' }}>{getInitials(customerName)}</Avatar>
                                <Box sx={{ minWidth: 0 }}>
                                  <Typography variant="subtitle2" noWrap sx={{ maxWidth: 220 }}>
                                    {customerName}
                                  </Typography>
                                  {row.customerNameEnglish && row.customerNameArabic && (
                                    <Typography variant="caption" color="text.secondary" noWrap>
                                      {intl.locale === 'ar' ? row.customerNameEnglish : row.customerNameArabic}
                                    </Typography>
                                  )}
                                </Box>
                              </Stack>
                            </TableCell>
                            <TableCell>
                              <Stack direction="row" alignItems="center" spacing={1.5}>
                                <Avatar sx={{ width: 32, height: 32, fontSize: '0.8rem' }}>{getInitials(itemName)}</Avatar>
                                <Box sx={{ minWidth: 0 }}>
                                  <Typography variant="subtitle2" noWrap sx={{ maxWidth: 220 }}>
                                    {itemName}
                                  </Typography>
                                  {row.itemNameEnglish && row.itemNameArabic && (
                                    <Typography variant="caption" color="text.secondary" noWrap>
                                      {intl.locale === 'ar' ? row.itemNameEnglish : row.itemNameArabic}
                                    </Typography>
                                  )}
                                </Box>
                              </Stack>
                            </TableCell>
                            <TableCell align="right">{renderValue(row.quantitySold, 'unit')}</TableCell>
                            <TableCell align="right">{renderValue(row.salesAmount, 'money', row.currencyCode)}</TableCell>
                            <TableCell align="right">{renderValue(row.historicalUnitCost, 'unit')}</TableCell>
                            <TableCell align="right">{renderValue(row.costAmount, 'money', row.currencyCode)}</TableCell>
                            <TableCell align="right">{renderValue(row.grossProfit, 'money', row.currencyCode)}</TableCell>
                            <TableCell align="right">{renderValue(row.grossMarginPercent, 'percent')}</TableCell>
                            <TableCell align="center">
                              <Typography variant="body2" dir="ltr">
                                {row.currencyCode}
                              </Typography>
                            </TableCell>
                            <TableCell align="center">
                              <Chip
                                size="small"
                                variant="outlined"
                                color={row.costAvailable ? 'success' : 'warning'}
                                label={row.costAvailable ? (
                                  <FormattedMessage
                                    id="sales-profitability-report.costAvailableYes"
                                    defaultMessage="Cost available"
                                  />
                                ) : (
                                  <FormattedMessage
                                    id="sales-profitability-report.costAvailableNo"
                                    defaultMessage="Cost unavailable"
                                  />
                                )}
                              />
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
