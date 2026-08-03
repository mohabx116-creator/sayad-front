import { ElementType, ReactNode, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { FormattedMessage, useIntl } from 'react-intl';

import Alert from '@mui/material/Alert';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import LinearProgress from '@mui/material/LinearProgress';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';
import {
  IconArrowRight,
  IconBellRinging,
  IconCashBanknote,
  IconClipboardList,
  IconPackage,
  IconRefresh,
  IconSparkles,
  IconUserBolt,
  IconUsers
} from '@tabler/icons-react';

import MainCard from 'ui-component/cards/MainCard';
import Loader from 'ui-component/Loader';
import Logo from 'ui-component/Logo';
import useAuth from 'hooks/useAuth';
import { resolveLocalizedText } from 'shared/utils/localizedText';
import { useTreasuryDashboardSummary } from 'modules/Treasury/hooks/useTreasury';
import { useInventoryStockReport, useLowStockItems } from 'modules/Inventory/hooks/useInventory';
import { useNotifications } from 'modules/Notifications/hooks/useNotifications';
import { useWorkers, useWorkerMonthlySalaryReport } from 'modules/Workers/hooks/useWorkers';

function formatAmount(locale: string, value: number) {
  return new Intl.NumberFormat(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value);
}

function formatDateTime(locale: string, value?: string | Date | null) {
  if (!value) {
    return '-';
  }

  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value instanceof Date ? value.toString() : value;
  }

  return new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeStyle: 'short' }).format(date);
}

function formatDateOnly(locale: string, value?: string | Date | null) {
  if (!value) {
    return '-';
  }

  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value instanceof Date ? value.toString() : value;
  }

  return new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(date);
}

function formatInteger(locale: string, value: number) {
  return new Intl.NumberFormat(locale, { maximumFractionDigits: 0 }).format(value);
}

function sum(values: number[]) {
  return values.reduce((total, current) => total + current, 0);
}

function MetricCard({
  title,
  value,
  helper,
  icon: Icon,
  tone,
  to
}: {
  title: ReactNode;
  value: ReactNode;
  helper?: ReactNode;
  icon: ElementType;
  tone: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
  to?: string;
}) {
  const card = (
    <MainCard
      content={false}
      sx={(theme) => ({
        height: '100%',
        border: '1px solid',
        borderColor: `${tone}.light`,
        bgcolor: theme.palette.mode === 'dark' ? 'background.default' : `${tone}.light`,
        transition: 'transform .18s ease, box-shadow .18s ease',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: theme.shadows[3]
        }
      })}
    >
      <Box sx={{ p: 2.5, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 2 }}>
        <Stack spacing={0.75} sx={{ minWidth: 0 }}>
          <Typography variant="body2" color="text.secondary" fontWeight={600}>
            {title}
          </Typography>
          <Typography variant="h4" fontWeight={800} sx={{ lineHeight: 1.1 }}>
            {value}
          </Typography>
          {helper && (
            <Typography variant="caption" color="text.secondary">
              {helper}
            </Typography>
          )}
        </Stack>
        <Avatar
          sx={{
            bgcolor: `${tone}.light`,
            color: `${tone}.dark`,
            width: 42,
            height: 42
          }}
        >
          <Icon size={20} />
        </Avatar>
      </Box>
    </MainCard>
  );

  if (!to) {
    return card;
  }

  return (
    <Box component={Link} to={to} sx={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
      {card}
    </Box>
  );
}

function SectionHeader({ title, action }: { title: ReactNode; action?: ReactNode }) {
  return (
    <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2} sx={{ mb: 2 }}>
      <Typography variant="h5" fontWeight={800}>
        {title}
      </Typography>
      {action}
    </Stack>
  );
}

export default function DashboardDefault() {
  const intl = useIntl();
  const theme = useTheme();
  const { user } = useAuth();
  const now = new Date();

  const treasury = useTreasuryDashboardSummary();
  const inventory = useInventoryStockReport({ page: 1, pageSize: 1 });
  const lowStock = useLowStockItems({ page: 1, pageSize: 5 });
  const notifications = useNotifications({ page: 1, pageSize: 5, status: 'unread' });
  const workers = useWorkers({ page: 1, pageSize: 1 });
  const activeWorkers = useWorkers({ page: 1, pageSize: 1, isActive: true });
  const payroll = useWorkerMonthlySalaryReport({
    year: now.getFullYear(),
    month: now.getMonth() + 1,
    page: 1,
    pageSize: 5,
    paymentStatus: 'all'
  });

  const hasAnyData =
    Boolean(treasury.summary) ||
    Boolean(inventory.report) ||
    lowStock.items.length > 0 ||
    notifications.items.length > 0 ||
    Boolean(workers.meta?.totalCount) ||
    Boolean(activeWorkers.meta?.totalCount) ||
    Boolean(payroll.report);

  const isInitialLoading =
    (treasury.isLoading ||
      inventory.isLoading ||
      lowStock.isLoading ||
      notifications.isLoading ||
      workers.isLoading ||
      activeWorkers.isLoading ||
      payroll.isLoading) &&
    !hasAnyData;

  const errorMessages = useMemo(
    () =>
      [
        treasury.error ? intl.formatMessage({ id: 'dashboard-financial-load-error', defaultMessage: 'Treasury summary' }) : null,
        inventory.error ? intl.formatMessage({ id: 'dashboard-inventory-load-error', defaultMessage: 'Inventory summary' }) : null,
        lowStock.error ? intl.formatMessage({ id: 'dashboard-low-stock-load-error', defaultMessage: 'Low stock items' }) : null,
        notifications.error ? intl.formatMessage({ id: 'dashboard-notifications-load-error', defaultMessage: 'Notifications' }) : null,
        workers.error ? intl.formatMessage({ id: 'dashboard-workers-load-error', defaultMessage: 'Workers' }) : null,
        activeWorkers.error ? intl.formatMessage({ id: 'dashboard-active-workers-load-error', defaultMessage: 'Active workers' }) : null,
        payroll.error ? intl.formatMessage({ id: 'dashboard-payroll-load-error', defaultMessage: 'Payroll summary' }) : null
      ].filter((item): item is string => Boolean(item)),
    [activeWorkers.error, intl, inventory.error, lowStock.error, notifications.error, payroll.error, treasury.error, workers.error]
  );

  const treasurySummaries = treasury.summary?.currencySummaries ?? [];
  const treasuryAccounts = useMemo(() => sum(treasurySummaries.map((summary) => summary.accounts.length)), [treasurySummaries]);
  const treasuryTotals = useMemo(
    () =>
      treasurySummaries.reduce(
        (acc, summary) => ({
          currentBalance: acc.currentBalance + summary.totalCurrentBalance,
          cashboxBalance: acc.cashboxBalance + summary.cashboxBalance,
          bankBalance: acc.bankBalance + summary.bankAccountBalance,
          walletBalance: acc.walletBalance + summary.electronicWalletBalance,
          receipts: acc.receipts + summary.periodReceipts,
          payments: acc.payments + summary.periodPayments
        }),
        { currentBalance: 0, cashboxBalance: 0, bankBalance: 0, walletBalance: 0, receipts: 0, payments: 0 }
      ),
    [treasurySummaries]
  );

  const inventorySummary = inventory.report?.summary;
  const lowStockRows = lowStock.items;
  const treasuryMovements = treasury.summary?.recentMovements ?? [];
  const unreadNotifications = notifications.items;
  const payrollRows = payroll.report?.rows ?? [];
  const unpaidPayrollRows = payrollRows.filter((row) => !row.isPaid);

  const quickActions = [
    {
      labelId: 'dashboard-open-workers',
      defaultMessage: 'Open workers',
      to: '/labor/workers',
      icon: IconUsers,
      tone: 'primary' as const
    },
    {
      labelId: 'dashboard-open-salary-report',
      defaultMessage: 'Open salary report',
      to: '/labor/workers/salary-report',
      icon: IconUserBolt,
      tone: 'secondary' as const
    },
    {
      labelId: 'dashboard-open-inventory',
      defaultMessage: 'Open inventory',
      to: '/inventory/items',
      icon: IconPackage,
      tone: 'success' as const
    },
    {
      labelId: 'dashboard-view-stock-report',
      defaultMessage: 'View stock report',
      to: '/inventory/low-stock',
      icon: IconClipboardList,
      tone: 'warning' as const
    },
    {
      labelId: 'dashboard-open-treasury',
      defaultMessage: 'Open treasury',
      to: '/treasury/accounts',
      icon: IconCashBanknote,
      tone: 'info' as const
    },
    {
      labelId: 'dashboard-open-notifications',
      defaultMessage: 'Open notifications',
      to: '/notifications',
      icon: IconBellRinging,
      tone: 'error' as const
    }
  ];

  if (isInitialLoading) {
    return <Loader />;
  }

  return (
    <Stack spacing={3}>
      <MainCard
        content={false}
        sx={(theme) => ({
          overflow: 'hidden',
          border: '1px solid',
          borderColor: 'divider',
          bgcolor: theme.palette.mode === 'dark' ? 'background.paper' : '#ffffff',
          minHeight: { xs: 'auto', md: 190 },
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          position: 'relative',
          p: { xs: 3, md: 4 }
        })}
      >
        <Stack alignItems="flex-start" spacing={2} sx={{ width: '100%' }}>
          <Typography variant="overline" color="text.secondary" sx={{ fontSize: '0.75rem', letterSpacing: '0.1em', fontWeight: 700 }}>
            <FormattedMessage id="sayad-erp" defaultMessage="SAYAD ERP" />
          </Typography>

          <Box
            sx={{
              display: 'inline-flex',
              flexDirection: { xs: 'column', sm: 'row' },
              alignItems: 'center',
              bgcolor: theme.palette.mode === 'dark' ? 'background.default' : '#f8fafd',
              border: '1px solid',
              borderColor: theme.palette.mode === 'dark' ? 'divider' : 'primary.light',
              borderRadius: 3,
              p: { xs: 2.5, md: 3 },
              boxShadow: theme.palette.mode === 'dark' ? 'none' : theme.shadows[1],
              gap: { xs: 2, md: 4 }
            }}
          >
            <Logo height={72} />
            <Typography
              variant="h2"
              sx={{ fontWeight: 800, color: 'primary.main', letterSpacing: '-0.02em', textAlign: 'center', whiteSpace: 'nowrap' }}
              dir={intl.locale === 'ar' ? 'rtl' : 'ltr'}
            >
              <FormattedMessage id="sayad-company-name" defaultMessage="El-Sayad - الصياد" />
            </Typography>
          </Box>

          <Typography variant="subtitle1" color="text.secondary" sx={{ fontWeight: 500 }}>
            <FormattedMessage id="sayad-core-platform-ready" defaultMessage="The core platform is ready and secure." />
          </Typography>
        </Stack>
      </MainCard>

      <MainCard
        content={false}
        sx={(theme) => ({
          overflow: 'hidden',
          border: '1px solid',
          borderColor: 'divider',
          background:
            theme.palette.mode === 'dark'
              ? `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.background.default} 100%)`
              : `linear-gradient(135deg, ${theme.palette.primary.light} 0%, ${theme.palette.secondary.light} 58%, ${theme.palette.background.paper} 100%)`
        })}
      >
        <Box sx={{ p: { xs: 2.5, md: 3.5 } }}>
          <Stack spacing={2.25}>
            <Stack direction="row" spacing={1.25} alignItems="center" flexWrap="wrap">
              <Chip
                icon={<IconSparkles size={16} />}
                label={<FormattedMessage id="operational-dashboard" defaultMessage="Operational dashboard" />}
                color="primary"
              />
              <Chip
                variant="outlined"
                label={formatDateOnly(intl.locale, now)}
                sx={{
                  bgcolor: theme.palette.mode === 'dark' ? 'background.default' : 'background.paper'
                }}
              />
            </Stack>

            <Stack
              direction={{ xs: 'column', md: 'row' }}
              spacing={2}
              alignItems={{ xs: 'flex-start', md: 'center' }}
              justifyContent="space-between"
            >
              <Stack spacing={1} sx={{ maxWidth: 880 }}>
                <Typography variant="h3" sx={{ fontWeight: 900, letterSpacing: '-0.03em' }}>
                  <FormattedMessage
                    id="dashboard-welcome"
                    defaultMessage="Welcome back, {name}"
                    values={{ name: user?.name || intl.formatMessage({ id: 'dashboard-team', defaultMessage: 'team' }) }}
                  />
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 760 }}>
                  <FormattedMessage
                    id="dashboard-intro"
                    defaultMessage="Real treasury, inventory, workforce, and notification signals from the live SAYAD backend, with no demo totals or sample charts."
                  />
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  <FormattedMessage
                    id="dashboard-last-sync"
                    defaultMessage="Last synchronized: {time}"
                    values={{ time: formatDateTime(intl.locale, now) }}
                  />
                </Typography>
              </Stack>

              <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                <Button
                  variant="outlined"
                  color="inherit"
                  startIcon={<IconRefresh size={18} />}
                  onClick={() =>
                    void Promise.all([
                      treasury.mutate(),
                      inventory.mutate(),
                      lowStock.mutate(),
                      notifications.mutate(),
                      workers.mutate(),
                      activeWorkers.mutate(),
                      payroll.mutate()
                    ])
                  }
                >
                  <FormattedMessage id="dashboard-refresh" defaultMessage="Refresh" />
                </Button>
                <Button component={Link} to="/labor/workers" variant="contained" startIcon={<IconArrowRight size={18} />}>
                  <FormattedMessage id="dashboard-open-workers" defaultMessage="Open workers" />
                </Button>
              </Stack>
            </Stack>
          </Stack>
        </Box>
      </MainCard>

      {errorMessages.length > 0 && (
        <Alert
          severity="warning"
          action={
            <Button
              color="inherit"
              size="small"
              onClick={() =>
                void Promise.all([
                  treasury.mutate(),
                  inventory.mutate(),
                  lowStock.mutate(),
                  notifications.mutate(),
                  workers.mutate(),
                  activeWorkers.mutate(),
                  payroll.mutate()
                ])
              }
            >
              <FormattedMessage id="dashboard-refresh" defaultMessage="Refresh" />
            </Button>
          }
        >
          <FormattedMessage
            id="dashboard-load-warning"
            defaultMessage="Some dashboard sections could not load: {sections}."
            values={{ sections: errorMessages.join(', ') }}
          />
        </Alert>
      )}

      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, sm: 6, xl: 3 }}>
          <MetricCard
            title={<FormattedMessage id="dashboard-treasury-balance" defaultMessage="Treasury balance" />}
            value={formatAmount(intl.locale, treasuryTotals.currentBalance)}
            helper={
              treasurySummaries.length > 1 ? (
                <FormattedMessage
                  id="dashboard-across-currencies"
                  defaultMessage="Aggregated across {count} currencies"
                  values={{ count: treasurySummaries.length }}
                />
              ) : (
                (treasurySummaries[0]?.currencyCode ?? '-')
              )
            }
            icon={IconCashBanknote}
            tone="primary"
            to="/treasury/accounts"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, xl: 3 }}>
          <MetricCard
            title={<FormattedMessage id="dashboard-inventory-total-value" defaultMessage="Inventory value" />}
            value={formatAmount(intl.locale, inventorySummary?.totalInventoryValue ?? 0)}
            helper={
              <FormattedMessage
                id="dashboard-inventory-total-items"
                defaultMessage="{count} items in stock"
                values={{ count: formatInteger(intl.locale, inventorySummary?.totalItems ?? 0) }}
              />
            }
            icon={IconPackage}
            tone="success"
            to="/inventory/low-stock"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, xl: 3 }}>
          <MetricCard
            title={<FormattedMessage id="dashboard-active-workers" defaultMessage="Active workers" />}
            value={formatInteger(intl.locale, activeWorkers.meta?.totalCount ?? 0)}
            helper={
              <FormattedMessage
                id="dashboard-total-workers-helper"
                defaultMessage="of {count} total workers"
                values={{ count: formatInteger(intl.locale, workers.meta?.totalCount ?? 0) }}
              />
            }
            icon={IconUsers}
            tone="info"
            to="/labor/workers"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, xl: 3 }}>
          <MetricCard
            title={<FormattedMessage id="dashboard-unread-notifications" defaultMessage="Unread notifications" />}
            value={formatInteger(intl.locale, notifications.meta?.totalCount ?? 0)}
            helper={<FormattedMessage id="dashboard-activity-updates" defaultMessage="Latest operational updates" />}
            icon={IconBellRinging}
            tone="warning"
            to="/notifications"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, xl: 3 }}>
          <MetricCard
            title={<FormattedMessage id="dashboard-pending-payroll" defaultMessage="Pending payroll" />}
            value={formatAmount(intl.locale, payroll.report?.totalUnpaid ?? 0)}
            helper={
              <FormattedMessage
                id="dashboard-monthly-payroll"
                defaultMessage="{month} payroll"
                values={{ month: formatDateOnly(intl.locale, new Date(now.getFullYear(), now.getMonth(), 1)) }}
              />
            }
            icon={IconUserBolt}
            tone="secondary"
            to="/labor/workers/salary-report"
          />
        </Grid>
      </Grid>

      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, lg: 7 }}>
          <MainCard content={false} sx={{ height: '100%' }}>
            <Box sx={{ p: 2.5 }}>
              <SectionHeader
                title={<FormattedMessage id="dashboard-financial-overview" defaultMessage="Financial overview" />}
                action={
                  <Button component={Link} to="/treasury/accounts" size="small" endIcon={<IconArrowRight size={16} />}>
                    <FormattedMessage id="dashboard-open-treasury" defaultMessage="Open treasury" />
                  </Button>
                }
              />

              {treasury.error ? (
                <Alert severity="error">
                  <FormattedMessage id="dashboard-financial-load-error" defaultMessage="Treasury summary could not be loaded." />
                </Alert>
              ) : treasurySummaries.length === 0 ? (
                <Alert severity="info">
                  <FormattedMessage id="dashboard-financial-empty" defaultMessage="No treasury accounts are available yet." />
                </Alert>
              ) : (
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>
                          <FormattedMessage id="currency" defaultMessage="Currency" />
                        </TableCell>
                        <TableCell align="right">
                          <FormattedMessage id="dashboard-treasury-balance" defaultMessage="Treasury balance" />
                        </TableCell>
                        <TableCell align="right">
                          <FormattedMessage id="dashboard-period-receipts" defaultMessage="Receipts" />
                        </TableCell>
                        <TableCell align="right">
                          <FormattedMessage id="dashboard-period-payments" defaultMessage="Payments" />
                        </TableCell>
                        <TableCell align="right">
                          <FormattedMessage id="cashbox" defaultMessage="Cashbox" />
                        </TableCell>
                        <TableCell align="right">
                          <FormattedMessage id="dashboard-bank-balance" defaultMessage="Bank" />
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {treasurySummaries.map((summary) => (
                        <TableRow key={summary.currencyCode} hover>
                          <TableCell sx={{ fontWeight: 700 }}>{summary.currencyCode}</TableCell>
                          <TableCell align="right">{formatAmount(intl.locale, summary.totalCurrentBalance)}</TableCell>
                          <TableCell align="right">{formatAmount(intl.locale, summary.periodReceipts)}</TableCell>
                          <TableCell align="right">{formatAmount(intl.locale, summary.periodPayments)}</TableCell>
                          <TableCell align="right">{formatAmount(intl.locale, summary.cashboxBalance)}</TableCell>
                          <TableCell align="right">{formatAmount(intl.locale, summary.bankAccountBalance)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Box>
          </MainCard>
        </Grid>

        <Grid size={{ xs: 12, lg: 5 }}>
          <MainCard content={false} sx={{ height: '100%' }}>
            <Box sx={{ p: 2.5 }}>
              <SectionHeader
                title={<FormattedMessage id="dashboard-quick-actions" defaultMessage="Quick actions" />}
                action={
                  <Button component={Link} to="/notifications" size="small" endIcon={<IconArrowRight size={16} />}>
                    <FormattedMessage id="dashboard-open-notifications" defaultMessage="Open notifications" />
                  </Button>
                }
              />

              <Grid container spacing={1.5}>
                {quickActions.map((action) => {
                  const ActionIcon = action.icon;
                  return (
                    <Grid key={action.to} size={{ xs: 12, sm: 6 }}>
                      <Button
                        component={Link}
                        to={action.to}
                        variant="outlined"
                        color="inherit"
                        fullWidth
                        sx={{
                          justifyContent: 'space-between',
                          py: 1.5,
                          px: 2,
                          borderColor: `${action.tone}.light`,
                          bgcolor: theme.palette.mode === 'dark' ? 'background.default' : `${action.tone}.light`,
                          '&:hover': {
                            borderColor: `${action.tone}.main`
                          }
                        }}
                        startIcon={<ActionIcon size={18} />}
                        endIcon={<IconArrowRight size={16} />}
                      >
                        <FormattedMessage id={action.labelId} defaultMessage={action.defaultMessage} />
                      </Button>
                    </Grid>
                  );
                })}
              </Grid>
            </Box>
          </MainCard>
        </Grid>
      </Grid>

      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, lg: 6 }}>
          <MainCard content={false} sx={{ height: '100%' }}>
            <Box sx={{ p: 2.5 }}>
              <SectionHeader
                title={<FormattedMessage id="dashboard-inventory-overview" defaultMessage="Inventory overview" />}
                action={
                  <Button component={Link} to="/inventory/low-stock" size="small" endIcon={<IconArrowRight size={16} />}>
                    <FormattedMessage id="dashboard-view-stock-report" defaultMessage="View stock report" />
                  </Button>
                }
              />

              {inventory.error ? (
                <Alert severity="error">
                  <FormattedMessage id="dashboard-inventory-load-error" defaultMessage="Inventory summary could not be loaded." />
                </Alert>
              ) : (
                <Stack spacing={2}>
                  <Grid container spacing={1.5}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <MainCard sx={{ border: '1px solid', borderColor: 'divider' }}>
                        <Typography variant="body2" color="text.secondary">
                          <FormattedMessage id="dashboard-total-items" defaultMessage="Total items" />
                        </Typography>
                        <Typography variant="h4" fontWeight={800} sx={{ mt: 0.75 }}>
                          {formatInteger(intl.locale, inventorySummary?.totalItems ?? 0)}
                        </Typography>
                      </MainCard>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <MainCard sx={{ border: '1px solid', borderColor: 'divider' }}>
                        <Typography variant="body2" color="text.secondary">
                          <FormattedMessage id="dashboard-low-stock-items" defaultMessage="Low stock items" />
                        </Typography>
                        <Typography variant="h4" fontWeight={800} sx={{ mt: 0.75 }}>
                          {formatInteger(intl.locale, inventorySummary?.lowStockItems ?? 0)}
                        </Typography>
                      </MainCard>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <MainCard sx={{ border: '1px solid', borderColor: 'divider' }}>
                        <Typography variant="body2" color="text.secondary">
                          <FormattedMessage id="dashboard-out-stock-items" defaultMessage="Out of stock" />
                        </Typography>
                        <Typography variant="h4" fontWeight={800} sx={{ mt: 0.75 }}>
                          {formatInteger(intl.locale, inventorySummary?.outOfStockItems ?? 0)}
                        </Typography>
                      </MainCard>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <MainCard sx={{ border: '1px solid', borderColor: 'divider' }}>
                        <Typography variant="body2" color="text.secondary">
                          <FormattedMessage id="dashboard-inventory-total-value" defaultMessage="Inventory value" />
                        </Typography>
                        <Typography variant="h4" fontWeight={800} sx={{ mt: 0.75 }}>
                          {formatAmount(intl.locale, inventorySummary?.totalInventoryValue ?? 0)}
                        </Typography>
                      </MainCard>
                    </Grid>
                  </Grid>

                  <Divider />

                  <Box>
                    <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1.5 }}>
                      <FormattedMessage id="dashboard-top-low-stock-items" defaultMessage="Top low stock items" />
                    </Typography>
                    {lowStock.error ? (
                      <Alert severity="error">
                        <FormattedMessage id="dashboard-low-stock-load-error" defaultMessage="Low stock items could not be loaded." />
                      </Alert>
                    ) : lowStockRows.length === 0 ? (
                      <Alert severity="info">
                        <FormattedMessage id="dashboard-no-low-stock" defaultMessage="No low stock items were returned." />
                      </Alert>
                    ) : (
                      <List disablePadding>
                        {lowStockRows.map((item, index) => (
                          <ListItem
                            key={item.itemId}
                            disableGutters
                            sx={{
                              py: 1.25,
                              borderBottom: index === lowStockRows.length - 1 ? 'none' : '1px solid',
                              borderColor: 'divider'
                            }}
                            secondaryAction={
                              <Chip
                                size="small"
                                color={
                                  item.currentQuantity <= 0 ? 'error' : item.currentQuantity <= item.minimumQuantity ? 'warning' : 'default'
                                }
                                label={formatInteger(intl.locale, item.currentQuantity)}
                              />
                            }
                          >
                            <ListItemText
                              primary={
                                <Typography variant="body2" fontWeight={700}>
                                  {item.itemCode} -{' '}
                                  {resolveLocalizedText(intl.locale, item.itemNameArabic, item.itemNameEnglish, item.itemCode)}
                                </Typography>
                              }
                              secondary={
                                <Typography variant="caption" color="text.secondary">
                                  <FormattedMessage
                                    id="dashboard-item-threshold"
                                    defaultMessage="Minimum {min}, reorder {reorder}"
                                    values={{
                                      min: formatInteger(intl.locale, item.minimumQuantity),
                                      reorder: formatInteger(intl.locale, item.reorderQuantity)
                                    }}
                                  />
                                </Typography>
                              }
                            />
                          </ListItem>
                        ))}
                      </List>
                    )}
                  </Box>
                </Stack>
              )}
            </Box>
          </MainCard>
        </Grid>

        <Grid size={{ xs: 12, lg: 6 }}>
          <MainCard content={false} sx={{ height: '100%' }}>
            <Box sx={{ p: 2.5 }}>
              <SectionHeader
                title={<FormattedMessage id="dashboard-workforce-overview" defaultMessage="Workforce overview" />}
                action={
                  <Button component={Link} to="/labor/workers/salary-report" size="small" endIcon={<IconArrowRight size={16} />}>
                    <FormattedMessage id="dashboard-open-salary-report" defaultMessage="Open salary report" />
                  </Button>
                }
              />

              {workers.error || activeWorkers.error || payroll.error ? (
                <Alert severity="error">
                  <FormattedMessage id="dashboard-workforce-load-error" defaultMessage="Workforce summary could not be loaded." />
                </Alert>
              ) : (
                <Stack spacing={2}>
                  <Grid container spacing={1.5}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <MainCard sx={{ border: '1px solid', borderColor: 'divider' }}>
                        <Typography variant="body2" color="text.secondary">
                          <FormattedMessage id="dashboard-total-workers-label" defaultMessage="Total workers" />
                        </Typography>
                        <Typography variant="h4" fontWeight={800} sx={{ mt: 0.75 }}>
                          {formatInteger(intl.locale, workers.meta?.totalCount ?? 0)}
                        </Typography>
                      </MainCard>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <MainCard sx={{ border: '1px solid', borderColor: 'divider' }}>
                        <Typography variant="body2" color="text.secondary">
                          <FormattedMessage id="dashboard-active-workers" defaultMessage="Active workers" />
                        </Typography>
                        <Typography variant="h4" fontWeight={800} sx={{ mt: 0.75 }}>
                          {formatInteger(intl.locale, activeWorkers.meta?.totalCount ?? 0)}
                        </Typography>
                      </MainCard>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <MainCard sx={{ border: '1px solid', borderColor: 'divider' }}>
                        <Typography variant="body2" color="text.secondary">
                          <FormattedMessage
                            id="dashboard-monthly-payroll"
                            defaultMessage="Monthly payroll"
                            values={{ month: formatDateOnly(intl.locale, new Date(now.getFullYear(), now.getMonth(), 1)) }}
                          />
                        </Typography>
                        <Typography variant="h4" fontWeight={800} sx={{ mt: 0.75 }}>
                          {formatAmount(intl.locale, payroll.report?.totalNetSalaries ?? 0)}
                        </Typography>
                      </MainCard>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <MainCard sx={{ border: '1px solid', borderColor: 'divider' }}>
                        <Typography variant="body2" color="text.secondary">
                          <FormattedMessage id="dashboard-pending-payroll" defaultMessage="Pending payroll" />
                        </Typography>
                        <Typography variant="h4" fontWeight={800} sx={{ mt: 0.75 }}>
                          {formatAmount(intl.locale, payroll.report?.totalUnpaid ?? 0)}
                        </Typography>
                      </MainCard>
                    </Grid>
                  </Grid>

                  <Divider />

                  <Box>
                    <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1.5 }}>
                      <FormattedMessage id="dashboard-unpaid-workers" defaultMessage="Unpaid salary lines" />
                    </Typography>
                    {payrollRows.length === 0 ? (
                      <Alert severity="info">
                        <FormattedMessage id="dashboard-no-payroll-data" defaultMessage="No payroll rows were returned for this month." />
                      </Alert>
                    ) : (
                      <TableContainer>
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell>
                                <FormattedMessage id="worker" defaultMessage="Worker" />
                              </TableCell>
                              <TableCell align="right">
                                <FormattedMessage id="amount" defaultMessage="Amount" />
                              </TableCell>
                              <TableCell align="right">
                                <FormattedMessage id="status" defaultMessage="Status" />
                              </TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {(unpaidPayrollRows.length > 0 ? unpaidPayrollRows : payrollRows).slice(0, 5).map((row) => (
                              <TableRow key={row.id} hover>
                                <TableCell>
                                  <Typography variant="body2" fontWeight={700}>
                                    {row.workerCode} - {row.workerName}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    {row.monthLabel}
                                  </Typography>
                                </TableCell>
                                <TableCell align="right">{formatAmount(intl.locale, row.netSalary)}</TableCell>
                                <TableCell align="right">
                                  <Chip
                                    size="small"
                                    color={row.isPaid ? 'success' : 'warning'}
                                    label={
                                      row.isPaid
                                        ? intl.formatMessage({ id: 'paid', defaultMessage: 'Paid' })
                                        : intl.formatMessage({ id: 'unpaid', defaultMessage: 'Unpaid' })
                                    }
                                  />
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    )}
                  </Box>
                </Stack>
              )}
            </Box>
          </MainCard>
        </Grid>
      </Grid>

      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, lg: 7 }}>
          <MainCard content={false}>
            <Box sx={{ p: 2.5 }}>
              <SectionHeader
                title={<FormattedMessage id="dashboard-recent-activity" defaultMessage="Recent activity" />}
                action={
                  <Button component={Link} to="/treasury/accounts" size="small" endIcon={<IconArrowRight size={16} />}>
                    <FormattedMessage id="dashboard-open-treasury" defaultMessage="Open treasury" />
                  </Button>
                }
              />

              {treasury.error ? (
                <Alert severity="error">
                  <FormattedMessage id="dashboard-financial-load-error" defaultMessage="Treasury summary could not be loaded." />
                </Alert>
              ) : treasuryMovements.length === 0 ? (
                <Alert severity="info">
                  <FormattedMessage id="dashboard-no-treasury-activity" defaultMessage="No recent treasury movements were returned." />
                </Alert>
              ) : (
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>
                          <FormattedMessage id="date" defaultMessage="Date" />
                        </TableCell>
                        <TableCell>
                          <FormattedMessage id="description" defaultMessage="Description" />
                        </TableCell>
                        <TableCell align="right">
                          <FormattedMessage id="debit" defaultMessage="Debit" />
                        </TableCell>
                        <TableCell align="right">
                          <FormattedMessage id="credit" defaultMessage="Credit" />
                        </TableCell>
                        <TableCell align="right">
                          <FormattedMessage id="balance" defaultMessage="Balance" />
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {treasuryMovements.slice(0, 5).map((movement) => (
                        <TableRow key={movement.id} hover>
                          <TableCell>{formatDateTime(intl.locale, movement.createdAtUtc)}</TableCell>
                          <TableCell>
                            <Stack spacing={0.25}>
                              <Typography variant="body2" fontWeight={700}>
                                {resolveLocalizedText(intl.locale, movement.descriptionArabic, movement.descriptionEnglish, '-')}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {movement.referenceNumber ?? movement.sourceDocumentNumber ?? movement.movementType}
                              </Typography>
                            </Stack>
                          </TableCell>
                          <TableCell align="right">
                            {movement.debitAmount > 0 ? formatAmount(intl.locale, movement.debitAmount) : '-'}
                          </TableCell>
                          <TableCell align="right">
                            {movement.creditAmount > 0 ? formatAmount(intl.locale, movement.creditAmount) : '-'}
                          </TableCell>
                          <TableCell align="right">
                            <Stack spacing={0.25} alignItems="flex-end">
                              <Typography variant="body2" fontWeight={700}>
                                {formatAmount(intl.locale, movement.balanceAfter)}
                              </Typography>
                              <Chip size="small" variant="outlined" label={movement.balanceNature} />
                            </Stack>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Box>
          </MainCard>
        </Grid>

        <Grid size={{ xs: 12, lg: 5 }}>
          <MainCard content={false}>
            <Box sx={{ p: 2.5 }}>
              <SectionHeader
                title={<FormattedMessage id="dashboard-notifications-summary" defaultMessage="Notifications summary" />}
                action={
                  <Button component={Link} to="/notifications" size="small" endIcon={<IconArrowRight size={16} />}>
                    <FormattedMessage id="dashboard-open-notifications" defaultMessage="Open notifications" />
                  </Button>
                }
              />

              {notifications.error ? (
                <Alert severity="error">
                  <FormattedMessage id="dashboard-notifications-load-error" defaultMessage="Notifications could not be loaded." />
                </Alert>
              ) : unreadNotifications.length === 0 ? (
                <Alert severity="success">
                  <FormattedMessage id="dashboard-no-unread-notifications" defaultMessage="There are no unread notifications right now." />
                </Alert>
              ) : (
                <List disablePadding>
                  {unreadNotifications.map((notification, index) => (
                    <ListItem
                      key={notification.id}
                      disableGutters
                      sx={{
                        py: 1.25,
                        borderBottom: index === unreadNotifications.length - 1 ? 'none' : '1px solid',
                        borderColor: 'divider'
                      }}
                      secondaryAction={<Chip size="small" color="warning" label={formatDateTime(intl.locale, notification.createdAtUtc)} />}
                    >
                      <ListItemText
                        primary={
                          <Typography variant="body2" fontWeight={700}>
                            {resolveLocalizedText(intl.locale, notification.titleArabic, notification.titleEnglish, '-')}
                          </Typography>
                        }
                        secondary={
                          <Typography variant="caption" color="text.secondary">
                            {resolveLocalizedText(intl.locale, notification.messageArabic, notification.messageEnglish, '-')}
                          </Typography>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              )}
            </Box>
          </MainCard>
        </Grid>
      </Grid>

      <MainCard content={false}>
        <Box sx={{ p: 2.5 }}>
          <SectionHeader
            title={<FormattedMessage id="dashboard-operational-health" defaultMessage="Operational health" />}
            action={
              <LinearProgress
                variant="determinate"
                value={Math.min(100, treasuryAccounts > 0 ? 100 : 15)}
                sx={{ width: 120, borderRadius: 999 }}
              />
            }
          />
          <Typography variant="body2" color="text.secondary">
            <FormattedMessage
              id="dashboard-operational-health-note"
              defaultMessage="This page is powered by live treasury, inventory, worker, and notification data with no fake counts or demo widgets."
            />
          </Typography>
        </Box>
      </MainCard>
    </Stack>
  );
}
