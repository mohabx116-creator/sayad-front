import { useEffect } from 'react';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import type { Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { FormattedMessage } from 'react-intl';

import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import FormControlLabel from '@mui/material/FormControlLabel';
import Grid from '@mui/material/GridLegacy';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import TextField from '@mui/material/TextField';
import { IconDeviceFloppy } from '@tabler/icons-react';

import { createOperationalJobSchema, updateOperationalJobSchema } from '../schemas/operationalJob.schema';
import type { OperationalJobRequest, UpdateOperationalJobRequest } from '../types/operationalJobs.types';

export type OperationalJobFormValues = {
  code: string;
  name: string;
  description: string;
  isActive: boolean;
  rowVersion?: string;
};

type OperationalJobFormProps = {
  mode: 'create' | 'edit';
  initialValues: OperationalJobFormValues;
  isSaving?: boolean;
  onCancel: () => void;
  onSubmit: SubmitHandler<OperationalJobFormValues>;
};

export const emptyOperationalJobValues: OperationalJobFormValues = {
  code: '',
  name: '',
  description: '',
  isActive: true
};

export function toOperationalJobFormValues(job: UpdateOperationalJobRequest): OperationalJobFormValues {
  return {
    code: job.code,
    name: job.name,
    description: job.description ?? '',
    isActive: job.isActive,
    rowVersion: job.rowVersion
  };
}

export function cleanCreateOperationalJob(values: OperationalJobFormValues): OperationalJobRequest {
  return {
    code: values.code.trim() || null,
    name: values.name.trim(),
    description: values.description.trim() || null,
    isActive: values.isActive
  };
}

export function cleanUpdateOperationalJob(values: OperationalJobFormValues): UpdateOperationalJobRequest {
  return {
    code: values.code.trim(),
    name: values.name.trim(),
    description: values.description.trim() || null,
    isActive: values.isActive,
    rowVersion: values.rowVersion ?? ''
  };
}

function resolver(mode: 'create' | 'edit'): Resolver<OperationalJobFormValues> {
  return zodResolver(mode === 'create' ? createOperationalJobSchema : updateOperationalJobSchema) as Resolver<OperationalJobFormValues>;
}

export default function OperationalJobForm({ mode, initialValues, isSaving = false, onCancel, onSubmit }: OperationalJobFormProps) {
  const form = useForm<OperationalJobFormValues>({
    resolver: resolver(mode),
    values: initialValues
  });

  useEffect(() => {
    form.reset(initialValues);
  }, [form, initialValues]);

  return (
    <Stack component="form" spacing={3} onSubmit={form.handleSubmit(onSubmit)}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Controller
            name="code"
            control={form.control}
            render={({ field, fieldState }) => (
              <TextField
                {...field}
                fullWidth
                label={<FormattedMessage id="operational-job-code" />}
                error={!!fieldState.error}
                helperText={fieldState.error?.message ?? <FormattedMessage id="operational-job-code-help" />}
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
                label={<FormattedMessage id="operational-job-name" />}
                error={!!fieldState.error}
                helperText={fieldState.error?.message}
              />
            )}
          />
        </Grid>
        <Grid item xs={12}>
          <Controller
            name="description"
            control={form.control}
            render={({ field, fieldState }) => (
              <TextField
                {...field}
                value={field.value ?? ''}
                fullWidth
                multiline
                minRows={3}
                label={<FormattedMessage id="operational-job-description" />}
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

      <Divider />

      <Stack direction="row" spacing={2} justifyContent="flex-end">
        <Button onClick={onCancel} disabled={isSaving}>
          <FormattedMessage id="cancel" />
        </Button>
        <Button variant="contained" type="submit" disabled={isSaving} startIcon={<IconDeviceFloppy size={18} />}>
          <FormattedMessage id={isSaving ? 'loading' : 'save'} />
        </Button>
      </Stack>
    </Stack>
  );
}
