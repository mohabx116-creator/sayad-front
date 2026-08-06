import { Link } from 'react-router-dom';
import dayjs from 'dayjs';
import { FormattedMessage, useIntl } from 'react-intl';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Grid from '@mui/material/GridLegacy';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Skeleton from '@mui/material/Skeleton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';

import {
  IconWallet,
  IconArrowDownLeft,
  IconArrowUpRight,
  IconUsers,
  IconTruck,
  IconChartLine,
  IconFileDescription
} from '@tabler/icons-react';

import Breadcrumbs from 'ui-component/extended/Breadcrumbs';
import MainCard from 'ui-component/cards/MainCard';
import PageTitle from 'ui-component/PageTitle';
import ReportCard from 'ui-component/cards/ReportCard';

import { useTreasuryDashboardSummary } from 'modules/Treasury/hooks/useTreasury';
import {
  useCustomerReceivablesAgingReport,
  useSupplierPayablesAgingReport,
  useIncomeStatementReport
} from 'modules/Accounting/hooks/useAccountingReports';

function formatAmount(locale: string, value: number) {
  return new Intl.NumberFormat(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value);
}

function formatDate(locale: string, value: string) {
  return new Intl.DateTimeFormat(locale, { year: 'numeric', month: 'short', day: 'numeric' }).format(new Date(value));
}

export default function AccountingHomePage() {
  const intl = useIntl();
  const locale = intl.locale;

  const today = dayjs().format('YYYY-MM-DD');
  const startOfMonth = dayjs().startOf('month').format('YYYY-MM-DD');

  const { summary: treasurySummary, isLoading: isTreasuryLoading, error: treasuryError } = useTreasuryDashboardSummary(
    startOfMonth,
    today
  );

  const { report: customerReport, isLoading: isCustomerLoading, error: customerError } = useCustomerReceivablesAgingReport({
    asOfDate: today
  });

  const { report: supplierReport, isLoading: isSupplierLoading, error: supplierError } = useSupplierPayablesAgingReport({
    asOfDate: today
  });

  const { report: incomeReport, isLoading: isIncomeLoading, error: incomeError } = useIncomeStatementReport({
    fromDate: startOfMonth,
    toDate: today
  });

  const currencySummary = treasurySummary?.currencySummaries?.[0];
  const recentMovements = treasurySummary?.recentMovements ?? [];

  const howMuchDoWeHave = currencySummary?.totalCurrentBalance ?? null;
  const howMuchCameIn = currencySummary?.periodReceipts ?? null;
  const howMuchWentOut = currencySummary?.periodPayments ?? null;

  const customersOweUs = customerReport?.netReceivable ?? null;
  const weOweSuppliers = supplierReport?.netSupplierPayable ?? null;
  const netIncome = incomeReport?.netProfitOrLoss ?? null;

  return (
    <Box>
      <Breadcrumbs custom heading="money" links={[{ title: 'money' }]} />
      <Stack spacing={3}>
        <PageTitle>
          <FormattedMessage id="money" defaultMessage="Money" />
        </PageTitle>
        <MainCard contentSX={{ p: 0 }}>
          <Box
            sx={{
              p: { xs: 3, md: 5 },
              borderRadius: 3,
              bgcolor: 'primary.lighter',
              background: 'linear-gradient(135deg, rgba(94,114,228,0.12) 0%, rgba(255,255,255,0.95) 100%)'
            }}
          >
            <Stack spacing={2} sx={{ maxWidth: 760 }}>
              <Typography variant="h2" fontWeight={800}>
                <FormattedMessage id="money" defaultMessage="Money" />
              </Typography>
              <Typography variant="body1" color="text.secondary">
                <FormattedMessage
                  id="money-description"
                  defaultMessage="See how much you have, what came in, what went out, and what is owed."
                />
              </Typography>
            </Stack>
          </Box>
        </MainCard>

        {/* SUMMARY CARDS */}
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={4}>
            {isTreasuryLoading ? (
              <Skeleton variant="rounded" height={130} />
            ) : treasuryError ? (
              <ReportCard
                primary="—"
                secondary={intl.formatMessage({ id: 'how-much-do-we-have', defaultMessage: 'How much do we have?' })}
                iconPrimary={IconWallet}
                color="error.main"
              />
            ) : (
              <ReportCard
                primary={howMuchDoWeHave !== null ? formatAmount(locale, howMuchDoWeHave) : '—'}
                secondary={intl.formatMessage({ id: 'how-much-do-we-have', defaultMessage: 'How much do we have?' })}
                iconPrimary={IconWallet}
                color="primary.main"
              />
            )}
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            {isTreasuryLoading ? (
              <Skeleton variant="rounded" height={130} />
            ) : treasuryError ? (
              <ReportCard
                primary="—"
                secondary={`${intl.formatMessage({ id: 'how-much-came-in', defaultMessage: 'How much came in?' })} (${intl.formatMessage({ id: 'this-month', defaultMessage: 'This month' })})`}
                iconPrimary={IconArrowDownLeft}
                color="error.main"
              />
            ) : (
              <ReportCard
                primary={howMuchCameIn !== null ? formatAmount(locale, howMuchCameIn) : '—'}
                secondary={`${intl.formatMessage({ id: 'how-much-came-in', defaultMessage: 'How much came in?' })} (${intl.formatMessage({ id: 'this-month', defaultMessage: 'This month' })})`}
                iconPrimary={IconArrowDownLeft}
                color="success.main"
              />
            )}
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            {isTreasuryLoading ? (
              <Skeleton variant="rounded" height={130} />
            ) : treasuryError ? (
              <ReportCard
                primary="—"
                secondary={`${intl.formatMessage({ id: 'how-much-went-out', defaultMessage: 'How much went out?' })} (${intl.formatMessage({ id: 'this-month', defaultMessage: 'This month' })})`}
                iconPrimary={IconArrowUpRight}
                color="error.main"
              />
            ) : (
              <ReportCard
                primary={howMuchWentOut !== null ? formatAmount(locale, howMuchWentOut) : '—'}
                secondary={`${intl.formatMessage({ id: 'how-much-went-out', defaultMessage: 'How much went out?' })} (${intl.formatMessage({ id: 'this-month', defaultMessage: 'This month' })})`}
                iconPrimary={IconArrowUpRight}
                color="error.main"
              />
            )}
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            {isCustomerLoading ? (
              <Skeleton variant="rounded" height={130} />
            ) : customerError ? (
              <ReportCard
                primary="—"
                secondary={intl.formatMessage({ id: 'customers-owe-us', defaultMessage: 'Customers owe us' })}
                iconPrimary={IconUsers}
                color="error.main"
              />
            ) : (
              <ReportCard
                primary={customersOweUs !== null ? formatAmount(locale, customersOweUs) : '—'}
                secondary={intl.formatMessage({ id: 'customers-owe-us', defaultMessage: 'Customers owe us' })}
                iconPrimary={IconUsers}
                color="info.main"
              />
            )}
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            {isSupplierLoading ? (
              <Skeleton variant="rounded" height={130} />
            ) : supplierError ? (
              <ReportCard
                primary="—"
                secondary={intl.formatMessage({ id: 'we-owe-suppliers', defaultMessage: 'We owe suppliers' })}
                iconPrimary={IconTruck}
                color="error.main"
              />
            ) : (
              <ReportCard
                primary={weOweSuppliers !== null ? formatAmount(locale, weOweSuppliers) : '—'}
                secondary={intl.formatMessage({ id: 'we-owe-suppliers', defaultMessage: 'We owe suppliers' })}
                iconPrimary={IconTruck}
                color="warning.main"
              />
            )}
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            {isIncomeLoading ? (
              <Skeleton variant="rounded" height={130} />
            ) : incomeError ? (
              <ReportCard
                primary="—"
                secondary={`${intl.formatMessage({ id: 'profit-or-loss', defaultMessage: 'Profit or loss' })} (${intl.formatMessage({ id: 'this-month', defaultMessage: 'This month' })})`}
                iconPrimary={IconChartLine}
                color="error.main"
              />
            ) : (
              <ReportCard
                primary={netIncome !== null ? formatAmount(locale, Math.abs(netIncome)) : '—'}
                secondary={`${netIncome !== null && netIncome >= 0 ? intl.formatMessage({ id: 'profit', defaultMessage: 'Profit' }) : netIncome !== null && netIncome < 0 ? intl.formatMessage({ id: 'loss', defaultMessage: 'Loss' }) : intl.formatMessage({ id: 'profit-or-loss', defaultMessage: 'Profit or loss' })} (${intl.formatMessage({ id: 'this-month', defaultMessage: 'This month' })})`}
                iconPrimary={IconChartLine}
                color={netIncome !== null && netIncome >= 0 ? 'success.main' : 'error.main'}
              />
            )}
          </Grid>
        </Grid>

        {/* LOWER SECTIONS */}
        <Grid container spacing={3}>
          {/* Latest Money Movements */}
          <Grid item xs={12} md={8}>
            <MainCard title={<FormattedMessage id="latest-money-movements" defaultMessage="Latest Money Movements" />}>
              <List sx={{ p: 0 }}>
                {isTreasuryLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <ListItem key={i} divider={i < 4} sx={{ px: 0 }}>
                      <Skeleton variant="text" width="100%" height={40} />
                    </ListItem>
                  ))
                ) : treasuryError ? (
                  <Typography color="error" sx={{ p: 2, textAlign: 'center' }}>
                    <FormattedMessage id="error-loading-data" defaultMessage="Error loading data." />
                  </Typography>
                ) : recentMovements.length === 0 ? (
                  <Typography color="text.secondary" sx={{ p: 2, textAlign: 'center' }}>
                    <FormattedMessage id="no-movements" defaultMessage="No movements found." />
                  </Typography>
                ) : (
                  recentMovements.slice(0, 5).map((mov, index) => (
                    <ListItem key={mov.id} divider={index < Math.min(recentMovements.length - 1, 4)} sx={{ px: 0 }}>
                      <ListItemText
                        primary={locale === 'ar' ? mov.descriptionArabic : (mov.descriptionEnglish || mov.descriptionArabic)}
                        secondary={formatDate(locale, mov.movementDate)}
                      />
                      <Typography
                        variant="subtitle1"
                        color={mov.debitAmount > 0 ? 'success.main' : 'error.main'}
                      >
                        {mov.debitAmount > 0 ? '+' : '-'} {formatAmount(locale, mov.debitAmount > 0 ? mov.debitAmount : mov.creditAmount)}
                      </Typography>
                    </ListItem>
                  ))
                )}
              </List>
              <Box sx={{ mt: 2, textAlign: 'center' }}>
                <Button component={Link} to="/treasury/statements" variant="outlined" size="small">
                  <FormattedMessage id="view-all-movements" defaultMessage="View All Movements" />
                </Button>
              </Box>
            </MainCard>
          </Grid>

          {/* Reports */}
          <Grid item xs={12} md={4}>
            <MainCard title={<FormattedMessage id="reports" defaultMessage="Reports" />}>
              <List sx={{ p: 0 }}>
                <ListItemButton component={Link} to="/accounting/reports/income-statement" divider sx={{ px: 0 }}>
                  <IconFileDescription size={20} style={{ marginRight: 8, marginLeft: 8 }} />
                  <ListItemText primary={<FormattedMessage id="profit-and-loss-report" defaultMessage="Profit and Loss" />} />
                </ListItemButton>
                <ListItemButton component={Link} to="/accounting/reports/balance-sheet" divider sx={{ px: 0 }}>
                  <IconFileDescription size={20} style={{ marginRight: 8, marginLeft: 8 }} />
                  <ListItemText primary={<FormattedMessage id="money-position-report" defaultMessage="Money Position" />} />
                </ListItemButton>
                <ListItemButton component={Link} to="/accounting/reports/cash-flow" divider sx={{ px: 0 }}>
                  <IconFileDescription size={20} style={{ marginRight: 8, marginLeft: 8 }} />
                  <ListItemText primary={<FormattedMessage id="money-movement-report" defaultMessage="Money Movement" />} />
                </ListItemButton>
                <ListItemButton component={Link} to="/accounting/reports/customer-receivables-aging" divider sx={{ px: 0 }}>
                  <IconFileDescription size={20} style={{ marginRight: 8, marginLeft: 8 }} />
                  <ListItemText primary={<FormattedMessage id="customer-money-report" defaultMessage="Customer Money" />} />
                </ListItemButton>
                <ListItemButton component={Link} to="/accounting/reports/supplier-payables-aging" sx={{ px: 0 }}>
                  <IconFileDescription size={20} style={{ marginRight: 8, marginLeft: 8 }} />
                  <ListItemText primary={<FormattedMessage id="supplier-money-report" defaultMessage="Supplier Money" />} />
                </ListItemButton>
              </List>
            </MainCard>
          </Grid>
        </Grid>
      </Stack>
    </Box>
  );
}
