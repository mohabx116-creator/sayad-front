import { useMemo, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { Link } from 'react-router-dom';
import { useSWRConfig } from 'swr';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/GridLegacy';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import OutlinedInput from '@mui/material/OutlinedInput';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Tab from '@mui/material/Tab';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import Tabs from '@mui/material/Tabs';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';

import {
  IconArrowDownLeft,
  IconArrowLeft,
  IconArrowRight,
  IconArrowUpRight,
  IconBuildingBank,
  IconCheck,
  IconDownload,
  IconEye,
  IconLayoutGrid,
  IconList,
  IconPlus,
  IconRefresh,
  IconSearch,
  IconUpload,
  IconWallet,
  IconX
} from '@tabler/icons-react';

import { useDispatch } from 'store';
import { openSnackbar } from 'store/slices/snackbar';
import Breadcrumbs from 'ui-component/extended/Breadcrumbs';
import PageTitle from 'ui-component/PageTitle';
import MainCard from 'ui-component/cards/MainCard';
import PermissionGuard from 'modules/Administration/components/PermissionGuard';
import { ExcelActions } from 'shared/components/excel';

import TreasuryConfirmationDialog, { TreasuryActionType } from '../components/TreasuryConfirmationDialog';
import TreasuryAccountCard from '../components/TreasuryAccountCard';
import TreasuryAccountImportWizard from '../components/TreasuryAccountImportWizard';
import TreasuryDeferredSection from '../components/TreasuryDeferredSection';
import TreasuryMovementTable from '../components/TreasuryMovementTable';
import { activateTreasuryAccount, deactivateTreasuryAccount, downloadTreasuryAccountsImportTemplate, exportTreasuryAccountsToExcel } from '../api/treasuryApi';
import { useTreasuryAccounts, useTreasuryDashboardSummary } from '../hooks/useTreasury';
import { TREASURY_PERMISSIONS } from '../utils/treasury.constants';
import { formatTreasuryMoney } from '../utils/treasury.format';
import type { TreasuryListParams } from '../types/treasury.types';

function formatMovementDate(value: string | null, locale: string) {
  if (!value) {
    return '-';
  }

  const parsed = new Date(`${value}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat(locale.startsWith('ar') ? 'ar-EG' : 'en-GB', {
    year: 'numeric',
    month: 'short',
    day: '2-digit'
  }).format(parsed);
}

function downloadBlob(blob: Blob, fileName: string) {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}

export default function TreasuryAccountsListPage() {
  const theme = useTheme();
  const intl = useIntl();
  const dispatch = useDispatch();
  const isRtl = theme.direction === 'rtl';
  const { mutate: mutateTreasury } = useSWRConfig();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [isImportWizardOpen, setIsImportWizardOpen] = useState(false);
  const [params, setParams] = useState<TreasuryListParams>({
    page: 1,
    pageSize: 50
  });

  const [actionDialog, setActionDialog] = useState<{
    open: boolean;
    action: TreasuryActionType;
    id: string;
    rowVersion: string;
  }>({
    open: false,
    action: 'activate',
    id: '',
    rowVersion: ''
  });
  const [isProcessing, setIsProcessing] = useState(false);

  // Live Accounts Query
  const { items, meta, isLoading, mutate } = useTreasuryAccounts(params);

  // Live Dashboard Summary (Aggregated totals, currency summaries & recent movements)
  const { summary, isLoading: isSummaryLoading, mutate: mutateSummary } = useTreasuryDashboardSummary();

  const currencySummaries = summary?.currencySummaries ?? [];
  const recentMovements = summary?.recentMovements ?? [];

  // Filtered accounts according to search & status filter
  const filteredAccounts = useMemo(() => {
    return items.filter((account) => {
      // Status filter
      if (statusFilter === 'active' && !account.isActive) return false;
      if (statusFilter === 'inactive' && account.isActive) return false;

      // Search filter
      if (searchQuery.trim()) {
        const query = searchQuery.trim().toLowerCase();
        const matchesArabic = account.nameArabic.toLowerCase().includes(query);
        const matchesEnglish = (account.nameEnglish ?? '').toLowerCase().includes(query);
        const matchesCode = (account.code ?? '').toLowerCase().includes(query);
        if (!matchesArabic && !matchesEnglish && !matchesCode) {
          return false;
        }
      }

      return true;
    });
  }, [items, searchQuery, statusFilter]);

  // Aggregate Total Available Liquid Cash across active accounts
  const liquidTotals = useMemo(() => {
    let totalBalance = 0;
    let activeCount = 0;
    let currency = 'EGP';

    items.forEach((acc) => {
      if (acc.isActive) {
        totalBalance += acc.balance;
        activeCount += 1;
        if (acc.currencyCode) {
          currency = acc.currencyCode;
        }
      }
    });

    // If currency summary provides total, prioritize it
    if (currencySummaries.length > 0) {
      totalBalance = currencySummaries.reduce((sum, curr) => sum + curr.totalCurrentBalance, 0);
      currency = currencySummaries[0]?.currencyCode ?? currency;
    }

    return { totalBalance, activeCount, currency };
  }, [items, currencySummaries]);

  const notify = (message: string, severity: 'success' | 'error' = 'success') => {
    dispatch(openSnackbar({ open: true, message, variant: 'alert', severity }));
  };

  const handleExport = async () => {
    try {
      const blob = await exportTreasuryAccountsToExcel();
      downloadBlob(blob, 'treasury-accounts-export.xlsx');
      notify('تم تصدير حسابات الخزينة إلى Excel بنجاح.');
    } catch (error) {
      notify(error instanceof Error ? error.message : 'تعذر تصدير حسابات الخزينة إلى Excel.', 'error');
    }
  };

  const handleTemplateDownload = async () => {
    try {
      const blob = await downloadTreasuryAccountsImportTemplate();
      downloadBlob(blob, 'treasury-accounts-import-template.xlsx');
      notify('تم تنزيل قالب الاستيراد بنجاح.');
    } catch (error) {
      notify(error instanceof Error ? error.message : 'تعذر تنزيل قالب الاستيراد.', 'error');
    }
  };

  const handleConfirmAction = async () => {
    setIsProcessing(true);
    try {
      if (actionDialog.action === 'activate') {
        await activateTreasuryAccount(actionDialog.id, actionDialog.rowVersion);
        notify(intl.formatMessage({ id: 'cashbox-activated', defaultMessage: 'تم تفعيل الخزينة بنجاح.' }));
      } else {
        await deactivateTreasuryAccount(actionDialog.id, actionDialog.rowVersion);
        notify(intl.formatMessage({ id: 'cashbox-deactivated', defaultMessage: 'تم إيقاف الخزينة بنجاح.' }));
      }

      await mutateTreasury((key) => typeof key === 'string' && key.startsWith('/api/treasury/'));
      await mutate();
      await mutateSummary();
    } catch (error) {
      notify(error instanceof Error ? error.message : 'فشلت العملية.', 'error');
    } finally {
      setIsProcessing(false);
      setActionDialog({ open: false, action: 'activate', id: '', rowVersion: '' });
    }
  };

  return (
    <Box sx={{ pb: 6 }}>
      {/* 1. Header Section */}
      <Box sx={{ mb: 3.5 }}>
        <Breadcrumbs custom card={false} title={false} divider={false} heading="cashboxes" links={[{ title: 'cashboxes' }]} sx={{ mb: 0 }} />
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mt: 1, gap: 2, flexWrap: 'wrap' }}>
          <Box>
            <PageTitle>
              <FormattedMessage id="cashboxes" defaultMessage="الخزائن" />
            </PageTitle>
            <Typography variant="body1" color="text.secondary" sx={{ mt: 0.75, maxWidth: 820, lineHeight: 1.6 }}>
              <FormattedMessage
                id="cashboxes-page-description"
                defaultMessage="لوحة الخزائن المالية المتكاملة: متابعة الأرصدة النقدية اللحظية، المحافظ الرقمية، قنوات الدفع، والذمم الآجلة."
              />
            </Typography>
          </Box>

          <Stack direction="row" spacing={1.5} alignItems="center">
            <Tooltip title={intl.formatMessage({ id: 'refresh', defaultMessage: 'تحديث البيانات' })}>
              <IconButton
                onClick={() => {
                  mutate();
                  mutateSummary();
                }}
                sx={{
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 2,
                  bgcolor: 'background.paper',
                  '&:hover': { bgcolor: 'grey.100' }
                }}
              >
                <IconRefresh size={19} />
              </IconButton>
            </Tooltip>

            <ExcelActions
              onExport={handleExport}
              onDownloadTemplate={handleTemplateDownload}
              onImportClick={() => setIsImportWizardOpen(true)}
              exportPermission={TREASURY_PERMISSIONS.accountsView}
              templatePermission={TREASURY_PERMISSIONS.accountsCreate}
              importPermission={TREASURY_PERMISSIONS.accountsCreate}
              size="large"
              sx={{ borderRadius: 2.5, px: 2.5, py: 1.1, fontWeight: 700, fontSize: '0.95rem' }}
            />

            <PermissionGuard permission={TREASURY_PERMISSIONS.accountsCreate}>
              <Button
                component={Link}
                to="/treasury/accounts/new"
                variant="contained"
                size="large"
                startIcon={<IconPlus size={20} />}
                sx={{
                  borderRadius: 2.5,
                  px: 3,
                  py: 1.1,
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  boxShadow: '0 4px 14px rgba(33, 150, 243, 0.35)'
                }}
              >
                <FormattedMessage id="add-cashbox" defaultMessage="إضافة خزينة" />
              </Button>
            </PermissionGuard>
          </Stack>
        </Box>
      </Box>

      {/* 2. Top Financial KPI Summary Strip */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Total Available Liquid Cash */}
        <Grid item xs={12} sm={6} md={4}>
          <Card
            sx={{
              p: 2.75,
              borderRadius: 3.5,
              border: '1px solid',
              borderColor: alpha('#059669', 0.25),
              background: theme.palette.mode === 'dark'
                ? `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.9)} 0%, ${alpha('#059669', 0.15)} 100%)`
                : 'linear-gradient(135deg, #FFFFFF 0%, #F0FDF4 100%)',
              boxShadow: '0 4px 16px rgba(5, 150, 105, 0.06)'
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Box>
                <Typography variant="body2" color="text.secondary" fontWeight={700} sx={{ mb: 0.5 }}>
                  <FormattedMessage id="total-liquid-balance" defaultMessage="إجمالي السيولة النقدية المتاحة" />
                </Typography>
                {isLoading && isSummaryLoading ? (
                  <Skeleton width={160} height={40} />
                ) : (
                  <Typography
                    variant="h2"
                    fontWeight={900}
                    sx={{
                      color: '#059669',
                      letterSpacing: '-0.03em',
                      fontSize: { xs: '1.75rem', sm: '2rem' }
                    }}
                  >
                    {formatTreasuryMoney(liquidTotals.totalBalance, liquidTotals.currency)}
                  </Typography>
                )}
              </Box>
              <Box
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: 2.5,
                  bgcolor: '#DCFCE7',
                  color: '#059669',
                  display: 'grid',
                  placeItems: 'center',
                  boxShadow: '0 4px 10px rgba(5, 150, 105, 0.2)'
                }}
              >
                <IconWallet size={24} stroke={2} />
              </Box>
            </Box>
          </Card>
        </Grid>

        {/* Active Accounts Count */}
        <Grid item xs={12} sm={6} md={4}>
          <Card
            sx={{
              p: 2.75,
              borderRadius: 3.5,
              border: '1px solid',
              borderColor: alpha(theme.palette.primary.main, 0.25),
              background: theme.palette.mode === 'dark'
                ? `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.9)} 0%, ${alpha(theme.palette.primary.main, 0.15)} 100%)`
                : 'linear-gradient(135deg, #FFFFFF 0%, #EEF2FF 100%)',
              boxShadow: '0 4px 16px rgba(79, 70, 229, 0.06)'
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Box>
                <Typography variant="body2" color="text.secondary" fontWeight={700} sx={{ mb: 0.5 }}>
                  <FormattedMessage id="active-treasuries" defaultMessage="الخزائن النشطة" />
                </Typography>
                {isLoading ? (
                  <Skeleton width={80} height={40} />
                ) : (
                  <Typography
                    variant="h2"
                    fontWeight={900}
                    sx={{
                      color: 'primary.dark',
                      letterSpacing: '-0.03em',
                      fontSize: { xs: '1.75rem', sm: '2rem' }
                    }}
                  >
                    {items.filter((a) => a.isActive).length}{' '}
                    <Typography component="span" variant="body1" color="text.secondary" fontWeight={600}>
                      / {items.length} {intl.formatMessage({ id: 'account', defaultMessage: 'خزينة' })}
                    </Typography>
                  </Typography>
                )}
              </Box>
              <Box
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: 2.5,
                  bgcolor: '#E0E7FF',
                  color: 'primary.dark',
                  display: 'grid',
                  placeItems: 'center',
                  boxShadow: '0 4px 10px rgba(79, 70, 229, 0.2)'
                }}
              >
                <IconBuildingBank size={24} stroke={2} />
              </Box>
            </Box>
          </Card>
        </Grid>

        {/* Period Inflow / Outflow Summary */}
        <Grid item xs={12} sm={12} md={4}>
          <Card
            sx={{
              p: 2.75,
              borderRadius: 3.5,
              border: '1px solid',
              borderColor: 'divider',
              background: theme.palette.background.paper,
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.04)'
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box sx={{ width: '48%' }}>
                <Stack direction="row" spacing={0.5} alignItems="center" sx={{ color: 'success.main', mb: 0.5 }}>
                  <IconArrowDownLeft size={16} stroke={2.5} />
                  <Typography variant="caption" fontWeight={700} color="text.secondary">
                    <FormattedMessage id="receipts" defaultMessage="المقبوضات" />
                  </Typography>
                </Stack>
                {isSummaryLoading ? (
                  <Skeleton width={80} height={24} />
                ) : (
                  <Typography variant="h5" fontWeight={800} color="success.dark">
                    {formatTreasuryMoney(
                      currencySummaries.reduce((sum, c) => sum + c.periodReceipts, 0),
                      liquidTotals.currency
                    )}
                  </Typography>
                )}
              </Box>

              <Divider orientation="vertical" flexItem sx={{ my: 0.5 }} />

              <Box sx={{ width: '48%', textAlign: isRtl ? 'right' : 'left' }}>
                <Stack direction="row" spacing={0.5} alignItems="center" sx={{ color: 'error.main', mb: 0.5 }}>
                  <IconArrowUpRight size={16} stroke={2.5} />
                  <Typography variant="caption" fontWeight={700} color="text.secondary">
                    <FormattedMessage id="payments" defaultMessage="المدفوعات" />
                  </Typography>
                </Stack>
                {isSummaryLoading ? (
                  <Skeleton width={80} height={24} />
                ) : (
                  <Typography variant="h5" fontWeight={800} color="error.dark">
                    {formatTreasuryMoney(
                      currencySummaries.reduce((sum, c) => sum + c.periodPayments, 0),
                      liquidTotals.currency
                    )}
                  </Typography>
                )}
              </Box>
            </Box>
          </Card>
        </Grid>
      </Grid>

      <TreasuryAccountImportWizard
        open={isImportWizardOpen}
        onClose={() => setIsImportWizardOpen(false)}
        onImported={async () => {
          await Promise.all([
            mutate(),
            mutateSummary(),
            mutateTreasury((key) => typeof key === 'string' && key.startsWith('/api/treasury/'))
          ]);
        }}
      />

      {/* 3. Toolbar: Search, Status Filter & View Mode */}
      <Box
        sx={{
          p: 1.75,
          mb: 3.5,
          borderRadius: 3,
          bgcolor: 'background.paper',
          border: '1px solid',
          borderColor: 'divider',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 2,
          flexWrap: 'wrap',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.03)'
        }}
      >
        {/* Status Filter Tabs */}
        <Tabs
          value={statusFilter}
          onChange={(_, newValue) => setStatusFilter(newValue)}
          textColor="primary"
          indicatorColor="primary"
          sx={{
            minHeight: 40,
            '& .MuiTab-root': {
              minHeight: 40,
              fontWeight: 700,
              fontSize: '0.875rem',
              px: 2,
              borderRadius: 2
            }
          }}
        >
          <Tab value="all" label={intl.formatMessage({ id: 'filter-all', defaultMessage: 'كافة الخزائن' })} />
          <Tab value="active" label={intl.formatMessage({ id: 'filter-active', defaultMessage: 'النشطة فقط' })} />
          <Tab value="inactive" label={intl.formatMessage({ id: 'filter-inactive', defaultMessage: 'الموقوفة' })} />
        </Tabs>

        <Stack direction="row" spacing={1.5} alignItems="center" sx={{ flexGrow: { xs: 1, sm: 0 } }}>
          {/* Search Input */}
          <OutlinedInput
            size="small"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={intl.formatMessage({ id: 'search-treasuries', defaultMessage: 'بحث عن خزينة بالاسم أو الكود...' })}
            startAdornment={
              <InputAdornment position="start">
                <IconSearch size={18} />
              </InputAdornment>
            }
            sx={{
              borderRadius: 2,
              minWidth: { xs: '100%', sm: 260 },
              bgcolor: 'grey.50'
            }}
          />

          {/* View Toggle */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              p: 0.5,
              borderRadius: 2,
              bgcolor: 'grey.100',
              border: '1px solid',
              borderColor: 'divider'
            }}
          >
            <Tooltip title={intl.formatMessage({ id: 'view-mode-cards', defaultMessage: 'عرض البطاقات' })}>
              <IconButton
                size="small"
                onClick={() => setViewMode('cards')}
                sx={{
                  borderRadius: 1.5,
                  bgcolor: viewMode === 'cards' ? 'background.paper' : 'transparent',
                  color: viewMode === 'cards' ? 'primary.main' : 'text.secondary',
                  boxShadow: viewMode === 'cards' ? '0 2px 6px rgba(0,0,0,0.08)' : 'none'
                }}
              >
                <IconLayoutGrid size={18} />
              </IconButton>
            </Tooltip>

            <Tooltip title={intl.formatMessage({ id: 'view-mode-table', defaultMessage: 'عرض الجدول' })}>
              <IconButton
                size="small"
                onClick={() => setViewMode('table')}
                sx={{
                  borderRadius: 1.5,
                  bgcolor: viewMode === 'table' ? 'background.paper' : 'transparent',
                  color: viewMode === 'table' ? 'primary.main' : 'text.secondary',
                  boxShadow: viewMode === 'table' ? '0 2px 6px rgba(0,0,0,0.08)' : 'none'
                }}
              >
                <IconList size={18} />
              </IconButton>
            </Tooltip>
          </Box>
        </Stack>
      </Box>

      {/* 4. Treasury Cards View (Primary 3-Column Desktop View) */}
      {viewMode === 'cards' ? (
        <Box>
          {isLoading ? (
            <Grid container spacing={3}>
              {Array.from({ length: 3 }).map((_, index) => (
                <Grid item xs={12} sm={6} lg={4} key={index}>
                  <Card sx={{ p: 3, borderRadius: 3.5, border: '1px solid', borderColor: 'divider', minHeight: 280 }}>
                    <Stack spacing={2}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Skeleton variant="rounded" width={48} height={48} />
                        <Skeleton width={60} height={24} />
                      </Box>
                      <Skeleton width="60%" height={28} />
                      <Skeleton width="40%" height={20} />
                      <Skeleton variant="rounded" width="100%" height={80} sx={{ my: 1 }} />
                      <Skeleton variant="rounded" width="100%" height={40} />
                    </Stack>
                  </Card>
                </Grid>
              ))}
            </Grid>
          ) : filteredAccounts.length === 0 ? (
            <Card
              sx={{
                p: 6,
                textAlign: 'center',
                borderRadius: 3.5,
                border: '1px dashed',
                borderColor: 'divider',
                bgcolor: 'background.paper'
              }}
            >
              <Box
                sx={{
                  width: 64,
                  height: 64,
                  borderRadius: 3,
                  bgcolor: 'grey.100',
                  color: 'text.secondary',
                  display: 'grid',
                  placeItems: 'center',
                  mx: 'auto',
                  mb: 2
                }}
              >
                <IconBuildingBank size={32} stroke={1.5} />
              </Box>
              <Typography variant="h4" fontWeight={700} sx={{ mb: 1 }}>
                <FormattedMessage id="no-records-found" defaultMessage="لا توجد خزائن مطابقة" />
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 420, mx: 'auto', mb: 3 }}>
                {searchQuery
                  ? intl.formatMessage({ id: 'no-search-results', defaultMessage: 'لم يتم العثور على نتائج تطابق معايير البحث الحالية.' })
                  : intl.formatMessage({ id: 'empty-treasury-message', defaultMessage: 'لم يتم إضافة أي خزائن مالية بعد. ابدأ بإضافة أول خزينة الآن.' })}
              </Typography>
              <PermissionGuard permission={TREASURY_PERMISSIONS.accountsCreate}>
                <Button component={Link} to="/treasury/accounts/new" variant="contained" startIcon={<IconPlus size={18} />} sx={{ borderRadius: 2 }}>
                  <FormattedMessage id="add-cashbox" defaultMessage="إضافة خزينة" />
                </Button>
              </PermissionGuard>
            </Card>
          ) : (
            <Grid container spacing={3}>
              {filteredAccounts.map((account) => (
                <Grid item xs={12} sm={6} lg={4} key={account.id}>
                  <TreasuryAccountCard
                    account={account}
                    onActivate={(id, rowVersion) => setActionDialog({ open: true, action: 'activate', id, rowVersion })}
                    onDeactivate={(id, rowVersion) => setActionDialog({ open: true, action: 'deactivate', id, rowVersion })}
                  />
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
      ) : (
        /* 5. Alternative Table View (for dense data inspection) */
        <Card sx={{ border: '1px solid', borderColor: 'divider', boxShadow: '0 2px 12px rgba(0,0,0,0.04)', borderRadius: 3.5, overflow: 'hidden' }}>
          <TableContainer sx={{ overflowX: 'auto' }}>
            <Table sx={{ minWidth: 920 }}>
              <TableHead sx={{ bgcolor: 'grey.50' }}>
                <TableRow>
                  <TableCell>
                    <FormattedMessage id="cashbox-name" defaultMessage="اسم الخزنة" />
                  </TableCell>
                  <TableCell align="right">
                    <FormattedMessage id="current-balance" defaultMessage="الرصيد الحالي" />
                  </TableCell>
                  <TableCell>
                    <FormattedMessage id="status" defaultMessage="الحالة" />
                  </TableCell>
                  <TableCell>
                    <FormattedMessage id="last-movement" defaultMessage="آخر حركة" />
                  </TableCell>
                  <TableCell align="center">
                    <FormattedMessage id="actions" defaultMessage="الإجراءات" />
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <Skeleton width={220} />
                      </TableCell>
                      <TableCell align="right">
                        <Skeleton width={100} sx={{ ml: 'auto' }} />
                      </TableCell>
                      <TableCell>
                        <Skeleton width={90} />
                      </TableCell>
                      <TableCell>
                        <Skeleton width={120} />
                      </TableCell>
                      <TableCell align="center">
                        <Skeleton width={120} sx={{ mx: 'auto' }} />
                      </TableCell>
                    </TableRow>
                  ))
                ) : filteredAccounts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 5 }}>
                      <Typography variant="body1" color="text.secondary">
                        <FormattedMessage id="no-records-found" defaultMessage="لا توجد سجلات." />
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAccounts.map((row) => (
                    <TableRow key={row.id} hover>
                      <TableCell>
                        <Typography variant="body2" fontWeight={700}>
                          {row.nameArabic}
                        </Typography>
                        {row.nameEnglish && (
                          <Typography variant="caption" color="text.secondary" display="block">
                            {row.nameEnglish}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" fontWeight={800} color={row.balance < 0 ? 'error.main' : 'text.primary'}>
                          {formatTreasuryMoney(row.balance, row.currencyCode)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" display="block">
                          {row.balanceNature === 'Debit' ? 'مدين' : row.balanceNature === 'Credit' ? 'دائن' : 'متزن'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          label={<FormattedMessage id={row.isActive ? 'active' : 'inactive'} defaultMessage={row.isActive ? 'نشط' : 'موقوف'} />}
                          color={row.isActive ? 'success' : 'default'}
                          variant="outlined"
                          sx={{ fontWeight: 600 }}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight={500}>
                          {formatMovementDate(row.lastMovementDate, intl.locale)}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <IconButton component={Link} to={`/treasury/accounts/${row.id}`} size="small" color="primary">
                          <IconEye size={18} />
                        </IconButton>
                        {row.isActive ? (
                          <PermissionGuard permission={TREASURY_PERMISSIONS.accountsDeactivate}>
                            <IconButton
                              onClick={() => setActionDialog({ open: true, action: 'deactivate', id: row.id, rowVersion: row.rowVersion })}
                              size="small"
                              color="error"
                            >
                              <IconX size={18} />
                            </IconButton>
                          </PermissionGuard>
                        ) : (
                          <PermissionGuard permission={TREASURY_PERMISSIONS.accountsActivate}>
                            <IconButton
                              onClick={() => setActionDialog({ open: true, action: 'activate', id: row.id, rowVersion: row.rowVersion })}
                              size="small"
                              color="success"
                            >
                              <IconCheck size={18} />
                            </IconButton>
                          </PermissionGuard>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            component="div"
            count={meta.totalCount}
            page={Math.max(0, meta.page - 1)}
            onPageChange={(_, newPage) => setParams({ ...params, page: newPage + 1 })}
            rowsPerPage={meta.pageSize}
            onRowsPerPageChange={(event) => setParams({ ...params, pageSize: parseInt(event.target.value, 10), page: 1 })}
            rowsPerPageOptions={[10, 20, 50]}
          />
        </Card>
      )}

      {/* 6. Deferred / Credit Section (الذمم والمستحقات) */}
      <TreasuryDeferredSection defaultCurrencyCode={liquidTotals.currency} />

      {/* 7. Recent Movements Area (Compact recent activities from current APIs) */}
      {recentMovements.length > 0 && (
        <Box sx={{ mt: 5 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Box>
              <Typography variant="h3" fontWeight={800} sx={{ fontSize: { xs: '1.2rem', sm: '1.35rem' } }}>
                <FormattedMessage id="recent-movements" defaultMessage="آخر الحركات المالية" />
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                <FormattedMessage
                  id="recent-movements-desc"
                  defaultMessage="أحدث المعاملات وحركات القبض والصرف المسجلة عبر كافة الخزائن."
                />
              </Typography>
            </Box>
            <Button
              component={Link}
              to="/treasury/statements"
              variant="outlined"
              size="small"
              endIcon={isRtl ? <IconArrowLeft size={16} /> : <IconArrowRight size={16} />}
              sx={{ borderRadius: 2, fontWeight: 700 }}
            >
              <FormattedMessage id="view-all-movements" defaultMessage="عرض كافة الكشوفات" />
            </Button>
          </Box>

          <TreasuryMovementTable movements={recentMovements.slice(0, 6)} page={1} totalPages={1} currencyCode={liquidTotals.currency} />
        </Box>
      )}

      {/* Confirmation Dialog for Activate/Deactivate */}
      <TreasuryConfirmationDialog
        open={actionDialog.open}
        action={actionDialog.action}
        isProcessing={isProcessing}
        onConfirm={handleConfirmAction}
        onClose={() => setActionDialog({ open: false, action: 'activate', id: '', rowVersion: '' })}
      />
    </Box>
  );
}
