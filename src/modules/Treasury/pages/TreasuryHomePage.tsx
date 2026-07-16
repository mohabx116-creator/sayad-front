import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { FormattedMessage } from 'react-intl';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/GridLegacy';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';

import {
  IconAlertTriangle,
  IconArrowDownLeft,
  IconArrowRight,
  IconArrowUpRight,
  IconBan,
  IconChartLine,
  IconWallet
} from '@tabler/icons-react';

import Breadcrumbs from 'ui-component/extended/Breadcrumbs';
import Loader from 'ui-component/Loader';
import MainCard from 'ui-component/cards/MainCard';
import CodeNameLabel from 'shared/components/CodeNameLabel';

import { useTreasuryAccounts, useTreasuryDashboardSummary } from '../hooks/useTreasury';
import TreasuryMovementTable from '../components/TreasuryMovementTable';
import { formatTreasuryMoney } from '../utils/treasury.format';

function MetricCard({
  label,
  value,
  icon: Icon,
  color,
  bgColor,
  borderColor,
  currencyCode
}: {
  label: React.ReactNode;
  value: number;
  icon: React.ComponentType<{ size?: number; color?: string }>;
  color: string;
  bgColor: string;
  borderColor: string;
  currencyCode?: string;
}) {
  return (
    <Card
      sx={{
        height: '100%',
        border: '1px solid',
        borderColor,
        boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
        borderRadius: 3,
        overflow: 'hidden'
      }}
    >
      <CardContent sx={{ p: 2.5 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 2 }}>
          <Box>
            <Typography variant="body2" color="text.secondary" fontWeight={600} sx={{ mb: 1 }}>
              {label}
            </Typography>
            <Typography variant="h4" fontWeight={800} color={color}>
              {formatTreasuryMoney(value, currencyCode)}
            </Typography>
          </Box>
          <Box
            sx={{
              width: 38,
              height: 38,
              borderRadius: 2,
              bgcolor: bgColor,
              display: 'grid',
              placeItems: 'center',
              color
            }}
          >
            <Icon size={18} />
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}

function CountCard({
  label,
  value,
  icon: Icon,
  color,
  bgColor,
  borderColor
}: {
  label: React.ReactNode;
  value: number;
  icon: React.ComponentType<{ size?: number; color?: string }>;
  color: string;
  bgColor: string;
  borderColor: string;
}) {
  return (
    <Card
      sx={{
        height: '100%',
        border: '1px solid',
        borderColor,
        boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
        borderRadius: 3,
        overflow: 'hidden'
      }}
    >
      <CardContent sx={{ p: 2.5 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 2 }}>
          <Box>
            <Typography variant="body2" color="text.secondary" fontWeight={600} sx={{ mb: 1 }}>
              {label}
            </Typography>
            <Typography variant="h4" fontWeight={800} color={color}>
              {value}
            </Typography>
          </Box>
          <Box
            sx={{
              width: 38,
              height: 38,
              borderRadius: 2,
              bgcolor: bgColor,
              display: 'grid',
              placeItems: 'center',
              color
            }}
          >
            <Icon size={18} />
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}

function BalanceNatureChip({ nature }: { nature: string }) {
  const label = nature === 'Debit' ? 'مدين' : nature === 'Credit' ? 'دائن' : 'مستقر';
  const color = nature === 'Debit' ? 'warning' : nature === 'Credit' ? 'error' : 'default';
  return <Chip size="small" color={color as any} variant="outlined" label={label} />;
}

function AccountsTable({
  title,
  accounts,
  emptyMessage
}: {
  title: React.ReactNode;
  accounts: { id: string; code: string; nameArabic: string; nameEnglish: string | null; accountTypeLabel: string; balance: number; balanceNature: string; isActive: boolean }[];
  emptyMessage: React.ReactNode;
}) {
  return (
    <MainCard
      content={false}
      sx={{ border: '1px solid', borderColor: 'divider', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', borderRadius: 3 }}
    >
      <Box sx={{ px: 3, py: 2, borderBottom: '1px solid', borderColor: 'divider', bgcolor: 'grey.50' }}>
        <Typography variant="h5" fontWeight={700}>
          {title}
        </Typography>
      </Box>
      <TableContainer>
        <Table size="small">
          <TableHead sx={{ bgcolor: 'grey.50' }}>
            <TableRow>
              <TableCell>
                <FormattedMessage id="account" defaultMessage="الحساب" />
              </TableCell>
              <TableCell>
                <FormattedMessage id="type" defaultMessage="النوع" />
              </TableCell>
              <TableCell align="center">
                <FormattedMessage id="status" defaultMessage="الحالة" />
              </TableCell>
              <TableCell align="right">
                <FormattedMessage id="balance" defaultMessage="الرصيد" />
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {accounts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4}>
                  <Box sx={{ py: 4, textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      {emptyMessage}
                    </Typography>
                  </Box>
                </TableCell>
              </TableRow>
            ) : (
              accounts.map((account) => (
                <TableRow key={account.id} hover>
                  <TableCell>
                    <CodeNameLabel code={account.code} nameArabic={account.nameArabic} />
                  </TableCell>
                  <TableCell>{account.accountTypeLabel}</TableCell>
                  <TableCell align="center">
                    <Chip size="small" color={account.isActive ? 'success' : 'default'} variant="outlined" label={account.isActive ? 'نشط' : 'موقوف'} />
                  </TableCell>
                  <TableCell align="right">
                    <Stack spacing={0.25} alignItems="flex-end">
                      <Typography variant="body2" fontWeight={700}>
                        {formatTreasuryMoney(account.balance)}
                      </Typography>
                      <BalanceNatureChip nature={account.balanceNature} />
                    </Stack>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </MainCard>
  );
}

export default function TreasuryHomePage() {
  const { summary, isLoading: summaryLoading, error: summaryError } = useTreasuryDashboardSummary();
  const { items: accounts, isLoading: accountsLoading, error: accountsError } = useTreasuryAccounts({ page: 1, pageSize: 500 });
  const currencyCode = accounts[0]?.currencyCode ?? 'EGP';

  const activeAccounts = useMemo(
    () =>
      [...accounts]
        .filter((account) => account.isActive)
        .sort((a, b) => Math.abs(b.balance) - Math.abs(a.balance) || a.code.localeCompare(b.code)),
    [accounts]
  );

  const suspendedAccounts = useMemo(() => [...accounts].filter((account) => !account.isActive), [accounts]);
  const negativeAccounts = useMemo(() => [...accounts].filter((account) => account.balance < 0), [accounts]);

  const isLoading = summaryLoading || accountsLoading;
  const error = summaryError || accountsError;

  if (isLoading) {
    return <Loader />;
  }

  if (error) {
    return (
      <Box>
        <Breadcrumbs custom card={false} title={false} divider={false} heading="treasury" links={[{ title: 'treasury' }]} sx={{ mb: 0 }} />
        <MainCard sx={{ border: '1px solid', borderColor: 'error.light', borderRadius: 3, mt: 3, bgcolor: 'error.lighter' }}>
          <Typography color="error.dark" fontWeight={700}>
            <FormattedMessage id="treasury.summary-load-error" defaultMessage="تعذر تحميل لوحة الخزينة." />
          </Typography>
        </MainCard>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Breadcrumbs custom card={false} title={false} divider={false} heading="treasury" links={[{ title: 'treasury' }]} sx={{ mb: 0 }} />
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75 }}>
          <FormattedMessage id="treasury-home.subtitle" defaultMessage="الصورة العملية اليومية للخزينة: الرصيد الحالي، الداخل، الخارج، الحسابات الموقوفة، والحركات الأخيرة." />
        </Typography>
      </Box>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            label={<FormattedMessage id="treasury.total-current-balance" defaultMessage="إجمالي الأرصدة الحالية" />}
            value={summary?.totalCurrentBalance ?? 0}
            currencyCode={currencyCode}
            icon={IconWallet}
            color="primary.dark"
            bgColor="primary.lighter"
            borderColor="primary.light"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            label={<FormattedMessage id="treasury.period-receipts" defaultMessage="إجمالي المقبوضات خلال الفترة" />}
            value={summary?.periodReceipts ?? 0}
            currencyCode={currencyCode}
            icon={IconArrowDownLeft}
            color="success.dark"
            bgColor="success.lighter"
            borderColor="success.light"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            label={<FormattedMessage id="treasury.period-payments" defaultMessage="إجمالي المدفوعات خلال الفترة" />}
            value={summary?.periodPayments ?? 0}
            currencyCode={currencyCode}
            icon={IconArrowUpRight}
            color="error.dark"
            bgColor="error.lighter"
            borderColor="error.light"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            label={<FormattedMessage id="treasury.net-movement" defaultMessage="صافي الحركة" />}
            value={(summary?.periodReceipts ?? 0) - (summary?.periodPayments ?? 0)}
            currencyCode={currencyCode}
            icon={IconChartLine}
            color="secondary.dark"
            bgColor="secondary.lighter"
            borderColor="secondary.light"
          />
        </Grid>
      </Grid>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <MainCard
            content={false}
            sx={{ border: '1px solid', borderColor: 'divider', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', borderRadius: 3 }}
          >
            <Box sx={{ px: 3, py: 2, borderBottom: '1px solid', borderColor: 'divider', bgcolor: 'grey.50' }}>
              <Typography variant="h5" fontWeight={700}>
                <FormattedMessage id="treasury.balance-by-type" defaultMessage="الأرصدة حسب نوع الحساب" />
              </Typography>
            </Box>
            <CardContent sx={{ p: 3 }}>
              <Stack spacing={2}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, alignItems: 'center' }}>
                  <Typography variant="body2" color="text.secondary" fontWeight={600}>
                    <FormattedMessage id="cashbox-balance" defaultMessage="صندوق نقدي" />
                  </Typography>
                  <Typography variant="h6" fontWeight={700}>
                    {formatTreasuryMoney(summary?.cashboxBalance ?? 0, currencyCode)}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, alignItems: 'center' }}>
                  <Typography variant="body2" color="text.secondary" fontWeight={600}>
                    <FormattedMessage id="bank-balance" defaultMessage="حساب بنكي" />
                  </Typography>
                  <Typography variant="h6" fontWeight={700}>
                    {formatTreasuryMoney(summary?.bankAccountBalance ?? 0, currencyCode)}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, alignItems: 'center' }}>
                  <Typography variant="body2" color="text.secondary" fontWeight={600}>
                    <FormattedMessage id="wallet-balance" defaultMessage="محفظة إلكترونية" />
                  </Typography>
                  <Typography variant="h6" fontWeight={700}>
                    {formatTreasuryMoney(summary?.electronicWalletBalance ?? 0, currencyCode)}
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </MainCard>
        </Grid>

        <Grid item xs={12} md={4}>
          <CountCard
            label={<FormattedMessage id="treasury.suspended-accounts" defaultMessage="الحسابات الموقوفة" />}
            value={suspendedAccounts.length}
            icon={IconBan}
            color="warning.dark"
            bgColor="warning.lighter"
            borderColor="warning.light"
          />
        </Grid>

        <Grid item xs={12} md={4}>
          <CountCard
            label={<FormattedMessage id="treasury.negative-accounts" defaultMessage="الحسابات ذات الرصيد السالب" />}
            value={negativeAccounts.length}
            icon={IconAlertTriangle}
            color="error.dark"
            bgColor="error.lighter"
            borderColor="error.light"
          />
        </Grid>
      </Grid>

      <Box sx={{ mb: 3 }}>
        <AccountsTable
          title={<FormattedMessage id="treasury.accounts-balances" defaultMessage="أرصدة حسابات الخزينة" />}
          accounts={activeAccounts}
          emptyMessage={<FormattedMessage id="treasury.no-active-accounts" defaultMessage="لا توجد حسابات خزينة نشطة لعرضها." />}
        />
      </Box>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} lg={6}>
          <AccountsTable
            title={
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
                <Typography variant="h5" fontWeight={700}>
                  <FormattedMessage id="treasury.suspended-account-list" defaultMessage="الحسابات الموقوفة" />
                </Typography>
                <Chip size="small" color="warning" variant="outlined" label={suspendedAccounts.length} />
              </Box>
            }
            accounts={suspendedAccounts}
            emptyMessage={<FormattedMessage id="treasury.no-suspended-accounts" defaultMessage="لا توجد حسابات موقوفة." />}
          />
        </Grid>

        <Grid item xs={12} lg={6}>
          <AccountsTable
            title={
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
                <Typography variant="h5" fontWeight={700}>
                  <FormattedMessage id="treasury.negative-account-list" defaultMessage="الحسابات ذات الرصيد السالب" />
                </Typography>
                <Chip size="small" color="error" variant="outlined" label={negativeAccounts.length} />
              </Box>
            }
            accounts={negativeAccounts}
            emptyMessage={<FormattedMessage id="treasury.no-negative-accounts" defaultMessage="لا توجد حسابات برصيد سالب." />}
          />
        </Grid>
      </Grid>

      <MainCard content={false} sx={{ border: '1px solid', borderColor: 'divider', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', borderRadius: 3 }}>
        <Box
          sx={{
            px: 3,
            py: 2,
            borderBottom: '1px solid',
            borderColor: 'divider',
            bgcolor: 'grey.50',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 2,
            flexWrap: 'wrap'
          }}
        >
          <Typography variant="h5" fontWeight={700}>
            <FormattedMessage id="treasury.latest-movements" defaultMessage="آخر حركات الخزينة" />
          </Typography>
          <Button component={Link} to="/treasury/statements" variant="text" endIcon={<IconArrowRight size={16} />}>
            <FormattedMessage id="view-statement" defaultMessage="عرض كشف الحساب" />
          </Button>
        </Box>
        <Box sx={{ p: 0 }}>
          <TreasuryMovementTable movements={summary?.recentMovements ?? []} page={1} totalPages={1} currencyCode={currencyCode} />
        </Box>
      </MainCard>
    </Box>
  );
}
