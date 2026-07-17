import { FormattedMessage } from 'react-intl';

import Chip from '@mui/material/Chip';
import Grid from '@mui/material/GridLegacy';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import Breadcrumbs from 'ui-component/extended/Breadcrumbs';
import Loader from 'ui-component/Loader';
import MainCard from 'ui-component/cards/MainCard';
import { useSystemMaintenance } from '../hooks/useSystem';

export default function SystemMaintenancePage() {
  const { maintenance, isLoading, error } = useSystemMaintenance();

  if (isLoading) return <Loader />;

  return (
    <>
      <Breadcrumbs custom heading="system-maintenance" links={[{ title: 'system-administration' }, { title: 'system-maintenance' }]} />
      {error && (
        <MainCard sx={{ mb: 2 }}>
          <Typography color="error">
            <FormattedMessage id="administration-load-error" />
          </Typography>
        </MainCard>
      )}

      {maintenance && (
        <Stack spacing={3}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <MainCard title={<FormattedMessage id="application-database-status" />}>
                <Stack spacing={1}>
                  <Typography variant="body2">
                    <FormattedMessage id="database-provider" />: {maintenance.infrastructureStatus.providerName}
                  </Typography>
                  <Typography variant="body2">
                    <FormattedMessage id="database-connectivity" />: {maintenance.infrastructureStatus.canConnect ? <FormattedMessage id="online" /> : <FormattedMessage id="offline" />}
                  </Typography>
                  <Typography variant="body2">
                    <FormattedMessage id="pending-migrations" />: {maintenance.infrastructureStatus.pendingMigrationsCount}
                  </Typography>
                </Stack>
              </MainCard>
            </Grid>
            <Grid item xs={12} md={8}>
              <MainCard title={<FormattedMessage id="maintenance-checks" />}>
                <Stack spacing={2}>
                  {maintenance.checks.map((check) => (
                    <MainCard key={check.code} contentSX={{ p: 2 }} sx={{ border: 1, borderColor: 'divider' }}>
                      <Stack spacing={1}>
                        <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
                          <Typography variant="h5">{check.title}</Typography>
                          <Chip color={check.isHealthy ? 'success' : 'error'} label={check.isHealthy ? <FormattedMessage id="healthy" /> : <FormattedMessage id="issues-found" />} />
                        </Stack>
                        <Typography variant="body2" color="text.secondary">
                          {check.description}
                        </Typography>
                        <Typography variant="body2">
                          <FormattedMessage id="issue-count" />: {check.issueCount}
                        </Typography>
                        {check.issues.length > 0 && (
                          <Stack spacing={0.5}>
                            {check.issues.map((issue) => (
                              <Typography key={issue} variant="body2" color="error">
                                {issue}
                              </Typography>
                            ))}
                          </Stack>
                        )}
                      </Stack>
                    </MainCard>
                  ))}
                </Stack>
              </MainCard>
            </Grid>
          </Grid>
        </Stack>
      )}
    </>
  );
}
