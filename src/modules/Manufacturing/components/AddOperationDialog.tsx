import React, { useEffect, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Grid from '@mui/material/GridLegacy';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';

import { addProductionOperation } from '../api/manufacturingApi';
import { useWorkCenters } from '../hooks/useManufacturing';

type AddOperationDialogProps = {
  open: boolean;
  orderId: string;
  onClose: () => void;
  onSaved: () => Promise<void> | void;
  onError: (message: string) => void;
};

const initialForm = {
  workCenterId: '',
  sequence: '10',
  operationName: '',
  plannedMinutes: '0'
};

export default function AddOperationDialog({ open, orderId, onClose, onSaved, onError }: AddOperationDialogProps) {
  const intl = useIntl();
  const { items: workCenters } = useWorkCenters({ isActive: true, page: 1, pageSize: 100 });
  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) setForm(initialForm);
  }, [open]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    try {
      await addProductionOperation(orderId, {
        workCenterId: form.workCenterId,
        sequence: Number(form.sequence),
        operationName: form.operationName.trim(),
        plannedMinutes: Number(form.plannedMinutes)
      });
      await onSaved();
      onClose();
    } catch (error: any) {
      onError(error?.message || intl.formatMessage({ id: 'operation-failed', defaultMessage: 'Operation failed.' }));
    } finally {
      setSaving(false);
    }
  };

  const isInvalid =
    !form.workCenterId ||
    !form.operationName.trim() ||
    !Number.isFinite(Number(form.sequence)) ||
    Number(form.sequence) <= 0 ||
    !Number.isFinite(Number(form.plannedMinutes)) ||
    Number(form.plannedMinutes) < 0;

  return (
    <Dialog open={open} onClose={saving ? undefined : onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <FormattedMessage id="add-operation" defaultMessage="Add Operation" />
      </DialogTitle>
      <DialogContent>
        <Box component="form" id="add-operation-form" onSubmit={handleSubmit}>
        <Grid container spacing={2} sx={{ pt: 1 }}>
          <Grid item xs={12} md={6}>
            <TextField
              required
              fullWidth
              type="number"
              label={<FormattedMessage id="sequence" defaultMessage="Sequence" />}
              value={form.sequence}
              onChange={(event) => setForm((current) => ({ ...current, sequence: event.target.value }))}
              inputProps={{ min: 1, step: 1 }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              required
              select
              fullWidth
              label={<FormattedMessage id="work-center" defaultMessage="Work Center" />}
              value={form.workCenterId}
              onChange={(event) => setForm((current) => ({ ...current, workCenterId: event.target.value }))}
              helperText={intl.formatMessage({ id: 'select-work-center', defaultMessage: 'Select work center' })}
            >
              {workCenters.map((workCenter) => (
                <MenuItem key={workCenter.id} value={workCenter.id}>
                  {workCenter.code} - {workCenter.name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12}>
            <TextField
              required
              fullWidth
              label={<FormattedMessage id="operation-name" defaultMessage="Operation Name" />}
              value={form.operationName}
              onChange={(event) => setForm((current) => ({ ...current, operationName: event.target.value }))}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              required
              fullWidth
              type="number"
              label={<FormattedMessage id="planned-minutes" defaultMessage="Planned Minutes" />}
              value={form.plannedMinutes}
              onChange={(event) => setForm((current) => ({ ...current, plannedMinutes: event.target.value }))}
              inputProps={{ min: 0, step: 1 }}
            />
          </Grid>
        </Grid>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={saving}>
          <FormattedMessage id="cancel" defaultMessage="Cancel" />
        </Button>
        <Button
          type="submit"
          form="add-operation-form"
          variant="contained"
          color="secondary"
          disabled={saving || isInvalid}
        >
          <FormattedMessage id="save" defaultMessage="Save" />
        </Button>
      </DialogActions>
    </Dialog>
  );
}
