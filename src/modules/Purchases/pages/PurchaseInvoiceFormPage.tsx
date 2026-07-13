import { FormEvent, useEffect, useMemo, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { useNavigate, useParams } from 'react-router-dom';

import Button from '@mui/material/Button';
import Grid from '@mui/material/GridLegacy';
import IconButton from '@mui/material/IconButton';
import MenuItem from '@mui/material/MenuItem';
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
import { IconPlus, IconTrash } from '@tabler/icons-react';

import { useDispatch } from 'store';
import { openSnackbar } from 'store/slices/snackbar';
import MainCard from 'ui-component/cards/MainCard';
import Breadcrumbs from 'ui-component/extended/Breadcrumbs';
import Loader from 'ui-component/Loader';
import { createInvoice, updateInvoice } from '../api/purchasesApi';
import { usePurchaseInvoice } from '../hooks/usePurchases';
import { useParties } from 'modules/Parties/hooks/useParties';
import { useInventoryItems } from 'modules/Inventory/hooks/useInventory';
import type { PurchaseInvoiceInput, PurchaseLineInput } from '../types/purchases.types';

type EditableLine = PurchaseLineInput & { itemCode?: string; unitCode?: string };

const today = new Date().toISOString().slice(0, 10);

function emptyLine(): EditableLine {
  return { itemId: '', unitOfMeasureId: '', quantity: 1, unitCost: 0, discountAmount: 0, taxAmount: 0, notes: '', itemCode: '', unitCode: '' };
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
        unitCode: line.unitCode
      })));
    }
  }, [invoice]);

  const itemLookup = useMemo(() => new Map(inventoryItems.map((item) => [item.id, item])), [inventoryItems]);

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
      unitOfMeasureId: item?.baseUnitId ?? '',
      unitCode: item?.baseUnitCode ?? ''
    });
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
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
      if (isEdit && invoice) {
        const saved = await updateInvoice(invoice.id, { ...request, rowVersion: invoice.rowVersion });
        notify(intl.formatMessage({ id: 'purchase-action-success' }));
        navigate(`/purchases/invoices/${saved.id}`);
        return;
      }

      const saved = await createInvoice(request);
      notify(intl.formatMessage({ id: 'purchase-action-success' }));
      navigate(`/purchases/invoices/${saved.id}`);
    } catch (saveError) {
      notify(saveError instanceof Error ? saveError.message : intl.formatMessage({ id: 'purchase-action-failed' }), 'error');
    } finally {
      setIsSaving(false);
    }
  };

  if (isEdit && isLoading) return <Loader />;

  return (
    <>
      <Breadcrumbs custom heading={isEdit ? 'edit-purchase-invoice' : 'create-purchase-invoice'} links={[{ title: 'purchases', to: '/purchases/invoices' }, { title: 'purchase-invoices', to: '/purchases/invoices' }]} />
      <MainCard title={<FormattedMessage id={isEdit ? 'edit-purchase-invoice' : 'create-purchase-invoice'} />}>
        <form onSubmit={submit}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <TextField select required fullWidth label={<FormattedMessage id="supplier" />} value={form.supplierId} onChange={(event) => setForm({ ...form, supplierId: event.target.value })}>
                <MenuItem value=""><FormattedMessage id="none" /></MenuItem>
                {suppliers.map((supplier) => (
                  <MenuItem key={supplier.id} value={supplier.id}>
                    {supplier.code} - {supplier.nameArabic}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField type="date" required fullWidth InputLabelProps={{ shrink: true }} label={<FormattedMessage id="invoice-date" />} value={form.invoiceDate} onChange={(event) => setForm({ ...form, invoiceDate: event.target.value })} />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField fullWidth label={<FormattedMessage id="supplier-invoice-number" />} value={form.supplierInvoiceNumber ?? ''} onChange={(event) => setForm({ ...form, supplierInvoiceNumber: event.target.value })} />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField type="number" fullWidth label={<FormattedMessage id="header-discount" />} value={form.headerDiscount} onChange={(event) => setForm({ ...form, headerDiscount: Number(event.target.value) })} />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField type="number" fullWidth label={<FormattedMessage id="other-costs" />} value={form.otherCosts} onChange={(event) => setForm({ ...form, otherCosts: Number(event.target.value) })} />
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography color="text.secondary" sx={{ pt: 1 }}>
                <FormattedMessage id="purchases-line-help" />
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell><FormattedMessage id="item" /></TableCell>
                      <TableCell><FormattedMessage id="unit" /></TableCell>
                      <TableCell><FormattedMessage id="quantity" /></TableCell>
                      <TableCell><FormattedMessage id="unit-cost" /></TableCell>
                      <TableCell><FormattedMessage id="discount" /></TableCell>
                      <TableCell><FormattedMessage id="tax" /></TableCell>
                      <TableCell><FormattedMessage id="notes" /></TableCell>
                      <TableCell align="right">
                        <Button size="small" startIcon={<IconPlus size={16} />} onClick={addRow} type="button">
                          <FormattedMessage id="add-line" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {rows.map((row, index) => (
                      <TableRow key={`${row.itemId || 'line'}-${index}`}>
                        <TableCell sx={{ minWidth: 220 }}>
                          <TextField select fullWidth size="small" value={row.itemId} onChange={(event) => onItemChange(index, event.target.value)}>
                            <MenuItem value=""><FormattedMessage id="none" /></MenuItem>
                            {inventoryItems.filter((item) => item.isPurchasable).map((item) => (
                              <MenuItem key={item.id} value={item.id}>
                                {item.code} - {item.nameArabic}
                              </MenuItem>
                            ))}
                          </TextField>
                        </TableCell>
                        <TableCell sx={{ minWidth: 120 }}>
                          <TextField size="small" fullWidth value={row.unitCode ?? ''} InputProps={{ readOnly: true }} />
                        </TableCell>
                        <TableCell sx={{ minWidth: 110 }}>
                          <TextField size="small" fullWidth type="number" value={row.quantity} onChange={(event) => updateRow(index, { quantity: Number(event.target.value) })} />
                        </TableCell>
                        <TableCell sx={{ minWidth: 120 }}>
                          <TextField size="small" fullWidth type="number" value={row.unitCost} onChange={(event) => updateRow(index, { unitCost: Number(event.target.value) })} />
                        </TableCell>
                        <TableCell sx={{ minWidth: 120 }}>
                          <TextField size="small" fullWidth type="number" value={row.discountAmount} onChange={(event) => updateRow(index, { discountAmount: Number(event.target.value) })} />
                        </TableCell>
                        <TableCell sx={{ minWidth: 120 }}>
                          <TextField size="small" fullWidth type="number" value={row.taxAmount} onChange={(event) => updateRow(index, { taxAmount: Number(event.target.value) })} />
                        </TableCell>
                        <TableCell sx={{ minWidth: 180 }}>
                          <TextField size="small" fullWidth value={row.notes ?? ''} onChange={(event) => updateRow(index, { notes: event.target.value })} />
                        </TableCell>
                        <TableCell align="right">
                          <Tooltip title={<FormattedMessage id="remove" />}>
                            <span>
                              <IconButton onClick={() => removeRow(index)} disabled={rows.length === 1} type="button">
                                <IconTrash size={18} />
                              </IconButton>
                            </span>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth multiline minRows={3} label={<FormattedMessage id="notes" />} value={form.notes ?? ''} onChange={(event) => setForm({ ...form, notes: event.target.value })} />
            </Grid>
            <Grid item xs={12}>
              <Stack direction="row" spacing={1}>
                <Button type="submit" variant="contained" disabled={isSaving}><FormattedMessage id="save" /></Button>
                <Button onClick={() => navigate('/purchases/invoices')} disabled={isSaving}><FormattedMessage id="cancel" /></Button>
              </Stack>
            </Grid>
          </Grid>
        </form>
      </MainCard>
    </>
  );
}
