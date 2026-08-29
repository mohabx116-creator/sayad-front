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
import { createCustomerMaterialIntake, updateCustomerMaterialIntake } from '../api/customerMaterialsApi';
import { useCustomerMaterialIntake } from '../hooks/useCustomerMaterials';
import CustomerMaterialsTabs from '../components/customer-materials/CustomerMaterialsTabs';
import CustomerMaterialStatusChip from '../components/customer-materials/CustomerMaterialStatusChip';
import { INVENTORY_PERMISSIONS } from '../utils/inventory.constants';
import { getDocumentDisplayNumber } from 'shared/utils/documentDisplay';
import type { CustomerMaterialIntakeLineInput, CustomerMaterialIntakeRequest } from '../types/customerMaterials.types';

type IntakeLineState = CustomerMaterialIntakeLineInput;

function createLine(): IntakeLineState {
  return { itemId: '', unitOfMeasureId: '', quantity: 1, lotBatchIdentifier: '', notes: '' };
}

export default function CustomerMaterialIntakeFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const intl = useIntl();
  const dispatch = useDispatch();
  const isEdit = Boolean(id);
  const { intake, isLoading } = useCustomerMaterialIntake(id);
  const { items: customers } = useParties({ page: 1, pageSize: 100, isCustomer: true, sortBy: 'nameArabic' });
  const { warehouses } = useInventoryWarehouses();
  const { items: items } = useInventoryItems({ page: 1, pageSize: 100, sortBy: 'nameArabic' });
  const { items: units } = useInventoryUnits({ page: 1, pageSize: 100 });

  const [ownerPartyId, setOwnerPartyId] = useState('');
  const [warehouseId, setWarehouseId] = useState('');
  const [intakeDate, setIntakeDate] = useState(new Date().toISOString().slice(0, 10));
  const [referenceNumber, setReferenceNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [lines, setLines] = useState<IntakeLineState[]>([createLine()]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!intake) {
      return;
    }

    setOwnerPartyId(intake.ownerPartyId);
    setWarehouseId(intake.warehouseId);
    setIntakeDate(intake.intakeDate);
    setReferenceNumber(intake.referenceNumber ?? '');
    setNotes(intake.notes ?? '');
    setLines(
      intake.lines.length > 0
        ? intake.lines.map((line) => ({
            itemId: line.itemId,
            unitOfMeasureId: line.unitOfMeasureId,
            quantity: line.quantity,
            lotBatchIdentifier: line.lotBatchIdentifier,
            notes: line.notes ?? ''
          }))
        : [createLine()]
    );
  }, [intake]);

  const readOnly = isEdit && intake?.status !== 'Draft';
  const status = intake?.status ?? 'Draft';

  const itemLookup = useMemo(() => new Map(items.map((item) => [item.id, item])), [items]);
  const unitLookup = useMemo(() => new Map(units.map((unit) => [unit.id, unit])), [units]);

  const notify = (message: string, severity: 'success' | 'error' = 'success') => {
    dispatch(openSnackbar({ open: true, message, variant: 'alert', severity }));
  };

  const updateLine = (index: number, next: Partial<IntakeLineState>) => {
    setLines((current) => current.map((line, lineIndex) => (lineIndex === index ? { ...line, ...next } : line)));
  };

  const addLine = () => setLines((current) => [...current, createLine()]);
  const removeLine = (index: number) => setLines((current) => current.filter((_, lineIndex) => lineIndex !== index));

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!ownerPartyId || !warehouseId || lines.length === 0) {
      notify(intl.formatMessage({ id: 'customer-materials.validation-error', defaultMessage: 'Fill all required fields.' }), 'error');
      return;
    }

    try {
      setIsSaving(true);
      const request: CustomerMaterialIntakeRequest = {
        ownerPartyId,
        warehouseId,
        intakeDate,
        referenceNumber: referenceNumber.trim() || null,
        notes: notes.trim() || null,
        lines: lines.map((line) => ({
          itemId: line.itemId,
          unitOfMeasureId: line.unitOfMeasureId,
          quantity: Number(line.quantity),
          lotBatchIdentifier: line.lotBatchIdentifier.trim(),
          notes: line.notes?.trim() || null
        }))
      };

      const saved = isEdit && intake ? await updateCustomerMaterialIntake(intake.id, { ...request, rowVersion: intake.rowVersion }) : await createCustomerMaterialIntake(request);
      notify(intl.formatMessage({ id: 'customer-materials.saved', defaultMessage: 'Saved successfully.' }));
      navigate(`/inventory/customer-materials/intakes/${saved.id}`);
    } catch (error) {
      notify(error instanceof Error ? error.message : intl.formatMessage({ id: 'customer-materials.save-failed', defaultMessage: 'Unable to save document.' }), 'error');
    } finally {
      setIsSaving(false);
    }
  };

  if (isEdit && isLoading) {
    return <Loader />;
  }

  return (
    <Box>
      <Breadcrumbs
        custom
        heading={isEdit ? 'customer-material-intake' : 'create'}
        links={[{ title: 'inventory', to: '/inventory/items' }, { title: 'customer-materials', to: '/inventory/customer-materials/intakes' }, { title: isEdit ? 'edit' : 'create' }]}
      />
      <CustomerMaterialsTabs value="intakes" />

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <Box>
          <Typography variant="h3" fontWeight={800}>
            <FormattedMessage id={isEdit ? 'edit' : 'create'} defaultMessage={isEdit ? 'Edit' : 'Create'} /> <FormattedMessage id="customer-material-intake" defaultMessage="Customer Material Intake" />
          </Typography>
          {intake?.number && (
              <Typography variant="body2" color="text.secondary">
                {getDocumentDisplayNumber(intake.displayNumber, intake.number)} <CustomerMaterialStatusChip status={status} />
              </Typography>
          )}
        </Box>
        <Stack direction="row" spacing={1}>
          <Button component={Link} to="/inventory/customer-materials/intakes" variant="outlined" color="inherit" startIcon={<IconArrowLeft size={18} />}>
            <FormattedMessage id="back" />
          </Button>
        </Stack>
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
              <TextField select fullWidth label={<FormattedMessage id="warehouse" />} value={warehouseId} onChange={(event) => setWarehouseId(event.target.value)} disabled={readOnly || isSaving}>
                <MenuItem value=""><FormattedMessage id="select-warehouse" defaultMessage="Select warehouse" /></MenuItem>
                {warehouses.map((warehouse) => (
                  <MenuItem key={warehouse.id} value={warehouse.id}>
                    {warehouse.code} - {warehouse.nameArabic}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField type="date" fullWidth label={<FormattedMessage id="date" />} value={intakeDate} onChange={(event) => setIntakeDate(event.target.value)} InputLabelProps={{ shrink: true }} disabled={readOnly || isSaving} />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField fullWidth label={<FormattedMessage id="reference-number" defaultMessage="Reference" />} value={referenceNumber} onChange={(event) => setReferenceNumber(event.target.value)} disabled={readOnly || isSaving} />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth multiline minRows={2} label={<FormattedMessage id="notes" />} value={notes} onChange={(event) => setNotes(event.target.value)} disabled={readOnly || isSaving} />
            </Grid>
          </Grid>

          <Box sx={{ mt: 3 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
              <Typography variant="h5" fontWeight={700}>
                <FormattedMessage id="customer-material-intake-lines" defaultMessage="Lines" />
              </Typography>
              {!readOnly && (
                <Button variant="outlined" startIcon={<IconPlus size={16} />} onClick={addLine} type="button">
                  <FormattedMessage id="add" />
                </Button>
              )}
            </Stack>
            <TableContainer>
              <Table size="small">
                <TableHead sx={{ bgcolor: 'grey.50' }}>
                  <TableRow>
                    <TableCell><FormattedMessage id="item" /></TableCell>
                    <TableCell><FormattedMessage id="unit" /></TableCell>
                    <TableCell align="right"><FormattedMessage id="quantity" /></TableCell>
                    <TableCell><FormattedMessage id="lot-batch" defaultMessage="Lot / Batch" /></TableCell>
                    <TableCell><FormattedMessage id="notes" /></TableCell>
                    {!readOnly && <TableCell align="right"><FormattedMessage id="actions" /></TableCell>}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {lines.map((line, index) => {
                    const item = itemLookup.get(line.itemId);
                    const unit = unitLookup.get(line.unitOfMeasureId);
                    return (
                      <TableRow key={`${index}-${line.itemId}-${line.unitOfMeasureId}`} hover>
                        <TableCell sx={{ minWidth: 220 }}>
                          <TextField select fullWidth size="small" value={line.itemId} onChange={(event) => updateLine(index, { itemId: event.target.value })} disabled={readOnly || isSaving}>
                            <MenuItem value=""><FormattedMessage id="select-item" defaultMessage="Select item" /></MenuItem>
                            {items.map((option) => (
                              <MenuItem key={option.id} value={option.id}>
                                {option.code} - {option.nameArabic}
                              </MenuItem>
                            ))}
                          </TextField>
                          {item && (
                            <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
                              {item.baseUnitCode} - {item.baseUnitNameArabic}
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell sx={{ minWidth: 180 }}>
                          <TextField select fullWidth size="small" value={line.unitOfMeasureId} onChange={(event) => updateLine(index, { unitOfMeasureId: event.target.value })} disabled={readOnly || isSaving}>
                            <MenuItem value=""><FormattedMessage id="select-unit" defaultMessage="Select unit" /></MenuItem>
                            {units.map((option) => (
                              <MenuItem key={option.id} value={option.id}>
                                {option.code} - {option.nameArabic}
                              </MenuItem>
                            ))}
                          </TextField>
                          {unit && (
                            <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
                              {unit.symbolArabic} / {unit.symbolEnglish}
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell sx={{ minWidth: 140 }}>
                          <TextField type="number" fullWidth size="small" value={line.quantity} onChange={(event) => updateLine(index, { quantity: Number(event.target.value) })} disabled={readOnly || isSaving} inputProps={{ min: 0, step: '0.0001', dir: 'ltr' }} />
                        </TableCell>
                        <TableCell sx={{ minWidth: 180 }}>
                          <TextField fullWidth size="small" value={line.lotBatchIdentifier} onChange={(event) => updateLine(index, { lotBatchIdentifier: event.target.value })} disabled={readOnly || isSaving} />
                        </TableCell>
                        <TableCell sx={{ minWidth: 180 }}>
                          <TextField fullWidth size="small" value={line.notes ?? ''} onChange={(event) => updateLine(index, { notes: event.target.value })} disabled={readOnly || isSaving} />
                        </TableCell>
                        {!readOnly && (
                          <TableCell align="right">
                            <IconButton color="error" onClick={() => removeLine(index)} disabled={lines.length === 1 || isSaving}>
                              <IconTrash size={16} />
                            </IconButton>
                          </TableCell>
                        )}
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>

          {!readOnly && (
            <Stack direction="row" spacing={1} justifyContent="flex-end" sx={{ mt: 3 }}>
              <Button component={Link} to="/inventory/customer-materials/intakes" variant="outlined" color="inherit">
                <FormattedMessage id="cancel" />
              </Button>
              <PermissionGuard permission={isEdit ? INVENTORY_PERMISSIONS.customerMaterialIntakesUpdate : INVENTORY_PERMISSIONS.customerMaterialIntakesCreate}>
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
