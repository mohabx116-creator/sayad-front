import React, { useEffect, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { Link, useNavigate, useParams } from 'react-router-dom';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Grid from '@mui/material/GridLegacy';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { IconArrowLeft, IconDeviceFloppy } from '@tabler/icons-react';

import { useDispatch } from 'store';
import { openSnackbar } from 'store/slices/snackbar';
import MainCard from 'ui-component/cards/MainCard';
import Breadcrumbs from 'ui-component/extended/Breadcrumbs';
import Loader from 'ui-component/Loader';
import PageTitle from 'ui-component/PageTitle';
import { activateWorkCenter, createWorkCenter, updateWorkCenter } from '../api/workCentersApi';
import { useWorkCenter } from '../hooks/useManufacturing';
import type { CreateWorkCenterRequest, UpdateWorkCenterRequest } from '../types/manufacturing.types';

type WorkCenterFormState = {
  code: string;
  name: string;
  description: string;
  laborRatePerHour: string;
  machineRatePerHour: string;
  capacityMinutesPerDay: string;
  isActive: boolean;
};

const emptyForm: WorkCenterFormState = {
  code: '',
  name: '',
  description: '',
  laborRatePerHour: '0',
  machineRatePerHour: '0',
  capacityMinutesPerDay: '480',
  isActive: true
};

function toNumber(value: string) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

export default function WorkCenterFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const intl = useIntl();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { workCenter, isLoading } = useWorkCenter(id);
  const [form, setForm] = useState<WorkCenterFormState>(emptyForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!workCenter) return;
    setForm({
      code: workCenter.code,
      name: workCenter.name,
      description: workCenter.description ?? '',
      laborRatePerHour: String(workCenter.laborRatePerHour),
      machineRatePerHour: String(workCenter.machineRatePerHour),
      capacityMinutesPerDay: String(workCenter.capacityMinutesPerDay),
      isActive: workCenter.isActive
    });
  }, [workCenter]);

  const showSnackbar = (message: string, color: 'success' | 'error') => {
    dispatch(openSnackbar({ open: true, message, variant: 'alert', alert: { color } }));
  };

  const handleChange = (field: keyof WorkCenterFormState) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setForm((current) => ({ ...current, [field]: event.target.value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    try {
      if (isEdit && id && workCenter) {
        const request: UpdateWorkCenterRequest = {
          name: form.name.trim(),
          description: form.description.trim() || null,
          laborRatePerHour: toNumber(form.laborRatePerHour),
          machineRatePerHour: toNumber(form.machineRatePerHour),
          capacityMinutesPerDay: toNumber(form.capacityMinutesPerDay),
          rowVersion: workCenter.rowVersion
        };
        const updated = await updateWorkCenter(id, request);
        if (updated.isActive !== form.isActive) {
          await activateWorkCenter(id, { isActive: form.isActive, rowVersion: updated.rowVersion });
        }
        showSnackbar(intl.formatMessage({ id: 'work-center-updated', defaultMessage: 'Work center updated.' }), 'success');
      } else {
        const request: CreateWorkCenterRequest = {
          code: form.code.trim(),
          name: form.name.trim(),
          description: form.description.trim() || null,
          laborRatePerHour: toNumber(form.laborRatePerHour),
          machineRatePerHour: toNumber(form.machineRatePerHour),
          capacityMinutesPerDay: toNumber(form.capacityMinutesPerDay)
        };
        const created = await createWorkCenter(request);
        if (!form.isActive) {
          await activateWorkCenter(created.id, { isActive: false, rowVersion: created.rowVersion });
        }
        showSnackbar(intl.formatMessage({ id: 'work-center-created', defaultMessage: 'Work center created.' }), 'success');
      }
      navigate('/manufacturing/work-centers');
    } catch (error: any) {
      showSnackbar(error?.message || intl.formatMessage({ id: 'operation-failed', defaultMessage: 'Operation failed.' }), 'error');
    } finally {
      setSaving(false);
    }
  };

  if (isEdit && isLoading) return <Loader />;

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Breadcrumbs />
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mt: 1 }} flexWrap="wrap" gap={1}>
          <PageTitle>
            <FormattedMessage
              id={isEdit ? 'edit-work-center' : 'create-work-center'}
              defaultMessage={isEdit ? 'Edit Work Center' : 'Create Work Center'}
            />
          </PageTitle>
          <Button component={Link} to="/manufacturing/work-centers" variant="outlined" startIcon={<IconArrowLeft size={18} />}>
            <FormattedMessage id="back" defaultMessage="Back" />
          </Button>
        </Stack>
      </Box>

      <MainCard>
        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <TextField
                required
                fullWidth
                label={<FormattedMessage id="code" defaultMessage="Code" />}
                value={form.code}
                onChange={handleChange('code')}
                disabled={isEdit}
              />
            </Grid>
            <Grid item xs={12} md={8}>
              <TextField
                required
                fullWidth
                label={<FormattedMessage id="name" defaultMessage="Name" />}
                value={form.name}
                onChange={handleChange('name')}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                minRows={3}
                label={<FormattedMessage id="description" defaultMessage="Description" />}
                value={form.description}
                onChange={handleChange('description')}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                required
                fullWidth
                type="number"
                label={<FormattedMessage id="labor-rate" defaultMessage="Labor Rate" />}
                value={form.laborRatePerHour}
                onChange={handleChange('laborRatePerHour')}
                inputProps={{ min: 0, step: '0.01' }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                required
                fullWidth
                type="number"
                label={<FormattedMessage id="machine-rate" defaultMessage="Machine Rate" />}
                value={form.machineRatePerHour}
                onChange={handleChange('machineRatePerHour')}
                inputProps={{ min: 0, step: '0.01' }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                required
                fullWidth
                type="number"
                label={<FormattedMessage id="capacity-minutes-per-day" defaultMessage="Capacity Minutes / Day" />}
                value={form.capacityMinutesPerDay}
                onChange={handleChange('capacityMinutesPerDay')}
                inputProps={{ min: 0, step: 1 }}
              />
            </Grid>
            <Grid item xs={12}>
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Switch
                  checked={form.isActive}
                  onChange={(event) => setForm((current) => ({ ...current, isActive: event.target.checked }))}
                />
                <Typography variant="body1">
                  <FormattedMessage id="active" defaultMessage="Active" />
                </Typography>
              </Stack>
            </Grid>
            <Grid item xs={12}>
              <Stack direction="row" spacing={1} justifyContent="flex-end">
                <Button component={Link} to="/manufacturing/work-centers" disabled={saving}>
                  <FormattedMessage id="cancel" defaultMessage="Cancel" />
                </Button>
                <Button type="submit" variant="contained" color="secondary" startIcon={<IconDeviceFloppy size={18} />} disabled={saving}>
                  <FormattedMessage id="save" defaultMessage="Save" />
                </Button>
              </Stack>
            </Grid>
          </Grid>
        </Box>
      </MainCard>
    </Box>
  );
}
