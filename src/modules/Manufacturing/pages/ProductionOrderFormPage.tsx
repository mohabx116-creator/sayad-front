import React, { useEffect, useMemo, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { Link, useNavigate, useParams } from 'react-router-dom';

import Alert from '@mui/material/Alert';
import Autocomplete from '@mui/material/Autocomplete';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/GridLegacy';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { IconArrowLeft, IconDeviceFloppy } from '@tabler/icons-react';

import { useDispatch } from 'store';
import { openSnackbar } from 'store/slices/snackbar';
import MainCard from 'ui-component/cards/MainCard';
import Breadcrumbs from 'ui-component/extended/Breadcrumbs';
import PageTitle from 'ui-component/PageTitle';
import Loader from 'ui-component/Loader';

import { createProductionOrder, updateProductionOrder } from '../api/manufacturingApi';
import { useProductionOrder } from '../hooks/useManufacturing';
import { PRODUCTION_OWNERSHIP_TYPES } from '../utils/manufacturing.constants';
import type { CreateProductionOrderRequest, ProductionOwnershipType, UpdateProductionOrderRequest } from '../types/manufacturing.types';

// Reuse inventory hooks for lookups
import { useInventoryItems } from 'modules/Inventory/hooks/useInventory';
import { resolveLocalizedText } from 'shared/utils/localizedText';

// ---- Warehouse hook (using SWR fetcher pattern consistent with other modules)
import useSWR from 'swr';
import { fetcher } from 'utils/axios';

function useWarehouses() {
  const { data, isLoading } = useSWR<any>('/api/inventory/warehouses?pageSize=200', fetcher);
  const items = useMemo(() => (data?.data ?? []) as Array<{ id: string; nameArabic: string; nameEnglish?: string | null; code: string }>, [data]);
  return { warehouses: items, isLoading };
}

function useBomList() {
  const { data, isLoading } = useSWR<any>('/api/manufacturing/boms?isActive=true&pageSize=200', fetcher);
  const items = useMemo(
    () => (data?.data ?? []) as Array<{ id: string; code: string; nameArabic: string; nameEnglish?: string | null; finishedGoodItemId: string; finishedGoodItemCode: string; finishedGoodItemNameArabic: string }>,
    [data]
  );
  return { boms: items, isLoading };
}

function useParties() {
  const { data, isLoading } = useSWR<any>('/api/parties?pageSize=200', fetcher);
  const items = useMemo(
    () => (data?.data ?? []) as Array<{ id: string; nameArabic: string; nameEnglish?: string | null; code: string }>,
    [data]
  );
  return { parties: items, isLoading };
}

type FormState = {
  number: string;
  billOfMaterialsId: string;
  finishedGoodItemId: string;
  sourceWarehouseId: string;
  targetWarehouseId: string;
  plannedQuantity: string;
  plannedStartDate: string;
  plannedEndDate: string;
  productionType: ProductionOwnershipType;
  ownerPartyId: string;
  notes: string;
};

function emptyForm(): FormState {
  return {
    number: '',
    billOfMaterialsId: '',
    finishedGoodItemId: '',
    sourceWarehouseId: '',
    targetWarehouseId: '',
    plannedQuantity: '1',
    plannedStartDate: new Date().toISOString().split('T')[0],
    plannedEndDate: new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString().split('T')[0],
    productionType: 'Company',
    ownerPartyId: '',
    notes: ''
  };
}

export default function ProductionOrderFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const intl = useIntl();
  const dispatch = useDispatch();

  const { order, isLoading: orderLoading } = useProductionOrder(id);
  const { boms, isLoading: bomsLoading } = useBomList();
  const { warehouses, isLoading: warehousesLoading } = useWarehouses();
  const { parties, isLoading: partiesLoading } = useParties();

  const [form, setForm] = useState<FormState>(emptyForm());
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [saving, setSaving] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);

  // Populate form when editing
  useEffect(() => {
    if (isEdit && order) {
      setForm({
        number: order.number ?? '',
        billOfMaterialsId: order.billOfMaterialsId,
        finishedGoodItemId: order.finishedGoodItemId,
        sourceWarehouseId: order.sourceWarehouseId,
        targetWarehouseId: order.targetWarehouseId,
        plannedQuantity: String(order.plannedQuantity),
        plannedStartDate: order.plannedStartDate.split('T')[0],
        plannedEndDate: order.plannedEndDate.split('T')[0],
        productionType: order.productionType,
        ownerPartyId: order.ownerPartyId ?? '',
        notes: order.notes ?? ''
      });
    }
  }, [isEdit, order]);

  // Auto-fill finishedGoodItemId when BOM changes
  const selectedBom = useMemo(() => boms.find((b) => b.id === form.billOfMaterialsId), [boms, form.billOfMaterialsId]);
  useEffect(() => {
    if (selectedBom && !isEdit) {
      setForm((prev) => ({ ...prev, finishedGoodItemId: selectedBom.finishedGoodItemId }));
    }
  }, [selectedBom, isEdit]);

  const set = (field: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const validate = (): boolean => {
    const errs: Partial<Record<keyof FormState, string>> = {};
    if (!form.billOfMaterialsId) errs.billOfMaterialsId = intl.formatMessage({ id: 'required', defaultMessage: 'Required' });
    if (!form.sourceWarehouseId) errs.sourceWarehouseId = intl.formatMessage({ id: 'required', defaultMessage: 'Required' });
    if (!form.targetWarehouseId) errs.targetWarehouseId = intl.formatMessage({ id: 'required', defaultMessage: 'Required' });
    const qty = parseFloat(form.plannedQuantity);
    if (!form.plannedQuantity || isNaN(qty) || qty <= 0)
      errs.plannedQuantity = intl.formatMessage({ id: 'qty-must-be-positive', defaultMessage: 'Must be a positive number' });
    if (!form.plannedStartDate) errs.plannedStartDate = intl.formatMessage({ id: 'required', defaultMessage: 'Required' });
    if (!form.plannedEndDate) errs.plannedEndDate = intl.formatMessage({ id: 'required', defaultMessage: 'Required' });
    if (form.plannedStartDate && form.plannedEndDate && form.plannedEndDate < form.plannedStartDate)
      errs.plannedEndDate = intl.formatMessage({ id: 'end-after-start', defaultMessage: 'End date must be after start date' });
    if (form.productionType === 'Customer' && !form.ownerPartyId)
      errs.ownerPartyId = intl.formatMessage({ id: 'required', defaultMessage: 'Required' });
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    setGlobalError(null);
    try {
      if (isEdit && id && order) {
        const payload: UpdateProductionOrderRequest = {
          sourceWarehouseId: form.sourceWarehouseId,
          targetWarehouseId: form.targetWarehouseId,
          plannedQuantity: parseFloat(form.plannedQuantity),
          plannedStartDate: form.plannedStartDate,
          plannedEndDate: form.plannedEndDate,
          notes: form.notes || null,
          rowVersion: order.rowVersion
        };
        await updateProductionOrder(id, payload);
        dispatch(
          openSnackbar({
            open: true,
            message: intl.formatMessage({ id: 'order-updated', defaultMessage: 'Production order updated successfully.' }),
            variant: 'alert',
            alert: { color: 'success' }
          })
        );
        navigate(`/manufacturing/orders/${id}`);
      } else {
        const payload: CreateProductionOrderRequest = {
          number: form.number || null,
          billOfMaterialsId: form.billOfMaterialsId,
          finishedGoodItemId: form.finishedGoodItemId || selectedBom?.finishedGoodItemId || '',
          sourceWarehouseId: form.sourceWarehouseId,
          targetWarehouseId: form.targetWarehouseId,
          plannedQuantity: parseFloat(form.plannedQuantity),
          plannedStartDate: form.plannedStartDate,
          plannedEndDate: form.plannedEndDate,
          productionType: form.productionType,
          ownerPartyId: form.ownerPartyId || null,
          notes: form.notes || null
        };
        const created = await createProductionOrder(payload);
        dispatch(
          openSnackbar({
            open: true,
            message: intl.formatMessage({ id: 'order-created', defaultMessage: 'Production order created successfully.' }),
            variant: 'alert',
            alert: { color: 'success' }
          })
        );
        navigate(`/manufacturing/orders/${created.id}`);
      }
    } catch (err: any) {
      setGlobalError(err?.message || intl.formatMessage({ id: 'operation-failed', defaultMessage: 'Operation failed.' }));
    } finally {
      setSaving(false);
    }
  };

  const isFormLoading = (isEdit && orderLoading) || bomsLoading || warehousesLoading;

  if (isFormLoading) return <Loader />;

  const selectedSourceWarehouse = warehouses.find((w) => w.id === form.sourceWarehouseId) ?? null;
  const selectedTargetWarehouse = warehouses.find((w) => w.id === form.targetWarehouseId) ?? null;
  const selectedOwnerParty = parties.find((p) => p.id === form.ownerPartyId) ?? null;

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Breadcrumbs />
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mt: 1 }}>
          <PageTitle>
            {isEdit ? (
              <FormattedMessage id="edit-production-order" defaultMessage="Edit Production Order" />
            ) : (
              <FormattedMessage id="create-production-order" defaultMessage="Create Production Order" />
            )}
          </PageTitle>
          <Button
            component={Link}
            to={isEdit ? `/manufacturing/orders/${id}` : '/manufacturing/orders'}
            variant="outlined"
            size="small"
            startIcon={<IconArrowLeft size={16} />}
          >
            <FormattedMessage id="back" defaultMessage="Back" />
          </Button>
        </Stack>
      </Box>

      <Box component="form" onSubmit={handleSubmit} noValidate>
        <MainCard title={<FormattedMessage id="order-details" defaultMessage="Order Details" />}>
          {globalError && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {globalError}
            </Alert>
          )}

          <Grid container spacing={3}>
            {/* Order Number (optional, auto-generated) */}
            {!isEdit && (
              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  fullWidth
                  label={intl.formatMessage({ id: 'order-number-optional', defaultMessage: 'Order Number (Optional)' })}
                  value={form.number}
                  onChange={set('number')}
                  size="small"
                  placeholder={intl.formatMessage({ id: 'auto-generated', defaultMessage: 'Auto-generated if blank' })}
                />
              </Grid>
            )}

            {/* BOM selection — only when creating */}
            {!isEdit && (
              <Grid item xs={12} sm={6} md={4}>
                <Autocomplete
                  options={boms}
                  loading={bomsLoading}
                  getOptionLabel={(opt) =>
                    `[${opt.code}] ${resolveLocalizedText(intl.locale, opt.nameArabic, opt.nameEnglish)}`
                  }
                  value={selectedBom ?? null}
                  onChange={(_, val) => {
                    setForm((prev) => ({
                      ...prev,
                      billOfMaterialsId: val?.id ?? '',
                      finishedGoodItemId: val?.finishedGoodItemId ?? ''
                    }));
                    setErrors((prev) => ({ ...prev, billOfMaterialsId: undefined }));
                  }}
                  isOptionEqualToValue={(opt, val) => opt.id === val.id}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      required
                      size="small"
                      label={intl.formatMessage({ id: 'bill-of-materials', defaultMessage: 'Bill of Materials' })}
                      error={Boolean(errors.billOfMaterialsId)}
                      helperText={errors.billOfMaterialsId}
                    />
                  )}
                />
              </Grid>
            )}

            {/* Show finished good (read-only derived from BOM) */}
            {!isEdit && selectedBom && (
              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  fullWidth
                  size="small"
                  label={intl.formatMessage({ id: 'finished-good', defaultMessage: 'Finished Good' })}
                  value={`[${selectedBom.finishedGoodItemCode}] ${selectedBom.finishedGoodItemNameArabic}`}
                  InputProps={{ readOnly: true }}
                />
              </Grid>
            )}

            {isEdit && (
              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  fullWidth
                  size="small"
                  label={intl.formatMessage({ id: 'order-number', defaultMessage: 'Order Number' })}
                  value={form.number}
                  InputProps={{ readOnly: true }}
                />
              </Grid>
            )}

            {isEdit && (
              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  fullWidth
                  size="small"
                  label={intl.formatMessage({ id: 'bill-of-materials', defaultMessage: 'Bill of Materials' })}
                  value={order?.billOfMaterialsCode ?? ''}
                  InputProps={{ readOnly: true }}
                />
              </Grid>
            )}

            {/* Planned Quantity */}
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                required
                fullWidth
                size="small"
                type="number"
                label={intl.formatMessage({ id: 'planned-qty', defaultMessage: 'Planned Quantity' })}
                value={form.plannedQuantity}
                onChange={set('plannedQuantity')}
                error={Boolean(errors.plannedQuantity)}
                helperText={errors.plannedQuantity}
                inputProps={{ min: 0.001, step: 'any' }}
              />
            </Grid>

            {/* Source Warehouse */}
            <Grid item xs={12} sm={6} md={4}>
              <Autocomplete
                options={warehouses}
                loading={warehousesLoading}
                getOptionLabel={(opt) =>
                  `[${opt.code}] ${resolveLocalizedText(intl.locale, opt.nameArabic, opt.nameEnglish)}`
                }
                value={selectedSourceWarehouse}
                onChange={(_, val) => {
                  setForm((prev) => ({ ...prev, sourceWarehouseId: val?.id ?? '' }));
                  setErrors((prev) => ({ ...prev, sourceWarehouseId: undefined }));
                }}
                isOptionEqualToValue={(opt, val) => opt.id === val.id}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    required
                    size="small"
                    label={intl.formatMessage({ id: 'source-warehouse', defaultMessage: 'Source Warehouse (Materials)' })}
                    error={Boolean(errors.sourceWarehouseId)}
                    helperText={errors.sourceWarehouseId}
                  />
                )}
              />
            </Grid>

            {/* Target Warehouse */}
            <Grid item xs={12} sm={6} md={4}>
              <Autocomplete
                options={warehouses}
                loading={warehousesLoading}
                getOptionLabel={(opt) =>
                  `[${opt.code}] ${resolveLocalizedText(intl.locale, opt.nameArabic, opt.nameEnglish)}`
                }
                value={selectedTargetWarehouse}
                onChange={(_, val) => {
                  setForm((prev) => ({ ...prev, targetWarehouseId: val?.id ?? '' }));
                  setErrors((prev) => ({ ...prev, targetWarehouseId: undefined }));
                }}
                isOptionEqualToValue={(opt, val) => opt.id === val.id}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    required
                    size="small"
                    label={intl.formatMessage({ id: 'target-warehouse', defaultMessage: 'Target Warehouse (Finished Goods)' })}
                    error={Boolean(errors.targetWarehouseId)}
                    helperText={errors.targetWarehouseId}
                  />
                )}
              />
            </Grid>

            {/* Start Date */}
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                required
                fullWidth
                size="small"
                type="date"
                label={intl.formatMessage({ id: 'planned-start', defaultMessage: 'Planned Start Date' })}
                value={form.plannedStartDate}
                onChange={set('plannedStartDate')}
                error={Boolean(errors.plannedStartDate)}
                helperText={errors.plannedStartDate}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            {/* End Date */}
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                required
                fullWidth
                size="small"
                type="date"
                label={intl.formatMessage({ id: 'planned-end', defaultMessage: 'Planned End Date' })}
                value={form.plannedEndDate}
                onChange={set('plannedEndDate')}
                error={Boolean(errors.plannedEndDate)}
                helperText={errors.plannedEndDate}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            {/* Production Type — only when creating */}
            {!isEdit && (
              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  select
                  fullWidth
                  required
                  size="small"
                  label={intl.formatMessage({ id: 'production-type', defaultMessage: 'Production Type' })}
                  value={form.productionType}
                  onChange={(e) => {
                    setForm((prev) => ({
                      ...prev,
                      productionType: e.target.value as ProductionOwnershipType,
                      ownerPartyId: ''
                    }));
                  }}
                >
                  {PRODUCTION_OWNERSHIP_TYPES.map((t) => (
                    <MenuItem key={t} value={t}>
                      {intl.formatMessage({ id: `production-ownership.${t}`, defaultMessage: t })}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
            )}

            {/* Owner Party — required when Customer or Mixed */}
            {!isEdit && (form.productionType === 'Customer' || form.productionType === 'Mixed') && (
              <Grid item xs={12} sm={6} md={4}>
                <Autocomplete
                  options={parties}
                  loading={partiesLoading}
                  getOptionLabel={(opt) =>
                    `[${opt.code}] ${resolveLocalizedText(intl.locale, opt.nameArabic, opt.nameEnglish)}`
                  }
                  value={selectedOwnerParty}
                  onChange={(_, val) => {
                    setForm((prev) => ({ ...prev, ownerPartyId: val?.id ?? '' }));
                    setErrors((prev) => ({ ...prev, ownerPartyId: undefined }));
                  }}
                  isOptionEqualToValue={(opt, val) => opt.id === val.id}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      required={form.productionType === 'Customer'}
                      size="small"
                      label={intl.formatMessage({ id: 'owner-party', defaultMessage: 'Owner Party (Customer)' })}
                      error={Boolean(errors.ownerPartyId)}
                      helperText={errors.ownerPartyId}
                    />
                  )}
                />
              </Grid>
            )}

            {/* Notes */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                size="small"
                label={intl.formatMessage({ id: 'notes', defaultMessage: 'Notes' })}
                value={form.notes}
                onChange={set('notes')}
              />
            </Grid>
          </Grid>

          <Divider sx={{ my: 3 }} />

          <Stack direction="row" justifyContent="flex-end" spacing={2}>
            <Button
              component={Link}
              to={isEdit ? `/manufacturing/orders/${id}` : '/manufacturing/orders'}
              variant="outlined"
              startIcon={<IconArrowLeft size={16} />}
            >
              <FormattedMessage id="cancel" defaultMessage="Cancel" />
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="secondary"
              disabled={saving}
              startIcon={<IconDeviceFloppy size={18} />}
            >
              {saving ? (
                <FormattedMessage id="saving" defaultMessage="Saving..." />
              ) : isEdit ? (
                <FormattedMessage id="save-changes" defaultMessage="Save Changes" />
              ) : (
                <FormattedMessage id="create-production-order" defaultMessage="Create Production Order" />
              )}
            </Button>
          </Stack>
        </MainCard>
      </Box>
    </Box>
  );
}
