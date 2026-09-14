import React, { useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { Link, useParams } from 'react-router-dom';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
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
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import LinearProgress from '@mui/material/LinearProgress';
import {
  IconArrowLeft,
  IconCheck,
  IconEdit,
  IconPlayerPlay,
  IconPlayerStop,
  IconPackage,
  IconTruckDelivery,
  IconX
} from '@tabler/icons-react';

import { useDispatch } from 'store';
import { openSnackbar } from 'store/slices/snackbar';
import MainCard from 'ui-component/cards/MainCard';
import SubCard from 'ui-component/cards/SubCard';
import Breadcrumbs from 'ui-component/extended/Breadcrumbs';
import PageTitle from 'ui-component/PageTitle';
import Loader from 'ui-component/Loader';
import ProductionOrderTimeline from '../components/ProductionOrderTimeline';
import ProductionOperationsTab from '../components/ProductionOperationsTab';
import CostVarianceCard from '../reports/components/CostVarianceCard';
import VarianceBarChart from '../reports/components/VarianceBarChart';
import VarianceTable from '../reports/components/VarianceTable';
import PermissionGuard from 'modules/Administration/components/PermissionGuard';

import {
  approveProductionOrder,
  cancelProductionOrder,
  closeProductionOrder,
  issueProductionMaterials,
  receiveProductionGoods,
  releaseProductionOrder
} from '../api/manufacturingApi';
import ProductionOrderStatusChip from '../components/ProductionOrderStatusChip';
import { useProductionOrder, useProductionOrderCostVariance } from '../hooks/useManufacturing';
import { MANUFACTURING_PERMISSIONS } from '../utils/manufacturing.constants';
import { resolveLocalizedText } from 'shared/utils/localizedText';
import type { ProductionStatus } from '../types/manufacturing.types';

// ==============================|| INFO FIELD COMPONENT ||============================== //

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

// ==============================|| COST ROW COMPONENT ||============================== //

function CostRow({ label, value, isBold }: { label: React.ReactNode; value: number | undefined | null; isBold?: boolean }) {
  return (
    <TableRow>
      <TableCell sx={{ fontWeight: isBold ? 700 : 400 }}>{label}</TableCell>
      <TableCell align="right" sx={{ fontWeight: isBold ? 700 : 400 }}>
        {(value ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </TableCell>
    </TableRow>
  );
}

// ==============================|| MAIN PAGE ||============================== //

export default function ProductionOrderDetailsPage() {
  const { id } = useParams();
  const intl = useIntl();
  const dispatch = useDispatch();

  const { order, isLoading, mutate } = useProductionOrder(id);
  const { variance, isLoading: isVarianceLoading } = useProductionOrderCostVariance(id);

  // Dialog states
  const [approveOpen, setApproveOpen] = useState(false);
  const [releaseOpen, setReleaseOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [closeOpen, setCloseOpen] = useState(false);
  const [issueOpen, setIssueOpen] = useState(false);
  const [receiveOpen, setReceiveOpen] = useState(false);

  // Form fields for dialogs
  const [cancelReason, setCancelReason] = useState('');
  const [cancelReasonError, setCancelReasonError] = useState('');
  const [issueNotes, setIssueNotes] = useState('');
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split('T')[0]);
  const [receiveQty, setReceiveQty] = useState('');
  const [receiveQtyError, setReceiveQtyError] = useState('');
  const [receiveDate, setReceiveDate] = useState(new Date().toISOString().split('T')[0]);
  const [receiveNotes, setReceiveNotes] = useState('');

  const [processing, setProcessing] = useState(false);

  const showSuccess = (message: string) =>
    dispatch(openSnackbar({ open: true, message, variant: 'alert', alert: { color: 'success' } }));

  const showError = (message: string) =>
    dispatch(openSnackbar({ open: true, message, variant: 'alert', alert: { color: 'error' } }));

  // ---- Action handlers ----

  const handleApprove = async () => {
    if (!id || !order) return;
    setProcessing(true);
    try {
      await approveProductionOrder(id, order.rowVersion);
      await mutate();
      showSuccess(intl.formatMessage({ id: 'order-approved', defaultMessage: 'Production order approved.' }));
      setApproveOpen(false);
    } catch (err: any) {
      showError(err?.message || intl.formatMessage({ id: 'operation-failed', defaultMessage: 'Operation failed.' }));
    } finally {
      setProcessing(false);
    }
  };

  const handleRelease = async () => {
    if (!id || !order) return;
    setProcessing(true);
    try {
      await releaseProductionOrder(id, order.rowVersion);
      await mutate();
      showSuccess(intl.formatMessage({ id: 'order-released', defaultMessage: 'Production order released.' }));
      setReleaseOpen(false);
    } catch (err: any) {
      showError(err?.message || intl.formatMessage({ id: 'operation-failed', defaultMessage: 'Operation failed.' }));
    } finally {
      setProcessing(false);
    }
  };

  const handleIssueMaterials = async () => {
    if (!id || !order) return;
    setProcessing(true);
    try {
      await issueProductionMaterials(id, {
        issueDate: issueDate || null,
        notes: issueNotes || null,
        rowVersion: order.rowVersion
      });
      await mutate();
      showSuccess(intl.formatMessage({ id: 'materials-issued', defaultMessage: 'Materials issued successfully.' }));
      setIssueOpen(false);
      setIssueNotes('');
    } catch (err: any) {
      showError(err?.message || intl.formatMessage({ id: 'operation-failed', defaultMessage: 'Operation failed.' }));
    } finally {
      setProcessing(false);
    }
  };

  const handleReceiveGoods = async () => {
    if (!id || !order) return;
    const qty = parseFloat(receiveQty);
    if (!receiveQty || isNaN(qty) || qty <= 0) {
      setReceiveQtyError(intl.formatMessage({ id: 'qty-must-be-positive', defaultMessage: 'Must be a positive number' }));
      return;
    }
    setReceiveQtyError('');
    setProcessing(true);
    try {
      await receiveProductionGoods(id, {
        producedQuantity: qty,
        receiptDate: receiveDate || null,
        notes: receiveNotes || null,
        rowVersion: order.rowVersion
      });
      await mutate();
      showSuccess(intl.formatMessage({ id: 'goods-received', defaultMessage: 'Goods received successfully.' }));
      setReceiveOpen(false);
      setReceiveQty('');
      setReceiveNotes('');
    } catch (err: any) {
      showError(err?.message || intl.formatMessage({ id: 'operation-failed', defaultMessage: 'Operation failed.' }));
    } finally {
      setProcessing(false);
    }
  };

  const handleCancel = async () => {
    if (!id || !order) return;
    if (!cancelReason.trim()) {
      setCancelReasonError(intl.formatMessage({ id: 'cancel-reason-required', defaultMessage: 'Cancellation reason is required.' }));
      return;
    }
    setCancelReasonError('');
    setProcessing(true);
    try {
      await cancelProductionOrder(id, { reason: cancelReason, rowVersion: order.rowVersion });
      await mutate();
      showSuccess(intl.formatMessage({ id: 'order-cancelled', defaultMessage: 'Production order cancelled.' }));
      setCancelOpen(false);
      setCancelReason('');
    } catch (err: any) {
      showError(err?.message || intl.formatMessage({ id: 'operation-failed', defaultMessage: 'Operation failed.' }));
    } finally {
      setProcessing(false);
    }
  };

  const handleClose = async () => {
    if (!id || !order) return;
    setProcessing(true);
    try {
      await closeProductionOrder(id, order.rowVersion);
      await mutate();
      showSuccess(intl.formatMessage({ id: 'order-closed', defaultMessage: 'Production order closed.' }));
      setCloseOpen(false);
    } catch (err: any) {
      showError(err?.message || intl.formatMessage({ id: 'operation-failed', defaultMessage: 'Operation failed.' }));
    } finally {
      setProcessing(false);
    }
  };

  // ---- Render ----

  if (isLoading) return <Loader />;

  if (!order) {
    return (
      <Box sx={{ p: 3 }}>
        <Breadcrumbs />
        <MainCard sx={{ mt: 2, textAlign: 'center', py: 6 }}>
          <Typography variant="h4" color="text.secondary" gutterBottom>
            <FormattedMessage id="order-not-found" defaultMessage="Production order not found." />
          </Typography>
          <Button component={Link} to="/manufacturing/orders" variant="contained" sx={{ mt: 2 }}>
            <FormattedMessage id="back-to-list" defaultMessage="Back to List" />
          </Button>
        </MainCard>
      </Box>
    );
  }

  const resolvedFinishedGood = resolveLocalizedText(intl.locale, order.finishedGoodItemNameArabic, order.finishedGoodItemNameEnglish);
  const progressPct = order.plannedQuantity > 0
    ? Math.min(100, Math.round((order.producedQuantity / order.plannedQuantity) * 100))
    : 0;

  const status: ProductionStatus = order.status;
  const canApprove = status === 'Draft';
  const canRelease = status === 'Approved';
  const canIssueMaterials = status === 'Released' || status === 'InProgress';
  const canReceiveGoods = status === 'Released' || status === 'InProgress';
  const canCancel = status === 'Draft' || status === 'Approved' || status === 'Released' || status === 'InProgress';
  const canClose = status === 'Completed';
  const canEdit = status === 'Draft';

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Breadcrumbs />
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mt: 1 }} flexWrap="wrap" gap={1}>
          <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap">
            <PageTitle>{order.number}</PageTitle>
            <ProductionOrderStatusChip status={order.status} />
            {order.productionType !== 'Company' && (
              <Chip
                size="small"
                label={intl.formatMessage({
                  id: `production-ownership.${order.productionType}`,
                  defaultMessage: order.productionType
                })}
                color="warning"
                variant="outlined"
              />
            )}
          </Stack>

          <Stack direction="row" spacing={1} flexWrap="wrap">
            <Button
              component={Link}
              to="/manufacturing/orders"
              variant="outlined"
              size="small"
              startIcon={<IconArrowLeft size={16} />}
            >
              <FormattedMessage id="back" defaultMessage="Back" />
            </Button>

            {canEdit && (
              <PermissionGuard permission={MANUFACTURING_PERMISSIONS.ordersUpdate}>
                <Button
                  component={Link}
                  to={`/manufacturing/orders/${order.id}/edit`}
                  variant="outlined"
                  color="secondary"
                  size="small"
                  startIcon={<IconEdit size={16} />}
                >
                  <FormattedMessage id="edit" defaultMessage="Edit" />
                </Button>
              </PermissionGuard>
            )}

            {canApprove && (
              <PermissionGuard permission={MANUFACTURING_PERMISSIONS.ordersApprove}>
                <Button
                  variant="contained"
                  color="info"
                  size="small"
                  startIcon={<IconCheck size={16} />}
                  onClick={() => setApproveOpen(true)}
                >
                  <FormattedMessage id="approve" defaultMessage="Approve" />
                </Button>
              </PermissionGuard>
            )}

            {canRelease && (
              <PermissionGuard permission={MANUFACTURING_PERMISSIONS.ordersRelease}>
                <Button
                  variant="contained"
                  color="secondary"
                  size="small"
                  startIcon={<IconPlayerPlay size={16} />}
                  onClick={() => setReleaseOpen(true)}
                >
                  <FormattedMessage id="release" defaultMessage="Release" />
                </Button>
              </PermissionGuard>
            )}

            {canIssueMaterials && (
              <PermissionGuard permission={MANUFACTURING_PERMISSIONS.ordersIssueMaterials}>
                <Button
                  variant="outlined"
                  color="secondary"
                  size="small"
                  startIcon={<IconPackage size={16} />}
                  onClick={() => setIssueOpen(true)}
                >
                  <FormattedMessage id="issue-materials" defaultMessage="Issue Materials" />
                </Button>
              </PermissionGuard>
            )}

            {canReceiveGoods && (
              <PermissionGuard permission={MANUFACTURING_PERMISSIONS.ordersReceiveGoods}>
                <Button
                  variant="outlined"
                  color="success"
                  size="small"
                  startIcon={<IconTruckDelivery size={16} />}
                  onClick={() => {
                    setReceiveQty('');
                    setReceiveNotes('');
                    setReceiveOpen(true);
                  }}
                >
                  <FormattedMessage id="receive-goods" defaultMessage="Receive Goods" />
                </Button>
              </PermissionGuard>
            )}

            {canClose && (
              <PermissionGuard permission={MANUFACTURING_PERMISSIONS.ordersClose}>
                <Button
                  variant="outlined"
                  color="success"
                  size="small"
                  startIcon={<IconPlayerStop size={16} />}
                  onClick={() => setCloseOpen(true)}
                >
                  <FormattedMessage id="close-order" defaultMessage="Close Order" />
                </Button>
              </PermissionGuard>
            )}

            {canCancel && (
              <PermissionGuard permission={MANUFACTURING_PERMISSIONS.ordersCancel}>
                <Button
                  variant="outlined"
                  color="error"
                  size="small"
                  startIcon={<IconX size={16} />}
                  onClick={() => { setCancelReason(''); setCancelOpen(true); }}
                >
                  <FormattedMessage id="cancel-order" defaultMessage="Cancel" />
                </Button>
              </PermissionGuard>
            )}
          </Stack>
        </Stack>
      </Box>

      <Grid container spacing={3}>
        {/* ---- Order Summary ---- */}
        <Grid item xs={12}>
          <MainCard title={<FormattedMessage id="order-summary" defaultMessage="Order Summary" />}>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6} md={3}>
                <InfoField label={<FormattedMessage id="order-number" defaultMessage="Order Number" />}>
                  {order.number}
                </InfoField>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <InfoField label={<FormattedMessage id="finished-good" defaultMessage="Finished Good" />}>
                  [{order.finishedGoodItemCode}] {resolvedFinishedGood}
                </InfoField>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <InfoField label={<FormattedMessage id="bill-of-materials" defaultMessage="Bill of Materials" />}>
                  {order.billOfMaterialsCode}{' '}
                  <Chip size="small" label={`v${order.billOfMaterialsVersion}`} variant="outlined" />
                </InfoField>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <InfoField label={<FormattedMessage id="production-type" defaultMessage="Production Type" />}>
                  {intl.formatMessage({
                    id: `production-ownership.${order.productionType}`,
                    defaultMessage: order.productionType
                  })}
                  {order.ownerPartyNameArabic && (
                    <Typography variant="caption" color="text.secondary" display="block">
                      {order.ownerPartyCode && `[${order.ownerPartyCode}]`} {order.ownerPartyNameArabic}
                    </Typography>
                  )}
                </InfoField>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <InfoField label={<FormattedMessage id="source-warehouse" defaultMessage="Source Warehouse" />}>
                  {order.sourceWarehouseNameArabic}
                </InfoField>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <InfoField label={<FormattedMessage id="target-warehouse" defaultMessage="Target Warehouse" />}>
                  {order.targetWarehouseNameArabic}
                </InfoField>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <InfoField label={<FormattedMessage id="planned-start" defaultMessage="Planned Start" />}>
                  {new Date(order.plannedStartDate).toLocaleDateString(intl.locale)}
                </InfoField>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <InfoField label={<FormattedMessage id="planned-end" defaultMessage="Planned End" />}>
                  {new Date(order.plannedEndDate).toLocaleDateString(intl.locale)}
                </InfoField>
              </Grid>

              {order.actualStartDate && (
                <Grid item xs={12} sm={6} md={3}>
                  <InfoField label={<FormattedMessage id="actual-start" defaultMessage="Actual Start" />}>
                    {new Date(order.actualStartDate).toLocaleDateString(intl.locale)}
                  </InfoField>
                </Grid>
              )}
              {order.actualEndDate && (
                <Grid item xs={12} sm={6} md={3}>
                  <InfoField label={<FormattedMessage id="actual-end" defaultMessage="Actual End" />}>
                    {new Date(order.actualEndDate).toLocaleDateString(intl.locale)}
                  </InfoField>
                </Grid>
              )}

              {order.approvedBy && (
                <Grid item xs={12} sm={6} md={3}>
                  <InfoField label={<FormattedMessage id="approved-by" defaultMessage="Approved By" />}>
                    {order.approvedBy}
                    {order.approvedAtUtc && (
                      <Typography variant="caption" color="text.secondary" display="block">
                        {new Date(order.approvedAtUtc).toLocaleDateString(intl.locale)}
                      </Typography>
                    )}
                  </InfoField>
                </Grid>
              )}

              {order.cancellationReason && (
                <Grid item xs={12}>
                  <InfoField label={<FormattedMessage id="cancellation-reason" defaultMessage="Cancellation Reason" />}>
                    <Typography variant="body2" color="error.main">
                      {order.cancellationReason}
                    </Typography>
                  </InfoField>
                </Grid>
              )}

              {order.notes && (
                <Grid item xs={12}>
                  <InfoField label={<FormattedMessage id="notes" defaultMessage="Notes" />}>
                    {order.notes}
                  </InfoField>
                </Grid>
              )}
            </Grid>
          </MainCard>
        </Grid>

        {/* ---- Production Progress ---- */}
        <Grid item xs={12} md={7}>
          <SubCard
            title={
              <Typography variant="h4">
                <FormattedMessage id="production-progress" defaultMessage="Production Progress" />
              </Typography>
            }
          >
            <Stack spacing={2}>
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="body2" color="text.secondary">
                  <FormattedMessage id="produced-qty" defaultMessage="Produced" />
                </Typography>
                <Typography variant="body1" fontWeight={700}>
                  {(order.producedQuantity ?? 0).toLocaleString()} / {(order.plannedQuantity ?? 0).toLocaleString()}
                  {' '}({progressPct}%)
                </Typography>
              </Stack>
              <LinearProgress
                variant="determinate"
                value={progressPct}
                color={progressPct >= 100 ? 'success' : 'secondary'}
                sx={{ height: 10, borderRadius: 5 }}
              />
              {order.scrapQuantity > 0 && (
                <Typography variant="caption" color="text.secondary">
                  <FormattedMessage id="scrap-qty" defaultMessage="Scrap" />: {(order.scrapQuantity ?? 0).toLocaleString()}
                </Typography>
              )}
            </Stack>

            <Divider sx={{ my: 2 }} />

            <Stack direction="row" spacing={4}>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  <FormattedMessage id="issue-count" defaultMessage="Material Issues" />
                </Typography>
                <Typography variant="h4">{order.issueCount}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  <FormattedMessage id="receipt-count" defaultMessage="Receipts" />
                </Typography>
                <Typography variant="h4">{order.receiptCount}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  <FormattedMessage id="labor-count" defaultMessage="Labor Ops" />
                </Typography>
                <Typography variant="h4">{order.laborOperationCount}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  <FormattedMessage id="charge-count" defaultMessage="Charges" />
                </Typography>
                <Typography variant="h4">{order.chargeCount}</Typography>
              </Box>
            </Stack>
          </SubCard>
        </Grid>

        {/* ---- Cost Summary ---- */}
        <Grid item xs={12} md={5}>
          <SubCard
            title={
              <Typography variant="h4">
                <FormattedMessage id="cost-summary" defaultMessage="Cost Summary" />
              </Typography>
            }
            content={false}
          >
            <TableContainer>
              <Table size="small">
                <TableBody>
                  <CostRow
                    label={<FormattedMessage id="material-cost" defaultMessage="Material Cost" />}
                    value={order.materialCostTotal}
                  />
                  <CostRow
                    label={<FormattedMessage id="labor-cost" defaultMessage="Labor Cost" />}
                    value={order.laborCostTotal}
                  />
                  <CostRow
                    label={<FormattedMessage id="overhead-cost" defaultMessage="Overhead Cost" />}
                    value={order.overheadCostTotal}
                  />
                  {order.tollingRevenueTotal !== 0 && (
                    <CostRow
                      label={<FormattedMessage id="tolling-revenue" defaultMessage="Tolling Revenue" />}
                      value={order.tollingRevenueTotal}
                    />
                  )}
                  <CostRow
                    label={<FormattedMessage id="total-cost" defaultMessage="Total Cost" />}
                    value={order.totalCost}
                    isBold
                  />
                  <CostRow
                    label={<FormattedMessage id="unit-cost" defaultMessage="Unit Cost" />}
                    value={order.unitCostProduced}
                    isBold
                  />
                </TableBody>
              </Table>
            </TableContainer>
          </SubCard>
        </Grid>

        <Grid item xs={12}>
          <ProductionOperationsTab orderId={order.id} onChanged={async () => { await mutate(); }} />
        </Grid>

        <Grid item xs={12}>
          <PermissionGuard permission={MANUFACTURING_PERMISSIONS.reportsView}>
            <Stack spacing={2}>
              <Typography variant="h4">
                <FormattedMessage id="cost-variance" defaultMessage="Cost Variance" />
              </Typography>
              {isVarianceLoading ? (
                <MainCard>
                  <Stack direction="row" justifyContent="center" sx={{ py: 3 }}>
                    <CircularProgress size={24} />
                  </Stack>
                </MainCard>
              ) : variance ? (
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <CostVarianceCard data={variance} />
                  </Grid>
                  <Grid item xs={12} md={5}>
                    <VarianceBarChart data={variance} />
                  </Grid>
                  <Grid item xs={12} md={7}>
                    <VarianceTable data={[variance]} compact />
                  </Grid>
                </Grid>
              ) : (
                <MainCard>
                  <Typography color="text.secondary">
                    <FormattedMessage id="no-cost-variance-data" defaultMessage="No cost variance data available." />
                  </Typography>
                </MainCard>
              )}
            </Stack>
          </PermissionGuard>
        </Grid>
      </Grid>

      {/* ==============================|| DIALOGS ||============================== */}

      {/* Approve */}
      <Dialog open={approveOpen} onClose={() => !processing && setApproveOpen(false)}>
        <DialogTitle>
          <FormattedMessage id="approve-order" defaultMessage="Approve Production Order" />
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            <FormattedMessage
              id="approve-order-confirm"
              defaultMessage="Are you sure you want to approve this production order? Once approved it can be released."
            />
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setApproveOpen(false)} disabled={processing}>
            <FormattedMessage id="cancel" defaultMessage="Cancel" />
          </Button>
          <Button onClick={handleApprove} disabled={processing} variant="contained" color="info" startIcon={processing ? <CircularProgress size={16} /> : undefined}>
            <FormattedMessage id="approve" defaultMessage="Approve" />
          </Button>
        </DialogActions>
      </Dialog>

      {/* Release */}
      <Dialog open={releaseOpen} onClose={() => !processing && setReleaseOpen(false)}>
        <DialogTitle>
          <FormattedMessage id="release-order" defaultMessage="Release Production Order" />
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            <FormattedMessage
              id="release-order-confirm"
              defaultMessage="Releasing this order will validate component stock availability. Confirm to proceed."
            />
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReleaseOpen(false)} disabled={processing}>
            <FormattedMessage id="cancel" defaultMessage="Cancel" />
          </Button>
          <Button onClick={handleRelease} disabled={processing} variant="contained" color="secondary" startIcon={processing ? <CircularProgress size={16} /> : <IconPlayerPlay size={16} />}>
            <FormattedMessage id="release" defaultMessage="Release" />
          </Button>
        </DialogActions>
      </Dialog>

      {/* Issue Materials */}
      <Dialog open={issueOpen} onClose={() => !processing && setIssueOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>
          <FormattedMessage id="issue-materials" defaultMessage="Issue Materials" />
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <DialogContentText>
              <FormattedMessage
                id="issue-materials-confirm"
                defaultMessage="This will issue materials from inventory based on the BOM quantities. All BOM components will be consumed from the source warehouse."
              />
            </DialogContentText>
            <TextField
              fullWidth
              size="small"
              type="date"
              label={intl.formatMessage({ id: 'issue-date', defaultMessage: 'Issue Date' })}
              value={issueDate}
              onChange={(e) => setIssueDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              fullWidth
              multiline
              rows={2}
              size="small"
              label={intl.formatMessage({ id: 'notes', defaultMessage: 'Notes (Optional)' })}
              value={issueNotes}
              onChange={(e) => setIssueNotes(e.target.value)}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIssueOpen(false)} disabled={processing}>
            <FormattedMessage id="cancel" defaultMessage="Cancel" />
          </Button>
          <Button onClick={handleIssueMaterials} disabled={processing} variant="contained" color="secondary" startIcon={processing ? <CircularProgress size={16} /> : <IconPackage size={16} />}>
            <FormattedMessage id="issue" defaultMessage="Issue" />
          </Button>
        </DialogActions>
      </Dialog>

      {/* Receive Goods */}
      <Dialog open={receiveOpen} onClose={() => !processing && setReceiveOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>
          <FormattedMessage id="receive-goods" defaultMessage="Receive Finished Goods" />
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <DialogContentText>
              <FormattedMessage
                id="receive-goods-help"
                defaultMessage="Enter the quantity of finished goods produced and ready to receive into inventory."
              />
            </DialogContentText>
            <TextField
              required
              fullWidth
              size="small"
              type="number"
              label={intl.formatMessage({ id: 'produced-qty', defaultMessage: 'Produced Quantity' })}
              value={receiveQty}
              onChange={(e) => { setReceiveQty(e.target.value); setReceiveQtyError(''); }}
              error={Boolean(receiveQtyError)}
              helperText={receiveQtyError || `${intl.formatMessage({ id: 'remaining', defaultMessage: 'Remaining' })}: ${(Math.max(0, (order.plannedQuantity ?? 0) - (order.producedQuantity ?? 0)) ?? 0).toLocaleString()}`}
              inputProps={{ min: 0.001, step: 'any' }}
            />
            <TextField
              fullWidth
              size="small"
              type="date"
              label={intl.formatMessage({ id: 'receipt-date', defaultMessage: 'Receipt Date' })}
              value={receiveDate}
              onChange={(e) => setReceiveDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              fullWidth
              multiline
              rows={2}
              size="small"
              label={intl.formatMessage({ id: 'notes', defaultMessage: 'Notes (Optional)' })}
              value={receiveNotes}
              onChange={(e) => setReceiveNotes(e.target.value)}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReceiveOpen(false)} disabled={processing}>
            <FormattedMessage id="cancel" defaultMessage="Cancel" />
          </Button>
          <Button onClick={handleReceiveGoods} disabled={processing} variant="contained" color="success" startIcon={processing ? <CircularProgress size={16} /> : <IconTruckDelivery size={16} />}>
            <FormattedMessage id="receive" defaultMessage="Receive" />
          </Button>
        </DialogActions>
      </Dialog>

      {/* Cancel */}
      <Dialog open={cancelOpen} onClose={() => !processing && setCancelOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>
          <FormattedMessage id="cancel-production-order" defaultMessage="Cancel Production Order" />
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <DialogContentText>
              <FormattedMessage
                id="cancel-order-confirm"
                defaultMessage="This action cannot be undone. Please provide a reason for cancellation."
              />
            </DialogContentText>
            <TextField
              required
              autoFocus
              fullWidth
              multiline
              rows={3}
              size="small"
              label={intl.formatMessage({ id: 'cancellation-reason', defaultMessage: 'Cancellation Reason' })}
              value={cancelReason}
              onChange={(e) => { setCancelReason(e.target.value); setCancelReasonError(''); }}
              error={Boolean(cancelReasonError)}
              helperText={cancelReasonError}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCancelOpen(false)} disabled={processing}>
            <FormattedMessage id="back" defaultMessage="Back" />
          </Button>
          <Button onClick={handleCancel} disabled={processing} variant="contained" color="error" startIcon={processing ? <CircularProgress size={16} /> : <IconX size={16} />}>
            <FormattedMessage id="confirm-cancel" defaultMessage="Confirm Cancel" />
          </Button>
        </DialogActions>
      </Dialog>

      {/* Close */}
      <Dialog open={closeOpen} onClose={() => !processing && setCloseOpen(false)}>
        <DialogTitle>
          <FormattedMessage id="close-production-order" defaultMessage="Close Production Order" />
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            <FormattedMessage
              id="close-order-confirm"
              defaultMessage="Closing this order will finalize all costs and mark it as complete. This cannot be undone."
            />
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCloseOpen(false)} disabled={processing}>
            <FormattedMessage id="cancel" defaultMessage="Cancel" />
          </Button>
          <Button onClick={handleClose} disabled={processing} variant="contained" color="success" startIcon={processing ? <CircularProgress size={16} /> : <IconPlayerStop size={16} />}>
            <FormattedMessage id="close-order" defaultMessage="Close Order" />
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

