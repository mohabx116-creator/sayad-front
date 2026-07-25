import { useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { Link, useNavigate, useParams } from 'react-router-dom';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/GridLegacy';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { IconArrowLeft, IconEdit, IconToggleLeft, IconToggleRight, IconTrash } from '@tabler/icons-react';

import { useDispatch } from 'store';
import { openSnackbar } from 'store/slices/snackbar';
import PermissionGuard from 'modules/Administration/components/PermissionGuard';
import MainCard from 'ui-component/cards/MainCard';
import Breadcrumbs from 'ui-component/extended/Breadcrumbs';
import Loader from 'ui-component/Loader';
import { activateOperationalJob, deactivateOperationalJob, deleteOperationalJob } from '../api/operationalJobsApi';
import { useOperationalJob } from '../hooks/useOperationalJobs';
import { OPERATIONAL_JOBS_PERMISSIONS } from '../utils/operationalJobs.constants';

export default function OperationalJobDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const intl = useIntl();
  const dispatch = useDispatch();
  const [isSaving, setIsSaving] = useState(false);
  const { operationalJob, error, isLoading, mutate } = useOperationalJob(id);

  const notify = (message: string, severity: 'success' | 'error' = 'success') => {
    dispatch(openSnackbar({ open: true, message, variant: 'alert', severity }));
  };

  const refresh = async () => {
    await mutate();
  };

  const runAction = async (action: () => Promise<unknown>) => {
    try {
      setIsSaving(true);
      await action();
      await refresh();
      notify(intl.formatMessage({ id: 'operational-jobs-action-success' }));
    } catch (actionError) {
      notify(actionError instanceof Error ? actionError.message : intl.formatMessage({ id: 'operational-jobs-action-failed' }), 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!operationalJob || !window.confirm(intl.formatMessage({ id: 'operational-job-delete-confirm' }, { code: operationalJob.code }))) {
      return;
    }
    await runAction(async () => {
      await deleteOperationalJob(operationalJob.id, operationalJob.rowVersion);
      navigate('/labor/operational-jobs', { replace: true });
    });
  };

  if (isLoading) return <Loader />;
  if (error || !operationalJob) return <Typography color="error"><FormattedMessage id="operational-jobs-load-error" /></Typography>;

  return (
    <>
      <Breadcrumbs custom heading="operational-job-details" links={[{ title: 'labor', to: '/labor/workers' }, { title: 'operational-jobs', to: '/labor/operational-jobs' }, { title: 'operational-job-details' }]} />

      <Stack spacing={2}>
        <MainCard
          title={<FormattedMessage id="operational-job-details" />}
          secondary={
            <Stack direction="row" spacing={1} flexWrap="wrap">
              <Button component={Link} to="/labor/operational-jobs" variant="outlined" color="inherit" startIcon={<IconArrowLeft size={18} />}>
                <FormattedMessage id="back" />
              </Button>
              <PermissionGuard permission={OPERATIONAL_JOBS_PERMISSIONS.edit}>
                <Button component={Link} to={`/labor/operational-jobs/${operationalJob.id}/edit`} variant="outlined" startIcon={<IconEdit size={18} />}>
                  <FormattedMessage id="edit" />
                </Button>
              </PermissionGuard>
              <PermissionGuard permission={OPERATIONAL_JOBS_PERMISSIONS.changeStatus}>
                <Button
                  variant="contained"
                  color={operationalJob.isActive ? 'warning' : 'success'}
                  disabled={isSaving}
                  onClick={() => runAction(() => (operationalJob.isActive ? deactivateOperationalJob(operationalJob.id, operationalJob.rowVersion) : activateOperationalJob(operationalJob.id, operationalJob.rowVersion)))}
                  startIcon={operationalJob.isActive ? <IconToggleLeft size={18} /> : <IconToggleRight size={18} />}
                >
                  <FormattedMessage id={operationalJob.isActive ? 'deactivate' : 'activate'} />
                </Button>
              </PermissionGuard>
              <PermissionGuard permission={OPERATIONAL_JOBS_PERMISSIONS.delete}>
                <Button color="error" variant="outlined" disabled={isSaving} onClick={handleDelete} startIcon={<IconTrash size={18} />}>
                  <FormattedMessage id="delete" />
                </Button>
              </PermissionGuard>
            </Stack>
          }
        >
          <Grid container spacing={2.5}>
            <Grid item xs={12} md={4}>
              <Typography variant="body2" color="text.secondary"><FormattedMessage id="operational-job-code" /></Typography>
              <Typography variant="h5" dir="ltr">{operationalJob.code}</Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="body2" color="text.secondary"><FormattedMessage id="operational-job-name" /></Typography>
              <Typography variant="h5">{operationalJob.name}</Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="body2" color="text.secondary"><FormattedMessage id="status" /></Typography>
              <Typography variant="h5">{operationalJob.isActive ? <FormattedMessage id="active" /> : <FormattedMessage id="inactive" />}</Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="body2" color="text.secondary"><FormattedMessage id="operational-job-description" /></Typography>
              <Typography sx={{ whiteSpace: 'pre-wrap' }}>{operationalJob.description ?? '-'}</Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="body2" color="text.secondary"><FormattedMessage id="created-at" /></Typography>
              <Typography variant="h5">{new Date(operationalJob.createdAtUtc).toLocaleString()}</Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="body2" color="text.secondary"><FormattedMessage id="updated-at" /></Typography>
              <Typography variant="h5">{operationalJob.updatedAtUtc ? new Date(operationalJob.updatedAtUtc).toLocaleString() : '-'}</Typography>
            </Grid>
          </Grid>
        </MainCard>

        <MainCard title={<FormattedMessage id="operational-job-summary-card" />}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} flexWrap="wrap">
            <Chip label={`${intl.formatMessage({ id: 'operational-job-code' })}: ${operationalJob.code}`} variant="outlined" />
            <Chip label={`${intl.formatMessage({ id: 'status' })}: ${intl.formatMessage({ id: operationalJob.isActive ? 'active' : 'inactive' })}`} variant="outlined" />
          </Stack>
        </MainCard>
      </Stack>
    </>
  );
}
