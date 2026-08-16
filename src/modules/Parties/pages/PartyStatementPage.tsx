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
import PartyAdjustmentsPanel from '../components/PartyAdjustmentsPanel';
import { useParty, usePartyStatement } from '../hooks/useParties';
import { resolveLocalizedText } from 'shared/utils/localizedText';
import { getPartyAdjustmentEntryLabelId, isPartyAdjustmentEntryType } from '../utils/party-adjustments';

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
  { value: 'OpeningBalance', labelId: 'opening-balance' },
  { value: 'PartyAdjustmentDebit', labelId: 'party-adjustment.debit' },
  { value: 'PartyAdjustmentCredit', labelId: 'party-adjustment.credit' },
  { value: 'PartyAdjustmentDebitReversal', labelId: 'party-adjustment.debit-reversal' },
  { value: 'PartyAdjustmentCreditReversal', labelId: 'party-adjustment.credit-reversal' }
];

function formatAmount(locale: string, value: number) {
  return new Intl.NumberFormat(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value);
}

function formatDate(locale: string, value: string) {
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString(locale);
}

function sanitizeBidiControls(value: string) {
  return value.replace(/[\u061C\u200E\u200F\u202A-\u202E\u2066-\u2069]/g, '');
}

function formatStatementRangeDate(locale: string, value: string) {
  return sanitizeBidiControls(formatDate(locale, value));
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
      return intl.formatMessage({ id: 'parties.statement.debit-against-party', defaultMessage: 'Ø¹Ù„ÙŠÙ‡' });
    case 'Credit':
      return intl.formatMessage({ id: 'parties.statement.credit-for-party', defaultMessage: 'Ù„Ù‡' });
    default:
      return '';
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
    case 'PartyAdjustmentDebit':
      return intl.formatMessage({ id: 'party-adjustment.debit' });
    case 'PartyAdjustmentCredit':
      return intl.formatMessage({ id: 'party-adjustment.credit' });
    case 'PartyAdjustmentDebitReversal':
      return intl.formatMessage({ id: 'party-adjustment.debit-reversal' });
    case 'PartyAdjustmentCreditReversal':
      return intl.formatMessage({ id: 'party-adjustment.credit-reversal' });
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

function getStatementReferenceRoute(entryType: string, referenceNumber: string | null) {
  if (!referenceNumber) {
    return null;
  }

  switch (entryType) {
    case 'SalesInvoiceDebit':
    case 'SalesInvoiceDebitReversal':
      return `/sales/invoices?search=${encodeURIComponent(referenceNumber)}`;
    case 'PurchaseInvoiceCredit':
    case 'PurchaseInvoiceCreditReversal':
      return `/purchases/invoices?search=${encodeURIComponent(referenceNumber)}`;
    default:
      return null;
  }
}

function BidiIsolatedDate({ value }: { value: string }) {
  return (
    <Box
      component="span"
      dir="ltr"
      sx={{
        unicodeBidi: 'isolate',
        display: 'inline-block'
      }}
    >
      {value}
    </Box>
  );
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

  const { party, error: partyError, isLoading: isPartyLoading, mutate: mutateParty } = useParty(id);
  const { statement, error: statementError, isLoading: isStatementLoading, mutate: mutateStatement } = usePartyStatement(id, {
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

  const handlePartyAdjustmentsSaved = async () => {
    await Promise.all([mutateParty(), mutateStatement()]);
  };

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
                      <BidiIsolatedDate value={formatStatementRangeDate(intl.locale, dateFrom)} />
                      <Box component="span" aria-hidden="true" sx={{ px: 0.5 }}>
                        -
                      </Box>
                      <BidiIsolatedDate value={formatStatementRangeDate(intl.locale, dateTo)} />
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
                    <Stack direction="row" spacing={1} alignItems="baseline" sx={{ mt: 0.5 }}>
                      <Typography variant="h5" sx={{ fontWeight: 700 }}>
                        {formatAmount(intl.locale, statement.openingBalance.amount)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" fontWeight={500}>
                        {getBalanceNatureLabel(intl, statement.openingBalance.balanceNature)}
                      </Typography>
                    </Stack>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} lg={3}>
                  <Box sx={{ p: 2, borderRadius: 2, bgcolor: 'grey.50', border: '1px solid', borderColor: 'divider' }}>
                    <Typography variant="caption" color="text.secondary">
                      <FormattedMessage id="parties.statement.total-debit" defaultMessage="Ø¥Ø¬Ù…Ø§Ù„ÙŠ Ø¹Ù„ÙŠÙ‡" />
                    </Typography>
                    <Stack direction="row" spacing={1} alignItems="baseline" sx={{ mt: 0.5 }}>
                      <Typography variant="h5" sx={{ fontWeight: 700 }}>
                        {formatAmount(intl.locale, statement.debitTotal)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" fontWeight={500}>
                        <FormattedMessage id="parties.statement.debit-against-party" defaultMessage="Ø¹Ù„ÙŠÙ‡" />
                      </Typography>
                    </Stack>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} lg={3}>
                  <Box sx={{ p: 2, borderRadius: 2, bgcolor: 'grey.50', border: '1px solid', borderColor: 'divider' }}>
                    <Typography variant="caption" color="text.secondary">
                      <FormattedMessage id="parties.statement.total-credit" defaultMessage="Ø¥Ø¬Ù…Ø§Ù„ÙŠ Ù„Ù‡" />
                    </Typography>
                    <Stack direction="row" spacing={1} alignItems="baseline" sx={{ mt: 0.5 }}>
                      <Typography variant="h5" sx={{ fontWeight: 700 }}>
                        {formatAmount(intl.locale, statement.creditTotal)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" fontWeight={500}>
                        <FormattedMessage id="parties.statement.credit-for-party" defaultMessage="Ù„Ù‡" />
                      </Typography>
                    </Stack>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} lg={3}>
                  <Box sx={{ p: 2, borderRadius: 2, bgcolor: 'grey.50', border: '1px solid', borderColor: 'divider' }}>
                    <Typography variant="caption" color="text.secondary">
                      <FormattedMessage id="parties.statement.closing-balance" defaultMessage="Ø§Ù„Ø±ØµÙŠØ¯ Ø§Ù„Ù†Ù‡Ø§Ø¦ÙŠ" />
                    </Typography>
                    <Stack direction="row" spacing={1} alignItems="baseline" sx={{ mt: 0.5 }}>
                      <Typography variant="h5" sx={{ fontWeight: 700 }}>
                        {formatAmount(intl.locale, statement.closingBalance)}
                      </Typography>
                      {currentBalanceLabel && (
                        <Typography variant="body2" color="text.secondary" fontWeight={500}>
                          {currentBalanceLabel}
                        </Typography>
                      )}
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

            {party && (
              <PartyAdjustmentsPanel
                partyId={party.id}
                partyName={resolveLocalizedText(intl.locale, party.nameArabic, party.nameEnglish, party.nameArabic)}
                isCustomer={party.isCustomer}
                isSupplier={party.isSupplier}
                isActive={party.isActive}
                onSaved={handlePartyAdjustmentsSaved}
              />
            )}

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
                          <TableCell sx={{ fontWeight: 700, width: '120px' }}>
                            <FormattedMessage id="date" />
                          </TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>
                            <FormattedMessage id="parties.statement.details" defaultMessage="Ø§Ù„ØªÙØ§ØµÙŠÙ„" />
                          </TableCell>
                          <TableCell align="right" sx={{ fontWeight: 700, width: '150px' }}>
                            <FormattedMessage id="parties.statement.debit-against-party" defaultMessage="Ø¹Ù„ÙŠÙ‡" />
                          </TableCell>
                          <TableCell align="right" sx={{ fontWeight: 700, width: '150px' }}>
                            <FormattedMessage id="parties.statement.credit-for-party" defaultMessage="Ù„Ù‡" />
                          </TableCell>
                          <TableCell align="right" sx={{ fontWeight: 700, width: '180px' }}>
                            <FormattedMessage id="parties.statement.balance" defaultMessage="Ø§Ù„Ø±ØµÙŠØ¯" />
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {statement.entries.map((entry) => (
                          <TableRow key={entry.id} hover sx={isPartyAdjustmentEntryType(entry.entryType) ? { bgcolor: 'action.hover' } : undefined}>
                            <TableCell dir="ltr">
                              <Typography variant="body2">{formatDate(intl.locale, entry.entryDate)}</Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2">
                                {resolveLocalizedText(intl.locale, entry.descriptionArabic, entry.descriptionEnglish, '-')}
                              </Typography>
                              {entry.referenceNumber && (
                                <Typography variant="caption" color="text.secondary" display="block" dir="ltr">
                                  {(() => {
                                    const referenceRoute = getStatementReferenceRoute(entry.entryType, entry.referenceNumber);

                                    if (!referenceRoute) {
                                      return (
                                        <>
                                          Ref: {entry.referenceNumber}
                                        </>
                                      );
                                    }

                                    return (
                                      <>
                                        Ref:{' '}
                                        <Box
                                          component={Link}
                                          to={referenceRoute}
                                          sx={{
                                            color: 'primary.main',
                                            textDecoration: 'none',
                                            fontWeight: 600,
                                            '&:hover': {
                                              textDecoration: 'underline'
                                            }
                                          }}
                                        >
                                          {entry.referenceNumber}
                                        </Box>
                                      </>
                                    );
                                  })()}
                                </Typography>
                              )}
                              {isPartyAdjustmentEntryType(entry.entryType) && (
                                <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.5 }} flexWrap="wrap">
                                  <Chip size="small" variant="outlined" label={<FormattedMessage id={getPartyAdjustmentEntryLabelId(entry.entryType)} />} />
                                </Stack>
                              )}
                              <Typography variant="caption" color="text.secondary" display="block">
                                {getMovementTypeSummary(intl, entry.entryType)}
                              </Typography>
                            </TableCell>
                            <TableCell align="right">
                              <Typography variant="body2" sx={{ color: entry.debitAmount > 0 ? 'inherit' : 'text.disabled' }}>
                                {entry.debitAmount > 0 ? formatAmount(intl.locale, entry.debitAmount) : 'â€”'}
                              </Typography>
                            </TableCell>
                            <TableCell align="right">
                              <Typography variant="body2" sx={{ color: entry.creditAmount > 0 ? 'inherit' : 'text.disabled' }}>
                                {entry.creditAmount > 0 ? formatAmount(intl.locale, entry.creditAmount) : 'â€”'}
                              </Typography>
                            </TableCell>
                            <TableCell align="right">
                              <Stack direction="row" spacing={1} justifyContent="flex-end" alignItems="baseline">
                                <Typography variant="body2" fontWeight={700}>
                                  {formatAmount(intl.locale, entry.runningBalance)}
                                </Typography>
                                {getBalanceNatureLabel(intl, entry.runningBalanceNature) && (
                                  <Typography variant="caption" color="text.secondary">
                                    {getBalanceNatureLabel(intl, entry.runningBalanceNature)}
                                  </Typography>
                                )}
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
