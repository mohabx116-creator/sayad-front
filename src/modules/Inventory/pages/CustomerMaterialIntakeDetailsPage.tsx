import { useEffect, useState } from 'react';
import { useBrowserTitle } from 'shared/hooks/useBrowserTitle';
import { FormattedMessage } from 'react-intl';
import { Link, useParams } from 'react-router-dom';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/GridLegacy';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import { IconArrowLeft, IconCheck, IconEdit, IconX } from '@tabler/icons-react';

import { useDispatch } from 'store';
import { openSnackbar } from 'store/slices/snackbar';
import MainCard from 'ui-component/cards/MainCard';
import Breadcrumbs from 'ui-component/extended/Breadcrumbs';
import Loader from 'ui-component/Loader';
import { getDocumentDisplayNumber } from 'shared/utils/documentDisplay';
import PermissionGuard from 'modules/Administration/components/PermissionGuard';
import { SALES_PERMISSIONS } from 'modules/Sales/utils/sales.constants';
import { cancelCustomerMaterialIntake, postCustomerMaterialIntake } from '../api/customerMaterialsApi';
import { useCustomerMaterialIntake } from '../hooks/useCustomerMaterials';
import CustomerMaterialsTabs from '../components/customer-materials/CustomerMaterialsTabs';
import CustomerMaterialStatusChip from '../components/customer-materials/CustomerMaterialStatusChip';
import { INVENTORY_PERMISSIONS } from '../utils/inventory.constants';
import { IconFileInvoice } from '@tabler/icons-react';

export default function CustomerMaterialIntakeDetailsPage() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { intake, isLoading, mutate } = useCustomerMaterialIntake(id);
  const [busy, setBusy] = useState(false);
  const intakeDisplayNumber = getDocumentDisplayNumber(intake?.displayNumber, intake?.number);
  useBrowserTitle(intake ? [intakeDisplayNumber] : []);

  const notify = (message: string, severity: 'success' | 'error' = 'success') => {
    dispatch(openSnackbar({ open: true, message, variant: 'alert', severity }));
  };

  const handlePost = async () => {
    if (!intake || !id) return;
    if (!window.confirm('Post this customer material intake?')) return;
    try {
      setBusy(true);
      await postCustomerMaterialIntake(id, { rowVersion: intake.rowVersion });
      await mutate();
      notify('Posted successfully.');
    } catch (error) {
      notify(error instanceof Error ? error.message : 'Unable to post document.', 'error');
    } finally {
      setBusy(false);
    }
  };

  const handleCancel = async () => {
    if (!intake || !id) return;
    if (!window.confirm('Cancel this customer material intake?')) return;
    const reason = window.prompt('Cancellation reason') ?? '';
    if (!reason.trim()) return;
    try {
      setBusy(true);
      await cancelCustomerMaterialIntake(id, { rowVersion: intake.rowVersion, reason: reason.trim() });
      await mutate();
      notify('Cancelled successfully.');
    } catch (error) {
      notify(error instanceof Error ? error.message : 'Unable to cancel document.', 'error');
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    if (!intake) {
      return;
    }
  }, [intake, intakeDisplayNumber]);

  if (isLoading || !intake) {
    return <Loader />;
  }

  const canEdit = intake.status === 'Draft';
  const serviceInvoiceUrl = `/sales/invoices/new?${new URLSearchParams({
    customerId: intake.ownerPartyId,
    customerReferenceNumber: intake.number,
    notes: `Customer material intake ${intake.number}`
  }).toString()}`;

  return (
    <Box>
      <Breadcrumbs custom heading="customer-material-intake" links={[{ title: 'inventory', to: '/inventory/items' }, { title: 'customer-materials', to: '/inventory/customer-materials/intakes' }, { title: intakeDisplayNumber }]} />
      <CustomerMaterialsTabs value="intakes" />

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <Box>
          <Typography variant="h3" fontWeight={800}>
            {intakeDisplayNumber}
          </Typography>
          <Stack direction="row" spacing={1} sx={{ mt: 1 }} alignItems="center" flexWrap="wrap">
            <CustomerMaterialStatusChip status={intake.status} />
            {intake.referenceNumber && <Chip size="small" variant="outlined" label={intake.referenceNumber} />}
          </Stack>
        </Box>
        <Stack direction="row" spacing={1}>
          <Button component={Link} to="/inventory/customer-materials/intakes" variant="outlined" color="inherit" startIcon={<IconArrowLeft size={18} />}>
            <FormattedMessage id="back" />
          </Button>
          <PermissionGuard permission={SALES_PERMISSIONS.invoicesCreate}>
            <Button component={Link} to={serviceInvoiceUrl} variant="outlined" startIcon={<IconFileInvoice size={18} />}>
              <FormattedMessage id="create-service-invoice" defaultMessage="Create Service Invoice" />
            </Button>
          </PermissionGuard>
          {canEdit && (
            <PermissionGuard permission={INVENTORY_PERMISSIONS.customerMaterialIntakesUpdate}>
              <Button component={Link} to={`/inventory/customer-materials/intakes/${intake.id}/edit`} variant="outlined" startIcon={<IconEdit size={18} />}>
                <FormattedMessage id="edit" />
              </Button>
            </PermissionGuard>
          )}
          {intake.status === 'Draft' && (
            <PermissionGuard permission={INVENTORY_PERMISSIONS.customerMaterialIntakesPost}>
              <Button variant="contained" onClick={() => void handlePost()} disabled={busy} startIcon={<IconCheck size={18} />}>
                <FormattedMessage id="post" />
              </Button>
            </PermissionGuard>
          )}
          {intake.status === 'Posted' && (
            <PermissionGuard permission={INVENTORY_PERMISSIONS.customerMaterialIntakesCancel}>
              <Button variant="outlined" color="error" onClick={() => void handleCancel()} disabled={busy} startIcon={<IconX size={18} />}>
                <FormattedMessage id="cancel" />
              </Button>
            </PermissionGuard>
          )}
        </Stack>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <MainCard>
            <Stack spacing={1.5}>
              <Typography variant="body2" color="text.secondary"><FormattedMessage id="customer" /></Typography>
              <Typography variant="h6">{intake.ownerPartyCode} - {intake.ownerPartyNameArabic}</Typography>
              <Typography variant="body2" color="text.secondary"><FormattedMessage id="warehouse" /></Typography>
              <Typography variant="h6">{intake.warehouseCode} - {intake.warehouseNameArabic}</Typography>
              <Typography variant="body2" color="text.secondary"><FormattedMessage id="date" /></Typography>
              <Typography variant="h6" dir="ltr">{intake.intakeDate}</Typography>
              <Typography variant="body2" color="text.secondary"><FormattedMessage id="reference-number" defaultMessage="Reference" /></Typography>
              <Typography variant="h6">{intake.referenceNumber ?? '-'}</Typography>
              <Typography variant="body2" color="text.secondary"><FormattedMessage id="notes" /></Typography>
              <Typography variant="body2">{intake.notes ?? '-'}</Typography>
            </Stack>
          </MainCard>
        </Grid>

        <Grid item xs={12} md={8}>
          <MainCard>
            <TableContainer>
              <Table size="small">
                <TableHead sx={{ bgcolor: 'grey.50' }}>
                  <TableRow>
                    <TableCell><FormattedMessage id="item" /></TableCell>
                    <TableCell><FormattedMessage id="unit" /></TableCell>
                    <TableCell align="right"><FormattedMessage id="quantity" /></TableCell>
                    <TableCell><FormattedMessage id="lot-batch" defaultMessage="Lot / Batch" /></TableCell>
                    <TableCell><FormattedMessage id="notes" /></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {intake.lines.map((line) => (
                    <TableRow key={line.id}>
                      <TableCell>{line.itemCode} - {line.itemNameArabic}</TableCell>
                      <TableCell>{line.unitCode}</TableCell>
                      <TableCell align="right">{line.quantity}</TableCell>
                      <TableCell>{line.lotBatchIdentifier}</TableCell>
                      <TableCell>{line.notes ?? '-'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </MainCard>
        </Grid>
      </Grid>
    </Box>
  );
}
