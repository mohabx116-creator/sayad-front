import { useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { useNavigate } from 'react-router-dom';

import Typography from '@mui/material/Typography';

import { useDispatch } from 'store';
import { openSnackbar } from 'store/slices/snackbar';
import MainCard from 'ui-component/cards/MainCard';
import Breadcrumbs from 'ui-component/extended/Breadcrumbs';
import { createOperationalJob } from '../api/operationalJobsApi';
import OperationalJobForm, { cleanCreateOperationalJob, emptyOperationalJobValues, type OperationalJobFormValues } from '../components/OperationalJobForm';

export default function OperationalJobCreatePage() {
  const intl = useIntl();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [isSaving, setIsSaving] = useState(false);

  const notify = (message: string, severity: 'success' | 'error' = 'success') => {
    dispatch(openSnackbar({ open: true, message, variant: 'alert', severity }));
  };

  const save = async (values: OperationalJobFormValues) => {
    try {
      setIsSaving(true);
      const job = await createOperationalJob(cleanCreateOperationalJob(values));
      notify(intl.formatMessage({ id: 'operational-jobs-action-success' }));
      navigate(`/labor/operational-jobs/${job.id}`);
    } catch (error) {
      notify(error instanceof Error ? error.message : intl.formatMessage({ id: 'operational-jobs-action-failed' }), 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <Breadcrumbs custom heading="create-operational-job" links={[{ title: 'labor', to: '/labor/workers' }, { title: 'operational-jobs', to: '/labor/operational-jobs' }, { title: 'create-operational-job' }]} />
      <MainCard title={<FormattedMessage id="create-operational-job" />}>
        <Typography sx={{ mb: 2 }} color="text.secondary">
          <FormattedMessage id="operational-job-form-help" />
        </Typography>
        <OperationalJobForm mode="create" initialValues={emptyOperationalJobValues} isSaving={isSaving} onSubmit={save} onCancel={() => navigate('/labor/operational-jobs')} />
      </MainCard>
    </>
  );
}
