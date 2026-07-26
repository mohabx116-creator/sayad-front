import { useEffect, useMemo, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';

import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
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
import { IconCalculator, IconCashBanknote, IconCheck, IconEye, IconPlus, IconRefresh, IconSearch, IconTrash } from '@tabler/icons-react';

import { useDispatch } from 'store';
import { openSnackbar } from 'store/slices/snackbar';
import PermissionGuard from 'modules/Administration/components/PermissionGuard';
import Breadcrumbs from 'ui-component/extended/Breadcrumbs';
import Loader from 'ui-component/Loader';
import MainCard from 'ui-component/cards/MainCard';

import { approvePayrollPeriod, calculatePayrollPeriod, createPayrollPeriod, deletePayrollPeriod, payPayrollPeriod, recalculatePayrollPeriod } from '../api/payrollApi';
import { usePayrollPeriod, usePayrollPeriods } from '../hooks/usePayroll';
import { PAYROLL_PAGE_SIZE, PAYROLL_PERIOD_STATUS, PAYROLL_PERMISSIONS } from '../utils/payroll.constants';
import type { PayrollPeriodFormValues, PayrollPeriodListItemDto, PayrollStatementDto } from '../types/payroll.types';
import { useTreasuryAccounts } from 'modules/Treasury/hooks/useTreasury';
import { TREASURY_LOOKUP_PAGE_SIZE } from 'modules/Treasury/utils/treasury.constants';

function formatCurrency(locale: string, value: number) {
  return new Intl.NumberFormat(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value);
}

function formatDate(locale: string, value: string | null) {
  if (!value) {
    return '-';
  }

  return new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(new Date(value));
}

function formatDateTime(locale: string, value: string | null) {
  if (!value) {
    return '-';
  }

  return new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));
}

function formatMonthLabel(locale: string, year: number, month: number) {
  return new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric' }).format(new Date(year, month - 1, 1));
}

function getStatusLabelId(status: number) {
  if (status === PAYROLL_PERIOD_STATUS.Approved) {
    return 'payroll-period-status-approved';
  }

  if (status === PAYROLL_PERIOD_STATUS.Paid) {
    return 'payroll-period-status-paid';
  }

  return status === PAYROLL_PERIOD_STATUS.Calculated ? 'payroll-period-status-calculated' : 'payroll-period-status-draft';
}

function getStatusColor(status: number) {
  if (status === PAYROLL_PERIOD_STATUS.Approved) {
    return 'info' as const;
  }

  if (status === PAYROLL_PERIOD_STATUS.Paid) {
    return 'success' as const;
  }

  if (status === PAYROLL_PERIOD_STATUS.Calculated) {
    return 'success' as const;
  }

  return 'default' as const;
}

function isActionableForCalculation(status: number) {
  return status === PAYROLL_PERIOD_STATUS.Draft || status === PAYROLL_PERIOD_STATUS.Calculated;
}

function getMovementEffectColor(effectSnapshot: number) {
  return effectSnapshot === 2 ? 'warning' : 'success';
}

function createDefaultForm(): PayrollPeriodFormValues {
  const today = new Date();
  return {
    year: String(today.getFullYear()),
    month: String(today.getMonth() + 1),
    notes: ''
  };
}

function toPayload(form: PayrollPeriodFormValues) {
  return {
    year: Number(form.year),
    month: Number(form.month),
    notes: form.notes.trim() || null
  };
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

function StatementCard({ locale, statement }: { locale: string; statement: PayrollStatementDto }) {
  return (
    <Card sx={{ p: 2.5, borderRadius: 3, border: '1px solid', borderColor: statement.hasNegativeNetWage ? 'warning.light' : 'divider' }}>
      <Stack spacing={2}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5} justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'center' }}>
          <Box>
            <Typography variant="h6" fontWeight={800}>
              {statement.workerCodeSnapshot} - {statement.workerNameSnapshot}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {statement.operationalJobNameSnapshot}
            </Typography>
          </Box>
          <Stack direction="row" spacing={1} flexWrap="wrap">
            <Chip label={statement.mealAllowanceTypeLabel} size="small" variant="outlined" />
            <Chip label={statement.overtimeCalculationTypeLabel} size="small" variant="outlined" />
            {statement.hasNegativeNetWage && <Chip color="warning" label={<FormattedMessage id="payroll-negative-net-warning" />} size="small" />}
          </Stack>
        </Stack>

        <Grid container spacing={1.5}>
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="body2" color="text.secondary">
              <FormattedMessage id="worker-daily-wage" />
            </Typography>
            <Typography fontWeight={700}>{formatCurrency(locale, statement.dailyWageSnapshot)}</Typography>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="body2" color="text.secondary">
              <FormattedMessage id="worker-monthly-days-basis" />
            </Typography>
            <Typography fontWeight={700}>{statement.monthlyDaysBasisSnapshot}</Typography>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="body2" color="text.secondary">
              <FormattedMessage id="payroll-basic-wage" />
            </Typography>
            <Typography fontWeight={700}>{formatCurrency(locale, statement.basicWage)}</Typography>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="body2" color="text.secondary">
              <FormattedMessage id="payroll-net-wage" />
            </Typography>
            <Typography fontWeight={700}>{formatCurrency(locale, statement.netWage)}</Typography>
          </Grid>
        </Grid>

        <Grid container spacing={1.5}>
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="body2" color="text.secondary">
              <FormattedMessage id="payroll-meal-allowance" />
            </Typography>
            <Typography fontWeight={700}>{formatCurrency(locale, statement.mealAllowance)}</Typography>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="body2" color="text.secondary">
              <FormattedMessage id="payroll-overtime" />
            </Typography>
            <Typography fontWeight={700}>{formatCurrency(locale, statement.overtimeAmount)}</Typography>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="body2" color="text.secondary">
              <FormattedMessage id="payroll-night-work" />
            </Typography>
            <Typography fontWeight={700}>{formatCurrency(locale, statement.nightWorkAmount)}</Typography>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="body2" color="text.secondary">
              <FormattedMessage id="payroll-bonuses" />
            </Typography>
            <Typography fontWeight={700}>{formatCurrency(locale, statement.bonusAmount)}</Typography>
          </Grid>
        </Grid>

        <Grid container spacing={1.5}>
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="body2" color="text.secondary">
              <FormattedMessage id="payroll-absence-deductions" />
            </Typography>
            <Typography fontWeight={700}>{formatCurrency(locale, statement.absenceDeduction)}</Typography>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="body2" color="text.secondary">
              <FormattedMessage id="payroll-other-deductions" />
            </Typography>
            <Typography fontWeight={700}>{formatCurrency(locale, statement.otherDeductionAmount)}</Typography>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="body2" color="text.secondary">
              <FormattedMessage id="payroll-total-deductions" />
            </Typography>
            <Typography fontWeight={700}>{formatCurrency(locale, statement.totalDeductions)}</Typography>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="body2" color="text.secondary">
              <FormattedMessage id="payroll-gross-wage" />
            </Typography>
            <Typography fontWeight={700}>{formatCurrency(locale, statement.grossWage)}</Typography>
          </Grid>
        </Grid>

        <Box>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            <FormattedMessage id="payroll-statement-movements" />
          </Typography>
          {statement.movements.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              <FormattedMessage id="payroll-statement-movements-empty" />
            </Typography>
          ) : (
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell><FormattedMessage id="monthly-movement-type" /></TableCell>
                  <TableCell><FormattedMessage id="monthly-movement-date" /></TableCell>
                  <TableCell><FormattedMessage id="monthly-movement-quantity" /></TableCell>
                  <TableCell><FormattedMessage id="monthly-movement-amount" /></TableCell>
                  <TableCell><FormattedMessage id="effect" /></TableCell>
                  <TableCell><FormattedMessage id="reason" /></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {statement.movements.map((movement) => (
                  <TableRow key={movement.id}>
                    <TableCell>{movement.movementTypeLabel}</TableCell>
                    <TableCell>{formatDate(locale, movement.movementDateSnapshot)}</TableCell>
                    <TableCell>{movement.quantitySnapshot ?? '-'}</TableCell>
                    <TableCell>{formatCurrency(locale, movement.amountSnapshot)}</TableCell>
                    <TableCell>
                      <Chip size="small" color={getMovementEffectColor(movement.effectSnapshot)} label={movement.effectLabel} />
                    </TableCell>
                    <TableCell>{movement.reasonSnapshot}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Box>
      </Stack>
    </Card>
  );
}

export default function PayrollPeriodsPage() {
  const intl = useIntl();
  const dispatch = useDispatch();
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(PAYROLL_PAGE_SIZE);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [year, setYear] = useState('');
  const [month, setMonth] = useState('');
  const [sortBy, setSortBy] = useState('year');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState<PayrollPeriodFormValues>(() => createDefaultForm());
  const [selectedPeriodId, setSelectedPeriodId] = useState<string | null>(null);
  const [actionPeriodId, setActionPeriodId] = useState<string | null>(null);
  const [createLoading, setCreateLoading] = useState(false);
  const [deleteLoadingId, setDeleteLoadingId] = useState<string | null>(null);
  const [approveOpen, setApproveOpen] = useState(false);
  const [approveNotes, setApproveNotes] = useState('');
  const [approveLoading, setApproveLoading] = useState(false);
  const [payOpen, setPayOpen] = useState(false);
  const [payTargetPeriod, setPayTargetPeriod] = useState<PayrollPeriodListItemDto | null>(null);
  const [payTreasuryAccountId, setPayTreasuryAccountId] = useState('');
  const [payPaymentDate, setPayPaymentDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [payNotes, setPayNotes] = useState('');
  const [payLoading, setPayLoading] = useState(false);

  useEffect(() => {
    const handle = window.setTimeout(() => setSearch(searchInput.trim()), 350);
    return () => window.clearTimeout(handle);
  }, [searchInput]);

  const query = useMemo(() => ({
    page: page + 1,
    pageSize,
    search,
    year: year === '' ? undefined : Number(year),
    month: month === '' ? undefined : Number(month),
    sortBy,
    sortDirection
  }), [month, page, pageSize, search, sortBy, sortDirection, year]);

  const { items, meta, isLoading, error, mutate } = usePayrollPeriods(query);
  const { period: selectedPeriod, isLoading: selectedLoading, error: selectedError, mutate: mutateSelected } = usePayrollPeriod(selectedPeriodId ?? undefined);
  const { items: treasuryAccounts, isLoading: treasuryAccountsLoading } = useTreasuryAccounts({ page: 1, pageSize: TREASURY_LOOKUP_PAGE_SIZE, isActive: true });

  const notify = (message: string, severity: 'success' | 'error' = 'success') => {
    dispatch(openSnackbar({ open: true, message, variant: 'alert', severity }));
  };

  const refresh = async () => {
    await mutate();
    if (selectedPeriodId) {
      await mutateSelected();
    }
  };

  const runAction = async (action: () => Promise<unknown>, successMessage: string) => {
    setActionPeriodId('busy');
    try {
      await action();
      await refresh();
      notify(successMessage);
    } catch (error) {
      notify(error instanceof Error ? error.message : intl.formatMessage({ id: 'payroll-period-action-failed' }), 'error');
    } finally {
      setActionPeriodId(null);
    }
  };

  const handleCreate = async () => {
    setCreateLoading(true);
    try {
      await createPayrollPeriod(toPayload(createForm));
      await mutate();
      setCreateOpen(false);
      setCreateForm(createDefaultForm());
      notify(intl.formatMessage({ id: 'payroll-period-created-successfully' }));
    } catch (error) {
      notify(error instanceof Error ? error.message : intl.formatMessage({ id: 'payroll-period-create-failed' }), 'error');
    } finally {
      setCreateLoading(false);
    }
  };

  const handleDelete = async (period: PayrollPeriodListItemDto) => {
    if (!window.confirm(intl.formatMessage({ id: 'payroll-period-delete-confirm' }, { year: period.year, month: period.month }))) {
      return;
    }

    setDeleteLoadingId(period.id);
    try {
      await deletePayrollPeriod(period.id, period.rowVersion);
      await mutate();
      if (selectedPeriodId === period.id) {
        setSelectedPeriodId(null);
      }
      notify(intl.formatMessage({ id: 'payroll-period-deleted-successfully' }));
    } catch (error) {
      notify(error instanceof Error ? error.message : intl.formatMessage({ id: 'payroll-period-delete-failed' }), 'error');
    } finally {
      setDeleteLoadingId(null);
    }
  };

  const handleCalculate = async (period: PayrollPeriodListItemDto) => {
    await runAction(
      () => (period.status === PAYROLL_PERIOD_STATUS.Calculated ? recalculatePayrollPeriod(period.id) : calculatePayrollPeriod(period.id)),
      period.status === PAYROLL_PERIOD_STATUS.Calculated
        ? intl.formatMessage({ id: 'payroll-period-recalculated-successfully' })
        : intl.formatMessage({ id: 'payroll-period-calculated-successfully' })
    );
  };

  const openApproveDialog = () => {
    if (!selectedPeriod || selectedPeriod.status !== PAYROLL_PERIOD_STATUS.Calculated) {
      return;
    }

    setPayOpen(false);
    setPayTargetPeriod(null);
    setApproveNotes(selectedPeriod.approvalNotes ?? '');
    setApproveOpen(true);
  };

  const openPayDialog = (period: PayrollPeriodListItemDto) => {
    if (period.status !== PAYROLL_PERIOD_STATUS.Approved) {
      return;
    }

    setApproveOpen(false);
    setPayTargetPeriod(period);
    setPayTreasuryAccountId((current) => current || treasuryAccounts.find((account) => account.isActive)?.id || '');
    setPayPaymentDate(new Date().toISOString().slice(0, 10));
    setPayNotes(period.notes ?? '');
    setPayOpen(true);
  };

  const handleApprove = async () => {
    if (!selectedPeriod) {
      return;
    }

    setApproveLoading(true);
    try {
      await approvePayrollPeriod(selectedPeriod.id, {
        rowVersion: selectedPeriod.rowVersion,
        approvalNotes: approveNotes.trim() || null
      });
      setApproveOpen(false);
      await refresh();
      notify(intl.formatMessage({ id: 'payroll-period-approved-successfully' }));
    } catch (error) {
      notify(error instanceof Error ? error.message : intl.formatMessage({ id: 'payroll-period-approve-failed' }), 'error');
    } finally {
      setApproveLoading(false);
    }
  };

  const handlePay = async () => {
    if (!payTargetPeriod) {
      return;
    }

    setPayLoading(true);
    try {
      await payPayrollPeriod(payTargetPeriod.id, {
        rowVersion: payTargetPeriod.rowVersion,
        treasuryAccountId: payTreasuryAccountId,
        paymentDate: payPaymentDate,
        notes: payNotes.trim() || null
      });
      setPayOpen(false);
      setPayTargetPeriod(null);
      await refresh();
      notify(intl.formatMessage({ id: 'payroll-period-paid-successfully' }));
    } catch (error) {
      notify(error instanceof Error ? error.message : intl.formatMessage({ id: 'payroll-period-pay-failed' }), 'error');
    } finally {
      setPayLoading(false);
    }
  };

  const summary = useMemo(() => ({
    drafts: items.filter((item) => item.status === PAYROLL_PERIOD_STATUS.Draft).length,
    calculated: items.filter((item) => item.status === PAYROLL_PERIOD_STATUS.Calculated).length,
    netTotal: items.reduce((sum, item) => sum + item.totalNetWage, 0)
  }), [items]);

  const selectedPayTreasuryAccount = useMemo(
    () => treasuryAccounts.find((account) => account.id === payTreasuryAccountId) ?? null,
    [payTreasuryAccountId, treasuryAccounts]
  );

  useEffect(() => {
    if (payOpen && !payTreasuryAccountId && treasuryAccounts.length > 0) {
      setPayTreasuryAccountId(treasuryAccounts[0].id);
    }
  }, [payOpen, payTreasuryAccountId, treasuryAccounts]);

  const selectedStatementCount = selectedPeriod?.statements.length ?? 0;
  const selectedNegativeNetCount = selectedPeriod?.statements.filter((statement) => statement.hasNegativeNetWage).length ?? 0;
  const selectedIsApproved = selectedPeriod?.status === PAYROLL_PERIOD_STATUS.Approved;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Breadcrumbs custom heading="payroll-periods" links={[{ title: 'labor', to: '/labor/workers' }, { title: 'payroll-periods' }]} />

      <Box>
        <Typography variant="h2" sx={{ fontWeight: 700 }}>
          <FormattedMessage id="payroll-periods" />
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75 }}>
          <FormattedMessage id="payroll-periods-page-description" />
        </Typography>
      </Box>

      <Grid container spacing={2}>
        <Grid item xs={12} md={3}>
          <SummaryCard label={intl.formatMessage({ id: 'payroll-periods-total' })} value={meta.totalCount} />
        </Grid>
        <Grid item xs={12} md={3}>
          <SummaryCard label={intl.formatMessage({ id: 'payroll-periods-draft' })} value={summary.drafts} />
        </Grid>
        <Grid item xs={12} md={3}>
          <SummaryCard label={intl.formatMessage({ id: 'payroll-periods-calculated' })} value={summary.calculated} />
        </Grid>
        <Grid item xs={12} md={3}>
          <SummaryCard label={intl.formatMessage({ id: 'payroll-periods-net-total' })} value={formatCurrency(intl.locale, summary.netTotal)} />
        </Grid>
      </Grid>

      <MainCard content={false}>
        <Box sx={{ p: 2, display: 'grid', gridTemplateColumns: { xs: '1fr', md: '2fr 1fr 1fr 1fr 1fr 1fr' }, gap: 2, alignItems: 'center' }}>
          <OutlinedInput
            value={searchInput}
            onChange={(event) => {
              setSearchInput(event.target.value);
              setPage(0);
            }}
            placeholder={intl.formatMessage({ id: 'payroll-periods-search-placeholder' })}
            startAdornment={<IconSearch size={18} style={{ marginInlineEnd: 8, opacity: 0.7 }} />}
          />
          <TextField
            type="number"
            value={year}
            onChange={(event) => {
              setYear(event.target.value);
              setPage(0);
            }}
            placeholder={intl.formatMessage({ id: 'payroll-period-year-placeholder' })}
          />
          <TextField
            type="number"
            value={month}
            onChange={(event) => {
              setMonth(event.target.value);
              setPage(0);
            }}
            placeholder={intl.formatMessage({ id: 'payroll-period-month-placeholder' })}
          />
          <Select value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
            <MenuItem value="year"><FormattedMessage id="payroll-period-sort-year" /></MenuItem>
            <MenuItem value="month"><FormattedMessage id="payroll-period-sort-month" /></MenuItem>
            <MenuItem value="status"><FormattedMessage id="payroll-period-sort-status" /></MenuItem>
            <MenuItem value="calculatedAtUtc"><FormattedMessage id="payroll-period-sort-calculated-at" /></MenuItem>
            <MenuItem value="createdAtUtc"><FormattedMessage id="created-at" /></MenuItem>
            <MenuItem value="updatedAtUtc"><FormattedMessage id="updated-at" /></MenuItem>
          </Select>
          <Select value={sortDirection} onChange={(event) => setSortDirection(event.target.value as 'asc' | 'desc')}>
            <MenuItem value="asc"><FormattedMessage id="sort-ascending" /></MenuItem>
            <MenuItem value="desc"><FormattedMessage id="sort-descending" /></MenuItem>
          </Select>
          <Stack direction="row" spacing={1} justifyContent="flex-end">
            <Button
              variant="outlined"
              onClick={() => {
                setSearchInput('');
                setSearch('');
                setYear('');
                setMonth('');
                setSortBy('year');
                setSortDirection('desc');
                setPage(0);
              }}
              startIcon={<IconRefresh size={18} />}
            >
              <FormattedMessage id="refresh" />
            </Button>
            <PermissionGuard permission={PAYROLL_PERMISSIONS.create}>
              <Button variant="contained" onClick={() => setCreateOpen(true)} startIcon={<IconPlus size={18} />}>
                <FormattedMessage id="create-payroll-period" />
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
              <FormattedMessage id="payroll-periods-load-error" />
            </Typography>
            <Button variant="outlined" onClick={() => mutate()}>
              <FormattedMessage id="retry" />
            </Button>
          </Box>
        )}

        {!isLoading && !error && items.length === 0 && (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography color="text.secondary">
              <FormattedMessage id="payroll-periods-empty" />
            </Typography>
          </Box>
        )}

        {!isLoading && !error && items.length > 0 && (
          <>
            <TableContainer>
              <Table>
                <TableHead sx={{ bgcolor: 'grey.50' }}>
                  <TableRow>
                    <TableCell><FormattedMessage id="payroll-period" /></TableCell>
                    <TableCell><FormattedMessage id="date-range" /></TableCell>
                    <TableCell><FormattedMessage id="status" /></TableCell>
                    <TableCell><FormattedMessage id="payroll-workers-count" /></TableCell>
                    <TableCell><FormattedMessage id="payroll-gross-wage" /></TableCell>
                    <TableCell><FormattedMessage id="payroll-total-deductions" /></TableCell>
                    <TableCell><FormattedMessage id="payroll-net-wage" /></TableCell>
                    <TableCell align="center"><FormattedMessage id="actions" /></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {items.map((period) => (
                    <TableRow key={period.id} hover>
                      <TableCell>
                        <Stack spacing={0.5}>
                          <Typography fontWeight={700}>{formatMonthLabel(intl.locale, period.year, period.month)}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {period.notes ?? '-'}
                          </Typography>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        {formatDate(intl.locale, period.startDate)} - {formatDate(intl.locale, period.endDate)}
                      </TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          color={getStatusColor(period.status)}
                          label={<FormattedMessage id={getStatusLabelId(period.status)} />}
                        />
                      </TableCell>
                      <TableCell>{period.workerCount}</TableCell>
                      <TableCell>{formatCurrency(intl.locale, period.totalGrossWage)}</TableCell>
                      <TableCell>{formatCurrency(intl.locale, period.totalDeductions)}</TableCell>
                      <TableCell>{formatCurrency(intl.locale, period.totalNetWage)}</TableCell>
                      <TableCell align="center">
                        <Stack direction="row" spacing={0.5} justifyContent="center" flexWrap="wrap">
                          <IconButton size="small" onClick={() => setSelectedPeriodId(period.id)}>
                            <IconEye size={18} />
                          </IconButton>
                          {isActionableForCalculation(period.status) && (
                            <>
                              <PermissionGuard permission={PAYROLL_PERMISSIONS.calculate}>
                                <IconButton
                                  size="small"
                                  onClick={() => handleCalculate(period)}
                                  disabled={actionPeriodId === 'busy'}
                                >
                                  <IconCalculator size={18} />
                                </IconButton>
                              </PermissionGuard>
                              <PermissionGuard permission={PAYROLL_PERMISSIONS.delete}>
                                <IconButton
                                  size="small"
                                  color="error"
                                  onClick={() => handleDelete(period)}
                                  disabled={deleteLoadingId === period.id}
                                >
                                  <IconTrash size={18} />
                                </IconButton>
                              </PermissionGuard>
                            </>
                          )}
                          {period.status === PAYROLL_PERIOD_STATUS.Approved && (
                            <PermissionGuard permission={PAYROLL_PERMISSIONS.pay}>
                              <IconButton size="small" color="success" onClick={() => openPayDialog(period)}>
                                <IconCashBanknote size={18} />
                              </IconButton>
                            </PermissionGuard>
                          )}
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

      <Dialog open={createOpen} onClose={() => setCreateOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>
          <FormattedMessage id="create-payroll-period" />
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <TextField
              label={<FormattedMessage id="payroll-period-year" />}
              type="number"
              value={createForm.year}
              onChange={(event) => setCreateForm((current) => ({ ...current, year: event.target.value }))}
              fullWidth
              required
            />
            <TextField
              label={<FormattedMessage id="payroll-period-month" />}
              type="number"
              value={createForm.month}
              onChange={(event) => setCreateForm((current) => ({ ...current, month: event.target.value }))}
              fullWidth
              required
              inputProps={{ min: 1, max: 12 }}
            />
            <TextField
              label={<FormattedMessage id="notes" />}
              value={createForm.notes}
              onChange={(event) => setCreateForm((current) => ({ ...current, notes: event.target.value }))}
              fullWidth
              multiline
              minRows={3}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateOpen(false)}>
            <FormattedMessage id="cancel" />
          </Button>
          <Button variant="contained" onClick={handleCreate} disabled={createLoading || !createForm.year || !createForm.month}>
            <FormattedMessage id="create" />
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={Boolean(selectedPeriodId)} onClose={() => setSelectedPeriodId(null)} fullWidth maxWidth="xl">
        <DialogTitle sx={{ pb: 1 }}>
          {selectedPeriod ? formatMonthLabel(intl.locale, selectedPeriod.year, selectedPeriod.month) : <FormattedMessage id="loading" />}
        </DialogTitle>
        <DialogContent dividers>
          {selectedLoading && <Loader />}
          {selectedError && (
            <Typography color="error">
              <FormattedMessage id="payroll-period-detail-load-error" />
            </Typography>
          )}
          {selectedPeriod && (
            <Stack spacing={2.5}>
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5} justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'center' }}>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    <FormattedMessage id="payroll-period-range" />
                  </Typography>
                  <Typography variant="h5" fontWeight={800}>
                    {formatDate(intl.locale, selectedPeriod.startDate)} - {formatDate(intl.locale, selectedPeriod.endDate)}
                  </Typography>
                </Box>
                <Stack direction="row" spacing={1} flexWrap="wrap">
                  <Chip
                    label={<FormattedMessage id={getStatusLabelId(selectedPeriod.status)} />}
                    color={getStatusColor(selectedPeriod.status)}
                  />
                  <Chip variant="outlined" label={`${selectedPeriod.workerCount} ${intl.formatMessage({ id: 'payroll-workers-count' })}`} />
                  {isActionableForCalculation(selectedPeriod.status) && (
                    <>
                      <PermissionGuard permission={PAYROLL_PERMISSIONS.calculate}>
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => handleCalculate(selectedPeriod)}
                          startIcon={<IconCalculator size={16} />}
                        >
                          {selectedPeriod.status === PAYROLL_PERIOD_STATUS.Calculated ? (
                            <FormattedMessage id="recalculate" />
                          ) : (
                            <FormattedMessage id="calculate" />
                          )}
                        </Button>
                      </PermissionGuard>
                    </>
                  )}
                  <PermissionGuard permission={PAYROLL_PERMISSIONS.approve}>
                    {selectedPeriod.status === PAYROLL_PERIOD_STATUS.Calculated && (
                      <Button
                        variant="contained"
                        size="small"
                        onClick={openApproveDialog}
                        startIcon={<IconCheck size={16} />}
                      >
                        <FormattedMessage id="approve" />
                      </Button>
                    )}
                  </PermissionGuard>
                  <PermissionGuard permission={PAYROLL_PERMISSIONS.pay}>
                    {selectedPeriod.status === PAYROLL_PERIOD_STATUS.Approved && !selectedPeriod.payment && (
                      <Button
                        variant="contained"
                        color="success"
                        size="small"
                        onClick={() => openPayDialog(selectedPeriod)}
                        startIcon={<IconCashBanknote size={16} />}
                      >
                        <FormattedMessage id="payroll-period-pay" />
                      </Button>
                    )}
                  </PermissionGuard>
                </Stack>
              </Stack>

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}><SummaryCard label={intl.formatMessage({ id: 'payroll-basic-wage' })} value={formatCurrency(intl.locale, selectedPeriod.totalBasicWage)} /></Grid>
                <Grid item xs={12} sm={6} md={3}><SummaryCard label={intl.formatMessage({ id: 'payroll-meal-allowance' })} value={formatCurrency(intl.locale, selectedPeriod.totalMealAllowance)} /></Grid>
                <Grid item xs={12} sm={6} md={3}><SummaryCard label={intl.formatMessage({ id: 'payroll-total-deductions' })} value={formatCurrency(intl.locale, selectedPeriod.totalDeductions)} /></Grid>
                <Grid item xs={12} sm={6} md={3}><SummaryCard label={intl.formatMessage({ id: 'payroll-net-wage' })} value={formatCurrency(intl.locale, selectedPeriod.totalNetWage)} /></Grid>
              </Grid>

              {selectedIsApproved && (
                <Card sx={{ p: 2.5, borderRadius: 3, border: '1px solid', borderColor: 'success.light', bgcolor: 'success.lighter' }}>
                  <Stack spacing={1.25}>
                    <Typography variant="h6" fontWeight={800}>
                      <FormattedMessage id="payroll-period-approval-details" />
                    </Typography>
                    <Grid container spacing={1.5}>
                      <Grid item xs={12} sm={4}>
                        <Typography variant="body2" color="text.secondary">
                          <FormattedMessage id="payroll-period-approved-at" />
                        </Typography>
                        <Typography fontWeight={700}>{formatDateTime(intl.locale, selectedPeriod.approvedAtUtc)}</Typography>
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <Typography variant="body2" color="text.secondary">
                          <FormattedMessage id="payroll-period-approved-by" />
                        </Typography>
                        <Typography fontWeight={700}>{selectedPeriod.approvedByDisplayName ?? '-'}</Typography>
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <Typography variant="body2" color="text.secondary">
                          <FormattedMessage id="payroll-period-approval-notes" />
                        </Typography>
                        <Typography fontWeight={700}>{selectedPeriod.approvalNotes ?? '-'}</Typography>
                      </Grid>
                    </Grid>
                  </Stack>
                </Card>
              )}

              {selectedPeriod.payment && (
                <Card sx={{ p: 2.5, borderRadius: 3, border: '1px solid', borderColor: 'success.light', bgcolor: 'success.lighter' }}>
                  <Stack spacing={1.25}>
                    <Typography variant="h6" fontWeight={800}>
                      <FormattedMessage id="payroll-period-payment-details" />
                    </Typography>
                    <Grid container spacing={1.5}>
                      <Grid item xs={12} sm={4}>
                        <Typography variant="body2" color="text.secondary">
                          <FormattedMessage id="payroll-period-payment-date" />
                        </Typography>
                        <Typography fontWeight={700}>{formatDate(intl.locale, selectedPeriod.payment.paymentDate)}</Typography>
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <Typography variant="body2" color="text.secondary">
                          <FormattedMessage id="payroll-period-payment-treasury-account" />
                        </Typography>
                        <Typography fontWeight={700}>
                          {selectedPeriod.payment.treasuryAccountCode} - {selectedPeriod.payment.treasuryAccountNameArabic}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <Typography variant="body2" color="text.secondary">
                          <FormattedMessage id="payroll-period-payment-amount" />
                        </Typography>
                        <Typography fontWeight={700}>{formatCurrency(intl.locale, selectedPeriod.payment.amount)}</Typography>
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <Typography variant="body2" color="text.secondary">
                          <FormattedMessage id="payroll-period-payment-reference" />
                        </Typography>
                        <Typography fontWeight={700}>{selectedPeriod.payment.treasuryTransactionReferenceNumber ?? '-'}</Typography>
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <Typography variant="body2" color="text.secondary">
                          <FormattedMessage id="payroll-period-payment-journal-entry" />
                        </Typography>
                        <Typography fontWeight={700}>{selectedPeriod.payment.journalEntryNumber}</Typography>
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <Typography variant="body2" color="text.secondary">
                          <FormattedMessage id="payroll-period-payment-by" />
                        </Typography>
                        <Typography fontWeight={700}>{selectedPeriod.payment.paidByDisplayName ?? '-'}</Typography>
                      </Grid>
                    </Grid>
                    <Typography variant="body2" color="text.secondary">
                      <FormattedMessage id="payroll-period-payment-notes" />
                    </Typography>
                    <Typography fontWeight={700}>{selectedPeriod.payment.notes ?? '-'}</Typography>
                  </Stack>
                </Card>
              )}

              <Card sx={{ p: 2.5, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
                <Stack spacing={1.5}>
                  <Box>
                    <Typography variant="h6" fontWeight={800}>
                      <FormattedMessage id="payroll-statements" />
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      <FormattedMessage id="payroll-statements-description" values={{ count: selectedStatementCount }} />
                    </Typography>
                  </Box>

                  {selectedPeriod.statements.length === 0 ? (
                    <Typography color="text.secondary">
                      <FormattedMessage id="payroll-statements-empty" />
                    </Typography>
                  ) : (
                    <Stack spacing={2}>
                      {selectedPeriod.statements.map((statement) => (
                        <StatementCard key={statement.id} locale={intl.locale} statement={statement} />
                      ))}
                    </Stack>
                  )}
                </Stack>
              </Card>
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedPeriodId(null)}>
            <FormattedMessage id="close" />
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={approveOpen && Boolean(selectedPeriod)} onClose={() => setApproveOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>
          <FormattedMessage id="payroll-period-approve-confirm-title" />
        </DialogTitle>
        <DialogContent>
          {selectedPeriod && (
            <Stack spacing={2} sx={{ pt: 1 }}>
              <Typography variant="body2" color="text.secondary">
                <FormattedMessage
                  id="payroll-period-approve-confirm-message"
                  values={{
                    month: formatMonthLabel(intl.locale, selectedPeriod.year, selectedPeriod.month),
                    workers: selectedPeriod.workerCount,
                    negativeCount: selectedNegativeNetCount
                  }}
                />
              </Typography>
              <Grid container spacing={1.5}>
                <Grid item xs={12} sm={6}>
                  <SummaryCard label={intl.formatMessage({ id: 'payroll-basic-wage' })} value={formatCurrency(intl.locale, selectedPeriod.totalBasicWage)} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <SummaryCard label={intl.formatMessage({ id: 'payroll-net-wage' })} value={formatCurrency(intl.locale, selectedPeriod.totalNetWage)} />
                </Grid>
              </Grid>
              {selectedNegativeNetCount > 0 && (
                <Chip color="warning" label={intl.formatMessage({ id: 'payroll-period-approve-negative-net-warning' }, { count: selectedNegativeNetCount })} />
              )}
              <TextField
                label={<FormattedMessage id="payroll-period-approve-notes" />}
                value={approveNotes}
                onChange={(event) => setApproveNotes(event.target.value)}
                multiline
                minRows={3}
                fullWidth
                placeholder={intl.formatMessage({ id: 'payroll-period-approve-notes-placeholder' })}
              />
            </Stack>
          )}
        </DialogContent>
      <DialogActions>
        <Button onClick={() => setApproveOpen(false)} disabled={approveLoading}>
          <FormattedMessage id="cancel" />
        </Button>
        <Button variant="contained" onClick={handleApprove} disabled={approveLoading || !selectedPeriod}>
          <FormattedMessage id="approve" />
        </Button>
      </DialogActions>
      </Dialog>

      <Dialog
        open={payOpen && Boolean(payTargetPeriod)}
        onClose={() => {
          setPayOpen(false);
          setPayTargetPeriod(null);
        }}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          <FormattedMessage id="payroll-period-pay-title" />
        </DialogTitle>
        <DialogContent>
          {payTargetPeriod && (
            <Stack spacing={2} sx={{ pt: 1 }}>
              <Alert severity="info">
                <FormattedMessage
                  id="payroll-period-pay-summary"
                  values={{
                    month: formatMonthLabel(intl.locale, payTargetPeriod.year, payTargetPeriod.month),
                    amount: formatCurrency(intl.locale, payTargetPeriod.totalNetWage)
                  }}
                />
              </Alert>
              <TextField
                select
                label={<FormattedMessage id="treasury-account" />}
                value={payTreasuryAccountId}
                onChange={(event) => setPayTreasuryAccountId(event.target.value)}
                fullWidth
                required
              >
                {treasuryAccounts.map((account) => (
                  <MenuItem key={account.id} value={account.id}>
                    {account.code} - {account.nameArabic} ({formatCurrency(intl.locale, account.balance)})
                  </MenuItem>
                ))}
              </TextField>
              {selectedPayTreasuryAccount && (
                <Card sx={{ p: 2, borderRadius: 2, border: '1px solid', borderColor: 'divider', bgcolor: 'grey.50' }}>
                  <Stack spacing={0.75}>
                    <Typography variant="body2" color="text.secondary">
                      <FormattedMessage id="treasury-account-balance" />
                    </Typography>
                    <Typography fontWeight={700}>
                      {formatCurrency(intl.locale, selectedPayTreasuryAccount.balance)} {selectedPayTreasuryAccount.balanceNature}
                    </Typography>
                    <Typography variant="body2" color={selectedPayTreasuryAccount.balance >= payTargetPeriod.totalNetWage ? 'success.main' : 'error.main'}>
                      <FormattedMessage
                        id="payroll-period-pay-remaining"
                        values={{
                          amount: formatCurrency(intl.locale, selectedPayTreasuryAccount.balance - payTargetPeriod.totalNetWage)
                        }}
                      />
                    </Typography>
                  </Stack>
                </Card>
              )}
              <TextField
                label={<FormattedMessage id="payment-date" />}
                type="date"
                value={payPaymentDate}
                onChange={(event) => setPayPaymentDate(event.target.value)}
                fullWidth
                required
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                label={<FormattedMessage id="notes" />}
                value={payNotes}
                onChange={(event) => setPayNotes(event.target.value)}
                fullWidth
                multiline
                minRows={3}
              />
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setPayOpen(false);
              setPayTargetPeriod(null);
            }}
            disabled={payLoading}
          >
            <FormattedMessage id="cancel" />
          </Button>
          <Button
            variant="contained"
            color="success"
            onClick={handlePay}
            disabled={payLoading || !payTargetPeriod || !payTreasuryAccountId || treasuryAccountsLoading || (selectedPayTreasuryAccount ? selectedPayTreasuryAccount.balance < payTargetPeriod.totalNetWage : true)}
          >
            <FormattedMessage id="payroll-period-pay" />
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
