import { useState } from 'react';
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
import Loader from 'ui-component/Loader';
import PermissionGuard from 'modules/Administration/components/PermissionGuard';
import PurchaseStatusChip from '../components/PurchaseStatusChip';
import { cancelInvoice, postInvoice } from '../api/purchasesApi';
import { usePurchaseInvoice } from '../hooks/usePurchases';
import { PURCHASES_PERMISSIONS } from '../utils/purchases.constants';

export default function PurchaseInvoiceDetailsPage() {
  const { id } = useParams();
  const intl = useIntl();
  const dispatch = useDispatch();
  const { invoice, isLoading, error, mutate } = usePurchaseInvoice(id);
  const [reason, setReason] = useState('');

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

  if (isLoading) return <Loader />;
  if (error || !invoice) return <Typography color="error"><FormattedMessage id="purchase-load-error" /></Typography>;

  const cardSx = { border: '1px solid', borderColor: 'divider', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', mb: 3 };
  const headerSx = { display: 'flex', alignItems: 'center', gap: 1, pb: 2, mb: 3, borderBottom: '1px solid', borderColor: 'divider' };

  return (
    <Box>
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: { xs: 'flex-start', sm: 'flex-end' }, justifyContent: 'space-between', mb: 3, gap: 2 }}>
        <Box>
           <Breadcrumbs custom heading="purchase-invoice-details" links={[{ title: 'purchases', to: '/purchases/invoices' }, { title: 'purchase-invoices', to: '/purchases/invoices' }]} sx={{ mb: 1 }} />
           <Typography variant="h2">{invoice.number} - {invoice.supplierNameArabic}</Typography>
        </Box>
        <Stack direction="row" spacing={1.5} alignItems="center">
           <Box sx={{ mr: 1 }}>
              <PurchaseStatusChip status={invoice.status} />
           </Box>
           
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
            <Typography variant="subtitle1" fontWeight={600} gutterBottom><FormattedMessage id="invoice-cancelled" defaultMessage="This invoice has been cancelled." /></Typography>
            {/* If there's a reason on the invoice object we show it, else generic message */}
            <Typography variant="body2">{(invoice as any).cancelReason || <FormattedMessage id="no-cancel-reason" defaultMessage="No reason provided." />}</Typography>
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
                           <Typography variant="caption" color="text.secondary" display="block" gutterBottom><FormattedMessage id="supplier" /></Typography>
                           <Typography variant="body1" fontWeight={500}>{invoice.supplierCode} - {invoice.supplierNameArabic}</Typography>
                        </Grid>
                        <Grid item xs={12} md={4}>
                           <Typography variant="caption" color="text.secondary" display="block" gutterBottom><FormattedMessage id="invoice-date" /></Typography>
                           <Typography variant="body1" fontWeight={500}>{invoice.invoiceDate}</Typography>
                        </Grid>
                        <Grid item xs={12} md={4}>
                           <Typography variant="caption" color="text.secondary" display="block" gutterBottom><FormattedMessage id="invoice-number" /></Typography>
                           <Typography variant="body1" fontWeight={500}>{invoice.number}</Typography>
                        </Grid>
                        <Grid item xs={12} md={4}>
                           <Typography variant="caption" color="text.secondary" display="block" gutterBottom><FormattedMessage id="supplier-invoice-number" /></Typography>
                           <Typography variant="body1" fontWeight={500}>{invoice.supplierInvoiceNumber ?? '-'}</Typography>
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
                        <Table size="small">
                          <TableHead sx={{ bgcolor: 'grey.50' }}>
                            <TableRow>
                              <TableCell align="center" width={40}>#</TableCell>
                              <TableCell sx={{ minWidth: 200 }}><FormattedMessage id="item" /></TableCell>
                              <TableCell sx={{ minWidth: 100 }}><FormattedMessage id="quantity" /></TableCell>
                              <TableCell sx={{ minWidth: 100 }}><FormattedMessage id="unit" /></TableCell>
                              <TableCell sx={{ minWidth: 120 }}><FormattedMessage id="unit-cost" /></TableCell>
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
                                 <TableCell>{line.unitCost.toFixed(2)}</TableCell>
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

               <PermissionGuard permission={PURCHASES_PERMISSIONS.invoicesCancel}>
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
            <Stack spacing={3} sx={{ height: '100%' }}>
               <MainCard sx={{ ...cardSx, display: 'flex', flexDirection: 'column' }} content={false}>
                  <Box sx={{ p: 3, flex: 1, display: 'flex', flexDirection: 'column' }}>
                     <Box sx={headerSx}>
                        <IconNotes color="var(--mui-palette-primary-main)" />
                        <Typography variant="h4"><FormattedMessage id="invoice-notes" /></Typography>
                     </Box>
                     <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', color: invoice.notes ? 'text.primary' : 'text.disabled' }}>
                        {invoice.notes || '-'}
                     </Typography>
                  </Box>
               </MainCard>

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
                        {/* Wait, total discounts = header + line discounts? The UI shows header discount separately. The original details page doesn't show line discounts separately, but let's show header discount and other costs if available. */}
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                           <Typography><FormattedMessage id="header-discount" /></Typography>
                           <Typography fontWeight={600} color="error.main">- {(invoice.headerDiscount || 0).toFixed(2)}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                           <Typography><FormattedMessage id="other-costs" /></Typography>
                           <Typography fontWeight={600}>{(invoice.otherCosts || 0).toFixed(2)}</Typography>
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
            </Stack>
         </Grid>
      </Grid>
    </Box>
  );
}
