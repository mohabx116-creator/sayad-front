import { useState, type ReactNode } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { Link, useParams } from 'react-router-dom';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/GridLegacy';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import { IconArrowBackUp, IconArrowLeft, IconBox, IconCalculator, IconEdit, IconInfoCircle, IconNotes, IconSend, IconX } from '@tabler/icons-react';

import { useDispatch } from 'store';
import { openSnackbar } from 'store/slices/snackbar';
import MainCard from 'ui-component/cards/MainCard';
import Breadcrumbs from 'ui-component/extended/Breadcrumbs';
import Loader from 'ui-component/Loader';
import PageTitle from 'ui-component/PageTitle';
import PermissionGuard from 'modules/Administration/components/PermissionGuard';
import { usePartyOpenDocuments } from 'modules/Parties/hooks/useParties';
import { resolveLocalizedText } from 'shared/utils/localizedText';
import { cancelInvoice, postInvoice } from '../api/purchasesApi';
import PurchaseAccountingStatusChip from '../components/PurchaseAccountingStatusChip';
import PurchaseStatusChip from '../components/PurchaseStatusChip';
import { usePurchaseInvoice } from '../hooks/usePurchases';
import { PURCHASES_PERMISSIONS } from '../utils/purchases.constants';
import PartySettlementDialog from 'modules/Parties/components/PartySettlementDialog';
import {
  getInvoicePaymentMethodLabel,
  getInvoiceSettlementStatusLabel,
  normalizeInvoicePaymentMethod,
  normalizeInvoiceSettlementStatus
} from 'shared/utils/invoiceSettlement';
import { getTreasurySettlementStatusLabel } from 'modules/Treasury/utils/treasury.labels';
import { getDocumentDisplayNumber } from 'shared/utils/documentDisplay';
import { useBrowserTitle } from 'shared/hooks/useBrowserTitle';

function InfoRow({ label, children }: { label: ReactNode; children: ReactNode }) {
  return (
    <Box>
      <Typography
        variant="caption"
        color="text.secondary"
        display="block"
        fontWeight={600}
        sx={{ mb: 0.25, textTransform: 'uppercase', letterSpacing: 0.5, fontSize: '0.7rem' }}
      >
        {label}
      </Typography>
      <Typography variant="body2" fontWeight={500}>
        {children}
      </Typography>
    </Box>
  );
}

function formatDate(value: string | null | undefined, locale: string) {
  if (!value) {
    return '-';
  }

  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString(locale);
}

function getJournalEntryDetailsRoute(journalEntryId: string | null | undefined) {
  return journalEntryId ? `/accounting/journal-entries/${journalEntryId}` : null;
}

function formatCodeNameLabel(locale: string, code: string | null | undefined, nameArabic: string | null | undefined, nameEnglish: string | null | undefined) {
  const resolvedName = resolveLocalizedText(locale, nameArabic, nameEnglish, '');
  if (code) {
    return resolvedName ? `${code} - ${resolvedName}` : code;
  }

  return resolvedName || '-';
}

export default function PurchaseInvoiceDetailsPage() {
  const { id } = useParams();
  const intl = useIntl();
  const dispatch = useDispatch();
  const { invoice, isLoading, error, mutate } = usePurchaseInvoice(id);
  const {
    items: supplierPaymentOpenDocuments,
    isLoading: isSupplierPaymentOpenDocumentsLoading,
    mutate: mutateSupplierPaymentOpenDocuments
  } = usePartyOpenDocuments(invoice?.supplierId, 'SupplierPayment');
  const [reason, setReason] = useState('');
  const [payDialogOpen, setPayDialogOpen] = useState(false);

  const notify = (message: string, severity: 'success' | 'error' = 'success') => {
    dispatch(openSnackbar({ open: true, message, variant: 'alert', severity }));
  };

  const refresh = async () => {
    await mutate();
  };

  const runAction = async (action: () => Promise<unknown>) => {
    try {
      await action();
      await refresh();
      notify(intl.formatMessage({ id: 'purchase-action-success' }));
    } catch (actionError) {
      notify(actionError instanceof Error ? actionError.message : intl.formatMessage({ id: 'purchase-action-failed' }), 'error');
    }
  };

  const invoiceDisplayNumber = getDocumentDisplayNumber(invoice?.displayNumber, invoice?.number);
  useBrowserTitle(invoice ? [invoiceDisplayNumber] : []);

  if (isLoading) return <Loader />;
  if (error || !invoice) return <Typography color="error"><FormattedMessage id="purchase-load-error" /></Typography>;

  const paymentMethod = normalizeInvoicePaymentMethod(invoice.paymentMethod) ?? 'Credit';
  const settlementStatus = normalizeInvoiceSettlementStatus(invoice.settlementStatus) ?? 'Outstanding';
  const paymentMethodLabel = getInvoicePaymentMethodLabel(intl.locale, paymentMethod);
  const purchaseInvoiceOpenDocument =
    supplierPaymentOpenDocuments.find(
      (openDocument) => openDocument.documentType === 'PurchaseInvoice' && openDocument.documentId === invoice.id
    ) ?? null;
  const remainingPayableAmount = purchaseInvoiceOpenDocument?.outstandingAmount ?? 0;
  const effectiveSettlementStatusLabel = isSupplierPaymentOpenDocumentsLoading
    ? getInvoiceSettlementStatusLabel(intl.locale, settlementStatus)
    : remainingPayableAmount <= 0
      ? getInvoiceSettlementStatusLabel(intl.locale, 'Settled')
      : remainingPayableAmount < invoice.grandTotal
        ? getTreasurySettlementStatusLabel(invoice.grandTotal - remainingPayableAmount, remainingPayableAmount)
        : getInvoiceSettlementStatusLabel(intl.locale, 'Outstanding');
  const isCreditOutstanding = invoice.status === 'Posted' && paymentMethod === 'Credit' && remainingPayableAmount > 0;
  const hasInvoiceRowVersion = Boolean(invoice.rowVersion.trim());
  const canPayInvoice = isCreditOutstanding && hasInvoiceRowVersion;
  const paymentUnavailable = isCreditOutstanding && !hasInvoiceRowVersion;
  const journalEntryRoute = getJournalEntryDetailsRoute(invoice.accountingJournalEntryId);
  const settlementJournalEntryRoute = getJournalEntryDetailsRoute(invoice.settlementJournalEntryId);

  const cardSx = { border: '1px solid', borderColor: 'divider', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', mb: 3 };
  const headerSx = { display: 'flex', alignItems: 'center', gap: 1, pb: 2, mb: 3, borderBottom: '1px solid', borderColor: 'divider' };

  return (
    <Box>
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: { xs: 'flex-start', sm: 'flex-end' }, justifyContent: 'space-between', mb: 3, gap: 2 }}>
        <Box>
          <Breadcrumbs custom card={false} title={false} divider={false} heading="purchase-invoice-details" links={[{ title: 'purchases', to: '/purchases/invoices' }, { title: 'purchase-invoices', to: '/purchases/invoices' }, { title: invoiceDisplayNumber }]} sx={{ mb: 0 }} />
          <PageTitle>
            {invoiceDisplayNumber} - {invoice.supplierNameArabic}
          </PageTitle>
        </Box>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Box sx={{ mr: 1 }}>
            <PurchaseStatusChip status={invoice.status} />
          </Box>
          <PurchaseAccountingStatusChip isAccountingPosted={invoice.isAccountingPosted} accountingPostingStatus={invoice.accountingPostingStatus} />

          <Button component={Link} to="/purchases/invoices" variant="outlined" color="inherit" sx={{ borderRadius: 2 }} startIcon={<IconArrowLeft size={18} />}>
            <FormattedMessage id="back" />
          </Button>

          <PermissionGuard permission={PURCHASES_PERMISSIONS.invoicesUpdate}>
            {invoice.status === 'Draft' && (
              <Button component={Link} to={`/purchases/invoices/${invoice.id}/edit`} variant="outlined" color="primary" sx={{ borderRadius: 2 }} startIcon={<IconEdit size={18} />}>
                <FormattedMessage id="edit" />
              </Button>
            )}
          </PermissionGuard>

          <PermissionGuard permission={PURCHASES_PERMISSIONS.invoicesPost}>
            {invoice.status === 'Draft' && (
              <Button variant="contained" color="primary" onClick={() => runAction(() => postInvoice(invoice.id, invoice.rowVersion))} sx={{ borderRadius: 2, boxShadow: 2 }} startIcon={<IconSend size={18} />}>
                <FormattedMessage id="post" />
              </Button>
            )}
          </PermissionGuard>

          <PermissionGuard permission={PURCHASES_PERMISSIONS.invoicesPost}>
            {canPayInvoice && (
              <Button variant="contained" color="success" onClick={() => setPayDialogOpen(true)} sx={{ borderRadius: 2 }} startIcon={<IconSend size={18} />}>
                <FormattedMessage id="pay-invoice" defaultMessage="Pay Invoice" />
              </Button>
            )}
          </PermissionGuard>

          <PermissionGuard permission={PURCHASES_PERMISSIONS.returnsCreate}>
            {invoice.status === 'Posted' && (
              <Button component={Link} to={`/purchases/returns/new?purchaseInvoiceId=${invoice.id}`} variant="contained" color="secondary" sx={{ borderRadius: 2 }} startIcon={<IconArrowBackUp size={18} />}>
                <FormattedMessage id="create-purchase-return" />
              </Button>
            )}
          </PermissionGuard>
        </Stack>
      </Box>

      {invoice.status === 'Cancelled' && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2, border: '1px solid', borderColor: 'error.light' }}>
          <Typography variant="subtitle1" fontWeight={600} gutterBottom>
            <FormattedMessage id="invoice-cancelled" />
          </Typography>
          <Typography variant="body2">{invoice.cancellationReason || <FormattedMessage id="no-cancel-reason" />}</Typography>
        </Alert>
      )}

      {paymentUnavailable && (
        <Alert severity="warning" sx={{ mb: 3, borderRadius: 2, border: '1px solid', borderColor: 'warning.light' }}>
          <FormattedMessage
            id="purchase-rowversion-missing"
            defaultMessage="This invoice cannot be paid right now because its current version is unavailable. Refresh the page and try again."
          />
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12} lg={8}>
          <Stack spacing={3}>
            <MainCard sx={cardSx} content={false}>
              <Box sx={{ p: 3 }}>
                <Box sx={headerSx}>
                  <IconInfoCircle color="var(--mui-palette-primary-main)" />
                  <Typography variant="h4">
                    <FormattedMessage id="basic-information" />
                  </Typography>
                </Box>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={4}>
                    <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                      <FormattedMessage id="supplier" />
                    </Typography>
                    <Typography variant="body1" fontWeight={500}>
                      {invoice.supplierCode} - {invoice.supplierNameArabic}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                      <FormattedMessage id="invoice-date" />
                    </Typography>
                    <Typography variant="body1" fontWeight={500}>
                      {formatDate(invoice.invoiceDate, intl.locale)}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                      تاريخ الاستحقاق
                    </Typography>
                    <Typography variant="body1" fontWeight={500}>
                      {formatDate(invoice.dueDate, intl.locale)}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                      <FormattedMessage id="invoice-number" />
                    </Typography>
                    <Typography variant="body1" fontWeight={500}>
                      {invoiceDisplayNumber}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                      <FormattedMessage id="supplier-invoice-number" />
                    </Typography>
                    <Typography variant="body1" fontWeight={500}>
                      {invoice.supplierInvoiceNumber ?? '-'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <InfoRow label={<FormattedMessage id="payment-method" defaultMessage="Payment Method" />}>{paymentMethodLabel}</InfoRow>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <InfoRow label={<FormattedMessage id="settlement-status" defaultMessage="Settlement Status" />}>{effectiveSettlementStatusLabel}</InfoRow>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <InfoRow label={<FormattedMessage id="remaining-payable-amount" defaultMessage="Remaining Payable Amount" />}>
                      {isSupplierPaymentOpenDocumentsLoading ? '—' : remainingPayableAmount.toFixed(2)}
                    </InfoRow>
                  </Grid>
                    <Grid item xs={12} md={4}>
                      <InfoRow label={<FormattedMessage id="treasury-account" defaultMessage="Treasury Account" />}>
                        {formatCodeNameLabel(intl.locale, invoice.treasuryAccountCode, invoice.treasuryAccountNameArabic, invoice.treasuryAccountNameEnglish)}
                      </InfoRow>
                    </Grid>
                </Grid>
              </Box>
            </MainCard>

            <MainCard sx={cardSx} content={false}>
              <Box sx={{ p: 3 }}>
                <Box sx={headerSx}>
                  <IconBox color="var(--mui-palette-primary-main)" />
                  <Typography variant="h4">
                    <FormattedMessage id="item-details" />
                  </Typography>
                </Box>
                <TableContainer sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                  <Table size="small" sx={{ minWidth: 900 }}>
                    <TableHead sx={{ bgcolor: 'grey.50' }}>
                      <TableRow>
                        <TableCell align="center" width={40}>
                          #
                        </TableCell>
                        <TableCell sx={{ minWidth: 200 }}>
                          <FormattedMessage id="item" />
                        </TableCell>
                        <TableCell sx={{ minWidth: 100 }}>
                          <FormattedMessage id="quantity" />
                        </TableCell>
                        <TableCell sx={{ minWidth: 100 }}>
                          <FormattedMessage id="unit" />
                        </TableCell>
                        <TableCell sx={{ minWidth: 120 }}>
                          <FormattedMessage id="unit-cost" />
                        </TableCell>
                        <TableCell sx={{ minWidth: 120 }}>
                          <FormattedMessage id="discount" />
                        </TableCell>
                        <TableCell sx={{ minWidth: 120 }}>
                          <FormattedMessage id="tax" />
                        </TableCell>
                        <TableCell sx={{ minWidth: 120 }}>
                          <FormattedMessage id="line-total" />
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {invoice.lines.map((line, index) => (
                        <TableRow key={line.id} hover>
                          <TableCell align="center">{index + 1}</TableCell>
                          <TableCell>
                            {line.itemCode} - {line.itemNameArabic}
                          </TableCell>
                          <TableCell>{line.quantity}</TableCell>
                          <TableCell>{line.unitCode}</TableCell>
                          <TableCell>{line.unitCost.toFixed(2)}</TableCell>
                          <TableCell>{line.discountAmount.toFixed(2)}</TableCell>
                          <TableCell>{line.taxAmount.toFixed(2)}</TableCell>
                          <TableCell>
                            <Typography fontWeight={600}>{line.lineTotal.toFixed(2)}</Typography>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            </MainCard>

            <PermissionGuard permission={PURCHASES_PERMISSIONS.invoicesCancel}>
              {invoice.status === 'Posted' && (
                <MainCard sx={{ ...cardSx, borderColor: 'error.light' }} content={false}>
                  <Box sx={{ p: 3 }}>
                    <Box sx={{ ...headerSx, borderColor: 'error.light' }}>
                      <IconX color="var(--mui-palette-error-main)" />
                      <Typography variant="h4" color="error.main">
                        <FormattedMessage id="cancel-document" />
                      </Typography>
                    </Box>
                    <Stack spacing={2} direction={{ xs: 'column', sm: 'row' }} alignItems="flex-start">
                      <TextField fullWidth size="small" label={<FormattedMessage id="cancel-reason" />} value={reason} onChange={(event) => setReason(event.target.value)} />
                      <Button
                        variant="outlined"
                        color="error"
                        sx={{ borderRadius: 2, whiteSpace: 'nowrap', minHeight: 40 }}
                        onClick={() => runAction(() => cancelInvoice(invoice.id, { reason, rowVersion: invoice.rowVersion }))}
                      >
                        <FormattedMessage id="cancel" />
                      </Button>
                    </Stack>
                  </Box>
                </MainCard>
              )}
            </PermissionGuard>
          </Stack>
        </Grid>

        <Grid item xs={12} lg={4}>
          <Stack spacing={3}>
            <MainCard sx={cardSx} content={false}>
              <Box sx={{ p: 3 }}>
                <Box sx={headerSx}>
                  <IconCalculator color="var(--mui-palette-primary-main)" />
                  <Typography variant="h4">
                    <FormattedMessage id="totals-summary" />
                  </Typography>
                </Box>
                <Stack spacing={2}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography>
                      <FormattedMessage id="subtotal" />
                    </Typography>
                    <Typography fontWeight={600}>{invoice.subtotal.toFixed(2)}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography>
                      <FormattedMessage id="header-discount" />
                    </Typography>
                    <Typography fontWeight={600} color="error.main">
                      - {(invoice.headerDiscount || 0).toFixed(2)}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography>
                      <FormattedMessage id="other-costs" />
                    </Typography>
                    <Typography fontWeight={600}>{(invoice.otherCosts || 0).toFixed(2)}</Typography>
                  </Box>
                  <Divider sx={{ my: 1 }} />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h3">
                      <FormattedMessage id="grand-total" />
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.5, color: 'primary.main' }}>
                      <Typography variant="h3" fontWeight={700}>
                        {invoice.grandTotal.toFixed(2)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        <FormattedMessage id="currency" />
                      </Typography>
                    </Box>
                  </Box>
                </Stack>
              </Box>
            </MainCard>

            <MainCard sx={cardSx} content={false}>
              <Box sx={{ p: 3 }}>
                <Box sx={headerSx}>
                  <IconNotes color="var(--mui-palette-primary-main)" />
                  <Typography variant="h4">
                    <FormattedMessage id="invoice-notes" />
                  </Typography>
                </Box>
                <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', color: invoice.notes ? 'text.primary' : 'text.disabled' }}>
                  {invoice.notes || '-'}
                </Typography>
              </Box>
            </MainCard>

            <MainCard sx={cardSx} content={false}>
              <Box sx={{ p: 3 }}>
                <Box sx={headerSx}>
                  <IconInfoCircle color="var(--mui-palette-primary-main)" />
                  <Typography variant="h4">الترحيل المحاسبي</Typography>
                </Box>
                <Stack spacing={2}>
                  <Box>
                    <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                      حالة الترحيل
                    </Typography>
                    <PurchaseAccountingStatusChip isAccountingPosted={invoice.isAccountingPosted} accountingPostingStatus={invoice.accountingPostingStatus} />
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                      <FormattedMessage id="invoice-posting-journal" defaultMessage="Invoice Posting Journal" />
                    </Typography>
                    {journalEntryRoute ? (
                      <Button
                        component={Link}
                        to={journalEntryRoute}
                        variant="outlined"
                        size="small"
                        sx={{
                          borderRadius: 2,
                          textTransform: 'none',
                          '&:hover': {
                            textDecoration: 'none'
                          },
                          '&:focus-visible': {
                            outline: '2px solid',
                            outlineColor: 'primary.main',
                            outlineOffset: 2
                          }
                        }}
                      >
                        {invoice.accountingEntryNumber || invoice.accountingJournalEntryId}
                      </Button>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        {invoice.accountingPostingStatus}
                      </Typography>
                    )}
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                      <FormattedMessage id="settlement-journal-entry" defaultMessage="Payment Settlement Journal" />
                    </Typography>
                    {settlementJournalEntryRoute ? (
                      <Button
                        component={Link}
                        to={settlementJournalEntryRoute}
                        variant="outlined"
                        size="small"
                        sx={{
                          borderRadius: 2,
                          textTransform: 'none',
                          '&:hover': {
                            textDecoration: 'none'
                          },
                          '&:focus-visible': {
                            outline: '2px solid',
                            outlineColor: 'primary.main',
                            outlineOffset: 2
                          }
                        }}
                      >
                        {invoice.settlementJournalEntryNumber || invoice.settlementJournalEntryId}
                      </Button>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        -
                      </Typography>
                    )}
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                      حساب الموردين
                    </Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {formatCodeNameLabel(
                        intl.locale,
                        invoice.supplierControlAccountCode,
                        invoice.supplierControlAccountArabicName,
                        invoice.supplierControlAccountEnglishName
                      )}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                      حساب المخزون
                    </Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {formatCodeNameLabel(
                        intl.locale,
                        invoice.inventoryAssetAccountCode,
                        invoice.inventoryAssetAccountArabicName,
                        invoice.inventoryAssetAccountEnglishName
                      )}
                    </Typography>
                  </Box>
                </Stack>
              </Box>
            </MainCard>
          </Stack>
        </Grid>
      </Grid>

      <PartySettlementDialog
        open={payDialogOpen}
        mode="payment"
        settlementDirection="SupplierPayment"
        partyId={invoice.supplierId}
        partyName={invoice.supplierNameArabic}
        settlementAmount={remainingPayableAmount}
        settlementReferenceNumber={invoice.number}
        settlementDescriptionArabic={intl.formatMessage(
          { id: 'purchase-invoice-settlement-description', defaultMessage: 'Payment for purchase invoice {number}' },
          { number: invoice.number }
        )}
        settlementDescriptionEnglish={intl.formatMessage(
          { id: 'purchase-invoice-settlement-description', defaultMessage: 'Payment for purchase invoice {number}' },
          { number: invoice.number }
        )}
        buildAllocations={(amount) => [
          {
            lineNumber: 1,
            documentType: 'PurchaseInvoice',
            documentId: invoice.id,
            documentNumber: invoice.number,
            allocatedAmount: amount,
            notes: invoice.notes ?? null
          }
        ]}
        onClose={() => setPayDialogOpen(false)}
        onSaved={async () => {
          await mutateSupplierPaymentOpenDocuments();
          await mutate();
        }}
      />
    </Box>
  );
}
