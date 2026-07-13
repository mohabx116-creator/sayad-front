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

  return (
    <>
      <Breadcrumbs custom heading="purchase-invoice-details" links={[{ title: 'purchases', to: '/purchases/invoices' }, { title: 'purchase-invoices', to: '/purchases/invoices' }, { title: 'purchase-invoice-details' }]} />
      <Stack spacing={2}>
        <MainCard
          title={`${invoice.number} - ${invoice.supplierNameArabic}`}
          secondary={
            <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
              <Button component={Link} to="/purchases/invoices">{intl.formatMessage({ id: 'back' })}</Button>
              <PermissionGuard permission={PURCHASES_PERMISSIONS.invoicesUpdate}>
                {invoice.status === 'Draft' && <Button component={Link} to={`/purchases/invoices/${invoice.id}/edit`} variant="outlined"><FormattedMessage id="edit" /></Button>}
              </PermissionGuard>
              <PermissionGuard permission={PURCHASES_PERMISSIONS.invoicesPost}>
                {invoice.status === 'Draft' && <Button variant="contained" onClick={() => runAction(() => postInvoice(invoice.id, invoice.rowVersion))}><FormattedMessage id="post" /></Button>}
              </PermissionGuard>
            </Stack>
          }
        >
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}><Typography variant="caption"><FormattedMessage id="supplier" /></Typography><Typography>{invoice.supplierCode} - {invoice.supplierNameArabic}</Typography></Grid>
            <Grid item xs={12} md={4}><Typography variant="caption"><FormattedMessage id="invoice-date" /></Typography><Typography>{invoice.invoiceDate}</Typography></Grid>
            <Grid item xs={12} md={4}><Typography variant="caption"><FormattedMessage id="status" /></Typography><PurchaseStatusChip status={invoice.status} /></Grid>
            <Grid item xs={12} md={4}><Typography variant="caption"><FormattedMessage id="supplier-invoice-number" /></Typography><Typography>{invoice.supplierInvoiceNumber ?? '-'}</Typography></Grid>
            <Grid item xs={12} md={4}><Typography variant="caption"><FormattedMessage id="subtotal" /></Typography><Typography>{invoice.subtotal.toFixed(2)}</Typography></Grid>
            <Grid item xs={12} md={4}><Typography variant="caption"><FormattedMessage id="grand-total" /></Typography><Typography>{invoice.grandTotal.toFixed(2)}</Typography></Grid>
            <Grid item xs={12}><Typography variant="caption"><FormattedMessage id="notes" /></Typography><Typography>{invoice.notes ?? '-'}</Typography></Grid>
          </Grid>
        </MainCard>

        <MainCard title={<FormattedMessage id="invoice-lines" />}>
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
                  <TableCell><FormattedMessage id="line-total" /></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {invoice.lines.map((line) => (
                  <TableRow key={line.id}>
                    <TableCell>{line.itemCode} - {line.itemNameArabic}</TableCell>
                    <TableCell>{line.unitCode}</TableCell>
                    <TableCell>{line.quantity}</TableCell>
                    <TableCell>{line.unitCost.toFixed(2)}</TableCell>
                    <TableCell>{line.discountAmount.toFixed(2)}</TableCell>
                    <TableCell>{line.taxAmount.toFixed(2)}</TableCell>
                    <TableCell>{line.lineTotal.toFixed(2)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </MainCard>

        <PermissionGuard permission={PURCHASES_PERMISSIONS.invoicesCancel}>
          {invoice.status === 'Posted' && (
            <MainCard title={<FormattedMessage id="cancel-document" />}>
              <Stack spacing={2}>
                <TextField fullWidth label={<FormattedMessage id="cancel-reason" />} value={reason} onChange={(event) => setReason(event.target.value)} />
                <Button
                  variant="outlined"
                  color="warning"
                  onClick={() => runAction(() => cancelInvoice(invoice.id, { reason, rowVersion: invoice.rowVersion }))}
                >
                  <FormattedMessage id="cancel" />
                </Button>
              </Stack>
            </MainCard>
          )}
        </PermissionGuard>

        <PermissionGuard permission={PURCHASES_PERMISSIONS.returnsCreate}>
          {invoice.status === 'Posted' && (
            <MainCard title={<FormattedMessage id="create-purchase-return" />}>
              <Button component={Link} to={`/purchases/returns/new?purchaseInvoiceId=${invoice.id}`} variant="contained">
                <FormattedMessage id="create-purchase-return" />
              </Button>
            </MainCard>
          )}
        </PermissionGuard>
      </Stack>
    </>
  );
}
