import { useEffect, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { Link } from 'react-router-dom';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
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
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { IconEye, IconPlus, IconSearch } from '@tabler/icons-react';

import PermissionGuard from 'modules/Administration/components/PermissionGuard';
import { useOperationalJobs } from 'modules/OperationalJobs/hooks/useOperationalJobs';
import { useWorkers } from 'modules/Workers/hooks/useWorkers';
import MainCard from 'ui-component/cards/MainCard';
import Breadcrumbs from 'ui-component/extended/Breadcrumbs';
import Loader from 'ui-component/Loader';
import { useOperations } from '../hooks/useOperations';
import { OPERATIONS_PAGE_SIZE, OPERATIONS_PERMISSIONS } from '../utils/operations.constants';

export default function OperationsListPage() {
  const intl = useIntl();
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(OPERATIONS_PAGE_SIZE);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [workerId, setWorkerId] = useState('');
  const [operationalJobId, setOperationalJobId] = useState('');
  const [sortBy, setSortBy] = useState('operationDate');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const { items: workers } = useWorkers({ page: 1, pageSize: 100, sortBy: 'code', sortDirection: 'asc' });
  const { items: operationalJobs } = useOperationalJobs({ page: 1, pageSize: 100, sortBy: 'code', sortDirection: 'asc' });
  const { items, meta, isLoading, error, mutate } = useOperations({
    page: page + 1,
    pageSize,
    search,
    dateFrom: dateFrom || undefined,
    dateTo: dateTo || undefined,
    workerId: workerId || undefined,
    operationalJobId: operationalJobId || undefined,
    sortBy,
    sortDirection
  });

  useEffect(() => {
    const handle = window.setTimeout(() => setSearch(searchInput.trim()), 350);
    return () => window.clearTimeout(handle);
  }, [searchInput]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Breadcrumbs custom heading="operations" links={[{ title: 'labor', to: '/labor/workers' }, { title: 'operations' }]} />
      <Box>
        <Typography variant="h2" sx={{ fontWeight: 700 }}>
          <FormattedMessage id="operations" />
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75 }}>
          <FormattedMessage id="operations-page-description" />
        </Typography>
      </Box>

      <MainCard content={false}>
        <Box sx={{ p: 2 }}>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: 'repeat(6, minmax(0, 1fr))' },
              gap: 2,
              alignItems: 'center'
            }}
          >
            <OutlinedInput
              value={searchInput}
              onChange={(event) => {
                setSearchInput(event.target.value);
                setPage(0);
              }}
              placeholder={intl.formatMessage({ id: 'operations-search-placeholder' })}
              startAdornment={<IconSearch size={18} style={{ marginInlineEnd: 8, opacity: 0.7 }} />}
            />
            <TextField
              type="date"
              label={<FormattedMessage id="date-from" />}
              value={dateFrom}
              onChange={(event) => {
                setDateFrom(event.target.value);
                setPage(0);
              }}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              type="date"
              label={<FormattedMessage id="date-to" />}
              value={dateTo}
              onChange={(event) => {
                setDateTo(event.target.value);
                setPage(0);
              }}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              select
              label={<FormattedMessage id="worker" />}
              value={workerId}
              onChange={(event) => {
                setWorkerId(event.target.value);
                setPage(0);
              }}
            >
              <MenuItem value="">
                <FormattedMessage id="all" />
              </MenuItem>
              {workers.map((worker) => (
                <MenuItem key={worker.id} value={worker.id}>
                  {worker.code} - {worker.name}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              label={<FormattedMessage id="operation-operational-job" />}
              value={operationalJobId}
              onChange={(event) => {
                setOperationalJobId(event.target.value);
                setPage(0);
              }}
            >
              <MenuItem value="">
                <FormattedMessage id="all" />
              </MenuItem>
              {operationalJobs.map((job) => (
                <MenuItem key={job.id} value={job.id}>
                  {job.code} - {job.name}
                </MenuItem>
              ))}
            </TextField>
            <Stack direction="row" spacing={1} justifyContent="flex-end">
              <Select value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
                <MenuItem value="operationDate">
                  <FormattedMessage id="operations-sort-date" />
                </MenuItem>
                <MenuItem value="worker">
                  <FormattedMessage id="operations-sort-worker" />
                </MenuItem>
                <MenuItem value="operationalJob">
                  <FormattedMessage id="operations-sort-job" />
                </MenuItem>
                <MenuItem value="quantity">
                  <FormattedMessage id="operations-sort-quantity" />
                </MenuItem>
                <MenuItem value="createdAtUtc">
                  <FormattedMessage id="operations-sort-created-at" />
                </MenuItem>
              </Select>
              <Select value={sortDirection} onChange={(event) => setSortDirection(event.target.value as 'asc' | 'desc')}>
                <MenuItem value="asc">
                  <FormattedMessage id="sort-ascending" />
                </MenuItem>
                <MenuItem value="desc">
                  <FormattedMessage id="sort-descending" />
                </MenuItem>
              </Select>
              <PermissionGuard permission={OPERATIONS_PERMISSIONS.create}>
                <Button component={Link} to="/labor/operations/new" variant="contained" startIcon={<IconPlus size={18} />}>
                  <FormattedMessage id="create-operation" />
                </Button>
              </PermissionGuard>
            </Stack>
          </Box>
        </Box>

        {isLoading && (
          <Box sx={{ py: 6 }}>
            <Loader />
          </Box>
        )}
        {error && !isLoading && (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography color="error" sx={{ mb: 2 }}>
              <FormattedMessage id="operations-load-error" />
            </Typography>
            <Button variant="outlined" onClick={() => mutate()}>
              <FormattedMessage id="retry" />
            </Button>
          </Box>
        )}
        {!isLoading && !error && items.length === 0 && (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography color="text.secondary">
              <FormattedMessage id="operations-empty" />
            </Typography>
          </Box>
        )}
        {!isLoading && !error && items.length > 0 && (
          <>
            <TableContainer>
              <Table>
                <TableHead sx={{ bgcolor: 'grey.50' }}>
                  <TableRow>
                    <TableCell>
                      <FormattedMessage id="operation-date" />
                    </TableCell>
                    <TableCell>
                      <FormattedMessage id="worker" />
                    </TableCell>
                    <TableCell>
                      <FormattedMessage id="operation-operational-job" />
                    </TableCell>
                    <TableCell>
                      <FormattedMessage id="completed-quantity" />
                    </TableCell>
                    <TableCell>
                      <FormattedMessage id="notes" />
                    </TableCell>
                    <TableCell align="center">
                      <FormattedMessage id="actions" />
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {items.map((operation) => (
                    <TableRow key={operation.id} hover>
                      <TableCell dir="ltr">{operation.operationDate}</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                          <Typography variant="body2" fontWeight={600}>
                            {operation.workerCode} - {operation.workerName}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {operation.workerId}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight={600}>
                          {operation.operationalJobCode} - {operation.operationalJobName}
                        </Typography>
                      </TableCell>
                      <TableCell dir="ltr">{operation.completedQuantity.toFixed(3)}</TableCell>
                      <TableCell sx={{ maxWidth: 280 }}>
                        <Typography variant="body2" noWrap title={operation.notes || ''}>
                          {operation.notes || '-'}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Button component={Link} to={`/labor/operations/${operation.id}`} size="small" startIcon={<IconEye size={18} />}>
                          <FormattedMessage id="view" />
                        </Button>
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
