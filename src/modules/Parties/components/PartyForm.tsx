import { Controller, useForm } from 'react-hook-form';
import type { Resolver, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { FormattedMessage } from 'react-intl';

import Button from '@mui/material/Button';
import Grid from '@mui/material/GridLegacy';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import Box from '@mui/material/Box';

import { IconId, IconAddressBook, IconWallet, IconDeviceFloppy } from '@tabler/icons-react';

import { createPartySchema, updatePartySchema } from '../schemas/party.schema';
import type { CreatePartyRequest, UpdatePartyRequest } from '../types/parties.types';

type PartyType = 'customer' | 'supplier' | 'both';

export type PartyFormValues = CreatePartyRequest & {
  rowVersion?: string;
  partyType: PartyType;
  partyCode?: string | null;
};

type PartyFormProps = {
  mode: 'create' | 'edit';
  initialValues: PartyFormValues;
  isSaving?: boolean;
  onCancel: () => void;
  onSubmit: SubmitHandler<PartyFormValues>;
};

export const emptyCreateValues: PartyFormValues = {
  nameArabic: '',
  nameEnglish: '',
  isCustomer: true,
  isSupplier: false,
  partyType: 'customer',
  partyCode: '',
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
    partyType: party.isCustomer && party.isSupplier ? 'both' : party.isSupplier ? 'supplier' : 'customer',
    partyCode: '',
    openingBalance: null
  };
}

export function cleanCreate(values: PartyFormValues): CreatePartyRequest {
  return {
    nameArabic: values.nameArabic,
    nameEnglish: values.nameEnglish || null,
    isCustomer: values.partyType === 'customer' || values.partyType === 'both',
    isSupplier: values.partyType === 'supplier' || values.partyType === 'both',
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
    isCustomer: values.partyType === 'customer' || values.partyType === 'both',
    isSupplier: values.partyType === 'supplier' || values.partyType === 'both',
    primaryPhone: values.primaryPhone || null,
    secondaryPhone: values.secondaryPhone || null,
    email: values.email || null,
    address: values.address || null,
    notes: values.notes || null,
    rowVersion: values.rowVersion ?? ''
  };
}

const SectionHeader = ({ icon: Icon, titleId }: { icon: any; titleId: string }) => (
  <Box sx={{ mb: 2 }}>
    <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
      <Icon size={24} color="#1E88E5" stroke={1.5} />
      <Typography variant="h4" fontWeight="bold">
        <FormattedMessage id={titleId} />
      </Typography>
    </Stack>
    <Divider />
  </Box>
);

export default function PartyForm({ mode, initialValues, isSaving = false, onCancel, onSubmit }: PartyFormProps) {
  const resolver = (mode === 'create' ? zodResolver(createPartySchema) : zodResolver(updatePartySchema)) as Resolver<PartyFormValues>;
  const form = useForm<PartyFormValues>({
    resolver,
    values: initialValues
  });

  return (
    <Stack component="form" spacing={4} onSubmit={form.handleSubmit((values) => onSubmit(values))}>
      {/* Basic Information */}
      <Box>
        <SectionHeader icon={IconId} titleId="basic-information" />
        <Grid container spacing={3}>
          <Grid item xs={12} md={mode === 'create' ? 12 : 6}>
            <Controller name="nameArabic" control={form.control} render={({ field, fieldState }) => <TextField {...field} fullWidth label={<FormattedMessage id="name-arabic" />} error={!!fieldState.error} helperText={fieldState.error?.message} required />} />
          </Grid>
          <Grid item xs={12} md={6}>
            <Controller name="nameEnglish" control={form.control} render={({ field, fieldState }) => <TextField {...field} value={field.value ?? ''} fullWidth label={<FormattedMessage id="name-english" />} error={!!fieldState.error} helperText={fieldState.error?.message} />} />
          </Grid>
          <Grid item xs={12} md={6}>
            <Controller name="partyType" control={form.control} render={({ field, fieldState }) => (
              <TextField {...field} fullWidth select label={<FormattedMessage id="party-type" />} required error={!!fieldState.error} helperText={fieldState.error?.message}>
                <MenuItem value="customer"><FormattedMessage id="party-customer" /></MenuItem>
                <MenuItem value="supplier"><FormattedMessage id="party-supplier" /></MenuItem>
                <MenuItem value="both"><FormattedMessage id="party-type-both" /></MenuItem>
              </TextField>
            )} />
          </Grid>
          <Grid item xs={12} md={6}>
            <Controller name="partyCode" control={form.control} render={({ field, fieldState }) => <TextField {...field} value={field.value ?? ''} fullWidth label={<FormattedMessage id="party-code" />} error={!!fieldState.error} helperText={fieldState.error?.message} />} />
          </Grid>
        </Grid>
      </Box>

      {/* Contact Information */}
      <Box>
        <SectionHeader icon={IconAddressBook} titleId="contact-information" />
        <Grid container spacing={3}>
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
        </Grid>
      </Box>

      {/* Financial Information */}
      {mode === 'create' && (
        <Box>
          <SectionHeader icon={IconWallet} titleId="financial-information" />
          <Grid container spacing={3}>
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
          </Grid>
        </Box>
      )}

      {/* Footer Buttons */}
      <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
        <Stack direction="row" spacing={2} justifyContent="flex-end">
          <Button onClick={onCancel} disabled={isSaving} sx={{ color: 'primary.main', fontWeight: 600 }}>
            <FormattedMessage id="cancel" />
          </Button>
          <Button variant="contained" type="submit" disabled={isSaving} startIcon={<IconDeviceFloppy size={20} />} sx={{ px: 4 }}>
            <FormattedMessage id={isSaving ? 'loading' : 'save'} />
          </Button>
        </Stack>
      </Box>
    </Stack>
  );
}
