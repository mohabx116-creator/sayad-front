import { useMemo } from 'react';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import type { Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { FormattedMessage } from 'react-intl';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Grid from '@mui/material/GridLegacy';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { IconDeviceFloppy, IconPackage, IconUser } from '@tabler/icons-react';

import { createWorkerOperationSchema } from '../schemas/operation.schema';
import type { WorkerOperationWorkerOption } from '../types/operations.types';

export type OperationFormValues = {
  operationDate: string;
  workerId: string;
  completedQuantity: string;
  notes: string;
};

type OperationFormProps = {
  initialValues: OperationFormValues;
  workers: WorkerOperationWorkerOption[];
  isSaving?: boolean;
  onCancel: () => void;
  onSubmit: SubmitHandler<OperationFormValues>;
};

export const emptyOperationValues: OperationFormValues = {
  operationDate: new Date().toISOString().slice(0, 10),
  workerId: '',
  completedQuantity: '',
  notes: ''
};

export function cleanCreateOperation(values: OperationFormValues) {
  return {
    workerId: values.workerId,
    operationDate: values.operationDate,
    completedQuantity: Number(values.completedQuantity),
    notes: values.notes.trim() ? values.notes.trim() : null
  };
}

function operationResolver(): Resolver<OperationFormValues> {
  return zodResolver(createWorkerOperationSchema) as Resolver<OperationFormValues>;
}

export default function OperationForm({ initialValues, workers, isSaving = false, onCancel, onSubmit }: OperationFormProps) {
  const form = useForm<OperationFormValues>({
    resolver: operationResolver(),
    values: initialValues
  });

  const workerId = form.watch('workerId');
  const selectedWorker = useMemo(() => workers.find((worker) => worker.id === workerId) ?? null, [workers, workerId]);

  return (
    <Stack component="form" spacing={4} onSubmit={form.handleSubmit(onSubmit)}>
      <Box>
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
          <IconUser size={22} color="#1E88E5" stroke={1.5} />
          <Typography variant="h4" fontWeight={700}>
            <FormattedMessage id="operation-worker-section" />
          </Typography>
        </Stack>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Controller
              name="operationDate"
              control={form.control}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  fullWidth
                  required
                  type="date"
                  label={<FormattedMessage id="operation-date" />}
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                  InputLabelProps={{ shrink: true }}
                />
              )}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <Controller
              name="workerId"
              control={form.control}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  select
                  fullWidth
                  required
                  label={<FormattedMessage id="worker" />}
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                >
                  <MenuItem value="">
                    <FormattedMessage id="select-worker" />
                  </MenuItem>
                  {workers.map((worker) => (
                    <MenuItem key={worker.id} value={worker.id}>
                      {worker.code} - {worker.name}
                    </MenuItem>
                  ))}
                </TextField>
              )}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              value={selectedWorker ? `${selectedWorker.operationalJobCode} - ${selectedWorker.operationalJobName}` : ''}
              label={<FormattedMessage id="operation-operational-job" />}
              InputProps={{ readOnly: true }}
              helperText={<FormattedMessage id="operation-operational-job-helper" />}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <Controller
              name="completedQuantity"
              control={form.control}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  fullWidth
                  required
                  type="number"
                  label={<FormattedMessage id="completed-quantity" />}
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                  inputProps={{ min: 0, step: '0.001', dir: 'ltr', inputMode: 'decimal' }}
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
        </Grid>
      </Box>

      <Box>
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
          <IconPackage size={22} color="#1E88E5" stroke={1.5} />
          <Typography variant="h4" fontWeight={700}>
            <FormattedMessage id="operation-summary-section" />
          </Typography>
        </Stack>
        <Typography variant="body2" color="text.secondary">
          <FormattedMessage id="operation-form-help" />
        </Typography>
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
