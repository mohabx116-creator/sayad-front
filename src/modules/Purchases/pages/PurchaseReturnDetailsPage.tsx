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
import { cancelReturn, postReturn } from '../api/purchasesApi';
import { usePurchaseReturn } from '../hooks/usePurchases';
import { PURCHASES_PERMISSIONS } from '../utils/purchases.constants';

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

  return (
    <>
      <Breadcrumbs custom heading="purchase-return-details" links={[{ title: 'purchases', to: '/purchases/returns' }, { title: 'purchase-returns', to: '/purchases/returns' }, { title: 'purchase-return-details' }]} />
      <Stack spacing={2}>
        <MainCard
          title={`${purchaseReturn.number} - ${purchaseReturn.purchaseInvoiceNumber}`}
          secondary={
            <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
              <Button component={Link} to="/purchases/returns">{intl.formatMessage({ id: 'back' })}</Button>
              <PermissionGuard permission={PURCHASES_PERMISSIONS.returnsUpdate}>
                {purchaseReturn.status === 'Draft' && <Button component={Link} to={`/purchases/returns/${purchaseReturn.id}/edit`} variant="outlined"><FormattedMessage id="edit" /></Button>}
              </PermissionGuard>
              <PermissionGuard permission={PURCHASES_PERMISSIONS.returnsPost}>
                {purchaseReturn.status === 'Draft' && <Button variant="contained" onClick={() => runAction(() => postReturn(purchaseReturn.id, purchaseReturn.rowVersion))}><FormattedMessage id="post" /></Button>}
              </PermissionGuard>
            </Stack>
          }
        >
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}><Typography variant="caption"><FormattedMessage id="purchase-invoice" /></Typography><Typography>{purchaseReturn.purchaseInvoiceNumber}</Typography></Grid>
            <Grid item xs={12} md={4}><Typography variant="caption"><FormattedMessage id="return-date" /></Typography><Typography>{purchaseReturn.returnDate}</Typography></Grid>
            <Grid item xs={12} md={4}><Typography variant="caption"><FormattedMessage id="status" /></Typography><PurchaseStatusChip status={purchaseReturn.status} /></Grid>
            <Grid item xs={12} md={4}><Typography variant="caption"><FormattedMessage id="subtotal" /></Typography><Typography>{purchaseReturn.subtotal.toFixed(2)}</Typography></Grid>
            <Grid item xs={12} md={4}><Typography variant="caption"><FormattedMessage id="grand-total" /></Typography><Typography>{purchaseReturn.grandTotal.toFixed(2)}</Typography></Grid>
            <Grid item xs={12}><Typography variant="caption"><FormattedMessage id="notes" /></Typography><Typography>{purchaseReturn.notes ?? '-'}</Typography></Grid>
          </Grid>
        </MainCard>

        <MainCard title={<FormattedMessage id="return-lines" />}>
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
                {purchaseReturn.lines.map((line) => (
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

        <PermissionGuard permission={PURCHASES_PERMISSIONS.returnsCancel}>
          {purchaseReturn.status === 'Posted' && (
            <MainCard title={<FormattedMessage id="cancel-document" />}>
              <Stack spacing={2}>
                <TextField fullWidth label={<FormattedMessage id="cancel-reason" />} value={reason} onChange={(event) => setReason(event.target.value)} />
                <Button variant="outlined" color="warning" onClick={() => runAction(() => cancelReturn(purchaseReturn.id, { reason, rowVersion: purchaseReturn.rowVersion }))}>
                  <FormattedMessage id="cancel" />
                </Button>
              </Stack>
            </MainCard>
          )}
        </PermissionGuard>
      </Stack>
    </>
  );
}
