import { FormEvent, useEffect, useMemo, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { Link, useParams } from 'react-router-dom';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
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
import Typography from '@mui/material/Typography';
import { IconEdit, IconTrash, IconAdjustments, IconArrowDown, IconArrowUp } from '@tabler/icons-react';

import { useDispatch } from 'store';
import { openSnackbar } from 'store/slices/snackbar';
import { useJournalEntryAccounts } from 'modules/Accounting/hooks/useJournalEntries';
import MainCard from 'ui-component/cards/MainCard';
import Breadcrumbs from 'ui-component/extended/Breadcrumbs';
import Loader from 'ui-component/Loader';
import PermissionGuard from 'modules/Administration/components/PermissionGuard';
import { useParties } from 'modules/Parties/hooks/useParties';
import {
  correctItemOpeningStock,
  createItemPartyRelation,
  deactivatePartyItemRelation,
  postAdjustment,
  postStockIn,
  postStockOut,
  setItemOpeningStock
} from '../api/inventoryApi';
import {
  useInventoryItem,
  useInventoryItemOpeningStock,
  useInventoryItemUnits,
  useInventoryUnits,
  useItemMovements,
  usePartyItemRelations
} from '../hooks/useInventory';
import type {
  CorrectOpeningStockRequest,
  CreateItemPartyRelationRequest,
  InventoryAdjustmentRequest,
  InventoryMovementRequest,
  OpeningStockRequest
} from '../types/inventory.types';
import { INVENTORY_PERMISSIONS, getItemTypeLabel } from '../utils/inventory.constants';

const today = new Date().toISOString().slice(0, 10);

function initialMovement(unitId: string): InventoryMovementRequest {
  return { movementDate: today, unitOfMeasureId: unitId, quantity: 0, notes: '', offsetAccountingAccountId: null };
}

function getValuationStatusLabel(intl: ReturnType<typeof useIntl>, status: string) {
  switch (status) {
    case 'Resolved':
      return intl.formatMessage({ id: 'inventory-valuation-status.resolved', defaultMessage: 'Valuation resolved' });
    case 'LegacyUnresolved':
      return intl.formatMessage({ id: 'inventory-valuation-status.legacy-unresolved', defaultMessage: 'Legacy unresolved' });
    case 'NotApplicable':
      return intl.formatMessage({ id: 'inventory-valuation-status.not-applicable', defaultMessage: 'Not applicable' });
    default:
      return intl.formatMessage({ id: 'inventory-valuation-status.unknown', defaultMessage: 'Unknown' });
  }
}

function getMovementTypeLabel(intl: ReturnType<typeof useIntl>, movementType: string) {
  switch (movementType) {
    case 'OpeningStock':
      return intl.formatMessage({ id: 'inventory-movement-type.opening-stock', defaultMessage: 'Opening stock' });
    case 'StockIn':
      return intl.formatMessage({ id: 'inventory-movement-type.stock-in', defaultMessage: 'Stock in' });
    case 'StockOut':
      return intl.formatMessage({ id: 'inventory-movement-type.stock-out', defaultMessage: 'Stock out' });
    case 'AdjustmentIncrease':
      return intl.formatMessage({ id: 'inventory-movement-type.adjustment-increase', defaultMessage: 'Adjustment increase' });
    case 'AdjustmentDecrease':
      return intl.formatMessage({ id: 'inventory-movement-type.adjustment-decrease', defaultMessage: 'Adjustment decrease' });
    case 'Reversal':
      return intl.formatMessage({ id: 'inventory-movement-type.reversal', defaultMessage: 'Reversal' });
    default:
      return movementType;
  }
}

export default function InventoryItemDetailsPage() {
  const { id } = useParams();
  const intl = useIntl();
  const dispatch = useDispatch();
  const { item, isLoading, error, mutate: mutateItem } = useInventoryItem(id);
  const { items: itemUnits, mutate: mutateUnits } = useInventoryItemUnits(id);
  const { openingStock, mutate: mutateOpeningStock } = useInventoryItemOpeningStock(id);
  const { items: movements, mutate: mutateMovements } = useItemMovements(id);
  const { items: relations, mutate: mutateRelations } = usePartyItemRelations({ itemId: id, page: 1, pageSize: 100 });
  const { items: parties } = useParties({ page: 1, pageSize: 100 });
  const { items: units } = useInventoryUnits({ page: 1, pageSize: 100 });
  const { items: accountingAccounts } = useJournalEntryAccounts({ page: 1, pageSize: 100, excludeInventoryAsset: true });
  
  const [openingForm, setOpeningForm] = useState<OpeningStockRequest & { reason?: string; expectedOpeningMovementId?: string }>({
    movementDate: today,
    unitOfMeasureId: '',
    quantity: 0,
    unitCost: 0,
    notes: ''
  });
  const [stockInForm, setStockInForm] = useState<InventoryMovementRequest>(initialMovement(''));
  const [stockOutForm, setStockOutForm] = useState<InventoryMovementRequest>(initialMovement(''));
  const [adjustmentForm, setAdjustmentForm] = useState<InventoryAdjustmentRequest>({
    movementDate: today,
    unitOfMeasureId: '',
    quantity: 0,
    adjustmentType: 'Increase',
    reason: '',
    unitCost: 0,
    offsetAccountingAccountId: null
  });
  const [relationForm, setRelationForm] = useState<CreateItemPartyRelationRequest>({
    partyId: '',
    relationType: 'Customer',
    partyItemCode: '',
    notes: '',
    isPreferred: false
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const firstUnit = units[0]?.id ?? '';
    if (!openingForm.unitOfMeasureId && firstUnit) {
      setOpeningForm((current) => ({ ...current, unitOfMeasureId: firstUnit }));
    }
    if (!stockInForm.unitOfMeasureId && firstUnit) {
      setStockInForm((current) => ({ ...current, unitOfMeasureId: firstUnit }));
    }
    if (!stockOutForm.unitOfMeasureId && firstUnit) {
      setStockOutForm((current) => ({ ...current, unitOfMeasureId: firstUnit }));
    }
    if (!adjustmentForm.unitOfMeasureId && firstUnit) {
      setAdjustmentForm((current) => ({ ...current, unitOfMeasureId: firstUnit }));
    }
  }, [adjustmentForm.unitOfMeasureId, openingForm.unitOfMeasureId, stockInForm.unitOfMeasureId, stockOutForm.unitOfMeasureId, units]);

  useEffect(() => {
    const firstAccountId = accountingAccounts[0]?.id ?? '';
    if (!firstAccountId) {
      return;
    }

    if (!stockInForm.offsetAccountingAccountId) {
      setStockInForm((current) => ({ ...current, offsetAccountingAccountId: firstAccountId }));
    }
    if (!stockOutForm.offsetAccountingAccountId) {
      setStockOutForm((current) => ({ ...current, offsetAccountingAccountId: firstAccountId }));
    }
    if (!adjustmentForm.offsetAccountingAccountId) {
      setAdjustmentForm((current) => ({ ...current, offsetAccountingAccountId: firstAccountId }));
    }
  }, [accountingAccounts, adjustmentForm.offsetAccountingAccountId, stockInForm.offsetAccountingAccountId, stockOutForm.offsetAccountingAccountId]);

  useEffect(() => {
    if (openingStock?.movementId) {
      setOpeningForm((current) => ({
        ...current,
        quantity: openingStock.quantity,
        notes: openingStock.notes ?? current.notes,
        expectedOpeningMovementId: openingStock.movementId ?? ''
      }));
    }
  }, [openingStock]);

  const notify = (message: string, severity: 'success' | 'error' = 'success') => {
    dispatch(openSnackbar({ open: true, message, variant: 'alert', severity }));
  };

  const refreshAll = async () => {
    await Promise.all([mutateItem(), mutateUnits(), mutateOpeningStock(), mutateMovements(), mutateRelations()]);
  };

  const runAction = async (action: () => Promise<unknown>) => {
    try {
      setIsSaving(true);
      await action();
      await refreshAll();
      notify(intl.formatMessage({ id: 'inventory-action-success' }));
    } catch (actionError) {
      notify(actionError instanceof Error ? actionError.message : intl.formatMessage({ id: 'inventory-action-failed' }), 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const selectedPartyOptions = useMemo(
    () => parties.filter((party) => party.isCustomer || party.isSupplier),
    [parties]
  );

  const openingSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!id) return;

    if (openingStock?.movementId && openingForm.expectedOpeningMovementId) {
      await runAction(() => correctItemOpeningStock(id, {
        movementDate: openingForm.movementDate,
        unitOfMeasureId: openingForm.unitOfMeasureId,
        quantity: Number(openingForm.quantity),
        unitCost: Number(openingForm.unitCost),
        reason: openingForm.reason || '',
        expectedOpeningMovementId: openingForm.expectedOpeningMovementId ?? openingStock.movementId ?? ''
      } satisfies CorrectOpeningStockRequest));
      return;
    }

    await runAction(() => setItemOpeningStock(id, {
      movementDate: openingForm.movementDate,
      unitOfMeasureId: openingForm.unitOfMeasureId,
      quantity: Number(openingForm.quantity),
      unitCost: Number(openingForm.unitCost),
      notes: openingForm.notes ?? null
    }));
  };

  if (isLoading) return <Loader />;
  if (error || !item) return <Typography color="error"><FormattedMessage id="inventory-load-error" /></Typography>;

  return (
    <>
      <Breadcrumbs custom heading="item-details" links={[{ title: 'inventory', to: '/inventory/items' }, { title: 'inventory-items', to: '/inventory/items' }, { title: 'item-details' }]} />
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
        <Box>
          <Typography variant="h3" gutterBottom>
            {item.nameArabic}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            كود الصنف: {item.code}
          </Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          <PermissionGuard permission={INVENTORY_PERMISSIONS.itemsDeactivate}>
            <IconButton color="error" title={intl.formatMessage({ id: 'delete' })}>
              <IconTrash size={20} />
            </IconButton>
          </PermissionGuard>
          <Button variant="outlined" color="inherit" startIcon={<IconAdjustments size={18} />}>
            <FormattedMessage id="inventory-settlement" />
          </Button>
          <PermissionGuard permission={INVENTORY_PERMISSIONS.itemsUpdate}>
            <Button component={Link} to={`/inventory/items/${item.id}/edit`} variant="outlined" color="inherit" startIcon={<IconEdit size={18} />}>
              <FormattedMessage id="edit" />
            </Button>
          </PermissionGuard>
        </Stack>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <MainCard title={<FormattedMessage id="general-information" />} sx={{ height: '100%' }}>
            <Grid container spacing={4} sx={{ textAlign: 'center', py: 2 }}>
              <Grid item xs={12} sm={4}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  <FormattedMessage id="name" />
                </Typography>
                <Typography variant="h5">{item.nameArabic}</Typography>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  <FormattedMessage id="item-code" />
                </Typography>
                <Typography variant="h5">{item.code}</Typography>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  <FormattedMessage id="item-type" />
                </Typography>
                <Typography variant="h5">{getItemTypeLabel(intl, item.itemType)}</Typography>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  <FormattedMessage id="unit-of-measure" />
                </Typography>
                <Typography variant="h5">{item.baseUnitCode}</Typography>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  <FormattedMessage id="approximate-cost-price" />
                </Typography>
                <Typography variant="h5">{item.defaultSalePrice.toFixed(2)} ج.م</Typography>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  <FormattedMessage id="primary-supplier" />
                </Typography>
                <Typography variant="h5">الشركة الهندسية للبلاستيك</Typography>
              </Grid>
            </Grid>
          </MainCard>
        </Grid>

        <Grid item xs={12} md={4}>
          <MainCard title={<FormattedMessage id="stock-summary" />} sx={{ height: '100%' }}>
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                الرصيد الحالي
              </Typography>
              <Typography variant="h1" sx={{ fontSize: '3rem', fontWeight: 700, mb: 1 }}>
                {item.currentQuantity}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {item.baseUnitCode}
              </Typography>
            </Box>
            
            <Stack spacing={2} sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 1.5, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                <Typography variant="body1"><FormattedMessage id="minimum-quantity" /></Typography>
                <Typography variant="h5">{item.minimumQuantity}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 1.5, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                <Typography variant="body1"><FormattedMessage id="reorder-quantity" /></Typography>
                <Typography variant="h5">{item.reorderQuantity}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 1.5, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                <Typography variant="body1"><FormattedMessage id="reserved-for-orders" /></Typography>
                <Typography variant="h5">0</Typography>
              </Box>
            </Stack>

            <Divider sx={{ my: 2 }} />
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                <FormattedMessage id="stock-indicator" />
              </Typography>
              <Typography variant="subtitle1" sx={{ color: item.stockStatus === 'Normal' ? 'success.main' : 'warning.main', fontWeight: 'bold' }}>
                <FormattedMessage id={item.stockStatus === 'Normal' ? 'good' : 'warning'} />
              </Typography>
            </Box>
          </MainCard>
        </Grid>

        <Grid item xs={12}>
          <MainCard title={<FormattedMessage id="inventory-valuation" defaultMessage="Inventory Valuation" />}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={3}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  <FormattedMessage id="valuation-status" />
                </Typography>
                <Chip label={getValuationStatusLabel(intl, item.valuationStatus)} color={item.isValuationInitialized ? 'success' : 'warning'} variant="outlined" />
              </Grid>
              <Grid item xs={12} md={3}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  <FormattedMessage id="average-unit-cost" />
                </Typography>
                <Typography variant="h5">{item.currentAverageUnitCost == null ? '-' : item.currentAverageUnitCost.toFixed(4)}</Typography>
              </Grid>
              <Grid item xs={12} md={3}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  <FormattedMessage id="inventory-value" />
                </Typography>
                <Typography variant="h5">{item.currentInventoryValue == null ? '-' : item.currentInventoryValue.toFixed(4)}</Typography>
              </Grid>
              <Grid item xs={12} md={3}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  <FormattedMessage id="valuation-initialized-at" />
                </Typography>
                <Typography variant="h5">{item.valuationInitializedAtUtc ?? '-'}</Typography>
              </Grid>
            </Grid>
          </MainCard>
        </Grid>

        <Grid item xs={12}>
          <MainCard 
            title={<FormattedMessage id="recent-movements" />}
            secondary={
              <Typography component={Link} to={`/inventory/items/${item.id}/movements`} variant="body2" color="primary" sx={{ textDecoration: 'none' }}>
                <FormattedMessage id="view-all" /> &gt;
              </Typography>
            }
            content={false}
          >
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell><FormattedMessage id="date" /></TableCell>
                    <TableCell align="center"><FormattedMessage id="movement-type" /></TableCell>
                    <TableCell align="center"><FormattedMessage id="quantity" /></TableCell>
                    <TableCell align="center"><FormattedMessage id="balance-after-movement" /></TableCell>
                    <TableCell align="left"><FormattedMessage id="reference" /></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {movements.slice(0, 5).map((movement) => (
                    <TableRow key={movement.id} hover>
                      <TableCell>
                        {movement.movementDate}
                        <Typography variant="caption" display="block" color="text.secondary">
                          10:00
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Chip 
                          label={getMovementTypeLabel(intl, movement.movementType)}
                          variant="outlined" 
                          size="small"
                          sx={{ borderRadius: 1 }}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Typography variant="subtitle1" sx={{ mr: 1, fontWeight: 'bold' }}>
                            {Math.abs(movement.quantity)}
                          </Typography>
                          {movement.quantity > 0 ? (
                            <IconArrowUp size={16} color="green" />
                          ) : (
                            <IconArrowDown size={16} color="red" />
                          )}
                        </Box>
                      </TableCell>
                      <TableCell align="center">{movement.runningQuantity}</TableCell>
                      <TableCell align="left">{movement.descriptionArabic || '-'}</TableCell>
                      <TableCell align="center">
                        {movement.accountingJournalEntryId ? (
                          <Stack spacing={0.5} alignItems="center">
                            <Chip size="small" color="success" variant="outlined" label={movement.accountingPostingStatus} />
                            <Typography component={Link} to={`/accounting/journal-entries/${movement.accountingJournalEntryId}`} variant="caption" color="primary" sx={{ textDecoration: 'none' }}>
                              {movement.accountingEntryNumber ?? movement.accountingJournalEntryId}
                            </Typography>
                          </Stack>
                        ) : (
                          <Chip size="small" variant="outlined" label={movement.accountingPostingStatus} />
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                  {movements.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} align="center">
                        لا توجد حركات
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </MainCard>
        </Grid>
      </Grid>
      
      <Box sx={{ mt: 5 }}>
        <Typography variant="h4" color="text.secondary" sx={{ mb: 2, px: 1 }}>
          إدارة إضافية
        </Typography>
        <Stack spacing={3}>
          <MainCard title={<FormattedMessage id="opening-stock" />}>
            <form onSubmit={openingSubmit}>
              <Grid container spacing={2}>
                <Grid item xs={12} md={3}>
                  <TextField type="date" fullWidth label={<FormattedMessage id="date" />} value={openingForm.movementDate} onChange={(event) => setOpeningForm({ ...openingForm, movementDate: event.target.value })} InputLabelProps={{ shrink: true }} />
                </Grid>
                <Grid item xs={12} md={3}>
                  <TextField select fullWidth label={<FormattedMessage id="unit" />} value={openingForm.unitOfMeasureId} onChange={(event) => setOpeningForm({ ...openingForm, unitOfMeasureId: event.target.value })}>
                    {units.map((unit) => <MenuItem key={unit.id} value={unit.id}>{unit.code} - {unit.nameArabic}</MenuItem>)}
                  </TextField>
                </Grid>
                <Grid item xs={12} md={3}>
                  <TextField type="number" fullWidth label={<FormattedMessage id="quantity" />} value={openingForm.quantity} onChange={(event) => setOpeningForm({ ...openingForm, quantity: Number(event.target.value) })} />
                </Grid>
                <Grid item xs={12} md={3}>
                  <TextField type="number" fullWidth label={<FormattedMessage id="unit-cost" />} value={openingForm.unitCost} onChange={(event) => setOpeningForm({ ...openingForm, unitCost: Number(event.target.value) })} />
                </Grid>
                <Grid item xs={12} md={3}>
                  <Button type="submit" variant="contained" disabled={isSaving} sx={{ mt: 1 }}>
                    <FormattedMessage id={openingStock?.movementId ? 'correct-opening-stock' : 'set-opening-stock'} />
                  </Button>
                </Grid>
                {openingStock?.movementId && (
                  <Grid item xs={12}>
                    <Typography color="text.secondary"><FormattedMessage id="opening-stock-current" />: {openingStock.quantity}</Typography>
                    <TextField
                      fullWidth
                      multiline
                      minRows={2}
                      sx={{ mt: 1 }}
                      label={<FormattedMessage id="correction-reason" />}
                      value={openingForm.reason ?? ''}
                      onChange={(event) => setOpeningForm({ ...openingForm, reason: event.target.value, expectedOpeningMovementId: openingStock.movementId ?? '' })}
                    />
                  </Grid>
                )}
                {!openingStock?.movementId && (
                  <Grid item xs={12}>
                    <TextField fullWidth multiline minRows={2} label={<FormattedMessage id="notes" />} value={openingForm.notes ?? ''} onChange={(event) => setOpeningForm({ ...openingForm, notes: event.target.value })} />
                  </Grid>
                )}
              </Grid>
            </form>
          </MainCard>

          <MainCard title={<FormattedMessage id="inventory-movement-actions" />}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <Typography variant="subtitle2"><FormattedMessage id="stock-in" /></Typography>
                <Stack spacing={1} sx={{ mt: 1 }}>
                  <TextField type="date" fullWidth label={<FormattedMessage id="date" />} value={stockInForm.movementDate} onChange={(event) => setStockInForm({ ...stockInForm, movementDate: event.target.value })} InputLabelProps={{ shrink: true }} size="small" />
                  <TextField select fullWidth label={<FormattedMessage id="unit" />} value={stockInForm.unitOfMeasureId} onChange={(event) => setStockInForm({ ...stockInForm, unitOfMeasureId: event.target.value })} size="small">
                    {units.map((unit) => <MenuItem key={unit.id} value={unit.id}>{unit.code} - {unit.nameArabic}</MenuItem>)}
                  </TextField>
                  <TextField select fullWidth label={<FormattedMessage id="offset-account" />} value={stockInForm.offsetAccountingAccountId ?? ''} onChange={(event) => setStockInForm({ ...stockInForm, offsetAccountingAccountId: event.target.value || null })} size="small">
                    <MenuItem value=""><FormattedMessage id="select-account" /></MenuItem>
                    {accountingAccounts.map((account) => <MenuItem key={account.id} value={account.id}>{account.code} - {account.nameArabic}</MenuItem>)}
                  </TextField>
                  <TextField type="number" fullWidth label={<FormattedMessage id="quantity" />} value={stockInForm.quantity} onChange={(event) => setStockInForm({ ...stockInForm, quantity: Number(event.target.value) })} size="small" />
                  <TextField type="number" fullWidth label={<FormattedMessage id="unit-cost" />} value={stockInForm.unitCost ?? 0} onChange={(event) => setStockInForm({ ...stockInForm, unitCost: Number(event.target.value) })} size="small" />
                  <TextField fullWidth multiline minRows={2} label={<FormattedMessage id="notes" />} value={stockInForm.notes ?? ''} onChange={(event) => setStockInForm({ ...stockInForm, notes: event.target.value })} size="small" />
                  <Button variant="outlined" disabled={isSaving} onClick={() => runAction(() => postStockIn(item.id, stockInForm))}><FormattedMessage id="post-stock-in" /></Button>
                </Stack>
              </Grid>
              <Grid item xs={12} md={4}>
                <Typography variant="subtitle2"><FormattedMessage id="stock-out" /></Typography>
                <Stack spacing={1} sx={{ mt: 1 }}>
                  <TextField type="date" fullWidth label={<FormattedMessage id="date" />} value={stockOutForm.movementDate} onChange={(event) => setStockOutForm({ ...stockOutForm, movementDate: event.target.value })} InputLabelProps={{ shrink: true }} size="small" />
                  <TextField select fullWidth label={<FormattedMessage id="unit" />} value={stockOutForm.unitOfMeasureId} onChange={(event) => setStockOutForm({ ...stockOutForm, unitOfMeasureId: event.target.value })} size="small">
                    {units.map((unit) => <MenuItem key={unit.id} value={unit.id}>{unit.code} - {unit.nameArabic}</MenuItem>)}
                  </TextField>
                  <TextField select fullWidth label={<FormattedMessage id="offset-account" />} value={stockOutForm.offsetAccountingAccountId ?? ''} onChange={(event) => setStockOutForm({ ...stockOutForm, offsetAccountingAccountId: event.target.value || null })} size="small">
                    <MenuItem value=""><FormattedMessage id="select-account" /></MenuItem>
                    {accountingAccounts.map((account) => <MenuItem key={account.id} value={account.id}>{account.code} - {account.nameArabic}</MenuItem>)}
                  </TextField>
                  <TextField type="number" fullWidth label={<FormattedMessage id="quantity" />} value={stockOutForm.quantity} onChange={(event) => setStockOutForm({ ...stockOutForm, quantity: Number(event.target.value) })} size="small" />
                  <TextField fullWidth multiline minRows={2} label={<FormattedMessage id="notes" />} value={stockOutForm.notes ?? ''} onChange={(event) => setStockOutForm({ ...stockOutForm, notes: event.target.value })} size="small" />
                  <Button variant="outlined" disabled={isSaving} onClick={() => runAction(() => postStockOut(item.id, stockOutForm))}><FormattedMessage id="post-stock-out" /></Button>
                </Stack>
              </Grid>
              <Grid item xs={12} md={4}>
                <Typography variant="subtitle2"><FormattedMessage id="inventory-adjustment" /></Typography>
                <Stack spacing={1} sx={{ mt: 1 }}>
                  <TextField type="date" fullWidth label={<FormattedMessage id="date" />} value={adjustmentForm.movementDate} onChange={(event) => setAdjustmentForm({ ...adjustmentForm, movementDate: event.target.value })} InputLabelProps={{ shrink: true }} size="small" />
                  <TextField select fullWidth label={<FormattedMessage id="unit" />} value={adjustmentForm.unitOfMeasureId} onChange={(event) => setAdjustmentForm({ ...adjustmentForm, unitOfMeasureId: event.target.value })} size="small">
                    {units.map((unit) => <MenuItem key={unit.id} value={unit.id}>{unit.code} - {unit.nameArabic}</MenuItem>)}
                  </TextField>
                  <TextField select fullWidth label={<FormattedMessage id="offset-account" />} value={adjustmentForm.offsetAccountingAccountId ?? ''} onChange={(event) => setAdjustmentForm({ ...adjustmentForm, offsetAccountingAccountId: event.target.value || null })} size="small">
                    <MenuItem value=""><FormattedMessage id="select-account" /></MenuItem>
                    {accountingAccounts.map((account) => <MenuItem key={account.id} value={account.id}>{account.code} - {account.nameArabic}</MenuItem>)}
                  </TextField>
                  <TextField select fullWidth label={<FormattedMessage id="adjustment-type" />} value={adjustmentForm.adjustmentType} onChange={(event) => setAdjustmentForm({ ...adjustmentForm, adjustmentType: event.target.value as 'Increase' | 'Decrease' })} size="small">
                    <MenuItem value="Increase"><FormattedMessage id="increase" /></MenuItem>
                    <MenuItem value="Decrease"><FormattedMessage id="decrease" /></MenuItem>
                  </TextField>
                  <TextField type="number" fullWidth label={<FormattedMessage id="quantity" />} value={adjustmentForm.quantity} onChange={(event) => setAdjustmentForm({ ...adjustmentForm, quantity: Number(event.target.value) })} size="small" />
                  <TextField type="number" fullWidth label={<FormattedMessage id="unit-cost" />} value={adjustmentForm.unitCost ?? 0} onChange={(event) => setAdjustmentForm({ ...adjustmentForm, unitCost: Number(event.target.value) })} size="small" />
                  <TextField fullWidth multiline minRows={2} label={<FormattedMessage id="adjustment-reason" />} value={adjustmentForm.reason} onChange={(event) => setAdjustmentForm({ ...adjustmentForm, reason: event.target.value })} size="small" />
                  <Button variant="outlined" disabled={isSaving} onClick={() => runAction(() => postAdjustment(item.id, adjustmentForm))}><FormattedMessage id="post-adjustment" /></Button>
                </Stack>
              </Grid>
            </Grid>
          </MainCard>

          <MainCard title={<FormattedMessage id="party-item-relations" />}>
            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid item xs={12} md={4}>
                <TextField select fullWidth label={<FormattedMessage id="party" />} value={relationForm.partyId} onChange={(event) => setRelationForm({ ...relationForm, partyId: event.target.value })} size="small">
                  <MenuItem value=""><FormattedMessage id="none" /></MenuItem>
                  {selectedPartyOptions.map((party) => (
                    <MenuItem key={party.id} value={party.id}>{party.code} - {party.nameArabic}</MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} md={2}>
                <TextField select fullWidth label={<FormattedMessage id="relation-type" />} value={relationForm.relationType} onChange={(event) => setRelationForm({ ...relationForm, relationType: event.target.value as 'Customer' | 'Supplier' })} size="small">
                  <MenuItem value="Customer"><FormattedMessage id="party-customer" /></MenuItem>
                  <MenuItem value="Supplier"><FormattedMessage id="party-supplier" /></MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} md={2}>
                <TextField fullWidth label={<FormattedMessage id="party-item-code" />} value={relationForm.partyItemCode ?? ''} onChange={(event) => setRelationForm({ ...relationForm, partyItemCode: event.target.value })} size="small" />
              </Grid>
              <Grid item xs={12} md={2}>
                <TextField fullWidth label={<FormattedMessage id="notes" />} value={relationForm.notes ?? ''} onChange={(event) => setRelationForm({ ...relationForm, notes: event.target.value })} size="small" />
              </Grid>
              <Grid item xs={12} md={2}>
                <Button variant="contained" disabled={isSaving || !relationForm.partyId} onClick={() => runAction(() => createItemPartyRelation(item.id, relationForm))}>
                  <FormattedMessage id="add-relation" />
                </Button>
              </Grid>
            </Grid>
            {relations.length === 0 ? (
              <Typography><FormattedMessage id="inventory-empty-items" /></Typography>
            ) : (
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell><FormattedMessage id="party" /></TableCell>
                      <TableCell><FormattedMessage id="relation-type" /></TableCell>
                      <TableCell><FormattedMessage id="party-item-code" /></TableCell>
                      <TableCell><FormattedMessage id="preferred" /></TableCell>
                      <TableCell><FormattedMessage id="status" /></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {relations.map((relation) => (
                      <TableRow key={relation.id}>
                        <TableCell>{relation.partyCode} - {relation.partyNameArabic}</TableCell>
                        <TableCell>{relation.relationType}</TableCell>
                        <TableCell>{relation.partyItemCode ?? '-'}</TableCell>
                        <TableCell>{relation.isPreferred ? <FormattedMessage id="yes" /> : <FormattedMessage id="no" />}</TableCell>
                        <TableCell>
                          <Stack direction="row" spacing={1}>
                            <Chip label={relation.isActive ? <FormattedMessage id="active" /> : <FormattedMessage id="inactive" />} size="small" />
                            {relation.isActive ? (
                              <Button size="small" onClick={() => runAction(() => deactivatePartyItemRelation(relation.id))}><FormattedMessage id="deactivate" /></Button>
                            ) : null}
                          </Stack>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </MainCard>

          <MainCard title={<FormattedMessage id="item-units" />}>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell><FormattedMessage id="unit" /></TableCell>
                    <TableCell><FormattedMessage id="factor-to-base" /></TableCell>
                    <TableCell><FormattedMessage id="sale-price-override" /></TableCell>
                    <TableCell><FormattedMessage id="effective-sale-price" /></TableCell>
                    <TableCell><FormattedMessage id="default-purchase" /></TableCell>
                    <TableCell><FormattedMessage id="default-sales" /></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {itemUnits.map((unit) => (
                    <TableRow key={unit.id}>
                      <TableCell>{unit.unitCode} - {unit.unitNameArabic}</TableCell>
                      <TableCell>{unit.factorToBase}</TableCell>
                      <TableCell>{unit.salePriceOverride == null ? '-' : unit.salePriceOverride.toFixed(4)}</TableCell>
                      <TableCell>{unit.effectiveSalePrice.toFixed(4)}</TableCell>
                      <TableCell>{unit.isDefaultPurchaseUnit ? <FormattedMessage id="yes" /> : <FormattedMessage id="no" />}</TableCell>
                      <TableCell>{unit.isDefaultSalesUnit ? <FormattedMessage id="yes" /> : <FormattedMessage id="no" />}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </MainCard>
        </Stack>
      </Box>
    </>
  );
}
