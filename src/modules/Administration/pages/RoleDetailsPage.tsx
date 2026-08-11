import { useLocation, useParams } from 'react-router-dom';
import { FormattedMessage, useIntl } from 'react-intl';

import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import Breadcrumbs from 'ui-component/extended/Breadcrumbs';
import MainCard from 'ui-component/cards/MainCard';
import Loader from 'ui-component/Loader';
import RoleStatusChip from '../components/RoleStatusChip';
import { useRole } from '../hooks/useAdministration';
import { getAdministrationRouteBase, getAdministrationScope } from '../utils/administration-scope';
import { getLocalizedLabel } from '../utils/access-labels';

export default function RoleDetailsPage() {
  const { id } = useParams();
  const { pathname } = useLocation();
  const intl = useIntl();
  const routeBase = getAdministrationRouteBase(pathname);
  const scope = getAdministrationScope(pathname);
  const { role, isLoading, error } = useRole(id);
  const isArabic = intl.locale.startsWith('ar');

  if (isLoading) return <Loader />;

  const modules = role ? Array.from(new Set(role.permissions.map((permission) => permission.module))).sort() : [];

  return (
    <>
      <Breadcrumbs
        custom
        heading={scope === 'system' ? 'system-role-details' : 'role-details'}
        links={[
          { title: scope === 'system' ? 'system-administration' : 'administration' },
          { title: scope === 'system' ? 'system-roles-permissions' : 'administration-roles-permissions', to: `${routeBase}/roles` },
          { title: scope === 'system' ? 'system-role-details' : 'role-details' }
        ]}
      />
      <MainCard title={<FormattedMessage id={scope === 'system' ? 'system-role-details' : 'role-details'} />}>
        {error && <Typography color="error"><FormattedMessage id="administration-load-error" /></Typography>}
        {role && (
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 4 }}>
              <Stack spacing={1}>
                <Typography variant="h5">{role.name}</Typography>
                <Typography>{isArabic ? role.descriptionArabic : role.descriptionEnglish}</Typography>
                <Stack direction="row" spacing={1}>
                  <RoleStatusChip isActive={role.isActive} />
                  {role.isSystem && <Chip color="secondary" label={<FormattedMessage id="system-role" />} />}
                </Stack>
              </Stack>
            </Grid>
            <Grid size={{ xs: 12, md: 8 }}>
              <Stack spacing={2}>
                {modules.map((module) => (
                  <Stack key={module} spacing={1}>
                    <Typography variant="h5">{getLocalizedLabel(module, intl.locale)}</Typography>
                    <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                      {role.permissions
                        .filter((permission) => permission.module === module)
                        .map((permission) => (
                          <Chip key={permission.id} label={isArabic ? permission.nameArabic : permission.nameEnglish} />
                        ))}
                    </Stack>
                  </Stack>
                ))}
              </Stack>
            </Grid>
          </Grid>
        )}
      </MainCard>
    </>
  );
}
