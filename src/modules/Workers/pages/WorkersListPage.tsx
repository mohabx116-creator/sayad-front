import { useEffect, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { Link } from 'react-router-dom';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
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
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { IconClipboardList, IconCoins, IconEdit, IconEye, IconPlus, IconSearch, IconToggleLeft, IconToggleRight } from '@tabler/icons-react';

import { useDispatch } from 'store';
import { openSnackbar } from 'store/slices/snackbar';
import PermissionGuard from 'modules/Administration/components/PermissionGuard';
import { ExcelActions } from 'shared/components/excel';
import { useOperationalJobs } from 'modules/OperationalJobs/hooks/useOperationalJobs';
import { OPERATIONAL_JOBS_PERMISSIONS } from 'modules/OperationalJobs/utils/operationalJobs.constants';
import MainCard from 'ui-component/cards/MainCard';
import Breadcrumbs from 'ui-component/extended/Breadcrumbs';
import Loader from 'ui-component/Loader';
import { activateWorker, deactivateWorker, downloadWorkersImportTemplate, exportWorkersToExcel } from '../api/workersApi';
import WorkerImportWizard from '../components/WorkerImportWizard';
import WorkerStatusChip from '../components/WorkerStatusChip';
import { useWorkers } from '../hooks/useWorkers';
import { WORKERS_PAGE_SIZE, WORKERS_PERMISSIONS } from '../utils/workers.constants';

const sortOptions = [
  { value: 'code', labelId: 'worker-sort-code' },
  { value: 'name', labelId: 'worker-sort-name' },
  { value: 'operationalJob', labelId: 'worker-sort-operational-job' },
  { value: 'mobileNumber', labelId: 'worker-sort-mobile-number' },
  { value: 'createdAtUtc', labelId: 'worker-sort-created-at' }
] as const;

export default function WorkersListPage() {
  const intl = useIntl();
  const dispatch = useDispatch();
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(WORKERS_PAGE_SIZE);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [isActive, setIsActive] = useState('');
  const [operationalJobId, setOperationalJobId] = useState('');
  const [sortBy, setSortBy] = useState('code');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [isImportWizardOpen, setIsImportWizardOpen] = useState(false);

  const { items: operationalJobs } = useOperationalJobs({ page: 1, pageSize: 100, sortBy: 'name', sortDirection: 'asc' });
  const { items, meta, isLoading, error, mutate } = useWorkers({
    page: page + 1,
    pageSize,
    search,
    isActive: isActive === '' ? undefined : isActive === 'true',
    operationalJobId: operationalJobId || undefined,
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

  const downloadBlob = (blob: Blob, fileName: string) => {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  };

  const handleExport = async () => {
    try {
      const blob = await exportWorkersToExcel();
      downloadBlob(blob, 'workers-export.xlsx');
      notify('تم تنزيل ملف Excel بنجاح.');
    } catch (error) {
      notify(error instanceof Error ? error.message : 'تعذر تنزيل ملف Excel.', 'error');
    }
  };

  const handleTemplateDownload = async () => {
    try {
      const blob = await downloadWorkersImportTemplate();
      downloadBlob(blob, 'workers-import-template.xlsx');
      notify('تم تنزيل قالب الاستيراد بنجاح.');
    } catch (error) {
      notify(error instanceof Error ? error.message : 'تعذر تنزيل قالب الاستيراد.', 'error');
    }
  };

  const runAction = async (action: () => Promise<unknown>) => {
    try {
      await action();
      await mutate();
      notify(intl.formatMessage({ id: 'workers-action-success' }));
    } catch (actionError) {
      notify(actionError instanceof Error ? actionError.message : intl.formatMessage({ id: 'workers-action-failed' }), 'error');
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Breadcrumbs custom heading="workers" links={[{ title: 'labor', to: '/labor/workers' }, { title: 'workers' }]} />
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h2" sx={{ fontWeight: 700 }}>
            <FormattedMessage id="workers" />
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75 }}>
            <FormattedMessage id="workers-page-description" />
          </Typography>
        </Box>
        <Stack direction="row" spacing={1.25} alignItems="center" flexWrap="wrap">
          <ExcelActions
            onExport={handleExport}
            onDownloadTemplate={handleTemplateDownload}
            onImportClick={() => setIsImportWizardOpen(true)}
            exportPermission={WORKERS_PERMISSIONS.view}
            templatePermission={WORKERS_PERMISSIONS.create}
            importPermission={WORKERS_PERMISSIONS.create}
          />
          <PermissionGuard permission={OPERATIONAL_JOBS_PERMISSIONS.view}>
            <Button component={Link} to="/labor/operational-jobs" variant="outlined" startIcon={<IconClipboardList size={18} />}>
              <FormattedMessage id="manage-operational-jobs" />
            </Button>
          </PermissionGuard>
          <Button component={Link} to="/labor/workers/salary-report" variant="outlined" startIcon={<IconClipboardList size={18} />}>
            <FormattedMessage id="salary-report" />
          </Button>
          <PermissionGuard permission={WORKERS_PERMISSIONS.create}>
            <Button component={Link} to="/labor/workers/new" variant="contained" startIcon={<IconPlus size={18} />}>
              <FormattedMessage id="create-worker" />
            </Button>
          </PermissionGuard>
        </Stack>
      </Box>

      <MainCard content={false}>
        <Box sx={{ p: 2, display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: '2fr repeat(4, 1fr)' }, gap: 2, alignItems: 'center' }}>
          <OutlinedInput
            value={searchInput}
            onChange={(event) => {
              setSearchInput(event.target.value);
              setPage(0);
            }}
            placeholder={intl.formatMessage({ id: 'workers-search-placeholder' })}
            startAdornment={<IconSearch size={18} style={{ marginInlineEnd: 8, opacity: 0.7 }} />}
          />
          <Select
            value={operationalJobId}
            onChange={(event) => {
              setOperationalJobId(event.target.value);
              setPage(0);
            }}
            displayEmpty
          >
            <MenuItem value=""><FormattedMessage id="all" /></MenuItem>
            {operationalJobs.map((job) => (
              <MenuItem key={job.id} value={job.id}>{job.code} - {job.name}</MenuItem>
            ))}
          </Select>
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
        </Box>

        {isLoading && (
          <Box sx={{ py: 6 }}>
            <Loader />
          </Box>
        )}
        {error && !isLoading && (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography color="error" sx={{ mb: 2 }}>
              <FormattedMessage id="workers-load-error" />
            </Typography>
            <Button variant="outlined" onClick={() => mutate()}>
              <FormattedMessage id="retry" />
            </Button>
          </Box>
        )}
        {!isLoading && !error && items.length === 0 && (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography color="text.secondary">
              <FormattedMessage id="workers-empty" />
            </Typography>
          </Box>
        )}
        {!isLoading && !error && items.length > 0 && (
          <>
            <TableContainer>
              <Table>
                <TableHead sx={{ bgcolor: 'grey.50' }}>
                  <TableRow>
                    <TableCell><FormattedMessage id="worker-name" /></TableCell>
                    <TableCell><FormattedMessage id="worker-mobile-number" /></TableCell>
                    <TableCell><FormattedMessage id="worker-operational-job" /></TableCell>
                    <TableCell><FormattedMessage id="worker-daily-wage" /></TableCell>
                    <TableCell><FormattedMessage id="expected-monthly-salary" /></TableCell>
                    <TableCell><FormattedMessage id="status" /></TableCell>
                    <TableCell align="center"><FormattedMessage id="actions" /></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {items.map((worker) => (
                    <TableRow key={worker.id} hover sx={{ opacity: worker.isActive ? 1 : 0.72 }}>
                      <TableCell>{worker.name}</TableCell>
                      <TableCell dir="ltr">{worker.mobileNumber ?? '-'}</TableCell>
                      <TableCell>{worker.operationalJobName}</TableCell>
                      <TableCell dir="ltr">{worker.currentWageProfile ? worker.currentWageProfile.dailyWage.toFixed(2) : '-'}</TableCell>
                      <TableCell dir="ltr">{worker.currentWageProfile ? (Math.round((worker.currentWageProfile.dailyWage * 26) / 100) * 100).toFixed(2) : '-'}</TableCell>
                      <TableCell><WorkerStatusChip isActive={worker.isActive} /></TableCell>
                      <TableCell align="center">
                        <Stack direction="row" spacing={1} justifyContent="center" flexWrap="wrap">
                          <PermissionGuard permission={WORKERS_PERMISSIONS.view}>
                            <Tooltip title={intl.formatMessage({ id: 'action-view-worker' })}>
                              <IconButton
                                component={Link}
                                to={`/labor/workers/${worker.id}`}
                                size="small"
                                color="info"
                                sx={{ border: '1px solid', borderColor: 'divider' }}
                                aria-label={intl.formatMessage({ id: 'action-view-worker' })}
                              >
                                <IconEye size={18} />
                              </IconButton>
                            </Tooltip>
                          </PermissionGuard>
                          <PermissionGuard permission={WORKERS_PERMISSIONS.edit}>
                            <Tooltip title={intl.formatMessage({ id: 'action-edit-worker' })}>
                              <IconButton
                                component={Link}
                                to={`/labor/workers/${worker.id}/edit`}
                                size="small"
                                color="primary"
                                sx={{ border: '1px solid', borderColor: 'divider' }}
                                aria-label={intl.formatMessage({ id: 'action-edit-worker' })}
                              >
                                <IconEdit size={18} />
                              </IconButton>
                            </Tooltip>
                          </PermissionGuard>
                          <PermissionGuard permission={WORKERS_PERMISSIONS.edit}>
                            <Tooltip title={intl.formatMessage({ id: 'action-salary-details' })}>
                              <IconButton
                                component={Link}
                                to={`/labor/workers/${worker.id}?salary=create`}
                                size="small"
                                color="warning"
                                sx={{ border: '1px solid', borderColor: 'divider' }}
                                aria-label={intl.formatMessage({ id: 'action-salary-details' })}
                              >
                                <IconCoins size={18} />
                              </IconButton>
                            </Tooltip>
                          </PermissionGuard>
                          <PermissionGuard permission={WORKERS_PERMISSIONS.changeStatus}>
                            <Tooltip title={intl.formatMessage({ id: worker.isActive ? 'action-deactivate-worker' : 'action-activate-worker' })}>
                              <IconButton
                                size="small"
                                color={worker.isActive ? 'error' : 'success'}
                                sx={{ border: '1px solid', borderColor: 'divider' }}
                                onClick={() => runAction(() => (worker.isActive ? deactivateWorker(worker.id, worker.rowVersion) : activateWorker(worker.id, worker.rowVersion)))}
                                aria-label={intl.formatMessage({ id: worker.isActive ? 'action-deactivate-worker' : 'action-activate-worker' })}
                              >
                                {worker.isActive ? <IconToggleLeft size={18} /> : <IconToggleRight size={18} />}
                              </IconButton>
                            </Tooltip>
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

      <WorkerImportWizard
        open={isImportWizardOpen}
        onClose={() => setIsImportWizardOpen(false)}
        onImported={async () => {
          await mutate();
        }}
      />
    </Box>
  );
}
