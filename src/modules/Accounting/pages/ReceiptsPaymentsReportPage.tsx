import { useMemo, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';

import Autocomplete from '@mui/material/Autocomplete';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
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

import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import ReceiptIcon from '@mui/icons-material/Receipt';
import { IconFilter, IconRefresh, IconSearch } from '@tabler/icons-react';

import Breadcrumbs from 'ui-component/extended/Breadcrumbs';
import HoverDataCard from 'ui-component/cards/HoverDataCard';
import Loader from 'ui-component/Loader';
import MainCard from 'ui-component/cards/MainCard';
import PermissionGuard from 'modules/Administration/components/PermissionGuard';
import TreasuryStatusChip from 'modules/Treasury/components/TreasuryStatusChip';
import { formatTreasuryMoney } from 'modules/Treasury/utils/treasury.format';
import { useParties } from 'modules/Parties/hooks/useParties';
import { ACCOUNTING_PERMISSIONS } from '../utils/accounting.constants';
import { useReceiptsPaymentsReport } from '../hooks/useAccountingReports';

type PartyLookupOption = {
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

function getPartyName(option: { nameArabic: string; nameEnglish: string | null }, locale: string) {
  return (locale === 'ar' ? option.nameArabic : option.nameEnglish || option.nameArabic) || '';
}

function getTransactionTypeLabel(type: string, locale: string) {
  if (type === 'Receipt') {
    return locale === 'ar' ? 'قبض' : 'Receipt';
  }

  if (type === 'Payment') {
    return locale === 'ar' ? 'صرف' : 'Payment';
  }

  return type || '-';
}

function getTransactionTypeColor(type: string) {
  if (type === 'Receipt') {
    return 'success';
  }

  if (type === 'Payment') {
    return 'warning';
  }

  return 'default';
}

export default function ReceiptsPaymentsReportPage() {
  const intl = useIntl();
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');
  const [partyId, setPartyId] = useState('');
  const [transactionType, setTransactionType] = useState('');
  const [status, setStatus] = useState('');
  const [currencyCode, setCurrencyCode] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const { items: parties } = useParties({ page: 1, pageSize: 100, sortBy: 'nameArabic' });
  const partyLookup = useMemo(() => new Map(parties.map((party) => [party.id, party])), [parties]);

  const reportParams = useMemo(
    () => ({
      page: page + 1,
      pageSize,
      search: search.trim() || undefined,
      partyId: partyId || undefined,
      transactionType: transactionType || undefined,
      status: status || undefined,
      currencyCode: currencyCode.trim().toUpperCase() || undefined,
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined,
      sortBy: 'date',
      sortDirection: 'desc'
    }),
    [currencyCode, dateFrom, dateTo, page, pageSize, partyId, search, status, transactionType]
  );

  const { report, isLoading, error, mutate } = useReceiptsPaymentsReport(reportParams);

  const selectedParty = useMemo<PartyLookupOption | null>(() => {
    if (!partyId) {
      return null;
    }

    const fromLookup = parties.find((party) => party.id === partyId);
    if (fromLookup) {
      return {
        id: fromLookup.id,
        code: fromLookup.code,
        nameArabic: fromLookup.nameArabic,
        nameEnglish: fromLookup.nameEnglish
      };
    }

    const fromReport = report?.rows.find((row) => row.partyId === partyId);
    if (fromReport) {
      return {
        id: fromReport.partyId,
        code: fromReport.partyCode,
        nameArabic: fromReport.partyNameArabic,
        nameEnglish: fromReport.partyNameEnglish
      };
    }

    return {
      id: partyId,
      code: partyId,
      nameArabic: partyId,
      nameEnglish: null
    };
  }, [parties, partyId, report?.rows]);

  const partyOptions = useMemo<PartyLookupOption[]>(() => {
    if (!selectedParty) {
      return parties;
    }

    if (parties.some((party) => party.id === selectedParty.id)) {
      return parties;
    }

    return [selectedParty, ...parties];
  }, [parties, selectedParty]);

  const hasFilters = Boolean(search || partyId || transactionType || status || currencyCode || dateFrom || dateTo);
  const summary = report?.summary;
  const rows = report?.rows ?? [];

  const resetFilters = () => {
    setSearch('');
    setPartyId('');
    setTransactionType('');
    setStatus('');
    setCurrencyCode('');
    setDateFrom('');
    setDateTo('');
    setPage(0);
  };

  const renderCurrencyCards = (
    items: { currencyCode: string; totalValue: number }[] | undefined,
    titleId: string,
    defaultTitle: string,
    secondaryId: string,
    secondaryDefault: string,
    color: 'success.main' | 'warning.main'
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

  return (
    <PermissionGuard permission={ACCOUNTING_PERMISSIONS.reportsView}>
      <Box>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 3 }}>
          <Breadcrumbs
            custom
            heading="receipts-payments-report"
            links={[{ title: 'money', to: '/accounting' }, { title: 'accounting-reports', to: '/accounting/reports/general-ledger' }, { title: 'receipts-payments-report' }]}
          />
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 2 }}>
            <Box>
              <Typography variant="h2" sx={{ fontWeight: 700, color: 'text.primary' }}>
                <FormattedMessage id="receipts-payments-report" defaultMessage="Receipts & Payments Report" />
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
                <FormattedMessage
                  id="receipts-payments-report-description"
                  defaultMessage="Review customer receipts and supplier payments together with posting status, parties, currencies, and references."
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
                title={intl.formatMessage({ id: 'receipts-payments-report.totalTransactions', defaultMessage: 'Total Transactions' })}
                iconPrimary={ReceiptIcon}
                primary={summary?.totalTransactions ?? 0}
                secondary={intl.formatMessage({ id: 'receipts-payments-report.totalTransactionsSecondary', defaultMessage: 'All matching transactions' })}
                color="primary.main"
              />
            )}
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            {isLoading && !report ? (
              <Skeleton variant="rectangular" height={100} sx={{ borderRadius: 2 }} />
            ) : (
              <HoverDataCard
                title={intl.formatMessage({ id: 'receipts-payments-report.receiptCount', defaultMessage: 'Receipt Count' })}
                iconPrimary={ArrowDownwardIcon}
                primary={summary?.receiptCount ?? 0}
                secondary={intl.formatMessage({ id: 'receipts-payments-report.receiptCountSecondary', defaultMessage: 'Customer receipts' })}
                color="success.main"
              />
            )}
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            {isLoading && !report ? (
              <Skeleton variant="rectangular" height={100} sx={{ borderRadius: 2 }} />
            ) : (
              <HoverDataCard
                title={intl.formatMessage({ id: 'receipts-payments-report.paymentCount', defaultMessage: 'Payment Count' })}
                iconPrimary={ArrowUpwardIcon}
                primary={summary?.paymentCount ?? 0}
                secondary={intl.formatMessage({ id: 'receipts-payments-report.paymentCountSecondary', defaultMessage: 'Supplier payments' })}
                color="warning.main"
              />
            )}
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            {isLoading && !report ? (
              <Skeleton variant="rectangular" height={100} sx={{ borderRadius: 2 }} />
            ) : (
              <HoverDataCard
                title={intl.formatMessage({ id: 'receipts-payments-report.uniqueParties', defaultMessage: 'Unique Parties' })}
                iconPrimary={PeopleAltIcon}
                primary={summary?.uniqueParties ?? 0}
                secondary={intl.formatMessage({ id: 'receipts-payments-report.uniquePartiesSecondary', defaultMessage: 'Distinct parties in the report' })}
                color="info.main"
              />
            )}
          </Grid>
        </Grid>

        <Grid container spacing={3} sx={{ mb: 3 }}>
          {renderCurrencyCards(
            summary?.totalReceiptsPerCurrency,
            'receipts-payments-report.totalReceiptsPerCurrency',
            'Total Receipts',
            'receipts-payments-report.receiptsPerCurrencySecondary',
            'Customer receipts only',
            'success.main'
          )}
        </Grid>

        <Grid container spacing={3} sx={{ mb: 3 }}>
          {renderCurrencyCards(
            summary?.totalPaymentsPerCurrency,
            'receipts-payments-report.totalPaymentsPerCurrency',
            'Total Payments',
            'receipts-payments-report.paymentsPerCurrencySecondary',
            'Supplier payments only',
            'warning.main'
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
                  placeholder={intl.formatMessage({ id: 'receipts-payments-report.searchPlaceholder', defaultMessage: 'Search transactions...' })}
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
                  options={partyOptions}
                  getOptionLabel={(option) => `${option.code} - ${getPartyName(option, intl.locale)}`}
                  value={partyLookup.get(partyId) || selectedParty || null}
                  onChange={(_, newValue) => {
                    setPartyId(newValue?.id || '');
                    setPage(0);
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      placeholder={intl.formatMessage({ id: 'party', defaultMessage: 'Party' })}
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
                value={transactionType}
                onChange={(event) => {
                  setTransactionType(event.target.value);
                  setPage(0);
                }}
                sx={{ minWidth: { xs: '100%', sm: 150 } }}
                SelectProps={{ displayEmpty: true }}
              >
                <MenuItem value="">
                  <FormattedMessage id="receipts-payments-report.allTransactionTypes" defaultMessage="All transaction types" />
                </MenuItem>
                <MenuItem value="Receipt">
                  <FormattedMessage id="receipts-payments-report.receiptType" defaultMessage="Receipt" />
                </MenuItem>
                <MenuItem value="Payment">
                  <FormattedMessage id="receipts-payments-report.paymentType" defaultMessage="Payment" />
                </MenuItem>
              </TextField>

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
                  <FormattedMessage id="treasury.status.draft" defaultMessage="Draft" />
                </MenuItem>
                <MenuItem value="Posted">
                  <FormattedMessage id="treasury.status.posted" defaultMessage="Posted" />
                </MenuItem>
                <MenuItem value="Cancelled">
                  <FormattedMessage id="treasury.status.cancelled" defaultMessage="Cancelled" />
                </MenuItem>
              </TextField>

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
                <FormattedMessage id="receipts-payments-report.loadError" defaultMessage="Failed to load receipts and payments report." />
              </Typography>
              <Button variant="outlined" onClick={() => mutate()} startIcon={<IconRefresh size={16} />}>
                <FormattedMessage id="app.retry" defaultMessage="Retry" />
              </Button>
            </Box>
          ) : (
            <>
              <TableContainer>
                <Table sx={{ minWidth: 1550 }}>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ pl: 3 }}>
                        <FormattedMessage id="receipt-payment.number" defaultMessage="Transaction No." />
                      </TableCell>
                      <TableCell>
                        <FormattedMessage id="receipt-payment.date" defaultMessage="Date" />
                      </TableCell>
                      <TableCell>
                        <FormattedMessage id="receipt-payment.type" defaultMessage="Type" />
                      </TableCell>
                      <TableCell>
                        <FormattedMessage id="party-code" defaultMessage="Party Code" />
                      </TableCell>
                      <TableCell>
                        <FormattedMessage id="party" defaultMessage="Party" />
                      </TableCell>
                      <TableCell>
                        <FormattedMessage id="receipt-payment.related-document-number" defaultMessage="Related Document" />
                      </TableCell>
                      <TableCell>
                        <FormattedMessage id="receipt-payment.source-document-number" defaultMessage="Source Document" />
                      </TableCell>
                      <TableCell>
                        <FormattedMessage id="reason" defaultMessage="Reason" />
                      </TableCell>
                      <TableCell>
                        <FormattedMessage id="notes" defaultMessage="Notes" />
                      </TableCell>
                      <TableCell align="right">
                        <FormattedMessage id="receipt-payment.amount" defaultMessage="Amount" />
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
                        <TableCell colSpan={12} align="center" sx={{ py: 5 }}>
                          <Typography variant="subtitle1" color="textSecondary">
                            <FormattedMessage
                              id="receipts-payments-report.noData"
                              defaultMessage="No receipts or payments found."
                            />
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      rows.map((row) => {
                        const partyName = intl.locale === 'ar' ? row.partyNameArabic : row.partyNameEnglish || row.partyNameArabic;
                        const initials = getInitials(partyName);
                        return (
                          <TableRow hover key={`${row.transactionType}-${row.transactionId}`}>
                            <TableCell sx={{ pl: 3 }}>
                              <Typography variant="subtitle2">{row.transactionNumber}</Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" dir="ltr">
                                {formatDate(row.transactionDate, intl.locale)}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Chip
                                size="small"
                                variant="outlined"
                                color={getTransactionTypeColor(row.transactionType) as 'success' | 'warning' | 'default'}
                                label={getTransactionTypeLabel(row.transactionType, intl.locale)}
                              />
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" dir="ltr">
                                {row.partyCode}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Stack direction="row" alignItems="center" spacing={1.5}>
                                <Avatar sx={{ width: 32, height: 32, fontSize: '0.8rem' }}>{initials}</Avatar>
                                <Box sx={{ minWidth: 0 }}>
                                  <Typography variant="subtitle2" noWrap sx={{ maxWidth: 200 }}>
                                    {partyName}
                                  </Typography>
                                  {row.partyNameEnglish && row.partyNameArabic && (
                                    <Typography variant="caption" color="text.secondary" noWrap>
                                      {intl.locale === 'ar' ? row.partyNameEnglish : row.partyNameArabic}
                                    </Typography>
                                  )}
                                </Box>
                              </Stack>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" noWrap sx={{ maxWidth: 160 }}>
                                {row.relatedDocumentNumber || '-'}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" noWrap sx={{ maxWidth: 160 }}>
                                {row.sourceDocumentNumber || '-'}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" noWrap sx={{ maxWidth: 180 }}>
                                {row.reason || '-'}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" noWrap sx={{ maxWidth: 220 }}>
                                {row.notes || '-'}
                              </Typography>
                            </TableCell>
                            <TableCell align="right">
                              <Typography variant="subtitle2" dir="ltr">
                                {formatTreasuryMoney(row.amount, row.currencyCode)}
                              </Typography>
                            </TableCell>
                            <TableCell align="center">
                              <Typography variant="body2" dir="ltr">
                                {row.currencyCode}
                              </Typography>
                            </TableCell>
                            <TableCell align="center">
                              <TreasuryStatusChip status={row.status} />
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
