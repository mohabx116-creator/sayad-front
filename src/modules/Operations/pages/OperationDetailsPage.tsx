import { useState } from 'react';
import { useBrowserTitle } from 'shared/hooks/useBrowserTitle';
import { FormattedMessage, useIntl } from 'react-intl';
import { Link, useNavigate, useParams } from 'react-router-dom';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Grid from '@mui/material/GridLegacy';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { IconArrowLeft, IconEdit, IconFileText, IconTrash } from '@tabler/icons-react';

import PermissionGuard from 'modules/Administration/components/PermissionGuard';
import { useDispatch } from 'store';
import { openSnackbar } from 'store/slices/snackbar';
import MainCard from 'ui-component/cards/MainCard';
import Breadcrumbs from 'ui-component/extended/Breadcrumbs';
import Loader from 'ui-component/Loader';
import { deleteOperation } from '../api/operationsApi';
import { useOperation } from '../hooks/useOperations';
import { formatOperationDate, formatOperationDateTime } from '../utils/operations.format';
import { OPERATIONS_PERMISSIONS } from '../utils/operations.constants';

function DetailItem({ label, value }: { label: React.ReactNode; value: React.ReactNode }) {
  return (
    <Box sx={{ mb: 2 }}>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
        {label}
      </Typography>
      <Typography variant="body1" fontWeight={500}>
        {value || '-'}
      </Typography>
    </Box>
  );
}

export default function OperationDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const intl = useIntl();
  const dispatch = useDispatch();
  const [isSaving, setIsSaving] = useState(false);
  const { operation, isLoading, error, mutate } = useOperation(id);
  useBrowserTitle(operation ? [`${operation.operationalJobName} - ${operation.workerName}`] : []);

  const notify = (message: string, severity: 'success' | 'error' = 'success') => {
    dispatch(openSnackbar({ open: true, message, variant: 'alert', severity }));
  };

  const runAction = async (action: () => Promise<unknown>, refresh = true) => {
    try {
      setIsSaving(true);
      await action();
      if (refresh) {
        await mutate();
      }
      notify(intl.formatMessage({ id: 'operation-action-success' }));
    } catch (actionError) {
      notify(actionError instanceof Error ? actionError.message : intl.formatMessage({ id: 'operation-action-failed' }), 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!operation || !window.confirm(intl.formatMessage({ id: 'operation-delete-confirm' }, { code: operation.workerCode }))) {
      return;
    }

    await runAction(async () => {
      await deleteOperation(operation.id, operation.rowVersion);
      navigate('/labor/operations', { replace: true });
    }, false);
  };

  if (isLoading) {
    return <Loader />;
  }

  if (error || !operation) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography color="error" variant="h5">
          <FormattedMessage id="error-loading-data" defaultMessage="Failed to load data" />
        </Typography>
        <Box sx={{ mt: 3 }}>
          <Link to="/labor/operations" style={{ textDecoration: 'none' }}>
            <FormattedMessage id="back-to-list" defaultMessage="Back to list" />
          </Link>
        </Box>
      </Box>
    );
  }

  return (
    <>
      <Breadcrumbs custom heading="operation-details" links={[{ title: 'labor', to: '/labor/workers' }, { title: 'operations', to: '/labor/operations' }, { title: operation.workerCode }]} />

      <Stack spacing={2}>
        <MainCard
          title={<FormattedMessage id="operation-details" />}
          secondary={
            <Stack direction="row" spacing={1} flexWrap="wrap">
              <Button component={Link} to="/labor/operations" variant="outlined" color="inherit" startIcon={<IconArrowLeft size={18} />}>
                <FormattedMessage id="back" />
              </Button>
              <PermissionGuard permission={OPERATIONS_PERMISSIONS.edit}>
                <Button component={Link} to={`/labor/operations/${operation.id}/edit`} variant="outlined" startIcon={<IconEdit size={18} />}>
                  <FormattedMessage id="edit" />
                </Button>
              </PermissionGuard>
              <PermissionGuard permission={OPERATIONS_PERMISSIONS.delete}>
                <Button color="error" variant="outlined" disabled={isSaving} onClick={handleDelete} startIcon={<IconTrash size={18} />}>
                  <FormattedMessage id="delete" />
                </Button>
              </PermissionGuard>
            </Stack>
          }
        >
          <Grid container spacing={2.5}>
            <Grid item xs={12} md={4}>
              <DetailItem label={<FormattedMessage id="operation-date" />} value={formatOperationDate(intl.locale, operation.operationDate)} />
            </Grid>
            <Grid item xs={12} md={4}>
              <DetailItem label={<FormattedMessage id="worker" />} value={`${operation.workerCode} - ${operation.workerName}`} />
            </Grid>
            <Grid item xs={12} md={4}>
              <DetailItem label={<FormattedMessage id="operation-operational-job" />} value={`${operation.operationalJobCode} - ${operation.operationalJobName}`} />
            </Grid>
            <Grid item xs={12} md={4}>
              <DetailItem label={<FormattedMessage id="completed-quantity" />} value={operation.completedQuantity.toFixed(3)} />
            </Grid>
            <Grid item xs={12} md={4}>
              <DetailItem label={<FormattedMessage id="created-at" />} value={formatOperationDateTime(intl.locale, operation.createdAtUtc)} />
            </Grid>
            <Grid item xs={12} md={4}>
              <DetailItem label={<FormattedMessage id="updated-at" />} value={formatOperationDateTime(intl.locale, operation.updatedAtUtc)} />
            </Grid>
            <Grid item xs={12}>
              <DetailItem label={<FormattedMessage id="notes" />} value={operation.notes} />
            </Grid>
          </Grid>
        </MainCard>

        <MainCard title={<FormattedMessage id="operation-summary-section" />}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} flexWrap="wrap">
            <Button variant="outlined" startIcon={<IconFileText size={18} />}>
              <FormattedMessage id="operation-worker-section" />
            </Button>
          </Stack>
        </MainCard>
      </Stack>
    </>
  );
}
