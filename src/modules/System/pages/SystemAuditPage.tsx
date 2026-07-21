import { useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';

import InputAdornment from '@mui/material/InputAdornment';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { IconSearch } from '@tabler/icons-react';

import Breadcrumbs from 'ui-component/extended/Breadcrumbs';
import Loader from 'ui-component/Loader';
import MainCard from 'ui-component/cards/MainCard';
import { useSystemAuditLogs } from '../hooks/useSystem';

export default function SystemAuditPage() {
  const intl = useIntl();
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');
  const [entityName, setEntityName] = useState('');
  const [action, setAction] = useState('');

  const { items, meta, isLoading, error } = useSystemAuditLogs({ page: page + 1, pageSize, search, entityName, action });

  if (isLoading) return <Loader />;

  return (
    <>
      <Breadcrumbs custom heading="system-audit-log" links={[{ title: 'system-administration' }, { title: 'system-audit-log' }]} />
      <MainCard title={<FormattedMessage id="system-audit-log" />}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ mb: 2 }}>
          <TextField
            fullWidth
            size="small"
            placeholder={intl.formatMessage({ id: 'search-placeholder' })}
            value={search}
            onChange={(event) => {
              setPage(0);
              setSearch(event.target.value);
            }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconSearch size={18} />
                </InputAdornment>
              )
            }}
          />
          <TextField
            select
            size="small"
            fullWidth
            label={intl.formatMessage({ id: 'entity' })}
            value={entityName}
            onChange={(event) => {
              setPage(0);
              setEntityName(event.target.value);
            }}
          >
            <MenuItem value="">
              <FormattedMessage id="all" />
            </MenuItem>
            <MenuItem value="User">
              <FormattedMessage id="user" defaultMessage="مستخدم" />
            </MenuItem>
            <MenuItem value="Role">
              <FormattedMessage id="role" defaultMessage="دور" />
            </MenuItem>
            <MenuItem value="SystemOwner">
              <FormattedMessage id="system-owner" defaultMessage="مالك النظام" />
            </MenuItem>
          </TextField>
          <TextField
            select
            size="small"
            fullWidth
            label={intl.formatMessage({ id: 'action' })}
            value={action}
            onChange={(event) => {
              setPage(0);
              setAction(event.target.value);
            }}
          >
            <MenuItem value="">
              <FormattedMessage id="all" />
            </MenuItem>
            <MenuItem value="SystemOwner">
              <FormattedMessage id="system-owner" defaultMessage="مالك النظام" />
            </MenuItem>
            <MenuItem value="User">
              <FormattedMessage id="user" defaultMessage="مستخدم" />
            </MenuItem>
            <MenuItem value="Role">
              <FormattedMessage id="role" defaultMessage="دور" />
            </MenuItem>
          </TextField>
        </Stack>

        {error && (
          <Typography color="error" sx={{ mb: 2 }}>
            <FormattedMessage id="administration-load-error" />
          </Typography>
        )}

        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell><FormattedMessage id="date" /></TableCell>
                <TableCell><FormattedMessage id="actor" /></TableCell>
                <TableCell><FormattedMessage id="action" /></TableCell>
                <TableCell><FormattedMessage id="entity" /></TableCell>
                <TableCell><FormattedMessage id="ip-address" /></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {items.map((log) => (
                <TableRow key={log.id}>
                  <TableCell>{new Date(log.createdAtUtc).toLocaleString()}</TableCell>
                  <TableCell>
                    <Stack spacing={0}>
                      <Typography variant="body2">{log.actorName ?? '-'}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {log.actorEmail ?? '-'}
                      </Typography>
                    </Stack>
                  </TableCell>
                  <TableCell>{log.action}</TableCell>
                  <TableCell>
                    <Stack spacing={0}>
                      <Typography variant="body2">{log.entityName}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {log.entityId ?? '-'}
                      </Typography>
                    </Stack>
                  </TableCell>
                  <TableCell>{log.ipAddress ?? '-'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          component="div"
          count={meta.totalCount}
          page={page}
          rowsPerPage={pageSize}
          onPageChange={(_, nextPage) => setPage(nextPage)}
          onRowsPerPageChange={(event) => {
            setPageSize(Number(event.target.value));
            setPage(0);
          }}
          labelRowsPerPage={intl.formatMessage({ id: 'rows-per-page' })}
        />
      </MainCard>
    </>
  );
}
