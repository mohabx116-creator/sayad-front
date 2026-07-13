import { useEffect, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';

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
import { activatePartyItemRelation, createPartyItemRelation, deactivatePartyItemRelation, updatePartyItemRelation } from '../api/inventoryApi';
import { useInventoryItems, usePartyItemRelations } from '../hooks/useInventory';
import { useParties } from 'modules/Parties/hooks/useParties';
import type { CreatePartyItemRelationRequest, PartyItemRelationDto } from '../types/inventory.types';
import { INVENTORY_PERMISSIONS } from '../utils/inventory.constants';

const emptyForm: CreatePartyItemRelationRequest = {
  itemId: '',
  partyId: '',
  relationType: 'Customer',
  partyItemCode: '',
  notes: '',
  isPreferred: false
};

export default function InventoryPartyItemsPage() {
  const intl = useIntl();
  const dispatch = useDispatch();
  const { items, isLoading, error, mutate } = usePartyItemRelations({ page: 1, pageSize: 100 });
  const { items: parties } = useParties({ page: 1, pageSize: 100 });
  const { items: inventoryItems } = useInventoryItems({ page: 1, pageSize: 100 });
  const [form, setForm] = useState(emptyForm);
  const [selectedItemId, setSelectedItemId] = useState('');
  const [editing, setEditing] = useState<PartyItemRelationDto | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (editing) {
      setForm({
        itemId: editing.itemId,
        partyId: editing.partyId,
        relationType: editing.relationType,
        partyItemCode: editing.partyItemCode ?? '',
        notes: editing.notes ?? '',
        isPreferred: editing.isPreferred
      });
      setSelectedItemId(editing.itemId);
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
    if (!selectedItemId) {
      notify(intl.formatMessage({ id: 'inventory-select-item-first' }), 'error');
      return;
    }

    try {
      setIsSaving(true);
      if (editing) {
        await updatePartyItemRelation(editing.id, {
          partyItemCode: form.partyItemCode || null,
          notes: form.notes || null,
          isPreferred: form.isPreferred ?? false,
          rowVersion: editing.rowVersion
        });
      } else {
        await createPartyItemRelation({
          itemId: selectedItemId,
          partyId: form.partyId,
          relationType: form.relationType,
          partyItemCode: form.partyItemCode || null,
          notes: form.notes || null,
          isPreferred: form.isPreferred ?? false
        });
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

  const toggle = async (relation: PartyItemRelationDto) => {
    try {
      setIsSaving(true);
      await (relation.isActive ? deactivatePartyItemRelation(relation.id) : activatePartyItemRelation(relation.id));
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
      <Breadcrumbs custom heading="party-item-relations" links={[{ title: 'inventory' }, { title: 'party-item-relations' }]} />
      <MainCard title={<FormattedMessage id="party-item-relations" />}>
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={12} md={4}>
            <TextField select fullWidth label={<FormattedMessage id="item" />} value={selectedItemId} onChange={(event) => setSelectedItemId(event.target.value)}>
              <MenuItem value=""><FormattedMessage id="none" /></MenuItem>
              {inventoryItems.map((item) => <MenuItem key={item.id} value={item.id}>{item.code} - {item.nameArabic}</MenuItem>)}
            </TextField>
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField select fullWidth label={<FormattedMessage id="party" />} value={form.partyId} onChange={(event) => setForm({ ...form, partyId: event.target.value })}>
              <MenuItem value=""><FormattedMessage id="none" /></MenuItem>
              {parties.map((party) => <MenuItem key={party.id} value={party.id}>{party.code} - {party.nameArabic}</MenuItem>)}
            </TextField>
          </Grid>
          <Grid item xs={12} md={2}>
            <TextField select fullWidth label={<FormattedMessage id="relation-type" />} value={form.relationType} onChange={(event) => setForm({ ...form, relationType: event.target.value as 'Customer' | 'Supplier' })}>
              <MenuItem value="Customer"><FormattedMessage id="party-customer" /></MenuItem>
              <MenuItem value="Supplier"><FormattedMessage id="party-supplier" /></MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} md={2}>
            <TextField fullWidth label={<FormattedMessage id="party-item-code" />} value={form.partyItemCode ?? ''} onChange={(event) => setForm({ ...form, partyItemCode: event.target.value })} />
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField fullWidth label={<FormattedMessage id="notes" />} value={form.notes ?? ''} onChange={(event) => setForm({ ...form, notes: event.target.value })} />
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField select fullWidth label={<FormattedMessage id="preferred" />} value={form.isPreferred ? 'true' : 'false'} onChange={(event) => setForm({ ...form, isPreferred: event.target.value === 'true' })}>
              <MenuItem value="true"><FormattedMessage id="yes" /></MenuItem>
              <MenuItem value="false"><FormattedMessage id="no" /></MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} md={3} sx={{ display: 'flex', alignItems: 'center' }}>
            <Button variant="contained" disabled={isSaving || !selectedItemId || !form.partyId} onClick={submit}>
              <FormattedMessage id={editing ? 'save' : 'create'} />
            </Button>
          </Grid>
        </Grid>

        {isLoading && <Loader />}
        {error && <Typography color="error"><FormattedMessage id="inventory-load-error" /></Typography>}
        {items.length > 0 && (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell><FormattedMessage id="item" /></TableCell>
                  <TableCell><FormattedMessage id="party" /></TableCell>
                  <TableCell><FormattedMessage id="relation-type" /></TableCell>
                  <TableCell><FormattedMessage id="party-item-code" /></TableCell>
                  <TableCell><FormattedMessage id="preferred" /></TableCell>
                  <TableCell><FormattedMessage id="status" /></TableCell>
                  <TableCell align="right"><FormattedMessage id="actions" /></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {items.map((relation) => (
                  <TableRow key={relation.id} hover>
                    <TableCell>{relation.itemCode} - {relation.itemNameArabic}</TableCell>
                    <TableCell>{relation.partyCode} - {relation.partyNameArabic}</TableCell>
                    <TableCell>{relation.relationType}</TableCell>
                    <TableCell>{relation.partyItemCode ?? '-'}</TableCell>
                    <TableCell>{relation.isPreferred ? <FormattedMessage id="yes" /> : <FormattedMessage id="no" />}</TableCell>
                    <TableCell><Chip label={relation.isActive ? <FormattedMessage id="active" /> : <FormattedMessage id="inactive" />} /></TableCell>
                    <TableCell align="right">
                      <PermissionGuard permission={INVENTORY_PERMISSIONS.partyItemsManage}>
                        <Stack direction="row" spacing={1} justifyContent="flex-end">
                          <Button size="small" onClick={() => setEditing(relation)}><FormattedMessage id="edit" /></Button>
                          <Button size="small" onClick={() => toggle(relation)}>{relation.isActive ? <FormattedMessage id="deactivate" /> : <FormattedMessage id="activate" />}</Button>
                        </Stack>
                      </PermissionGuard>
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
