import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { FormattedMessage, useIntl } from 'react-intl';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Grid from '@mui/material/GridLegacy';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import { correctOpeningBalanceSchema, openingBalanceSchema } from '../schemas/party.schema';
import type { CorrectOpeningBalanceRequest, OpeningBalanceDto, OpeningBalanceRequest } from '../types/parties.types';

type OpeningBalanceDialogProps = {
  openingBalance: OpeningBalanceDto;
  isSaving: boolean;
  onClose: () => void;
  onCreate: (values: OpeningBalanceRequest) => Promise<void>;
  onCorrect: (values: CorrectOpeningBalanceRequest) => Promise<void>;
  side?: 'Customer' | 'Supplier';
};

type OpeningBalanceFormValues = CorrectOpeningBalanceRequest & { notes?: string | null };

export default function OpeningBalanceDialog({ openingBalance, isSaving, onClose, onCreate, onCorrect, side }: OpeningBalanceDialogProps) {
  const intl = useIntl();
  const hasOpeningBalance=Boolean(openingBalance.entryId);
  const schema=hasOpeningBalance ? correctOpeningBalanceSchema : openingBalanceSchema;
  const form=useForm<OpeningBalanceFormValues>({
    resolver: zodResolver(schema) as any,
    values: {
      entryDate: openingBalance.entryDate ?? new Date().toISOString().slice(0, 10),
      amount: openingBalance.amount,
      balanceNature: openingBalance.balanceNature === 'Debit' || openingBalance.balanceNature === 'Credit' ? openingBalance.balanceNature : '',
      reason: '',
      notes: '',
      expectedOpeningBalanceEntryId: openingBalance.entryId ?? ''
    }
  });

  const submit=async (values: OpeningBalanceFormValues) => {
    if(hasOpeningBalance) {
      await onCorrect({
        entryDate: values.entryDate,
        amount: Number(values.amount),
        balanceNature: values.balanceNature,
        reason: values.reason,
        expectedOpeningBalanceEntryId: values.expectedOpeningBalanceEntryId
      });
      return;
    }

    await onCreate({
      entryDate: values.entryDate,
      amount: Number(values.amount),
      balanceNature: values.balanceNature,
      notes: values.notes ?? null
      ,side
    });
  };

  return (
    <Dialog open onClose={isSaving ? undefined : onClose} fullWidth maxWidth="sm">
      <Box component="form" onSubmit={form.handleSubmit(submit as any)} noValidate>
        <DialogTitle><FormattedMessage id={hasOpeningBalance ? 'correct-opening-balance' : 'opening-balance'} /></DialogTitle>
        <DialogContent>
          {hasOpeningBalance && (
            <Typography color="text.secondary" sx={{ mb: 2 }}>
              <FormattedMessage id="opening-balance-correction-help" />
            </Typography>
          )}
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12} md={4}>
              <Controller name="amount" control={form.control} render={({ field, fieldState }) => <TextField {...field} type="number" inputProps={{ min: 0.01, step: 0.01 }} onChange={(event) => field.onChange(Number(event.target.value))} fullWidth label={<FormattedMessage id="opening-balance-amount" />} error={!!fieldState.error} helperText={fieldState.error?.message} />} />
            </Grid>
            <Grid item xs={12} md={4}>
              <Controller name="balanceNature" control={form.control} render={({ field, fieldState }) => (
                <>
                  <TextField {...field} fullWidth select label={<FormattedMessage id="balance-direction" />} error={!!fieldState.error} helperText={fieldState.error?.message}>
                    <MenuItem value=""><FormattedMessage id="none" /></MenuItem>
                    <MenuItem value="Debit"><FormattedMessage id="parties.statement.debit-against-party" /></MenuItem>
                    <MenuItem value="Credit"><FormattedMessage id="parties.statement.credit-for-party" /></MenuItem>
                  </TextField>
                  <Alert severity="info" sx={{ mt: 1 }}>
                    <FormattedMessage id="opening-balance-direction-help" />
                  </Alert>
                </>
              )} />
            </Grid>
            <Grid item xs={12} md={4}>
              <Controller name="entryDate" control={form.control} render={({ field }) => <TextField {...field} type="date" fullWidth label={<FormattedMessage id="opening-balance-date" />} InputLabelProps={{ shrink: true }} />} />
            </Grid>
            <Grid item xs={12}>
              {hasOpeningBalance ? (
                <Controller name="reason" control={form.control} render={({ field, fieldState }) => <TextField {...field} fullWidth multiline minRows={2} label={<FormattedMessage id="correction-reason" />} error={!!fieldState.error} helperText={fieldState.error?.message} />} />
              ) : (
                <Controller name="notes" control={form.control} render={({ field, fieldState }) => <TextField {...field} value={field.value ?? ''} fullWidth multiline minRows={2} label={<FormattedMessage id="notes" />} error={!!fieldState.error} helperText={fieldState.error?.message} />} />
              )}
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button type="button" onClick={onClose} disabled={isSaving}><FormattedMessage id="cancel" /></Button>
          <Button type="submit" variant="contained" disabled={isSaving}>{isSaving ? intl.formatMessage({ id: 'loading' }) : intl.formatMessage({ id: 'save' })}</Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}
