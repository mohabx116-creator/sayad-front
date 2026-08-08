import { useMemo } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { FormattedMessage, useIntl } from 'react-intl';
import { z } from 'zod';

import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Grid from '@mui/material/GridLegacy';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import { reversePartyAdjustment } from '../api/partiesApi';
import type { PartyAdjustmentDto } from '../types/parties.types';
import { getPartyAdjustmentStatusLabelId, getPartyAdjustmentTypeLabelId } from '../utils/party-adjustments';
import { useDispatch } from 'store';
import { openSnackbar } from 'store/slices/snackbar';

type PartyAdjustmentReverseDialogProps = {
  open: boolean;
  adjustment: PartyAdjustmentDto | null;
  onClose: () => void;
  onSaved: (adjustment: PartyAdjustmentDto) => Promise<void> | void;
};

type PartyAdjustmentReverseFormValues = {
  reversalReason: string;
};

function buildSchema(intl: ReturnType<typeof useIntl>) {
  return z.object({
    reversalReason: z.string().min(1, intl.formatMessage({ id: 'reason' })).max(500, intl.formatMessage({ id: 'party-adjustment-reason-too-long' }))
  });
}

function formatAmount(locale: string, value: number) {
  return new Intl.NumberFormat(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value);
}

export default function PartyAdjustmentReverseDialog({ open, adjustment, onClose, onSaved }: PartyAdjustmentReverseDialogProps) {
  const intl = useIntl();
  const dispatch = useDispatch();
  const schema = useMemo(() => buildSchema(intl), [intl]);
  const form = useForm<PartyAdjustmentReverseFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      reversalReason: ''
    }
  });

  const notify = (message: string, severity: 'success' | 'error' = 'success') => {
    dispatch(openSnackbar({ open: true, message, variant: 'alert', severity }));
  };

  const handleSubmit = async (values: PartyAdjustmentReverseFormValues) => {
    if (!adjustment) {
      return;
    }

    try {
      const updated = await reversePartyAdjustment(adjustment.partyId, adjustment.adjustmentId, {
        reversalReason: values.reversalReason.trim(),
        rowVersion: adjustment.rowVersion
      });
      await onSaved(updated);
      notify(intl.formatMessage({ id: 'party-adjustment-reverse-success' }));
      onClose();
    } catch (error) {
      notify(error instanceof Error ? error.message : intl.formatMessage({ id: 'party-adjustment-reverse-failed' }), 'error');
    }
  };

  return (
    <Dialog open={open} onClose={form.formState.isSubmitting ? undefined : onClose} fullWidth maxWidth="sm">
      <Stack component="form" onSubmit={form.handleSubmit(handleSubmit)}>
        <DialogTitle>
          <FormattedMessage id="party-adjustment-reverse" />
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2.5} sx={{ pt: 1 }}>
            <DialogContentText>
              <FormattedMessage id="party-adjustment-reverse-help" />
            </DialogContentText>

            {adjustment && (
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary" display="block">
                    <FormattedMessage id="number" defaultMessage="Number" />
                  </Typography>
                  <Typography variant="body2" fontWeight={600} dir="ltr">
                    {adjustment.number}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary" display="block">
                    <FormattedMessage id="adjustment-type" />
                  </Typography>
                  <Chip size="small" variant="outlined" label={<FormattedMessage id={getPartyAdjustmentTypeLabelId(adjustment.adjustmentType)} />} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary" display="block">
                    <FormattedMessage id="date" />
                  </Typography>
                  <Typography variant="body2" fontWeight={600} dir="ltr">
                    {adjustment.entryDate}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary" display="block">
                    <FormattedMessage id="amount" />
                  </Typography>
                  <Typography variant="body2" fontWeight={600} dir="ltr">
                    {formatAmount(intl.locale, adjustment.amount)}
                  </Typography>
                </Grid>
              </Grid>
            )}

            <Controller
              name="reversalReason"
              control={form.control}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  fullWidth
                  multiline
                  minRows={3}
                  label={<FormattedMessage id="reason" />}
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                />
              )}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={onClose} color="inherit" type="button" disabled={form.formState.isSubmitting}>
            <FormattedMessage id="cancel" />
          </Button>
          <Button variant="contained" color="error" type="submit" disabled={form.formState.isSubmitting || !adjustment}>
            <FormattedMessage id="reverse" />
          </Button>
        </DialogActions>
      </Stack>
    </Dialog>
  );
}
