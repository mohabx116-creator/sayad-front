import { useState } from 'react';
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
import PermissionGuard from 'modules/Administration/components/PermissionGuard';
import { SALES_PERMISSIONS } from 'modules/Sales/utils/sales.constants';
import { cancelCustomerMaterialConversion, postCustomerMaterialConversion } from '../api/customerMaterialsApi';
import { useCustomerMaterialConversion } from '../hooks/useCustomerMaterials';
import CustomerMaterialsTabs from '../components/customer-materials/CustomerMaterialsTabs';
import CustomerMaterialStatusChip from '../components/customer-materials/CustomerMaterialStatusChip';
import { INVENTORY_PERMISSIONS } from '../utils/inventory.constants';
import { IconFileInvoice } from '@tabler/icons-react';

export default function CustomerMaterialConversionDetailsPage() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { conversion, isLoading, mutate } = useCustomerMaterialConversion(id);
  const [busy, setBusy] = useState(false);

  const notify = (message: string, severity: 'success' | 'error' = 'success') => {
    dispatch(openSnackbar({ open: true, message, variant: 'alert', severity }));
  };

  const handlePost = async () => {
    if (!conversion || !id) return;
    if (!window.confirm('Post this customer material conversion?')) return;
    try {
      setBusy(true);
      await postCustomerMaterialConversion(id, { rowVersion: conversion.rowVersion });
      await mutate();
      notify('Posted successfully.');
    } catch (error) {
      notify(error instanceof Error ? error.message : 'Unable to post document.', 'error');
    } finally {
      setBusy(false);
    }
  };

  const handleCancel = async () => {
    if (!conversion || !id) return;
    if (!window.confirm('Cancel this customer material conversion?')) return;
    const reason = window.prompt('Cancellation reason') ?? '';
    if (!reason.trim()) return;
    try {
      setBusy(true);
      await cancelCustomerMaterialConversion(id, { rowVersion: conversion.rowVersion, reason: reason.trim() });
      await mutate();
      notify('Cancelled successfully.');
    } catch (error) {
      notify(error instanceof Error ? error.message : 'Unable to cancel document.', 'error');
    } finally {
      setBusy(false);
    }
  };

  if (isLoading || !conversion) {
    return <Loader />;
  }

  const canEdit = conversion.status === 'Draft';
  const serviceInvoiceUrl = `/sales/invoices/new?${new URLSearchParams({
    customerId: conversion.ownerPartyId,
    customerReferenceNumber: conversion.number,
    notes: `Customer material conversion ${conversion.number}`
  }).toString()}`;

  return (
    <Box>
      <Breadcrumbs custom heading="customer-material-conversion" links={[{ title: 'inventory', to: '/inventory/items' }, { title: 'customer-materials', to: '/inventory/customer-materials/intakes' }, { title: conversion.number }]} />
      <CustomerMaterialsTabs value="conversions" />

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <Box>
          <Typography variant="h3" fontWeight={800}>
            {conversion.number}
          </Typography>
          <Stack direction="row" spacing={1} sx={{ mt: 1 }} alignItems="center" flexWrap="wrap">
            <CustomerMaterialStatusChip status={conversion.status} />
            {conversion.referenceNumber && <Chip size="small" variant="outlined" label={conversion.referenceNumber} />}
          </Stack>
        </Box>
        <Stack direction="row" spacing={1}>
          <Button component={Link} to="/inventory/customer-materials/conversions" variant="outlined" color="inherit" startIcon={<IconArrowLeft size={18} />}>
            <FormattedMessage id="back" />
          </Button>
          <PermissionGuard permission={SALES_PERMISSIONS.invoicesCreate}>
            <Button component={Link} to={serviceInvoiceUrl} variant="outlined" startIcon={<IconFileInvoice size={18} />}>
              <FormattedMessage id="create-service-invoice" defaultMessage="Create Service Invoice" />
            </Button>
          </PermissionGuard>
          {canEdit && (
            <PermissionGuard permission={INVENTORY_PERMISSIONS.customerMaterialConversionsUpdate}>
              <Button component={Link} to={`/inventory/customer-materials/conversions/${conversion.id}/edit`} variant="outlined" startIcon={<IconEdit size={18} />}>
                <FormattedMessage id="edit" />
              </Button>
            </PermissionGuard>
          )}
          {conversion.status === 'Draft' && (
            <PermissionGuard permission={INVENTORY_PERMISSIONS.customerMaterialConversionsPost}>
              <Button variant="contained" onClick={() => void handlePost()} disabled={busy} startIcon={<IconCheck size={18} />}>
                <FormattedMessage id="post" />
              </Button>
            </PermissionGuard>
          )}
          {conversion.status === 'Posted' && (
            <PermissionGuard permission={INVENTORY_PERMISSIONS.customerMaterialConversionsCancel}>
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
              <Typography variant="h6">{conversion.ownerPartyCode} - {conversion.ownerPartyNameArabic}</Typography>
              <Typography variant="body2" color="text.secondary"><FormattedMessage id="date" /></Typography>
              <Typography variant="h6" dir="ltr">{conversion.conversionDate}</Typography>
              <Typography variant="body2" color="text.secondary"><FormattedMessage id="reference-number" defaultMessage="Reference" /></Typography>
              <Typography variant="h6">{conversion.referenceNumber ?? '-'}</Typography>
              <Typography variant="body2" color="text.secondary"><FormattedMessage id="notes" /></Typography>
              <Typography variant="body2">{conversion.notes ?? '-'}</Typography>
            </Stack>
          </MainCard>
        </Grid>

        <Grid item xs={12} md={8}>
          <Stack spacing={3}>
            <MainCard>
              <Typography variant="h6" fontWeight={700} sx={{ mb: 1.5 }}>
                <FormattedMessage id="customer-material-conversion-inputs" defaultMessage="Inputs" />
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead sx={{ bgcolor: 'grey.50' }}>
                    <TableRow>
                      <TableCell><FormattedMessage id="item" /></TableCell>
                      <TableCell><FormattedMessage id="warehouse" /></TableCell>
                      <TableCell><FormattedMessage id="unit" /></TableCell>
                      <TableCell align="right"><FormattedMessage id="quantity" /></TableCell>
                      <TableCell><FormattedMessage id="lot-batch" defaultMessage="Lot / Batch" /></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {conversion.inputLines.map((line) => (
                      <TableRow key={line.id}>
                        <TableCell>{line.itemCode} - {line.itemNameArabic}</TableCell>
                        <TableCell>{line.warehouseCode}</TableCell>
                        <TableCell>{line.unitCode}</TableCell>
                        <TableCell align="right">{line.quantity}</TableCell>
                        <TableCell>{line.lotBatchIdentifier}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </MainCard>

            <MainCard>
              <Typography variant="h6" fontWeight={700} sx={{ mb: 1.5 }}>
                <FormattedMessage id="customer-material-conversion-outputs" defaultMessage="Outputs" />
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead sx={{ bgcolor: 'grey.50' }}>
                    <TableRow>
                      <TableCell><FormattedMessage id="customer-materials.source-input-line" defaultMessage="Source input line" /></TableCell>
                      <TableCell><FormattedMessage id="item" /></TableCell>
                      <TableCell><FormattedMessage id="warehouse" /></TableCell>
                      <TableCell><FormattedMessage id="unit" /></TableCell>
                      <TableCell align="right"><FormattedMessage id="quantity" /></TableCell>
                      <TableCell><FormattedMessage id="lot-batch" defaultMessage="Lot / Batch" /></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {conversion.outputLines.map((line) => (
                      <TableRow key={line.id}>
                        <TableCell>{line.sourceInputLineNumber}</TableCell>
                        <TableCell>{line.itemCode} - {line.itemNameArabic}</TableCell>
                        <TableCell>{line.warehouseCode}</TableCell>
                        <TableCell>{line.unitCode}</TableCell>
                        <TableCell align="right">{line.quantity}</TableCell>
                        <TableCell>{line.lotBatchIdentifier}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </MainCard>
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
}
