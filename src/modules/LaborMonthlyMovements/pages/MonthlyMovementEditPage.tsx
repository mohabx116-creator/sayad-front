import { useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { Link, useNavigate, useParams } from 'react-router-dom';

import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { IconArrowLeft, IconPlayerPlay, IconThumbDown, IconTrash } from '@tabler/icons-react';

import { useDispatch } from 'store';
import { openSnackbar } from 'store/slices/snackbar';
import PermissionGuard from 'modules/Administration/components/PermissionGuard';
import MainCard from 'ui-component/cards/MainCard';
import Breadcrumbs from 'ui-component/extended/Breadcrumbs';
import Loader from 'ui-component/Loader';
import { useWorkers } from 'modules/Workers/hooks/useWorkers';
import { approveMonthlyMovement, deleteMonthlyMovement, rejectMonthlyMovement, updateMonthlyMovement } from '../api/monthlyMovementsApi';
import MonthlyMovementForm, { cleanUpdateMonthlyMovement, toMonthlyMovementFormValues } from '../components/MonthlyMovementForm';
import MonthlyMovementStatusChip from '../components/MonthlyMovementStatusChip';
import { useMonthlyMovement } from '../hooks/useMonthlyMovements';
import type { MonthlyMovementFormValues } from '../types/monthlyMovements.types';
import { MONTHLY_MOVEMENTS_PERMISSIONS } from '../utils/monthlyMovements.constants';

export default function MonthlyMovementEditPage() {
  const { id } = useParams();
  const intl = useIntl();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [isSaving, setIsSaving] = useState(false);
  const [isActioning, setIsActioning] = useState(false);
  const { movement, error, isLoading, mutate } = useMonthlyMovement(id);
  const { items: workers, isLoading: workersLoading } = useWorkers({ page: 1, pageSize: 100, sortBy: 'name', sortDirection: 'asc' });

  const notify = (message: string, severity: 'success' | 'error' = 'success') => {
    dispatch(openSnackbar({ open: true, message, variant: 'alert', severity }));
  };

  const save = async (values: MonthlyMovementFormValues) => {
    if (!id) return;
    try {
      setIsSaving(true);
      await updateMonthlyMovement(id, cleanUpdateMonthlyMovement(values));
      notify(intl.formatMessage({ id: 'monthly-movements-action-success' }));
      await mutate();
    } catch (saveError) {
      notify(saveError instanceof Error ? saveError.message : intl.formatMessage({ id: 'monthly-movements-action-failed' }), 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const runAction = async (action: () => Promise<unknown>) => {
    try {
      setIsActioning(true);
      await action();
      notify(intl.formatMessage({ id: 'monthly-movements-action-success' }));
      navigate('/labor/monthly-movements');
    } catch (actionError) {
      notify(actionError instanceof Error ? actionError.message : intl.formatMessage({ id: 'monthly-movements-action-failed' }), 'error');
    } finally {
      setIsActioning(false);
    }
  };

  const handleReject = async () => {
    if (!movement || !id) {
      return;
    }

    const reason = window.prompt(intl.formatMessage({ id: 'monthly-movement-reject-prompt' }, { code: movement.workerCode }));
    if (!reason?.trim()) {
      return;
    }

    await runAction(() => rejectMonthlyMovement(id, movement.rowVersion, reason.trim()));
  };

  const handleDelete = async () => {
    if (!movement || !id) {
      return;
    }

    if (!window.confirm(intl.formatMessage({ id: 'monthly-movement-delete-confirm' }, { code: movement.workerCode }))) {
      return;
    }

    await runAction(() => deleteMonthlyMovement(id, movement.rowVersion));
  };

  if (isLoading || workersLoading) {
    return <Loader />;
  }

  if (error || !movement) {
    return <Typography color="error"><FormattedMessage id="monthly-movements-load-error" /></Typography>;
  }

  const isDraft = movement.status === 1;

  return (
    <>
      <Breadcrumbs custom heading="edit-monthly-movement" links={[{ title: 'labor', to: '/labor/workers' }, { title: 'monthly-movements', to: '/labor/monthly-movements' }, { title: 'edit-monthly-movement' }]} />
      <MainCard
        title={<FormattedMessage id="edit-monthly-movement" />}
        secondary={
          <Stack direction="row" spacing={1} flexWrap="wrap">
            <Button component={Link} to="/labor/monthly-movements" variant="outlined" color="inherit" startIcon={<IconArrowLeft size={18} />}>
              <FormattedMessage id="back" />
            </Button>
            <MonthlyMovementStatusChip status={movement.status} label={movement.statusLabel} />
            {isDraft && (
              <PermissionGuard permission={MONTHLY_MOVEMENTS_PERMISSIONS.approve}>
                <Button
                  variant="contained"
                  color="success"
                  disabled={isSaving || isActioning}
                  onClick={() => runAction(() => approveMonthlyMovement(movement.id, movement.rowVersion))}
                  startIcon={<IconPlayerPlay size={18} />}
                >
                  <FormattedMessage id="approve" />
                </Button>
              </PermissionGuard>
            )}
            {isDraft && (
              <PermissionGuard permission={MONTHLY_MOVEMENTS_PERMISSIONS.reject}>
                <Button variant="outlined" color="warning" disabled={isSaving || isActioning} onClick={handleReject} startIcon={<IconThumbDown size={18} />}>
                  <FormattedMessage id="reject" />
                </Button>
              </PermissionGuard>
            )}
            {isDraft && (
              <PermissionGuard permission={MONTHLY_MOVEMENTS_PERMISSIONS.delete}>
                <Button color="error" variant="outlined" disabled={isSaving || isActioning} onClick={handleDelete} startIcon={<IconTrash size={18} />}>
                  <FormattedMessage id="delete" />
                </Button>
              </PermissionGuard>
            )}
          </Stack>
        }
      >
        <Typography sx={{ mb: 2 }} color="text.secondary">
          <FormattedMessage id={isDraft ? 'monthly-movement-form-help' : 'monthly-movement-readonly-help'} />
        </Typography>
        <MonthlyMovementForm
          mode="edit"
          initialValues={toMonthlyMovementFormValues(movement)}
          workers={workers}
          isSaving={isSaving}
          readOnly={!isDraft}
          onSubmit={save}
          onCancel={() => navigate('/labor/monthly-movements')}
        />
      </MainCard>
    </>
  );
}
