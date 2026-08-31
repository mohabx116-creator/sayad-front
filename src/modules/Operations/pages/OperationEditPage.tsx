import { useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { useNavigate, useParams } from 'react-router-dom';

import Typography from '@mui/material/Typography';

import { useWorkers } from 'modules/Workers/hooks/useWorkers';
import { useDispatch } from 'store';
import { openSnackbar } from 'store/slices/snackbar';
import MainCard from 'ui-component/cards/MainCard';
import Breadcrumbs from 'ui-component/extended/Breadcrumbs';
import Loader from 'ui-component/Loader';
import { updateOperation } from '../api/operationsApi';
import OperationForm, { cleanUpdateOperation, toOperationFormValues, type OperationFormValues } from '../components/OperationForm';
import { useOperation } from '../hooks/useOperations';

export default function OperationEditPage() {
  const { id } = useParams();
  const intl = useIntl();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [isSaving, setIsSaving] = useState(false);
  const { operation, error, isLoading } = useOperation(id);
  const { items: workers, isLoading: workersLoading } = useWorkers({ page: 1, pageSize: 100, isActive: true, sortBy: 'code', sortDirection: 'asc' });

  const notify = (message: string, severity: 'success' | 'error' = 'success') => {
    dispatch(openSnackbar({ open: true, message, variant: 'alert', severity }));
  };

  const save = async (values: OperationFormValues) => {
    if (!id || !operation) return;
    try {
      setIsSaving(true);
      await updateOperation(id, cleanUpdateOperation(values));
      notify(intl.formatMessage({ id: 'operation-action-success' }));
      navigate(`/labor/operations/${id}`);
    } catch (saveError) {
      notify(saveError instanceof Error ? saveError.message : intl.formatMessage({ id: 'operation-action-failed' }), 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <Breadcrumbs custom heading="edit-operation" links={[{ title: 'labor', to: '/labor/workers' }, { title: 'operations', to: '/labor/operations' }, { title: 'edit-operation' }]} />
      <MainCard title={<FormattedMessage id="edit-operation" />}>
        {isLoading && <Loader />}
        {error && <Typography color="error"><FormattedMessage id="operations-load-error" /></Typography>}
        {operation && (
          workersLoading ? (
            <Loader />
          ) : (
            <OperationForm
              initialValues={toOperationFormValues(operation)}
              workers={workers}
              isSaving={isSaving}
              onSubmit={save}
              onCancel={() => navigate(id ? `/labor/operations/${id}` : '/labor/operations')}
            />
          )
        )}
      </MainCard>
    </>
  );
}
