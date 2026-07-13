import { FormEvent, useEffect, useMemo, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { Link, useParams } from 'react-router-dom';

import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
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
import Typography from '@mui/material/Typography';

import { useDispatch } from 'store';
import { openSnackbar } from 'store/slices/snackbar';
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
  reverseMovement,
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
  ReverseInventoryMovementRequest,
  OpeningStockRequest
} from '../types/inventory.types';
import { INVENTORY_PERMISSIONS } from '../utils/inventory.constants';

const today = new Date().toISOString().slice(0, 10);

function initialMovement(unitId: string): InventoryMovementRequest {
  return { movementDate: today, unitOfMeasureId: unitId, quantity: 0, notes: '' };
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
  const [openingForm, setOpeningForm] = useState<OpeningStockRequest & { reason?: string; expectedOpeningMovementId?: string }>({
    movementDate: today,
    unitOfMeasureId: '',
    quantity: 0,
    notes: ''
  });
  const [stockInForm, setStockInForm] = useState<InventoryMovementRequest>(initialMovement(''));
  const [stockOutForm, setStockOutForm] = useState<InventoryMovementRequest>(initialMovement(''));
  const [adjustmentForm, setAdjustmentForm] = useState<InventoryAdjustmentRequest>({
    movementDate: today,
    unitOfMeasureId: '',
    quantity: 0,
    adjustmentType: 'Increase',
    reason: ''
  });
  const [relationForm, setRelationForm] = useState<CreateItemPartyRelationRequest>({
    partyId: '',
    relationType: 'Customer',
    partyItemCode: '',
    notes: '',
    isPreferred: false
  });
  const [reverseReason, setReverseReason] = useState('');
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
        reason: openingForm.reason || '',
        expectedOpeningMovementId: openingForm.expectedOpeningMovementId ?? openingStock.movementId ?? ''
      } satisfies CorrectOpeningStockRequest));
      return;
    }

    await runAction(() => setItemOpeningStock(id, {
      movementDate: openingForm.movementDate,
      unitOfMeasureId: openingForm.unitOfMeasureId,
      quantity: Number(openingForm.quantity),
      notes: openingForm.notes ?? null
    }));
  };

  if (isLoading) return <Loader />;
  if (error || !item) return <Typography color="error"><FormattedMessage id="inventory-load-error" /></Typography>;

  return (
    <>
      <Breadcrumbs custom heading="item-details" links={[{ title: 'inventory', to: '/inventory/items' }, { title: 'inventory-items', to: '/inventory/items' }]} />
      <Stack spacing={2}>
        <MainCard
          title={`${item.code} - ${item.nameArabic}`}
          secondary={
            <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
              <Button component={Link} to={`/inventory/items/${item.id}/movements`} variant="outlined"><FormattedMessage id="inventory-movements" /></Button>
              <PermissionGuard permission={INVENTORY_PERMISSIONS.itemsUpdate}>
                <Button component={Link} to={`/inventory/items/${item.id}/edit`} variant="contained"><FormattedMessage id="edit" /></Button>
              </PermissionGuard>
            </Stack>
          }
        >
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}><Typography variant="caption"><FormattedMessage id="item-type" /></Typography><Typography>{item.itemType}</Typography></Grid>
            <Grid item xs={12} md={4}><Typography variant="caption"><FormattedMessage id="base-unit" /></Typography><Typography>{item.baseUnitCode}</Typography></Grid>
            <Grid item xs={12} md={4}><Typography variant="caption"><FormattedMessage id="stock-status" /></Typography><Chip label={item.stockStatus} color={item.stockStatus === 'Normal' ? 'success' : 'warning'} /></Grid>
            <Grid item xs={12} md={4}><Typography variant="caption"><FormattedMessage id="is-purchasable" /></Typography><Typography>{item.isPurchasable ? <FormattedMessage id="yes" /> : <FormattedMessage id="no" />}</Typography></Grid>
            <Grid item xs={12} md={4}><Typography variant="caption"><FormattedMessage id="is-sellable" /></Typography><Typography>{item.isSellable ? <FormattedMessage id="yes" /> : <FormattedMessage id="no" />}</Typography></Grid>
            <Grid item xs={12} md={4}><Typography variant="caption"><FormattedMessage id="current-quantity" /></Typography><Typography>{item.currentQuantity}</Typography></Grid>
            <Grid item xs={12} md={4}><Typography variant="caption"><FormattedMessage id="minimum-quantity" /></Typography><Typography>{item.minimumQuantity}</Typography></Grid>
            <Grid item xs={12} md={4}><Typography variant="caption"><FormattedMessage id="reorder-quantity" /></Typography><Typography>{item.reorderQuantity}</Typography></Grid>
            <Grid item xs={12} md={6}><Typography variant="caption"><FormattedMessage id="description-arabic" /></Typography><Typography>{item.descriptionArabic ?? '-'}</Typography></Grid>
            <Grid item xs={12} md={6}><Typography variant="caption"><FormattedMessage id="description-english" /></Typography><Typography>{item.descriptionEnglish ?? '-'}</Typography></Grid>
            <Grid item xs={12}><Typography variant="caption"><FormattedMessage id="notes" /></Typography><Typography>{item.notes ?? '-'}</Typography></Grid>
          </Grid>
        </MainCard>

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
              <Stack spacing={1}>
                <TextField type="date" fullWidth label={<FormattedMessage id="date" />} value={stockInForm.movementDate} onChange={(event) => setStockInForm({ ...stockInForm, movementDate: event.target.value })} InputLabelProps={{ shrink: true }} />
                <TextField select fullWidth label={<FormattedMessage id="unit" />} value={stockInForm.unitOfMeasureId} onChange={(event) => setStockInForm({ ...stockInForm, unitOfMeasureId: event.target.value })}>
                  {units.map((unit) => <MenuItem key={unit.id} value={unit.id}>{unit.code} - {unit.nameArabic}</MenuItem>)}
                </TextField>
                <TextField type="number" fullWidth label={<FormattedMessage id="quantity" />} value={stockInForm.quantity} onChange={(event) => setStockInForm({ ...stockInForm, quantity: Number(event.target.value) })} />
                <TextField fullWidth multiline minRows={2} label={<FormattedMessage id="notes" />} value={stockInForm.notes ?? ''} onChange={(event) => setStockInForm({ ...stockInForm, notes: event.target.value })} />
                <Button variant="outlined" disabled={isSaving} onClick={() => runAction(() => postStockIn(item.id, stockInForm))}><FormattedMessage id="post-stock-in" /></Button>
              </Stack>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="subtitle2"><FormattedMessage id="stock-out" /></Typography>
              <Stack spacing={1}>
                <TextField type="date" fullWidth label={<FormattedMessage id="date" />} value={stockOutForm.movementDate} onChange={(event) => setStockOutForm({ ...stockOutForm, movementDate: event.target.value })} InputLabelProps={{ shrink: true }} />
                <TextField select fullWidth label={<FormattedMessage id="unit" />} value={stockOutForm.unitOfMeasureId} onChange={(event) => setStockOutForm({ ...stockOutForm, unitOfMeasureId: event.target.value })}>
                  {units.map((unit) => <MenuItem key={unit.id} value={unit.id}>{unit.code} - {unit.nameArabic}</MenuItem>)}
                </TextField>
                <TextField type="number" fullWidth label={<FormattedMessage id="quantity" />} value={stockOutForm.quantity} onChange={(event) => setStockOutForm({ ...stockOutForm, quantity: Number(event.target.value) })} />
                <TextField fullWidth multiline minRows={2} label={<FormattedMessage id="notes" />} value={stockOutForm.notes ?? ''} onChange={(event) => setStockOutForm({ ...stockOutForm, notes: event.target.value })} />
                <Button variant="outlined" disabled={isSaving} onClick={() => runAction(() => postStockOut(item.id, stockOutForm))}><FormattedMessage id="post-stock-out" /></Button>
              </Stack>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="subtitle2"><FormattedMessage id="inventory-adjustment" /></Typography>
              <Stack spacing={1}>
                <TextField type="date" fullWidth label={<FormattedMessage id="date" />} value={adjustmentForm.movementDate} onChange={(event) => setAdjustmentForm({ ...adjustmentForm, movementDate: event.target.value })} InputLabelProps={{ shrink: true }} />
                <TextField select fullWidth label={<FormattedMessage id="unit" />} value={adjustmentForm.unitOfMeasureId} onChange={(event) => setAdjustmentForm({ ...adjustmentForm, unitOfMeasureId: event.target.value })}>
                  {units.map((unit) => <MenuItem key={unit.id} value={unit.id}>{unit.code} - {unit.nameArabic}</MenuItem>)}
                </TextField>
                <TextField select fullWidth label={<FormattedMessage id="adjustment-type" />} value={adjustmentForm.adjustmentType} onChange={(event) => setAdjustmentForm({ ...adjustmentForm, adjustmentType: event.target.value as 'Increase' | 'Decrease' })}>
                  <MenuItem value="Increase"><FormattedMessage id="increase" /></MenuItem>
                  <MenuItem value="Decrease"><FormattedMessage id="decrease" /></MenuItem>
                </TextField>
                <TextField type="number" fullWidth label={<FormattedMessage id="quantity" />} value={adjustmentForm.quantity} onChange={(event) => setAdjustmentForm({ ...adjustmentForm, quantity: Number(event.target.value) })} />
                <TextField fullWidth multiline minRows={2} label={<FormattedMessage id="adjustment-reason" />} value={adjustmentForm.reason} onChange={(event) => setAdjustmentForm({ ...adjustmentForm, reason: event.target.value })} />
                <Button variant="outlined" disabled={isSaving} onClick={() => runAction(() => postAdjustment(item.id, adjustmentForm))}><FormattedMessage id="post-adjustment" /></Button>
              </Stack>
            </Grid>
          </Grid>
        </MainCard>

        <MainCard title={<FormattedMessage id="party-item-relations" />}>
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={12} md={4}>
              <TextField select fullWidth label={<FormattedMessage id="party" />} value={relationForm.partyId} onChange={(event) => setRelationForm({ ...relationForm, partyId: event.target.value })}>
                <MenuItem value=""><FormattedMessage id="none" /></MenuItem>
                {selectedPartyOptions.map((party) => (
                  <MenuItem key={party.id} value={party.id}>{party.code} - {party.nameArabic}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} md={2}>
              <TextField select fullWidth label={<FormattedMessage id="relation-type" />} value={relationForm.relationType} onChange={(event) => setRelationForm({ ...relationForm, relationType: event.target.value as 'Customer' | 'Supplier' })}>
                <MenuItem value="Customer"><FormattedMessage id="party-customer" /></MenuItem>
                <MenuItem value="Supplier"><FormattedMessage id="party-supplier" /></MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} md={2}>
              <TextField fullWidth label={<FormattedMessage id="party-item-code" />} value={relationForm.partyItemCode ?? ''} onChange={(event) => setRelationForm({ ...relationForm, partyItemCode: event.target.value })} />
            </Grid>
            <Grid item xs={12} md={2}>
              <TextField fullWidth label={<FormattedMessage id="notes" />} value={relationForm.notes ?? ''} onChange={(event) => setRelationForm({ ...relationForm, notes: event.target.value })} />
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
                          <Chip label={relation.isActive ? <FormattedMessage id="active" /> : <FormattedMessage id="inactive" />} />
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
                  <TableCell><FormattedMessage id="default-purchase" /></TableCell>
                  <TableCell><FormattedMessage id="default-sales" /></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {itemUnits.map((unit) => (
                  <TableRow key={unit.id}>
                    <TableCell>{unit.unitCode} - {unit.unitNameArabic}</TableCell>
                    <TableCell>{unit.factorToBase}</TableCell>
                    <TableCell>{unit.isDefaultPurchaseUnit ? <FormattedMessage id="yes" /> : <FormattedMessage id="no" />}</TableCell>
                    <TableCell>{unit.isDefaultSalesUnit ? <FormattedMessage id="yes" /> : <FormattedMessage id="no" />}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </MainCard>

        <MainCard title={<FormattedMessage id="inventory-movements" />}>
          <Stack spacing={2}>
            <TextField fullWidth label={<FormattedMessage id="movement-reversal-reason" />} value={reverseReason} onChange={(event) => setReverseReason(event.target.value)} />
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell><FormattedMessage id="date" /></TableCell>
                    <TableCell><FormattedMessage id="entry-type" /></TableCell>
                    <TableCell><FormattedMessage id="quantity" /></TableCell>
                    <TableCell><FormattedMessage id="running-balance" /></TableCell>
                    <TableCell><FormattedMessage id="description" /></TableCell>
                    <TableCell align="right"><FormattedMessage id="actions" /></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {movements.map((movement) => (
                    <TableRow key={movement.id}>
                      <TableCell>{movement.movementDate}</TableCell>
                      <TableCell>{movement.movementType}</TableCell>
                      <TableCell>{movement.quantity} {movement.unitCode}</TableCell>
                      <TableCell>{movement.runningQuantity}</TableCell>
                      <TableCell>{movement.descriptionArabic}</TableCell>
                      <TableCell align="right">
                        <Button
                          size="small"
                          disabled={isSaving}
                          onClick={() => runAction(() => reverseMovement(movement.id, { reason: reverseReason || intl.formatMessage({ id: 'movement-reversal-default-reason' }) } satisfies ReverseInventoryMovementRequest))}
                        >
                          <FormattedMessage id="reverse" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Stack>
        </MainCard>
      </Stack>
    </>
  );
}
