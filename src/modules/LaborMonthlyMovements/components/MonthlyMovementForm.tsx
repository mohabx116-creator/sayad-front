import { useEffect, useMemo, useRef } from 'react';
import { Controller, SubmitHandler, useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { FormattedMessage, useIntl } from 'react-intl';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/GridLegacy';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { IconCalendarEvent, IconCalculator, IconDeviceFloppy, IconUser } from '@tabler/icons-react';

import MainCard from 'ui-component/cards/MainCard';
import { createMonthlyMovementSchema, updateMonthlyMovementSchema } from '../schemas/monthlyMovement.schema';
import type {
  MonthlyMovementDto,
  MonthlyMovementFormValues,
  MonthlyMovementRequest,
  MonthlyMovementWorkerOption
} from '../types/monthlyMovements.types';
import { MONTHLY_MOVEMENT_TYPE_OPTIONS } from '../utils/monthlyMovements.constants';
import { useMonthlyMovementPreview } from '../hooks/useMonthlyMovements';

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

function formatRate(locale: string, value: number) {
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: 4,
    maximumFractionDigits: 4
  }).format(value);
}

function isQuantityMovement(movementType: string) {
  return ['1', '2', '3'].includes(movementType);
}

function isAmountMovement(movementType: string) {
  return ['4', '5'].includes(movementType);
}

function getQuantityLabelId(movementType: string) {
  if (movementType === '1') return 'monthly-movement-quantity-days';
  return 'monthly-movement-quantity-hours';
}

function getAmountLabelId(movementType: string) {
  return movementType === '4' ? 'monthly-movement-amount-deduction' : 'monthly-movement-amount-bonus';
}

function getMovementTitleId(movementType: string) {
  return MONTHLY_MOVEMENT_TYPE_OPTIONS.find((option) => option.value === movementType)?.labelId ?? 'monthly-movement-type';
}

function getMovementEffectLabelId(movementType: string) {
  switch (movementType) {
    case '1':
    case '4':
      return 'monthly-movement-effect-deduction';
    case '2':
    case '3':
    case '5':
      return 'monthly-movement-effect-addition';
    default:
      return 'monthly-movement-effect';
  }
}

type MonthlyMovementFormProps = {
  mode: 'create' | 'edit';
  initialValues: MonthlyMovementFormValues;
  workers: MonthlyMovementWorkerOption[];
  isSaving?: boolean;
  readOnly?: boolean;
  onCancel: () => void;
  onSubmit: SubmitHandler<MonthlyMovementFormValues>;
};

export const emptyMonthlyMovementValues: MonthlyMovementFormValues = {
  workerId: '',
  movementDate: new Date().toISOString().slice(0, 10),
  movementType: '1',
  quantity: '',
  amount: '',
  reason: '',
  notes: '',
  overtimeCalculationType: '',
  overtimeRate: '',
  nightWorkMultiplier: ''
};

export function toMonthlyMovementFormValues(movement: MonthlyMovementDto): MonthlyMovementFormValues {
  const isOvertime = movement.movementType === 2;
  const persistedOvertimeMethod = isOvertime && movement.overtimeCalculationTypeSnapshot !== 0
    ? String(movement.overtimeCalculationTypeSnapshot)
    : '';

  return {
    workerId: movement.workerId,
    movementDate: movement.movementDate,
    movementType: String(movement.movementType),
    quantity: movement.quantity == null ? '' : movement.quantity.toString(),
    amount: movement.amount == null ? '' : Math.abs(movement.amount).toString(),
    reason: movement.reason ?? '',
    notes: movement.notes ?? '',
    overtimeCalculationType: persistedOvertimeMethod,
    overtimeRate: persistedOvertimeMethod === '' ? '' : movement.overtimeRateSnapshot.toString(),
    nightWorkMultiplier: movement.movementType === 3 ? movement.nightWorkMultiplierSnapshot.toString() : '',
    rowVersion: movement.rowVersion
  };
}

function toRequestPayload(values: MonthlyMovementFormValues): MonthlyMovementRequest {
  return {
    workerId: values.workerId,
    movementDate: values.movementDate,
    movementType: Number(values.movementType),
    quantity: isQuantityMovement(values.movementType) ? Number(values.quantity || 0) : null,
    amount: isAmountMovement(values.movementType) ? Number(values.amount || 0) : null,
    reason: values.reason.trim(),
    notes: values.notes.trim() || null,
    overtimeCalculationTypeOverride: values.movementType === '2' && values.overtimeCalculationType !== '' && values.overtimeCalculationType !== '0'
      ? Number(values.overtimeCalculationType)
      : null,
    overtimeRateOverride: values.movementType === '2' && values.overtimeCalculationType !== '' && values.overtimeCalculationType !== '0'
      ? Number(values.overtimeRate || 0)
      : null,
    nightWorkMultiplierOverride: values.movementType === '3' && values.nightWorkMultiplier.trim() !== ''
      ? Number(values.nightWorkMultiplier)
      : null,
    rowVersion: values.rowVersion ?? null
  };
}

export function cleanCreateMonthlyMovement(values: MonthlyMovementFormValues): MonthlyMovementRequest {
  return toRequestPayload(values);
}

export function cleanUpdateMonthlyMovement(values: MonthlyMovementFormValues): MonthlyMovementRequest {
  return {
    ...toRequestPayload(values),
    rowVersion: values.rowVersion ?? ''
  };
}

function movementResolver(mode: 'create' | 'edit') {
  return zodResolver(mode === 'create' ? createMonthlyMovementSchema : updateMonthlyMovementSchema);
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

function findWorker(workers: MonthlyMovementWorkerOption[], workerId: string) {
  return workers.find((worker) => worker.id === workerId) ?? null;
}

export default function MonthlyMovementForm({ mode, initialValues, workers, isSaving = false, readOnly = false, onCancel, onSubmit }: MonthlyMovementFormProps) {
  const intl = useIntl();
  const form = useForm<MonthlyMovementFormValues>({
    resolver: movementResolver(mode),
    values: initialValues
  });

  const watchedWorkerId = useWatch({ control: form.control, name: 'workerId' });
  const watchedMovementDate = useWatch({ control: form.control, name: 'movementDate' });
  const watchedMovementType = useWatch({ control: form.control, name: 'movementType' });
  const watchedQuantity = useWatch({ control: form.control, name: 'quantity' });
  const watchedAmount = useWatch({ control: form.control, name: 'amount' });
  const watchedReason = useWatch({ control: form.control, name: 'reason' });
  const watchedNotes = useWatch({ control: form.control, name: 'notes' });
  const watchedOvertimeCalculationType = useWatch({ control: form.control, name: 'overtimeCalculationType' });
  const watchedOvertimeRate = useWatch({ control: form.control, name: 'overtimeRate' });
  const watchedNightWorkMultiplier = useWatch({ control: form.control, name: 'nightWorkMultiplier' });

  const selectedWorker = useMemo(() => findWorker(workers, watchedWorkerId), [workers, watchedWorkerId]);

  const previewRequest = useMemo(() => {
    if (!watchedWorkerId || !watchedMovementDate || !watchedMovementType || !watchedReason.trim()) {
      return null;
    }

    if (isQuantityMovement(watchedMovementType) && watchedQuantity.trim() === '') {
      return null;
    }

    if (isAmountMovement(watchedMovementType) && watchedAmount.trim() === '') {
      return null;
    }

    return toRequestPayload({
      workerId: watchedWorkerId,
      movementDate: watchedMovementDate,
      movementType: watchedMovementType,
      quantity: watchedQuantity,
      amount: watchedAmount,
      reason: watchedReason,
      notes: watchedNotes,
      overtimeCalculationType: watchedOvertimeCalculationType,
      overtimeRate: watchedOvertimeRate,
      nightWorkMultiplier: watchedNightWorkMultiplier,
      rowVersion: initialValues.rowVersion
    });
  }, [initialValues.rowVersion, watchedAmount, watchedMovementDate, watchedMovementType, watchedNotes, watchedNightWorkMultiplier, watchedOvertimeCalculationType, watchedOvertimeRate, watchedQuantity, watchedReason, watchedWorkerId]);

  const { preview, isLoading: previewLoading, error: previewError } = useMonthlyMovementPreview(previewRequest);

  const previousMovementType = useRef(initialValues.movementType);
  const previousOvertimeCalculationType = useRef(initialValues.overtimeCalculationType);

  useEffect(() => {
    previousMovementType.current = initialValues.movementType;
    previousOvertimeCalculationType.current = initialValues.overtimeCalculationType;
    form.reset(initialValues);
  }, [form, initialValues]);

  useEffect(() => {
    const movementTypeChanged = previousMovementType.current !== watchedMovementType;
    const overtimeMethodChanged = previousOvertimeCalculationType.current !== watchedOvertimeCalculationType;

    if (movementTypeChanged && watchedMovementType !== '2') {
      form.setValue('overtimeCalculationType', '');
      form.setValue('overtimeRate', '');
      form.clearErrors(['overtimeCalculationType', 'overtimeRate']);
    } else if (overtimeMethodChanged) {
      form.setValue('overtimeRate', '');
      form.clearErrors('overtimeRate');
    }

    if (movementTypeChanged && watchedMovementType !== '3') {
      form.setValue('nightWorkMultiplier', '');
      form.clearErrors('nightWorkMultiplier');
    }

    previousMovementType.current = watchedMovementType;
    previousOvertimeCalculationType.current = watchedOvertimeCalculationType;
  }, [form, watchedMovementType, watchedNightWorkMultiplier, watchedOvertimeCalculationType]);

  return (
    <Stack component="form" spacing={4} onSubmit={form.handleSubmit(onSubmit)}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <MainCard>
            <SectionHeader icon={IconCalendarEvent} titleId="monthly-movement-basic-information" />
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Controller
                  name="workerId"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <TextField
                      {...field}
                      select
                      fullWidth
                      required
                      disabled={isSaving || readOnly}
                      label={<FormattedMessage id="monthly-movement-worker" />}
                      error={!!fieldState.error}
                      helperText={fieldState.error?.message}
                    >
                      <MenuItem value=""><FormattedMessage id="select-worker" /></MenuItem>
                      {workers.map((worker) => (
                        <MenuItem key={worker.id} value={worker.id}>
                          {worker.code} - {worker.name}
                        </MenuItem>
                      ))}
                    </TextField>
                  )}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Controller
                  name="movementDate"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <TextField
                      {...field}
                      type="date"
                      fullWidth
                      required
                      disabled={isSaving || readOnly}
                      label={<FormattedMessage id="monthly-movement-date" />}
                      error={!!fieldState.error}
                      helperText={fieldState.error?.message}
                      InputLabelProps={{ shrink: true }}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Controller
                  name="movementType"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <TextField
                      {...field}
                      select
                      fullWidth
                      required
                      disabled={isSaving || readOnly}
                      label={<FormattedMessage id="monthly-movement-type" />}
                      error={!!fieldState.error}
                      helperText={fieldState.error?.message}
                    >
                      {MONTHLY_MOVEMENT_TYPE_OPTIONS.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          <FormattedMessage id={option.labelId} />
                        </MenuItem>
                      ))}
                    </TextField>
                  )}
                />
              </Grid>
              {isQuantityMovement(watchedMovementType) && (
                <Grid item xs={12} md={6}>
                  <Controller
                    name="quantity"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <TextField
                        {...field}
                        fullWidth
                        type="number"
                        disabled={isSaving || readOnly}
                        label={<FormattedMessage id={getQuantityLabelId(watchedMovementType)} />}
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
              {isAmountMovement(watchedMovementType) && (
                <Grid item xs={12} md={6}>
                  <Controller
                    name="amount"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <TextField
                        {...field}
                        fullWidth
                        type="number"
                        disabled={isSaving || readOnly}
                        label={<FormattedMessage id={getAmountLabelId(watchedMovementType)} />}
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
              {watchedMovementType === '2' && (
                <>
                  <Grid item xs={12} md={6}>
                    <Controller
                      name="overtimeCalculationType"
                      control={form.control}
                      render={({ field, fieldState }) => (
                        <TextField
                          {...field}
                          select
                          fullWidth
                          disabled={isSaving || readOnly}
                          label={<FormattedMessage id="monthly-movement-overtime-method" />}
                          error={!!fieldState.error}
                          helperText={fieldState.error?.message}
                        >
                          <MenuItem value=""><FormattedMessage id="monthly-movement-overtime-worker-default" /></MenuItem>
                          <MenuItem value="1"><FormattedMessage id="monthly-movement-overtime-hourly-rate" /></MenuItem>
                          <MenuItem value="2"><FormattedMessage id="monthly-movement-overtime-multiplier" /></MenuItem>
                        </TextField>
                      )}
                    />
                  </Grid>
                  {watchedOvertimeCalculationType === '' && selectedWorker?.currentWageProfile && (
                    <Grid item xs={12} md={6}>
                      <Typography variant="body2" color="text.secondary" sx={{ pt: 1 }}>
                        <FormattedMessage id="monthly-movement-overtime-default-context" />:{' '}
                        <FormattedMessage id={`overtime-calculation-${selectedWorker.currentWageProfile.overtimeCalculationType}`} />{' '}
                        {formatRate(intl.locale, selectedWorker.currentWageProfile.overtimeRate)}
                      </Typography>
                    </Grid>
                  )}
                  {watchedOvertimeCalculationType === '1' && (
                    <Grid item xs={12} md={6}>
                      <Controller
                        name="overtimeRate"
                        control={form.control}
                        render={({ field, fieldState }) => (
                          <TextField
                            {...field}
                            fullWidth
                            type="number"
                            disabled={isSaving || readOnly}
                            label={<FormattedMessage id="monthly-movement-overtime-hourly-rate" />}
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
                  {watchedOvertimeCalculationType === '2' && (
                    <Grid item xs={12} md={6}>
                      <Controller
                        name="overtimeRate"
                        control={form.control}
                        render={({ field, fieldState }) => (
                          <TextField
                            {...field}
                            fullWidth
                            type="number"
                            disabled={isSaving || readOnly}
                            label={<FormattedMessage id="monthly-movement-overtime-multiplier" />}
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
                </>
              )}
              {watchedMovementType === '3' && (
                <Grid item xs={12} md={6}>
                  <Controller
                    name="nightWorkMultiplier"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <TextField
                        {...field}
                        fullWidth
                        type="number"
                        disabled={isSaving || readOnly}
                        label={<FormattedMessage id="monthly-movement-night-multiplier-override" />}
                        placeholder="1.25"
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
                  name="reason"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <TextField
                      {...field}
                      fullWidth
                      required
                      disabled={isSaving || readOnly}
                      label={<FormattedMessage id="monthly-movement-reason" />}
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
                      disabled={isSaving || readOnly}
                      multiline
                      minRows={3}
                      label={<FormattedMessage id="notes" />}
                      error={!!fieldState.error}
                      helperText={fieldState.error?.message}
                    />
                  )}
                />
              </Grid>
            </Grid>
          </MainCard>
        </Grid>

        <Grid item xs={12} md={4}>
          <Stack spacing={3}>
            <MainCard>
              <SectionHeader icon={IconUser} titleId="monthly-movement-worker-summary" />
              {selectedWorker ? (
                <Stack spacing={1.5}>
                  <Typography variant="h5">{selectedWorker.name}</Typography>
                  <Chip label={selectedWorker.code} variant="outlined" />
                  <Typography variant="body2" color="text.secondary">
                    <FormattedMessage id="worker-operational-job" />: {selectedWorker.operationalJobName}
                  </Typography>
                  <Divider />
                  {selectedWorker.currentWageProfile ? (
                    <Stack spacing={1}>
                      <Typography variant="body2" color="text.secondary">
                        <FormattedMessage id="worker-daily-wage" />: {formatMoney(intl.locale, selectedWorker.currentWageProfile.dailyWage)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        <FormattedMessage id="worker-monthly-days-basis" />: {selectedWorker.currentWageProfile.monthlyDaysBasis}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        <FormattedMessage id="overtime-calculation-type" />: <FormattedMessage id={`overtime-calculation-${selectedWorker.currentWageProfile.overtimeCalculationType}`} />
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        <FormattedMessage id="overtime-rate" />: {formatRate(intl.locale, selectedWorker.currentWageProfile.overtimeRate)}
                      </Typography>
                    </Stack>
                  ) : (
                    <Typography color="text.secondary">
                      <FormattedMessage id="worker-wage-empty" />
                    </Typography>
                  )}
                </Stack>
              ) : (
                <Typography color="text.secondary">
                  <FormattedMessage id="monthly-movement-worker-help" />
                </Typography>
              )}
            </MainCard>

            <MainCard>
              <SectionHeader icon={IconCalculator} titleId="monthly-movement-preview" />
              {previewLoading ? (
                <Typography color="text.secondary">
                  <FormattedMessage id="loading" />
                </Typography>
              ) : previewError ? (
                <Typography color="error">{previewError.message}</Typography>
              ) : preview ? (
                <Stack spacing={1.5}>
                  <Typography variant="h5">
                    <FormattedMessage id={getMovementTitleId(String(preview.movementType))} />
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    <FormattedMessage id="monthly-movement-preview-date" />: {preview.movementDate}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    <FormattedMessage id="monthly-movement-preview-quantity" />: {preview.quantity == null ? '-' : preview.quantity.toString()}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    <FormattedMessage id="monthly-movement-preview-unit-rate" />: {preview.unitRateSnapshot == null ? '-' : formatMoney(intl.locale, preview.unitRateSnapshot)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    <FormattedMessage id="monthly-movement-preview-amount" />: {formatMoney(intl.locale, preview.amount)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    <FormattedMessage id="monthly-movement-effect" />: <FormattedMessage id={getMovementEffectLabelId(String(preview.movementType))} />
                  </Typography>
                  <Divider />
                  <Typography variant="body2" color="text.secondary">
                    <FormattedMessage id="worker-daily-wage" />: {formatMoney(intl.locale, preview.dailyWageSnapshot)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    <FormattedMessage id="monthly-movement-base-hourly-rate" />: {formatRate(intl.locale, preview.baseHourlyRate)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    <FormattedMessage id="worker-monthly-days-basis" />: {preview.monthlyDaysBasisSnapshot}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    <FormattedMessage id="monthly-movement-standard-hours" />: {preview.standardHoursPerDaySnapshot}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    <FormattedMessage id="overtime-calculation-type" />: <FormattedMessage id={`overtime-calculation-${preview.overtimeCalculationTypeSnapshot}`} />
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    <FormattedMessage id="monthly-movement-effective-rate" />: {formatRate(intl.locale, preview.unitRateSnapshot ?? 0)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    <FormattedMessage id="monthly-movement-night-multiplier" />: {formatRate(intl.locale, preview.nightWorkMultiplierSnapshot)}
                  </Typography>
                </Stack>
              ) : (
                <Typography color="text.secondary">
                  <FormattedMessage id="monthly-movement-preview-empty" />
                </Typography>
              )}
            </MainCard>
          </Stack>
        </Grid>
      </Grid>

      <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
        <Stack direction="row" spacing={1.5} justifyContent="flex-end">
          <Button onClick={onCancel} disabled={isSaving} sx={{ color: 'primary.main', fontWeight: 600 }}>
            <FormattedMessage id="cancel" />
          </Button>
          {!readOnly && (
            <Button variant="contained" type="submit" disabled={isSaving} startIcon={<IconDeviceFloppy size={20} />} sx={{ px: 4 }}>
              <FormattedMessage id={isSaving ? 'loading' : 'save'} />
            </Button>
          )}
        </Stack>
      </Box>
    </Stack>
  );
}
