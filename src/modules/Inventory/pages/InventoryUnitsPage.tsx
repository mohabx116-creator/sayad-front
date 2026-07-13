import { useEffect, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';

import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
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
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { IconEdit, IconToggleLeft, IconToggleRight } from '@tabler/icons-react';

import { useDispatch } from 'store';
import { openSnackbar } from 'store/slices/snackbar';
import MainCard from 'ui-component/cards/MainCard';
import Breadcrumbs from 'ui-component/extended/Breadcrumbs';
import Loader from 'ui-component/Loader';
import PermissionGuard from 'modules/Administration/components/PermissionGuard';
import { activateUnit, createUnit, deactivateUnit, updateUnit } from '../api/inventoryApi';
import { useInventoryUnits } from '../hooks/useInventory';
import type { CreateUnitRequest, UnitOfMeasureDto, UpdateUnitRequest } from '../types/inventory.types';
import { INVENTORY_PERMISSIONS } from '../utils/inventory.constants';

const emptyForm: CreateUnitRequest = {
  code: '',
  nameArabic: '',
  nameEnglish: '',
  symbolArabic: '',
  symbolEnglish: '',
  decimalPlaces: 0
};

export default function InventoryUnitsPage() {
  const intl = useIntl();
  const dispatch = useDispatch();
  const { items, isLoading, error, mutate } = useInventoryUnits();
  const [form, setForm] = useState<CreateUnitRequest>(emptyForm);
  const [editing, setEditing] = useState<UnitOfMeasureDto | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (editing) {
      setForm({
        code: editing.code,
        nameArabic: editing.nameArabic,
        nameEnglish: editing.nameEnglish ?? '',
        symbolArabic: editing.symbolArabic ?? '',
        symbolEnglish: editing.symbolEnglish ?? '',
        decimalPlaces: editing.decimalPlaces
      });
      return;
    }

    setForm(emptyForm);
  }, [editing]);

  const notify = (message: string, severity: 'success' | 'error' = 'success') => {
    dispatch(openSnackbar({ open: true, message, variant: 'alert', severity }));
  };

  const refresh = async () => {
    await mutate();
  };

  const submit = async () => {
    try {
      setIsSaving(true);
      if (editing) {
        const request: UpdateUnitRequest = {
          nameArabic: form.nameArabic,
          nameEnglish: form.nameEnglish || null,
          symbolArabic: form.symbolArabic || null,
          symbolEnglish: form.symbolEnglish || null,
          decimalPlaces: Number(form.decimalPlaces),
          rowVersion: editing.rowVersion
        };
        await updateUnit(editing.id, request);
      } else {
        await createUnit(form);
      }
      await refresh();
      setEditing(null);
      notify(intl.formatMessage({ id: 'inventory-action-success' }));
    } catch (saveError) {
      notify(saveError instanceof Error ? saveError.message : intl.formatMessage({ id: 'inventory-action-failed' }), 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const toggle = async (unit: UnitOfMeasureDto) => {
    if (unit.isSystem) {
      notify(intl.formatMessage({ id: 'system-unit-protected' }), 'error');
      return;
    }

    try {
      setIsSaving(true);
      await (unit.isActive ? deactivateUnit(unit.id) : activateUnit(unit.id));
      await refresh();
      notify(intl.formatMessage({ id: 'inventory-action-success' }));
    } catch (actionError) {
      notify(actionError instanceof Error ? actionError.message : intl.formatMessage({ id: 'inventory-action-failed' }), 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <Breadcrumbs custom heading="inventory-units" links={[{ title: 'inventory' }, { title: 'inventory-units' }]} />
      <MainCard title={<FormattedMessage id="inventory-units" />}>
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={12} md={2}>
            <TextField
              required
              fullWidth
              label={<FormattedMessage id="unit-code" />}
              value={form.code}
              onChange={(event) => setForm({ ...form, code: event.target.value })}
              disabled={Boolean(editing)}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField required fullWidth label={<FormattedMessage id="name-arabic" />} value={form.nameArabic} onChange={(event) => setForm({ ...form, nameArabic: event.target.value })} />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField fullWidth label={<FormattedMessage id="name-english" />} value={form.nameEnglish ?? ''} onChange={(event) => setForm({ ...form, nameEnglish: event.target.value })} />
          </Grid>
          <Grid item xs={12} md={2}>
            <TextField
              select
              fullWidth
              label={<FormattedMessage id="decimal-places" />}
              value={form.decimalPlaces}
              onChange={(event) => setForm({ ...form, decimalPlaces: Number(event.target.value) })}
            >
              {[0, 2, 3, 4].map((value) => <MenuItem key={value} value={value}>{value}</MenuItem>)}
            </TextField>
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField fullWidth label={<FormattedMessage id="symbol-arabic" />} value={form.symbolArabic ?? ''} onChange={(event) => setForm({ ...form, symbolArabic: event.target.value })} />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField fullWidth label={<FormattedMessage id="symbol-english" />} value={form.symbolEnglish ?? ''} onChange={(event) => setForm({ ...form, symbolEnglish: event.target.value })} />
          </Grid>
          <Grid item xs={12} md={4}>
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center', pt: 1 }}>
              <Chip label={<FormattedMessage id={editing ? 'edit-unit' : 'create-unit'} />} color="primary" />
              <Typography variant="body2" color="text.secondary">
                <FormattedMessage id="unit-decimal-help" />
              </Typography>
            </Stack>
          </Grid>
          <Grid item xs={12}>
            <Stack direction="row" spacing={1}>
              <Button variant="contained" onClick={submit} disabled={isSaving}><FormattedMessage id={editing ? 'save' : 'create'} /></Button>
              {editing && <Button onClick={() => setEditing(null)} disabled={isSaving}><FormattedMessage id="cancel" /></Button>}
            </Stack>
          </Grid>
        </Grid>

        {isLoading && <Loader />}
        {error && <Typography color="error"><FormattedMessage id="inventory-load-error" /></Typography>}
        {!isLoading && items.length === 0 && <Typography><FormattedMessage id="inventory-empty-items" /></Typography>}
        {items.length > 0 && (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell><FormattedMessage id="unit-code" /></TableCell>
                  <TableCell><FormattedMessage id="name" /></TableCell>
                  <TableCell><FormattedMessage id="symbol" /></TableCell>
                  <TableCell><FormattedMessage id="decimal-places" /></TableCell>
                  <TableCell><FormattedMessage id="system-unit" /></TableCell>
                  <TableCell><FormattedMessage id="status" /></TableCell>
                  <TableCell align="right"><FormattedMessage id="actions" /></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {items.map((unit) => (
                  <TableRow key={unit.id} hover>
                    <TableCell>{unit.code}</TableCell>
                    <TableCell>{unit.nameArabic}</TableCell>
                    <TableCell>{unit.symbolArabic || unit.symbolEnglish || '-'}</TableCell>
                    <TableCell>{unit.decimalPlaces}</TableCell>
                    <TableCell>{unit.isSystem ? <FormattedMessage id="yes" /> : <FormattedMessage id="no" />}</TableCell>
                    <TableCell>{unit.isActive ? <FormattedMessage id="active" /> : <FormattedMessage id="inactive" />}</TableCell>
                    <TableCell align="right">
                      <Stack direction="row" spacing={1} justifyContent="flex-end">
                        <PermissionGuard permission={INVENTORY_PERMISSIONS.unitsManage}>
                          <Tooltip title={<FormattedMessage id="edit" />}>
                            <span>
                              <IconButton onClick={() => setEditing(unit)} disabled={unit.isSystem}>
                                <IconEdit size={18} />
                              </IconButton>
                            </span>
                          </Tooltip>
                          <Tooltip title={<FormattedMessage id={unit.isActive ? 'deactivate' : 'activate'} />}>
                            <span>
                              <IconButton onClick={() => toggle(unit)} disabled={isSaving || unit.isSystem}>
                                {unit.isActive ? <IconToggleLeft size={18} /> : <IconToggleRight size={18} />}
                              </IconButton>
                            </span>
                          </Tooltip>
                        </PermissionGuard>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </MainCard>
    </>
  );
}
