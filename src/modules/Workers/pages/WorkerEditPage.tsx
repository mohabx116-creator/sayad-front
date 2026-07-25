import { useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { useNavigate, useParams } from 'react-router-dom';

import Typography from '@mui/material/Typography';

import { useDispatch } from 'store';
import { openSnackbar } from 'store/slices/snackbar';
import { useOperationalJobs } from 'modules/OperationalJobs/hooks/useOperationalJobs';
import MainCard from 'ui-component/cards/MainCard';
import Breadcrumbs from 'ui-component/extended/Breadcrumbs';
import Loader from 'ui-component/Loader';
import { updateWorker } from '../api/workersApi';
import WorkerForm, { cleanUpdateWorker, toWorkerFormValues, type WorkerFormValues } from '../components/WorkerForm';
import { useWorker } from '../hooks/useWorkers';

export default function WorkerEditPage() {
  const { id } = useParams();
  const intl = useIntl();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [isSaving, setIsSaving] = useState(false);
  const { worker, error, isLoading } = useWorker(id);
  const { items: operationalJobs, isLoading: jobsLoading } = useOperationalJobs({ page: 1, pageSize: 100, sortBy: 'name', sortDirection: 'asc' });

  const notify = (message: string, severity: 'success' | 'error' = 'success') => {
    dispatch(openSnackbar({ open: true, message, variant: 'alert', severity }));
  };

  const save = async (values: WorkerFormValues) => {
    if (!id) return;
    try {
      setIsSaving(true);
      await updateWorker(id, cleanUpdateWorker(values));
      notify(intl.formatMessage({ id: 'workers-action-success' }));
      navigate(`/labor/workers/${id}`);
    } catch (saveError) {
      notify(saveError instanceof Error ? saveError.message : intl.formatMessage({ id: 'workers-action-failed' }), 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <Breadcrumbs custom heading="edit-worker" links={[{ title: 'labor', to: '/labor/workers' }, { title: 'workers', to: '/labor/workers' }, { title: 'edit-worker' }]} />
      <MainCard title={<FormattedMessage id="edit-worker" />}>
        {(isLoading || jobsLoading) && <Loader />}
        {error && <Typography color="error"><FormattedMessage id="workers-load-error" /></Typography>}
        {worker && !jobsLoading && (
          <WorkerForm
            mode="edit"
            initialValues={toWorkerFormValues(worker)}
            operationalJobs={operationalJobs}
            isSaving={isSaving}
            onSubmit={save}
            onCancel={() => navigate(id ? `/labor/workers/${id}` : '/labor/workers')}
          />
        )}
      </MainCard>
    </>
  );
}
