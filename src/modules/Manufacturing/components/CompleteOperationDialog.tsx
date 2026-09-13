import React, { useEffect, useState } from 'react';
import { FormattedMessage } from 'react-intl';

import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import { completeProductionOperation } from '../api/manufacturingApi';
import type { ProductionOperationDto } from '../types/manufacturing.types';

type CompleteOperationDialogProps = {
  open: boolean;
  operation: ProductionOperationDto | null;
  onClose: () => void;
  onSaved: () => Promise<void> | void;
  onError: (message: string) => void;
};

export default function CompleteOperationDialog({ open, operation, onClose, onSaved, onError }: CompleteOperationDialogProps) {
  const [actualMinutes, setActualMinutes] = useState('0');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (operation) setActualMinutes(String(operation.actualMinutes || operation.plannedMinutes || 0));
  }, [operation]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!operation) return;
    setSaving(true);
    try {
      await completeProductionOperation(operation.productionOrderId, operation.id, {
        actualMinutes: Number(actualMinutes),
        rowVersion: operation.rowVersion
      });
      await onSaved();
      onClose();
    } catch (error: any) {
      onError(error?.message || 'Operation failed.');
    } finally {
      setSaving(false);
    }
  };

  const isInvalid = !Number.isFinite(Number(actualMinutes)) || Number(actualMinutes) < 0;

  return (
    <Dialog open={open} onClose={saving ? undefined : onClose} maxWidth="xs" fullWidth>
      <DialogTitle>
        <FormattedMessage id="complete-operation" defaultMessage="Complete Operation" />
      </DialogTitle>
      <DialogContent>
        <Stack component="form" id="complete-operation-form" spacing={2} sx={{ pt: 1 }} onSubmit={handleSubmit}>
          <Typography variant="subtitle2">{operation?.operationName}</Typography>
          <TextField
            required
            fullWidth
            type="number"
            label={<FormattedMessage id="actual-minutes" defaultMessage="Actual Minutes" />}
            value={actualMinutes}
            onChange={(event) => setActualMinutes(event.target.value)}
            inputProps={{ min: 0, step: 1 }}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={saving}>
          <FormattedMessage id="cancel" defaultMessage="Cancel" />
        </Button>
        <Button type="submit" form="complete-operation-form" variant="contained" color="secondary" disabled={saving || isInvalid}>
          <FormattedMessage id="complete" defaultMessage="Complete" />
        </Button>
      </DialogActions>
    </Dialog>
  );
}
