import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { FormattedMessage } from 'react-intl';

import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import Grid from '@mui/material/GridLegacy';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';

import { createPartySchema, updatePartySchema } from '../schemas/party.schema';
import type { CreatePartyRequest, UpdatePartyRequest } from '../types/parties.types';

export type PartyFormValues = CreatePartyRequest & { rowVersion?: string };

type PartyFormProps = {
  mode: 'create' | 'edit';
  initialValues: PartyFormValues;
  isSaving?: boolean;
  onCancel: () => void;
  onSubmit: (values: PartyFormValues) => Promise<void> | void;
};

export const emptyCreateValues: PartyFormValues = {
  nameArabic: '',
  nameEnglish: '',
  isCustomer: true,
  isSupplier: false,
  primaryPhone: '',
  secondaryPhone: '',
  email: '',
  address: '',
  notes: '',
  openingBalance: {
    entryDate: new Date().toISOString().slice(0, 10),
    amount: 0,
    balanceNature: '',
    notes: ''
  }
};

export function toPartyFormValues(party: UpdatePartyRequest): PartyFormValues {
  return {
    ...party,
    openingBalance: null
  };
}

export function cleanCreate(values: PartyFormValues): CreatePartyRequest {
  return {
    nameArabic: values.nameArabic,
    nameEnglish: values.nameEnglish || null,
    isCustomer: values.isCustomer,
    isSupplier: values.isSupplier,
    primaryPhone: values.primaryPhone || null,
    secondaryPhone: values.secondaryPhone || null,
    email: values.email || null,
    address: values.address || null,
    notes: values.notes || null,
    openingBalance: values.openingBalance?.amount && values.openingBalance.amount > 0 ? values.openingBalance : null
  };
}

export function cleanUpdate(values: PartyFormValues): UpdatePartyRequest {
  return {
    nameArabic: values.nameArabic,
    nameEnglish: values.nameEnglish || null,
    isCustomer: values.isCustomer,
    isSupplier: values.isSupplier,
    primaryPhone: values.primaryPhone || null,
    secondaryPhone: values.secondaryPhone || null,
    email: values.email || null,
    address: values.address || null,
    notes: values.notes || null,
    rowVersion: values.rowVersion ?? ''
  };
}

export default function PartyForm({ mode, initialValues, isSaving = false, onCancel, onSubmit }: PartyFormProps) {
  const form = useForm<PartyFormValues>({
    resolver: zodResolver(mode === 'create' ? createPartySchema : updatePartySchema),
    values: initialValues
  });

  return (
    <Stack component="form" spacing={2} onSubmit={form.handleSubmit(onSubmit)}>
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Controller name="nameArabic" control={form.control} render={({ field, fieldState }) => <TextField {...field} fullWidth label={<FormattedMessage id="name-arabic" />} error={!!fieldState.error} helperText={fieldState.error?.message} />} />
        </Grid>
        <Grid item xs={12} md={6}>
          <Controller name="nameEnglish" control={form.control} render={({ field, fieldState }) => <TextField {...field} value={field.value ?? ''} fullWidth label={<FormattedMessage id="name-english" />} error={!!fieldState.error} helperText={fieldState.error?.message} />} />
        </Grid>
        <Grid item xs={12}>
          <Stack direction="row" spacing={2}>
            <Controller name="isCustomer" control={form.control} render={({ field }) => <FormControlLabel control={<Checkbox checked={field.value} onChange={(event) => field.onChange(event.target.checked)} />} label={<FormattedMessage id="party-customer" />} />} />
            <Controller name="isSupplier" control={form.control} render={({ field }) => <FormControlLabel control={<Checkbox checked={field.value} onChange={(event) => field.onChange(event.target.checked)} />} label={<FormattedMessage id="party-supplier" />} />} />
          </Stack>
        </Grid>
        <Grid item xs={12} md={4}>
          <Controller name="primaryPhone" control={form.control} render={({ field, fieldState }) => <TextField {...field} value={field.value ?? ''} fullWidth label={<FormattedMessage id="primary-phone" />} error={!!fieldState.error} helperText={fieldState.error?.message} />} />
        </Grid>
        <Grid item xs={12} md={4}>
          <Controller name="secondaryPhone" control={form.control} render={({ field, fieldState }) => <TextField {...field} value={field.value ?? ''} fullWidth label={<FormattedMessage id="secondary-phone" />} error={!!fieldState.error} helperText={fieldState.error?.message} />} />
        </Grid>
        <Grid item xs={12} md={4}>
          <Controller name="email" control={form.control} render={({ field, fieldState }) => <TextField {...field} value={field.value ?? ''} fullWidth label={<FormattedMessage id="email" />} error={!!fieldState.error} helperText={fieldState.error?.message} />} />
        </Grid>
        <Grid item xs={12}>
          <Controller name="address" control={form.control} render={({ field, fieldState }) => <TextField {...field} value={field.value ?? ''} fullWidth label={<FormattedMessage id="address" />} error={!!fieldState.error} helperText={fieldState.error?.message} />} />
        </Grid>
        <Grid item xs={12}>
          <Controller name="notes" control={form.control} render={({ field, fieldState }) => <TextField {...field} value={field.value ?? ''} fullWidth multiline minRows={2} label={<FormattedMessage id="notes" />} error={!!fieldState.error} helperText={fieldState.error?.message} />} />
        </Grid>
        {mode === 'create' && (
          <>
            <Grid item xs={12} md={4}>
              <Controller name="openingBalance.amount" control={form.control} render={({ field, fieldState }) => <TextField {...field} type="number" onChange={(event) => field.onChange(Number(event.target.value))} fullWidth label={<FormattedMessage id="opening-balance" />} error={!!fieldState.error} helperText={fieldState.error?.message} />} />
            </Grid>
            <Grid item xs={12} md={4}>
              <Controller name="openingBalance.balanceNature" control={form.control} render={({ field, fieldState }) => (
                <TextField {...field} fullWidth select label={<FormattedMessage id="balance-direction" />} error={!!fieldState.error} helperText={fieldState.error?.message}>
                  <MenuItem value=""><FormattedMessage id="none" /></MenuItem>
                  <MenuItem value="Debit"><FormattedMessage id="debit" /></MenuItem>
                  <MenuItem value="Credit"><FormattedMessage id="credit" /></MenuItem>
                </TextField>
              )} />
            </Grid>
            <Grid item xs={12} md={4}>
              <Controller name="openingBalance.entryDate" control={form.control} render={({ field }) => <TextField {...field} value={field.value ?? ''} type="date" fullWidth label={<FormattedMessage id="opening-balance-date" />} InputLabelProps={{ shrink: true }} />} />
            </Grid>
          </>
        )}
      </Grid>
      <Stack direction="row" spacing={2}>
        <Button variant="contained" type="submit" disabled={isSaving}><FormattedMessage id={isSaving ? 'loading' : 'save'} /></Button>
        <Button onClick={onCancel} disabled={isSaving}><FormattedMessage id="cancel" /></Button>
      </Stack>
    </Stack>
  );
}
