import { FormEvent, useEffect, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { useNavigate, useParams } from 'react-router-dom';

import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import Grid from '@mui/material/GridLegacy';
import IconButton from '@mui/material/IconButton';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { IconPlus, IconTrash } from '@tabler/icons-react';

import { useDispatch } from 'store';
import { openSnackbar } from 'store/slices/snackbar';
import MainCard from 'ui-component/cards/MainCard';
import Breadcrumbs from 'ui-component/extended/Breadcrumbs';
import Loader from 'ui-component/Loader';
import { createItem, updateItem } from '../api/inventoryApi';
import { useInventoryCategories, useInventoryItem, useInventoryItemUnits, useInventoryUnits } from '../hooks/useInventory';
import type { CreateItemRequest, ItemUnitInput, UpdateItemRequest } from '../types/inventory.types';
import { ITEM_TYPES } from '../utils/inventory.constants';

type EditableUnitRow = ItemUnitInput;

const today = new Date().toISOString().slice(0, 10);

function buildBaseUnitRow(baseUnitId: string): EditableUnitRow {
  return { unitOfMeasureId: baseUnitId, factorToBase: 1, isDefaultPurchaseUnit: true, isDefaultSalesUnit: true, salePriceOverride: null };
}

export default function InventoryItemFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const intl = useIntl();
  const dispatch = useDispatch();
  const isEdit = Boolean(id);
  const { item, isLoading } = useInventoryItem(id);
  const { items: existingItemUnits } = useInventoryItemUnits(id);
  const { items: units } = useInventoryUnits();
  const { items: categories } = useInventoryCategories();
  const [form, setForm] = useState<CreateItemRequest>({
    nameArabic: '',
    nameEnglish: '',
    itemType: 'RawMaterial',
    baseUnitId: '',
    categoryId: '',
    sku: '',
    barcode: '',
    descriptionArabic: '',
    descriptionEnglish: '',
    isPurchasable: true,
    isSellable: true,
    minimumQuantity: 0,
    reorderQuantity: 0,
    allowNegativeStock: false,
    defaultSalePrice: 0,
    notes: '',
    units: [],
    openingStock: null
  });
  const [unitRows, setUnitRows] = useState<EditableUnitRow[]>([]);
  const [openingQuantity, setOpeningQuantity] = useState(0);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (item) {
      setForm({
        nameArabic: item.nameArabic,
        nameEnglish: item.nameEnglish ?? '',
        itemType: item.itemType,
        baseUnitId: item.baseUnitId,
        categoryId: item.categoryId ?? '',
        sku: item.sku ?? '',
        barcode: item.barcode ?? '',
        descriptionArabic: item.descriptionArabic ?? '',
        descriptionEnglish: item.descriptionEnglish ?? '',
        isPurchasable: item.isPurchasable,
        isSellable: item.isSellable,
        minimumQuantity: item.minimumQuantity,
        reorderQuantity: item.reorderQuantity,
        allowNegativeStock: item.allowNegativeStock,
        defaultSalePrice: item.defaultSalePrice,
        notes: item.notes ?? '',
        units: [],
        openingStock: null
      });
    }
  }, [item]);

  useEffect(() => {
    if (isEdit || !form.baseUnitId) {
      return;
    }

    if (unitRows.length === 0) {
      setUnitRows([buildBaseUnitRow(form.baseUnitId)]);
    }
  }, [form.baseUnitId, isEdit, unitRows.length]);

  useEffect(() => {
    if (!isEdit || !id) {
      return;
    }

    void (async () => {
      try {
        setUnitRows(existingItemUnits.length > 0 ? existingItemUnits.map((unit) => ({
          unitOfMeasureId: unit.unitOfMeasureId,
          factorToBase: unit.factorToBase,
          isDefaultPurchaseUnit: unit.isDefaultPurchaseUnit,
          isDefaultSalesUnit: unit.isDefaultSalesUnit,
          salePriceOverride: unit.salePriceOverride ?? null
        })) : []);
      } catch {
        setUnitRows([]);
      }
    })();
  }, [existingItemUnits, id, isEdit]);

  useEffect(() => {
    if (!form.baseUnitId) {
      return;
    }
    setUnitRows((current) => {
      if (current.length === 0) {
        return [buildBaseUnitRow(form.baseUnitId)];
      }
      const hasBase = current.some((row) => row.unitOfMeasureId === form.baseUnitId);
      if (hasBase) {
        return current.map((row) => (
          row.unitOfMeasureId === form.baseUnitId
            ? buildBaseUnitRow(form.baseUnitId)
            : row
        ));
      }
      return [buildBaseUnitRow(form.baseUnitId), ...current];
    });
  }, [form.baseUnitId]);

  const notify = (message: string, severity: 'success' | 'error' = 'success') => {
    dispatch(openSnackbar({ open: true, message, variant: 'alert', severity }));
  };

  const updateUnitRow = (index: number, next: Partial<EditableUnitRow>) => {
    setUnitRows((current) => current.map((row, rowIndex) => (rowIndex === index ? { ...row, ...next } : row)));
  };

  const removeUnitRow = (index: number) => {
    setUnitRows((current) => current.filter((_, rowIndex) => rowIndex !== index));
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!form.baseUnitId) {
      notify(intl.formatMessage({ id: 'inventory-base-unit-required' }), 'error');
      return;
    }

    const normalizedUnits: ItemUnitInput[] = [];
    const seen = new Set<string>();
    [...unitRows, buildBaseUnitRow(form.baseUnitId)].forEach((row) => {
      if (!row.unitOfMeasureId || seen.has(row.unitOfMeasureId)) {
        return;
      }
      seen.add(row.unitOfMeasureId);
      normalizedUnits.push(
        row.unitOfMeasureId === form.baseUnitId
          ? buildBaseUnitRow(form.baseUnitId)
          : {
              unitOfMeasureId: row.unitOfMeasureId,
              factorToBase: Number(row.factorToBase) || 0,
              isDefaultPurchaseUnit: row.isDefaultPurchaseUnit,
              isDefaultSalesUnit: row.isDefaultSalesUnit,
              salePriceOverride: row.salePriceOverride ?? null
            }
      );
    });

    const request = {
      ...form,
      categoryId: form.categoryId || null,
      units: normalizedUnits,
      openingStock: !isEdit && openingQuantity > 0 ? { movementDate: today, unitOfMeasureId: form.baseUnitId, quantity: openingQuantity, notes: 'Opening stock' } : null
    } satisfies CreateItemRequest;

    try {
      setIsSaving(true);
      if (isEdit && item) {
        const updateRequest: UpdateItemRequest = { ...request, rowVersion: item.rowVersion };
        await updateItem(item.id, updateRequest);
        notify(intl.formatMessage({ id: 'inventory-action-success' }));
        navigate(`/inventory/items/${item.id}`);
        return;
      }

      const created = await createItem(request);
      notify(intl.formatMessage({ id: 'inventory-action-success' }));
      navigate(`/inventory/items/${created.id}`);
    } catch (saveError) {
      notify(saveError instanceof Error ? saveError.message : intl.formatMessage({ id: 'inventory-action-failed' }), 'error');
    } finally {
      setIsSaving(false);
    }
  };

  if (isEdit && isLoading) return <Loader />;

  return (
    <>
      <Breadcrumbs custom heading={isEdit ? 'edit-item' : 'create-item'} links={[{ title: 'inventory', to: '/inventory/items' }, { title: 'inventory-items', to: '/inventory/items' }]} />
      <MainCard title={<FormattedMessage id={isEdit ? 'edit-item' : 'create-item'} />}>
        <form onSubmit={submit}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography color="text.secondary">
                <FormattedMessage id="inventory-item-form-help" />
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}><TextField required fullWidth label={<FormattedMessage id="name-arabic" />} value={form.nameArabic} onChange={(e) => setForm({ ...form, nameArabic: e.target.value })} /></Grid>
            <Grid item xs={12} md={6}><TextField fullWidth label={<FormattedMessage id="name-english" />} value={form.nameEnglish ?? ''} onChange={(e) => setForm({ ...form, nameEnglish: e.target.value })} /></Grid>
            <Grid item xs={12} md={4}>
              <TextField select fullWidth label={<FormattedMessage id="item-type" />} value={form.itemType} onChange={(e) => setForm({ ...form, itemType: e.target.value })}>
                {ITEM_TYPES.map((type) => <MenuItem key={type} value={type}>{type}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField select required fullWidth label={<FormattedMessage id="base-unit" />} value={form.baseUnitId} onChange={(e) => setForm({ ...form, baseUnitId: e.target.value })}>
                <MenuItem value=""><FormattedMessage id="none" /></MenuItem>
                {units.map((unit) => <MenuItem key={unit.id} value={unit.id}>{unit.code} - {unit.nameArabic}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField select fullWidth label={<FormattedMessage id="item-category" />} value={form.categoryId ?? ''} onChange={(e) => setForm({ ...form, categoryId: e.target.value })}>
                <MenuItem value=""><FormattedMessage id="none" /></MenuItem>
                {categories.map((category) => <MenuItem key={category.id} value={category.id}>{category.nameArabic}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={12} md={3}><TextField fullWidth label="SKU" value={form.sku ?? ''} onChange={(e) => setForm({ ...form, sku: e.target.value })} /></Grid>
            <Grid item xs={12} md={3}><TextField fullWidth label={<FormattedMessage id="barcode" />} value={form.barcode ?? ''} onChange={(e) => setForm({ ...form, barcode: e.target.value })} /></Grid>
            <Grid item xs={12} md={3}><TextField type="number" fullWidth label={<FormattedMessage id="minimum-quantity" />} value={form.minimumQuantity} onChange={(e) => setForm({ ...form, minimumQuantity: Number(e.target.value) })} /></Grid>
            <Grid item xs={12} md={3}><TextField type="number" fullWidth label={<FormattedMessage id="reorder-quantity" />} value={form.reorderQuantity} onChange={(e) => setForm({ ...form, reorderQuantity: Number(e.target.value) })} /></Grid>
            <Grid item xs={12} md={3}>
              <TextField
                type="number"
                fullWidth
                label={<FormattedMessage id="default-sales-price" />}
                value={form.defaultSalePrice}
                onChange={(e) => setForm({ ...form, defaultSalePrice: Number(e.target.value) })}
                inputProps={{ min: 0, step: 0.0001 }}
              />
            </Grid>
            <Grid item xs={12} md={6}><TextField fullWidth multiline minRows={2} label={<FormattedMessage id="description-arabic" />} value={form.descriptionArabic ?? ''} onChange={(e) => setForm({ ...form, descriptionArabic: e.target.value })} /></Grid>
            <Grid item xs={12} md={6}><TextField fullWidth multiline minRows={2} label={<FormattedMessage id="description-english" />} value={form.descriptionEnglish ?? ''} onChange={(e) => setForm({ ...form, descriptionEnglish: e.target.value })} /></Grid>
            {!isEdit && <Grid item xs={12} md={4}><TextField type="number" fullWidth label={<FormattedMessage id="opening-stock" />} value={openingQuantity} onChange={(e) => setOpeningQuantity(Number(e.target.value))} /></Grid>}
            <Grid item xs={12} md={4}>
              <Stack direction="row" spacing={1} alignItems="center">
                <Switch checked={form.isPurchasable} onChange={(e) => setForm({ ...form, isPurchasable: e.target.checked })} />
                <Typography><FormattedMessage id="is-purchasable" /></Typography>
              </Stack>
            </Grid>
            <Grid item xs={12} md={4}>
              <Stack direction="row" spacing={1} alignItems="center">
                <Switch checked={form.isSellable} onChange={(e) => setForm({ ...form, isSellable: e.target.checked })} />
                <Typography><FormattedMessage id="is-sellable" /></Typography>
              </Stack>
            </Grid>
            <Grid item xs={12} md={4}>
              <Stack direction="row" spacing={1} alignItems="center">
                <Switch checked={form.allowNegativeStock} onChange={(e) => setForm({ ...form, allowNegativeStock: e.target.checked })} />
                <Typography><FormattedMessage id="allow-negative-stock" /></Typography>
              </Stack>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="subtitle2"><FormattedMessage id="alternate-units" /></Typography>
              <Typography color="text.secondary" variant="body2">
                <FormattedMessage id="alternate-units-help" />
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell><FormattedMessage id="unit" /></TableCell>
                      <TableCell><FormattedMessage id="factor-to-base" /></TableCell>
                      <TableCell><FormattedMessage id="sale-price-override" /></TableCell>
                      <TableCell><FormattedMessage id="default-purchase" /></TableCell>
                      <TableCell><FormattedMessage id="default-sales" /></TableCell>
                      <TableCell align="right">
                        <Button size="small" startIcon={<IconPlus size={16} />} onClick={() => setUnitRows((current) => [...current, { unitOfMeasureId: '', factorToBase: 1, isDefaultPurchaseUnit: false, isDefaultSalesUnit: false, salePriceOverride: null }])}>
                          <FormattedMessage id="add" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {unitRows.map((row, index) => (
                      <TableRow key={`${row.unitOfMeasureId || 'empty'}-${index}`}>
                        <TableCell sx={{ minWidth: 220 }}>
                          <TextField
                            select
                            fullWidth
                            size="small"
                            value={row.unitOfMeasureId}
                            onChange={(event) => updateUnitRow(index, { unitOfMeasureId: event.target.value })}
                          >
                            <MenuItem value=""><FormattedMessage id="none" /></MenuItem>
                            {units.map((unit) => <MenuItem key={unit.id} value={unit.id}>{unit.code} - {unit.nameArabic}</MenuItem>)}
                          </TextField>
                        </TableCell>
                        <TableCell sx={{ minWidth: 140 }}>
                          <TextField
                            size="small"
                            type="number"
                            fullWidth
                            value={row.factorToBase}
                            onChange={(event) => updateUnitRow(index, { factorToBase: Number(event.target.value) })}
                            disabled={row.unitOfMeasureId === form.baseUnitId}
                          />
                        </TableCell>
                        <TableCell sx={{ minWidth: 180 }}>
                          {row.unitOfMeasureId === form.baseUnitId ? (
                            <Typography variant="body2" color="text.secondary">
                              <FormattedMessage id="base-unit-uses-default-sales-price" values={{ price: form.defaultSalePrice.toFixed(4) }} />
                            </Typography>
                          ) : (
                            <Stack spacing={0.5}>
                              <TextField
                                size="small"
                                type="number"
                                fullWidth
                                value={row.salePriceOverride ?? ''}
                                onChange={(event) => updateUnitRow(index, { salePriceOverride: event.target.value === '' ? null : Number(event.target.value) })}
                                inputProps={{ min: 0, step: 0.0001 }}
                                placeholder={intl.formatMessage({ id: 'optional' })}
                              />
                              <Typography variant="caption" color="text.secondary">
                                <FormattedMessage
                                  id={row.salePriceOverride == null ? 'calculated-sale-price' : 'sale-price-override-set'}
                                  values={{
                                    price: (form.defaultSalePrice * (Number(row.factorToBase) || 0)).toFixed(4)
                                  }}
                                />
                              </Typography>
                            </Stack>
                          )}
                        </TableCell>
                        <TableCell align="center">
                          <Checkbox checked={row.isDefaultPurchaseUnit || row.unitOfMeasureId === form.baseUnitId} onChange={(event) => updateUnitRow(index, { isDefaultPurchaseUnit: event.target.checked })} disabled={row.unitOfMeasureId === form.baseUnitId} />
                        </TableCell>
                        <TableCell align="center">
                          <Checkbox checked={row.isDefaultSalesUnit || row.unitOfMeasureId === form.baseUnitId} onChange={(event) => updateUnitRow(index, { isDefaultSalesUnit: event.target.checked })} disabled={row.unitOfMeasureId === form.baseUnitId} />
                        </TableCell>
                        <TableCell align="right">
                          <Tooltip title={<FormattedMessage id="remove" />}>
                            <span>
                              <IconButton onClick={() => removeUnitRow(index)} disabled={row.unitOfMeasureId === form.baseUnitId}>
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
            </Grid>
            <Grid item xs={12}><TextField fullWidth multiline minRows={3} label={<FormattedMessage id="notes" />} value={form.notes ?? ''} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></Grid>
            <Grid item xs={12}>
              <Stack direction="row" spacing={1}>
                <Button type="submit" variant="contained" disabled={isSaving}><FormattedMessage id="save" /></Button>
                <Button onClick={() => navigate('/inventory/items')} disabled={isSaving}><FormattedMessage id="cancel" /></Button>
              </Stack>
            </Grid>
          </Grid>
        </form>
      </MainCard>
    </>
  );
}
