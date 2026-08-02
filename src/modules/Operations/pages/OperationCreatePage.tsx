import { useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { useNavigate } from 'react-router-dom';

import Typography from '@mui/material/Typography';

import { useWorkers } from 'modules/Workers/hooks/useWorkers';
import MainCard from 'ui-component/cards/MainCard';
import Breadcrumbs from 'ui-component/extended/Breadcrumbs';
import Loader from 'ui-component/Loader';
import { useDispatch } from 'store';
import { openSnackbar } from 'store/slices/snackbar';
import { createOperation } from '../api/operationsApi';
import OperationForm, { cleanCreateOperation, emptyOperationValues, type OperationFormValues } from '../components/OperationForm';

export default function OperationCreatePage() {
  const intl = useIntl();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [isSaving, setIsSaving] = useState(false);
  const { items: workers, isLoading: workersLoading } = useWorkers({ page: 1, pageSize: 100, isActive: true, sortBy: 'code', sortDirection: 'asc' });

  const notify = (message: string, severity: 'success' | 'error' = 'success') => {
    dispatch(openSnackbar({ open: true, message, variant: 'alert', severity }));
  };

  const save = async (values: OperationFormValues) => {
    try {
      setIsSaving(true);
      const operation = await createOperation(cleanCreateOperation(values));
      notify(intl.formatMessage({ id: 'operation-action-success' }));
      navigate(`/labor/operations/${operation.id}`);
    } catch (error) {
      notify(error instanceof Error ? error.message : intl.formatMessage({ id: 'operation-action-failed' }), 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <Breadcrumbs custom heading="create-operation" links={[{ title: 'labor', to: '/labor/workers' }, { title: 'operations', to: '/labor/operations' }, { title: 'create-operation' }]} />
      <MainCard title={<FormattedMessage id="create-operation" />}>
        <Typography sx={{ mb: 2 }} color="text.secondary">
          <FormattedMessage id="operation-form-help" />
        </Typography>
        {workersLoading ? (
          <Loader />
        ) : (
          <OperationForm
            initialValues={emptyOperationValues}
            workers={workers}
            isSaving={isSaving}
            onSubmit={save}
            onCancel={() => navigate('/labor/operations')}
          />
        )}
      </MainCard>
    </>
  );
}
