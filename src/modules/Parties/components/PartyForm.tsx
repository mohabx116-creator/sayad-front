import { Controller, useForm } from 'react-hook-form';
import type { Resolver, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { FormattedMessage } from 'react-intl';

import Button from '@mui/material/Button';
import FormControlLabel from '@mui/material/FormControlLabel';
import Grid from '@mui/material/GridLegacy';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Switch from '@mui/material/Switch';
import Typography from '@mui/material/Typography';

import { IconDeviceFloppy } from '@tabler/icons-react';

import { createPartySchema, updatePartySchema } from '../schemas/party.schema';
import type { CreatePartyRequest, UpdatePartyRequest } from '../types/parties.types';

type PartyType = 'customer' | 'supplier' | 'both';

export type PartyFormValues = {
  name: string;
  mobileNumber: string;
  address: string;
  notes: string;
  partyType: PartyType;
  isActive: boolean;
  includeOpeningBalance: boolean;
  openingBalanceAmount?: number;
  openingBalanceNature: 'Debit' | 'Credit' | '';
  openingBalanceDate: string;
  customerOpeningBalance?: { amount?: number; nature: 'Debit' | 'Credit' | ''; date: string; enabled: boolean };
  supplierOpeningBalance?: { amount?: number; nature: 'Debit' | 'Credit' | ''; date: string; enabled: boolean };
  rowVersion?: string;
};

type PartyFormProps = {
  mode: 'create' | 'edit';
  initialValues: PartyFormValues;
  isSaving?: boolean;
  onCancel: () => void;
  onSubmit: SubmitHandler<PartyFormValues>;
};

export const emptyCreateValues: PartyFormValues = {
  name: '',
  mobileNumber: '',
  address: '',
  notes: '',
  partyType: 'customer',
  isActive: true,
  includeOpeningBalance: false,
  openingBalanceNature: '',
  openingBalanceDate: ''
  ,customerOpeningBalance: { enabled: false, nature: '', date: '' }
  ,supplierOpeningBalance: { enabled: false, nature: '', date: '' }
};

export function toPartyFormValues(party: UpdatePartyRequest & { nameArabic?: string; primaryPhone?: string | null; isActive?: boolean; isCustomer?: boolean; isSupplier?: boolean; address?: string | null; notes?: string | null }): PartyFormValues {
  return {
    name: party.nameArabic ?? '',
    mobileNumber: party.primaryPhone ?? '',
    address: party.address ?? '',
    notes: party.notes ?? '',
    partyType: party.isCustomer && party.isSupplier ? 'both' : party.isSupplier ? 'supplier' : 'customer',
    isActive: party.isActive ?? true,
    includeOpeningBalance: false,
    openingBalanceNature: '',
    openingBalanceDate: '',
    rowVersion: party.rowVersion
  };
}

function toClassification(values: PartyFormValues): Pick<CreatePartyRequest, 'isCustomer' | 'isSupplier'> {
  return {
    isCustomer: values.partyType === 'customer' || values.partyType === 'both',
    isSupplier: values.partyType === 'supplier' || values.partyType === 'both'
  };
}

export function cleanCreate(values: PartyFormValues): CreatePartyRequest {
  const classification = toClassification(values);
  return {
    nameArabic: values.name,
    nameEnglish: null,
    ...classification,
    primaryPhone: values.mobileNumber || null,
    secondaryPhone: null,
    email: null,
    address: values.address || null,
    notes: values.notes || null,
    openingBalance: values.includeOpeningBalance && values.partyType !== 'both' ? {
      entryDate: values.openingBalanceDate,
      amount: values.openingBalanceAmount ?? 0,
      balanceNature: values.openingBalanceNature,
      notes: null
    } : undefined,
    customerOpeningBalance: values.partyType === 'both' && values.customerOpeningBalance?.enabled ? {
      entryDate: values.customerOpeningBalance.date,
      amount: values.customerOpeningBalance.amount ?? 0,
      balanceNature: values.customerOpeningBalance.nature,
      notes: null,
      side: 'Customer'
    } : undefined,
    supplierOpeningBalance: values.partyType === 'both' && values.supplierOpeningBalance?.enabled ? {
      entryDate: values.supplierOpeningBalance.date,
      amount: values.supplierOpeningBalance.amount ?? 0,
      balanceNature: values.supplierOpeningBalance.nature,
      notes: null,
      side: 'Supplier'
    } : undefined
  };
}

export function cleanUpdate(values: PartyFormValues): UpdatePartyRequest {
  const classification = toClassification(values);
  return {
    nameArabic: values.name,
    nameEnglish: null,
    ...classification,
    primaryPhone: values.mobileNumber || null,
    secondaryPhone: null,
    email: null,
    address: values.address || null,
    notes: values.notes || null,
    rowVersion: values.rowVersion ?? ''
  };
}

export default function PartyForm({ mode, initialValues, isSaving = false, onCancel, onSubmit }: PartyFormProps) {
  const resolver = (mode === 'create' ? zodResolver(createPartySchema) : zodResolver(updatePartySchema)) as Resolver<PartyFormValues>;
  const form = useForm<PartyFormValues>({
    resolver,
    values: initialValues
  });

  return (
    <Stack component="form" spacing={3} onSubmit={form.handleSubmit((values) => onSubmit(values))}>
      <Typography variant="body2" color="text.secondary">
        <FormattedMessage id="party-form-help" />
      </Typography>

      <Grid container spacing={2.5}>
        <Grid item xs={12} md={6}>
          <Controller
            name="name"
            control={form.control}
            render={({ field, fieldState }) => (
              <TextField
                {...field}
                fullWidth
                label={<FormattedMessage id="party-name" />}
                error={!!fieldState.error}
                helperText={fieldState.error?.message}
                required
              />
            )}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <Controller
            name="mobileNumber"
            control={form.control}
            render={({ field, fieldState }) => (
              <TextField
                {...field}
                value={field.value ?? ''}
                fullWidth
                label={<FormattedMessage id="party-mobile-number" />}
                error={!!fieldState.error}
                helperText={fieldState.error?.message}
              />
            )}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <Controller
            name="partyType"
            control={form.control}
            render={({ field, fieldState }) => (
              <TextField
                {...field}
                fullWidth
                select
                label={<FormattedMessage id="party-type" />}
                required
                error={!!fieldState.error}
                helperText={fieldState.error?.message}
              >
                <MenuItem value="customer"><FormattedMessage id="party-customer" /></MenuItem>
                <MenuItem value="supplier"><FormattedMessage id="party-supplier" /></MenuItem>
                <MenuItem value="both"><FormattedMessage id="party-type-both" /></MenuItem>
              </TextField>
            )}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <Controller
            name="isActive"
            control={form.control}
            render={({ field }) => (
              <FormControlLabel
                sx={{ height: '100%', alignItems: 'center', px: 1 }}
                control={<Switch checked={field.value} onChange={(event) => field.onChange(event.target.checked)} />}
                label={<FormattedMessage id="active" />}
              />
            )}
          />
        </Grid>
        <Grid item xs={12}>
          <Controller
            name="address"
            control={form.control}
            render={({ field, fieldState }) => (
              <TextField
                {...field}
                value={field.value ?? ''}
                fullWidth
                label={<FormattedMessage id="party-address" />}
                error={!!fieldState.error}
                helperText={fieldState.error?.message}
              />
            )}
          />
        </Grid>
        <Grid item xs={12}>
          <Controller
            name="notes"
            control={form.control}
            render={({ field, fieldState }) => (
              <TextField
                {...field}
                value={field.value ?? ''}
                fullWidth
                multiline
                minRows={3}
                label={<FormattedMessage id="party-notes" />}
                error={!!fieldState.error}
                helperText={fieldState.error?.message}
              />
            )}
          />
        </Grid>
      </Grid>

      <Stack direction="row" spacing={2} justifyContent="flex-end" sx={{ pt: 1 }}>
        <Button onClick={onCancel} disabled={isSaving} sx={{ color: 'primary.main', fontWeight: 600 }}>
          <FormattedMessage id="cancel" />
        </Button>
        <Button variant="contained" type="submit" disabled={isSaving} startIcon={<IconDeviceFloppy size={20} />} sx={{ px: 4 }}>
          <FormattedMessage id={isSaving ? 'loading' : 'save'} />
        </Button>
      </Stack>
    </Stack>
  );
}
