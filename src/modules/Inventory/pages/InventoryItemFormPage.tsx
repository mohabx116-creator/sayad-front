import { FormEvent, useEffect, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { useNavigate, useParams } from 'react-router-dom';

import Button from '@mui/material/Button';
import Grid from '@mui/material/GridLegacy';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import MainCard from 'ui-component/cards/MainCard';
import Breadcrumbs from 'ui-component/extended/Breadcrumbs';
import Loader from 'ui-component/Loader';
import { createItem, updateItem } from '../api/inventoryApi';
import { useInventoryCategories, useInventoryItem, useInventoryUnits } from '../hooks/useInventory';
import type { CreateItemRequest } from '../types/inventory.types';
import { ITEM_TYPES } from '../utils/inventory.constants';

const today = new Date().toISOString().slice(0, 10);

export default function InventoryItemFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const { item, isLoading } = useInventoryItem(id);
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
    notes: '',
    units: [],
    openingStock: null
  });
  const [openingQuantity, setOpeningQuantity] = useState(0);

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
        notes: item.notes ?? '',
        units: [{ unitOfMeasureId: item.baseUnitId, factorToBase: 1, isDefaultPurchaseUnit: true, isDefaultSalesUnit: true }],
        openingStock: null
      });
    }
  }, [item]);

  useEffect(() => {
    if (!form.baseUnitId && units[0]) {
      setForm((current) => ({ ...current, baseUnitId: units[0].id }));
    }
  }, [form.baseUnitId, units]);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const request = {
      ...form,
      categoryId: form.categoryId || null,
      units: [{ unitOfMeasureId: form.baseUnitId, factorToBase: 1, isDefaultPurchaseUnit: true, isDefaultSalesUnit: true }],
      openingStock: !isEdit && openingQuantity > 0 ? { movementDate: today, unitOfMeasureId: form.baseUnitId, quantity: openingQuantity, notes: 'Opening stock' } : null
    };
    if (isEdit && item) {
      await updateItem(item.id, { ...request, rowVersion: item.rowVersion });
      navigate(`/inventory/items/${item.id}`);
      return;
    }
    const created = await createItem(request);
    navigate(`/inventory/items/${created.id}`);
  };

  if (isEdit && isLoading) return <Loader />;

  return (
    <>
      <Breadcrumbs custom heading={isEdit ? 'edit-item' : 'create-item'} links={[{ title: 'inventory' }, { title: 'inventory-items' }]} />
      <MainCard title={<FormattedMessage id={isEdit ? 'edit-item' : 'create-item'} />}>
        <form onSubmit={submit}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}><TextField required fullWidth label={<FormattedMessage id="name-arabic" />} value={form.nameArabic} onChange={(e) => setForm({ ...form, nameArabic: e.target.value })} /></Grid>
            <Grid item xs={12} md={6}><TextField fullWidth label={<FormattedMessage id="name-english" />} value={form.nameEnglish ?? ''} onChange={(e) => setForm({ ...form, nameEnglish: e.target.value })} /></Grid>
            <Grid item xs={12} md={4}>
              <TextField select fullWidth label={<FormattedMessage id="item-type" />} value={form.itemType} onChange={(e) => setForm({ ...form, itemType: e.target.value })}>
                {ITEM_TYPES.map((type) => <MenuItem key={type} value={type}>{type}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField select required fullWidth label={<FormattedMessage id="base-unit" />} value={form.baseUnitId} onChange={(e) => setForm({ ...form, baseUnitId: e.target.value })}>
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
            <Grid item xs={12}><TextField fullWidth multiline minRows={3} label={<FormattedMessage id="notes" />} value={form.notes ?? ''} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></Grid>
            <Grid item xs={12}>
              <Stack direction="row" spacing={1}>
                <Button type="submit" variant="contained"><FormattedMessage id="save" /></Button>
                <Button onClick={() => navigate('/inventory/items')}><FormattedMessage id="cancel" /></Button>
              </Stack>
            </Grid>
          </Grid>
        </form>
      </MainCard>
    </>
  );
}
