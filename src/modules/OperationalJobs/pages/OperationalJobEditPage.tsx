import { useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { useNavigate, useParams } from 'react-router-dom';

import Typography from '@mui/material/Typography';

import { useDispatch } from 'store';
import { openSnackbar } from 'store/slices/snackbar';
import MainCard from 'ui-component/cards/MainCard';
import Breadcrumbs from 'ui-component/extended/Breadcrumbs';
import Loader from 'ui-component/Loader';
import { updateOperationalJob } from '../api/operationalJobsApi';
import OperationalJobForm, { cleanUpdateOperationalJob, toOperationalJobFormValues, type OperationalJobFormValues } from '../components/OperationalJobForm';
import { useOperationalJob } from '../hooks/useOperationalJobs';

export default function OperationalJobEditPage() {
  const { id } = useParams();
  const intl = useIntl();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [isSaving, setIsSaving] = useState(false);
  const { operationalJob, error, isLoading } = useOperationalJob(id);

  const notify = (message: string, severity: 'success' | 'error' = 'success') => {
    dispatch(openSnackbar({ open: true, message, variant: 'alert', severity }));
  };

  const save = async (values: OperationalJobFormValues) => {
    if (!id) return;
    try {
      setIsSaving(true);
      await updateOperationalJob(id, cleanUpdateOperationalJob(values));
      notify(intl.formatMessage({ id: 'operational-jobs-action-success' }));
      navigate(`/labor/operational-jobs/${id}`);
    } catch (saveError) {
      notify(saveError instanceof Error ? saveError.message : intl.formatMessage({ id: 'operational-jobs-action-failed' }), 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <Breadcrumbs custom heading="edit-operational-job" links={[{ title: 'labor', to: '/labor/workers' }, { title: 'operational-jobs', to: '/labor/operational-jobs' }, { title: 'edit-operational-job' }]} />
      <MainCard title={<FormattedMessage id="edit-operational-job" />}>
        {isLoading && <Loader />}
        {error && <Typography color="error"><FormattedMessage id="operational-jobs-load-error" /></Typography>}
        {operationalJob && (
          <OperationalJobForm
            mode="edit"
            initialValues={toOperationalJobFormValues({
              code: operationalJob.code,
              name: operationalJob.name,
              description: operationalJob.description,
              isActive: operationalJob.isActive,
              rowVersion: operationalJob.rowVersion
            })}
            isSaving={isSaving}
            onSubmit={save}
            onCancel={() => navigate(id ? `/labor/operational-jobs/${id}` : '/labor/operational-jobs')}
          />
        )}
      </MainCard>
    </>
  );
}
