import { useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { useNavigate } from 'react-router-dom';

import Typography from '@mui/material/Typography';

import { useDispatch } from 'store';
import { openSnackbar } from 'store/slices/snackbar';
import MainCard from 'ui-component/cards/MainCard';
import Breadcrumbs from 'ui-component/extended/Breadcrumbs';
import Loader from 'ui-component/Loader';
import { useWorkers } from 'modules/Workers/hooks/useWorkers';
import { createMonthlyMovement } from '../api/monthlyMovementsApi';
import MonthlyMovementForm, { cleanCreateMonthlyMovement, emptyMonthlyMovementValues } from '../components/MonthlyMovementForm';
import type { MonthlyMovementFormValues } from '../types/monthlyMovements.types';

export default function MonthlyMovementCreatePage() {
  const intl = useIntl();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [isSaving, setIsSaving] = useState(false);
  const { items: workers, isLoading: workersLoading } = useWorkers({ page: 1, pageSize: 100, sortBy: 'name', sortDirection: 'asc' });

  const notify = (message: string, severity: 'success' | 'error' = 'success') => {
    dispatch(openSnackbar({ open: true, message, variant: 'alert', severity }));
  };

  const save = async (values: MonthlyMovementFormValues) => {
    try {
      setIsSaving(true);
      await createMonthlyMovement(cleanCreateMonthlyMovement(values));
      notify(intl.formatMessage({ id: 'monthly-movements-action-success' }));
      navigate('/labor/monthly-movements');
    } catch (error) {
      notify(error instanceof Error ? error.message : intl.formatMessage({ id: 'monthly-movements-action-failed' }), 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <Breadcrumbs custom heading="create-monthly-movement" links={[{ title: 'labor', to: '/labor/workers' }, { title: 'monthly-movements', to: '/labor/monthly-movements' }, { title: 'create-monthly-movement' }]} />
      <MainCard title={<FormattedMessage id="create-monthly-movement" />}>
        <Typography sx={{ mb: 2 }} color="text.secondary">
          <FormattedMessage id="monthly-movement-form-help" />
        </Typography>
        {workersLoading ? <Loader /> : (
          <MonthlyMovementForm
            mode="create"
            initialValues={emptyMonthlyMovementValues}
            workers={workers}
            isSaving={isSaving}
            onSubmit={save}
            onCancel={() => navigate('/labor/monthly-movements')}
          />
        )}
      </MainCard>
    </>
  );
}
