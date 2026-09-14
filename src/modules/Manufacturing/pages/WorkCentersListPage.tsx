import React, { useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { Link } from 'react-router-dom';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import MenuItem from '@mui/material/MenuItem';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { IconEdit, IconPlus, IconRefresh, IconSearch, IconTrash } from '@tabler/icons-react';

import { useDispatch } from 'store';
import { openSnackbar } from 'store/slices/snackbar';
import MainCard from 'ui-component/cards/MainCard';
import Breadcrumbs from 'ui-component/extended/Breadcrumbs';
import PageTitle from 'ui-component/PageTitle';
import PermissionGuard from 'modules/Administration/components/PermissionGuard';
import { deleteWorkCenter } from '../api/workCentersApi';
import WorkCenterStatusChip from '../components/WorkCenterStatusChip';
import { useWorkCenters } from '../hooks/useManufacturing';
import type { WorkCenterListDto } from '../types/manufacturing.types';
import { MANUFACTURING_PERMISSIONS } from '../utils/manufacturing.constants';

function formatMoney(value: number | undefined | null) {
  return (value ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function WorkCentersListPage() {
  const intl = useIntl();
  const dispatch = useDispatch();
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [deleting, setDeleting] = useState<WorkCenterListDto | null>(null);
  const [processing, setProcessing] = useState(false);

  const isActiveParam = activeFilter === 'active' ? true : activeFilter === 'inactive' ? false : undefined;
  const { items, meta, isLoading, mutate } = useWorkCenters({
    page: page + 1,
    pageSize,
    search: search.trim() || undefined,
    isActive: isActiveParam
  });

  const showSnackbar = (message: string, color: 'success' | 'error') => {
    dispatch(openSnackbar({ open: true, message, variant: 'alert', alert: { color } }));
  };

  const handleDelete = async () => {
    if (!deleting) return;
    setProcessing(true);
    try {
      await deleteWorkCenter(deleting.id, deleting.rowVersion);
      await mutate();
      showSnackbar(intl.formatMessage({ id: 'work-center-deleted', defaultMessage: 'Work center deleted.' }), 'success');
      setDeleting(null);
    } catch (error: any) {
      showSnackbar(error?.message || intl.formatMessage({ id: 'operation-failed', defaultMessage: 'Operation failed.' }), 'error');
    } finally {
      setProcessing(false);
    }
  };

  const resetFilters = () => {
    setSearch('');
    setActiveFilter('all');
    setPage(0);
  };

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Breadcrumbs />
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mt: 1 }} flexWrap="wrap" gap={1}>
          <PageTitle>
            <FormattedMessage id="manufacturing-work-centers" defaultMessage="Work Centers" />
          </PageTitle>
          <PermissionGuard permission={MANUFACTURING_PERMISSIONS.workCentersCreate}>
            <Button
              component={Link}
              to="/manufacturing/work-centers/create"
              variant="contained"
              color="secondary"
              startIcon={<IconPlus size={18} />}
            >
              <FormattedMessage id="create-work-center" defaultMessage="Create Work Center" />
            </Button>
          </PermissionGuard>
        </Stack>
      </Box>

      <MainCard content={false}>
        <Box sx={{ p: 2.5, borderBottom: '1px solid', borderColor: 'divider' }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
            <TextField
              size="small"
              placeholder={intl.formatMessage({
                id: 'search-work-centers-placeholder',
                defaultMessage: 'Search by code, name, or description...'
              })}
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(0);
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <IconSearch size={18} />
                  </InputAdornment>
                )
              }}
              sx={{ minWidth: { xs: '100%', sm: 300 }, flexGrow: 1 }}
            />
            <TextField
              select
              size="small"
              label={intl.formatMessage({ id: 'status', defaultMessage: 'Status' })}
              value={activeFilter}
              onChange={(event) => {
                setActiveFilter(event.target.value);
                setPage(0);
              }}
              sx={{ minWidth: 150 }}
            >
              <MenuItem value="all">
                <FormattedMessage id="all" defaultMessage="All" />
              </MenuItem>
              <MenuItem value="active">
                <FormattedMessage id="active" defaultMessage="Active" />
              </MenuItem>
              <MenuItem value="inactive">
                <FormattedMessage id="inactive" defaultMessage="Inactive" />
              </MenuItem>
            </TextField>
            <Tooltip title={intl.formatMessage({ id: 'reset-filters', defaultMessage: 'Reset Filters' })}>
              <IconButton onClick={resetFilters} size="small" color="primary">
                <IconRefresh size={20} />
              </IconButton>
            </Tooltip>
          </Stack>
        </Box>

        <TableContainer>
          <Table sx={{ minWidth: 760 }}>
            <TableHead>
              <TableRow>
                <TableCell><FormattedMessage id="code" defaultMessage="Code" /></TableCell>
                <TableCell><FormattedMessage id="name" defaultMessage="Name" /></TableCell>
                <TableCell align="right"><FormattedMessage id="labor-rate" defaultMessage="Labor Rate" /></TableCell>
                <TableCell align="right"><FormattedMessage id="machine-rate" defaultMessage="Machine Rate" /></TableCell>
                <TableCell align="right"><FormattedMessage id="capacity-minutes-per-day" defaultMessage="Capacity / Day" /></TableCell>
                <TableCell align="center"><FormattedMessage id="status" defaultMessage="Status" /></TableCell>
                <TableCell align="center"><FormattedMessage id="actions" defaultMessage="Actions" /></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <TableRow key={index}>
                    <TableCell><Skeleton width={80} /></TableCell>
                    <TableCell><Skeleton width={160} /></TableCell>
                    <TableCell align="right"><Skeleton width={70} /></TableCell>
                    <TableCell align="right"><Skeleton width={70} /></TableCell>
                    <TableCell align="right"><Skeleton width={70} /></TableCell>
                    <TableCell align="center"><Skeleton width={70} /></TableCell>
                    <TableCell align="center"><Skeleton width={80} /></TableCell>
                  </TableRow>
                ))
              ) : items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                    <Typography variant="subtitle1" color="text.secondary">
                      <FormattedMessage id="no-work-centers-found" defaultMessage="No work centers found." />
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                items.map((workCenter) => (
                  <TableRow hover key={workCenter.id}>
                    <TableCell>
                      <Typography variant="subtitle2" fontWeight={700}>{workCenter.code}</Typography>
                    </TableCell>
                    <TableCell>{workCenter.name}</TableCell>
                    <TableCell align="right">{formatMoney(workCenter.laborRatePerHour)}</TableCell>
                    <TableCell align="right">{formatMoney(workCenter.machineRatePerHour)}</TableCell>
                    <TableCell align="right">{(workCenter.capacityMinutesPerDay ?? 0).toLocaleString()}</TableCell>
                    <TableCell align="center"><WorkCenterStatusChip isActive={workCenter.isActive} /></TableCell>
                    <TableCell align="center">
                      <PermissionGuard permission={MANUFACTURING_PERMISSIONS.workCentersUpdate}>
                        <Tooltip title={intl.formatMessage({ id: 'edit', defaultMessage: 'Edit' })}>
                          <IconButton
                            component={Link}
                            to={`/manufacturing/work-centers/${workCenter.id}/edit`}
                            size="small"
                            color="primary"
                          >
                            <IconEdit size={18} />
                          </IconButton>
                        </Tooltip>
                      </PermissionGuard>
                      <PermissionGuard permission={MANUFACTURING_PERMISSIONS.workCentersDelete}>
                        <Tooltip title={intl.formatMessage({ id: 'delete', defaultMessage: 'Delete' })}>
                          <IconButton size="small" color="error" onClick={() => setDeleting(workCenter)}>
                            <IconTrash size={18} />
                          </IconButton>
                        </Tooltip>
                      </PermissionGuard>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          rowsPerPageOptions={[5, 10, 20, 50]}
          component="div"
          count={meta.totalCount}
          rowsPerPage={pageSize}
          page={page}
          onPageChange={(_, nextPage) => setPage(nextPage)}
          onRowsPerPageChange={(event) => {
            setPageSize(parseInt(event.target.value, 10));
            setPage(0);
          }}
          labelRowsPerPage={<FormattedMessage id="rows-per-page" defaultMessage="Rows per page" />}
        />
      </MainCard>

      <Dialog open={Boolean(deleting)} onClose={() => setDeleting(null)} maxWidth="xs" fullWidth>
        <DialogTitle>
          <FormattedMessage id="delete-work-center" defaultMessage="Delete Work Center" />
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            <FormattedMessage
              id="delete-work-center-confirm"
              defaultMessage="Delete work center {code}?"
              values={{ code: deleting?.code ?? '' }}
            />
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleting(null)} disabled={processing}>
            <FormattedMessage id="cancel" defaultMessage="Cancel" />
          </Button>
          <Button onClick={handleDelete} color="error" variant="contained" disabled={processing}>
            <FormattedMessage id="delete" defaultMessage="Delete" />
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
