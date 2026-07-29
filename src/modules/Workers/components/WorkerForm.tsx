import { useEffect } from 'react';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import type { Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { FormattedMessage } from 'react-intl';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import FormControlLabel from '@mui/material/FormControlLabel';
import Grid from '@mui/material/GridLegacy';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { IconDeviceFloppy, IconUser, IconWallet } from '@tabler/icons-react';

import { createWorkerSchema, updateWorkerSchema } from '../schemas/worker.schema';
import type { CreateWorkerRequest, UpdateWorkerRequest, WorkerDto, WorkerListItemDto } from '../types/workers.types';
import type { OperationalJobOption } from '../types/workers.types';

const numberInputSx = {
  '& input[type=number]': {
    MozAppearance: 'textfield'
  },
  '& input[type=number]::-webkit-outer-spin-button, & input[type=number]::-webkit-inner-spin-button': {
    WebkitAppearance: 'none',
    margin: 0
  }
} as const;

export type WorkerFormValues = {
  code: string;
  name: string;
  mobileNumber: string;
  address: string;
  operationalJobId: string;
  notes: string;
  isActive: boolean;
  wageEffectiveFrom: string;
  dailyWage: string;
  monthlyDaysBasis: string;
  mealAllowanceType: string;
  mealAllowanceValue: string;
  overtimeCalculationType: string;
  overtimeRate: string;
  wageNotes: string;
  rowVersion?: string;
  wageRowVersion?: string;
};

type WorkerFormProps = {
  mode: 'create' | 'edit';
  initialValues: WorkerFormValues;
  operationalJobs: OperationalJobOption[];
  isSaving?: boolean;
  onCancel: () => void;
  onSubmit: SubmitHandler<WorkerFormValues>;
};

export const emptyWorkerValues: WorkerFormValues = {
  code: '',
  name: '',
  mobileNumber: '',
  address: '',
  operationalJobId: '',
  notes: '',
  isActive: true,
  wageEffectiveFrom: new Date().toISOString().slice(0, 10),
  dailyWage: '',
  monthlyDaysBasis: '30',
  mealAllowanceType: '1',
  mealAllowanceValue: '0',
  overtimeCalculationType: '0',
  overtimeRate: '0',
  wageNotes: ''
};

export function toWorkerFormValues(worker: WorkerDto): WorkerFormValues {
  return {
    code: worker.code,
    name: worker.name,
    mobileNumber: worker.mobileNumber ?? '',
    address: worker.address ?? '',
    operationalJobId: worker.operationalJobId,
    notes: worker.notes ?? '',
    isActive: worker.isActive,
    wageEffectiveFrom: worker.currentWageProfile?.effectiveFrom ?? new Date().toISOString().slice(0, 10),
    dailyWage: worker.currentWageProfile?.dailyWage == null ? '' : worker.currentWageProfile.dailyWage.toFixed(2),
    monthlyDaysBasis: worker.currentWageProfile?.monthlyDaysBasis?.toString() ?? '30',
    mealAllowanceType: worker.currentWageProfile?.mealAllowanceType?.toString() ?? '1',
    mealAllowanceValue: worker.currentWageProfile?.mealAllowanceValue == null ? '0' : worker.currentWageProfile.mealAllowanceValue.toFixed(2),
    overtimeCalculationType: worker.currentWageProfile?.overtimeCalculationType?.toString() ?? '0',
    overtimeRate: worker.currentWageProfile?.overtimeRate == null ? '0' : worker.currentWageProfile.overtimeRate.toFixed(4),
    wageNotes: worker.currentWageProfile?.notes ?? '',
    rowVersion: worker.rowVersion,
    wageRowVersion: worker.currentWageProfile?.rowVersion
  };
}

function toRequestPayload(values: WorkerFormValues): CreateWorkerRequest {
  return {
    code: values.code.trim() || null,
    name: values.name.trim(),
    mobileNumber: values.mobileNumber.trim() || null,
    address: values.address.trim() || null,
    operationalJobId: values.operationalJobId,
    notes: values.notes.trim() || null,
    isActive: values.isActive,
    wageProfile: {
      effectiveFrom: values.wageEffectiveFrom,
      dailyWage: Number(values.dailyWage || 0),
      monthlyDaysBasis: Number(values.monthlyDaysBasis || 30),
      mealAllowanceType: Number(values.mealAllowanceType),
      mealAllowanceValue: Number(values.mealAllowanceValue || 0),
      overtimeCalculationType: Number(values.overtimeCalculationType),
      overtimeRate: Number(values.overtimeRate || 0),
      notes: values.wageNotes.trim() || null,
      rowVersion: values.wageRowVersion ?? null
    }
  };
}

export function cleanCreateWorker(values: WorkerFormValues): CreateWorkerRequest {
  return toRequestPayload(values);
}

export function cleanUpdateWorker(values: WorkerFormValues): UpdateWorkerRequest {
  return {
    ...toRequestPayload(values),
    code: values.code.trim(),
    rowVersion: values.rowVersion ?? ''
  };
}

const SectionHeader = ({ icon: Icon, titleId }: { icon: any; titleId: string }) => (
  <Box sx={{ mb: 2 }}>
    <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
      <Icon size={22} color="#1E88E5" stroke={1.5} />
      <Typography variant="h4" fontWeight={700}>
        <FormattedMessage id={titleId} />
      </Typography>
    </Stack>
    <Divider />
  </Box>
);

function workerResolver(mode: 'create' | 'edit'): Resolver<WorkerFormValues> {
  return zodResolver(mode === 'create' ? createWorkerSchema : updateWorkerSchema) as Resolver<WorkerFormValues>;
}

export default function WorkerForm({ mode, initialValues, operationalJobs, isSaving = false, onCancel, onSubmit }: WorkerFormProps) {
  const form = useForm<WorkerFormValues>({
    resolver: workerResolver(mode),
    values: initialValues
  });
  const expectedMonthlySalary = Number(form.watch('dailyWage') || 0) * 30;

  useEffect(() => {
    form.reset(initialValues);
  }, [form, initialValues]);

  return (
    <Stack component="form" spacing={4} onSubmit={form.handleSubmit(onSubmit)}>
      <Box>
        <SectionHeader icon={IconUser} titleId="worker-basic-information" />
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Controller
              name="name"
              control={form.control}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  fullWidth
                  required
                  label={<FormattedMessage id="worker-name" />}
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                />
              )}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <Controller
              name="operationalJobId"
              control={form.control}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  select
                  fullWidth
                  required
                  label={<FormattedMessage id="worker-operational-job" />}
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                >
                  <MenuItem value=""><FormattedMessage id="select-operational-job" /></MenuItem>
                  {operationalJobs.map((job) => (
                    <MenuItem key={job.id} value={job.id}>
                      {job.code} - {job.name}
                    </MenuItem>
                  ))}
                </TextField>
              )}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <Controller
              name="mobileNumber"
              control={form.control}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  value={field.value ?? ''}
                  fullWidth
                  label={<FormattedMessage id="worker-mobile-number" />}
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                  inputProps={{ dir: 'ltr' }}
                />
              )}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <Controller
              name="address"
              control={form.control}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  value={field.value ?? ''}
                  fullWidth
                  label={<FormattedMessage id="worker-address" />}
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
                  label={<FormattedMessage id="notes" />}
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                />
              )}
            />
          </Grid>
          <Grid item xs={12}>
            <Controller
              name="isActive"
              control={form.control}
              render={({ field }) => (
                <FormControlLabel
                  control={<Switch checked={field.value} onChange={(_, checked) => field.onChange(checked)} />}
                  label={<FormattedMessage id="active" />}
                />
              )}
            />
          </Grid>
        </Grid>
      </Box>

      <Box>
        <SectionHeader icon={IconWallet} titleId="worker-wage-settings" />
        <Grid container spacing={2.5}>
          <Grid item xs={12} md={6}>
            <Controller
              name="dailyWage"
              control={form.control}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  fullWidth
                  type="number"
                  label={<FormattedMessage id="worker-daily-wage" />}
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                  inputProps={{ min: 0, step: '0.01', dir: 'ltr', inputMode: 'decimal' }}
                  sx={numberInputSx}
                  onChange={(event) => field.onChange(event.target.value)}
                />
              )}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              value={expectedMonthlySalary.toFixed(2)}
              label={<FormattedMessage id="expected-monthly-salary" />}
              inputProps={{ readOnly: true, dir: 'ltr' }}
              sx={numberInputSx}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Controller
              name="mealAllowanceValue"
              control={form.control}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  fullWidth
                  type="number"
                  label={<FormattedMessage id="worker-meal-allowance" />}
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                  inputProps={{ min: 0, step: '0.01', dir: 'ltr', inputMode: 'decimal' }}
                  sx={numberInputSx}
                  onChange={(event) => field.onChange(event.target.value)}
                />
              )}
            />
          </Grid>
        </Grid>
      </Box>

      <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
        <Stack direction="row" spacing={1.5} justifyContent="flex-end">
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
