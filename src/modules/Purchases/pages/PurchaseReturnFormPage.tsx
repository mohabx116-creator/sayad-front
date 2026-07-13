import { useEffect, useMemo, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { useNavigate, useParams, useSearchParams, Link } from 'react-router-dom';

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
import Box from '@mui/material/Box';

import { IconPlus, IconTrash, IconInfoCircle, IconBox, IconNotes, IconDeviceFloppy, IconSend } from '@tabler/icons-react';

import { useDispatch } from 'store';
import { openSnackbar } from 'store/slices/snackbar';
import MainCard from 'ui-component/cards/MainCard';
import Breadcrumbs from 'ui-component/extended/Breadcrumbs';
import Loader from 'ui-component/Loader';
import { createReturn, updateReturn, postReturn } from '../api/purchasesApi';
import { usePurchaseInvoice, usePurchaseReturn, usePurchaseInvoices } from '../hooks/usePurchases';
import type { PurchaseReturnInput, PurchaseReturnLineInput } from '../types/purchases.types';
import PermissionGuard from 'modules/Administration/components/PermissionGuard';
import { PURCHASES_PERMISSIONS } from '../utils/purchases.constants';

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
        purchaseInvoiceLineId: line.id, // Assuming this is used for matching. If it's the actual line id, backend handles it.
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

  const submit = async (actionType: 'draft' | 'post') => {
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
      ...form,
      notes: form.notes || null,
      lines
    };

    try {
      setIsSaving(true);
      let savedReturnId = '';
      let savedRowVersion = '';

      if (isEdit && purchaseReturn) {
        const saved = await updateReturn(purchaseReturn.id, { ...request, rowVersion: purchaseReturn.rowVersion });
        savedReturnId = saved.id;
        savedRowVersion = saved.rowVersion;
      } else {
        const saved = await createReturn(request);
        savedReturnId = saved.id;
        savedRowVersion = saved.rowVersion;
      }

      if (actionType === 'post') {
         await postReturn(savedReturnId, savedRowVersion);
         notify(intl.formatMessage({ id: 'purchase-action-success' }));
         navigate(`/purchases/returns/${savedReturnId}`);
      } else {
         notify(intl.formatMessage({ id: 'purchase-action-success' }));
         navigate(`/purchases/returns/${savedReturnId}`);
      }

    } catch (saveError) {
      notify(saveError instanceof Error ? saveError.message : intl.formatMessage({ id: 'purchase-action-failed' }), 'error');
    } finally {
      setIsSaving(false);
    }
  };

  if ((isEdit && returnLoading) || (!isEdit && invoiceLoading && selectedInvoiceId)) return <Loader />;

  const cardSx = { border: '1px solid', borderColor: 'divider', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', mb: 3 };
  const headerSx = { display: 'flex', alignItems: 'center', gap: 1, pb: 2, mb: 3, borderBottom: '1px solid', borderColor: 'divider' };

  return (
    <Box>
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: { xs: 'flex-start', sm: 'flex-end' }, justifyContent: 'space-between', mb: 3, gap: 2 }}>
        <Box>
           <Breadcrumbs custom heading={isEdit ? 'edit-purchase-return' : 'create-purchase-return'} links={[{ title: 'purchases', to: '/purchases/returns' }, { title: 'purchase-returns', to: '/purchases/returns' }]} sx={{ mb: 1 }} />
           <Typography variant="h2"><FormattedMessage id={isEdit ? 'edit-purchase-return' : 'create-purchase-return'} /></Typography>
        </Box>
        <Stack direction="row" spacing={1.5} alignItems="center">
           {isEdit && purchaseReturn && (
              <Box sx={{ px: 2, py: 0.5, bgcolor: 'grey.100', color: 'text.secondary', borderRadius: 4, border: '1px solid', borderColor: 'divider' }}>
                 <Typography variant="caption"><FormattedMessage id={purchaseReturn.status.toLowerCase()} /></Typography>
              </Box>
           )}
           <Button component={Link} to="/purchases/returns" variant="outlined" color="inherit" disabled={isSaving} sx={{ borderRadius: 2 }}>
              <FormattedMessage id="cancel" />
           </Button>
           <Button variant="contained" color="secondary" onClick={() => submit('draft')} disabled={isSaving} sx={{ borderRadius: 2 }} startIcon={<IconDeviceFloppy size={18} />}>
              <FormattedMessage id="save-as-draft" />
           </Button>
           {(!isEdit || (isEdit && purchaseReturn?.status === 'Draft')) && (
              <PermissionGuard permission={PURCHASES_PERMISSIONS.returnsPost}>
                 <Button variant="contained" color="primary" onClick={() => submit('post')} disabled={isSaving} sx={{ borderRadius: 2, boxShadow: 2 }} startIcon={<IconSend size={18} />}>
                    <FormattedMessage id="post" />
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
                        <Grid item xs={12} md={6}>
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
                        <Grid item xs={12} md={6}>
                           <TextField type="date" required fullWidth InputLabelProps={{ shrink: true }} label={<FormattedMessage id="return-date" />} value={form.returnDate} onChange={(event) => setForm({ ...form, returnDate: event.target.value })} />
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
                        <Table size="small">
                          <TableHead sx={{ bgcolor: 'grey.50' }}>
                            <TableRow>
                              <TableCell align="center" width={40}>#</TableCell>
                              <TableCell sx={{ minWidth: 260 }}><FormattedMessage id="item" /></TableCell>
                              <TableCell sx={{ minWidth: 100 }}><FormattedMessage id="returnable-quantity" /></TableCell>
                              <TableCell sx={{ minWidth: 100 }}><FormattedMessage id="quantity" /></TableCell>
                              <TableCell sx={{ minWidth: 180 }}><FormattedMessage id="notes" /></TableCell>
                              <TableCell align="center" width={60}><FormattedMessage id="actions" /></TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {rows.map((row, index) => (
                               <TableRow key={`${row.purchaseInvoiceLineId || 'line'}-${index}`} hover>
                                 <TableCell align="center">{index + 1}</TableCell>
                                 <TableCell>
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
                                 <TableCell>
                                   <TextField size="small" fullWidth type="number" value={row.quantity} onChange={(event) => updateRow(index, { quantity: Number(event.target.value) })} inputProps={{ min: 1 }} />
                                 </TableCell>
                                 <TableCell>
                                   <TextField size="small" fullWidth value={row.notes ?? ''} onChange={(event) => updateRow(index, { notes: event.target.value })} />
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
                            ))}
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
                        <FormattedMessage id="add-line" />
                     </Button>
                  </Box>
               </MainCard>
            </Stack>
         </Grid>

         <Grid item xs={12} lg={4}>
            <Stack spacing={3} sx={{ height: '100%' }}>
               <MainCard sx={{ ...cardSx, display: 'flex', flexDirection: 'column', height: '100%' }} content={false}>
                  <Box sx={{ p: 3, flex: 1, display: 'flex', flexDirection: 'column' }}>
                     <Box sx={headerSx}>
                        <IconNotes color="var(--mui-palette-primary-main)" />
                        <Typography variant="h4"><FormattedMessage id="invoice-notes" /></Typography>
                     </Box>
                     <TextField 
                        fullWidth 
                        multiline 
                        minRows={8} 
                        placeholder={intl.formatMessage({ id: 'notes-placeholder' })} 
                        value={form.notes ?? ''} 
                        onChange={(event) => setForm({ ...form, notes: event.target.value })} 
                        sx={{ flex: 1, '& .MuiInputBase-root': { height: '100%', alignItems: 'flex-start' } }} 
                     />
                  </Box>
               </MainCard>
            </Stack>
         </Grid>
      </Grid>
    </Box>
  );
}
