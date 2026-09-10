import { useEffect, useMemo, useState } from 'react';
import { useIntl } from 'react-intl';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Checkbox from '@mui/material/Checkbox';
import Chip from '@mui/material/Chip';
import LoadingButton from '@mui/lab/LoadingButton';
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
  IconCalculator,
  IconCashBanknote,
  IconCheck,
  IconEye,
  IconPencil,
  IconPlus,
  IconRefresh,
  IconRotateClockwise2,
  IconSearch,
  IconTrash
} from '@tabler/icons-react';

import { useDispatch } from 'store';
import { openSnackbar } from 'store/slices/snackbar';
import useAuth from 'hooks/useAuth';
import { hasPermission } from 'modules/Administration/utils/permission-utils';
import PermissionGuard from 'modules/Administration/components/PermissionGuard';
import { useTreasuryAccounts } from 'modules/Treasury/hooks/useTreasury';
import { TREASURY_LOOKUP_PAGE_SIZE } from 'modules/Treasury/utils/treasury.constants';
import Breadcrumbs from 'ui-component/extended/Breadcrumbs';
import Loader from 'ui-component/Loader';
import MainCard from 'ui-component/cards/MainCard';

import {
  approvePayrollPeriod,
  calculatePayrollPeriod,
  createPayrollPeriod,
  deletePayrollPeriod,
  confirmPayrollPeriod,
  getPayrollPayment,
  getPayrollPeriod,
  payPayrollStatements,
  recalculatePayrollPeriod,
  reopenPayrollPeriod,
  reversePayrollPayment,
  updatePayrollPeriod
} from '../api/payrollApi';
import { usePayrollPaymentDetails, usePayrollPeriod, usePayrollPeriodPayments, usePayrollPeriods } from '../hooks/usePayroll';
import { PAYROLL_PAGE_SIZE, PAYROLL_PERIOD_STATUS, PAYROLL_PERMISSIONS } from '../utils/payroll.constants';
import type { PayrollPaymentListItemDto, PayrollPeriodFormValues, PayrollPeriodListItemDto, PayrollStatementDto } from '../types/payroll.types';

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
  return statement.overtimeAmount + statement.nightWorkAmount + statement.bonusAmount;
}

function deductionsTotal(statement: PayrollStatementDto) {
  return statement.absenceDeduction + statement.otherDeductionAmount;
}

function isPaymentActive(payment: PayrollPaymentListItemDto) {
  return payment.status.toLowerCase() === 'active' && !payment.reversedAtUtc;
}

function isStatementPayable(statement: PayrollStatementDto) {
  return statement.netWage > 0 && !statement.hasNegativeNetWage;
}

function getPaymentStatusLabel(locale: string, status: string) {
  switch (status.toLowerCase()) {
    case 'active':
      return t(locale, 'مدفوعة', 'Paid');
    case 'reversed':
      return t(locale, 'معكوسة', 'Reversed');
    case 'legacyunreconciled':
      return t(locale, 'تحتاج تسوية', 'Needs reconciliation');
    default:
      return status;
  }
}

function getPaymentStatusColor(status: string) {
  switch (status.toLowerCase()) {
    case 'active':
      return 'success' as const;
    case 'reversed':
      return 'warning' as const;
    case 'legacyunreconciled':
      return 'error' as const;
    default:
      return 'default' as const;
  }
}

export default function PayrollPeriodsPage() {
  const intl = useIntl();
  const dispatch = useDispatch();
  const { user } = useAuth();
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
  const [isRecalculating, setIsRecalculating] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [isReopenOpen, setIsReopenOpen] = useState(false);
  const [reopenReason, setReopenReason] = useState('');
  const [isReopening, setIsReopening] = useState(false);
  const [isPayOpen, setIsPayOpen] = useState(false);
  const [payStatementIds, setPayStatementIds] = useState<string[]>([]);
  const [payAllUnpaid, setPayAllUnpaid] = useState(true);
  const [payTreasuryAccountId, setPayTreasuryAccountId] = useState('');
  const [payPaymentDate, setPayPaymentDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [payNotes, setPayNotes] = useState('');
  const [isPaying, setIsPaying] = useState(false);
  const [reverseTarget, setReverseTarget] = useState<PayrollPaymentListItemDto | null>(null);
  const [reverseReason, setReverseReason] = useState('');
  const [isReversing, setIsReversing] = useState(false);
  const [reverseError, setReverseError] = useState<string | null>(null);

  const {
    items: periods,
    meta,
    isLoading,
    mutate: refreshPeriods
  } = usePayrollPeriods({
    page: filters.page + 1,
    pageSize: filters.pageSize,
    search: filters.search || undefined,
    year: filters.year ? Number(filters.year) : undefined,
    month: filters.month ? Number(filters.month) : undefined,
    sortBy: filters.sortBy,
    sortDirection: filters.sortDirection
  });

  const {
    period: selectedPeriod,
    isLoading: selectedPeriodLoading,
    mutate: refreshSelectedPeriod
  } = usePayrollPeriod(selectedPeriodId ?? undefined);
  const {
    items: paymentHistory,
    isLoading: paymentHistoryLoading,
    error: paymentHistoryError,
    mutate: refreshPaymentHistory
  } = usePayrollPeriodPayments(selectedPeriodId ?? undefined);
  const activePaymentIds = useMemo(() => paymentHistory.filter(isPaymentActive).map((payment) => payment.paymentId), [paymentHistory]);
  const {
    paymentDetails: activePaymentDetails,
    isLoading: paymentDetailsLoading,
    error: paymentDetailsError,
    mutate: refreshPaymentDetails
  } = usePayrollPaymentDetails(activePaymentIds);
  const { items: treasuryAccounts, isLoading: treasuryAccountsLoading } = useTreasuryAccounts({
    page: 1,
    pageSize: TREASURY_LOOKUP_PAGE_SIZE,
    isActive: true
  });

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
    setIsPayOpen(false);
    setPayStatementIds([]);
    setPayAllUnpaid(true);
    setPayTreasuryAccountId('');
    setPayNotes('');
    setReverseTarget(null);
    setReverseReason('');
    setReverseError(null);
  }, [selectedPeriod]);

  const summary = useMemo(() => {
    const draftPeriods = periods.filter((period) => period.status === 1).length;
    const confirmedPeriods = periods.length - draftPeriods;
    const netTotal = periods.reduce((sum, period) => sum + period.totalNetWage, 0);

    return { draftPeriods, confirmedPeriods, netTotal };
  }, [periods]);

  const statementRows = useMemo(() => selectedPeriod?.statements ?? [], [selectedPeriod]);

  const selectedStatement = useMemo(() => {
    if (!selectedPeriod) {
      return null;
    }

    return statementRows.find((statement) => statement.id === selectedStatementId) ?? statementRows[0] ?? null;
  }, [selectedPeriod, selectedStatementId, statementRows]);

  const paidStatementIds = useMemo(() => {
    const ids = new Set<string>();
    activePaymentDetails.forEach((payment) => {
      payment.lines.forEach((line) => {
        if (line.isActive) {
          ids.add(line.statementId);
        }
      });
    });
    return ids;
  }, [activePaymentDetails]);

  const paymentStateReady = activePaymentIds.length === 0 || (!paymentDetailsLoading && !paymentDetailsError);
  const unpaidPayableStatements = useMemo(
    () => statementRows.filter((statement) => isStatementPayable(statement) && !paidStatementIds.has(statement.id)),
    [paidStatementIds, statementRows]
  );
  const selectedPayStatements = useMemo(
    () =>
      payAllUnpaid
        ? unpaidPayableStatements
        : unpaidPayableStatements.filter((statement) => payStatementIds.includes(statement.id)),
    [payAllUnpaid, payStatementIds, unpaidPayableStatements]
  );
  const payTotalAmount = selectedPayStatements.reduce((sum, statement) => sum + statement.netWage, 0);
  const selectedTreasuryAccount = treasuryAccounts.find((account) => account.id === payTreasuryAccountId) ?? null;
  const hasInsufficientTreasuryBalance =
    selectedTreasuryAccount != null && !selectedTreasuryAccount.allowNegativeBalance && selectedTreasuryAccount.balance < payTotalAmount;

  const filteredYearOptions = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return [currentYear - 1, currentYear, currentYear + 1];
  }, []);

  function notify(message: string, variant: 'success' | 'error' = 'success') {
    dispatch(
      openSnackbar({
        open: true,
        message,
        variant: 'alert',
        severity: variant
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
      notify(
        error instanceof Error ? error.message : t(intl.locale, 'تعذر إنشاء مسير الرواتب.', 'Unable to create payroll period.'),
        'error'
      );
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

  async function handleRecalculatePeriod() {
    if (!selectedPeriod) {
      return;
    }

    const currentStatus = selectedPeriod.status;
    setIsRecalculating(true);
    try {
      if (currentStatus === PAYROLL_PERIOD_STATUS.Calculated) {
        await recalculatePayrollPeriod(selectedPeriod.id);
      } else {
        await calculatePayrollPeriod(selectedPeriod.id);
      }
      await refreshPeriods();
      await refreshSelectedPeriod();
      notify(
        t(
          intl.locale,
          currentStatus === PAYROLL_PERIOD_STATUS.Calculated ? 'تمت إعادة حساب مسير الرواتب بنجاح.' : 'تم حساب مسير الرواتب بنجاح.',
          currentStatus === PAYROLL_PERIOD_STATUS.Calculated
            ? 'Payroll period recalculated successfully.'
            : 'Payroll period calculated successfully.'
        )
      );
    } catch (error) {
      notify(
        error instanceof Error ? error.message : t(intl.locale, 'تعذر إعادة حساب مسير الرواتب.', 'Unable to recalculate payroll period.'),
        'error'
      );
    } finally {
      setIsRecalculating(false);
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
      notify(
        error instanceof Error ? error.message : t(intl.locale, 'تعذر تأكيد مسير الرواتب.', 'Unable to confirm payroll period.'),
        'error'
      );
    } finally {
      setBusy(false);
    }
  }

  async function handleApprovePeriod() {
    if (!selectedPeriod) {
      return;
    }

    setIsApproving(true);
    try {
      await approvePayrollPeriod(selectedPeriod.id, {
        rowVersion: selectedPeriod.rowVersion,
        approvalNotes: null
      });
      await refreshPeriods();
      await refreshSelectedPeriod();
      notify(t(intl.locale, 'تم اعتماد مسير الرواتب بنجاح.', 'Payroll period approved successfully.'));
    } catch (error) {
      notify(
        error instanceof Error ? error.message : t(intl.locale, 'تعذر اعتماد مسير الرواتب.', 'Unable to approve payroll period.'),
        'error'
      );
    } finally {
      setIsApproving(false);
    }
  }

  async function handleReopenPeriod() {
    if (!selectedPeriod) {
      return;
    }

    const reason = reopenReason.trim();
    if (!reason) {
      return;
    }

    setIsReopening(true);
    try {
      const freshPeriod = await getPayrollPeriod(selectedPeriod.id);
      await reopenPayrollPeriod(selectedPeriod.id, {
        rowVersion: freshPeriod.rowVersion,
        reason
      });
      setIsReopenOpen(false);
      setReopenReason('');
      await refreshPeriods();
      await refreshSelectedPeriod();
      notify(t(intl.locale, 'ØªÙ… Ø¥Ø¹Ø§Ø¯Ø© ÙØªØ­ Ù…Ø³ÙŠØ± Ø§Ù„Ø±ÙˆØ§ØªØ¨ Ø¨Ù†Ø¬Ø§Ø­.', 'Payroll period reopened successfully.'));
    } catch (error) {
      notify(error instanceof Error ? error.message : t(intl.locale, 'ØªØ¹Ø°Ø± Ø¥Ø¹Ø§Ø¯Ø© ÙØªØ­ Ù…Ø³ÙŠØ± Ø§Ù„Ø±ÙˆØ§ØªØ¨.', 'Unable to reopen payroll period.'), 'error');
    } finally {
      setIsReopening(false);
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
      notify(
        error instanceof Error ? error.message : t(intl.locale, 'تعذر حذف مسير الرواتب.', 'Unable to delete payroll period.'),
        'error'
      );
    } finally {
      setBusy(false);
    }
  }

  function openPayDialog() {
    setPayAllUnpaid(true);
    setPayStatementIds([]);
    setPayPaymentDate(new Date().toISOString().slice(0, 10));
    setPayNotes('');
    setIsPayOpen(true);
  }

  function togglePayStatement(statementId: string) {
    setPayStatementIds((current) =>
      current.includes(statementId) ? current.filter((id) => id !== statementId) : [...current, statementId]
    );
  }

  async function refreshPayrollPaymentViews() {
    await refreshPeriods();
    await refreshSelectedPeriod();
    await refreshPaymentHistory();
    await refreshPaymentDetails();
  }

  async function handlePayStatements() {
    if (!selectedPeriod || (!payAllUnpaid && selectedPayStatements.length === 0) || !payTreasuryAccountId || hasInsufficientTreasuryBalance) {
      return;
    }

    setIsPaying(true);
    try {
      const freshPeriod = await getPayrollPeriod(selectedPeriod.id);
      await payPayrollStatements(freshPeriod.id, {
        rowVersion: freshPeriod.rowVersion,
        treasuryAccountId: payTreasuryAccountId,
        paymentDate: payPaymentDate,
        notes: payNotes.trim() || null,
        statementIds: payAllUnpaid ? null : selectedPayStatements.map((statement) => statement.id),
        payAllUnpaid
      });
      setIsPayOpen(false);
      setPayStatementIds([]);
      setPayAllUnpaid(true);
      setPayNotes('');
      await refreshPayrollPaymentViews();
      notify(t(intl.locale, 'تم دفع كشوف الرواتب المحددة بنجاح.', 'Selected payroll statements paid successfully.'));
    } catch (error) {
      notify(error instanceof Error ? error.message : t(intl.locale, 'تعذر دفع كشوف الرواتب.', 'Unable to pay payroll statements.'), 'error');
    } finally {
      setIsPaying(false);
    }
  }

  async function handleReversePayment() {
    if (!reverseTarget || !reverseReason.trim()) {
      return;
    }

    setIsReversing(true);
    setReverseError(null);
    try {
      const freshPayment = await getPayrollPayment(reverseTarget.paymentId);
      await reversePayrollPayment(reverseTarget.paymentId, {
        rowVersion: freshPayment.rowVersion,
        reason: reverseReason.trim()
      });
      setReverseTarget(null);
      setReverseReason('');
      await refreshPayrollPaymentViews();
      notify(t(intl.locale, 'تم عكس دفعة الرواتب بنجاح.', 'Payroll payment reversed successfully.'));
    } catch (error) {
      const errorMessage = error instanceof Error && error.message ? error.message : t(intl.locale, 'تعذر عكس دفعة الرواتب.', 'Unable to reverse payroll payment.');
      setReverseError(errorMessage);
      notify(errorMessage, 'error');
    } finally {
      setIsReversing(false);
    }
  }

  const periodRows = periods;
  const canCalculatePeriod =
    selectedPeriod != null &&
    (selectedPeriod.status === PAYROLL_PERIOD_STATUS.Draft || selectedPeriod.status === PAYROLL_PERIOD_STATUS.Calculated);
  const canApprovePeriod = selectedPeriod != null && selectedPeriod.status === PAYROLL_PERIOD_STATUS.Calculated;
  const canConfirmPeriod = selectedPeriod != null && selectedPeriod.status === PAYROLL_PERIOD_STATUS.Draft;
  const canReopenPeriod =
    selectedPeriod != null && selectedPeriod.status === PAYROLL_PERIOD_STATUS.Approved && hasPermission(user, PAYROLL_PERMISSIONS.reopen);
  const canPayPeriod =
    selectedPeriod != null &&
    selectedPeriod.status === PAYROLL_PERIOD_STATUS.Approved &&
    unpaidPayableStatements.length > 0 &&
    paymentStateReady &&
    !paymentHistoryError &&
    hasPermission(user, PAYROLL_PERMISSIONS.pay);
  const shouldRenderPayAction =
    selectedPeriod != null &&
    selectedPeriod.status === PAYROLL_PERIOD_STATUS.Approved &&
    hasPermission(user, PAYROLL_PERMISSIONS.pay) &&
    (paymentHistoryLoading || paymentDetailsLoading || canPayPeriod);

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
            <Stack
              direction={{ xs: 'column', md: 'row' }}
              spacing={1.5}
              alignItems={{ xs: 'stretch', md: 'center' }}
              justifyContent="space-between"
            >
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
                <Button variant="contained" startIcon={<IconPlus size={16} />} onClick={() => setIsCreateOpen(true)}>
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
                                <Chip
                                  size="small"
                                  color={getPeriodStatusColor(period.status)}
                                  label={getPeriodStatusLabel(intl.locale, period.status)}
                                />
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
              title={
                selectedPeriod
                  ? formatMonthLabel(intl.locale, selectedPeriod.year, selectedPeriod.month)
                  : t(intl.locale, 'تفاصيل الفترة', 'Period details')
              }
              content={false}
              secondary={
                <Stack direction="row" spacing={0.5}>
                  <PermissionGuard permission={PAYROLL_PERMISSIONS.create}>
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<IconPencil size={16} />}
                      onClick={() => setIsEditOpen(true)}
                      disabled={!selectedPeriod || selectedPeriod.status !== 1 || busy || isRecalculating}
                    >
                      {t(intl.locale, 'تعديل', 'Edit')}
                    </Button>
                  </PermissionGuard>
                  <PermissionGuard permission={PAYROLL_PERMISSIONS.calculate}>
                    <LoadingButton
                      size="small"
                      variant="contained"
                      color="success"
                      loading={isRecalculating}
                      loadingPosition="start"
                      startIcon={<IconCalculator size={16} />}
                      onClick={handleRecalculatePeriod}
                      disabled={!canCalculatePeriod || busy || isRecalculating}
                    >
                      {t(
                        intl.locale,
                        selectedPeriod?.status === PAYROLL_PERIOD_STATUS.Calculated ? 'إعادة حساب المسير' : 'حساب المسير',
                        selectedPeriod?.status === PAYROLL_PERIOD_STATUS.Calculated ? 'Recalculate payroll' : 'Calculate payroll'
                      )}
                    </LoadingButton>
                  </PermissionGuard>
                  <PermissionGuard permission={PAYROLL_PERMISSIONS.approve}>
                    <LoadingButton
                      size="small"
                      variant="contained"
                      color="info"
                      loading={isApproving}
                      loadingPosition="start"
                      startIcon={<IconCheck size={16} />}
                      onClick={handleApprovePeriod}
                      disabled={!canApprovePeriod || busy || isRecalculating || isApproving}
                    >
                      {t(intl.locale, 'اعتماد المسير', 'Approve payroll')}
                    </LoadingButton>
                  </PermissionGuard>
                  {shouldRenderPayAction && (
                    <PermissionGuard permission={PAYROLL_PERMISSIONS.pay}>
                      <LoadingButton
                        size="small"
                        variant="contained"
                        color="primary"
                        loading={paymentHistoryLoading || paymentDetailsLoading}
                        loadingPosition="start"
                        startIcon={<IconCashBanknote size={16} />}
                        onClick={openPayDialog}
                        disabled={!canPayPeriod || busy || isPaying}
                      >
                        {t(intl.locale, 'دفع الرواتب', 'Pay payroll')}
                      </LoadingButton>
                    </PermissionGuard>
                  )}
                  {canReopenPeriod && (
                    <Button
                      size="small"
                      variant="contained"
                      color="warning"
                      startIcon={<IconRotateClockwise2 size={16} />}
                      onClick={() => setIsReopenOpen(true)}
                      disabled={busy || isRecalculating || isReopening}
                    >
                      {t(intl.locale, 'إعادة فتح المسير', 'Reopen payroll')}
                    </Button>
                  )}
                  <PermissionGuard permission={PAYROLL_PERMISSIONS.calculate}>
                    <Button
                      size="small"
                      variant="contained"
                      color="success"
                      startIcon={<IconCheck size={16} />}
                      onClick={handleConfirmPeriod}
                      disabled={!canConfirmPeriod || busy || isRecalculating}
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
                  <Alert severity="info">
                    {t(intl.locale, 'اختر فترة رواتب لعرض تفاصيلها.', 'Select a payroll period to view details.')}
                  </Alert>
                </Box>
              ) : (
                <Box sx={{ p: 2.25 }}>
                  <Stack spacing={2.25}>
                    <Stack
                      direction={{ xs: 'column', md: 'row' }}
                      spacing={1.5}
                      justifyContent="space-between"
                      alignItems={{ xs: 'flex-start', md: 'center' }}
                    >
                      <Stack spacing={0.75}>
                        <Typography variant="h5" fontWeight={800}>
                          {formatMonthLabel(intl.locale, selectedPeriod.year, selectedPeriod.month)}
                        </Typography>
                        <Stack direction="row" spacing={1} flexWrap="wrap">
                          <Chip size="small" label={`${selectedPeriod.year}`} variant="outlined" />
                          <Chip size="small" label={`${selectedPeriod.month}`} variant="outlined" />
                          <Chip
                            size="small"
                            color={getPeriodStatusColor(selectedPeriod.status)}
                            label={getPeriodStatusLabel(intl.locale, selectedPeriod.status)}
                          />
                        </Stack>
                      </Stack>

                      <Stack direction="row" spacing={1}>
                        <Button size="small" variant="text" onClick={() => setIsCreateOpen(true)} startIcon={<IconPlus size={16} />}>
                          {t(intl.locale, 'جديد', 'New')}
                        </Button>
                        <Button size="small" variant="text" onClick={() => refreshSelectedPeriod()} startIcon={<IconRefresh size={16} />}>
                          {t(intl.locale, 'تحديث', 'Refresh')}
                        </Button>
                      </Stack>
                    </Stack>

                    <Grid container spacing={1.5}>
                      <Grid item xs={12} sm={6} md={3}>
                        <SummaryCard label={t(intl.locale, 'العمال', 'Workers')} value={selectedPeriod.workerCount} />
                      </Grid>
                      <Grid item xs={12} sm={6} md={3}>
                        <SummaryCard
                          label={t(intl.locale, 'الأجر الأساسي', 'Basic wage')}
                          value={formatCurrency(intl.locale, selectedPeriod.totalBasicWage)}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6} md={3}>
                        <SummaryCard
                          label={t(intl.locale, 'إجمالي الخصومات', 'Total deductions')}
                          value={formatCurrency(intl.locale, selectedPeriod.totalDeductions)}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6} md={3}>
                        <SummaryCard
                          label={t(intl.locale, 'صافي الأجر', 'Net wage')}
                          value={formatCurrency(intl.locale, selectedPeriod.totalNetWage)}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6} md={3}>
                        <SummaryCard
                          label={t(intl.locale, 'المدفوع', 'Paid')}
                          value={formatCurrency(intl.locale, selectedPeriod.paidAmount)}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6} md={3}>
                        <SummaryCard
                          label={t(intl.locale, 'المتبقي', 'Outstanding')}
                          value={formatCurrency(intl.locale, selectedPeriod.outstandingAmount)}
                        />
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
                                  <Chip
                                    size="small"
                                    label={
                                      !paymentStateReady
                                        ? t(intl.locale, 'جار تحميل الدفع', 'Loading payment')
                                        : paidStatementIds.has(statement.id)
                                          ? t(intl.locale, 'مدفوع', 'Paid')
                                          : isStatementPayable(statement)
                                            ? t(intl.locale, 'غير مدفوع', 'Unpaid')
                                            : t(intl.locale, 'غير مستحق', 'Not payable')
                                    }
                                    color={
                                      !paymentStateReady
                                        ? 'default'
                                        : paidStatementIds.has(statement.id)
                                          ? 'success'
                                          : isStatementPayable(statement)
                                            ? 'warning'
                                            : 'default'
                                    }
                                  />
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

                    <Box>
                      <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={1} sx={{ mb: 1.5 }}>
                        <Typography variant="h6" fontWeight={800}>
                          {t(intl.locale, 'دفعات الرواتب', 'Payroll payments')}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {t(intl.locale, 'كل دفعة تغطي كشفاً كاملاً أو أكثر.', 'Each payment covers one or more full statements.')}
                        </Typography>
                      </Stack>
                      {paymentHistoryError || paymentDetailsError ? (
                        <Alert severity="error">
                          {t(intl.locale, 'تعذر تحميل حالة دفعات الرواتب، لذلك تم تعطيل الدفع مؤقتاً.', 'Unable to load payroll payment state, so payment is temporarily disabled.')}
                        </Alert>
                      ) : paymentHistoryLoading ? (
                        <Box sx={{ py: 2 }}>
                          <Loader />
                        </Box>
                      ) : (
                        <TableContainer>
                          <Table size="small">
                            <TableHead>
                              <TableRow>
                                <TableCell>{t(intl.locale, 'تاريخ الدفع', 'Payment date')}</TableCell>
                                <TableCell align="right">{t(intl.locale, 'المبلغ', 'Amount')}</TableCell>
                                <TableCell>{t(intl.locale, 'الخزينة', 'Treasury')}</TableCell>
                                <TableCell align="right">{t(intl.locale, 'الكشوف', 'Statements')}</TableCell>
                                <TableCell>{t(intl.locale, 'الحالة', 'Status')}</TableCell>
                                <TableCell>{t(intl.locale, 'المرجع', 'Reference')}</TableCell>
                                <TableCell>{t(intl.locale, 'سبب العكس', 'Reversal reason')}</TableCell>
                                <TableCell align="right">{t(intl.locale, 'الإجراءات', 'Actions')}</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {paymentHistory.length === 0 ? (
                                <TableRow>
                                  <TableCell colSpan={8}>
                                    <Alert severity="info">
                                      {t(intl.locale, 'لا توجد دفعات لهذا المسير بعد.', 'No payments for this payroll period yet.')}
                                    </Alert>
                                  </TableCell>
                                </TableRow>
                              ) : (
                                paymentHistory.map((payment) => (
                                  <TableRow key={payment.paymentId}>
                                    <TableCell>{payment.paymentDate}</TableCell>
                                    <TableCell align="right">{formatCurrency(intl.locale, payment.totalAmount)}</TableCell>
                                    <TableCell>
                                      <Stack spacing={0.25}>
                                        <Typography variant="body2">{payment.treasuryAccountNameArabic}</Typography>
                                        <Typography variant="caption" color="text.secondary">
                                          {payment.treasuryAccountCode}
                                        </Typography>
                                      </Stack>
                                    </TableCell>
                                    <TableCell align="right">{payment.statementCount}</TableCell>
                                    <TableCell>
                                      <Chip
                                        size="small"
                                        color={getPaymentStatusColor(payment.reversedAtUtc ? 'reversed' : payment.status)}
                                        label={getPaymentStatusLabel(intl.locale, payment.reversedAtUtc ? 'reversed' : payment.status)}
                                      />
                                    </TableCell>
                                    <TableCell>{payment.treasuryTransactionId || payment.journalEntryId || '-'}</TableCell>
                                    <TableCell>{payment.reversalReason || '-'}</TableCell>
                                    <TableCell align="right">
                                      {isPaymentActive(payment) && (
                                        <PermissionGuard permission={PAYROLL_PERMISSIONS.pay}>
                                          <Button
                                            size="small"
                                            color="warning"
                                            variant="outlined"
                                            startIcon={<IconRotateClockwise2 size={16} />}
                                            onClick={() => {
                                              setReverseTarget(payment);
                                              setReverseError(null);
                                            }}
                                            disabled={isReversing}
                                          >
                                            {t(intl.locale, 'عكس الدفعة', 'Reverse')}
                                          </Button>
                                        </PermissionGuard>
                                      )}
                                    </TableCell>
                                  </TableRow>
                                ))
                              )}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      )}
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
                              <Chip
                                size="small"
                                variant="outlined"
                                label={`${t(intl.locale, 'الأجر اليومي', 'Daily wage')}: ${formatCurrency(intl.locale, selectedStatement.dailyWageSnapshot)}`}
                              />
                              <Chip
                                size="small"
                                variant="outlined"
                                label={`${t(intl.locale, 'صافي الأجر', 'Net wage')}: ${formatCurrency(intl.locale, selectedStatement.netWage)}`}
                              />
                            </Stack>
                          </Stack>

                          <Grid container spacing={1.5}>
                            <Grid item xs={12} sm={6} md={3}>
                              <SummaryCard
                                label={t(intl.locale, 'الإضافي', 'Overtime')}
                                value={formatCurrency(intl.locale, selectedStatement.overtimeAmount)}
                              />
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                              <SummaryCard
                                label={t(intl.locale, 'ليلي', 'Night work')}
                                value={formatCurrency(intl.locale, selectedStatement.nightWorkAmount)}
                              />
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                              <SummaryCard
                                label={t(intl.locale, 'مكافآت', 'Bonuses')}
                                value={formatCurrency(intl.locale, selectedStatement.bonusAmount)}
                              />
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
                                      <Alert severity="info">
                                        {t(intl.locale, 'لا توجد خصومات داخل هذا الكشف.', 'No deductions in this statement.')}
                                      </Alert>
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

      <Dialog open={isReopenOpen} onClose={() => setIsReopenOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>{t(intl.locale, 'إعادة فتح مسير الرواتب', 'Reopen payroll period')}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Alert severity="warning">
              {t(
                intl.locale,
                'سيتم إرجاع المسير من معتمد إلى محسوب دون إعادة احتسابه. لن يتم السماح بهذه العملية إذا وُجد دفع نشط.',
                'This will move the payroll period from approved back to calculated without recalculation. The action is blocked if an active payment exists.'
              )}
            </Alert>
            <TextField
              label={t(intl.locale, 'سبب إعادة الفتح', 'Reason for reopening')}
              value={reopenReason}
              onChange={(event) => setReopenReason(event.target.value)}
              fullWidth
              required
              multiline
              minRows={3}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setIsReopenOpen(false);
              setReopenReason('');
            }}
          >
            {t(intl.locale, 'إلغاء', 'Cancel')}
          </Button>
          <LoadingButton
            variant="contained"
            color="warning"
            loading={isReopening}
            onClick={handleReopenPeriod}
            disabled={!reopenReason.trim()}
          >
            {t(intl.locale, 'إعادة فتح', 'Reopen')}
          </LoadingButton>
        </DialogActions>
      </Dialog>

      <Dialog open={isPayOpen} onClose={() => setIsPayOpen(false)} fullWidth maxWidth="md">
        <DialogTitle>{t(intl.locale, 'دفع كشوف الرواتب', 'Pay payroll statements')}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Alert severity="info">
              {t(intl.locale, 'يتم دفع كل كشف بالكامل. الدفع الجزئي هنا يعني اختيار بعض الكشوف فقط.', 'Each statement is paid in full. Partial payment here means selecting a subset of statements.')}
            </Alert>
            <Select
              displayEmpty
              value={payTreasuryAccountId}
              onChange={(event) => setPayTreasuryAccountId(String(event.target.value))}
              fullWidth
              disabled={treasuryAccountsLoading || isPaying}
            >
              <MenuItem value="">{t(intl.locale, 'اختر حساب الخزينة', 'Select treasury account')}</MenuItem>
              {treasuryAccounts.map((account) => (
                <MenuItem key={account.id} value={account.id}>
                  {account.code} - {account.nameArabic} ({formatCurrency(intl.locale, account.balance)})
                </MenuItem>
              ))}
            </Select>
            <TextField
              type="date"
              label={t(intl.locale, 'تاريخ الدفع', 'Payment date')}
              value={payPaymentDate}
              onChange={(event) => setPayPaymentDate(event.target.value)}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label={t(intl.locale, 'ملاحظات', 'Notes')}
              value={payNotes}
              onChange={(event) => setPayNotes(event.target.value)}
              fullWidth
              multiline
              minRows={2}
            />
            <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={1}>
              <Button
                variant={payAllUnpaid ? 'contained' : 'outlined'}
                onClick={() => {
                  setPayAllUnpaid(true);
                  setPayStatementIds([]);
                }}
                disabled={isPaying}
              >
                {t(intl.locale, 'دفع جميع غير المدفوع', 'Pay all unpaid')}
              </Button>
              <Button variant={!payAllUnpaid ? 'contained' : 'outlined'} onClick={() => setPayAllUnpaid(false)} disabled={isPaying}>
                {t(intl.locale, 'اختيار كشوف محددة', 'Select statements')}
              </Button>
            </Stack>
            <TableContainer sx={{ maxHeight: 320 }}>
              <Table stickyHeader size="small">
                <TableHead>
                  <TableRow>
                    <TableCell padding="checkbox" />
                    <TableCell>{t(intl.locale, 'العامل', 'Worker')}</TableCell>
                    <TableCell align="right">{t(intl.locale, 'الصافي', 'Net')}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {unpaidPayableStatements.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3}>
                        <Alert severity="info">{t(intl.locale, 'لا توجد كشوف مستحقة غير مدفوعة.', 'There are no unpaid payable statements.')}</Alert>
                      </TableCell>
                    </TableRow>
                  ) : (
                    unpaidPayableStatements.map((statement) => (
                      <TableRow key={statement.id} hover>
                        <TableCell padding="checkbox">
                          <Checkbox
                            checked={payAllUnpaid || payStatementIds.includes(statement.id)}
                            onChange={() => togglePayStatement(statement.id)}
                            disabled={payAllUnpaid || isPaying}
                          />
                        </TableCell>
                        <TableCell>
                          <Stack spacing={0.25}>
                            <Typography fontWeight={700}>{statement.workerNameSnapshot}</Typography>
                            <Typography variant="caption" color="text.secondary">
                              {statement.workerCodeSnapshot}
                            </Typography>
                          </Stack>
                        </TableCell>
                        <TableCell align="right">{formatCurrency(intl.locale, statement.netWage)}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" spacing={1}>
              <Typography variant="subtitle1" fontWeight={800}>
                {t(intl.locale, 'إجمالي الدفع', 'Payment total')}: {formatCurrency(intl.locale, payTotalAmount)}
              </Typography>
              {hasInsufficientTreasuryBalance && (
                <Typography color="error" variant="body2">
                  {t(intl.locale, 'رصيد حساب الخزينة غير كافٍ.', 'Treasury account balance is insufficient.')}
                </Typography>
              )}
            </Stack>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsPayOpen(false)} disabled={isPaying}>
            {t(intl.locale, 'إلغاء', 'Cancel')}
          </Button>
          <LoadingButton
            variant="contained"
            loading={isPaying}
            onClick={handlePayStatements}
            disabled={!payTreasuryAccountId || (!payAllUnpaid && selectedPayStatements.length === 0) || !payPaymentDate || hasInsufficientTreasuryBalance}
          >
            {t(intl.locale, 'دفع', 'Pay')}
          </LoadingButton>
        </DialogActions>
      </Dialog>

      <Dialog open={reverseTarget != null} onClose={() => setReverseTarget(null)} fullWidth maxWidth="sm">
        <DialogTitle>{t(intl.locale, 'عكس دفعة الرواتب', 'Reverse payroll payment')}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            {reverseError && <Alert severity="error">{reverseError}</Alert>}
            <Alert severity="warning">
              {t(intl.locale, 'سيتم عكس هذه الدفعة فقط، وستبقى في سجل المدفوعات.', 'Only this payment will be reversed, and it will remain visible in payment history.')}
            </Alert>
            <TextField
              label={t(intl.locale, 'سبب العكس', 'Reversal reason')}
              value={reverseReason}
              onChange={(event) => setReverseReason(event.target.value)}
              fullWidth
              required
              multiline
              minRows={3}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setReverseTarget(null);
              setReverseReason('');
              setReverseError(null);
            }}
            disabled={isReversing}
          >
            {t(intl.locale, 'إلغاء', 'Cancel')}
          </Button>
          <LoadingButton color="warning" variant="contained" loading={isReversing} onClick={handleReversePayment} disabled={!reverseReason.trim()}>
            {t(intl.locale, 'عكس الدفعة', 'Reverse')}
          </LoadingButton>
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
