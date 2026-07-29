import { useEffect, useMemo, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { Link, useParams, useSearchParams } from 'react-router-dom';

import Button from '@mui/material/Button';
import Grid from '@mui/material/GridLegacy';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import { IconArrowLeft, IconCoins, IconEdit, IconEye, IconPlus, IconToggleLeft, IconToggleRight } from '@tabler/icons-react';

import { useDispatch } from 'store';
import { openSnackbar } from 'store/slices/snackbar';
import PermissionGuard from 'modules/Administration/components/PermissionGuard';
import MainCard from 'ui-component/cards/MainCard';
import Breadcrumbs from 'ui-component/extended/Breadcrumbs';
import Loader from 'ui-component/Loader';
import { activateWorker, deactivateWorker } from '../api/workersApi';
import WorkerMonthlySalaryDialog from '../components/WorkerMonthlySalaryDialog';
import WorkerStatusChip from '../components/WorkerStatusChip';
import { useWorker, useWorkerMonthlySalaries, useWorkerSalarySettings } from '../hooks/useWorkers';
import { WORKERS_PERMISSIONS } from '../utils/workers.constants';

export default function WorkerDetailsPage() {
  const { id } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const intl = useIntl();
  const dispatch = useDispatch();
  const [isSaving, setIsSaving] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [viewSalaryId, setViewSalaryId] = useState<string | null>(null);
  const { worker, error, isLoading, mutate: mutateWorker } = useWorker(id);
  const { settings: salarySettings, mutate: mutateSalarySettings } = useWorkerSalarySettings(id);
  const { items: monthlySalaries, mutate: mutateMonthlySalaries } = useWorkerMonthlySalaries(id);

  useEffect(() => {
    if (searchParams.get('salary') === 'create') {
      setCreateDialogOpen(true);
    }
  }, [searchParams]);

  const currentSalarySettings = useMemo(() => {
    if (!worker) {
      return salarySettings;
    }

    if (salarySettings) {
      return salarySettings;
    }

    return worker.currentWageProfile
      ? {
          workerId: worker.id,
          workerCode: worker.code,
          workerName: worker.name,
          operationalJobId: worker.operationalJobId,
          operationalJobName: worker.operationalJobName,
          dailyWage: worker.currentWageProfile.dailyWage,
          mealAllowance: worker.currentWageProfile.mealAllowanceValue,
          expectedMonthlySalary: worker.currentWageProfile.dailyWage * 30,
          effectiveFrom: worker.currentWageProfile.effectiveFrom,
          updatedAtUtc: worker.currentWageProfile.updatedAtUtc,
          rowVersion: worker.currentWageProfile.rowVersion
        }
      : null;
  }, [salarySettings, worker]);

  const notify = (message: string, severity: 'success' | 'error' = 'success') => {
    dispatch(openSnackbar({ open: true, message, variant: 'alert', severity }));
  };

  const refreshAll = async () => {
    await Promise.all([mutateWorker(), mutateSalarySettings(), mutateMonthlySalaries()]);
  };

  const runAction = async (action: () => Promise<unknown>) => {
    try {
      setIsSaving(true);
      await action();
      await refreshAll();
      notify(intl.formatMessage({ id: 'workers-action-success' }));
    } catch (actionError) {
      notify(actionError instanceof Error ? actionError.message : intl.formatMessage({ id: 'workers-action-failed' }), 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const closeCreateDialog = () => {
    setCreateDialogOpen(false);
    setSearchParams((current) => {
      const next = new URLSearchParams(current);
      next.delete('salary');
      return next;
    }, { replace: true });
  };

  if (isLoading) {
    return <Loader />;
  }

  if (error || !worker) {
    return <Typography color="error"><FormattedMessage id="workers-load-error" /></Typography>;
  }

  const expectedMonthlySalary = currentSalarySettings ? currentSalarySettings.expectedMonthlySalary : 0;

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
              <PermissionGuard permission={WORKERS_PERMISSIONS.edit}>
                <Button
                  variant="contained"
                  startIcon={<IconCoins size={18} />}
                  disabled={!currentSalarySettings}
                  onClick={() => setCreateDialogOpen(true)}
                >
                  <FormattedMessage id="monthly-salary" />
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
          {currentSalarySettings ? (
            <Grid container spacing={2.5}>
              <Grid item xs={12} md={4}>
                <Typography variant="body2" color="text.secondary"><FormattedMessage id="worker-daily-wage" /></Typography>
                <Typography variant="h5" dir="ltr">{currentSalarySettings.dailyWage.toFixed(2)}</Typography>
              </Grid>
              <Grid item xs={12} md={4}>
                <Typography variant="body2" color="text.secondary"><FormattedMessage id="worker-meal-allowance" /></Typography>
                <Typography variant="h5" dir="ltr">{currentSalarySettings.mealAllowance.toFixed(2)}</Typography>
              </Grid>
              <Grid item xs={12} md={4}>
                <Typography variant="body2" color="text.secondary"><FormattedMessage id="expected-monthly-salary" /></Typography>
                <Typography variant="h5" dir="ltr">{expectedMonthlySalary.toFixed(2)}</Typography>
              </Grid>
            </Grid>
          ) : (
            <Typography color="text.secondary">
              <FormattedMessage id="worker-wage-empty" />
            </Typography>
          )}
        </MainCard>

        <MainCard
          title={<FormattedMessage id="monthly-salary-history" />}
          secondary={
            <Button variant="outlined" startIcon={<IconPlus size={18} />} onClick={() => setCreateDialogOpen(true)}>
              <FormattedMessage id="monthly-salary" />
            </Button>
          }
        >
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell><FormattedMessage id="month" /></TableCell>
                <TableCell><FormattedMessage id="payroll-basic-wage" /></TableCell>
                <TableCell><FormattedMessage id="total-additions" /></TableCell>
                <TableCell><FormattedMessage id="payroll-total-deductions" /></TableCell>
                <TableCell><FormattedMessage id="net-salary" /></TableCell>
                <TableCell align="center"><FormattedMessage id="actions" /></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {monthlySalaries.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6}>
                    <Typography color="text.secondary">
                      <FormattedMessage id="worker-wage-empty" />
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : monthlySalaries.map((salary) => (
                <TableRow key={salary.id}>
                  <TableCell>{salary.monthLabel}</TableCell>
                  <TableCell dir="ltr">{salary.baseSalary.toFixed(2)}</TableCell>
                  <TableCell dir="ltr">{salary.additions.toFixed(2)}</TableCell>
                  <TableCell dir="ltr">{salary.deductions.toFixed(2)}</TableCell>
                  <TableCell dir="ltr">{salary.netSalary.toFixed(2)}</TableCell>
                  <TableCell align="center">
                    <IconButton onClick={() => setViewSalaryId(salary.id)} size="small" aria-label={intl.formatMessage({ id: 'view' })}>
                      <IconEye size={18} />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </MainCard>

      </Stack>

      {currentSalarySettings && (
        <WorkerMonthlySalaryDialog
          open={createDialogOpen}
          mode="create"
          workerId={worker.id}
          salarySettings={currentSalarySettings}
          onClose={closeCreateDialog}
          onSaved={async () => {
            await mutateMonthlySalaries();
          }}
        />
      )}

      {viewSalaryId && (
        <WorkerMonthlySalaryDialog
          open
          mode="view"
          workerId={worker.id}
          monthlySalaryId={viewSalaryId}
          onClose={() => setViewSalaryId(null)}
        />
      )}
    </>
  );
}
