import { FormattedMessage, useIntl } from 'react-intl';

import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';

import Breadcrumbs from 'ui-component/extended/Breadcrumbs';
import Loader from 'ui-component/Loader';
import MainCard from 'ui-component/cards/MainCard';
import { usePermissions } from 'modules/Administration/hooks/useAdministration';

export default function SystemPermissionsPage() {
  const intl = useIntl();
  const { permissions, isLoading, error } = usePermissions();

  if (isLoading) return <Loader />;

  return (
    <>
      <Breadcrumbs custom heading="system-permissions" links={[{ title: 'system-administration' }, { title: 'system-permissions' }]} />
      <MainCard
        title={<FormattedMessage id="system-permissions" />}
        secondary={<Chip color="info" label={`${permissions.length} ${intl.formatMessage({ id: 'registered-permissions-count' })}`} />}
      >
        <Stack spacing={2}>
          {error && (
            <Typography color="error">
              <FormattedMessage id="administration-load-error" />
            </Typography>
          )}
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell><FormattedMessage id="permission-code" /></TableCell>
                  <TableCell><FormattedMessage id="module" /></TableCell>
                  <TableCell><FormattedMessage id="name-arabic" /></TableCell>
                  <TableCell><FormattedMessage id="name-english" /></TableCell>
                  <TableCell><FormattedMessage id="status" /></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {permissions.map((permission) => (
                  <TableRow key={permission.id}>
                    <TableCell>{permission.code}</TableCell>
                    <TableCell>{permission.module}</TableCell>
                    <TableCell>{permission.nameArabic}</TableCell>
                    <TableCell>{permission.nameEnglish}</TableCell>
                    <TableCell>
                      <Chip size="small" color={permission.isActive ? 'success' : 'default'} label={<FormattedMessage id={permission.isActive ? 'active' : 'inactive'} />} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Stack>
      </MainCard>
    </>
  );
}
