import { useEffect, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { Link } from 'react-router-dom';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
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
import { IconEdit, IconPlus, IconSearch, IconThumbDown, IconThumbUp, IconTrash } from '@tabler/icons-react';

import { useDispatch } from 'store';
import { openSnackbar } from 'store/slices/snackbar';
import PermissionGuard from 'modules/Administration/components/PermissionGuard';
import { useWorkers } from 'modules/Workers/hooks/useWorkers';
import MainCard from 'ui-component/cards/MainCard';
import Breadcrumbs from 'ui-component/extended/Breadcrumbs';
import Loader from 'ui-component/Loader';
import { approveMonthlyMovement, deleteMonthlyMovement, rejectMonthlyMovement } from '../api/monthlyMovementsApi';
import MonthlyMovementStatusChip from '../components/MonthlyMovementStatusChip';
import { useMonthlyMovements } from '../hooks/useMonthlyMovements';
import { MONTHLY_MOVEMENT_STATUS_OPTIONS, MONTHLY_MOVEMENT_TYPE_OPTIONS, MONTHLY_MOVEMENTS_PAGE_SIZE, MONTHLY_MOVEMENTS_PERMISSIONS } from '../utils/monthlyMovements.constants';

const sortOptions = [
  { value: 'movementDate', labelId: 'monthly-movement-sort-date' },
  { value: 'worker', labelId: 'monthly-movement-sort-worker' },
  { value: 'movementType', labelId: 'monthly-movement-sort-type' },
  { value: 'status', labelId: 'monthly-movement-sort-status' },
  { value: 'amount', labelId: 'monthly-movement-sort-amount' },
  { value: 'createdAtUtc', labelId: 'monthly-movement-sort-created-at' }
] as const;

function getMonthOptions() {
  return Array.from({ length: 12 }, (_, index) => index + 1);
}

function formatMoney(locale: string, value: number) {
  return new Intl.NumberFormat(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value);
}

export default function MonthlyMovementsListPage() {
  const intl = useIntl();
  const dispatch = useDispatch();
  const today = new Date();
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(MONTHLY_MOVEMENTS_PAGE_SIZE);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [workerId, setWorkerId] = useState('');
  const [movementType, setMovementType] = useState('');
  const [status, setStatus] = useState('');
  const [month, setMonth] = useState(String(today.getMonth() + 1));
  const [year, setYear] = useState(String(today.getFullYear()));
  const [sortBy, setSortBy] = useState('movementDate');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const { items: workers } = useWorkers({ page: 1, pageSize: 100, sortBy: 'name', sortDirection: 'asc' });
  const { items, meta, isLoading, error, mutate } = useMonthlyMovements({
    page: page + 1,
    pageSize,
    search,
    workerId: workerId || undefined,
    movementType: movementType ? Number(movementType) : undefined,
    status: status ? Number(status) : undefined,
    month: month ? Number(month) : undefined,
    year: year ? Number(year) : undefined,
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
      notify(intl.formatMessage({ id: 'monthly-movements-action-success' }));
    } catch (actionError) {
      notify(actionError instanceof Error ? actionError.message : intl.formatMessage({ id: 'monthly-movements-action-failed' }), 'error');
    }
  };

  const handleReject = async (movement: typeof items[number]) => {
    const reason = window.prompt(intl.formatMessage({ id: 'monthly-movement-reject-prompt' }, { code: movement.workerCode }));
    if (!reason?.trim()) {
      return;
    }

    await runAction(() => rejectMonthlyMovement(movement.id, movement.rowVersion, reason.trim()));
  };

  const handleDelete = async (movement: typeof items[number]) => {
    if (!window.confirm(intl.formatMessage({ id: 'monthly-movement-delete-confirm' }, { code: movement.workerCode }))) {
      return;
    }

    await runAction(() => deleteMonthlyMovement(movement.id, movement.rowVersion));
  };

  const activeCount = items.filter((movement) => movement.status === 1).length;
  const closedCount = items.filter((movement) => movement.status === 2 || movement.status === 3).length;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Breadcrumbs custom heading="monthly-movements" links={[{ title: 'labor', to: '/labor/workers' }, { title: 'monthly-movements' }]} />

      <Box>
        <Typography variant="h2" sx={{ fontWeight: 700 }}>
          <FormattedMessage id="monthly-movements" />
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75 }}>
          <FormattedMessage id="monthly-movements-page-description" />
        </Typography>
      </Box>

      <Grid container spacing={2}>
        <Grid item xs={12} md={4}>
          <MainCard>
            <Stack spacing={1}>
              <Typography variant="body2" color="text.secondary"><FormattedMessage id="monthly-movements-summary-total" /></Typography>
              <Typography variant="h3" sx={{ fontWeight: 700 }}>{meta.totalCount}</Typography>
            </Stack>
          </MainCard>
        </Grid>
        <Grid item xs={12} md={4}>
          <MainCard>
            <Stack spacing={1}>
              <Typography variant="body2" color="text.secondary"><FormattedMessage id="monthly-movements-summary-draft" /></Typography>
              <Typography variant="h3" sx={{ fontWeight: 700 }}>{activeCount}</Typography>
            </Stack>
          </MainCard>
        </Grid>
        <Grid item xs={12} md={4}>
          <MainCard>
            <Stack spacing={1}>
              <Typography variant="body2" color="text.secondary"><FormattedMessage id="monthly-movements-summary-closed" /></Typography>
              <Typography variant="h3" sx={{ fontWeight: 700 }}>{closedCount}</Typography>
            </Stack>
          </MainCard>
        </Grid>
      </Grid>

      <MainCard content={false}>
        <Box sx={{ p: 2, display: 'grid', gridTemplateColumns: { xs: '1fr', md: '2fr 1fr 1fr 1fr 1fr 1fr 1fr' }, gap: 2, alignItems: 'center' }}>
          <OutlinedInput
            value={searchInput}
            onChange={(event) => {
              setSearchInput(event.target.value);
              setPage(0);
            }}
            placeholder={intl.formatMessage({ id: 'monthly-movements-search-placeholder' })}
            startAdornment={<IconSearch size={18} style={{ marginInlineEnd: 8, opacity: 0.7 }} />}
          />
          <Select
            value={workerId}
            onChange={(event) => {
              setWorkerId(event.target.value);
              setPage(0);
            }}
            displayEmpty
          >
            <MenuItem value=""><FormattedMessage id="all" /></MenuItem>
            {workers.map((worker) => (
              <MenuItem key={worker.id} value={worker.id}>{worker.code} - {worker.name}</MenuItem>
            ))}
          </Select>
          <Select
            value={movementType}
            onChange={(event) => {
              setMovementType(event.target.value);
              setPage(0);
            }}
            displayEmpty
          >
            <MenuItem value=""><FormattedMessage id="all" /></MenuItem>
            {MONTHLY_MOVEMENT_TYPE_OPTIONS.map((option) => (
              <MenuItem key={option.value} value={option.value}><FormattedMessage id={option.labelId} /></MenuItem>
            ))}
          </Select>
          <Select
            value={status}
            onChange={(event) => {
              setStatus(event.target.value);
              setPage(0);
            }}
            displayEmpty
          >
            <MenuItem value=""><FormattedMessage id="all" /></MenuItem>
            {MONTHLY_MOVEMENT_STATUS_OPTIONS.map((option) => (
              <MenuItem key={option.value} value={option.value}><FormattedMessage id={option.labelId} /></MenuItem>
            ))}
          </Select>
          <Select
            value={month}
            onChange={(event) => {
              setMonth(event.target.value);
              setPage(0);
            }}
            displayEmpty
          >
            <MenuItem value=""><FormattedMessage id="all" /></MenuItem>
            {getMonthOptions().map((monthValue) => (
              <MenuItem key={monthValue} value={String(monthValue)}>{monthValue}</MenuItem>
            ))}
          </Select>
          <OutlinedInput
            value={year}
            onChange={(event) => {
              setYear(event.target.value);
              setPage(0);
            }}
            placeholder={intl.formatMessage({ id: 'monthly-movements-year-placeholder' })}
            inputProps={{ inputMode: 'numeric', dir: 'ltr' }}
          />
          <Stack direction="row" spacing={1} justifyContent="flex-end">
            <PermissionGuard permission={MONTHLY_MOVEMENTS_PERMISSIONS.create}>
              <Button component={Link} to="/labor/monthly-movements/new" variant="contained" startIcon={<IconPlus size={18} />}>
                <FormattedMessage id="create-monthly-movement" />
              </Button>
            </PermissionGuard>
          </Stack>
        </Box>

        {isLoading && (
          <Box sx={{ py: 6 }}>
            <Loader />
          </Box>
        )}
        {error && !isLoading && (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography color="error" sx={{ mb: 2 }}>
              <FormattedMessage id="monthly-movements-load-error" />
            </Typography>
            <Button variant="outlined" onClick={() => mutate()}>
              <FormattedMessage id="retry" />
            </Button>
          </Box>
        )}
        {!isLoading && !error && items.length === 0 && (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography color="text.secondary">
              <FormattedMessage id="monthly-movements-empty" />
            </Typography>
          </Box>
        )}
        {!isLoading && !error && items.length > 0 && (
          <>
            <TableContainer>
              <Table>
                <TableHead sx={{ bgcolor: 'grey.50' }}>
                  <TableRow>
                    <TableCell><FormattedMessage id="monthly-movement-date" /></TableCell>
                    <TableCell><FormattedMessage id="monthly-movement-worker" /></TableCell>
                    <TableCell><FormattedMessage id="monthly-movement-type" /></TableCell>
                    <TableCell><FormattedMessage id="monthly-movement-quantity" /></TableCell>
                    <TableCell><FormattedMessage id="monthly-movement-amount" /></TableCell>
                    <TableCell><FormattedMessage id="status" /></TableCell>
                    <TableCell><FormattedMessage id="monthly-movement-reason" /></TableCell>
                    <TableCell align="center"><FormattedMessage id="actions" /></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {items.map((movement) => (
                    <TableRow key={movement.id} hover sx={{ opacity: movement.status === 1 ? 1 : 0.78 }}>
                      <TableCell dir="ltr">{movement.movementDate}</TableCell>
                      <TableCell>
                        <Stack spacing={0.5}>
                          <Typography variant="body2" fontWeight={600}>{movement.workerName}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {movement.workerCode} - {movement.operationalJobName}
                          </Typography>
                        </Stack>
                      </TableCell>
                      <TableCell><FormattedMessage id={MONTHLY_MOVEMENT_TYPE_OPTIONS.find((option) => option.value === String(movement.movementType))?.labelId ?? 'monthly-movement-type'} /></TableCell>
                      <TableCell dir="ltr">{movement.quantity == null ? '-' : movement.quantity.toFixed(4)}</TableCell>
                      <TableCell dir="ltr">
                        <Typography fontWeight={700}>
                          {formatMoney(intl.locale, movement.amount)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <MonthlyMovementStatusChip status={movement.status} label={movement.statusLabel} />
                      </TableCell>
                      <TableCell>{movement.reason ?? '-'}</TableCell>
                      <TableCell align="center">
                        <Stack direction="row" spacing={0.5} justifyContent="center" flexWrap="wrap">
                          <PermissionGuard permission={MONTHLY_MOVEMENTS_PERMISSIONS.edit}>
                            <IconButton component={Link} to={`/labor/monthly-movements/${movement.id}/edit`} size="small">
                              <IconEdit size={18} />
                            </IconButton>
                          </PermissionGuard>
                          <PermissionGuard permission={MONTHLY_MOVEMENTS_PERMISSIONS.approve}>
                            <IconButton
                              size="small"
                              disabled={movement.status !== 1}
                              onClick={() => runAction(() => approveMonthlyMovement(movement.id, movement.rowVersion))}
                            >
                              <IconThumbUp size={18} />
                            </IconButton>
                          </PermissionGuard>
                          <PermissionGuard permission={MONTHLY_MOVEMENTS_PERMISSIONS.reject}>
                            <IconButton size="small" disabled={movement.status !== 1} onClick={() => handleReject(movement)}>
                              <IconThumbDown size={18} />
                            </IconButton>
                          </PermissionGuard>
                          <PermissionGuard permission={MONTHLY_MOVEMENTS_PERMISSIONS.delete}>
                            <IconButton size="small" color="error" disabled={movement.status !== 1} onClick={() => handleDelete(movement)}>
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
