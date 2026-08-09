import { useMemo, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';

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
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';

import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import CategoryIcon from '@mui/icons-material/Category';
import FileCopyIcon from '@mui/icons-material/FileCopy';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import ReceiptIcon from '@mui/icons-material/Receipt';
import { IconFilter, IconRefresh, IconSearch } from '@tabler/icons-react';

import Breadcrumbs from 'ui-component/extended/Breadcrumbs';
import HoverDataCard from 'ui-component/cards/HoverDataCard';
import Loader from 'ui-component/Loader';
import MainCard from 'ui-component/cards/MainCard';
import PermissionGuard from 'modules/Administration/components/PermissionGuard';
import { ACCOUNTING_PERMISSIONS } from 'modules/Accounting/utils/accounting.constants';
import { useParties } from 'modules/Parties/hooks/useParties';
import { useInventoryItems } from 'modules/Inventory/hooks/useInventory';
import { formatTreasuryMoney } from 'modules/Treasury/utils/treasury.format';
import { useSalesCustomerItemAnalysisReport } from '../hooks/useAccountingReports';

type LookupOption = {
  id: string;
  code: string;
  nameArabic: string;
  nameEnglish?: string | null;
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
    return words[0].slice(0, 2).toUpperCase();
  }

  return `${words[0][0]}${words[1][0]}`.toUpperCase();
}

function getDisplayName(locale: string, nameArabic: string, nameEnglish?: string | null) {
  return (locale === 'ar' ? nameArabic : nameEnglish || nameArabic) || '';
}

export default function SalesCustomerItemAnalysisReportPage() {
  const intl = useIntl();
  const [search, setSearch] = useState('');
  const [customerId, setCustomerId] = useState('');
  const [itemId, setItemId] = useState('');
  const [currencyCode, setCurrencyCode] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const { items: customers } = useParties({ page: 1, pageSize: 100, isCustomer: true, sortBy: 'nameArabic' });
  const { items: inventoryItems } = useInventoryItems({ page: 1, pageSize: 100, sortBy: 'nameArabic' });

  const customerLookup = useMemo(() => new Map(customers.map((customer) => [customer.id, customer])), [customers]);
  const itemLookup = useMemo(() => new Map(inventoryItems.map((item) => [item.id, item])), [inventoryItems]);

  const reportParams = useMemo(
    () => ({
      search: search.trim() || undefined,
      customerId: customerId || undefined,
      itemId: itemId || undefined,
      currencyCode: currencyCode.trim().toUpperCase() || undefined,
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined
    }),
    [currencyCode, customerId, dateFrom, dateTo, itemId, search]
  );

  const { report, isLoading, error, mutate } = useSalesCustomerItemAnalysisReport(reportParams);

  const selectedCustomer = useMemo<LookupOption | null>(() => {
    if (!customerId) {
      return null;
    }

    const fromLookup = customers.find((customer) => customer.id === customerId);
    if (fromLookup) {
      return fromLookup;
    }

    const fromReport = report?.customerAnalysis.find((row) => row.customerId === customerId);
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
  }, [customerId, customers, report?.customerAnalysis]);

  const selectedItem = useMemo<LookupOption | null>(() => {
    if (!itemId) {
      return null;
    }

    const fromLookup = inventoryItems.find((item) => item.id === itemId);
    if (fromLookup) {
      return fromLookup;
    }

    const fromReport = report?.itemAnalysis.find((row) => row.itemId === itemId);
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
  }, [inventoryItems, itemId, report?.itemAnalysis]);

  const customerOptions = useMemo<LookupOption[]>(() => {
    if (!selectedCustomer) {
      return customers;
    }

    if (customers.some((customer) => customer.id === selectedCustomer.id)) {
      return customers;
    }

    return [selectedCustomer, ...customers];
  }, [customers, selectedCustomer]);

  const itemOptions = useMemo<LookupOption[]>(() => {
    if (!selectedItem) {
      return inventoryItems;
    }

    if (inventoryItems.some((item) => item.id === selectedItem.id)) {
      return inventoryItems;
    }

    return [selectedItem, ...inventoryItems];
  }, [inventoryItems, selectedItem]);

  const summary = report?.summary;
  const hasFilters = Boolean(search || customerId || itemId || currencyCode || dateFrom || dateTo);
  const customerRows = report?.customerAnalysis ?? [];
  const itemRows = report?.itemAnalysis ?? [];

  const resetFilters = () => {
    setSearch('');
    setCustomerId('');
    setItemId('');
    setCurrencyCode('');
    setDateFrom('');
    setDateTo('');
  };

  const renderCurrencyCards = () => {
    if (isLoading && !report) {
      return (
        <Grid item xs={12}>
          <Skeleton variant="rectangular" height={100} sx={{ borderRadius: 2 }} />
        </Grid>
      );
    }

    if (summary?.totalSalesPerCurrency?.length) {
      return summary.totalSalesPerCurrency.map((currencyTotal) => (
        <Grid item xs={12} sm={6} md={4} key={currencyTotal.currencyCode}>
          <HoverDataCard
            title={`${intl.formatMessage({ id: 'sales-customer-item-analysis-report.totalSalesPerCurrency', defaultMessage: 'Total Sales' })} (${currencyTotal.currencyCode})`}
            iconPrimary={AttachMoneyIcon}
            primary={formatTreasuryMoney(currencyTotal.totalValue, currencyTotal.currencyCode)}
            secondary={intl.formatMessage({
              id: 'sales-customer-item-analysis-report.totalSalesPerCurrencySecondary',
              defaultMessage: 'Posted sales grouped by currency'
            })}
            color="success.main"
          />
        </Grid>
      ));
    }

    return (
      <Grid item xs={12} sm={6} md={4}>
        <HoverDataCard
          title={intl.formatMessage({ id: 'sales-customer-item-analysis-report.totalSalesPerCurrency', defaultMessage: 'Total Sales' })}
          iconPrimary={AttachMoneyIcon}
          primary={intl.formatMessage({ id: 'sales.reports.noPostedSales', defaultMessage: '—' })}
          secondary={intl.formatMessage({
            id: 'sales-customer-item-analysis-report.totalSalesPerCurrencySecondary',
            defaultMessage: 'Posted sales grouped by currency'
          })}
          color="success.main"
        />
      </Grid>
    );
  };

  return (
    <PermissionGuard permission={ACCOUNTING_PERMISSIONS.reportsView}>
      <Box>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 3 }}>
          <Breadcrumbs
            custom
            heading="sales-customer-item-analysis-report"
            links={[{ title: 'money', to: '/accounting' }, { title: 'accounting-reports', to: '/accounting/reports/general-ledger' }, { title: 'sales-customer-item-analysis-report' }]}
          />
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 2 }}>
            <Box>
              <Typography variant="h2" sx={{ fontWeight: 700, color: 'text.primary' }}>
                <FormattedMessage id="sales-customer-item-analysis-report" defaultMessage="Sales by Customer & Item Report" />
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
                <FormattedMessage
                  id="sales-customer-item-analysis-report-description"
                  defaultMessage="Analyze posted sales by customer and item with currency-aware totals for the selected period."
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
                title={intl.formatMessage({ id: 'sales-customer-item-analysis-report.totalInvoices', defaultMessage: 'Total Invoices' })}
                iconPrimary={ReceiptIcon}
                primary={summary?.totalInvoices ?? 0}
                secondary={intl.formatMessage({
                  id: 'sales-customer-item-analysis-report.totalInvoicesSecondary',
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
                title={intl.formatMessage({ id: 'sales-customer-item-analysis-report.uniqueCustomers', defaultMessage: 'Unique Customers' })}
                iconPrimary={PeopleAltIcon}
                primary={summary?.uniqueCustomers ?? 0}
                secondary={intl.formatMessage({
                  id: 'sales-customer-item-analysis-report.uniqueCustomersSecondary',
                  defaultMessage: 'Customers with matching sales'
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
                title={intl.formatMessage({ id: 'sales-customer-item-analysis-report.uniqueItems', defaultMessage: 'Unique Items' })}
                iconPrimary={FileCopyIcon}
                primary={summary?.uniqueItems ?? 0}
                secondary={intl.formatMessage({
                  id: 'sales-customer-item-analysis-report.uniqueItemsSecondary',
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
                title={intl.formatMessage({ id: 'sales-customer-item-analysis-report.totalQuantitySold', defaultMessage: 'Total Quantity Sold' })}
                iconPrimary={CategoryIcon}
                primary={summary?.totalQuantitySold ?? 0}
                secondary={intl.formatMessage({
                  id: 'sales-customer-item-analysis-report.totalQuantitySoldSecondary',
                  defaultMessage: 'Quantity across all matching rows'
                })}
                color="warning.main"
              />
            )}
          </Grid>
        </Grid>

        <Grid container spacing={3} sx={{ mb: 3 }}>
          {renderCurrencyCards()}
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
                    id: 'sales-customer-item-analysis-report.searchPlaceholder',
                    defaultMessage: 'Search sales analysis...'
                  })}
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
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
                  onChange={(_, newValue) => setCustomerId(newValue?.id || '')}
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
                  onChange={(_, newValue) => setItemId(newValue?.id || '')}
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
                onChange={(event) => setCurrencyCode(event.target.value)}
                sx={{ minWidth: { xs: '100%', sm: 130 } }}
                label={<FormattedMessage id="currency-code" defaultMessage="Currency Code" />}
                placeholder="EGP"
              />

              <TextField
                type="date"
                size="small"
                value={dateFrom}
                onChange={(event) => setDateFrom(event.target.value)}
                label={<FormattedMessage id="app.dateFrom" defaultMessage="Date From" />}
                InputLabelProps={{ shrink: true }}
                sx={{ minWidth: { xs: '100%', sm: 150 } }}
              />

              <TextField
                type="date"
                size="small"
                value={dateTo}
                onChange={(event) => setDateTo(event.target.value)}
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
                  id="sales-customer-item-analysis-report.loadError"
                  defaultMessage="Failed to load sales analysis report."
                />
              </Typography>
              <Button variant="outlined" onClick={() => mutate()} startIcon={<IconRefresh size={16} />}>
                <FormattedMessage id="app.retry" defaultMessage="Retry" />
              </Button>
            </Box>
          ) : (
            <Stack spacing={3}>
              <Box>
                <Box sx={{ px: 3, pt: 3, pb: 1 }}>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    <FormattedMessage id="sales-customer-item-analysis-report.customerAnalysis" defaultMessage="Customer Analysis" />
                  </Typography>
                </Box>
                <TableContainer>
                  <Table sx={{ minWidth: 980 }}>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ pl: 3 }}>
                          <FormattedMessage id="customer-code" defaultMessage="Customer Code" />
                        </TableCell>
                        <TableCell>
                          <FormattedMessage id="customer" defaultMessage="Customer" />
                        </TableCell>
                        <TableCell align="right">
                          <FormattedMessage id="sales-customer-item-analysis-report.invoiceCount" defaultMessage="Invoices" />
                        </TableCell>
                        <TableCell align="right">
                          <FormattedMessage id="sales-customer-item-analysis-report.quantitySold" defaultMessage="Quantity Sold" />
                        </TableCell>
                        <TableCell align="right">
                          <FormattedMessage id="sales-customer-item-analysis-report.salesAmount" defaultMessage="Sales Amount" />
                        </TableCell>
                        <TableCell align="center">
                          <FormattedMessage id="currency" defaultMessage="Currency" />
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {customerRows.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} align="center" sx={{ py: 5 }}>
                            <Typography variant="subtitle1" color="textSecondary">
                              <FormattedMessage
                                id="sales-customer-item-analysis-report.noCustomerData"
                                defaultMessage="No customer analysis rows found."
                              />
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ) : (
                        customerRows.map((row) => {
                          const customerName = getDisplayName(intl.locale, row.customerNameArabic, row.customerNameEnglish);
                          return (
                            <TableRow hover key={`${row.customerId}-${row.currencyCode}`}>
                              <TableCell sx={{ pl: 3 }}>
                                <Typography variant="body2" dir="ltr">
                                  {row.customerCode}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Stack direction="row" alignItems="center" spacing={1.5}>
                                  <Avatar sx={{ width: 32, height: 32, fontSize: '0.8rem' }}>{getInitials(customerName)}</Avatar>
                                  <Box sx={{ minWidth: 0 }}>
                                    <Typography variant="subtitle2" noWrap sx={{ maxWidth: 240 }}>
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
                              <TableCell align="right">
                                <Typography variant="body2">{row.invoiceCount}</Typography>
                              </TableCell>
                              <TableCell align="right">
                                <Typography variant="body2" dir="ltr">
                                  {row.quantitySold}
                                </Typography>
                              </TableCell>
                              <TableCell align="right">
                                <Typography variant="subtitle2" dir="ltr">
                                  {formatTreasuryMoney(row.salesAmount, row.currencyCode)}
                                </Typography>
                              </TableCell>
                              <TableCell align="center">
                                <Typography variant="body2" dir="ltr">
                                  {row.currencyCode}
                                </Typography>
                              </TableCell>
                            </TableRow>
                          );
                        })
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>

              <Box>
                <Box sx={{ px: 3, pt: 3, pb: 1 }}>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    <FormattedMessage id="sales-customer-item-analysis-report.itemAnalysis" defaultMessage="Item Analysis" />
                  </Typography>
                </Box>
                <TableContainer>
                  <Table sx={{ minWidth: 980 }}>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ pl: 3 }}>
                          <FormattedMessage id="item-code" defaultMessage="Item Code" />
                        </TableCell>
                        <TableCell>
                          <FormattedMessage id="item" defaultMessage="Item" />
                        </TableCell>
                        <TableCell align="right">
                          <FormattedMessage id="sales-customer-item-analysis-report.invoiceCount" defaultMessage="Invoices" />
                        </TableCell>
                        <TableCell align="right">
                          <FormattedMessage id="sales-customer-item-analysis-report.quantitySold" defaultMessage="Quantity Sold" />
                        </TableCell>
                        <TableCell align="right">
                          <FormattedMessage id="sales-customer-item-analysis-report.salesAmount" defaultMessage="Sales Amount" />
                        </TableCell>
                        <TableCell align="center">
                          <FormattedMessage id="currency" defaultMessage="Currency" />
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {itemRows.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} align="center" sx={{ py: 5 }}>
                            <Typography variant="subtitle1" color="textSecondary">
                              <FormattedMessage
                                id="sales-customer-item-analysis-report.noItemData"
                                defaultMessage="No item analysis rows found."
                              />
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ) : (
                        itemRows.map((row) => {
                          const itemName = getDisplayName(intl.locale, row.itemNameArabic, row.itemNameEnglish);
                          return (
                            <TableRow hover key={`${row.itemId}-${row.currencyCode}`}>
                              <TableCell sx={{ pl: 3 }}>
                                <Typography variant="body2" dir="ltr">
                                  {row.itemCode}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Stack direction="row" alignItems="center" spacing={1.5}>
                                  <Avatar sx={{ width: 32, height: 32, fontSize: '0.8rem' }}>{getInitials(itemName)}</Avatar>
                                  <Box sx={{ minWidth: 0 }}>
                                    <Typography variant="subtitle2" noWrap sx={{ maxWidth: 240 }}>
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
                              <TableCell align="right">
                                <Typography variant="body2">{row.invoiceCount}</Typography>
                              </TableCell>
                              <TableCell align="right">
                                <Typography variant="body2" dir="ltr">
                                  {row.quantitySold}
                                </Typography>
                              </TableCell>
                              <TableCell align="right">
                                <Typography variant="subtitle2" dir="ltr">
                                  {formatTreasuryMoney(row.salesAmount, row.currencyCode)}
                                </Typography>
                              </TableCell>
                              <TableCell align="center">
                                <Typography variant="body2" dir="ltr">
                                  {row.currencyCode}
                                </Typography>
                              </TableCell>
                            </TableRow>
                          );
                        })
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            </Stack>
          )}
        </MainCard>
      </Box>
    </PermissionGuard>
  );
}
