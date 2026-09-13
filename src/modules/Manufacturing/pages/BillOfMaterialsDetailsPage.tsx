import React, { useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { Link, useNavigate, useParams } from 'react-router-dom';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/GridLegacy';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import { IconArrowLeft, IconCheck, IconEdit, IconTrash, IconX } from '@tabler/icons-react';

import { useDispatch } from 'store';
import { openSnackbar } from 'store/slices/snackbar';
import MainCard from 'ui-component/cards/MainCard';
import SubCard from 'ui-component/cards/SubCard';
import Breadcrumbs from 'ui-component/extended/Breadcrumbs';
import PageTitle from 'ui-component/PageTitle';
import Loader from 'ui-component/Loader';
import PermissionGuard from 'modules/Administration/components/PermissionGuard';

import { deleteBom, setBomActive } from '../api/manufacturingApi';
import BomStatusChip from '../components/BomStatusChip';
import { useBom } from '../hooks/useManufacturing';
import { MANUFACTURING_PERMISSIONS } from '../utils/manufacturing.constants';
import { resolveLocalizedText } from 'shared/utils/localizedText';

function InfoField({ label, children }: { label: React.ReactNode; children: React.ReactNode }) {
  return (
    <Box>
      <Typography
        variant="caption"
        color="text.secondary"
        display="block"
        fontWeight={600}
        sx={{ mb: 0.5, textTransform: 'uppercase', letterSpacing: 0.5, fontSize: '0.72rem' }}
      >
        {label}
      </Typography>
      <Typography variant="body1" fontWeight={500}>
        {children || '-'}
      </Typography>
    </Box>
  );
}

export default function BillOfMaterialsDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const intl = useIntl();
  const dispatch = useDispatch();

  const { bom, isLoading, mutate } = useBom(id);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [toggleActiveDialogOpen, setToggleActiveDialogOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleToggleActive = async () => {
    if (!id || !bom) return;
    setIsProcessing(true);
    try {
      const nextActive = !bom.isActive;
      await setBomActive(id, { isActive: nextActive, rowVersion: bom.rowVersion });
      await mutate();
      dispatch(
        openSnackbar({
          open: true,
          message: nextActive
            ? intl.formatMessage({ id: 'bom-activated', defaultMessage: 'BOM activated successfully.' })
            : intl.formatMessage({ id: 'bom-deactivated', defaultMessage: 'BOM deactivated successfully.' }),
          variant: 'alert',
          alert: { color: 'success' }
        })
      );
    } catch (err: unknown) {
      dispatch(
        openSnackbar({
          open: true,
          message: (err as Error)?.message || intl.formatMessage({ id: 'operation-failed', defaultMessage: 'Operation failed.' }),
          variant: 'alert',
          alert: { color: 'error' }
        })
      );
    } finally {
      setIsProcessing(false);
      setToggleActiveDialogOpen(false);
    }
  };

  const handleDelete = async () => {
    if (!id || !bom) return;
    setIsProcessing(true);
    try {
      await deleteBom(id, bom.rowVersion);
      dispatch(
        openSnackbar({
          open: true,
          message: intl.formatMessage({ id: 'bom-deleted', defaultMessage: 'BOM deleted successfully.' }),
          variant: 'alert',
          alert: { color: 'success' }
        })
      );
      navigate('/manufacturing/boms');
    } catch (err: unknown) {
      dispatch(
        openSnackbar({
          open: true,
          message: (err as Error)?.message || intl.formatMessage({ id: 'operation-failed', defaultMessage: 'Operation failed.' }),
          variant: 'alert',
          alert: { color: 'error' }
        })
      );
    } finally {
      setIsProcessing(false);
      setDeleteDialogOpen(false);
    }
  };

  if (isLoading) {
    return <Loader />;
  }

  if (!bom) {
    return (
      <Box sx={{ p: 3 }}>
        <Breadcrumbs />
        <MainCard sx={{ mt: 2, textAlign: 'center', py: 6 }}>
          <Typography variant="h4" color="text.secondary" gutterBottom>
            <FormattedMessage id="bom-not-found" defaultMessage="Bill of Materials not found." />
          </Typography>
          <Button component={Link} to="/manufacturing/boms" variant="contained" sx={{ mt: 2 }}>
            <FormattedMessage id="back-to-list" defaultMessage="Back to List" />
          </Button>
        </MainCard>
      </Box>
    );
  }

  const resolvedFinishedGood = resolveLocalizedText(
    intl.locale,
    bom.finishedGoodItemNameArabic,
    bom.finishedGoodItemNameEnglish
  );
  const resolvedBomName = resolveLocalizedText(intl.locale, bom.nameArabic, bom.nameEnglish);

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Breadcrumbs />
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mt: 1 }}>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <PageTitle>{resolvedBomName}</PageTitle>
            <Chip size="small" label={`v${bom.version}`} color="primary" variant="outlined" />
            <BomStatusChip isActive={bom.isActive} />
          </Stack>

          <Stack direction="row" spacing={1}>
            <Button
              component={Link}
              to="/manufacturing/boms"
              variant="outlined"
              size="small"
              startIcon={<IconArrowLeft size={16} />}
            >
              <FormattedMessage id="back" defaultMessage="Back" />
            </Button>

            <PermissionGuard permission={MANUFACTURING_PERMISSIONS.bomsUpdate}>
              <Button
                variant="outlined"
                color={bom.isActive ? 'warning' : 'success'}
                size="small"
                startIcon={bom.isActive ? <IconX size={16} /> : <IconCheck size={16} />}
                onClick={() => setToggleActiveDialogOpen(true)}
              >
                {bom.isActive ? (
                  <FormattedMessage id="deactivate" defaultMessage="Deactivate" />
                ) : (
                  <FormattedMessage id="activate" defaultMessage="Activate" />
                )}
              </Button>
            </PermissionGuard>

            <PermissionGuard permission={MANUFACTURING_PERMISSIONS.bomsUpdate}>
              <Button
                component={Link}
                to={`/manufacturing/boms/${bom.id}/edit`}
                variant="contained"
                color="secondary"
                size="small"
                startIcon={<IconEdit size={16} />}
              >
                <FormattedMessage id="edit" defaultMessage="Edit" />
              </Button>
            </PermissionGuard>

            <PermissionGuard permission={MANUFACTURING_PERMISSIONS.bomsDelete}>
              <Button
                variant="outlined"
                color="error"
                size="small"
                startIcon={<IconTrash size={16} />}
                onClick={() => setDeleteDialogOpen(true)}
              >
                <FormattedMessage id="delete" defaultMessage="Delete" />
              </Button>
            </PermissionGuard>
          </Stack>
        </Stack>
      </Box>

      <Grid container spacing={3}>
        {/* Basic Header Details */}
        <Grid item xs={12}>
          <MainCard title={<FormattedMessage id="bom-summary" defaultMessage="BOM Summary" />}>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6} md={3}>
                <InfoField label={<FormattedMessage id="code" defaultMessage="Code" />}>
                  {bom.code}
                </InfoField>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <InfoField label={<FormattedMessage id="finished-good" defaultMessage="Finished Good" />}>
                  [{bom.finishedGoodItemCode}] {resolvedFinishedGood}
                </InfoField>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <InfoField label={<FormattedMessage id="batch-size" defaultMessage="Batch Size" />}>
                  {bom.batchSize.toLocaleString()} {bom.baseUnitCode} ({bom.baseUnitNameArabic})
                </InfoField>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <InfoField label={<FormattedMessage id="components-count" defaultMessage="Components Count" />}>
                  {bom.lines.length}
                </InfoField>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <InfoField label={<FormattedMessage id="created-at" defaultMessage="Created At" />}>
                  {new Date(bom.createdAtUtc).toLocaleDateString(intl.locale)}
                </InfoField>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <InfoField label={<FormattedMessage id="updated-at" defaultMessage="Updated At" />}>
                  {bom.updatedAtUtc ? new Date(bom.updatedAtUtc).toLocaleDateString(intl.locale) : '-'}
                </InfoField>
              </Grid>

              {bom.routingNotes && (
                <Grid item xs={12} sm={6} md={6}>
                  <InfoField label={<FormattedMessage id="routing-notes" defaultMessage="Routing Notes" />}>
                    {bom.routingNotes}
                  </InfoField>
                </Grid>
              )}

              {bom.notes && (
                <Grid item xs={12} sm={6} md={6}>
                  <InfoField label={<FormattedMessage id="general-notes" defaultMessage="General Notes" />}>
                    {bom.notes}
                  </InfoField>
                </Grid>
              )}
            </Grid>
          </MainCard>
        </Grid>

        {/* Component Lines Table */}
        <Grid item xs={12}>
          <SubCard
            title={
              <Typography variant="h4">
                <FormattedMessage id="bom-components" defaultMessage="BOM Components" /> ({bom.lines.length})
              </Typography>
            }
            content={false}
          >
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell width={60}>#</TableCell>
                    <TableCell>
                      <FormattedMessage id="raw-material" defaultMessage="Raw Material Item" />
                    </TableCell>
                    <TableCell width={160}>
                      <FormattedMessage id="unit-of-measure" defaultMessage="Unit" />
                    </TableCell>
                    <TableCell width={130} align="right">
                      <FormattedMessage id="quantity" defaultMessage="Quantity" />
                    </TableCell>
                    <TableCell width={120} align="right">
                      <FormattedMessage id="scrap-percent" defaultMessage="Scrap %" />
                    </TableCell>
                    <TableCell width={130} align="right">
                      <FormattedMessage id="base-qty" defaultMessage="Base Quantity" />
                    </TableCell>
                    <TableCell>
                      <FormattedMessage id="notes" defaultMessage="Notes" />
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {bom.lines.map((line) => {
                    const resolvedRawMaterial = resolveLocalizedText(
                      intl.locale,
                      line.rawMaterialItemNameArabic,
                      line.rawMaterialItemNameEnglish
                    );

                    return (
                      <TableRow hover key={line.id}>
                        <TableCell>{line.lineNumber}</TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight={500}>
                            [{line.rawMaterialItemCode}] {resolvedRawMaterial}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          {line.unitOfMeasureCode} ({line.unitOfMeasureNameArabic})
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" fontWeight={600}>
                            {line.quantity.toLocaleString()}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          {line.scrapPercentage}%
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" fontWeight={600} color="secondary.main">
                            {line.baseQuantity.toLocaleString()}
                          </Typography>
                        </TableCell>
                        <TableCell>{line.notes || '-'}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </SubCard>
        </Grid>
      </Grid>

      {/* Confirmation Dialog: Toggle Active */}
      <Dialog open={toggleActiveDialogOpen} onClose={() => setToggleActiveDialogOpen(false)}>
        <DialogTitle>
          {bom.isActive ? (
            <FormattedMessage id="deactivate-bom" defaultMessage="Deactivate Bill of Materials" />
          ) : (
            <FormattedMessage id="activate-bom" defaultMessage="Activate Bill of Materials" />
          )}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {bom.isActive ? (
              <FormattedMessage
                id="deactivate-bom-confirm"
                defaultMessage="Are you sure you want to deactivate this BOM? New production orders will not be able to select it."
              />
            ) : (
              <FormattedMessage
                id="activate-bom-confirm"
                defaultMessage="Are you sure you want to activate this BOM? It will become available for new production orders."
              />
            )}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setToggleActiveDialogOpen(false)}>
            <FormattedMessage id="cancel" defaultMessage="Cancel" />
          </Button>
          <Button
            onClick={handleToggleActive}
            disabled={isProcessing}
            variant="contained"
            color={bom.isActive ? 'warning' : 'success'}
          >
            <FormattedMessage id="confirm" defaultMessage="Confirm" />
          </Button>
        </DialogActions>
      </Dialog>

      {/* Confirmation Dialog: Delete */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>
          <FormattedMessage id="delete-bom" defaultMessage="Delete Bill of Materials" />
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            <FormattedMessage
              id="delete-bom-confirm"
              defaultMessage="Are you sure you want to delete this Bill of Materials? This action cannot be undone."
            />
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>
            <FormattedMessage id="cancel" defaultMessage="Cancel" />
          </Button>
          <Button onClick={handleDelete} disabled={isProcessing} variant="contained" color="error">
            <FormattedMessage id="delete" defaultMessage="Delete" />
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
