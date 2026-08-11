import { useState, type ReactNode } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { Link, useParams } from 'react-router-dom';

import Button from '@mui/material/Button';
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
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Alert from '@mui/material/Alert';

import { IconInfoCircle, IconBox, IconCalculator, IconNotes, IconEdit, IconSend, IconArrowBackUp, IconArrowLeft, IconX } from '@tabler/icons-react';

import { useDispatch } from 'store';
import { openSnackbar } from 'store/slices/snackbar';
import MainCard from 'ui-component/cards/MainCard';
import Breadcrumbs from 'ui-component/extended/Breadcrumbs';
import PageTitle from 'ui-component/PageTitle';
import Loader from 'ui-component/Loader';
import PermissionGuard from 'modules/Administration/components/PermissionGuard';
import SalesAccountingStatusChip from '../components/SalesAccountingStatusChip';
import SalesStatusChip from '../components/SalesStatusChip';
import { cancelInvoice, collectInvoice, postInvoice } from '../api/salesApi';
import { useSalesInvoice } from '../hooks/useSales';
import { SALES_PERMISSIONS } from '../utils/sales.constants';
import { useTreasuryAccounts } from 'modules/Treasury/hooks/useTreasury';
import InvoiceSettlementDialog from 'shared/components/InvoiceSettlementDialog';
import {
  getInvoicePaymentMethodLabel,
  getInvoiceSettlementStatusLabel,
  normalizeInvoicePaymentMethod,
  normalizeInvoiceSettlementStatus
} from 'shared/utils/invoiceSettlement';

function InfoRow({ label, children }: { label: ReactNode; children: ReactNode }) {
  return (
    <Box>
      <Typography variant="caption" color="text.secondary" display="block" fontWeight={600} sx={{ mb: 0.25, textTransform: 'uppercase', letterSpacing: 0.5, fontSize: '0.7rem' }}>
        {label}
      </Typography>
      <Typography variant="body2" fontWeight={500}>
        {children}
      </Typography>
    </Box>
  );
}

export default function SalesInvoiceDetailsPage() {
  const { id } = useParams();
  const intl = useIntl();
  const dispatch = useDispatch();
  const { invoice, isLoading, error, mutate } = useSalesInvoice(id);
  const { items: treasuryAccounts } = useTreasuryAccounts({ page: 1, pageSize: 100, isActive: true });
  const [reason, setReason] = useState('');
  const [collectDialogOpen, setCollectDialogOpen] = useState(false);
  const customerControlAccountLabel = invoice?.customerControlAccountCode
    ? `${invoice.customerControlAccountCode}${invoice.customerControlAccountNameArabic ? ` - ${invoice.customerControlAccountNameArabic}` : ''}`
    : '—';
  const revenueAccountLabel = invoice?.revenueOrReturnAccountCode
    ? `${invoice.revenueOrReturnAccountCode}${invoice.revenueOrReturnAccountNameArabic ? ` - ${invoice.revenueOrReturnAccountNameArabic}` : ''}`
    : '—';
  const inventoryAssetAccountLabel = invoice?.inventoryAssetAccountCode
    ? `${invoice.inventoryAssetAccountCode}${invoice.inventoryAssetAccountArabicName ? ` - ${invoice.inventoryAssetAccountArabicName}` : ''}`
    : '—';
  const cogsAccountLabel = invoice?.costOfGoodsSoldAccountCode
    ? `${invoice.costOfGoodsSoldAccountCode}${invoice.costOfGoodsSoldAccountArabicName ? ` - ${invoice.costOfGoodsSoldAccountArabicName}` : ''}`
    : '—';
  const inventoryCostAccountingStatus = invoice?.inventoryCostAccountingStatus ?? '—';
  const recognizedInventoryCost = invoice?.recognizedInventoryCost ?? 0;
  const noInventoryMovement = invoice?.inventoryCostAccountingStatus === 'لا توجد حركة مخزون لهذا المستند';

  const paymentMethod = normalizeInvoicePaymentMethod(invoice?.paymentMethod) ?? 'Credit';
  const settlementStatus = normalizeInvoiceSettlementStatus(invoice?.settlementStatus) ?? 'Outstanding';
  const paymentMethodLabel = getInvoicePaymentMethodLabel(intl.locale, paymentMethod);
  const settlementStatusLabel = getInvoiceSettlementStatusLabel(intl.locale, settlementStatus);
  const isCreditOutstanding = invoice?.status === 'Posted' && paymentMethod === 'Credit' && settlementStatus === 'Outstanding';

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
      notify(intl.formatMessage({ id: 'sales-action-success' }));
    } catch (actionError) {
      notify(actionError instanceof Error ? actionError.message : intl.formatMessage({ id: 'sales-action-failed' }), 'error');
    }
  };

  const handleCollect = async (request: { paymentMethod: 'Cash' | 'Wallet' | 'InstaPay'; treasuryAccountId: string }) => {
    if (!invoice) {
      return;
    }

    try {
      await collectInvoice(invoice.id, { rowVersion: invoice.rowVersion, ...request });
      notify(intl.formatMessage({ id: 'sales-invoice-collected', defaultMessage: 'Sales invoice collected successfully.' }));
      await mutate();
      setCollectDialogOpen(false);
    } catch (actionError) {
      notify(actionError instanceof Error ? actionError.message : intl.formatMessage({ id: 'sales-action-failed' }), 'error');
    }
  };

  if (isLoading) return <Loader />;
  if (error || !invoice) return <Typography color="error"><FormattedMessage id="sales-load-error" /></Typography>;

  const cardSx = { border: '1px solid', borderColor: 'divider', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', mb: 3 };
  const headerSx = { display: 'flex', alignItems: 'center', gap: 1, pb: 2, mb: 3, borderBottom: '1px solid', borderColor: 'divider' };

  return (
    <Box>
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: { xs: 'flex-start', sm: 'flex-end' }, justifyContent: 'space-between', mb: 3, gap: 2 }}>
         <Box>
           <Breadcrumbs custom card={false} title={false} divider={false} heading="sales-invoice-details" links={[{ title: 'sales', to: '/sales/invoices' }, { title: 'sales-invoices', to: '/sales/invoices' }]} sx={{ mb: 0 }} />
           <PageTitle>{invoice.number} - {invoice.customerNameArabic}</PageTitle>
         </Box>
        <Stack direction="row" spacing={1.5} alignItems="center">
           <Box sx={{ mr: 1 }}>
              <SalesStatusChip status={invoice.status} />
            </Box>
            <SalesAccountingStatusChip
              isAccountingPosted={invoice.isAccountingPosted}
              accountingPostingStatus={invoice.accountingPostingStatus}
            />
           
           <Button component={Link} to="/sales/invoices" variant="outlined" color="inherit" sx={{ borderRadius: 2 }} startIcon={<IconArrowLeft size={18} />}>
              <FormattedMessage id="back" />
           </Button>

           <PermissionGuard permission={SALES_PERMISSIONS.invoicesUpdate}>
             {invoice.status === 'Draft' && (
                <Button component={Link} to={`/sales/invoices/${invoice.id}/edit`} variant="outlined" color="primary" sx={{ borderRadius: 2 }} startIcon={<IconEdit size={18} />}>
                   <FormattedMessage id="edit" />
                </Button>
             )}
           </PermissionGuard>

           <PermissionGuard permission={SALES_PERMISSIONS.invoicesPost}>
             {invoice.status === 'Draft' && (
                <Button variant="contained" color="primary" onClick={() => runAction(() => postInvoice(invoice.id, invoice.rowVersion))} sx={{ borderRadius: 2, boxShadow: 2 }} startIcon={<IconSend size={18} />}>
                   <FormattedMessage id="post" />
                </Button>
             )}
           </PermissionGuard>

           <PermissionGuard permission={SALES_PERMISSIONS.invoicesPost}>
             {isCreditOutstanding && (
               <Button variant="contained" color="success" onClick={() => setCollectDialogOpen(true)} sx={{ borderRadius: 2 }} startIcon={<IconSend size={18} />}>
                 <FormattedMessage id="collect-invoice" defaultMessage="Collect Invoice" />
               </Button>
             )}
           </PermissionGuard>

           <PermissionGuard permission={SALES_PERMISSIONS.returnsCreate}>
             {invoice.status === 'Posted' && (
                <Button component={Link} to={`/sales/returns/new?salesInvoiceId=${invoice.id}`} variant="contained" color="secondary" sx={{ borderRadius: 2 }} startIcon={<IconArrowBackUp size={18} />}>
                   <FormattedMessage id="create-sales-return" />
                </Button>
             )}
           </PermissionGuard>
        </Stack>
      </Box>

      {invoice.status === 'Cancelled' && (
         <Alert severity="error" sx={{ mb: 3, borderRadius: 2, border: '1px solid', borderColor: 'error.light' }}>
            <Typography variant="subtitle1" fontWeight={600} gutterBottom><FormattedMessage id="invoice-cancelled" /></Typography>
            {/* If there's a reason on the invoice object we show it, else generic message */}
            <Typography variant="body2">{(invoice as any).cancelReason || <FormattedMessage id="no-cancel-reason" />}</Typography>
         </Alert>
      )}

      <Grid container spacing={3}>
         <Grid item xs={12} lg={8}>
            <Stack spacing={3}>
               <MainCard sx={cardSx} content={false}>
                  <Box sx={{ p: 3 }}>
                     <Box sx={headerSx}>
                        <IconInfoCircle color="var(--mui-palette-primary-main)" />
                        <Typography variant="h4"><FormattedMessage id="basic-information" /></Typography>
                     </Box>
                     <Grid container spacing={3}>
                        <Grid item xs={12} md={4}>
                           <Typography variant="caption" color="text.secondary" display="block" gutterBottom><FormattedMessage id="customer" /></Typography>
                           <Typography variant="body1" fontWeight={500}>{invoice.customerCode} - {invoice.customerNameArabic}</Typography>
                        </Grid>
                        <Grid item xs={12} md={4}>
                           <Typography variant="caption" color="text.secondary" display="block" gutterBottom><FormattedMessage id="invoice-date" /></Typography>
                           <Typography variant="body1" fontWeight={500}>{invoice.invoiceDate}</Typography>
                        </Grid>
                        <Grid item xs={12} md={4}>
                           <Typography variant="caption" color="text.secondary" display="block" gutterBottom><FormattedMessage id="due-date" defaultMessage="تاريخ الاستحقاق" /></Typography>
                           <Typography variant="body1" fontWeight={500}>{invoice.dueDate ?? '-'}</Typography>
                        </Grid>
                        <Grid item xs={12} md={4}>
                           <Typography variant="caption" color="text.secondary" display="block" gutterBottom><FormattedMessage id="invoice-number" /></Typography>
                           <Typography variant="body1" fontWeight={500}>{invoice.number}</Typography>
                        </Grid>
                        <Grid item xs={12} md={4}>
                           <Typography variant="caption" color="text.secondary" display="block" gutterBottom><FormattedMessage id="customer-reference-number" /></Typography>
                           <Typography variant="body1" fontWeight={500}>{invoice.customerReferenceNumber ?? '-'}</Typography>
                        </Grid>
                        <Grid item xs={12} md={4}>
                           <InfoRow label={<FormattedMessage id="payment-method" defaultMessage="Payment Method" />}>{paymentMethodLabel}</InfoRow>
                        </Grid>
                        <Grid item xs={12} md={4}>
                           <InfoRow label={<FormattedMessage id="settlement-status" defaultMessage="Settlement Status" />}>{settlementStatusLabel}</InfoRow>
                        </Grid>
                        <Grid item xs={12} md={4}>
                           <InfoRow label={<FormattedMessage id="treasury-account" defaultMessage="Treasury Account" />}>
                             {invoice.treasuryAccountCode ? `${invoice.treasuryAccountCode}${invoice.treasuryAccountNameArabic ? ` - ${invoice.treasuryAccountNameArabic}` : ''}` : '-'}
                           </InfoRow>
                        </Grid>
                     </Grid>
                  </Box>
               </MainCard>

               <MainCard sx={cardSx} content={false}>
                  <Box sx={{ p: 3 }}>
                     <Box sx={headerSx}>
                        <IconBox color="var(--mui-palette-primary-main)" />
                        <Typography variant="h4"><FormattedMessage id="item-details" /></Typography>
                     </Box>
                     <TableContainer sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                        <Table size="small" sx={{ minWidth: 900 }}>
                          <TableHead sx={{ bgcolor: 'grey.50' }}>
                            <TableRow>
                              <TableCell align="center" width={40}>#</TableCell>
                              <TableCell sx={{ minWidth: 200 }}><FormattedMessage id="item" /></TableCell>
                              <TableCell sx={{ minWidth: 100 }}><FormattedMessage id="quantity" /></TableCell>
                              <TableCell sx={{ minWidth: 100 }}><FormattedMessage id="unit" /></TableCell>
                              <TableCell sx={{ minWidth: 120 }}><FormattedMessage id="unit-price" /></TableCell>
                              <TableCell sx={{ minWidth: 120 }}><FormattedMessage id="discount" /></TableCell>
                              <TableCell sx={{ minWidth: 120 }}><FormattedMessage id="tax" /></TableCell>
                              <TableCell sx={{ minWidth: 120 }}><FormattedMessage id="line-total" /></TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {invoice.lines.map((line, index) => (
                               <TableRow key={line.id} hover>
                                 <TableCell align="center">{index + 1}</TableCell>
                                 <TableCell>{line.itemCode} - {line.itemNameArabic}</TableCell>
                                 <TableCell>{line.quantity}</TableCell>
                                 <TableCell>{line.unitCode}</TableCell>
                                 <TableCell>{line.unitPrice.toFixed(2)}</TableCell>
                                 <TableCell>{line.discountAmount.toFixed(2)}</TableCell>
                                 <TableCell>{line.taxAmount.toFixed(2)}</TableCell>
                                 <TableCell><Typography fontWeight={600}>{line.lineTotal.toFixed(2)}</Typography></TableCell>
                               </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                     </TableContainer>
                  </Box>
               </MainCard>

               <PermissionGuard permission={SALES_PERMISSIONS.invoicesCancel}>
                 {invoice.status === 'Posted' && (
                   <MainCard sx={{ ...cardSx, borderColor: 'error.light' }} content={false}>
                     <Box sx={{ p: 3 }}>
                        <Box sx={{ ...headerSx, borderColor: 'error.light' }}>
                           <IconX color="var(--mui-palette-error-main)" />
                           <Typography variant="h4" color="error.main"><FormattedMessage id="cancel-document" /></Typography>
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
                        <Typography variant="h4"><FormattedMessage id="totals-summary" /></Typography>
                     </Box>
                     <Stack spacing={2}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                           <Typography><FormattedMessage id="subtotal" /></Typography>
                           <Typography fontWeight={600}>{invoice.subtotal.toFixed(2)}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                           <Typography><FormattedMessage id="header-discount" /></Typography>
                           <Typography fontWeight={600} color="error.main">- {(invoice.headerDiscount || 0).toFixed(2)}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                           <Typography><FormattedMessage id="other-charges" /></Typography>
                           <Typography fontWeight={600}>{(invoice.otherCharges || 0).toFixed(2)}</Typography>
                        </Box>
                        <Divider sx={{ my: 1 }} />
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                           <Typography variant="h3"><FormattedMessage id="grand-total" /></Typography>
                           <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.5, color: 'primary.main' }}>
                              <Typography variant="h3" fontWeight={700}>{invoice.grandTotal.toFixed(2)}</Typography>
                              <Typography variant="body2" color="text.secondary"><FormattedMessage id="currency" /></Typography>
                           </Box>
                        </Box>
                     </Stack>
                  </Box>
               </MainCard>

               <MainCard sx={cardSx} content={false}>
                  <Box sx={{ p: 3 }}>
                     <Box sx={headerSx}>
                        <IconInfoCircle color="var(--mui-palette-primary-main)" />
                        <Typography variant="h4"><FormattedMessage id="accounting" defaultMessage="الحسابات العامة" /></Typography>
                     </Box>
                     <Stack spacing={2}>
                        <Box>
                           <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                              <FormattedMessage id="accounting-posting-status" defaultMessage="حالة الترحيل" />
                           </Typography>
                           <Typography variant="body2" fontWeight={500}>
                              {invoice.accountingPostingStatus || 'غير مرحل محاسبيًا'}
                           </Typography>
                        </Box>
                        <Box>
                           <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                              <FormattedMessage id="customer-control" defaultMessage="حساب العملاء" />
                           </Typography>
                           <Typography variant="body2" fontWeight={500}>
                              {customerControlAccountLabel}
                           </Typography>
                        </Box>
                        <Box>
                           <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                              <FormattedMessage id="sales-revenue" defaultMessage="إيراد المبيعات" />
                           </Typography>
                           <Typography variant="body2" fontWeight={500}>
                              {revenueAccountLabel}
                           </Typography>
                        </Box>
                        <Box>
                           <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                              <FormattedMessage id="journal-entry" defaultMessage="القيد اليومي" />
                           </Typography>
                           {invoice.accountingJournalEntryId ? (
                              <Button component={Link} to={`/accounting/journal-entries/${invoice.accountingJournalEntryId}`} size="small" variant="outlined">
                                 {invoice.accountingEntryNumber ?? invoice.accountingJournalEntryId}
                              </Button>
                           ) : (
                              <Typography variant="body2" fontWeight={500}>—</Typography>
                           )}
                        </Box>
                     </Stack>
                  </Box>
               </MainCard>

               <MainCard sx={cardSx} content={false}>
                  <Box sx={{ p: 3 }}>
                     <Box sx={headerSx}>
                        <IconBox color="var(--mui-palette-primary-main)" />
                        <Typography variant="h4">التأثير على المخزون والتكلفة</Typography>
                     </Box>
                     <Stack spacing={2}>
                        {noInventoryMovement && (
                          <Typography variant="body2" color="text.secondary">
                            لا توجد حركة مخزون لهذا المستند.
                          </Typography>
                        )}
                        <Box>
                           <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                              تكلفة المخزون المعترف بها
                           </Typography>
                           <Typography variant="body2" fontWeight={500}>
                              {recognizedInventoryCost.toFixed(2)}
                           </Typography>
                        </Box>
                        <Box>
                           <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                              حساب المخزون
                           </Typography>
                           <Typography variant="body2" fontWeight={500}>
                              {inventoryAssetAccountLabel}
                           </Typography>
                        </Box>
                        <Box>
                           <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                              حساب تكلفة البضاعة المباعة
                           </Typography>
                           <Typography variant="body2" fontWeight={500}>
                              {cogsAccountLabel}
                           </Typography>
                        </Box>
                        <Box>
                           <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                              حالة ترحيل التكلفة
                           </Typography>
                           <Typography variant="body2" fontWeight={500}>
                              {inventoryCostAccountingStatus}
                           </Typography>
                        </Box>
                        <Box>
                           <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                              <FormattedMessage id="journal-entry" defaultMessage="القيد اليومي" />
                           </Typography>
                           {invoice.accountingJournalEntryId ? (
                              <Button component={Link} to={`/accounting/journal-entries/${invoice.accountingJournalEntryId}`} size="small" variant="outlined">
                                 {invoice.accountingEntryNumber ?? invoice.accountingJournalEntryId}
                              </Button>
                           ) : (
                              <Typography variant="body2" fontWeight={500}>—</Typography>
                           )}
                        </Box>
                     </Stack>
                  </Box>
               </MainCard>

               <MainCard sx={cardSx} content={false}>
                  <Box sx={{ p: 3 }}>
                     <Box sx={headerSx}>
                        <IconNotes color="var(--mui-palette-primary-main)" />
                        <Typography variant="h4"><FormattedMessage id="invoice-notes" /></Typography>
                     </Box>
                     <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', color: invoice.notes ? 'text.primary' : 'text.disabled' }}>
                        {invoice.notes || '-'}
                     </Typography>
                  </Box>
               </MainCard>
            </Stack>
         </Grid>
      </Grid>
      <InvoiceSettlementDialog
        open={collectDialogOpen}
        title={<FormattedMessage id="collect-invoice" defaultMessage="Collect Invoice" />}
        confirmLabel={<FormattedMessage id="collect-invoice" defaultMessage="Collect Invoice" />}
        invoiceCurrencyCode={invoice.currencyCode}
        treasuryAccounts={treasuryAccounts}
        onClose={() => setCollectDialogOpen(false)}
        onConfirm={handleCollect}
      />
    </Box>
  );
}
