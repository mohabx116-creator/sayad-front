import { useEffect } from 'react';
import { Controller, SubmitHandler, useForm, useWatch } from 'react-hook-form';
import type { Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { FormattedMessage, useIntl } from 'react-intl';

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
import { WORKER_MEAL_ALLOWANCE_OPTIONS, WORKER_OVERTIME_CALCULATION_OPTIONS } from '../utils/workers.constants';
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

function formatMoney(locale: string, value: number) {
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);
}

function getMealAllowanceValueLabelId(type: string) {
  if (type === '2') return 'meal-allowance-value-per-day';
  return 'meal-allowance-value-fixed';
}

function getOvertimeRateLabelId(type: string) {
  if (type === '2') return 'overtime-rate-multiplier';
  return 'overtime-rate-hourly';
}

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
  mealAllowanceType: '0',
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
    mealAllowanceType: worker.currentWageProfile?.mealAllowanceType?.toString() ?? '0',
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
  const intl = useIntl();
  const form = useForm<WorkerFormValues>({
    resolver: workerResolver(mode),
    values: initialValues
  });
  const mealAllowanceType = useWatch({ control: form.control, name: 'mealAllowanceType' });
  const overtimeCalculationType = useWatch({ control: form.control, name: 'overtimeCalculationType' });
  const dailyWage = useWatch({ control: form.control, name: 'dailyWage' });
  const monthlyDaysBasis = useWatch({ control: form.control, name: 'monthlyDaysBasis' });

  const expectedMonthlyWage = (() => {
    const wage = Number(dailyWage);
    const days = Number(monthlyDaysBasis);
    if (!Number.isFinite(wage) || !Number.isFinite(days)) {
      return 0;
    }
    return wage * days;
  })();

  useEffect(() => {
    form.reset(initialValues);
  }, [form, initialValues]);

  useEffect(() => {
    if (mealAllowanceType === '0' && form.getValues('mealAllowanceValue') !== '0') {
      form.setValue('mealAllowanceValue', '0', { shouldDirty: false, shouldValidate: true });
    }
  }, [form, mealAllowanceType]);

  useEffect(() => {
    if (overtimeCalculationType === '0' && form.getValues('overtimeRate') !== '0') {
      form.setValue('overtimeRate', '0', { shouldDirty: false, shouldValidate: true });
    }
  }, [form, overtimeCalculationType]);

  return (
    <Stack component="form" spacing={4} onSubmit={form.handleSubmit(onSubmit)}>
      <Box>
        <SectionHeader icon={IconUser} titleId="worker-basic-information" />
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Controller
              name="code"
              control={form.control}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  fullWidth
                  label={<FormattedMessage id="worker-code" />}
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message ?? <FormattedMessage id="worker-code-help" />}
                />
              )}
            />
          </Grid>
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
          <Grid item xs={12} md={4}>
            <Controller
              name="wageEffectiveFrom"
              control={form.control}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  type="date"
                  fullWidth
                  label={<FormattedMessage id="worker-wage-effective-from" />}
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                  InputLabelProps={{ shrink: true }}
                />
              )}
            />
          </Grid>
          <Grid item xs={12} md={4}>
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
          <Grid item xs={12} md={4}>
            <Controller
              name="monthlyDaysBasis"
              control={form.control}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  fullWidth
                  type="number"
                  label={<FormattedMessage id="worker-monthly-days-basis" />}
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                  inputProps={{ min: 1, max: 31, step: 1, dir: 'ltr', inputMode: 'numeric' }}
                  sx={numberInputSx}
                  onChange={(event) => field.onChange(event.target.value)}
                />
              )}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label={<FormattedMessage id="worker-expected-monthly-wage" />}
              value={formatMoney(intl.locale, expectedMonthlyWage)}
              InputProps={{ readOnly: true }}
              helperText={<FormattedMessage id="worker-expected-monthly-wage-help" defaultMessage="Calculated from daily wage and monthly days basis." />}
            />
          </Grid>
          <Grid item xs={12} md={mealAllowanceType === '0' ? 12 : 6}>
            <Controller
              name="mealAllowanceType"
              control={form.control}
              render={({ field, fieldState }) => (
                <TextField {...field} select fullWidth label={<FormattedMessage id="meal-allowance-type" />} error={!!fieldState.error} helperText={fieldState.error?.message}>
                  {WORKER_MEAL_ALLOWANCE_OPTIONS.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      <FormattedMessage id={option.labelId} />
                    </MenuItem>
                  ))}
                </TextField>
              )}
            />
          </Grid>
          {mealAllowanceType !== '0' && (
            <Grid item xs={12} md={6}>
              <Controller
                name="mealAllowanceValue"
                control={form.control}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    fullWidth
                    type="number"
                    label={<FormattedMessage id={getMealAllowanceValueLabelId(mealAllowanceType)} />}
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                    inputProps={{ min: 0, step: '0.01', dir: 'ltr', inputMode: 'decimal' }}
                    sx={numberInputSx}
                    onChange={(event) => field.onChange(event.target.value)}
                  />
                )}
              />
            </Grid>
          )}
          <Grid item xs={12} md={overtimeCalculationType === '0' ? 12 : 6}>
            <Controller
              name="overtimeCalculationType"
              control={form.control}
              render={({ field, fieldState }) => (
                <TextField {...field} select fullWidth label={<FormattedMessage id="overtime-calculation-type" />} error={!!fieldState.error} helperText={fieldState.error?.message}>
                  {WORKER_OVERTIME_CALCULATION_OPTIONS.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      <FormattedMessage id={option.labelId} />
                    </MenuItem>
                  ))}
                </TextField>
              )}
            />
          </Grid>
          {overtimeCalculationType !== '0' && (
            <Grid item xs={12} md={6}>
              <Controller
                name="overtimeRate"
                control={form.control}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    fullWidth
                    type="number"
                    label={<FormattedMessage id={getOvertimeRateLabelId(overtimeCalculationType)} />}
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                    inputProps={{ min: 0, step: '0.0001', dir: 'ltr', inputMode: 'decimal' }}
                    sx={numberInputSx}
                    onChange={(event) => field.onChange(event.target.value)}
                  />
                )}
              />
            </Grid>
          )}
          <Grid item xs={12}>
            <Controller
              name="wageNotes"
              control={form.control}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  value={field.value ?? ''}
                  fullWidth
                  multiline
                  minRows={3}
                  label={<FormattedMessage id="worker-wage-notes" />}
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
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
