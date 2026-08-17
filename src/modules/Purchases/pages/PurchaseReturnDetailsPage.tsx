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

import { IconInfoCircle, IconBox, IconCalculator, IconNotes, IconEdit, IconSend, IconArrowLeft, IconX } from '@tabler/icons-react';

import { useDispatch } from 'store';
import { openSnackbar } from 'store/slices/snackbar';
import MainCard from 'ui-component/cards/MainCard';
import Breadcrumbs from 'ui-component/extended/Breadcrumbs';
import PageTitle from 'ui-component/PageTitle';
import Loader from 'ui-component/Loader';
import PermissionGuard from 'modules/Administration/components/PermissionGuard';
import { resolveLocalizedText } from 'shared/utils/localizedText';
import PurchaseAccountingStatusChip from '../components/PurchaseAccountingStatusChip';
import PurchaseStatusChip from '../components/PurchaseStatusChip';
import { cancelReturn, postReturn } from '../api/purchasesApi';
import { usePurchaseReturn } from '../hooks/usePurchases';
import { PURCHASES_PERMISSIONS } from '../utils/purchases.constants';

function formatCodeNameLabel(locale: string, code: string | null | undefined, nameArabic: string | null | undefined, nameEnglish: string | null | undefined) {
  const resolvedName = resolveLocalizedText(locale, nameArabic, nameEnglish, '');
  if (code) {
    return resolvedName ? `${code} - ${resolvedName}` : code;
  }

  return resolvedName || '-';
}

export default function PurchaseReturnDetailsPage() {
  const { id } = useParams();
  const intl = useIntl();
  const dispatch = useDispatch();
  const { purchaseReturn, isLoading, error, mutate } = usePurchaseReturn(id);
  const [reason, setReason] = useState('');

  const notify = (message: string, severity: 'success' | 'error' = 'success') => {
    dispatch(openSnackbar({ open: true, message, variant: 'alert', severity }));
  };

  const runAction = async (action: () => Promise<unknown>) => {
    try {
      await action();
      await mutate();
      notify(intl.formatMessage({ id: 'purchase-action-success' }));
    } catch (actionError) {
      notify(actionError instanceof Error ? actionError.message : intl.formatMessage({ id: 'purchase-action-failed' }), 'error');
    }
  };

  if (isLoading) return <Loader />;
  if (error || !purchaseReturn) return <Typography color="error"><FormattedMessage id="purchase-load-error" /></Typography>;

  const cardSx = { border: '1px solid', borderColor: 'divider', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', mb: 3 };
  const headerSx = { display: 'flex', alignItems: 'center', gap: 1, pb: 2, mb: 3, borderBottom: '1px solid', borderColor: 'divider' };

  return (
    <Box>
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: { xs: 'flex-start', sm: 'flex-end' }, justifyContent: 'space-between', mb: 3, gap: 2 }}>
         <Box>
           <Breadcrumbs custom card={false} title={false} divider={false} heading="purchase-return-details" links={[{ title: 'purchases', to: '/purchases/returns' }, { title: 'purchase-returns', to: '/purchases/returns' }]} sx={{ mb: 0 }} />
           <PageTitle>{purchaseReturn.number} - {purchaseReturn.purchaseInvoiceNumber}</PageTitle>
         </Box>
        <Stack direction="row" spacing={1.5} alignItems="center">
           <Box sx={{ mr: 1 }}>
              <PurchaseStatusChip status={purchaseReturn.status} />
           </Box>
           <PurchaseAccountingStatusChip
             isAccountingPosted={purchaseReturn.isAccountingPosted}
             accountingPostingStatus={purchaseReturn.accountingPostingStatus}
           />
           
           <Button component={Link} to="/purchases/returns" variant="outlined" color="inherit" sx={{ borderRadius: 2 }} startIcon={<IconArrowLeft size={18} />}>
              <FormattedMessage id="back" />
           </Button>

           <PermissionGuard permission={PURCHASES_PERMISSIONS.returnsUpdate}>
             {purchaseReturn.status === 'Draft' && (
                <Button component={Link} to={`/purchases/returns/${purchaseReturn.id}/edit`} variant="outlined" color="primary" sx={{ borderRadius: 2 }} startIcon={<IconEdit size={18} />}>
                   <FormattedMessage id="edit" />
                </Button>
             )}
           </PermissionGuard>

           <PermissionGuard permission={PURCHASES_PERMISSIONS.returnsPost}>
             {purchaseReturn.status === 'Draft' && (
                <Button variant="contained" color="primary" onClick={() => runAction(() => postReturn(purchaseReturn.id, purchaseReturn.rowVersion))} sx={{ borderRadius: 2, boxShadow: 2 }} startIcon={<IconSend size={18} />}>
                   <FormattedMessage id="post" />
                </Button>
             )}
           </PermissionGuard>
        </Stack>
      </Box>

      {purchaseReturn.status === 'Cancelled' && (
         <Alert severity="error" sx={{ mb: 3, borderRadius: 2, border: '1px solid', borderColor: 'error.light' }}>
            <Typography variant="subtitle1" fontWeight={600} gutterBottom><FormattedMessage id="return-cancelled" /></Typography>
            <Typography variant="body2">{purchaseReturn.cancellationReason || <FormattedMessage id="no-cancel-reason" />}</Typography>
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
                           <Typography variant="caption" color="text.secondary" display="block" gutterBottom><FormattedMessage id="purchase-invoice" /></Typography>
                           <Typography variant="body1" fontWeight={500}>{purchaseReturn.purchaseInvoiceNumber}</Typography>
                        </Grid>
                        <Grid item xs={12} md={4}>
                           <Typography variant="caption" color="text.secondary" display="block" gutterBottom><FormattedMessage id="return-date" /></Typography>
                           <Typography variant="body1" fontWeight={500}>{purchaseReturn.returnDate}</Typography>
                        </Grid>
                        <Grid item xs={12} md={4}>
                           <Typography variant="caption" color="text.secondary" display="block" gutterBottom><FormattedMessage id="return-number" /></Typography>
                           <Typography variant="body1" fontWeight={500}>{purchaseReturn.number}</Typography>
                        </Grid>
                     </Grid>
                  </Box>
               </MainCard>

               <MainCard sx={cardSx} content={false}>
                  <Box sx={{ p: 3 }}>
                     <Box sx={headerSx}>
                        <IconBox color="var(--mui-palette-primary-main)" />
                        <Typography variant="h4"><FormattedMessage id="return-lines" /></Typography>
                     </Box>
                     <TableContainer sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                        <Table size="small" sx={{ minWidth: 900 }}>
                          <TableHead sx={{ bgcolor: 'grey.50' }}>
                            <TableRow>
                              <TableCell align="center" width={40}>#</TableCell>
                              <TableCell sx={{ minWidth: 200 }}><FormattedMessage id="item" /></TableCell>
                              <TableCell sx={{ minWidth: 100 }}><FormattedMessage id="unit" /></TableCell>
                              <TableCell sx={{ minWidth: 100 }}><FormattedMessage id="quantity" /></TableCell>
                              <TableCell sx={{ minWidth: 120 }}><FormattedMessage id="unit-cost" /></TableCell>
                              <TableCell sx={{ minWidth: 120 }}><FormattedMessage id="discount" /></TableCell>
                              <TableCell sx={{ minWidth: 120 }}><FormattedMessage id="tax" /></TableCell>
                              <TableCell sx={{ minWidth: 120 }}><FormattedMessage id="line-total" /></TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {purchaseReturn.lines.map((line, index) => (
                               <TableRow key={line.id} hover>
                                 <TableCell align="center">{index + 1}</TableCell>
                                 <TableCell>{line.itemCode} - {line.itemNameArabic}</TableCell>
                                 <TableCell>{line.unitCode}</TableCell>
                                 <TableCell>{line.quantity}</TableCell>
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

               <PermissionGuard permission={PURCHASES_PERMISSIONS.returnsCancel}>
                 {purchaseReturn.status === 'Posted' && (
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
                             onClick={() => runAction(() => cancelReturn(purchaseReturn.id, { reason, rowVersion: purchaseReturn.rowVersion }))}
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
                           <Typography fontWeight={600}>{purchaseReturn.subtotal.toFixed(2)}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                           <Typography><FormattedMessage id="total-discount" /></Typography>
                           <Typography fontWeight={600} color="error.main">- {(purchaseReturn.discountTotal || 0).toFixed(2)}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                           <Typography><FormattedMessage id="total-tax" /></Typography>
                           <Typography fontWeight={600}>{(purchaseReturn.taxTotal || 0).toFixed(2)}</Typography>
                        </Box>
                        <Divider sx={{ my: 1 }} />
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                           <Typography variant="h3"><FormattedMessage id="grand-total" /></Typography>
                           <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.5, color: 'primary.main' }}>
                              <Typography variant="h3" fontWeight={700}>{purchaseReturn.grandTotal.toFixed(2)}</Typography>
                              <Typography variant="body2" color="text.secondary"><FormattedMessage id="currency" /></Typography>
                           </Box>
                        </Box>
                     </Stack>
                  </Box>
               </MainCard>

               <MainCard sx={cardSx} content={false}>
                  <Box sx={{ p: 3 }}>
                     <Box sx={headerSx}>
                        <IconNotes color="var(--mui-palette-primary-main)" />
                        <Typography variant="h4"><FormattedMessage id="return-notes" /></Typography>
                     </Box>
                     <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', color: purchaseReturn.notes ? 'text.primary' : 'text.disabled' }}>
                        {purchaseReturn.notes || '-'}
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
                           <PurchaseAccountingStatusChip
                             isAccountingPosted={purchaseReturn.isAccountingPosted}
                             accountingPostingStatus={purchaseReturn.accountingPostingStatus}
                           />
                        </Box>
                        <Box>
                           <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                              القيد المحاسبي
                           </Typography>
                           {purchaseReturn.accountingJournalEntryId ? (
                             <Button component={Link} to={`/accounting/journal-entries/${purchaseReturn.accountingJournalEntryId}`} variant="outlined" size="small" sx={{ borderRadius: 2 }}>
                                {purchaseReturn.accountingEntryNumber || purchaseReturn.accountingJournalEntryId}
                             </Button>
                           ) : (
                             <Typography variant="body2" color="text.secondary">{purchaseReturn.accountingPostingStatus}</Typography>
                           )}
                        </Box>
                        <Box>
                           <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                              حساب الموردين
                           </Typography>
                           <Typography variant="body2" fontWeight={600}>
                              {formatCodeNameLabel(
                                intl.locale,
                                purchaseReturn.supplierControlAccountCode,
                                purchaseReturn.supplierControlAccountArabicName,
                                purchaseReturn.supplierControlAccountEnglishName
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
                                purchaseReturn.inventoryAssetAccountCode,
                                purchaseReturn.inventoryAssetAccountArabicName,
                                purchaseReturn.inventoryAssetAccountEnglishName
                              )}
                           </Typography>
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
