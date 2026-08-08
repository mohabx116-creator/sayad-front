import { useEffect, useMemo } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { FormattedMessage, useIntl } from 'react-intl';
import { z } from 'zod';

import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Grid from '@mui/material/GridLegacy';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';

import { createPartyAdjustment } from '../api/partiesApi';
import type { CreatePartyAdjustmentRequest, PartyAdjustmentDto, PartyAdjustmentType } from '../types/parties.types';
import { getAvailablePartyAdjustmentTypeOptions } from '../utils/party-adjustments';
import { useDispatch } from 'store';
import { openSnackbar } from 'store/slices/snackbar';

type PartyAdjustmentDialogProps = {
  open: boolean;
  partyId: string;
  partyName: string;
  isCustomer: boolean;
  isSupplier: boolean;
  onClose: () => void;
  onSaved: (adjustment: PartyAdjustmentDto) => Promise<void> | void;
};

type PartyAdjustmentFormValues = {
  adjustmentType: string;
  entryDate: string;
  amount: string;
  descriptionArabic: string;
  descriptionEnglish: string;
  referenceNumber: string;
};

function getLocalDateInputValue() {
  const now = new Date();
  const offsetMinutes = now.getTimezoneOffset();
  return new Date(now.getTime() - offsetMinutes * 60_000).toISOString().slice(0, 10);
}

function buildSchema(intl: ReturnType<typeof useIntl>, allowedTypes: PartyAdjustmentType[]) {
  return z.object({
    adjustmentType: z
      .string()
      .min(1, intl.formatMessage({ id: 'adjustment-type' }))
      .refine((value) => allowedTypes.includes(value as PartyAdjustmentType), intl.formatMessage({ id: 'adjustment-type' })),
    entryDate: z.string().min(1, intl.formatMessage({ id: 'date' })),
    amount: z
      .string()
      .min(1, intl.formatMessage({ id: 'payment-amount-required' }))
      .refine((value) => Number(value) > 0, intl.formatMessage({ id: 'party-cash-transaction-amount-positive' })),
    descriptionArabic: z.string().min(1, intl.formatMessage({ id: 'description-arabic' })).max(1000, intl.formatMessage({ id: 'party-adjustment-description-too-long' })),
    descriptionEnglish: z.string().max(1000, intl.formatMessage({ id: 'party-adjustment-description-too-long' })),
    referenceNumber: z.string().max(100, intl.formatMessage({ id: 'party-adjustment-reference-too-long' }))
  });
}

export default function PartyAdjustmentDialog({ open, partyId, partyName, isCustomer, isSupplier, onClose, onSaved }: PartyAdjustmentDialogProps) {
  const intl = useIntl();
  const dispatch = useDispatch();
  const adjustmentTypes = useMemo(() => getAvailablePartyAdjustmentTypeOptions(isCustomer, isSupplier), [isCustomer, isSupplier]);
  const schema = useMemo(() => buildSchema(intl, adjustmentTypes.map((option) => option.value)), [adjustmentTypes, intl]);
  const form = useForm<PartyAdjustmentFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      adjustmentType: adjustmentTypes[0]?.value ?? '',
      entryDate: getLocalDateInputValue(),
      amount: '',
      descriptionArabic: '',
      descriptionEnglish: '',
      referenceNumber: ''
    }
  });

  useEffect(() => {
    if (!open) {
      return;
    }

    form.reset({
      adjustmentType: adjustmentTypes[0]?.value ?? '',
      entryDate: getLocalDateInputValue(),
      amount: '',
      descriptionArabic: '',
      descriptionEnglish: '',
      referenceNumber: ''
    });
  }, [adjustmentTypes, form, open]);

  const notify = (message: string, severity: 'success' | 'error' = 'success') => {
    dispatch(openSnackbar({ open: true, message, variant: 'alert', severity }));
  };

  const handleSubmit = async (values: PartyAdjustmentFormValues) => {
    if (!values.adjustmentType) {
      return;
    }

    const request: CreatePartyAdjustmentRequest = {
      partyId,
      adjustmentType: values.adjustmentType as PartyAdjustmentType,
      entryDate: values.entryDate,
      amount: Number(values.amount),
      descriptionArabic: values.descriptionArabic.trim(),
      descriptionEnglish: values.descriptionEnglish.trim() || null,
      referenceNumber: values.referenceNumber.trim() || null
    };

    try {
      const adjustment = await createPartyAdjustment(partyId, request);
      await onSaved(adjustment);
      notify(intl.formatMessage({ id: 'party-adjustment-create-success' }));
      onClose();
    } catch (error) {
      notify(error instanceof Error ? error.message : intl.formatMessage({ id: 'party-adjustment-create-failed' }), 'error');
    }
  };

  return (
    <Dialog open={open} onClose={form.formState.isSubmitting ? undefined : onClose} fullWidth maxWidth="md">
      <Stack component="form" onSubmit={form.handleSubmit(handleSubmit)}>
        <DialogTitle>
          <FormattedMessage id="party-adjustment-create" values={{ partyName }} />
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2.5} sx={{ pt: 1 }}>
            <DialogContentText>
              <FormattedMessage id="party-adjustment-create-help" values={{ partyName }} />
            </DialogContentText>

            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Controller
                  name="adjustmentType"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <TextField
                      {...field}
                      fullWidth
                      select
                      label={<FormattedMessage id="adjustment-type" />}
                      error={!!fieldState.error}
                      helperText={fieldState.error?.message}
                      disabled={adjustmentTypes.length === 0}
                    >
                      {adjustmentTypes.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          <FormattedMessage id={option.labelId} />
                        </MenuItem>
                      ))}
                    </TextField>
                  )}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Controller
                  name="entryDate"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <TextField
                      {...field}
                      fullWidth
                      type="date"
                      label={<FormattedMessage id="date" />}
                      error={!!fieldState.error}
                      helperText={fieldState.error?.message}
                      InputLabelProps={{ shrink: true }}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Controller
                  name="amount"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <TextField
                      {...field}
                      fullWidth
                      type="number"
                      inputProps={{ min: 0, step: '0.01' }}
                      label={<FormattedMessage id="amount" />}
                      error={!!fieldState.error}
                      helperText={fieldState.error?.message}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Controller
                  name="referenceNumber"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <TextField
                      {...field}
                      value={field.value ?? ''}
                      fullWidth
                      label={<FormattedMessage id="reference-number" />}
                      error={!!fieldState.error}
                      helperText={fieldState.error?.message}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12}>
                <Controller
                  name="descriptionArabic"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <TextField
                      {...field}
                      fullWidth
                      multiline
                      minRows={3}
                      label={<FormattedMessage id="description-arabic" />}
                      error={!!fieldState.error}
                      helperText={fieldState.error?.message}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12}>
                <Controller
                  name="descriptionEnglish"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <TextField
                      {...field}
                      value={field.value ?? ''}
                      fullWidth
                      multiline
                      minRows={3}
                      label={<FormattedMessage id="description-english" />}
                      error={!!fieldState.error}
                      helperText={fieldState.error?.message}
                    />
                  )}
                />
              </Grid>
            </Grid>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={onClose} color="inherit" type="button" disabled={form.formState.isSubmitting}>
            <FormattedMessage id="cancel" />
          </Button>
          <Button variant="contained" type="submit" disabled={form.formState.isSubmitting || adjustmentTypes.length === 0}>
            <FormattedMessage id="post-adjustment" />
          </Button>
        </DialogActions>
      </Stack>
    </Dialog>
  );
}
