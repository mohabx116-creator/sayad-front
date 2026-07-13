import { FormEvent, useEffect, useMemo, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';

import Button from '@mui/material/Button';
import Grid from '@mui/material/GridLegacy';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';

import { useDispatch } from 'store';
import { openSnackbar } from 'store/slices/snackbar';
import MainCard from 'ui-component/cards/MainCard';
import Breadcrumbs from 'ui-component/extended/Breadcrumbs';
import Loader from 'ui-component/Loader';
import { createReturn, updateReturn } from '../api/purchasesApi';
import { usePurchaseInvoice, usePurchaseReturn } from '../hooks/usePurchases';
import type { PurchaseReturnInput, PurchaseReturnLineInput } from '../types/purchases.types';
import PurchaseStatusChip from '../components/PurchaseStatusChip';
import { usePurchaseInvoices } from '../hooks/usePurchases';

type EditableLine = PurchaseReturnLineInput & { itemLabel?: string; maxQuantity?: number };

const today = new Date().toISOString().slice(0, 10);

function emptyLine(): EditableLine {
  return { purchaseInvoiceLineId: '', quantity: 1, notes: '', itemLabel: '', maxQuantity: 1 };
}

export default function PurchaseReturnFormPage() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const intl = useIntl();
  const dispatch = useDispatch();
  const isEdit = Boolean(id);
  const { purchaseReturn, isLoading: returnLoading } = usePurchaseReturn(id);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState(searchParams.get('purchaseInvoiceId') ?? '');
  const { invoice: selectedInvoice, isLoading: invoiceLoading } = usePurchaseInvoice(isEdit ? purchaseReturn?.purchaseInvoiceId : selectedInvoiceId || undefined);
  const { items: postedInvoices } = usePurchaseInvoices({ page: 1, pageSize: 100, status: 'Posted', sortBy: 'invoiceDate', sortDirection: 'desc' });
  const [form, setForm] = useState<PurchaseReturnInput>({
    purchaseInvoiceId: '',
    returnDate: today,
    notes: '',
    lines: []
  });
  const [rows, setRows] = useState<EditableLine[]>([emptyLine()]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (purchaseReturn) {
      setForm({
        purchaseInvoiceId: purchaseReturn.purchaseInvoiceId,
        returnDate: purchaseReturn.returnDate,
        notes: purchaseReturn.notes ?? '',
        lines: []
      });
      setRows(purchaseReturn.lines.map((line) => ({
        purchaseInvoiceLineId: line.id,
        quantity: line.quantity,
        notes: line.notes ?? '',
        itemLabel: `${line.itemCode} - ${line.itemNameArabic}`,
        maxQuantity: line.quantity
      })));
    }
  }, [purchaseReturn]);

  useEffect(() => {
    if (selectedInvoice && !isEdit) {
      setForm((current) => ({ ...current, purchaseInvoiceId: selectedInvoice.id }));
      setRows(selectedInvoice.lines.map((line) => ({
        purchaseInvoiceLineId: line.id,
        quantity: 1,
        notes: '',
        itemLabel: `${line.itemCode} - ${line.itemNameArabic}`,
        maxQuantity: line.quantity
      })));
    }
  }, [isEdit, selectedInvoice]);

  const invoiceLines = useMemo(() => selectedInvoice?.lines ?? [], [selectedInvoice]);

  const notify = (message: string, severity: 'success' | 'error' = 'success') => {
    dispatch(openSnackbar({ open: true, message, variant: 'alert', severity }));
  };

  const updateRow = (index: number, next: Partial<EditableLine>) => {
    setRows((current) => current.map((row, rowIndex) => (rowIndex === index ? { ...row, ...next } : row)));
  };

  const addRow = () => setRows((current) => [...current, emptyLine()]);
  const removeRow = (index: number) => setRows((current) => current.filter((_, rowIndex) => rowIndex !== index));

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!form.purchaseInvoiceId) {
      notify(intl.formatMessage({ id: 'purchase-invoice-required' }), 'error');
      return;
    }

    const lines = rows
      .filter((row) => row.purchaseInvoiceLineId)
      .map(({ purchaseInvoiceLineId, quantity, notes }) => ({
        purchaseInvoiceLineId,
        quantity: Number(quantity) || 0,
        notes: notes || null
      }));

    if (lines.length === 0) {
      notify(intl.formatMessage({ id: 'purchase-return-lines-required' }), 'error');
      return;
    }

    const request: PurchaseReturnInput = {
      purchaseInvoiceId: form.purchaseInvoiceId,
      returnDate: form.returnDate,
      notes: form.notes || null,
      lines
    };

    try {
      setIsSaving(true);
      if (isEdit && purchaseReturn) {
        const saved = await updateReturn(purchaseReturn.id, { ...request, rowVersion: purchaseReturn.rowVersion });
        notify(intl.formatMessage({ id: 'purchase-action-success' }));
        navigate(`/purchases/returns/${saved.id}`);
        return;
      }

      const saved = await createReturn(request);
      notify(intl.formatMessage({ id: 'purchase-action-success' }));
      navigate(`/purchases/returns/${saved.id}`);
    } catch (saveError) {
      notify(saveError instanceof Error ? saveError.message : intl.formatMessage({ id: 'purchase-action-failed' }), 'error');
    } finally {
      setIsSaving(false);
    }
  };

  if ((isEdit && returnLoading) || (!isEdit && invoiceLoading && selectedInvoiceId)) return <Loader />;

  return (
    <>
      <Breadcrumbs custom heading={isEdit ? 'edit-purchase-return' : 'create-purchase-return'} links={[{ title: 'purchases', to: '/purchases/returns' }, { title: 'purchase-returns', to: '/purchases/returns' }]} />
      <MainCard title={<FormattedMessage id={isEdit ? 'edit-purchase-return' : 'create-purchase-return'} />}>
        <form onSubmit={submit}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <TextField
                select
                required
                fullWidth
                label={<FormattedMessage id="purchase-invoice" />}
                value={form.purchaseInvoiceId}
                disabled={isEdit}
                onChange={(event) => {
                  setSelectedInvoiceId(event.target.value);
                  setForm({ ...form, purchaseInvoiceId: event.target.value });
                }}
              >
                <MenuItem value=""><FormattedMessage id="none" /></MenuItem>
                {postedInvoices.map((invoice) => (
                  <MenuItem key={invoice.id} value={invoice.id}>
                    {invoice.number} - {invoice.supplierNameArabic}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField type="date" required fullWidth InputLabelProps={{ shrink: true }} label={<FormattedMessage id="return-date" />} value={form.returnDate} onChange={(event) => setForm({ ...form, returnDate: event.target.value })} />
            </Grid>
            <Grid item xs={12} md={4}>
              {selectedInvoice && (
                <Stack direction="row" spacing={1} alignItems="center" sx={{ pt: 1 }}>
                  <FormattedMessage id="purchase-invoice" />
                  <PurchaseStatusChip status={selectedInvoice.status} />
                </Stack>
              )}
            </Grid>
            <Grid item xs={12}>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell><FormattedMessage id="item" /></TableCell>
                      <TableCell><FormattedMessage id="returnable-quantity" /></TableCell>
                      <TableCell><FormattedMessage id="quantity" /></TableCell>
                      <TableCell><FormattedMessage id="notes" /></TableCell>
                      <TableCell align="right">
                        <Button size="small" onClick={addRow} startIcon={<span>+</span>} type="button">
                          <FormattedMessage id="add-line" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {rows.map((row, index) => (
                      <TableRow key={`${row.purchaseInvoiceLineId || 'line'}-${index}`}>
                        <TableCell sx={{ minWidth: 260 }}>
                          <TextField select fullWidth size="small" value={row.purchaseInvoiceLineId} onChange={(event) => {
                            const line = invoiceLines.find((invoiceLine) => invoiceLine.id === event.target.value);
                            updateRow(index, {
                              purchaseInvoiceLineId: event.target.value,
                              itemLabel: line ? `${line.itemCode} - ${line.itemNameArabic}` : '',
                              maxQuantity: line?.quantity ?? 1,
                              quantity: line ? Math.min(row.quantity || 1, line.quantity) : row.quantity
                            });
                          }}>
                            <MenuItem value=""><FormattedMessage id="none" /></MenuItem>
                            {invoiceLines.map((line) => (
                              <MenuItem key={line.id} value={line.id}>
                                {line.itemCode} - {line.itemNameArabic}
                              </MenuItem>
                            ))}
                          </TextField>
                        </TableCell>
                        <TableCell>{row.maxQuantity ?? 1}</TableCell>
                        <TableCell sx={{ minWidth: 120 }}>
                          <TextField size="small" fullWidth type="number" value={row.quantity} onChange={(event) => updateRow(index, { quantity: Number(event.target.value) })} />
                        </TableCell>
                        <TableCell sx={{ minWidth: 180 }}>
                          <TextField size="small" fullWidth value={row.notes ?? ''} onChange={(event) => updateRow(index, { notes: event.target.value })} />
                        </TableCell>
                        <TableCell align="right">
                          <Button size="small" onClick={() => removeRow(index)} disabled={rows.length === 1} type="button">
                            <FormattedMessage id="remove" />
                          </Button>
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
                <Button onClick={() => navigate('/purchases/returns')} disabled={isSaving}><FormattedMessage id="cancel" /></Button>
              </Stack>
            </Grid>
          </Grid>
        </form>
      </MainCard>
    </>
  );
}
