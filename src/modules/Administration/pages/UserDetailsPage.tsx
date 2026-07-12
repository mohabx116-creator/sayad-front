import { useParams } from 'react-router-dom';
import { FormattedMessage } from 'react-intl';

import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import Breadcrumbs from 'ui-component/extended/Breadcrumbs';
import MainCard from 'ui-component/cards/MainCard';
import Loader from 'ui-component/Loader';
import UserLockChip from '../components/UserLockChip';
import UserStatusChip from '../components/UserStatusChip';
import { useUser } from '../hooks/useAdministration';

export default function UserDetailsPage() {
  const { id } = useParams();
  const { user, isLoading, error } = useUser(id);

  if (isLoading) return <Loader />;

  return (
    <>
      <Breadcrumbs custom heading="user-details" links={[{ title: 'administration' }, { title: 'administration-users', to: '/administration/users' }, { title: 'user-details' }]} />
      <MainCard title={<FormattedMessage id="user-details" />}>
        {error && <Typography color="error"><FormattedMessage id="administration-load-error" /></Typography>}
        {!user && !error && <Typography><FormattedMessage id="administration-empty-users" /></Typography>}
        {user && (
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Stack spacing={1}>
                <Typography variant="h5">{user.displayName}</Typography>
                <Typography>{user.email}</Typography>
                <Stack direction="row" spacing={1}>
                  <UserStatusChip isActive={user.isActive} />
                  <UserLockChip isLocked={user.isLocked} />
                </Stack>
              </Stack>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Stack spacing={1}>
                <Typography><FormattedMessage id="roles" /></Typography>
                <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                  {user.roles.map((role) => <Chip key={role.id} label={role.name} />)}
                </Stack>
                <Typography><FormattedMessage id="created-date" />: {new Date(user.createdAtUtc).toLocaleString()}</Typography>
                <Typography><FormattedMessage id="last-login" />: {user.lastLoginAtUtc ? new Date(user.lastLoginAtUtc).toLocaleString() : '-'}</Typography>
              </Stack>
            </Grid>
          </Grid>
        )}
      </MainCard>
    </>
  );
}
