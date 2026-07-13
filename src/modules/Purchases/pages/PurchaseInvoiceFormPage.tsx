import { useEffect, useMemo, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { useNavigate, useParams, Link } from 'react-router-dom';

import Button from '@mui/material/Button';
import Grid from '@mui/material/GridLegacy';
import IconButton from '@mui/material/IconButton';
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
import Box from '@mui/material/Box';
import Autocomplete from '@mui/material/Autocomplete';
import Divider from '@mui/material/Divider';

import { IconPlus, IconTrash, IconInfoCircle, IconBox, IconCalculator, IconNotes, IconDeviceFloppy, IconSend } from '@tabler/icons-react';

import { useDispatch } from 'store';
import { openSnackbar } from 'store/slices/snackbar';
import MainCard from 'ui-component/cards/MainCard';
import Breadcrumbs from 'ui-component/extended/Breadcrumbs';
import Loader from 'ui-component/Loader';
import { createInvoice, updateInvoice, postInvoice } from '../api/purchasesApi';
import { usePurchaseInvoice } from '../hooks/usePurchases';
import { useParties } from 'modules/Parties/hooks/useParties';
import { useInventoryItems } from 'modules/Inventory/hooks/useInventory';
import type { PurchaseInvoiceInput, PurchaseLineInput } from '../types/purchases.types';
import PermissionGuard from 'modules/Administration/components/PermissionGuard';
import { PURCHASES_PERMISSIONS } from '../utils/purchases.constants';

type EditableLine = PurchaseLineInput & { itemCode?: string; unitCode?: string; itemName?: string };

const today = new Date().toISOString().slice(0, 10);

function emptyLine(): EditableLine {
  return { itemId: '', unitOfMeasureId: '', quantity: 1, unitCost: 0, discountAmount: 0, taxAmount: 0, notes: '', itemCode: '', unitCode: '', itemName: '' };
}

export default function PurchaseInvoiceFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const intl = useIntl();
  const dispatch = useDispatch();
  const isEdit = Boolean(id);
  const { invoice, isLoading } = usePurchaseInvoice(id);
  const { items: suppliers } = useParties({ page: 1, pageSize: 100, isSupplier: true, sortBy: 'nameArabic' });
  const { items: inventoryItems } = useInventoryItems({ page: 1, pageSize: 100, search: '' });
  const [form, setForm] = useState<PurchaseInvoiceInput>({
    supplierId: '',
    invoiceDate: today,
    supplierInvoiceNumber: '',
    headerDiscount: 0,
    otherCosts: 0,
    notes: '',
    lines: []
  });
  const [rows, setRows] = useState<EditableLine[]>([emptyLine()]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (invoice) {
      setForm({
        supplierId: invoice.supplierId,
        invoiceDate: invoice.invoiceDate,
        supplierInvoiceNumber: invoice.supplierInvoiceNumber ?? '',
        headerDiscount: invoice.headerDiscount,
        otherCosts: invoice.otherCosts,
        notes: invoice.notes ?? '',
        lines: []
      });
      setRows(invoice.lines.map((line) => ({
        itemId: line.itemId,
        unitOfMeasureId: line.unitOfMeasureId,
        quantity: line.quantity,
        unitCost: line.unitCost,
        discountAmount: line.discountAmount,
        taxAmount: line.taxAmount,
        notes: line.notes ?? '',
        itemCode: line.itemCode,
        unitCode: line.unitCode,
        itemName: line.itemNameArabic
      })));
    }
  }, [invoice]);

  const itemLookup = useMemo(() => new Map(inventoryItems.map((item) => [item.id, item])), [inventoryItems]);
  const supplierLookup = useMemo(() => new Map(suppliers.map((s) => [s.id, s])), [suppliers]);

  const notify = (message: string, severity: 'success' | 'error' = 'success') => {
    dispatch(openSnackbar({ open: true, message, variant: 'alert', severity }));
  };

  const updateRow = (index: number, next: Partial<EditableLine>) => {
    setRows((current) => current.map((row, rowIndex) => (rowIndex === index ? { ...row, ...next } : row)));
  };

  const addRow = () => setRows((current) => [...current, emptyLine()]);
  const removeRow = (index: number) => setRows((current) => current.filter((_, rowIndex) => rowIndex !== index));

  const onItemChange = (index: number, itemId: string) => {
    const item = itemLookup.get(itemId);
    updateRow(index, {
      itemId,
      itemCode: item?.code ?? '',
      itemName: item?.nameArabic ?? '',
      unitOfMeasureId: item?.baseUnitId ?? '',
      unitCode: item?.baseUnitCode ?? ''
    });
  };

  const submit = async (actionType: 'draft' | 'post') => {
    if (!form.supplierId) {
      notify(intl.formatMessage({ id: 'purchase-supplier-required' }), 'error');
      return;
    }
    const lines = rows
      .filter((row) => row.itemId && row.unitOfMeasureId)
      .map(({ itemId, unitOfMeasureId, quantity, unitCost, discountAmount, taxAmount, notes }) => ({
        itemId,
        unitOfMeasureId,
        quantity: Number(quantity) || 0,
        unitCost: Number(unitCost) || 0,
        discountAmount: Number(discountAmount) || 0,
        taxAmount: Number(taxAmount) || 0,
        notes: notes || null
      }));

    if (lines.length === 0) {
      notify(intl.formatMessage({ id: 'purchase-lines-required' }), 'error');
      return;
    }

    const request: PurchaseInvoiceInput = {
      ...form,
      supplierInvoiceNumber: form.supplierInvoiceNumber || null,
      notes: form.notes || null,
      lines
    };

    try {
      setIsSaving(true);
      let savedInvoiceId = '';
      let savedRowVersion = '';

      if (isEdit && invoice) {
        const saved = await updateInvoice(invoice.id, { ...request, rowVersion: invoice.rowVersion });
        savedInvoiceId = saved.id;
        savedRowVersion = saved.rowVersion;
      } else {
        const saved = await createInvoice(request);
        savedInvoiceId = saved.id;
        savedRowVersion = saved.rowVersion;
      }

      if (actionType === 'post') {
         await postInvoice(savedInvoiceId, savedRowVersion);
         notify(intl.formatMessage({ id: 'purchase-action-success' }));
         navigate(`/purchases/invoices/${savedInvoiceId}`);
      } else {
         notify(intl.formatMessage({ id: 'purchase-action-success' }));
         navigate(`/purchases/invoices/${savedInvoiceId}`);
      }

    } catch (saveError) {
      notify(saveError instanceof Error ? saveError.message : intl.formatMessage({ id: 'purchase-action-failed' }), 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const subtotal = rows.reduce((sum, row) => sum + (Number(row.quantity) || 0) * (Number(row.unitCost) || 0), 0);
  const totalLineDiscount = rows.reduce((sum, row) => sum + (Number(row.discountAmount) || 0), 0);
  const totalTax = rows.reduce((sum, row) => sum + (Number(row.taxAmount) || 0), 0);
  const grandTotal = subtotal - totalLineDiscount - (Number(form.headerDiscount) || 0) + totalTax + (Number(form.otherCosts) || 0);

  if (isEdit && isLoading) return <Loader />;

  const cardSx = { border: '1px solid', borderColor: 'divider', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', mb: 3 };
  const headerSx = { display: 'flex', alignItems: 'center', gap: 1, pb: 2, mb: 3, borderBottom: '1px solid', borderColor: 'divider' };

  return (
    <Box>
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: { xs: 'flex-start', sm: 'flex-end' }, justifyContent: 'space-between', mb: 3, gap: 2 }}>
         <Box>
           <Breadcrumbs custom card={false} title={false} divider={false} heading={isEdit ? 'edit-purchase-invoice' : 'create-purchase-invoice'} links={[{ title: 'purchases', to: '/purchases/invoices' }, { title: 'purchase-invoices', to: '/purchases/invoices' }]} sx={{ mb: 0 }} />
           <Typography variant="h2" sx={{ mt: 1 }}><FormattedMessage id={isEdit ? 'edit-purchase-invoice' : 'create-purchase-invoice'} /></Typography>
         </Box>
        <Stack direction="row" spacing={1.5} alignItems="center">
           {isEdit && invoice && (
              <Box sx={{ px: 2, py: 0.5, bgcolor: 'grey.100', color: 'text.secondary', borderRadius: 4, border: '1px solid', borderColor: 'divider' }}>
                 <Typography variant="caption"><FormattedMessage id={invoice.status.toLowerCase()} /></Typography>
              </Box>
           )}
           <Button component={Link} to="/purchases/invoices" variant="outlined" color="inherit" disabled={isSaving} sx={{ borderRadius: 2 }}>
              <FormattedMessage id="cancel" />
           </Button>
           <Button variant="contained" color="secondary" onClick={() => submit('draft')} disabled={isSaving} sx={{ borderRadius: 2 }} startIcon={<IconDeviceFloppy size={18} />}>
              <FormattedMessage id="save-as-draft" />
           </Button>
           {(!isEdit || (isEdit && invoice?.status === 'Draft')) && (
              <PermissionGuard permission={PURCHASES_PERMISSIONS.invoicesPost}>
                 <Button variant="contained" color="primary" onClick={() => submit('post')} disabled={isSaving} sx={{ borderRadius: 2, boxShadow: 2 }} startIcon={<IconSend size={18} />}>
                    <FormattedMessage id="post-invoice" />
                 </Button>
              </PermissionGuard>
           )}
        </Stack>
      </Box>

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
                           <Autocomplete
                              options={suppliers}
                              getOptionLabel={(option) => `${option.code} - ${option.nameArabic}`}
                              value={supplierLookup.get(form.supplierId) || null}
                              onChange={(_, newValue) => setForm({ ...form, supplierId: newValue?.id || '' })}
                              renderInput={(params) => <TextField {...params} required label={<FormattedMessage id="supplier" />} variant="outlined" />}
                           />
                        </Grid>
                        <Grid item xs={12} md={4}>
                           <TextField type="date" required fullWidth InputLabelProps={{ shrink: true }} label={<FormattedMessage id="invoice-date" />} value={form.invoiceDate} onChange={(event) => setForm({ ...form, invoiceDate: event.target.value })} />
                        </Grid>
                        <Grid item xs={12} md={4}>
                           <TextField fullWidth disabled label={<FormattedMessage id="invoice-number" />} value={isEdit ? invoice?.number : ''} placeholder={intl.formatMessage({ id: 'auto-generated' })} helperText={<FormattedMessage id="auto-generated-on-save" />} />
                        </Grid>
                        <Grid item xs={12} md={4}>
                           <TextField fullWidth label={<FormattedMessage id="supplier-invoice-number" />} value={form.supplierInvoiceNumber ?? ''} onChange={(event) => setForm({ ...form, supplierInvoiceNumber: event.target.value })} />
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
                     <TableContainer sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, mb: 2 }}>
                        <Table size="small" sx={{ minWidth: 900 }}>
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
                              <TableCell align="center" width={60}><FormattedMessage id="actions" /></TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {rows.map((row, index) => {
                               const lineTotal = (Number(row.quantity) || 0) * (Number(row.unitCost) || 0) - (Number(row.discountAmount) || 0) + (Number(row.taxAmount) || 0);
                               return (
                               <TableRow key={`${row.itemId || 'line'}-${index}`} hover>
                                 <TableCell align="center">{index + 1}</TableCell>
                                 <TableCell>
                                    <Autocomplete
                                       size="small"
                                       options={inventoryItems.filter((item) => item.isPurchasable)}
                                       getOptionLabel={(option) => `${option.code} - ${option.nameArabic}`}
                                       value={itemLookup.get(row.itemId) || null}
                                       onChange={(_, newValue) => onItemChange(index, newValue?.id || '')}
                                       renderInput={(params) => <TextField {...params} variant="outlined" placeholder={intl.formatMessage({ id: 'search-item' })} />}
                                    />
                                 </TableCell>
                                 <TableCell>
                                   <TextField size="small" fullWidth type="number" value={row.quantity} onChange={(event) => updateRow(index, { quantity: Number(event.target.value) })} inputProps={{ min: 1 }} />
                                 </TableCell>
                                 <TableCell>
                                   <TextField size="small" fullWidth value={row.unitCode ?? ''} InputProps={{ readOnly: true }} sx={{ bgcolor: 'grey.50' }} />
                                 </TableCell>
                                 <TableCell>
                                   <TextField size="small" fullWidth type="number" value={row.unitCost} onChange={(event) => updateRow(index, { unitCost: Number(event.target.value) })} inputProps={{ step: 0.01 }} />
                                 </TableCell>
                                 <TableCell>
                                   <TextField size="small" fullWidth type="number" value={row.discountAmount} onChange={(event) => updateRow(index, { discountAmount: Number(event.target.value) })} />
                                 </TableCell>
                                 <TableCell>
                                   <TextField size="small" fullWidth type="number" value={row.taxAmount} onChange={(event) => updateRow(index, { taxAmount: Number(event.target.value) })} />
                                 </TableCell>
                                 <TableCell>
                                    <Typography fontWeight={600}>{lineTotal.toFixed(2)}</Typography>
                                 </TableCell>
                                 <TableCell align="center">
                                   <Tooltip title={<FormattedMessage id="remove" />}>
                                     <span>
                                       <IconButton onClick={() => removeRow(index)} disabled={rows.length === 1} color="error" size="small">
                                         <IconTrash size={18} />
                                       </IconButton>
                                     </span>
                                   </Tooltip>
                                 </TableCell>
                               </TableRow>
                            )})}
                          </TableBody>
                        </Table>
                     </TableContainer>
                     <Button 
                        fullWidth 
                        variant="outlined" 
                        color="primary" 
                        onClick={addRow} 
                        startIcon={<IconPlus size={18} />}
                        sx={{ borderStyle: 'dashed', borderWidth: 1, py: 1, borderRadius: 2 }}
                     >
                        <FormattedMessage id="add-item" />
                     </Button>
                  </Box>
               </MainCard>
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
                           <Typography fontWeight={600}>{subtotal.toFixed(2)}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                           <Typography><FormattedMessage id="line-discounts" /></Typography>
                           <Typography fontWeight={600} color="text.secondary">- {totalLineDiscount.toFixed(2)}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                           <Typography><FormattedMessage id="header-discount" /></Typography>
                           <TextField size="small" type="number" value={form.headerDiscount} onChange={(e) => setForm({ ...form, headerDiscount: Number(e.target.value) })} sx={{ width: 100 }} />
                         </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                           <Typography><FormattedMessage id="other-costs" /></Typography>
                           <TextField size="small" type="number" value={form.otherCosts} onChange={(e) => setForm({ ...form, otherCosts: Number(e.target.value) })} sx={{ width: 100 }} />
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                           <Typography><FormattedMessage id="total-tax" /></Typography>
                           <Typography fontWeight={600} color="text.secondary">{totalTax.toFixed(2)}</Typography>
                        </Box>
                        <Divider sx={{ my: 1 }} />
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                           <Typography variant="h3"><FormattedMessage id="grand-total" /></Typography>
                           <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.5, color: 'primary.main' }}>
                              <Typography variant="h3" fontWeight={700}>{grandTotal.toFixed(2)}</Typography>
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
                        <Typography variant="h4"><FormattedMessage id="invoice-notes" /></Typography>
                     </Box>
                     <TextField
                        fullWidth
                        multiline
                        minRows={3}
                        placeholder={intl.formatMessage({ id: 'notes-placeholder' })}
                        value={form.notes ?? ''}
                        onChange={(event) => setForm({ ...form, notes: event.target.value })}
                     />
                  </Box>
               </MainCard>
            </Stack>
         </Grid>
      </Grid>
    </Box>
  );
}
