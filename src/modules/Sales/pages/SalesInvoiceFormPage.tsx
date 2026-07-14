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
import MenuItem from '@mui/material/MenuItem';
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
import PageTitle from 'ui-component/PageTitle';
import Loader from 'ui-component/Loader';
import { createInvoice, updateInvoice, postInvoice } from '../api/salesApi';
import { useSalesInvoice } from '../hooks/useSales';
import { useParties } from 'modules/Parties/hooks/useParties';
import { useInventoryItems } from 'modules/Inventory/hooks/useInventory';
import { getItemUnits } from 'modules/Inventory/api/inventoryApi';
import type { ItemUnitDto } from 'modules/Inventory/types/inventory.types';
import type { SalesInvoiceInput, SalesLineInput } from '../types/sales.types';
import PermissionGuard from 'modules/Administration/components/PermissionGuard';
import { SALES_PERMISSIONS } from '../utils/sales.constants';

type EditableLine = SalesLineInput & {
  itemCode?: string;
  unitCode?: string;
  itemName?: string;
  factorToBase?: number;
  priceSource?: 'auto' | 'manual';
  unitOptions: ItemUnitDto[];
};

const today = new Date().toISOString().slice(0, 10);

function emptyLine(): EditableLine {
  return {
    itemId: '',
    unitOfMeasureId: '',
    quantity: 1,
    unitPrice: 0,
    discountAmount: 0,
    taxAmount: 0,
    notes: '',
    itemCode: '',
    unitCode: '',
    itemName: '',
    factorToBase: 1,
    priceSource: 'auto',
    unitOptions: []
  };
}

export default function SalesInvoiceFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const intl = useIntl();
  const dispatch = useDispatch();
  const isEdit = Boolean(id);
  const { invoice, isLoading } = useSalesInvoice(id);
  const { items: customers } = useParties({ page: 1, pageSize: 100, isCustomer: true, sortBy: 'nameArabic' });
  const { items: inventoryItems } = useInventoryItems({ page: 1, pageSize: 100, search: '' });
  const [form, setForm] = useState<SalesInvoiceInput>({
    customerId: '',
    invoiceDate: today,
    customerReferenceNumber: '',
    headerDiscount: 0,
    otherCharges: 0,
    notes: '',
    lines: []
  });
  const [rows, setRows] = useState<EditableLine[]>([emptyLine()]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    let active = true;

    if (invoice) {
      setForm({
        customerId: invoice.customerId,
        invoiceDate: invoice.invoiceDate,
        customerReferenceNumber: invoice.customerReferenceNumber ?? '',
        headerDiscount: invoice.headerDiscount,
        otherCharges: invoice.otherCharges,
        notes: invoice.notes ?? '',
        lines: []
      });

      Promise.all(
        invoice.lines.map(async (line): Promise<EditableLine> => {
          const unitOptions = await getItemUnits(line.itemId).catch(() => []);
          const selectedUnit = unitOptions.find((unit) => unit.unitOfMeasureId === line.unitOfMeasureId);
          return {
            itemId: line.itemId,
            unitOfMeasureId: line.unitOfMeasureId,
            quantity: line.quantity,
            unitPrice: line.unitPrice,
            discountAmount: line.discountAmount,
            taxAmount: line.taxAmount,
            notes: line.notes ?? '',
            itemCode: line.itemCode,
            unitCode: line.unitCode,
            itemName: line.itemNameArabic,
            factorToBase: selectedUnit?.conversionFactor ?? selectedUnit?.factorToBase ?? line.conversionFactor,
            priceSource: 'manual',
            unitOptions
          };
        })
      ).then((loadedRows) => {
        if (active) setRows(loadedRows);
      });
    }

    return () => {
      active = false;
    };
  }, [invoice]);

  const itemLookup = useMemo(() => new Map(inventoryItems.map((item) => [item.id, item])), [inventoryItems]);
  const customerLookup = useMemo(() => new Map(customers.map((s) => [s.id, s])), [customers]);

  const notify = (message: string, severity: 'success' | 'error' = 'success') => {
    dispatch(openSnackbar({ open: true, message, variant: 'alert', severity }));
  };

  const updateRow = (index: number, next: Partial<EditableLine>) => {
    setRows((current) => current.map((row, rowIndex) => (rowIndex === index ? { ...row, ...next } : row)));
  };

  const resolveSuggestedUnitPrice = (itemId: string, unitOptions: ItemUnitDto[], unitId?: string) => {
    const item = itemLookup.get(itemId);
    if (!item) {
      return 0;
    }

    const selectedUnit = unitOptions.find((unit) => unit.unitOfMeasureId === unitId);
    if (selectedUnit) {
      return selectedUnit.effectiveSalePrice ?? item.defaultSalePrice;
    }

    return item.defaultSalePrice;
  };

  const addRow = () => setRows((current) => [...current, emptyLine()]);
  const removeRow = (index: number) => setRows((current) => current.filter((_, rowIndex) => rowIndex !== index));

  const onItemChange = async (index: number, itemId: string) => {
    const item = itemLookup.get(itemId);
    if (!item) {
      updateRow(index, {
        itemId: '',
        itemCode: '',
        itemName: '',
        unitOfMeasureId: '',
        unitCode: '',
        factorToBase: 1,
        unitPrice: 0,
        priceSource: 'auto',
        unitOptions: []
      });
      return;
    }

    const unitOptions = await getItemUnits(itemId).catch(() => []);
    const selectedUnit =
      unitOptions.find((unit) => unit.isDefaultSalesUnit) ??
      unitOptions.find((unit) => unit.unitOfMeasureId === item.baseUnitId) ??
      unitOptions[0];

    updateRow(index, {
      itemId,
      itemCode: item.code,
      itemName: item.nameArabic,
      unitOfMeasureId: selectedUnit?.unitOfMeasureId ?? item.baseUnitId,
      unitCode: selectedUnit?.unitCode ?? item.baseUnitCode,
      factorToBase: selectedUnit?.conversionFactor ?? selectedUnit?.factorToBase ?? 1,
      unitPrice: resolveSuggestedUnitPrice(itemId, unitOptions, selectedUnit?.unitOfMeasureId ?? item.baseUnitId),
      priceSource: 'auto',
      unitOptions
    });
  };

  const submit = async (actionType: 'draft' | 'post') => {
    if (!form.customerId) {
      notify(intl.formatMessage({ id: 'sales-customer-required' }), 'error');
      return;
    }
    const lines = rows
      .filter((row) => row.itemId && row.unitOfMeasureId)
      .map(({ itemId, unitOfMeasureId, quantity, unitPrice, discountAmount, taxAmount, notes }) => ({
        itemId,
        unitOfMeasureId,
        quantity: Number(quantity) || 0,
        unitPrice: Number(unitPrice) || 0,
        discountAmount: Number(discountAmount) || 0,
        taxAmount: Number(taxAmount) || 0,
        notes: notes || null
      }));

    if (lines.length === 0) {
      notify(intl.formatMessage({ id: 'sales-lines-required' }), 'error');
      return;
    }

    const request: SalesInvoiceInput = {
      ...form,
      customerReferenceNumber: form.customerReferenceNumber || null,
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
         notify(intl.formatMessage({ id: 'sales-action-success' }));
         navigate(`/sales/invoices/${savedInvoiceId}`);
      } else {
         notify(intl.formatMessage({ id: 'sales-action-success' }));
         navigate(`/sales/invoices/${savedInvoiceId}`);
      }

    } catch (saveError) {
      notify(saveError instanceof Error ? saveError.message : intl.formatMessage({ id: 'sales-action-failed' }), 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const subtotal = rows.reduce((sum, row) => sum + (Number(row.quantity) || 0) * (Number(row.unitPrice) || 0), 0);
  const totalLineDiscount = rows.reduce((sum, row) => sum + (Number(row.discountAmount) || 0), 0);
  const totalTax = rows.reduce((sum, row) => sum + (Number(row.taxAmount) || 0), 0);
  const grandTotal = subtotal - totalLineDiscount - (Number(form.headerDiscount) || 0) + totalTax + (Number(form.otherCharges) || 0);

  if (isEdit && isLoading) return <Loader />;

  const cardSx = { border: '1px solid', borderColor: 'divider', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', mb: 3, borderRadius: 2 };
  const headerSx = { display: 'flex', alignItems: 'center', gap: 1, pb: 2, mb: 3, borderBottom: '1px solid', borderColor: 'divider' };

  return (
    <Box>
      {/* Top Header */}
      <Box sx={{ mb: 3 }}>
         <Breadcrumbs custom card={false} title={false} divider={false} heading={isEdit ? 'edit-sales-invoice' : 'create-sales-invoice'} links={[{ title: 'sales', to: '/sales/invoices' }, { title: 'sales-invoices', to: '/sales/invoices' }]} sx={{ mb: 0 }} />
         <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 1 }}>
            <PageTitle><FormattedMessage id={isEdit ? 'edit-sales-invoice' : 'create-sales-invoice'} /></PageTitle>
            {isEdit && invoice && (
               <Box sx={{ px: 2, py: 0.5, bgcolor: 'grey.100', color: 'text.secondary', borderRadius: 4, border: '1px solid', borderColor: 'divider' }}>
                  <Typography variant="caption" fontWeight={600}><FormattedMessage id={`sales.status.${invoice.status.toLowerCase()}`} /></Typography>
               </Box>
            )}
         </Box>
      </Box>

      {/* Basic Info Card */}
      <MainCard sx={cardSx} content={false}>
         <Box sx={{ p: 3 }}>
            <Box sx={headerSx}>
               <IconInfoCircle color="var(--mui-palette-primary-main)" size={24} />
               <Typography variant="h4" fontWeight={600}><FormattedMessage id="basic-information" /></Typography>
            </Box>
            <Grid container spacing={4}>
               <Grid item xs={12} md={4}>
                  <Autocomplete
                     options={customers}
                     getOptionLabel={(option) => `${option.code} - ${option.nameArabic}`}
                     value={customerLookup.get(form.customerId) || null}
                     onChange={(_, newValue) => setForm({ ...form, customerId: newValue?.id || '' })}
                     renderInput={(params) => <TextField {...params} required label={<FormattedMessage id="customer" />} variant="outlined" InputLabelProps={{ shrink: true }} />}
                  />
               </Grid>
               <Grid item xs={12} md={4}>
                  <TextField type="date" required fullWidth InputLabelProps={{ shrink: true }} label={<FormattedMessage id="invoice-date" />} value={form.invoiceDate} onChange={(event) => setForm({ ...form, invoiceDate: event.target.value })} />
               </Grid>
               <Grid item xs={12} md={4}>
                  <Box sx={{ bgcolor: 'grey.50', p: 1.5, borderRadius: 1, border: '1px dashed', borderColor: 'divider', textAlign: 'center' }}>
                     <Typography variant="caption" color="text.secondary" display="block"><FormattedMessage id="invoice-number" /></Typography>
                     <Typography variant="body1" fontWeight={600}>{isEdit ? invoice?.number : intl.formatMessage({ id: 'auto-generated' })}</Typography>
                  </Box>
               </Grid>
            </Grid>
         </Box>
      </MainCard>

      {/* Item Details Card */}
      <MainCard sx={cardSx} content={false}>
         <Box sx={{ p: 3 }}>
            <Box sx={headerSx}>
               <IconBox color="var(--mui-palette-primary-main)" size={24} />
               <Typography variant="h4" fontWeight={600}><FormattedMessage id="item-details" /></Typography>
            </Box>
            <TableContainer sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, mb: 3 }}>
               <Table size="small" sx={{ minWidth: 1080 }}>
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
                     <TableCell align="center" width={60}><FormattedMessage id="actions" /></TableCell>
                   </TableRow>
                 </TableHead>
                 <TableBody>
                   {rows.map((row, index) => {
                      const lineTotal = (Number(row.quantity) || 0) * (Number(row.unitPrice) || 0) - (Number(row.discountAmount) || 0) + (Number(row.taxAmount) || 0);
                      return (
                      <TableRow key={`${row.itemId || 'line'}-${index}`} hover>
                        {[
                          <TableCell key="index" align="center">{index + 1}</TableCell>,
                          <TableCell key="item">
                             <Autocomplete
                                size="small"
                                options={inventoryItems.filter((item) => item.isSellable)}
                                getOptionLabel={(option) => `${option.code} - ${option.nameArabic}`}
                                value={itemLookup.get(row.itemId) || null}
                                onChange={(_, newValue) => onItemChange(index, newValue?.id || '')}
                                renderInput={(params) => <TextField {...params} variant="outlined" placeholder={intl.formatMessage({ id: 'search-item' })} />}
                             />
                          </TableCell>,
                          <TableCell key="quantity">
                            <TextField size="small" fullWidth type="number" value={row.quantity} onChange={(event) => updateRow(index, { quantity: Number(event.target.value) })} inputProps={{ min: 1 }} />
                          </TableCell>,
                          <TableCell key="unit">
                            <TextField
                              size="small"
                              select
                              fullWidth
                              value={row.unitOfMeasureId}
                              onChange={(event) => {
                                const selectedUnit = row.unitOptions.find((unit) => unit.unitOfMeasureId === event.target.value);
                                updateRow(index, {
                                  unitOfMeasureId: event.target.value,
                                  unitCode: selectedUnit?.unitCode ?? '',
                                  factorToBase: selectedUnit?.conversionFactor ?? selectedUnit?.factorToBase ?? 1,
                                  unitPrice: resolveSuggestedUnitPrice(row.itemId, row.unitOptions, event.target.value),
                                  priceSource: 'auto'
                                });
                              }}
                            >
                              {row.unitOptions.map((unit) => (
                                <MenuItem key={unit.unitOfMeasureId} value={unit.unitOfMeasureId}>
                                  {unit.unitCode}
                                </MenuItem>
                              ))}
                            </TextField>
                          </TableCell>,
                          <TableCell key="price">
                            <TextField
                              size="small"
                              fullWidth
                              type="number"
                              value={row.unitPrice}
                              onChange={(event) => updateRow(index, { unitPrice: Number(event.target.value), priceSource: 'manual' })}
                              inputProps={{ step: 0.0001, min: 0 }}
                            />
                          </TableCell>,
                          <TableCell key="discount">
                            <TextField size="small" fullWidth type="number" value={row.discountAmount} onChange={(event) => updateRow(index, { discountAmount: Number(event.target.value) })} />
                          </TableCell>,
                          <TableCell key="tax">
                            <TextField size="small" fullWidth type="number" value={row.taxAmount} onChange={(event) => updateRow(index, { taxAmount: Number(event.target.value) })} />
                          </TableCell>,
                          <TableCell key="total">
                             <Typography fontWeight={600} color="primary.main">{lineTotal.toFixed(2)}</Typography>
                          </TableCell>,
                          <TableCell key="actions" align="center">
                            <Tooltip title={<FormattedMessage id="remove" />}>
                              <span>
                                <IconButton onClick={() => removeRow(index)} disabled={rows.length === 1} color="error" size="small">
                                  <IconTrash size={18} />
                                </IconButton>
                              </span>
                            </Tooltip>
                          </TableCell>
                        ]}
                      </TableRow>
                   )})}
                 </TableBody>
               </Table>
            </TableContainer>
            <Box sx={{ display: 'flex', justifyContent: 'flex-start' }}>
               <Button
                  variant="outlined"
                  color="primary"
                  onClick={addRow}
                  startIcon={<IconPlus size={18} />}
                  sx={{ borderRadius: 2, px: 3 }}
               >
                  <FormattedMessage id="add-item" defaultMessage="إضافة صنف جديد" />
               </Button>
            </Box>
         </Box>
      </MainCard>

      {/* Bottom Section: Notes and Summary */}
      <Grid container spacing={3}>
         {/* Invoice Notes */}
         <Grid item xs={12} md={6}>
            <MainCard sx={{ ...cardSx, height: '100%', mb: 0 }} content={false}>
               <Box sx={{ p: 3 }}>
                  <Box sx={headerSx}>
                     <IconNotes color="var(--mui-palette-primary-main)" size={24} />
                     <Typography variant="h4" fontWeight={600}><FormattedMessage id="invoice-notes" /></Typography>
                  </Box>
                  <TextField
                     fullWidth
                     multiline
                     minRows={5}
                     placeholder={intl.formatMessage({ id: 'notes-placeholder', defaultMessage: 'أضف أي ملاحظات أو شروط خاصة بهذه الفاتورة هنا...' })}
                     value={form.notes ?? ''}
                     onChange={(event) => setForm({ ...form, notes: event.target.value })}
                     sx={{ '& .MuiOutlinedInput-root': { bgcolor: 'grey.50' } }}
                  />
               </Box>
            </MainCard>
         </Grid>

         {/* Account Summary */}
         <Grid item xs={12} md={6}>
            <MainCard sx={{ ...cardSx, height: '100%', mb: 0 }} content={false}>
               <Box sx={{ p: 3 }}>
                  <Box sx={headerSx}>
                     <IconCalculator color="var(--mui-palette-primary-main)" size={24} />
                     <Typography variant="h4" fontWeight={600}><FormattedMessage id="totals-summary" defaultMessage="ملخص الحسابات" /></Typography>
                  </Box>
                  <Stack spacing={2.5}>
                     <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography fontWeight={500}><FormattedMessage id="subtotal" /></Typography>
                        <Typography fontWeight={600} fontSize="1.1rem">{subtotal.toFixed(2)}</Typography>
                     </Box>
                     <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography fontWeight={500}><FormattedMessage id="line-discounts" /></Typography>
                        <Typography fontWeight={600} color="text.secondary">- {totalLineDiscount.toFixed(2)}</Typography>
                     </Box>
                     <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography fontWeight={500}><FormattedMessage id="header-discount" /></Typography>
                        <TextField size="small" type="number" value={form.headerDiscount} onChange={(e) => setForm({ ...form, headerDiscount: Number(e.target.value) })} sx={{ width: 120 }} />
                      </Box>
                     <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography fontWeight={500}><FormattedMessage id="total-tax" /></Typography>
                        <Typography fontWeight={600} color="text.secondary">{totalTax.toFixed(2)}</Typography>
                     </Box>
                     <Divider sx={{ my: 1 }} />
                     <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="h3" fontWeight={700}><FormattedMessage id="grand-total" defaultMessage="الإجمالي النهائي" /></Typography>
                        <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, color: 'primary.main' }}>
                           <Typography variant="h2" fontWeight={800}>{grandTotal.toFixed(2)}</Typography>
                           <Typography variant="body1" fontWeight={600} color="text.secondary"><FormattedMessage id="currency" /></Typography>
                        </Box>
                     </Box>
                  </Stack>
               </Box>
            </MainCard>
         </Grid>
      </Grid>

      {/* Action Buttons */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 4, mb: 2, gap: 2 }}>
         <Button component={Link} to="/sales/invoices" variant="outlined" color="inherit" disabled={isSaving} sx={{ borderRadius: 2, px: 4 }}>
            <FormattedMessage id="cancel" />
         </Button>
         <Button variant="contained" color="secondary" onClick={() => submit('draft')} disabled={isSaving} sx={{ borderRadius: 2, px: 4 }} startIcon={<IconDeviceFloppy size={18} />}>
            <FormattedMessage id="save-as-draft" />
         </Button>
         {(!isEdit || (isEdit && invoice?.status === 'Draft')) && (
            <PermissionGuard permission={SALES_PERMISSIONS.invoicesPost}>
               <Button variant="contained" color="primary" onClick={() => submit('post')} disabled={isSaving} sx={{ borderRadius: 2, px: 4, boxShadow: 2 }} startIcon={<IconSend size={18} />}>
                  <FormattedMessage id="post-invoice" defaultMessage="اعتماد الفاتورة" />
               </Button>
            </PermissionGuard>
         )}
      </Box>
    </Box>
  );
}
