import { useEffect, useMemo, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { Link, Navigate, useParams } from 'react-router-dom';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/GridLegacy';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import Breadcrumbs from 'ui-component/extended/Breadcrumbs';
import Loader from 'ui-component/Loader';
import MainCard from 'ui-component/cards/MainCard';
import PartyClassificationChips from '../components/PartyClassificationChips';
import { useParty, usePartyStatement } from '../hooks/useParties';
import { resolveLocalizedText } from 'shared/utils/localizedText';

type MovementTypeOption = {
  value: string;
  labelId: string;
};

const MOVEMENT_TYPE_OPTIONS: MovementTypeOption[] = [
  { value: '', labelId: 'all' },
  { value: 'SalesInvoiceDebit', labelId: 'sales-invoice' },
  { value: 'TreasuryReceiptCredit', labelId: 'customer-receipt' },
  { value: 'PurchaseInvoiceCredit', labelId: 'purchase-invoice' },
  { value: 'TreasuryPaymentDebit', labelId: 'supplier-payment' },
  { value: 'OpeningBalance', labelId: 'opening-balance' }
];

function formatAmount(locale: string, value: number) {
  return new Intl.NumberFormat(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value);
}

function formatDate(locale: string, value: string) {
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString(locale);
}

function formatDateInput(value: Date) {
  return value.toISOString().slice(0, 10);
}

function getPartyTypeLabel(intl: ReturnType<typeof useIntl>, isCustomer: boolean, isSupplier: boolean) {
  if (isCustomer && isSupplier) {
    return intl.formatMessage({ id: 'party-type-both' });
  }

  if (isCustomer) {
    return intl.formatMessage({ id: 'party-customer' });
  }

  return intl.formatMessage({ id: 'party-supplier' });
}

function getBalanceNatureLabel(intl: ReturnType<typeof useIntl>, nature: string) {
  switch (nature) {
    case 'Debit':
      return intl.formatMessage({ id: 'statement-receivable' });
    case 'Credit':
      return intl.formatMessage({ id: 'statement-payable' });
    default:
      return intl.formatMessage({ id: 'statement-settled' });
  }
}

function getMovementLabel(intl: ReturnType<typeof useIntl>, entryType: string) {
  switch (entryType) {
    case 'OpeningBalance':
    case 'OpeningBalanceReversal':
      return intl.formatMessage({ id: 'opening-balance' });
    case 'SalesInvoiceDebit':
    case 'SalesInvoiceDebitReversal':
      return intl.formatMessage({ id: 'sales-invoice' });
    case 'SalesReturnCredit':
    case 'SalesReturnCreditReversal':
      return intl.formatMessage({ id: 'sales-return' });
    case 'PurchaseInvoiceCredit':
    case 'PurchaseInvoiceCreditReversal':
      return intl.formatMessage({ id: 'purchase-invoice' });
    case 'PurchaseReturnDebit':
    case 'PurchaseReturnDebitReversal':
      return intl.formatMessage({ id: 'purchase-return' });
    case 'TreasuryReceiptCredit':
    case 'TreasuryReceiptCreditReversal':
      return intl.formatMessage({ id: 'customer-receipt' });
    case 'TreasuryPaymentDebit':
    case 'TreasuryPaymentDebitReversal':
      return intl.formatMessage({ id: 'supplier-payment' });
    default:
      return intl.formatMessage({ id: 'none' });
  }
}

function getMovementTypeSummary(intl: ReturnType<typeof useIntl>, entryType: string) {
  const label = getMovementLabel(intl, entryType);
  if (entryType.endsWith('Reversal')) {
    return `${label} (${intl.formatMessage({ id: 'statement-reversal' })})`;
  }

  return label;
}

export default function PartyStatementPage() {
  const { id } = useParams();
  const intl = useIntl();
  const today = useMemo(() => formatDateInput(new Date()), []);
  const firstDay = useMemo(() => formatDateInput(new Date(new Date().getFullYear(), new Date().getMonth(), 1)), []);
  const [dateFrom, setDateFrom] = useState(firstDay);
  const [dateTo, setDateTo] = useState(today);
  const [movementType, setMovementType] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const { party, error: partyError, isLoading: isPartyLoading } = useParty(id);
  const { statement, error: statementError, isLoading: isStatementLoading } = usePartyStatement(id, {
    fromDate: dateFrom,
    toDate: dateTo,
    page,
    pageSize,
    entryType: movementType || undefined
  });

  useEffect(() => {
    setPage(1);
  }, [dateFrom, dateTo, movementType]);

  if (!id) {
    return <Navigate to="/parties" replace />;
  }

  const isLoading = isPartyLoading || isStatementLoading;
  const errorMessage = partyError || statementError;
  const partyTypeLabel = party ? getPartyTypeLabel(intl, party.isCustomer, party.isSupplier) : '';
  const currentBalanceLabel = statement ? getBalanceNatureLabel(intl, statement.closingBalanceNature) : '';

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Breadcrumbs
        custom
        heading="party-account-statement"
        links={[
          { title: 'parties', to: '/parties' },
          { title: 'party-details', to: `/parties/${id}` },
          { title: 'party-account-statement' }
        ]}
      />

      <MainCard
        title={<FormattedMessage id="party-account-statement" />}
        secondary={
          <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
            <Button component={Link} to={`/parties/${id}`} variant="outlined">
              <FormattedMessage id="party-details" />
            </Button>
          </Stack>
        }
      >
        {isLoading && <Loader />}
        {errorMessage && !isLoading && (
          <Alert severity="error">
            <FormattedMessage id="party-statement-load-error" />
          </Alert>
        )}
        {!isLoading && !errorMessage && party && statement && (
          <Stack spacing={3}>
            <Card variant="outlined" sx={{ borderRadius: 2, p: 2 }}>
              <Stack spacing={2}>
                <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'center' }}>
                  <Box>
                    <Typography variant="h5" sx={{ fontWeight: 700 }}>
                      {resolveLocalizedText(intl.locale, party.nameArabic, party.nameEnglish, party.nameArabic)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {party.code}
                    </Typography>
                  </Box>
                  <PartyClassificationChips isCustomer={party.isCustomer} isSupplier={party.isSupplier} />
                </Stack>

                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6} md={3}>
                    <Typography variant="caption" color="text.secondary">
                      <FormattedMessage id="party-name" />
                    </Typography>
                    <Typography variant="body1" fontWeight={600}>
                      {resolveLocalizedText(intl.locale, party.nameArabic, party.nameEnglish, party.nameArabic)}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Typography variant="caption" color="text.secondary">
                      <FormattedMessage id="party-type" />
                    </Typography>
                    <Typography variant="body1" fontWeight={600}>
                      {partyTypeLabel}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Typography variant="caption" color="text.secondary">
                      <FormattedMessage id="party-mobile-number" />
                    </Typography>
                    <Typography variant="body1" fontWeight={600} dir="ltr">
                      {party.primaryPhone ?? '-'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Typography variant="caption" color="text.secondary">
                      <FormattedMessage id="date-range" />
                    </Typography>
                    <Typography variant="body1" fontWeight={600} dir="ltr">
                      {formatDate(intl.locale, dateFrom)} - {formatDate(intl.locale, dateTo)}
                    </Typography>
                  </Grid>
                </Grid>
              </Stack>
            </Card>

            <Card variant="outlined" sx={{ borderRadius: 2, p: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} lg={3}>
                  <Box sx={{ p: 2, borderRadius: 2, bgcolor: 'grey.50', border: '1px solid', borderColor: 'divider' }}>
                    <Typography variant="caption" color="text.secondary">
                      <FormattedMessage id="opening-balance" />
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 700 }}>
                      {formatAmount(intl.locale, statement.openingBalance.amount)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {intl.formatMessage({ id: statement.openingBalance.balanceNature === 'Credit' ? 'statement-payable' : statement.openingBalance.balanceNature === 'Debit' ? 'statement-receivable' : 'statement-settled' })}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} lg={3}>
                  <Box sx={{ p: 2, borderRadius: 2, bgcolor: 'grey.50', border: '1px solid', borderColor: 'divider' }}>
                    <Typography variant="caption" color="text.secondary">
                      <FormattedMessage id="total-debit" />
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 700 }}>
                      {formatAmount(intl.locale, statement.debitTotal)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      <FormattedMessage id="debit" />
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} lg={3}>
                  <Box sx={{ p: 2, borderRadius: 2, bgcolor: 'grey.50', border: '1px solid', borderColor: 'divider' }}>
                    <Typography variant="caption" color="text.secondary">
                      <FormattedMessage id="total-credit" />
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 700 }}>
                      {formatAmount(intl.locale, statement.creditTotal)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      <FormattedMessage id="credit" />
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} lg={3}>
                  <Box sx={{ p: 2, borderRadius: 2, bgcolor: 'grey.50', border: '1px solid', borderColor: 'divider' }}>
                    <Typography variant="caption" color="text.secondary">
                      <FormattedMessage id="current-balance" />
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 700 }}>
                      {formatAmount(intl.locale, statement.closingBalance)}
                    </Typography>
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.5 }}>
                      <Chip size="small" variant="outlined" label={currentBalanceLabel} />
                    </Stack>
                  </Box>
                </Grid>
              </Grid>
            </Card>

            <Card variant="outlined" sx={{ borderRadius: 2, p: 2 }}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    type="date"
                    label={<FormattedMessage id="from-date" />}
                    value={dateFrom}
                    onChange={(event) => setDateFrom(event.target.value)}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    type="date"
                    label={<FormattedMessage id="to-date" />}
                    value={dateTo}
                    onChange={(event) => setDateTo(event.target.value)}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    select
                    fullWidth
                    label={<FormattedMessage id="movement-type" />}
                    value={movementType}
                    onChange={(event) => setMovementType(event.target.value)}
                  >
                    {MOVEMENT_TYPE_OPTIONS.map((option) => (
                      <MenuItem key={option.value || 'all'} value={option.value}>
                        <FormattedMessage id={option.labelId} />
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
              </Grid>
            </Card>

            <Card variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden' }}>
              {statement.entries.length === 0 ? (
                <Box sx={{ p: 3 }}>
                  <Typography>
                    <FormattedMessage id="party-statement-empty" />
                  </Typography>
                </Box>
              ) : (
                <>
                  <TableContainer sx={{ overflowX: 'auto' }}>
                    <Table size="small" sx={{ minWidth: 900 }}>
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 700 }}>
                            <FormattedMessage id="date" />
                          </TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>
                            <FormattedMessage id="movement-type" />
                          </TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>
                            <FormattedMessage id="reference" />
                          </TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>
                            <FormattedMessage id="description" />
                          </TableCell>
                          <TableCell align="right" sx={{ fontWeight: 700 }}>
                            <FormattedMessage id="debit" />
                          </TableCell>
                          <TableCell align="right" sx={{ fontWeight: 700 }}>
                            <FormattedMessage id="credit" />
                          </TableCell>
                          <TableCell align="right" sx={{ fontWeight: 700 }}>
                            <FormattedMessage id="running-balance" />
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {statement.entries.map((entry) => (
                          <TableRow key={entry.id} hover>
                            <TableCell dir="ltr">{formatDate(intl.locale, entry.entryDate)}</TableCell>
                            <TableCell>{getMovementTypeSummary(intl, entry.entryType)}</TableCell>
                            <TableCell dir="ltr">{entry.referenceNumber ?? '-'}</TableCell>
                            <TableCell>{resolveLocalizedText(intl.locale, entry.descriptionArabic, entry.descriptionEnglish, '-')}</TableCell>
                            <TableCell align="right">{entry.debitAmount > 0 ? formatAmount(intl.locale, entry.debitAmount) : '-'}</TableCell>
                            <TableCell align="right">{entry.creditAmount > 0 ? formatAmount(intl.locale, entry.creditAmount) : '-'}</TableCell>
                            <TableCell align="right">
                              <Stack spacing={0.25} alignItems="flex-end">
                                <Typography variant="body2" fontWeight={700}>
                                  {formatAmount(intl.locale, entry.runningBalance)}
                                </Typography>
                                <Chip size="small" variant="outlined" label={getBalanceNatureLabel(intl, entry.runningBalanceNature)} />
                              </Stack>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                  <TablePagination
                    component="div"
                    count={statement.totalCount}
                    page={Math.max(0, statement.page - 1)}
                    rowsPerPage={statement.pageSize}
                    onPageChange={(_, nextPage) => setPage(nextPage + 1)}
                    onRowsPerPageChange={(event) => {
                      setPageSize(parseInt(event.target.value, 10));
                      setPage(1);
                    }}
                    labelRowsPerPage=""
                  />
                </>
              )}
            </Card>
          </Stack>
        )}
      </MainCard>
    </Box>
  );
}
