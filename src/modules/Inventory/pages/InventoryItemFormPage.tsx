import { FormEvent, useEffect, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { useNavigate, useParams } from 'react-router-dom';

import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Checkbox from '@mui/material/Checkbox';
import Divider from '@mui/material/Divider';
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
import SubCard from 'ui-component/cards/SubCard';
import Breadcrumbs from 'ui-component/extended/Breadcrumbs';
import Loader from 'ui-component/Loader';
import { createItem, updateItem } from '../api/inventoryApi';
import { useInventoryCategories, useInventoryItem, useInventoryItemUnits, useInventoryUnits } from '../hooks/useInventory';
import type { CreateItemRequest, ItemUnitInput, UpdateItemRequest } from '../types/inventory.types';
import { ITEM_TYPES, getItemTypeLabel } from '../utils/inventory.constants';

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
  const [openingUnitCost, setOpeningUnitCost] = useState(0);
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
      openingStock: !isEdit && openingQuantity > 0 ? { movementDate: today, unitOfMeasureId: form.baseUnitId, quantity: openingQuantity, unitCost: openingUnitCost, notes: 'Opening stock' } : null
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
      <MainCard 
        title={<FormattedMessage id={isEdit ? 'edit-item' : 'create-item'} />}
      >
        <form onSubmit={submit}>
          <Grid container spacing={3}>
            {/* Left Column: Main Information */}
            <Grid item xs={12} md={8}>
              <Stack spacing={3}>
                
                {/* General Information */}
                <SubCard title={<Typography variant="h4" color="primary"><FormattedMessage id="general-information" defaultMessage="المعلومات العامة" /></Typography>}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <TextField size="small" required fullWidth label={<FormattedMessage id="name-arabic" />} value={form.nameArabic} onChange={(e) => setForm({ ...form, nameArabic: e.target.value })} />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField size="small" fullWidth label={<FormattedMessage id="name-english" />} value={form.nameEnglish ?? ''} onChange={(e) => setForm({ ...form, nameEnglish: e.target.value })} />
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <TextField size="small" select fullWidth label={<FormattedMessage id="item-type" />} value={form.itemType} onChange={(e) => setForm({ ...form, itemType: e.target.value })}>
                        {ITEM_TYPES.map((type) => <MenuItem key={type} value={type}>{getItemTypeLabel(intl, type)}</MenuItem>)}
                      </TextField>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <TextField size="small" select fullWidth label={<FormattedMessage id="item-category" />} value={form.categoryId ?? ''} onChange={(e) => setForm({ ...form, categoryId: e.target.value })}>
                        <MenuItem value=""><FormattedMessage id="none" /></MenuItem>
                        {categories.map((category) => <MenuItem key={category.id} value={category.id}>{category.nameArabic}</MenuItem>)}
                      </TextField>
                    </Grid>
                    <Grid item xs={12} md={2}>
                      <TextField size="small" fullWidth label="SKU" value={form.sku ?? ''} onChange={(e) => setForm({ ...form, sku: e.target.value })} />
                    </Grid>
                    <Grid item xs={12} md={2}>
                      <TextField size="small" fullWidth label={<FormattedMessage id="barcode" />} value={form.barcode ?? ''} onChange={(e) => setForm({ ...form, barcode: e.target.value })} />
                    </Grid>
                  </Grid>
                </SubCard>

                {/* Units of Measure */}
                <SubCard title={<Typography variant="h4" color="primary"><FormattedMessage id="units-of-measure" defaultMessage="وحدات القياس" /></Typography>}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <TextField size="small" select required fullWidth label={<FormattedMessage id="base-unit" />} value={form.baseUnitId} onChange={(e) => setForm({ ...form, baseUnitId: e.target.value })}>
                        <MenuItem value=""><FormattedMessage id="none" /></MenuItem>
                        {units.map((unit) => <MenuItem key={unit.id} value={unit.id}>{unit.code} - {unit.nameArabic}</MenuItem>)}
                      </TextField>
                    </Grid>
                  </Grid>
                  
                  <Box sx={{ mt: 3, pt: 2, borderTop: '1px dashed', borderColor: 'divider' }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
                      <Box>
                        <Typography variant="subtitle1"><FormattedMessage id="alternate-units" /></Typography>
                        <Typography color="text.secondary" variant="caption"><FormattedMessage id="alternate-units-help" /></Typography>
                      </Box>
                      <Button size="small" variant="outlined" startIcon={<IconPlus size={16} />} onClick={() => setUnitRows((current) => [...current, { unitOfMeasureId: '', factorToBase: 1, isDefaultPurchaseUnit: false, isDefaultSalesUnit: false, salePriceOverride: null }])}>
                        <FormattedMessage id="add" />
                      </Button>
                    </Stack>
                    <TableContainer sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                      <Table size="small">
                        <TableHead sx={{ bgcolor: 'grey.50' }}>
                          <TableRow>
                            <TableCell><FormattedMessage id="unit" /></TableCell>
                            <TableCell><FormattedMessage id="factor-to-base" /></TableCell>
                            <TableCell><FormattedMessage id="sale-price-override" /></TableCell>
                            <TableCell align="center"><FormattedMessage id="default-purchase" /></TableCell>
                            <TableCell align="center"><FormattedMessage id="default-sales" /></TableCell>
                            <TableCell align="right"></TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {unitRows.map((row, index) => (
                            <TableRow key={`${row.unitOfMeasureId || 'empty'}-${index}`} hover>
                              <TableCell sx={{ minWidth: 150, borderBottom: 'none' }}>
                                <TextField select fullWidth size="small" value={row.unitOfMeasureId} onChange={(event) => updateUnitRow(index, { unitOfMeasureId: event.target.value })}>
                                  <MenuItem value=""><FormattedMessage id="none" /></MenuItem>
                                  {units.map((unit) => <MenuItem key={unit.id} value={unit.id}>{unit.code} - {unit.nameArabic}</MenuItem>)}
                                </TextField>
                              </TableCell>
                              <TableCell sx={{ minWidth: 100, borderBottom: 'none' }}>
                                <TextField size="small" type="number" fullWidth value={row.factorToBase} onChange={(event) => updateUnitRow(index, { factorToBase: Number(event.target.value) })} disabled={row.unitOfMeasureId === form.baseUnitId} />
                              </TableCell>
                              <TableCell sx={{ minWidth: 150, borderBottom: 'none' }}>
                                {row.unitOfMeasureId === form.baseUnitId ? (
                                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                                    <FormattedMessage id="base-unit-uses-default-sales-price" values={{ price: form.defaultSalePrice.toFixed(4) }} />
                                  </Typography>
                                ) : (
                                  <Stack spacing={0.5}>
                                    <TextField size="small" type="number" fullWidth value={row.salePriceOverride ?? ''} onChange={(event) => updateUnitRow(index, { salePriceOverride: event.target.value === '' ? null : Number(event.target.value) })} inputProps={{ min: 0, step: 0.0001 }} placeholder={intl.formatMessage({ id: 'optional' })} />
                                    <Typography variant="caption" color="text.secondary">
                                      <FormattedMessage id={row.salePriceOverride == null ? 'calculated-sale-price' : 'sale-price-override-set'} values={{ price: (form.defaultSalePrice * (Number(row.factorToBase) || 0)).toFixed(4) }} />
                                    </Typography>
                                  </Stack>
                                )}
                              </TableCell>
                              <TableCell align="center" sx={{ borderBottom: 'none' }}>
                                <Checkbox checked={row.isDefaultPurchaseUnit || row.unitOfMeasureId === form.baseUnitId} onChange={(event) => updateUnitRow(index, { isDefaultPurchaseUnit: event.target.checked })} disabled={row.unitOfMeasureId === form.baseUnitId} />
                              </TableCell>
                              <TableCell align="center" sx={{ borderBottom: 'none' }}>
                                <Checkbox checked={row.isDefaultSalesUnit || row.unitOfMeasureId === form.baseUnitId} onChange={(event) => updateUnitRow(index, { isDefaultSalesUnit: event.target.checked })} disabled={row.unitOfMeasureId === form.baseUnitId} />
                              </TableCell>
                              <TableCell align="right" sx={{ borderBottom: 'none' }}>
                                <Tooltip title={<FormattedMessage id="remove" />}>
                                  <span>
                                    <IconButton color="error" size="small" onClick={() => removeUnitRow(index)} disabled={row.unitOfMeasureId === form.baseUnitId}>
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
                  </Box>
                </SubCard>

              </Stack>
            </Grid>

            {/* Right Column: Settings & Pricing */}
            <Grid item xs={12} md={4}>
              <Stack spacing={3}>
                
                {/* Pricing & Stock */}
                <SubCard title={<Typography variant="h4" color="primary"><FormattedMessage id="pricing-and-stock" defaultMessage="التسعير والمخزون" /></Typography>}>
                  <Stack spacing={2}>
                    <TextField size="small" type="number" fullWidth label={<FormattedMessage id="default-sales-price" />} value={form.defaultSalePrice} onChange={(e) => setForm({ ...form, defaultSalePrice: Number(e.target.value) })} inputProps={{ min: 0, step: 0.0001 }} />
                    <Stack direction="row" spacing={2}>
                      <TextField size="small" type="number" fullWidth label={<FormattedMessage id="minimum-quantity" />} value={form.minimumQuantity} onChange={(e) => setForm({ ...form, minimumQuantity: Number(e.target.value) })} />
                      <TextField size="small" type="number" fullWidth label={<FormattedMessage id="reorder-quantity" />} value={form.reorderQuantity} onChange={(e) => setForm({ ...form, reorderQuantity: Number(e.target.value) })} />
                    </Stack>
                    {!isEdit && (
                      <Box sx={{ p: 1.5, bgcolor: 'primary.lighter', borderRadius: 1 }}>
                        <TextField size="small" type="number" fullWidth label={<FormattedMessage id="opening-stock" />} value={openingQuantity} onChange={(e) => setOpeningQuantity(Number(e.target.value))} />
                        <TextField size="small" type="number" fullWidth sx={{ mt: 1 }} label={<FormattedMessage id="unit-cost" defaultMessage="Unit Cost" />} value={openingUnitCost} onChange={(e) => setOpeningUnitCost(Number(e.target.value))} />
                        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>يُستخدم لتسجيل الرصيد الافتتاحي لأول مرة</Typography>
                      </Box>
                    )}
                  </Stack>
                </SubCard>

                {/* Settings */}
                <SubCard title={<Typography variant="h4" color="primary"><FormattedMessage id="settings" defaultMessage="الإعدادات" /></Typography>}>
                  <Stack spacing={1}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ p: 1, bgcolor: 'grey.50', borderRadius: 1 }}>
                      <Typography variant="body2" fontWeight={500}><FormattedMessage id="is-purchasable" /></Typography>
                      <Switch size="small" checked={form.isPurchasable} onChange={(e) => setForm({ ...form, isPurchasable: e.target.checked })} />
                    </Stack>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ p: 1, bgcolor: 'grey.50', borderRadius: 1 }}>
                      <Typography variant="body2" fontWeight={500}><FormattedMessage id="is-sellable" /></Typography>
                      <Switch size="small" checked={form.isSellable} onChange={(e) => setForm({ ...form, isSellable: e.target.checked })} />
                    </Stack>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ p: 1, bgcolor: 'grey.50', borderRadius: 1 }}>
                      <Typography variant="body2" fontWeight={500}><FormattedMessage id="allow-negative-stock" /></Typography>
                      <Switch size="small" checked={form.allowNegativeStock} onChange={(e) => setForm({ ...form, allowNegativeStock: e.target.checked })} />
                    </Stack>
                  </Stack>
                </SubCard>

                {/* Additional Information */}
                <SubCard title={<Typography variant="h4" color="primary"><FormattedMessage id="additional-info" defaultMessage="معلومات إضافية" /></Typography>}>
                  <Stack spacing={2}>
                    <TextField size="small" fullWidth multiline minRows={2} label={<FormattedMessage id="description-arabic" />} value={form.descriptionArabic ?? ''} onChange={(e) => setForm({ ...form, descriptionArabic: e.target.value })} />
                    <TextField size="small" fullWidth multiline minRows={2} label={<FormattedMessage id="description-english" />} value={form.descriptionEnglish ?? ''} onChange={(e) => setForm({ ...form, descriptionEnglish: e.target.value })} />
                    <TextField size="small" fullWidth multiline minRows={2} label={<FormattedMessage id="notes" />} value={form.notes ?? ''} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
                  </Stack>
                </SubCard>

              </Stack>
            </Grid>

            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Stack direction="row" spacing={2} justifyContent="flex-end">
                <Button variant="outlined" color="inherit" onClick={() => navigate('/inventory/items')} disabled={isSaving} sx={{ minWidth: 120 }}>
                  <FormattedMessage id="cancel" />
                </Button>
                <Button type="submit" variant="contained" color="primary" disabled={isSaving} sx={{ minWidth: 120 }}>
                  <FormattedMessage id="save" />
                </Button>
              </Stack>
            </Grid>
          </Grid>
        </form>
      </MainCard>
    </>
  );
}
