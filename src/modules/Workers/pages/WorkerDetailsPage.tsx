import { useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { Link, useNavigate, useParams } from 'react-router-dom';

import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/GridLegacy';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import { IconArrowLeft, IconEdit, IconToggleLeft, IconToggleRight, IconTrash } from '@tabler/icons-react';

import { useDispatch } from 'store';
import { openSnackbar } from 'store/slices/snackbar';
import PermissionGuard from 'modules/Administration/components/PermissionGuard';
import MainCard from 'ui-component/cards/MainCard';
import Breadcrumbs from 'ui-component/extended/Breadcrumbs';
import Loader from 'ui-component/Loader';
import { activateWorker, deactivateWorker, deleteWorker } from '../api/workersApi';
import WorkerStatusChip from '../components/WorkerStatusChip';
import { useWorker, useWorkerWageProfiles } from '../hooks/useWorkers';
import { WORKERS_PERMISSIONS } from '../utils/workers.constants';

export default function WorkerDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const intl = useIntl();
  const dispatch = useDispatch();
  const [isSaving, setIsSaving] = useState(false);
  const { worker, error, isLoading, mutate: mutateWorker } = useWorker(id);
  const { items: wageProfiles, isLoading: wageLoading, mutate: mutateWageProfiles } = useWorkerWageProfiles(id);

  const notify = (message: string, severity: 'success' | 'error' = 'success') => {
    dispatch(openSnackbar({ open: true, message, variant: 'alert', severity }));
  };

  const refresh = async () => {
    await Promise.all([mutateWorker(), mutateWageProfiles()]);
  };

  const runAction = async (action: () => Promise<unknown>) => {
    try {
      setIsSaving(true);
      await action();
      await refresh();
      notify(intl.formatMessage({ id: 'workers-action-success' }));
    } catch (actionError) {
      notify(actionError instanceof Error ? actionError.message : intl.formatMessage({ id: 'workers-action-failed' }), 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!worker || !window.confirm(intl.formatMessage({ id: 'worker-delete-confirm' }, { code: worker.code }))) {
      return;
    }

    await runAction(async () => {
      await deleteWorker(worker.id, worker.rowVersion);
      navigate('/labor/workers', { replace: true });
    });
  };

  if (isLoading) {
    return <Loader />;
  }

  if (error || !worker) {
    return <Typography color="error"><FormattedMessage id="workers-load-error" /></Typography>;
  }

  const currentProfile = worker.currentWageProfile;

  return (
    <>
      <Breadcrumbs custom heading="worker-details" links={[{ title: 'labor', to: '/labor/workers' }, { title: 'workers', to: '/labor/workers' }, { title: 'worker-details' }]} />

      <Stack spacing={2}>
        <MainCard
          title={<FormattedMessage id="worker-details" />}
          secondary={
            <Stack direction="row" spacing={1} flexWrap="wrap">
              <Button component={Link} to="/labor/workers" variant="outlined" color="inherit" startIcon={<IconArrowLeft size={18} />}>
                <FormattedMessage id="back" />
              </Button>
              <PermissionGuard permission={WORKERS_PERMISSIONS.edit}>
                <Button component={Link} to={`/labor/workers/${worker.id}/edit`} variant="outlined" startIcon={<IconEdit size={18} />}>
                  <FormattedMessage id="edit" />
                </Button>
              </PermissionGuard>
              <PermissionGuard permission={WORKERS_PERMISSIONS.changeStatus}>
                <Button
                  variant="contained"
                  color={worker.isActive ? 'warning' : 'success'}
                  disabled={isSaving}
                  onClick={() => runAction(() => (worker.isActive ? deactivateWorker(worker.id, worker.rowVersion) : activateWorker(worker.id, worker.rowVersion)))}
                  startIcon={worker.isActive ? <IconToggleLeft size={18} /> : <IconToggleRight size={18} />}
                >
                  <FormattedMessage id={worker.isActive ? 'deactivate' : 'activate'} />
                </Button>
              </PermissionGuard>
              <PermissionGuard permission={WORKERS_PERMISSIONS.delete}>
                <Button color="error" variant="outlined" disabled={isSaving} onClick={handleDelete} startIcon={<IconTrash size={18} />}>
                  <FormattedMessage id="delete" />
                </Button>
              </PermissionGuard>
            </Stack>
          }
        >
          <Grid container spacing={2.5}>
            <Grid item xs={12} md={4}>
              <Typography variant="body2" color="text.secondary"><FormattedMessage id="worker-code" /></Typography>
              <Typography variant="h5" dir="ltr">{worker.code}</Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="body2" color="text.secondary"><FormattedMessage id="worker-name" /></Typography>
              <Typography variant="h5">{worker.name}</Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="body2" color="text.secondary"><FormattedMessage id="worker-operational-job" /></Typography>
              <Typography variant="h5">{worker.operationalJobName}</Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="body2" color="text.secondary"><FormattedMessage id="worker-mobile-number" /></Typography>
              <Typography variant="h5" dir="ltr">{worker.mobileNumber ?? '-'}</Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="body2" color="text.secondary"><FormattedMessage id="worker-address" /></Typography>
              <Typography variant="h5">{worker.address ?? '-'}</Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="body2" color="text.secondary"><FormattedMessage id="status" /></Typography>
              <WorkerStatusChip isActive={worker.isActive} />
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="body2" color="text.secondary"><FormattedMessage id="created-at" /></Typography>
              <Typography variant="h5">{new Date(worker.createdAtUtc).toLocaleString()}</Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="body2" color="text.secondary"><FormattedMessage id="updated-at" /></Typography>
              <Typography variant="h5">{worker.updatedAtUtc ? new Date(worker.updatedAtUtc).toLocaleString() : '-'}</Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="body2" color="text.secondary"><FormattedMessage id="notes" /></Typography>
              <Typography sx={{ whiteSpace: 'pre-wrap' }}>{worker.notes ?? '-'}</Typography>
            </Grid>
          </Grid>
        </MainCard>

        <MainCard title={<FormattedMessage id="worker-current-wage" />}>
          {currentProfile ? (
            <Grid container spacing={2.5}>
              <Grid item xs={12} md={4}>
                <Typography variant="body2" color="text.secondary"><FormattedMessage id="worker-wage-effective-from" /></Typography>
                <Typography variant="h5">{currentProfile.effectiveFrom}</Typography>
              </Grid>
              <Grid item xs={12} md={4}>
                <Typography variant="body2" color="text.secondary"><FormattedMessage id="worker-daily-wage" /></Typography>
                <Typography variant="h5" dir="ltr">{currentProfile.dailyWage.toFixed(2)}</Typography>
              </Grid>
              <Grid item xs={12} md={4}>
                <Typography variant="body2" color="text.secondary"><FormattedMessage id="worker-monthly-days-basis" /></Typography>
                <Typography variant="h5" dir="ltr">{currentProfile.monthlyDaysBasis}</Typography>
              </Grid>
              <Grid item xs={12} md={4}>
                <Typography variant="body2" color="text.secondary"><FormattedMessage id="meal-allowance-type" /></Typography>
                <Typography variant="h5">
                  <FormattedMessage id={`meal-allowance-${currentProfile.mealAllowanceType}`} />
                </Typography>
              </Grid>
              <Grid item xs={12} md={4}>
                <Typography variant="body2" color="text.secondary"><FormattedMessage id="meal-allowance-value" /></Typography>
                <Typography variant="h5" dir="ltr">{currentProfile.mealAllowanceValue.toFixed(2)}</Typography>
              </Grid>
              <Grid item xs={12} md={4}>
                <Typography variant="body2" color="text.secondary"><FormattedMessage id="overtime-calculation-type" /></Typography>
                <Typography variant="h5">
                  <FormattedMessage id={`overtime-calculation-${currentProfile.overtimeCalculationType}`} />
                </Typography>
              </Grid>
              <Grid item xs={12} md={4}>
                <Typography variant="body2" color="text.secondary"><FormattedMessage id="overtime-rate" /></Typography>
                <Typography variant="h5" dir="ltr">{currentProfile.overtimeRate.toFixed(4)}</Typography>
              </Grid>
              <Grid item xs={12} md={8}>
                <Typography variant="body2" color="text.secondary"><FormattedMessage id="worker-wage-notes" /></Typography>
                <Typography sx={{ whiteSpace: 'pre-wrap' }}>{currentProfile.notes ?? '-'}</Typography>
              </Grid>
            </Grid>
          ) : (
            <Typography color="text.secondary">
              <FormattedMessage id="worker-wage-empty" />
            </Typography>
          )}
        </MainCard>

        <MainCard title={<FormattedMessage id="worker-wage-history" />}>
          {wageLoading ? (
            <Loader />
          ) : wageProfiles.length === 0 ? (
            <Typography color="text.secondary">
              <FormattedMessage id="worker-wage-empty" />
            </Typography>
          ) : (
            <TableContainer>
              <Table>
                <TableHead sx={{ bgcolor: 'grey.50' }}>
                  <TableRow>
                    <TableCell><FormattedMessage id="worker-wage-effective-from" /></TableCell>
                    <TableCell><FormattedMessage id="worker-wage-effective-to" /></TableCell>
                    <TableCell><FormattedMessage id="worker-daily-wage" /></TableCell>
                    <TableCell><FormattedMessage id="meal-allowance-type" /></TableCell>
                    <TableCell><FormattedMessage id="overtime-calculation-type" /></TableCell>
                    <TableCell><FormattedMessage id="status" /></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {wageProfiles.map((profile) => (
                    <TableRow key={profile.id} hover>
                      <TableCell>{profile.effectiveFrom}</TableCell>
                      <TableCell>{profile.effectiveTo ?? '-'}</TableCell>
                      <TableCell dir="ltr">{profile.dailyWage.toFixed(2)}</TableCell>
                      <TableCell><FormattedMessage id={`meal-allowance-${profile.mealAllowanceType}`} /></TableCell>
                      <TableCell><FormattedMessage id={`overtime-calculation-${profile.overtimeCalculationType}`} /></TableCell>
                      <TableCell>{profile.isCurrent ? <FormattedMessage id="current-profile" /> : <FormattedMessage id="history" />}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </MainCard>

        <MainCard title={<FormattedMessage id="worker-summary-card" />}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} flexWrap="wrap">
            <Chip label={`${intl.formatMessage({ id: 'worker-code' })}: ${worker.code}`} variant="outlined" />
            <Chip label={`${intl.formatMessage({ id: 'worker-operational-job' })}: ${worker.operationalJobName}`} variant="outlined" />
            <Chip label={`${intl.formatMessage({ id: 'status' })}: ${intl.formatMessage({ id: worker.isActive ? 'active' : 'inactive' })}`} variant="outlined" />
          </Stack>
        </MainCard>
      </Stack>
    </>
  );
}
