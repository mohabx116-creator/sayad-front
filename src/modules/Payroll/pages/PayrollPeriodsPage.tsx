import { useEffect, useMemo, useState } from 'react';
import { useIntl } from 'react-intl';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
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
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import {
  IconCheck,
  IconEye,
  IconPencil,
  IconPlus,
  IconRefresh,
  IconSearch,
  IconTrash
} from '@tabler/icons-react';

import { useDispatch } from 'store';
import { openSnackbar } from 'store/slices/snackbar';
import PermissionGuard from 'modules/Administration/components/PermissionGuard';
import Breadcrumbs from 'ui-component/extended/Breadcrumbs';
import Loader from 'ui-component/Loader';
import MainCard from 'ui-component/cards/MainCard';

import {
  confirmPayrollPeriod,
  createPayrollPeriod,
  deletePayrollPeriod,
  updatePayrollPeriod
} from '../api/payrollApi';
import { usePayrollPeriod, usePayrollPeriods } from '../hooks/usePayroll';
import { PAYROLL_PAGE_SIZE, PAYROLL_PERMISSIONS } from '../utils/payroll.constants';
import type { PayrollPeriodFormValues, PayrollPeriodListItemDto, PayrollStatementDto } from '../types/payroll.types';

type PayrollFilters = {
  page: number;
  pageSize: number;
  search: string;
  year: string;
  month: string;
  sortBy: string;
  sortDirection: 'asc' | 'desc';
};

function t(locale: string, ar: string, en: string) {
  return locale.startsWith('ar') ? ar : en;
}

function formatCurrency(locale: string, value: number) {
  return new Intl.NumberFormat(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value);
}

function formatMonthLabel(locale: string, year: number, month: number) {
  return new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric' }).format(new Date(year, month - 1, 1));
}

function createDefaultForm(): PayrollPeriodFormValues {
  const today = new Date();
  return {
    year: String(today.getFullYear()),
    month: String(today.getMonth() + 1),
    notes: ''
  };
}

function getPeriodStatusLabel(locale: string, status: number) {
  switch (status) {
    case 1:
      return t(locale, 'مسودة', 'Draft');
    case 2:
      return t(locale, 'مؤكدة', 'Confirmed');
    case 3:
      return t(locale, 'معتمدة', 'Approved');
    case 4:
      return t(locale, 'مدفوعة', 'Paid');
    default:
      return String(status);
  }
}

function getPeriodStatusColor(status: number) {
  switch (status) {
    case 1:
      return 'default' as const;
    case 2:
      return 'success' as const;
    case 3:
      return 'info' as const;
    case 4:
      return 'primary' as const;
    default:
      return 'default' as const;
  }
}

function getMovementSourceLabel(locale: string, value: string | null | undefined) {
  if (!value) {
    return t(locale, 'غير محدد', 'Unknown');
  }

  if (value === 'Accountant') {
    return t(locale, 'محاسب', 'Accountant');
  }

  if (value === 'Manager') {
    return t(locale, 'مدير', 'Manager');
  }

  if (value === 'Unknown') {
    return t(locale, 'غير محدد', 'Unknown');
  }

  return value;
}

function SummaryCard({ label, value }: { label: string; value: string | number }) {
  return (
    <Card sx={{ p: 2.5, borderRadius: 3, border: '1px solid', borderColor: 'divider', height: '100%' }}>
      <Stack spacing={0.75}>
        <Typography variant="body2" color="text.secondary">
          {label}
        </Typography>
        <Typography variant="h4" fontWeight={800}>
          {value}
        </Typography>
      </Stack>
    </Card>
  );
}

function additionsTotal(statement: PayrollStatementDto) {
  return statement.mealAllowance + statement.overtimeAmount + statement.nightWorkAmount + statement.bonusAmount;
}

function deductionsTotal(statement: PayrollStatementDto) {
  return statement.absenceDeduction + statement.otherDeductionAmount;
}

export default function PayrollPeriodsPage() {
  const intl = useIntl();
  const dispatch = useDispatch();
  const [filters, setFilters] = useState<PayrollFilters>({
    page: 0,
    pageSize: PAYROLL_PAGE_SIZE,
    search: '',
    year: '',
    month: '',
    sortBy: 'year',
    sortDirection: 'desc'
  });
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [createForm, setCreateForm] = useState<PayrollPeriodFormValues>(createDefaultForm());
  const [editNotes, setEditNotes] = useState('');
  const [selectedPeriodId, setSelectedPeriodId] = useState<string | null>(null);
  const [selectedStatementId, setSelectedStatementId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const { items: periods, meta, isLoading, mutate: refreshPeriods } = usePayrollPeriods({
    page: filters.page + 1,
    pageSize: filters.pageSize,
    search: filters.search || undefined,
    year: filters.year ? Number(filters.year) : undefined,
    month: filters.month ? Number(filters.month) : undefined,
    sortBy: filters.sortBy,
    sortDirection: filters.sortDirection
  });

  const { period: selectedPeriod, isLoading: selectedPeriodLoading, mutate: refreshSelectedPeriod } = usePayrollPeriod(selectedPeriodId ?? undefined);

  useEffect(() => {
    if (!selectedPeriodId && periods.length > 0) {
      setSelectedPeriodId(periods[0].id);
      return;
    }

    if (selectedPeriodId && !periods.some((period) => period.id === selectedPeriodId)) {
      setSelectedPeriodId(periods[0]?.id ?? null);
    }
  }, [periods, selectedPeriodId]);

  useEffect(() => {
    setSelectedStatementId(selectedPeriod?.statements[0]?.id ?? null);
    setEditNotes(selectedPeriod?.notes ?? '');
  }, [selectedPeriod]);

  const summary = useMemo(() => {
    const draftPeriods = periods.filter((period) => period.status === 1).length;
    const confirmedPeriods = periods.length - draftPeriods;
    const netTotal = periods.reduce((sum, period) => sum + period.totalNetWage, 0);

    return { draftPeriods, confirmedPeriods, netTotal };
  }, [periods]);

  const selectedStatement = useMemo(() => {
    if (!selectedPeriod) {
      return null;
    }

    return selectedPeriod.statements.find((statement) => statement.id === selectedStatementId) ?? selectedPeriod.statements[0] ?? null;
  }, [selectedPeriod, selectedStatementId]);

  const filteredYearOptions = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return [currentYear - 1, currentYear, currentYear + 1];
  }, []);

  function notify(message: string, variant: 'success' | 'error' = 'success') {
    dispatch(
      openSnackbar({
        open: true,
        message,
        variant,
        alert: { color: variant }
      })
    );
  }

  async function handleCreatePeriod() {
    setBusy(true);
    try {
      const created = await createPayrollPeriod({
        year: Number(createForm.year),
        month: Number(createForm.month),
        notes: createForm.notes.trim() || null
      });
      setIsCreateOpen(false);
      setCreateForm(createDefaultForm());
      await refreshPeriods();
      setSelectedPeriodId(created.id);
      await refreshSelectedPeriod();
      notify(t(intl.locale, 'تم إنشاء مسير الرواتب بنجاح.', 'Payroll period created successfully.'));
    } catch (error) {
      notify(error instanceof Error ? error.message : t(intl.locale, 'تعذر إنشاء مسير الرواتب.', 'Unable to create payroll period.'), 'error');
    } finally {
      setBusy(false);
    }
  }

  async function handleUpdateNotes() {
    if (!selectedPeriod) {
      return;
    }

    setBusy(true);
    try {
      await updatePayrollPeriod(selectedPeriod.id, { notes: editNotes.trim() || null });
      setIsEditOpen(false);
      await refreshPeriods();
      await refreshSelectedPeriod();
      notify(t(intl.locale, 'تم تحديث الملاحظات بنجاح.', 'Payroll notes updated successfully.'));
    } catch (error) {
      notify(error instanceof Error ? error.message : t(intl.locale, 'تعذر تحديث الملاحظات.', 'Unable to update payroll notes.'), 'error');
    } finally {
      setBusy(false);
    }
  }

  async function handleConfirmPeriod() {
    if (!selectedPeriod) {
      return;
    }

    setBusy(true);
    try {
      await confirmPayrollPeriod(selectedPeriod.id);
      await refreshPeriods();
      await refreshSelectedPeriod();
      notify(t(intl.locale, 'تم تأكيد مسير الرواتب بنجاح.', 'Payroll period confirmed successfully.'));
    } catch (error) {
      notify(error instanceof Error ? error.message : t(intl.locale, 'تعذر تأكيد مسير الرواتب.', 'Unable to confirm payroll period.'), 'error');
    } finally {
      setBusy(false);
    }
  }

  async function handleDeletePeriod() {
    if (!selectedPeriod) {
      return;
    }

    const confirmed = window.confirm(
      t(
        intl.locale,
        `هل تريد حذف مسير الرواتب لشهر ${selectedPeriod.month} / ${selectedPeriod.year}؟`,
        `Delete the payroll period for ${selectedPeriod.month} / ${selectedPeriod.year}?`
      )
    );

    if (!confirmed) {
      return;
    }

    setBusy(true);
    try {
      await deletePayrollPeriod(selectedPeriod.id, selectedPeriod.rowVersion);
      await refreshPeriods();
      setSelectedPeriodId(null);
      setSelectedStatementId(null);
      notify(t(intl.locale, 'تم حذف مسير الرواتب بنجاح.', 'Payroll period deleted successfully.'));
    } catch (error) {
      notify(error instanceof Error ? error.message : t(intl.locale, 'تعذر حذف مسير الرواتب.', 'Unable to delete payroll period.'), 'error');
    } finally {
      setBusy(false);
    }
  }

  const periodRows = periods;
  const statementRows = selectedPeriod?.statements ?? [];

  return (
    <MainCard content={false}>
      <Box sx={{ p: { xs: 2, md: 3 } }}>
        <Breadcrumbs custom heading="payroll" links={[{ title: 'labor', to: '/labor/workers' }, { title: 'payroll' }]} />

        <Stack spacing={1.5} sx={{ mb: 3 }}>
          <Typography variant="h3" fontWeight={900}>
            {t(intl.locale, 'مسير الرواتب الشهري', 'Monthly Payroll')}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {t(
              intl.locale,
              'عرض بسيط لفترات الرواتب الشهرية مع الكشوف والخصومات داخل كل شهر.',
              'A simple monthly payroll view with worker statements and deductions inside each month.'
            )}
          </Typography>
        </Stack>

        <Grid container spacing={2.25} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} lg={3}>
            <SummaryCard label={t(intl.locale, 'الفترات المعروضة', 'Periods in view')} value={meta.totalCount} />
          </Grid>
          <Grid item xs={12} sm={6} lg={3}>
            <SummaryCard label={t(intl.locale, 'مسودات', 'Draft periods')} value={summary.draftPeriods} />
          </Grid>
          <Grid item xs={12} sm={6} lg={3}>
            <SummaryCard label={t(intl.locale, 'مؤكدة', 'Confirmed periods')} value={summary.confirmedPeriods} />
          </Grid>
          <Grid item xs={12} sm={6} lg={3}>
            <SummaryCard label={t(intl.locale, 'إجمالي الصافي', 'Net total')} value={formatCurrency(intl.locale, summary.netTotal)} />
          </Grid>
        </Grid>

        <Card sx={{ p: 2.25, mb: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
          <Stack spacing={2}>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5} alignItems={{ xs: 'stretch', md: 'center' }} justifyContent="space-between">
              <Stack direction="row" spacing={1.5} flexWrap="wrap" alignItems="center">
                <TextField
                  size="small"
                  placeholder={t(intl.locale, 'بحث بالملاحظات أو الشهر', 'Search by notes or month')}
                  value={filters.search}
                  onChange={(event) => setFilters((current) => ({ ...current, page: 0, search: event.target.value }))}
                  InputProps={{
                    startAdornment: <IconSearch size={16} />
                  }}
                />
                <Select
                  size="small"
                  value={filters.year}
                  displayEmpty
                  onChange={(event) => setFilters((current) => ({ ...current, page: 0, year: String(event.target.value) }))}
                  input={<OutlinedInput />}
                  sx={{ minWidth: 120 }}
                >
                  <MenuItem value="">{t(intl.locale, 'السنة', 'Year')}</MenuItem>
                  {filteredYearOptions.map((year) => (
                    <MenuItem key={year} value={String(year)}>
                      {year}
                    </MenuItem>
                  ))}
                </Select>
                <Select
                  size="small"
                  value={filters.month}
                  displayEmpty
                  onChange={(event) => setFilters((current) => ({ ...current, page: 0, month: String(event.target.value) }))}
                  input={<OutlinedInput />}
                  sx={{ minWidth: 120 }}
                >
                  <MenuItem value="">{t(intl.locale, 'الشهر', 'Month')}</MenuItem>
                  {Array.from({ length: 12 }, (_, index) => index + 1).map((month) => (
                    <MenuItem key={month} value={String(month)}>
                      {month}
                    </MenuItem>
                  ))}
                </Select>
              </Stack>

              <PermissionGuard permission={PAYROLL_PERMISSIONS.create}>
                <Button
                  variant="contained"
                  startIcon={<IconPlus size={16} />}
                  onClick={() => setIsCreateOpen(true)}
                >
                  {t(intl.locale, 'إنشاء فترة جديدة', 'Create payroll period')}
                </Button>
              </PermissionGuard>
            </Stack>
          </Stack>
        </Card>

        <Grid container spacing={2.25}>
          <Grid item xs={12} lg={5}>
            <MainCard
              title={t(intl.locale, 'فترات الرواتب', 'Payroll periods')}
              content={false}
              secondary={
                <IconButton onClick={() => refreshPeriods()} disabled={isLoading || busy}>
                  <IconRefresh size={18} />
                </IconButton>
              }
            >
              {isLoading ? (
                <Box sx={{ p: 3 }}>
                  <Loader />
                </Box>
              ) : periodRows.length === 0 ? (
                <Box sx={{ p: 3 }}>
                  <Alert severity="info">{t(intl.locale, 'لا توجد فترات رواتب بعد.', 'No payroll periods found yet.')}</Alert>
                </Box>
              ) : (
                <>
                  <TableContainer sx={{ maxHeight: 560 }}>
                    <Table stickyHeader size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>{t(intl.locale, 'الشهر', 'Month')}</TableCell>
                          <TableCell>{t(intl.locale, 'الحالة', 'Status')}</TableCell>
                          <TableCell align="right">{t(intl.locale, 'الصافي', 'Net')}</TableCell>
                          <TableCell align="right">{t(intl.locale, 'الإجراءات', 'Actions')}</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {periodRows.map((period: PayrollPeriodListItemDto) => {
                          const isSelected = period.id === selectedPeriodId;
                          return (
                            <TableRow
                              key={period.id}
                              hover
                              selected={isSelected}
                              sx={{ cursor: 'pointer' }}
                              onClick={() => setSelectedPeriodId(period.id)}
                            >
                              <TableCell>
                                <Stack spacing={0.5}>
                                  <Typography fontWeight={700}>{formatMonthLabel(intl.locale, period.year, period.month)}</Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    {period.workerCount} {t(intl.locale, 'عامل', 'worker(s)')}
                                  </Typography>
                                </Stack>
                              </TableCell>
                              <TableCell>
                                <Chip size="small" color={getPeriodStatusColor(period.status)} label={getPeriodStatusLabel(intl.locale, period.status)} />
                              </TableCell>
                              <TableCell align="right">{formatCurrency(intl.locale, period.totalNetWage)}</TableCell>
                              <TableCell align="right" onClick={(event) => event.stopPropagation()}>
                                <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                                  <IconButton size="small" onClick={() => setSelectedPeriodId(period.id)}>
                                    <IconEye size={16} />
                                  </IconButton>
                                </Stack>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </TableContainer>

                  <TablePagination
                    component="div"
                    count={meta.totalCount}
                    page={filters.page}
                    rowsPerPage={filters.pageSize}
                    onPageChange={(_, nextPage) => setFilters((current) => ({ ...current, page: nextPage }))}
                    onRowsPerPageChange={(event) =>
                      setFilters((current) => ({
                        ...current,
                        page: 0,
                        pageSize: Number(event.target.value)
                      }))
                    }
                    rowsPerPageOptions={[5, 10, 20, 50]}
                  />
                </>
              )}
            </MainCard>
          </Grid>

          <Grid item xs={12} lg={7}>
            <MainCard
              title={selectedPeriod ? formatMonthLabel(intl.locale, selectedPeriod.year, selectedPeriod.month) : t(intl.locale, 'تفاصيل الفترة', 'Period details')}
              content={false}
              secondary={
                <Stack direction="row" spacing={0.5}>
                  <PermissionGuard permission={PAYROLL_PERMISSIONS.create}>
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<IconPencil size={16} />}
                      onClick={() => setIsEditOpen(true)}
                      disabled={!selectedPeriod || selectedPeriod.status !== 1 || busy}
                    >
                      {t(intl.locale, 'تعديل', 'Edit')}
                    </Button>
                  </PermissionGuard>
                  <PermissionGuard permission={PAYROLL_PERMISSIONS.calculate}>
                    <Button
                      size="small"
                      variant="contained"
                      color="success"
                      startIcon={<IconCheck size={16} />}
                      onClick={handleConfirmPeriod}
                      disabled={!selectedPeriod || selectedPeriod.status !== 1 || busy}
                    >
                      {t(intl.locale, 'تأكيد', 'Confirm')}
                    </Button>
                  </PermissionGuard>
                  <PermissionGuard permission={PAYROLL_PERMISSIONS.delete}>
                    <Button
                      size="small"
                      variant="outlined"
                      color="error"
                      startIcon={<IconTrash size={16} />}
                      onClick={handleDeletePeriod}
                      disabled={!selectedPeriod || selectedPeriod.status !== 1 || busy}
                    >
                      {t(intl.locale, 'حذف', 'Delete')}
                    </Button>
                  </PermissionGuard>
                </Stack>
              }
            >
              {selectedPeriodLoading ? (
                <Box sx={{ p: 3 }}>
                  <Loader />
                </Box>
              ) : !selectedPeriod ? (
                <Box sx={{ p: 3 }}>
                  <Alert severity="info">{t(intl.locale, 'اختر فترة رواتب لعرض تفاصيلها.', 'Select a payroll period to view details.')}</Alert>
                </Box>
              ) : (
                <Box sx={{ p: 2.25 }}>
                  <Stack spacing={2.25}>
                    <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5} justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'center' }}>
                      <Stack spacing={0.75}>
                        <Typography variant="h5" fontWeight={800}>
                          {formatMonthLabel(intl.locale, selectedPeriod.year, selectedPeriod.month)}
                        </Typography>
                        <Stack direction="row" spacing={1} flexWrap="wrap">
                          <Chip size="small" label={`${selectedPeriod.year}`} variant="outlined" />
                          <Chip size="small" label={`${selectedPeriod.month}`} variant="outlined" />
                          <Chip size="small" color={getPeriodStatusColor(selectedPeriod.status)} label={getPeriodStatusLabel(intl.locale, selectedPeriod.status)} />
                        </Stack>
                      </Stack>

                      <Stack direction="row" spacing={1}>
                        <Button size="small" variant="text" onClick={() => setIsCreateOpen(true)} startIcon={<IconPlus size={16} />}>
                          {t(intl.locale, 'جديد', 'New')}
                        </Button>
                        <Button
                          size="small"
                          variant="text"
                          onClick={() => refreshSelectedPeriod()}
                          startIcon={<IconRefresh size={16} />}
                        >
                          {t(intl.locale, 'تحديث', 'Refresh')}
                        </Button>
                      </Stack>
                    </Stack>

                    <Grid container spacing={1.5}>
                      <Grid item xs={12} sm={6} md={3}>
                        <SummaryCard label={t(intl.locale, 'العمال', 'Workers')} value={selectedPeriod.workerCount} />
                      </Grid>
                      <Grid item xs={12} sm={6} md={3}>
                        <SummaryCard label={t(intl.locale, 'الأجر الأساسي', 'Basic wage')} value={formatCurrency(intl.locale, selectedPeriod.totalBasicWage)} />
                      </Grid>
                      <Grid item xs={12} sm={6} md={3}>
                        <SummaryCard label={t(intl.locale, 'إجمالي الخصومات', 'Total deductions')} value={formatCurrency(intl.locale, selectedPeriod.totalDeductions)} />
                      </Grid>
                      <Grid item xs={12} sm={6} md={3}>
                        <SummaryCard label={t(intl.locale, 'صافي الأجر', 'Net wage')} value={formatCurrency(intl.locale, selectedPeriod.totalNetWage)} />
                      </Grid>
                    </Grid>

                    <Card sx={{ p: 2, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
                      <Typography variant="subtitle2" gutterBottom>
                        {t(intl.locale, 'ملاحظات', 'Notes')}
                      </Typography>
                      <Typography variant="body2" color={selectedPeriod.notes ? 'text.primary' : 'text.secondary'}>
                        {selectedPeriod.notes ?? t(intl.locale, 'لا توجد ملاحظات.', 'No notes.')}
                      </Typography>
                    </Card>

                    <Box>
                      <Typography variant="h6" fontWeight={800} sx={{ mb: 1.5 }}>
                        {t(intl.locale, 'كشوف العمال', 'Worker statements')}
                      </Typography>
                      <TableContainer sx={{ maxHeight: 380 }}>
                        <Table stickyHeader size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell>{t(intl.locale, 'العامل', 'Worker')}</TableCell>
                              <TableCell align="right">{t(intl.locale, 'الأجر اليومي', 'Daily wage')}</TableCell>
                              <TableCell align="right">{t(intl.locale, 'أيام مستحقة', 'Payable days')}</TableCell>
                              <TableCell align="right">{t(intl.locale, 'غياب', 'Absence')}</TableCell>
                              <TableCell align="right">{t(intl.locale, 'الإضافات', 'Additions')}</TableCell>
                              <TableCell align="right">{t(intl.locale, 'الخصومات', 'Deductions')}</TableCell>
                              <TableCell align="right">{t(intl.locale, 'الصافي', 'Net')}</TableCell>
                              <TableCell>{t(intl.locale, 'الحالة', 'Status')}</TableCell>
                              <TableCell align="right">{t(intl.locale, 'عرض', 'View')}</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {statementRows.map((statement) => (
                              <TableRow
                                key={statement.id}
                                hover
                                selected={statement.id === selectedStatement?.id}
                                sx={{ cursor: 'pointer' }}
                                onClick={() => setSelectedStatementId(statement.id)}
                              >
                                <TableCell>
                                  <Stack spacing={0.25}>
                                    <Typography fontWeight={700}>{statement.workerNameSnapshot}</Typography>
                                    <Typography variant="caption" color="text.secondary">
                                      {statement.workerCodeSnapshot} - {statement.operationalJobNameSnapshot}
                                    </Typography>
                                  </Stack>
                                </TableCell>
                                <TableCell align="right">{formatCurrency(intl.locale, statement.dailyWageSnapshot)}</TableCell>
                                <TableCell align="right">{statement.payableMealDays}</TableCell>
                                <TableCell align="right">{statement.absenceDays}</TableCell>
                                <TableCell align="right">{formatCurrency(intl.locale, additionsTotal(statement))}</TableCell>
                                <TableCell align="right">{formatCurrency(intl.locale, deductionsTotal(statement))}</TableCell>
                                <TableCell align="right">{formatCurrency(intl.locale, statement.netWage)}</TableCell>
                                <TableCell>
                                  <Chip size="small" label={getPeriodStatusLabel(intl.locale, selectedPeriod.status)} color={getPeriodStatusColor(selectedPeriod.status)} />
                                </TableCell>
                                <TableCell align="right" onClick={(event) => event.stopPropagation()}>
                                  <IconButton size="small" onClick={() => setSelectedStatementId(statement.id)}>
                                    <IconEye size={16} />
                                  </IconButton>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </Box>

                    {selectedStatement && (
                      <Card sx={{ p: 2, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
                        <Stack spacing={1.5}>
                          <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={1}>
                            <Box>
                              <Typography variant="h6" fontWeight={800}>
                                {selectedStatement.workerNameSnapshot}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {selectedStatement.workerCodeSnapshot} - {selectedStatement.operationalJobNameSnapshot}
                              </Typography>
                            </Box>
                            <Stack direction="row" spacing={1} flexWrap="wrap">
                              <Chip size="small" variant="outlined" label={`${t(intl.locale, 'الأجر اليومي', 'Daily wage')}: ${formatCurrency(intl.locale, selectedStatement.dailyWageSnapshot)}`} />
                              <Chip size="small" variant="outlined" label={`${t(intl.locale, 'صافي الأجر', 'Net wage')}: ${formatCurrency(intl.locale, selectedStatement.netWage)}`} />
                            </Stack>
                          </Stack>

                          <Grid container spacing={1.5}>
                            <Grid item xs={12} sm={6} md={3}>
                              <SummaryCard label={t(intl.locale, 'بدل الوجبة', 'Meal allowance')} value={formatCurrency(intl.locale, selectedStatement.mealAllowance)} />
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                              <SummaryCard label={t(intl.locale, 'الإضافي', 'Overtime')} value={formatCurrency(intl.locale, selectedStatement.overtimeAmount)} />
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                              <SummaryCard label={t(intl.locale, 'ليلي', 'Night work')} value={formatCurrency(intl.locale, selectedStatement.nightWorkAmount)} />
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                              <SummaryCard label={t(intl.locale, 'مكافآت', 'Bonuses')} value={formatCurrency(intl.locale, selectedStatement.bonusAmount)} />
                            </Grid>
                          </Grid>

                          <Typography variant="subtitle2" sx={{ mt: 0.5 }}>
                            {t(intl.locale, 'خصومات المسير', 'Payroll deductions')}
                          </Typography>
                          <TableContainer>
                            <Table size="small">
                              <TableHead>
                                <TableRow>
                                  <TableCell>{t(intl.locale, 'المبلغ', 'Amount')}</TableCell>
                                  <TableCell>{t(intl.locale, 'السبب', 'Reason')}</TableCell>
                                  <TableCell>{t(intl.locale, 'المصدر', 'Source')}</TableCell>
                                  <TableCell>{t(intl.locale, 'ملاحظة', 'Note')}</TableCell>
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {selectedStatement.movements.filter((movement) => movement.effectSnapshot === 2).length === 0 ? (
                                  <TableRow>
                                    <TableCell colSpan={4}>
                                      <Alert severity="info">{t(intl.locale, 'لا توجد خصومات داخل هذا الكشف.', 'No deductions in this statement.')}</Alert>
                                    </TableCell>
                                  </TableRow>
                                ) : (
                                  selectedStatement.movements
                                    .filter((movement) => movement.effectSnapshot === 2)
                                    .map((movement) => (
                                      <TableRow key={movement.id}>
                                        <TableCell>{formatCurrency(intl.locale, movement.amountSnapshot)}</TableCell>
                                        <TableCell>{movement.reasonSnapshot}</TableCell>
                                        <TableCell>{getMovementSourceLabel(intl.locale, movement.createdBySourceLabel)}</TableCell>
                                        <TableCell>{movement.noteSnapshot ?? '-'}</TableCell>
                                      </TableRow>
                                    ))
                                )}
                              </TableBody>
                            </Table>
                          </TableContainer>
                        </Stack>
                      </Card>
                    )}
                  </Stack>
                </Box>
              )}
            </MainCard>
          </Grid>
        </Grid>
      </Box>

      <Dialog open={isCreateOpen} onClose={() => setIsCreateOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>{t(intl.locale, 'إنشاء مسير رواتب', 'Create payroll period')}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              type="number"
              label={t(intl.locale, 'السنة', 'Year')}
              value={createForm.year}
              onChange={(event) => setCreateForm((current) => ({ ...current, year: event.target.value }))}
              fullWidth
            />
            <TextField
              type="number"
              label={t(intl.locale, 'الشهر', 'Month')}
              value={createForm.month}
              onChange={(event) => setCreateForm((current) => ({ ...current, month: event.target.value }))}
              fullWidth
            />
            <TextField
              label={t(intl.locale, 'ملاحظات', 'Notes')}
              value={createForm.notes}
              onChange={(event) => setCreateForm((current) => ({ ...current, notes: event.target.value }))}
              fullWidth
              multiline
              minRows={3}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsCreateOpen(false)}>{t(intl.locale, 'إلغاء', 'Cancel')}</Button>
          <Button variant="contained" onClick={handleCreatePeriod} disabled={busy}>
            {t(intl.locale, 'إنشاء', 'Create')}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={isEditOpen} onClose={() => setIsEditOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>{t(intl.locale, 'تعديل ملاحظات المسير', 'Edit payroll notes')}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Alert severity="info">
              {t(intl.locale, 'يمكن تعديل الملاحظات فقط في فترة المسودة.', 'Only draft periods can be edited.')}
            </Alert>
            <TextField
              label={t(intl.locale, 'ملاحظات', 'Notes')}
              value={editNotes}
              onChange={(event) => setEditNotes(event.target.value)}
              fullWidth
              multiline
              minRows={4}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsEditOpen(false)}>{t(intl.locale, 'إلغاء', 'Cancel')}</Button>
          <Button variant="contained" onClick={handleUpdateNotes} disabled={busy}>
            {t(intl.locale, 'حفظ', 'Save')}
          </Button>
        </DialogActions>
      </Dialog>
    </MainCard>
  );
}
