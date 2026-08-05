import { useEffect, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { Link } from 'react-router-dom';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Grid from '@mui/material/GridLegacy';
import IconButton from '@mui/material/IconButton';
import MenuItem from '@mui/material/MenuItem';
import OutlinedInput from '@mui/material/OutlinedInput';
import Select from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import { IconEdit, IconEye, IconPlus, IconSearch, IconToggleLeft, IconToggleRight, IconTrash } from '@tabler/icons-react';

import { useDispatch } from 'store';
import { openSnackbar } from 'store/slices/snackbar';
import PermissionGuard from 'modules/Administration/components/PermissionGuard';
import MainCard from 'ui-component/cards/MainCard';
import Breadcrumbs from 'ui-component/extended/Breadcrumbs';
import Loader from 'ui-component/Loader';
import { activateOperationalJob, deactivateOperationalJob, deleteOperationalJob } from '../api/operationalJobsApi';
import { useOperationalJobs } from '../hooks/useOperationalJobs';
import { OPERATIONAL_JOBS_PAGE_SIZE, OPERATIONAL_JOBS_PERMISSIONS } from '../utils/operationalJobs.constants';

const sortOptions = [
  { value: 'code', labelId: 'operational-job-sort-code' },
  { value: 'name', labelId: 'operational-job-sort-name' },
  { value: 'createdAtUtc', labelId: 'operational-job-sort-created-at' }
] as const;

export default function OperationalJobsListPage() {
  const intl = useIntl();
  const dispatch = useDispatch();
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(OPERATIONAL_JOBS_PAGE_SIZE);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [isActive, setIsActive] = useState('');
  const [sortBy, setSortBy] = useState('code');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const { items, meta, isLoading, error, mutate } = useOperationalJobs({
    page: page + 1,
    pageSize,
    search,
    isActive: isActive === '' ? undefined : isActive === 'true',
    sortBy,
    sortDirection
  });

  useEffect(() => {
    const handle = window.setTimeout(() => setSearch(searchInput.trim()), 350);
    return () => window.clearTimeout(handle);
  }, [searchInput]);

  const notify = (message: string, severity: 'success' | 'error' = 'success') => {
    dispatch(openSnackbar({ open: true, message, variant: 'alert', severity }));
  };

  const runAction = async (action: () => Promise<unknown>) => {
    try {
      await action();
      await mutate();
      notify(intl.formatMessage({ id: 'operational-jobs-action-success' }));
    } catch (actionError) {
      notify(actionError instanceof Error ? actionError.message : intl.formatMessage({ id: 'operational-jobs-action-failed' }), 'error');
    }
  };

  const handleDelete = async (job: typeof items[number]) => {
    if (!window.confirm(intl.formatMessage({ id: 'operational-job-delete-confirm' }, { code: job.code }))) {
      return;
    }
    try {
      await deleteOperationalJob(job.id, job.rowVersion);
      await mutate();
      notify(intl.formatMessage({ id: 'operational-jobs-action-success' }));
    } catch (actionError: any) {
      if (actionError?.response?.status === 409 || actionError?.message === 'Conflict' || actionError?.status === 409) {
        notify(intl.formatMessage({ id: 'operational-job-delete-conflict' }), 'error');
      } else {
        notify(actionError instanceof Error ? actionError.message : intl.formatMessage({ id: 'operational-jobs-action-failed' }), 'error');
      }
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Breadcrumbs custom heading="operational-jobs" links={[{ title: 'labor', to: '/labor/workers' }, { title: 'operational-jobs' }]} />
      <Box>
        <Typography variant="h2" sx={{ fontWeight: 700 }}>
          <FormattedMessage id="operational-jobs" />
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75 }}>
          <FormattedMessage id="operational-jobs-page-description" />
        </Typography>
      </Box>

      <MainCard content={false}>
        <Box sx={{ p: 2, display: 'grid', gridTemplateColumns: { xs: '1fr', md: '2fr 1fr 1fr 1fr 1fr' }, gap: 2, alignItems: 'center' }}>
          <OutlinedInput
            value={searchInput}
            onChange={(event) => {
              setSearchInput(event.target.value);
              setPage(0);
            }}
            placeholder={intl.formatMessage({ id: 'operational-jobs-search-placeholder' })}
            startAdornment={<IconSearch size={18} style={{ marginInlineEnd: 8, opacity: 0.7 }} />}
          />
          <Select
            value={isActive}
            onChange={(event) => {
              setIsActive(event.target.value);
              setPage(0);
            }}
            displayEmpty
          >
            <MenuItem value=""><FormattedMessage id="all" /></MenuItem>
            <MenuItem value="true"><FormattedMessage id="active" /></MenuItem>
            <MenuItem value="false"><FormattedMessage id="inactive" /></MenuItem>
          </Select>
          <Select value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
            {sortOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}><FormattedMessage id={option.labelId} /></MenuItem>
            ))}
          </Select>
          <Select value={sortDirection} onChange={(event) => setSortDirection(event.target.value as 'asc' | 'desc')}>
            <MenuItem value="asc"><FormattedMessage id="sort-ascending" /></MenuItem>
            <MenuItem value="desc"><FormattedMessage id="sort-descending" /></MenuItem>
          </Select>
          <Stack direction="row" justifyContent="flex-end">
            <PermissionGuard permission={OPERATIONAL_JOBS_PERMISSIONS.create}>
              <Button component={Link} to="/labor/operational-jobs/new" variant="contained" startIcon={<IconPlus size={18} />}>
                <FormattedMessage id="create-operational-job" />
              </Button>
            </PermissionGuard>
          </Stack>
        </Box>

        {isLoading && <Box sx={{ py: 6 }}><Loader /></Box>}
        {error && !isLoading && (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography color="error" sx={{ mb: 2 }}><FormattedMessage id="operational-jobs-load-error" /></Typography>
            <Button variant="outlined" onClick={() => mutate()}><FormattedMessage id="retry" /></Button>
          </Box>
        )}
        {!isLoading && !error && items.length === 0 && (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography color="text.secondary"><FormattedMessage id="operational-jobs-empty" /></Typography>
          </Box>
        )}
        {!isLoading && !error && items.length > 0 && (
          <>
            <TableContainer>
              <Table>
                <TableHead sx={{ bgcolor: 'grey.50' }}>
                  <TableRow>
                    <TableCell><FormattedMessage id="operational-job-code" /></TableCell>
                    <TableCell><FormattedMessage id="operational-job-name" /></TableCell>
                    <TableCell><FormattedMessage id="operational-job-description" /></TableCell>
                    <TableCell><FormattedMessage id="status" /></TableCell>
                    <TableCell align="center"><FormattedMessage id="actions" /></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {items.map((job) => (
                    <TableRow key={job.id} hover sx={{ opacity: job.isActive ? 1 : 0.72 }}>
                      <TableCell dir="ltr" sx={{ fontFamily: 'monospace' }}>{job.code}</TableCell>
                      <TableCell>{job.name}</TableCell>
                      <TableCell>{job.description ?? '-'}</TableCell>
                      <TableCell>{job.isActive ? <FormattedMessage id="active" /> : <FormattedMessage id="inactive" />}</TableCell>
                      <TableCell align="center">
                        <Stack direction="row" spacing={0.5} justifyContent="center" flexWrap="wrap">
                          <PermissionGuard permission={OPERATIONAL_JOBS_PERMISSIONS.view}>
                            <IconButton component={Link} to={`/labor/operational-jobs/${job.id}`} size="small"><IconEye size={18} /></IconButton>
                          </PermissionGuard>
                          <PermissionGuard permission={OPERATIONAL_JOBS_PERMISSIONS.edit}>
                            <IconButton component={Link} to={`/labor/operational-jobs/${job.id}/edit`} size="small"><IconEdit size={18} /></IconButton>
                          </PermissionGuard>
                          <PermissionGuard permission={OPERATIONAL_JOBS_PERMISSIONS.changeStatus}>
                            <IconButton
                              size="small"
                              onClick={() => runAction(() => (job.isActive ? deactivateOperationalJob(job.id, job.rowVersion) : activateOperationalJob(job.id, job.rowVersion)))}
                            >
                              {job.isActive ? <IconToggleLeft size={18} /> : <IconToggleRight size={18} />}
                            </IconButton>
                          </PermissionGuard>
                          <PermissionGuard permission={OPERATIONAL_JOBS_PERMISSIONS.delete}>
                            <IconButton size="small" color="error" onClick={() => handleDelete(job)}>
                              <IconTrash size={18} />
                            </IconButton>
                          </PermissionGuard>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <Box sx={{ borderTop: '1px solid', borderColor: 'divider' }}>
              <TablePagination
                component="div"
                count={meta.totalCount}
                page={page}
                rowsPerPage={pageSize}
                onPageChange={(_, nextPage) => setPage(nextPage)}
                onRowsPerPageChange={(event) => {
                  setPageSize(parseInt(event.target.value, 10));
                  setPage(0);
                }}
                labelRowsPerPage=""
              />
            </Box>
          </>
        )}
      </MainCard>
    </Box>
  );
}
