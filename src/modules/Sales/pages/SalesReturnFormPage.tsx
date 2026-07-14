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

import { IconPlus, IconTrash, IconInfoCircle, IconBox, IconNotes, IconDeviceFloppy, IconSend, IconCalculator } from '@tabler/icons-react';

import { useDispatch } from 'store';
import { openSnackbar } from 'store/slices/snackbar';
import MainCard from 'ui-component/cards/MainCard';
import Breadcrumbs from 'ui-component/extended/Breadcrumbs';
import PageTitle from 'ui-component/PageTitle';
import Loader from 'ui-component/Loader';
import { createReturn, updateReturn, postReturn } from '../api/salesApi';
import { useSalesInvoice, useSalesReturn, useSalesInvoices, useSalesReturnableLines } from '../hooks/useSales';
import type { SalesReturnInput, SalesReturnLineInput } from '../types/sales.types';
import PermissionGuard from 'modules/Administration/components/PermissionGuard';
import { SALES_PERMISSIONS } from '../utils/sales.constants';

type EditableLine = SalesReturnLineInput & { itemLabel?: string; maxQuantity?: number };

const today = new Date().toISOString().slice(0, 10);

function emptyLine(): EditableLine {
  return { salesInvoiceLineId: '', quantity: 1, notes: '', itemLabel: '', maxQuantity: 1 };
}

export default function SalesReturnFormPage() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const intl = useIntl();
  const dispatch = useDispatch();
  const isEdit = Boolean(id);
  const { salesReturn, isLoading: returnLoading } = useSalesReturn(id);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState(searchParams.get('salesInvoiceId') ?? '');
  const { invoice: selectedInvoice, isLoading: invoiceLoading } = useSalesInvoice(
    isEdit ? salesReturn?.salesInvoiceId : selectedInvoiceId || undefined
  );
  const { items: postedInvoices } = useSalesInvoices({
    page: 1,
    pageSize: 100,
    status: 'Posted',
    sortBy: 'invoiceDate',
    sortDirection: 'desc'
  });
  const sourceInvoiceId = isEdit ? salesReturn?.salesInvoiceId : selectedInvoiceId || undefined;
  const { items: returnableLines, isLoading: returnableLoading } = useSalesReturnableLines(sourceInvoiceId);
  const [form, setForm] = useState<SalesReturnInput>({
    salesInvoiceId: '',
    returnDate: today,
    notes: '',
    lines: []
  });
  const [rows, setRows] = useState<EditableLine[]>([emptyLine()]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (salesReturn) {
      setForm({
        salesInvoiceId: salesReturn.salesInvoiceId,
        returnDate: salesReturn.returnDate,
        notes: salesReturn.notes ?? '',
        lines: []
      });
      setRows(
        salesReturn.lines.map((line) => ({
          salesInvoiceLineId: line.salesInvoiceLineId,
          quantity: line.quantity,
          notes: line.notes ?? '',
          itemLabel: `${line.itemCode} - ${line.itemNameArabic}`,
          maxQuantity: line.quantity
        }))
      );
    }
  }, [salesReturn]);

  useEffect(() => {
    if (selectedInvoice && !isEdit) {
      setForm((current) => ({ ...current, salesInvoiceId: selectedInvoice.id }));
    }
  }, [isEdit, selectedInvoice]);

  useEffect(() => {
    if (!isEdit && sourceInvoiceId && returnableLines.length > 0) {
      setRows(
        returnableLines.map((line) => ({
          salesInvoiceLineId: line.salesInvoiceLineId,
          quantity: Math.min(1, line.returnableQuantity),
          notes: '',
          itemLabel: `${line.itemCode} - ${line.itemNameArabic}`,
          maxQuantity: line.returnableQuantity
        }))
      );
    }
  }, [isEdit, returnableLines, sourceInvoiceId]);

  useEffect(() => {
    if (isEdit && returnableLines.length > 0) {
      const maximumByLine = new Map(returnableLines.map((line) => [line.salesInvoiceLineId, line.returnableQuantity]));
      setRows((current) =>
        current.map((row) => ({
          ...row,
          maxQuantity: maximumByLine.get(row.salesInvoiceLineId) ?? row.maxQuantity
        }))
      );
    }
  }, [isEdit, returnableLines]);

  const invoiceLines = useMemo(() => returnableLines, [returnableLines]);

  const notify = (message: string, severity: 'success' | 'error' = 'success') => {
    dispatch(openSnackbar({ open: true, message, variant: 'alert', severity }));
  };

  const updateRow = (index: number, next: Partial<EditableLine>) => {
    setRows((current) => current.map((row, rowIndex) => (rowIndex === index ? { ...row, ...next } : row)));
  };

  const addRow = () => setRows((current) => [...current, emptyLine()]);
  const removeRow = (index: number) => setRows((current) => current.filter((_, rowIndex) => rowIndex !== index));

  const submit = async (actionType: 'draft' | 'post') => {
    if (!form.salesInvoiceId) {
      notify(intl.formatMessage({ id: 'sales-invoice-required' }), 'error');
      return;
    }

    const lines = rows
      .filter((row) => row.salesInvoiceLineId)
      .map(({ salesInvoiceLineId, quantity, notes }) => ({
        salesInvoiceLineId,
        quantity: Number(quantity) || 0,
        notes: notes || null
      }));

    if (lines.length === 0) {
      notify(intl.formatMessage({ id: 'sales-return-lines-required' }), 'error');
      return;
    }

    const request: SalesReturnInput = {
      ...form,
      notes: form.notes || null,
      lines
    };

    try {
      setIsSaving(true);
      let savedReturnId = '';
      let savedRowVersion = '';

      if (isEdit && salesReturn) {
        const saved = await updateReturn(salesReturn.id, { ...request, rowVersion: salesReturn.rowVersion });
        savedReturnId = saved.id;
        savedRowVersion = saved.rowVersion;
      } else {
        const saved = await createReturn(request);
        savedReturnId = saved.id;
        savedRowVersion = saved.rowVersion;
      }

      if (actionType === 'post') {
        await postReturn(savedReturnId, savedRowVersion);
        notify(intl.formatMessage({ id: 'sales-action-success' }));
        navigate(`/sales/returns/${savedReturnId}`);
      } else {
        notify(intl.formatMessage({ id: 'sales-action-success' }));
        navigate(`/sales/returns/${savedReturnId}`);
      }
    } catch (saveError) {
      notify(saveError instanceof Error ? saveError.message : intl.formatMessage({ id: 'sales-action-failed' }), 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const returnTotals = rows.reduce(
    (totals, row) => {
      const source = invoiceLines.find((line) => line.salesInvoiceLineId === row.salesInvoiceLineId);
      if (!source) return totals;
      const quantity = Number(row.quantity) || 0;
      const gross = quantity * source.unitPrice;
      const discount = quantity * source.discountPerUnit;
      const tax = quantity * source.taxPerUnit;
      return {
        subtotal: totals.subtotal + gross,
        discount: totals.discount + discount,
        tax: totals.tax + tax,
        grandTotal: totals.grandTotal + gross - discount + tax
      };
    },
    { subtotal: 0, discount: 0, tax: 0, grandTotal: 0 }
  );

  if ((isEdit && (returnLoading || returnableLoading)) || (!isEdit && (invoiceLoading || returnableLoading) && selectedInvoiceId))
    return <Loader />;

  const cardSx = { border: '1px solid', borderColor: 'divider', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', mb: 3 };
  const headerSx = { display: 'flex', alignItems: 'center', gap: 1, pb: 2, mb: 3, borderBottom: '1px solid', borderColor: 'divider' };

  return (
    <Box>
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: { xs: 'flex-start', sm: 'flex-end' },
          justifyContent: 'space-between',
          mb: 3,
          gap: 2
        }}
      >
        <Box>
          <Breadcrumbs
            custom
            card={false}
            title={false}
            divider={false}
            heading={isEdit ? 'edit-sales-return' : 'create-sales-return'}
            links={[
              { title: 'sales', to: '/sales/returns' },
              { title: 'sales-returns', to: '/sales/returns' }
            ]}
            sx={{ mb: 0 }}
          />
          <PageTitle>
            <FormattedMessage id={isEdit ? 'edit-sales-return' : 'create-sales-return'} />
          </PageTitle>
        </Box>
        <Stack direction="row" spacing={1.5} alignItems="center">
          {isEdit && salesReturn && (
            <Box
              sx={{
                px: 2,
                py: 0.5,
                bgcolor: 'grey.100',
                color: 'text.secondary',
                borderRadius: 4,
                border: '1px solid',
                borderColor: 'divider'
              }}
            >
              <Typography variant="caption">
                <FormattedMessage id={`sales.status.${salesReturn.status.toLowerCase()}`} />
              </Typography>
            </Box>
          )}
          <Button component={Link} to="/sales/returns" variant="outlined" color="inherit" disabled={isSaving} sx={{ borderRadius: 2 }}>
            <FormattedMessage id="cancel" />
          </Button>
          <Button
            variant="contained"
            color="secondary"
            onClick={() => submit('draft')}
            disabled={isSaving}
            sx={{ borderRadius: 2 }}
            startIcon={<IconDeviceFloppy size={18} />}
          >
            <FormattedMessage id="save-as-draft" />
          </Button>
          {(!isEdit || (isEdit && salesReturn?.status === 'Draft')) && (
            <PermissionGuard permission={SALES_PERMISSIONS.returnsPost}>
              <Button
                variant="contained"
                color="primary"
                onClick={() => submit('post')}
                disabled={isSaving}
                sx={{ borderRadius: 2, boxShadow: 2 }}
                startIcon={<IconSend size={18} />}
              >
                <FormattedMessage id="post-sales-return" />
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
                  <Typography variant="h4">
                    <FormattedMessage id="basic-information" />
                  </Typography>
                </Box>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      select
                      required
                      fullWidth
                      label={<FormattedMessage id="sales-invoice" />}
                      value={form.salesInvoiceId}
                      disabled={isEdit}
                      onChange={(event) => {
                        setSelectedInvoiceId(event.target.value);
                        setForm({ ...form, salesInvoiceId: event.target.value });
                      }}
                    >
                      <MenuItem value="">
                        <FormattedMessage id="none" />
                      </MenuItem>
                      {postedInvoices.map((invoice) => (
                        <MenuItem key={invoice.id} value={invoice.id}>
                          {invoice.number} - {invoice.customerNameArabic}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      type="date"
                      required
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                      label={<FormattedMessage id="return-date" />}
                      value={form.returnDate}
                      onChange={(event) => setForm({ ...form, returnDate: event.target.value })}
                    />
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
                <TableContainer sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, mb: 2 }}>
                  <Table size="small" sx={{ minWidth: 900 }}>
                    <TableHead sx={{ bgcolor: 'grey.50' }}>
                      <TableRow>
                        <TableCell align="center" width={40}>
                          #
                        </TableCell>
                        <TableCell sx={{ minWidth: 260 }}>
                          <FormattedMessage id="item" />
                        </TableCell>
                        <TableCell sx={{ minWidth: 100 }}>
                          <FormattedMessage id="returnable-quantity" />
                        </TableCell>
                        <TableCell sx={{ minWidth: 100 }}>
                          <FormattedMessage id="quantity" />
                        </TableCell>
                        <TableCell sx={{ minWidth: 180 }}>
                          <FormattedMessage id="notes" />
                        </TableCell>
                        <TableCell align="center" width={60}>
                          <FormattedMessage id="actions" />
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {rows.map((row, index) => (
                        <TableRow key={`${row.salesInvoiceLineId || 'line'}-${index}`} hover>
                          <TableCell align="center">{index + 1}</TableCell>
                          <TableCell>
                            <TextField
                              select
                              fullWidth
                              size="small"
                              value={row.salesInvoiceLineId}
                              onChange={(event) => {
                                const line = invoiceLines.find((invoiceLine) => invoiceLine.salesInvoiceLineId === event.target.value);
                                updateRow(index, {
                                  salesInvoiceLineId: event.target.value,
                                  itemLabel: line ? `${line.itemCode} - ${line.itemNameArabic}` : '',
                                  maxQuantity: line?.returnableQuantity ?? 1,
                                  quantity: line ? Math.min(row.quantity || 1, line.returnableQuantity) : row.quantity
                                });
                              }}
                            >
                              <MenuItem value="">
                                <FormattedMessage id="none" />
                              </MenuItem>
                              {invoiceLines.map((line) => (
                                <MenuItem key={line.salesInvoiceLineId} value={line.salesInvoiceLineId}>
                                  {line.itemCode} - {line.itemNameArabic}
                                </MenuItem>
                              ))}
                            </TextField>
                          </TableCell>
                          <TableCell>{row.maxQuantity ?? 1}</TableCell>
                          <TableCell>
                            <TextField
                              size="small"
                              fullWidth
                              type="number"
                              value={row.quantity}
                              onChange={(event) => updateRow(index, { quantity: Number(event.target.value) })}
                              inputProps={{ min: 0.000001, max: row.maxQuantity }}
                            />
                          </TableCell>
                          <TableCell>
                            <TextField
                              size="small"
                              fullWidth
                              value={row.notes ?? ''}
                              onChange={(event) => updateRow(index, { notes: event.target.value })}
                            />
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
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography>
                      <FormattedMessage id="subtotal" />
                    </Typography>
                    <Typography fontWeight={600}>{returnTotals.subtotal.toFixed(2)}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography>
                      <FormattedMessage id="total-discount" />
                    </Typography>
                    <Typography fontWeight={600}>- {returnTotals.discount.toFixed(2)}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography>
                      <FormattedMessage id="total-tax" />
                    </Typography>
                    <Typography fontWeight={600}>{returnTotals.tax.toFixed(2)}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', color: 'primary.main' }}>
                    <Typography variant="h3">
                      <FormattedMessage id="grand-total" />
                    </Typography>
                    <Typography variant="h3" fontWeight={700}>
                      {returnTotals.grandTotal.toFixed(2)} <FormattedMessage id="currency" />
                    </Typography>
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
                <TextField
                  fullWidth
                  multiline
                  minRows={4}
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
