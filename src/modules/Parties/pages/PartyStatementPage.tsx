import { useEffect, useMemo, useState } from 'react';
import { useBrowserTitle } from 'shared/hooks/useBrowserTitle';
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
import PartySettlementDialog from '../components/PartySettlementDialog';
import { useParty, usePartyOpenDocuments, usePartyStatement } from '../hooks/useParties';
import { resolveLocalizedText } from 'shared/utils/localizedText';
import { getPartyAdjustmentEntryLabelId, isPartyAdjustmentEntryType } from '../utils/party-adjustments';
import PermissionGuard from 'modules/Administration/components/PermissionGuard';
import { TREASURY_PERMISSIONS } from 'modules/Treasury/utils/treasury.constants';

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
  { value: 'PartySettlementCredit', labelId: 'party-settlement.credit' },
  { value: 'PartySettlementCreditReversal', labelId: 'party-settlement.credit-reversal' },
  { value: 'PartySettlementDebit', labelId: 'party-settlement.debit' },
  { value: 'PartySettlementDebitReversal', labelId: 'party-settlement.debit-reversal' },
  { value: 'OpeningBalance', labelId: 'opening-balance' },
  { value: 'CustomerOpeningBalance', labelId: 'customer-opening-balance' },
  { value: 'SupplierOpeningBalance', labelId: 'supplier-opening-balance' },
  { value: 'PartyAdjustmentDebit', labelId: 'party-adjustment.debit' },
  { value: 'PartyAdjustmentCredit', labelId: 'party-adjustment.credit' },
  { value: 'PartyAdjustmentDebitReversal', labelId: 'party-adjustment.debit-reversal' },
  { value: 'PartyAdjustmentCreditReversal', labelId: 'party-adjustment.credit-reversal' }
];

function formatAmount(locale: string, value: number) {
  return new Intl.NumberFormat(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value);
}

const EMPTY_AMOUNT_PLACEHOLDER = '\u2014';

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
      return intl.formatMessage({ id: 'parties.statement.debit-against-party' });
    case 'Credit':
      return intl.formatMessage({ id: 'parties.statement.credit-for-party' });
    default:
      return '';
  }
}

type StatementSummaryLabels = {
  openingBalance: string;
  debitTotal: string;
  creditTotal: string;
  currentBalance: string;
};

function getStatementSummaryLabels(intl: ReturnType<typeof useIntl>, isCustomer: boolean, isSupplier: boolean): StatementSummaryLabels {
  if (isCustomer && isSupplier) {
    return {
      openingBalance: intl.formatMessage({ id: 'parties.statement.opening-balance' }),
      debitTotal: intl.formatMessage({ id: 'parties.statement.total-debit-neutral' }),
      creditTotal: intl.formatMessage({ id: 'parties.statement.total-credit-neutral' }),
      currentBalance: intl.formatMessage({ id: 'parties.statement.current-balance' })
    };
  }

  if (isCustomer) {
    return {
      openingBalance: intl.formatMessage({ id: 'parties.statement.opening-balance' }),
      debitTotal: intl.formatMessage({ id: 'parties.statement.total-debit-ledger' }),
      creditTotal: intl.formatMessage({ id: 'parties.statement.total-credit-ledger' }),
      currentBalance: intl.formatMessage({ id: 'parties.statement.current-balance' })
    };
  }

  return {
    openingBalance: intl.formatMessage({ id: 'parties.statement.opening-balance' }),
    debitTotal: intl.formatMessage({ id: 'parties.statement.total-debit-ledger' }),
    creditTotal: intl.formatMessage({ id: 'parties.statement.total-credit-ledger' }),
    currentBalance: intl.formatMessage({ id: 'parties.statement.current-balance' })
  };
}

function getStatementSummaryCardOrder(isCustomer: boolean, isSupplier: boolean) {
  if (isSupplier && !isCustomer) {
    return ['openingBalance', 'creditTotal', 'debitTotal', 'currentBalance'] as const;
  }

  return ['openingBalance', 'debitTotal', 'creditTotal', 'currentBalance'] as const;
}

function getMovementLabel(intl: ReturnType<typeof useIntl>, entryType: string) {
  switch (entryType) {
    case 'CustomerOpeningBalance':
    case 'CustomerOpeningBalanceReversal':
      return intl.formatMessage({ id: 'customer-opening-balance' });
    case 'SupplierOpeningBalance':
    case 'SupplierOpeningBalanceReversal':
      return intl.formatMessage({ id: 'supplier-opening-balance' });
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
    case 'PartySettlementCredit':
      return intl.formatMessage({ id: 'party-settlement.credit' });
    case 'PartySettlementCreditReversal':
      return intl.formatMessage({ id: 'party-settlement.credit-reversal' });
    case 'PartySettlementDebit':
      return intl.formatMessage({ id: 'party-settlement.debit' });
    case 'PartySettlementDebitReversal':
      return intl.formatMessage({ id: 'party-settlement.debit-reversal' });
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
  if (entryType.endsWith('Reversal') && !entryType.startsWith('PartySettlement')) {
    return `${label} (${intl.formatMessage({ id: 'statement-reversal' })})`;
  }

  return label;
}

function getStatementReferenceRoute(referenceType: string, referenceId: string | null) {
  if (!referenceId) {
    return null;
  }

  switch (referenceType) {
    case 'SalesInvoice':
    case 'SalesInvoiceCancellation':
    case 'SalesInvoiceSettlement':
    case 'SalesInvoiceSettlementCancellation':
      return `/sales/invoices/${referenceId}`;
    case 'PurchaseInvoice':
    case 'PurchaseInvoiceCancellation':
    case 'PurchaseInvoiceSettlement':
    case 'PurchaseInvoiceSettlementCancellation':
      return `/purchases/invoices/${referenceId}`;
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
  const [cashTransactionMode, setCashTransactionMode] = useState<'receipt' | 'payment' | null>(null);

  const { party, error: partyError, isLoading: isPartyLoading, mutate: mutateParty } = useParty(id);
  const { items: customerReceiptOpenDocuments, mutate: mutateCustomerReceiptOpenDocuments } = usePartyOpenDocuments(id, 'CustomerReceipt');
  const { items: supplierPaymentOpenDocuments, mutate: mutateSupplierPaymentOpenDocuments } = usePartyOpenDocuments(id, 'SupplierPayment');
  const {
    statement,
    error: statementError,
    isLoading: isStatementLoading,
    mutate: mutateStatement
  } = usePartyStatement(id, {
    fromDate: dateFrom,
    toDate: dateTo,
    page,
    pageSize,
    entryType: movementType || undefined
  });

  useEffect(() => {
    setPage(1);
  }, [dateFrom, dateTo, movementType]);

  useBrowserTitle(party ? [resolveLocalizedText(intl.locale, party.nameArabic, party.nameEnglish, party.nameArabic), intl.formatMessage({ id: 'party-statement', defaultMessage: 'Party statement' })] : []);

  if (!id) {
    return <Navigate to="/parties" replace />;
  }

  const isLoading = isPartyLoading || isStatementLoading;
  const errorMessage = partyError || statementError;
  const partyTypeLabel = party ? getPartyTypeLabel(intl, party.isCustomer, party.isSupplier) : '';
  const currentBalanceLabel = statement ? getBalanceNatureLabel(intl, statement.closingBalanceNature) : '';
  const summaryLabels = party ? getStatementSummaryLabels(intl, party.isCustomer, party.isSupplier) : null;
  const summaryCardOrder = party ? getStatementSummaryCardOrder(party.isCustomer, party.isSupplier) : [];
  const summaryCards =
    party && statement
      ? summaryCardOrder.map((cardKey) => {
          switch (cardKey) {
            case 'openingBalance': {
              const hasDateFrom = Boolean(dateFrom);
              return {
                key: cardKey,
                label: hasDateFrom
                  ? intl.formatMessage({ id: 'parties.statement.brought-forward-balance', defaultMessage: 'الرصيد المرحّل' })
                  : (summaryLabels?.openingBalance ?? intl.formatMessage({ id: 'parties.statement.opening-balance' })),
                amount: hasDateFrom ? statement.broughtForwardBalance : statement.openingBalance.amount,
                helper: getBalanceNatureLabel(intl, hasDateFrom ? statement.broughtForwardNature : statement.openingBalance.balanceNature)
              };
            }
            case 'debitTotal':
              return {
                key: cardKey,
                label: summaryLabels?.debitTotal ?? 'parties.statement.total-debit',
                amount: statement.debitTotal,
                helper: intl.formatMessage({ id: 'parties.statement.debit-against-party' })
              };
            case 'creditTotal':
              return {
                key: cardKey,
                label: summaryLabels?.creditTotal ?? 'parties.statement.total-credit',
                amount: statement.creditTotal,
                helper: intl.formatMessage({ id: 'parties.statement.credit-for-party' })
              };
            case 'currentBalance':
              return {
                key: cardKey,
                label: summaryLabels?.currentBalance ?? 'parties.statement.closing-balance',
                amount: statement.closingBalance,
                helper: currentBalanceLabel
              };
          }
        })
      : [];

  const refreshPartyData = async () => {
    await Promise.all([mutateParty(), mutateStatement(), mutateCustomerReceiptOpenDocuments(), mutateSupplierPaymentOpenDocuments()]);
  };

  const closeCashTransactionDialog = () => setCashTransactionMode(null);

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
            {party && party.balanceNature !== 'Settled' && (
              <>
                <PermissionGuard allPermissions={[TREASURY_PERMISSIONS.receiptsCreate, TREASURY_PERMISSIONS.receiptsPost]} fallback={null}>
                  {party.isCustomer && (
                    <Button variant="contained" color="success" onClick={() => setCashTransactionMode('receipt')}>
                      <FormattedMessage id={party.isSupplier ? 'party-dual-customer-receipt-submit' : 'party-customer-receipt-submit'} />
                    </Button>
                  )}
                </PermissionGuard>
                <PermissionGuard allPermissions={[TREASURY_PERMISSIONS.paymentsCreate, TREASURY_PERMISSIONS.paymentsPost]} fallback={null}>
                  {party.isSupplier && (
                    <Button variant="contained" color="warning" onClick={() => setCashTransactionMode('payment')}>
                      <FormattedMessage id={party.isCustomer ? 'party-dual-supplier-payment-submit' : 'party-supplier-payment-submit'} />
                    </Button>
                  )}
                </PermissionGuard>
              </>
            )}
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
                <Stack
                  direction={{ xs: 'column', md: 'row' }}
                  spacing={2}
                  justifyContent="space-between"
                  alignItems={{ xs: 'flex-start', md: 'center' }}
                >
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
                {summaryCards.map((card) => {
                  return (
                    <Grid key={card.key} item xs={12} sm={6} lg={3}>
                      <Box sx={{ p: 2, borderRadius: 2, bgcolor: 'grey.50', border: '1px solid', borderColor: 'divider' }}>
                        <Typography variant="caption" color="text.secondary">
                          <FormattedMessage id={card.label} />
                        </Typography>
                        <Stack direction="row" spacing={1} alignItems="baseline" sx={{ mt: 0.5 }}>
                          <Typography variant="h5" sx={{ fontWeight: 700 }}>
                            {formatAmount(intl.locale, card.amount)}
                          </Typography>
                          {card.helper && (
                            <Typography variant="body2" color="text.secondary" fontWeight={500}>
                              {card.helper}
                            </Typography>
                          )}
                        </Stack>
                      </Box>
                    </Grid>
                  );
                })}
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
                onSaved={refreshPartyData}
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
                            <FormattedMessage id="parties.statement.details" />
                          </TableCell>
                          <TableCell align="right" sx={{ fontWeight: 700, width: '150px' }}>
                            <FormattedMessage id="parties.statement.debit-against-party" />
                          </TableCell>
                          <TableCell align="right" sx={{ fontWeight: 700, width: '150px' }}>
                            <FormattedMessage id="parties.statement.credit-for-party" />
                          </TableCell>
                          <TableCell align="right" sx={{ fontWeight: 700, width: '180px' }}>
                            <FormattedMessage id="parties.statement.balance" />
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {statement.entries.map((entry) => (
                          <TableRow
                            key={entry.id}
                            hover
                            sx={isPartyAdjustmentEntryType(entry.entryType) ? { bgcolor: 'action.hover' } : undefined}
                          >
                            <TableCell dir="ltr">
                              <Typography variant="body2">
                                <BidiIsolatedDate value={formatStatementRangeDate(intl.locale, entry.entryDate)} />
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2">
                                {resolveLocalizedText(intl.locale, entry.descriptionArabic, entry.descriptionEnglish, '-')}
                              </Typography>
                              {(entry.referenceDisplayNumber || entry.referenceNumber) && (
                                <Typography variant="caption" color="text.secondary" display="block" dir="ltr">
                                  {(() => {
                                    const referenceRoute = getStatementReferenceRoute(entry.referenceType, entry.referenceId);
                                    const referenceNumber = entry.referenceDisplayNumber ?? entry.referenceNumber;

                                    if (!referenceRoute) {
                                      return <>Ref: {referenceNumber}</>;
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
                                          {referenceNumber}
                                        </Box>
                                      </>
                                    );
                                  })()}
                                </Typography>
                              )}
                              {isPartyAdjustmentEntryType(entry.entryType) && (
                                <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.5 }} flexWrap="wrap">
                                  <Chip
                                    size="small"
                                    variant="outlined"
                                    label={<FormattedMessage id={getPartyAdjustmentEntryLabelId(entry.entryType)} />}
                                  />
                                </Stack>
                              )}
                              <Typography variant="caption" color="text.secondary" display="block">
                                {getMovementTypeSummary(intl, entry.entryType)}
                              </Typography>
                            </TableCell>
                            <TableCell align="right">
                              <Typography variant="body2" sx={{ color: entry.debitAmount > 0 ? 'inherit' : 'text.disabled' }}>
                                {entry.debitAmount > 0 ? formatAmount(intl.locale, entry.debitAmount) : EMPTY_AMOUNT_PLACEHOLDER}
                              </Typography>
                            </TableCell>
                            <TableCell align="right">
                              <Typography variant="body2" sx={{ color: entry.creditAmount > 0 ? 'inherit' : 'text.disabled' }}>
                                {entry.creditAmount > 0 ? formatAmount(intl.locale, entry.creditAmount) : EMPTY_AMOUNT_PLACEHOLDER}
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
      {party && id && (
        <PartySettlementDialog
          open={cashTransactionMode !== null}
          mode={cashTransactionMode ?? 'receipt'}
          partyId={id}
          partyName={resolveLocalizedText(intl.locale, party.nameArabic, party.nameEnglish, party.nameArabic)}
          openDocuments={cashTransactionMode === 'payment' ? supplierPaymentOpenDocuments : customerReceiptOpenDocuments}
          onClose={closeCashTransactionDialog}
          onSaved={async () => {
            await refreshPartyData();
          }}
        />
      )}
    </Box>
  );
}
