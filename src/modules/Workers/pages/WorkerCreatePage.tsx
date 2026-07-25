import { useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { useNavigate } from 'react-router-dom';

import Typography from '@mui/material/Typography';

import { useDispatch } from 'store';
import { openSnackbar } from 'store/slices/snackbar';
import { useOperationalJobs } from 'modules/OperationalJobs/hooks/useOperationalJobs';
import MainCard from 'ui-component/cards/MainCard';
import Breadcrumbs from 'ui-component/extended/Breadcrumbs';
import Loader from 'ui-component/Loader';
import { createWorker } from '../api/workersApi';
import WorkerForm, { cleanCreateWorker, emptyWorkerValues, type WorkerFormValues } from '../components/WorkerForm';

export default function WorkerCreatePage() {
  const intl = useIntl();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [isSaving, setIsSaving] = useState(false);
  const { items: operationalJobs, isLoading: jobsLoading } = useOperationalJobs({ page: 1, pageSize: 100, sortBy: 'name', sortDirection: 'asc' });

  const notify = (message: string, severity: 'success' | 'error' = 'success') => {
    dispatch(openSnackbar({ open: true, message, variant: 'alert', severity }));
  };

  const save = async (values: WorkerFormValues) => {
    try {
      setIsSaving(true);
      const worker = await createWorker(cleanCreateWorker(values));
      notify(intl.formatMessage({ id: 'workers-action-success' }));
      navigate(`/labor/workers/${worker.id}`);
    } catch (error) {
      notify(error instanceof Error ? error.message : intl.formatMessage({ id: 'workers-action-failed' }), 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <Breadcrumbs custom heading="create-worker" links={[{ title: 'labor', to: '/labor/workers' }, { title: 'workers', to: '/labor/workers' }, { title: 'create-worker' }]} />
      <MainCard title={<FormattedMessage id="create-worker" />}>
        <Typography sx={{ mb: 2 }} color="text.secondary">
          <FormattedMessage id="worker-form-help" />
        </Typography>
        {jobsLoading ? <Loader /> : (
          <WorkerForm
            mode="create"
            initialValues={emptyWorkerValues}
            operationalJobs={operationalJobs}
            isSaving={isSaving}
            onSubmit={save}
            onCancel={() => navigate('/labor/workers')}
          />
        )}
      </MainCard>
    </>
  );
}
