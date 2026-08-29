import { FormEvent, useEffect, useMemo, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { Link, useNavigate, useParams } from 'react-router-dom';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
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
import { IconArrowLeft, IconDeviceFloppy, IconPlus, IconTrash } from '@tabler/icons-react';

import { useDispatch } from 'store';
import { openSnackbar } from 'store/slices/snackbar';
import MainCard from 'ui-component/cards/MainCard';
import Breadcrumbs from 'ui-component/extended/Breadcrumbs';
import Loader from 'ui-component/Loader';
import PermissionGuard from 'modules/Administration/components/PermissionGuard';
import { useParties } from 'modules/Parties/hooks/useParties';
import { useInventoryItems, useInventoryUnits, useInventoryWarehouses } from '../hooks/useInventory';
import { createCustomerMaterialConversion, updateCustomerMaterialConversion } from '../api/customerMaterialsApi';
import { useCustomerMaterialConversion, useCustomerMaterialIntake, useCustomerMaterialIntakes } from '../hooks/useCustomerMaterials';
import CustomerMaterialsTabs from '../components/customer-materials/CustomerMaterialsTabs';
import CustomerMaterialStatusChip from '../components/customer-materials/CustomerMaterialStatusChip';
import { INVENTORY_PERMISSIONS } from '../utils/inventory.constants';
import { getDocumentDisplayNumber } from 'shared/utils/documentDisplay';
import type {
  CustomerMaterialConversionInputLineInput,
  CustomerMaterialConversionOutputLineInput,
  CustomerMaterialConversionRequest
} from '../types/customerMaterials.types';

type InputRowState = CustomerMaterialConversionInputLineInput & { selectedIntakeId: string };
type OutputRowState = CustomerMaterialConversionOutputLineInput;

function createInputRow(): InputRowState {
  return {
    selectedIntakeId: '',
    sourceCustomerMaterialIntakeLineId: '',
    itemId: '',
    warehouseId: '',
    unitOfMeasureId: '',
    quantity: 1,
    lotBatchIdentifier: '',
    notes: ''
  };
}

function createOutputRow(): OutputRowState {
  return {
    sourceInputLineNumber: 1,
    itemId: '',
    warehouseId: '',
    unitOfMeasureId: '',
    quantity: 1,
    lotBatchIdentifier: '',
    notes: ''
  };
}

function ConversionInputRow({
  row,
  readOnly,
  isSaving,
  customerId,
  items,
  units,
  warehouses,
  onChange,
  onRemove,
  canRemove
}: {
  row: InputRowState;
  readOnly: boolean;
  isSaving: boolean;
  customerId: string;
  items: { id: string; code: string; nameArabic: string; baseUnitCode: string; baseUnitNameArabic: string }[];
  units: { id: string; code: string; nameArabic: string; symbolArabic: string; symbolEnglish: string }[];
  warehouses: { id: string; code: string; nameArabic: string }[];
  onChange: (next: Partial<InputRowState>) => void;
  onRemove: () => void;
  canRemove: boolean;
}) {
  const { intake } = useCustomerMaterialIntake(row.selectedIntakeId || undefined);
  const sourceLine = useMemo(() => intake?.lines.find((line) => line.id === row.sourceCustomerMaterialIntakeLineId) ?? null, [intake?.lines, row.sourceCustomerMaterialIntakeLineId]);
  const postedIntakes = useCustomerMaterialIntakes({ page: 1, pageSize: 100, customerId: customerId || undefined, status: 'Posted' }).items;

  return (
    <TableRow hover>
      <TableCell sx={{ minWidth: 220 }}>
        <Stack spacing={1}>
          <TextField
            select
            fullWidth
            size="small"
            label={<FormattedMessage id="customer-materials.source-intake-document" defaultMessage="Source intake" />}
            value={row.selectedIntakeId}
            onChange={(event) => onChange({ selectedIntakeId: event.target.value, sourceCustomerMaterialIntakeLineId: '', itemId: '', warehouseId: '', unitOfMeasureId: '', lotBatchIdentifier: '' })}
            disabled={readOnly || isSaving}
          >
            <MenuItem value=""><FormattedMessage id="select" defaultMessage="Select" /></MenuItem>
            {postedIntakes.map((intakeItem) => (
              <MenuItem key={intakeItem.id} value={intakeItem.id}>
                {getDocumentDisplayNumber(intakeItem.displayNumber, intakeItem.number)} - {intakeItem.warehouseCode}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            select
            fullWidth
            size="small"
            label={<FormattedMessage id="customer-materials.source-intake-line" defaultMessage="Source line" />}
            value={row.sourceCustomerMaterialIntakeLineId}
            onChange={(event) => {
              const nextLineId = event.target.value;
              const nextLine = intake?.lines.find((line) => line.id === nextLineId) ?? null;
              onChange({
                sourceCustomerMaterialIntakeLineId: nextLineId,
                itemId: nextLine?.itemId ?? '',
                warehouseId: intake?.warehouseId ?? '',
                unitOfMeasureId: nextLine?.unitOfMeasureId ?? '',
                lotBatchIdentifier: nextLine?.lotBatchIdentifier ?? ''
              });
            }}
            disabled={readOnly || isSaving || !intake}
          >
            <MenuItem value=""><FormattedMessage id="select" defaultMessage="Select" /></MenuItem>
            {(intake?.lines ?? []).map((line) => (
              <MenuItem key={line.id} value={line.id}>
                {line.itemCode} - {line.itemNameArabic} / {line.lotBatchIdentifier}
              </MenuItem>
            ))}
          </TextField>
          {sourceLine && (
            <Typography variant="caption" color="text.secondary">
              {sourceLine.itemCode} - {sourceLine.itemNameArabic}
            </Typography>
          )}
        </Stack>
      </TableCell>
      <TableCell sx={{ minWidth: 180 }}>
        <TextField select fullWidth size="small" label={<FormattedMessage id="item" />} value={row.itemId} onChange={(event) => onChange({ itemId: event.target.value })} disabled={readOnly || isSaving}>
          <MenuItem value=""><FormattedMessage id="select-item" defaultMessage="Select item" /></MenuItem>
          {items.map((item) => (
            <MenuItem key={item.id} value={item.id}>
              {item.code} - {item.nameArabic}
            </MenuItem>
          ))}
        </TextField>
      </TableCell>
      <TableCell sx={{ minWidth: 160 }}>
        <TextField select fullWidth size="small" label={<FormattedMessage id="warehouse" />} value={row.warehouseId} onChange={(event) => onChange({ warehouseId: event.target.value })} disabled={readOnly || isSaving}>
          <MenuItem value=""><FormattedMessage id="select-warehouse" defaultMessage="Select warehouse" /></MenuItem>
          {warehouses.map((warehouse) => (
            <MenuItem key={warehouse.id} value={warehouse.id}>
              {warehouse.code} - {warehouse.nameArabic}
            </MenuItem>
          ))}
        </TextField>
      </TableCell>
      <TableCell sx={{ minWidth: 160 }}>
        <TextField select fullWidth size="small" label={<FormattedMessage id="unit" />} value={row.unitOfMeasureId} onChange={(event) => onChange({ unitOfMeasureId: event.target.value })} disabled={readOnly || isSaving}>
          <MenuItem value=""><FormattedMessage id="select-unit" defaultMessage="Select unit" /></MenuItem>
          {units.map((unit) => (
            <MenuItem key={unit.id} value={unit.id}>
              {unit.code} - {unit.nameArabic}
            </MenuItem>
          ))}
        </TextField>
      </TableCell>
      <TableCell sx={{ minWidth: 140 }}>
        <TextField type="number" fullWidth size="small" value={row.quantity} onChange={(event) => onChange({ quantity: Number(event.target.value) })} disabled={readOnly || isSaving} inputProps={{ min: 0, step: '0.0001', dir: 'ltr' }} />
      </TableCell>
      <TableCell sx={{ minWidth: 180 }}>
        <TextField fullWidth size="small" value={row.lotBatchIdentifier} onChange={(event) => onChange({ lotBatchIdentifier: event.target.value })} disabled={readOnly || isSaving} />
      </TableCell>
      <TableCell sx={{ minWidth: 180 }}>
        <TextField fullWidth size="small" value={row.notes ?? ''} onChange={(event) => onChange({ notes: event.target.value })} disabled={readOnly || isSaving} />
      </TableCell>
      {!readOnly && (
        <TableCell align="right">
          <IconButton color="error" onClick={onRemove} disabled={!canRemove || isSaving}>
            <IconTrash size={16} />
          </IconButton>
        </TableCell>
      )}
    </TableRow>
  );
}

export default function CustomerMaterialConversionFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const intl = useIntl();
  const dispatch = useDispatch();
  const isEdit = Boolean(id);
  const { conversion, isLoading } = useCustomerMaterialConversion(id);
  const { items: customers } = useParties({ page: 1, pageSize: 100, isCustomer: true, sortBy: 'nameArabic' });
  const { items: items } = useInventoryItems({ page: 1, pageSize: 100, sortBy: 'nameArabic' });
  const { items: units } = useInventoryUnits({ page: 1, pageSize: 100 });
  const { warehouses } = useInventoryWarehouses();

  const [ownerPartyId, setOwnerPartyId] = useState('');
  const [conversionDate, setConversionDate] = useState(new Date().toISOString().slice(0, 10));
  const [referenceNumber, setReferenceNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [inputRows, setInputRows] = useState<InputRowState[]>([createInputRow()]);
  const [outputRows, setOutputRows] = useState<OutputRowState[]>([createOutputRow()]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!conversion) return;

    setOwnerPartyId(conversion.ownerPartyId);
    setConversionDate(conversion.conversionDate);
    setReferenceNumber(conversion.referenceNumber ?? '');
    setNotes(conversion.notes ?? '');
    setInputRows(
      conversion.inputLines.length > 0
        ? conversion.inputLines.map((line) => ({
            selectedIntakeId: '',
            sourceCustomerMaterialIntakeLineId: line.sourceCustomerMaterialIntakeLineId,
            itemId: line.itemId,
            warehouseId: line.warehouseId,
            unitOfMeasureId: line.unitOfMeasureId,
            quantity: line.quantity,
            lotBatchIdentifier: line.lotBatchIdentifier,
            notes: line.notes ?? ''
          }))
        : [createInputRow()]
    );
    setOutputRows(
      conversion.outputLines.length > 0
        ? conversion.outputLines.map((line) => ({
            sourceInputLineNumber: line.sourceInputLineNumber,
            itemId: line.itemId,
            warehouseId: line.warehouseId,
            unitOfMeasureId: line.unitOfMeasureId,
            quantity: line.quantity,
            lotBatchIdentifier: line.lotBatchIdentifier,
            notes: line.notes ?? ''
          }))
        : [createOutputRow()]
    );
  }, [conversion]);

  const readOnly = isEdit && conversion?.status !== 'Draft';
  const status = conversion?.status ?? 'Draft';

  const notify = (message: string, severity: 'success' | 'error' = 'success') => {
    dispatch(openSnackbar({ open: true, message, variant: 'alert', severity }));
  };

  const updateInputRow = (index: number, next: Partial<InputRowState>) => {
    setInputRows((current) => current.map((row, rowIndex) => (rowIndex === index ? { ...row, ...next } : row)));
  };
  const updateOutputRow = (index: number, next: Partial<OutputRowState>) => {
    setOutputRows((current) => current.map((row, rowIndex) => (rowIndex === index ? { ...row, ...next } : row)));
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!ownerPartyId || inputRows.length === 0 || outputRows.length === 0) {
      notify('Fill all required fields.', 'error');
      return;
    }

    try {
      setIsSaving(true);
      const request: CustomerMaterialConversionRequest = {
        ownerPartyId,
        conversionDate,
        referenceNumber: referenceNumber.trim() || null,
        notes: notes.trim() || null,
        inputLines: inputRows.map((row) => ({
          sourceCustomerMaterialIntakeLineId: row.sourceCustomerMaterialIntakeLineId,
          itemId: row.itemId,
          warehouseId: row.warehouseId,
          unitOfMeasureId: row.unitOfMeasureId,
          quantity: Number(row.quantity),
          lotBatchIdentifier: row.lotBatchIdentifier.trim(),
          notes: row.notes?.trim() || null
        })),
        outputLines: outputRows.map((row) => ({
          sourceInputLineNumber: Number(row.sourceInputLineNumber),
          itemId: row.itemId,
          warehouseId: row.warehouseId,
          unitOfMeasureId: row.unitOfMeasureId,
          quantity: Number(row.quantity),
          lotBatchIdentifier: row.lotBatchIdentifier.trim(),
          notes: row.notes?.trim() || null
        }))
      };

      const saved = isEdit && conversion ? await updateCustomerMaterialConversion(conversion.id, { ...request, rowVersion: conversion.rowVersion }) : await createCustomerMaterialConversion(request);
      notify(intl.formatMessage({ id: 'customer-materials.saved', defaultMessage: 'Saved successfully.' }));
      navigate(`/inventory/customer-materials/conversions/${saved.id}`);
    } catch (error) {
      notify(error instanceof Error ? error.message : 'Unable to save document.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  if (isEdit && isLoading) {
    return <Loader />;
  }

  return (
    <Box>
      <Breadcrumbs custom heading={isEdit ? 'customer-material-conversion' : 'create'} links={[{ title: 'inventory', to: '/inventory/items' }, { title: 'customer-materials', to: '/inventory/customer-materials/intakes' }, { title: isEdit ? 'edit' : 'create' }]} />
      <CustomerMaterialsTabs value="conversions" />

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <Box>
          <Typography variant="h3" fontWeight={800}>
            <FormattedMessage id={isEdit ? 'edit' : 'create'} defaultMessage={isEdit ? 'Edit' : 'Create'} /> <FormattedMessage id="customer-material-conversion" defaultMessage="Customer Material Conversion" />
          </Typography>
          {conversion?.number && (
              <Typography variant="body2" color="text.secondary">
                {getDocumentDisplayNumber(conversion.displayNumber, conversion.number)} <CustomerMaterialStatusChip status={status} />
              </Typography>
          )}
        </Box>
        <Button component={Link} to="/inventory/customer-materials/conversions" variant="outlined" color="inherit" startIcon={<IconArrowLeft size={18} />}>
          <FormattedMessage id="back" />
        </Button>
      </Box>

      <MainCard>
        <Box component="form" onSubmit={submit}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={3}>
              <TextField select fullWidth label={<FormattedMessage id="customer" />} value={ownerPartyId} onChange={(event) => setOwnerPartyId(event.target.value)} disabled={readOnly || isSaving}>
                <MenuItem value=""><FormattedMessage id="select-customer" defaultMessage="Select customer" /></MenuItem>
                {customers.map((customer) => (
                  <MenuItem key={customer.id} value={customer.id}>
                    {customer.code} - {customer.nameArabic}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField type="date" fullWidth label={<FormattedMessage id="date" />} value={conversionDate} onChange={(event) => setConversionDate(event.target.value)} InputLabelProps={{ shrink: true }} disabled={readOnly || isSaving} />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField fullWidth label={<FormattedMessage id="reference-number" defaultMessage="Reference" />} value={referenceNumber} onChange={(event) => setReferenceNumber(event.target.value)} disabled={readOnly || isSaving} />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField fullWidth multiline minRows={2} label={<FormattedMessage id="notes" />} value={notes} onChange={(event) => setNotes(event.target.value)} disabled={readOnly || isSaving} />
            </Grid>
          </Grid>

          <Box sx={{ mt: 3 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
              <Typography variant="h5" fontWeight={700}>
                    <FormattedMessage id="customer-material-conversion-inputs" defaultMessage="Inputs" />
                  </Typography>
              {!readOnly && (
                <Button variant="outlined" startIcon={<IconPlus size={16} />} onClick={() => setInputRows((current) => [...current, createInputRow()])} type="button">
                  <FormattedMessage id="add" />
                </Button>
              )}
            </Stack>
            <TableContainer>
              <Table size="small">
                <TableHead sx={{ bgcolor: 'grey.50' }}>
                  <TableRow>
                    <TableCell><FormattedMessage id="customer-materials.source-intake" defaultMessage="Source intake" /></TableCell>
                    <TableCell><FormattedMessage id="item" /></TableCell>
                    <TableCell><FormattedMessage id="warehouse" /></TableCell>
                    <TableCell><FormattedMessage id="unit" /></TableCell>
                    <TableCell align="right"><FormattedMessage id="quantity" /></TableCell>
                    <TableCell><FormattedMessage id="lot-batch" defaultMessage="Lot / Batch" /></TableCell>
                    <TableCell><FormattedMessage id="notes" /></TableCell>
                    {!readOnly && <TableCell align="right"><FormattedMessage id="actions" /></TableCell>}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {inputRows.map((row, index) => (
                    <ConversionInputRow
                      key={`${index}-${row.sourceCustomerMaterialIntakeLineId}`}
                      row={row}
                      readOnly={readOnly}
                      isSaving={isSaving}
                      customerId={ownerPartyId}
                      items={items}
                      units={units}
                      warehouses={warehouses}
                      onChange={(next) => updateInputRow(index, next)}
                      onRemove={() => setInputRows((current) => current.filter((_, rowIndex) => rowIndex !== index))}
                      canRemove={inputRows.length > 1}
                    />
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>

          <Box sx={{ mt: 3 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
              <Typography variant="h5" fontWeight={700}>
                <FormattedMessage id="customer-material-conversion-outputs" defaultMessage="Outputs" />
              </Typography>
              {!readOnly && (
                <Button variant="outlined" startIcon={<IconPlus size={16} />} onClick={() => setOutputRows((current) => [...current, createOutputRow()])} type="button">
                  <FormattedMessage id="add" />
                </Button>
              )}
            </Stack>
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
                    <TableCell><FormattedMessage id="notes" /></TableCell>
                    {!readOnly && <TableCell align="right"><FormattedMessage id="actions" /></TableCell>}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {outputRows.map((row, index) => (
                    <TableRow key={`${index}-${row.sourceInputLineNumber}`} hover>
                      <TableCell sx={{ minWidth: 180 }}>
                        <TextField select fullWidth size="small" value={row.sourceInputLineNumber} onChange={(event) => updateOutputRow(index, { sourceInputLineNumber: Number(event.target.value) })} disabled={readOnly || isSaving}>
                          {inputRows.map((inputRow, inputIndex) => (
                            <MenuItem key={inputIndex + 1} value={inputIndex + 1}>
                              {inputIndex + 1}
                            </MenuItem>
                          ))}
                        </TextField>
                      </TableCell>
                      <TableCell sx={{ minWidth: 180 }}>
                        <TextField select fullWidth size="small" value={row.itemId} onChange={(event) => updateOutputRow(index, { itemId: event.target.value })} disabled={readOnly || isSaving}>
                          <MenuItem value=""><FormattedMessage id="select-item" defaultMessage="Select item" /></MenuItem>
                          {items.map((item) => (
                            <MenuItem key={item.id} value={item.id}>
                              {item.code} - {item.nameArabic}
                            </MenuItem>
                          ))}
                        </TextField>
                      </TableCell>
                      <TableCell sx={{ minWidth: 160 }}>
                        <TextField select fullWidth size="small" value={row.warehouseId} onChange={(event) => updateOutputRow(index, { warehouseId: event.target.value })} disabled={readOnly || isSaving}>
                          <MenuItem value=""><FormattedMessage id="select-warehouse" defaultMessage="Select warehouse" /></MenuItem>
                          {warehouses.map((warehouse) => (
                            <MenuItem key={warehouse.id} value={warehouse.id}>
                              {warehouse.code} - {warehouse.nameArabic}
                            </MenuItem>
                          ))}
                        </TextField>
                      </TableCell>
                      <TableCell sx={{ minWidth: 160 }}>
                        <TextField select fullWidth size="small" value={row.unitOfMeasureId} onChange={(event) => updateOutputRow(index, { unitOfMeasureId: event.target.value })} disabled={readOnly || isSaving}>
                          <MenuItem value=""><FormattedMessage id="select-unit" defaultMessage="Select unit" /></MenuItem>
                          {units.map((unit) => (
                            <MenuItem key={unit.id} value={unit.id}>
                              {unit.code} - {unit.nameArabic}
                            </MenuItem>
                          ))}
                        </TextField>
                      </TableCell>
                      <TableCell sx={{ minWidth: 140 }}>
                        <TextField type="number" fullWidth size="small" value={row.quantity} onChange={(event) => updateOutputRow(index, { quantity: Number(event.target.value) })} disabled={readOnly || isSaving} inputProps={{ min: 0, step: '0.0001', dir: 'ltr' }} />
                      </TableCell>
                      <TableCell sx={{ minWidth: 180 }}>
                        <TextField fullWidth size="small" value={row.lotBatchIdentifier} onChange={(event) => updateOutputRow(index, { lotBatchIdentifier: event.target.value })} disabled={readOnly || isSaving} />
                      </TableCell>
                      <TableCell sx={{ minWidth: 180 }}>
                        <TextField fullWidth size="small" value={row.notes ?? ''} onChange={(event) => updateOutputRow(index, { notes: event.target.value })} disabled={readOnly || isSaving} />
                      </TableCell>
                      {!readOnly && (
                        <TableCell align="right">
                          <IconButton color="error" onClick={() => setOutputRows((current) => current.filter((_, rowIndex) => rowIndex !== index))} disabled={outputRows.length === 1 || isSaving}>
                            <IconTrash size={16} />
                          </IconButton>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>

          {!readOnly && (
            <Stack direction="row" spacing={1} justifyContent="flex-end" sx={{ mt: 3 }}>
              <Button component={Link} to="/inventory/customer-materials/conversions" variant="outlined" color="inherit">
                <FormattedMessage id="cancel" />
              </Button>
              <PermissionGuard permission={isEdit ? INVENTORY_PERMISSIONS.customerMaterialConversionsUpdate : INVENTORY_PERMISSIONS.customerMaterialConversionsCreate}>
                <Button type="submit" variant="contained" startIcon={<IconDeviceFloppy size={18} />} disabled={isSaving}>
                  <FormattedMessage id="save" />
                </Button>
              </PermissionGuard>
            </Stack>
          )}
          {readOnly && (
            <Box sx={{ mt: 3 }}>
              <Typography color="text.secondary">
                <FormattedMessage id="customer-materials.readonly" defaultMessage="This document is posted or cancelled and cannot be edited." />
              </Typography>
            </Box>
          )}
        </Box>
      </MainCard>
    </Box>
  );
}
