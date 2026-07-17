import type { ElementType } from 'react';

import Grid from '@mui/material/GridLegacy';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import { IconShieldLock, IconUsers, IconKey, IconAlertTriangle } from '@tabler/icons-react';
import { FormattedMessage } from 'react-intl';

import Breadcrumbs from 'ui-component/extended/Breadcrumbs';
import Loader from 'ui-component/Loader';
import MainCard from 'ui-component/cards/MainCard';
import { useSystemDashboard } from '../hooks/useSystem';

function MetricCard({ title, value, icon: Icon, color }: { title: string; value: string | number; icon: ElementType; color: string }) {
  return (
    <MainCard contentSX={{ p: 2.5 }}>
      <Stack direction="row" alignItems="center" spacing={2}>
        <Chip
          icon={<Icon size={18} />}
          label={value}
          sx={{
            bgcolor: `${color}.lighter`,
            color: `${color}.dark`,
            fontWeight: 700,
            '& .MuiChip-icon': { color: 'inherit' }
          }}
        />
        <Stack>
          <Typography variant="body2" color="text.secondary">
            <FormattedMessage id={title} />
          </Typography>
        </Stack>
      </Stack>
    </MainCard>
  );
}

export default function SystemDashboardPage() {
  const { dashboard, isLoading, error } = useSystemDashboard();

  if (isLoading) {
    return <Loader />;
  }

  return (
    <>
      <Breadcrumbs custom heading="system-administration" links={[{ title: 'system-administration' }]} />
      {error && (
        <MainCard sx={{ mb: 2 }}>
          <Typography color="error">
            <FormattedMessage id="administration-load-error" />
          </Typography>
        </MainCard>
      )}

      {dashboard && (
        <Stack spacing={3}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <MainCard title={<FormattedMessage id="current-system-owner" />}>
                <Stack spacing={1.25}>
                  <Typography variant="h4">{dashboard.owner.displayName}</Typography>
                  <Typography color="text.secondary">{dashboard.owner.email}</Typography>
                  <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                    <Chip color={dashboard.ownerIntegrity.isHealthy ? 'success' : 'warning'} label={<FormattedMessage id={dashboard.ownerIntegrity.isHealthy ? 'integrity-healthy' : 'integrity-warning'} />} />
                    <Chip color={dashboard.owner.isActive ? 'success' : 'default'} label={<FormattedMessage id={dashboard.owner.isActive ? 'active' : 'inactive'} />} />
                    <Chip color={dashboard.owner.isLocked ? 'error' : 'success'} label={<FormattedMessage id={dashboard.owner.isLocked ? 'locked' : 'unlocked'} />} />
                  </Stack>
                </Stack>
              </MainCard>
            </Grid>
            <Grid item xs={12} md={6}>
              <MainCard title={<FormattedMessage id="owner-integrity-status" />}>
                <Stack spacing={1}>
                  <Typography variant="body1">
                    <FormattedMessage id="owner-count" />: {dashboard.ownerIntegrity.ownerCount}
                  </Typography>
                  <Typography variant="body1">
                    <FormattedMessage id="owner-has-system-role" />: {dashboard.ownerIntegrity.ownerHasSystemAdministratorRole ? <FormattedMessage id="yes" /> : <FormattedMessage id="no" />}
                  </Typography>
                  {dashboard.ownerIntegrity.issues.length > 0 ? (
                    <Stack spacing={0.5}>
                      {dashboard.ownerIntegrity.issues.map((issue) => (
                        <Typography key={issue} color="error" variant="body2">
                          {issue}
                        </Typography>
                      ))}
                    </Stack>
                  ) : (
                    <Typography color="success.main" variant="body2">
                      <FormattedMessage id="owner-integrity-clean" />
                    </Typography>
                  )}
                </Stack>
              </MainCard>
            </Grid>
          </Grid>

          <Grid container spacing={2}>
            <Grid item xs={12} md={3}>
              <MetricCard title="active-users-count" value={dashboard.activeUsersCount} icon={IconUsers} color="primary" />
            </Grid>
            <Grid item xs={12} md={3}>
              <MetricCard title="inactive-locked-users-count" value={dashboard.inactiveOrLockedUsersCount} icon={IconAlertTriangle} color="warning" />
            </Grid>
            <Grid item xs={12} md={3}>
              <MetricCard title="roles-count" value={dashboard.rolesCount} icon={IconKey} color="secondary" />
            </Grid>
            <Grid item xs={12} md={3}>
              <MetricCard title="registered-permissions-count" value={dashboard.permissionsCount} icon={IconShieldLock} color="info" />
            </Grid>
          </Grid>

          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <MainCard title={<FormattedMessage id="application-database-status" />}>
                <Stack spacing={1}>
                  <Typography variant="body2">
                    <FormattedMessage id="database-provider" />: {dashboard.infrastructureStatus.providerName}
                  </Typography>
                  <Typography variant="body2">
                    <FormattedMessage id="database-connectivity" />: {dashboard.infrastructureStatus.canConnect ? <FormattedMessage id="online" /> : <FormattedMessage id="offline" />}
                  </Typography>
                  <Typography variant="body2">
                    <FormattedMessage id="pending-migrations" />: {dashboard.infrastructureStatus.pendingMigrationsCount}
                  </Typography>
                </Stack>
              </MainCard>
            </Grid>
            <Grid item xs={12} md={8}>
              <MainCard title={<FormattedMessage id="latest-privileged-operations" />}>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell><FormattedMessage id="date" /></TableCell>
                        <TableCell><FormattedMessage id="actor" /></TableCell>
                        <TableCell><FormattedMessage id="action" /></TableCell>
                        <TableCell><FormattedMessage id="entity" /></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {dashboard.latestPrivilegedOperations.map((operation) => (
                        <TableRow key={`${operation.createdAtUtc}-${operation.action}-${operation.entityName}`}>
                          <TableCell>{new Date(operation.createdAtUtc).toLocaleString()}</TableCell>
                          <TableCell>
                            <Stack spacing={0}>
                              <Typography variant="body2">{operation.actorName ?? '-'}</Typography>
                              <Typography variant="caption" color="text.secondary">
                                {operation.actorEmail ?? '-'}
                              </Typography>
                            </Stack>
                          </TableCell>
                          <TableCell>{operation.action}</TableCell>
                          <TableCell>
                            <Stack spacing={0}>
                              <Typography variant="body2">{operation.entityName}</Typography>
                              <Typography variant="caption" color="text.secondary">
                                {operation.entityId ?? '-'}
                              </Typography>
                            </Stack>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </MainCard>
            </Grid>
          </Grid>
        </Stack>
      )}
    </>
  );
}
