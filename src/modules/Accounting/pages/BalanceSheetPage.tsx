import { Link } from 'react-router-dom';
import { useMemo, useState } from 'react';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import FormControlLabel from '@mui/material/FormControlLabel';
import Grid from '@mui/material/GridLegacy';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import { IconArrowRight, IconChartPie, IconExternalLink, IconRefresh } from '@tabler/icons-react';
import { FormattedMessage, useIntl } from 'react-intl';

import Breadcrumbs from 'ui-component/extended/Breadcrumbs';
import MainCard from 'ui-component/cards/MainCard';
import PageTitle from 'ui-component/PageTitle';

import { useBalanceSheetReport } from '../hooks/useAccountingReports';
import type { BalanceSheetParams, BalanceSheetRowDto } from '../types/report.types';

function formatAmount(locale: string, value: number) {
  return new Intl.NumberFormat(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value);
}

function formatDateInput(value: Date) {
  return value.toISOString().slice(0, 10);
}

function buildGeneralLedgerUrl(accountId: string, asOfDate: string, includeDescendants: boolean) {
  const query = new URLSearchParams({
    accountId,
    toDate: asOfDate
  });

  if (includeDescendants) {
    query.set('includeDescendants', 'true');
  }

  return `/accounting/reports/general-ledger?${query.toString()}`;
}

function buildIncomeStatementUrl(asOfDate: string) {
  const query = new URLSearchParams({
    toDate: asOfDate
  });

  return `/accounting/reports/income-statement?${query.toString()}`;
}

export default function BalanceSheetPage() {
  const intl = useIntl();
  const today = useMemo(() => formatDateInput(new Date()), []);
  const [params, setParams] = useState<BalanceSheetParams>({
    asOfDate: today,
    includeZeroBalances: false,
    includeInactiveAccounts: false,
    includeHeaderAccounts: true,
    search: ''
  });

  const reportParams = useMemo(
    () => ({
      ...params,
      search: params.search?.trim() || undefined
    }),
    [params]
  );
  const { report, error, isLoading, mutate } = useBalanceSheetReport(reportParams);

  const renderRowActions = (row: BalanceSheetRowDto) => {
    if (row.isDerived) {
      return (
        <Button component={Link} to={buildIncomeStatementUrl(report?.asOfDate ?? params.asOfDate ?? today)} size="small" variant="outlined" startIcon={<IconArrowRight size={16} />}>
          <FormattedMessage id="income-statement-report" defaultMessage="تقرير قائمة الدخل" />
        </Button>
      );
    }

    if (!row.accountId) {
      return null;
    }

    return (
      <Stack direction="row" spacing={1} justifyContent="center" flexWrap="wrap">
        <Button component={Link} to={`/accounting/chart-of-accounts/${row.accountId}`} size="small" startIcon={<IconExternalLink size={16} />}>
          <FormattedMessage id="account" defaultMessage="الحساب" />
        </Button>
        <Button
          component={Link}
          to={buildGeneralLedgerUrl(row.accountId, report?.asOfDate ?? params.asOfDate ?? today, !row.isPosting)}
          size="small"
          variant="outlined"
          startIcon={<IconArrowRight size={16} />}
        >
          <FormattedMessage id="view-general-ledger" defaultMessage="عرض الأستاذ العام" />
        </Button>
      </Stack>
    );
  };

  const renderSection = (
    sectionId: string,
    defaultTitle: string,
    rows: BalanceSheetRowDto[],
    total: number
  ) => (
    <MainCard
      title={
        <Stack direction="row" spacing={1.5} alignItems="center" justifyContent="space-between" flexWrap="wrap">
          <Stack direction="row" spacing={1} alignItems="center">
            <IconChartPie size={18} />
            <Typography variant="h6" component="span">
              <FormattedMessage id={sectionId} defaultMessage={defaultTitle} />
            </Typography>
            <Chip size="small" variant="outlined" label={rows.length.toString()} />
          </Stack>
          <Typography variant="subtitle1" fontWeight={700}>
            {formatAmount(intl.locale, total)}
          </Typography>
        </Stack>
      }
      contentSX={{ p: 0 }}
    >
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>
              <FormattedMessage id="account-code" defaultMessage="كود الحساب" />
            </TableCell>
            <TableCell>
              <FormattedMessage id="account" defaultMessage="اسم الحساب" />
            </TableCell>
            <TableCell align="right">
              <FormattedMessage id="debit" defaultMessage="مدين" />
            </TableCell>
            <TableCell align="right">
              <FormattedMessage id="credit" defaultMessage="دائن" />
            </TableCell>
            <TableCell align="right">
              <FormattedMessage id="net-balance" defaultMessage="صافي الرصيد" />
            </TableCell>
            <TableCell align="right">
              <FormattedMessage id="normal-balance" defaultMessage="الرصيد الطبيعي" />
            </TableCell>
            <TableCell align="center">
              <FormattedMessage id="actions" defaultMessage="الإجراءات" />
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {isLoading ? (
            Array.from({ length: 6 }).map((_, index) => (
              <TableRow key={index}>
                <TableCell><Skeleton width={90} /></TableCell>
                <TableCell><Skeleton width={260} /></TableCell>
                <TableCell align="right"><Skeleton width={80} sx={{ ml: 'auto' }} /></TableCell>
                <TableCell align="right"><Skeleton width={80} sx={{ ml: 'auto' }} /></TableCell>
                <TableCell align="right"><Skeleton width={90} sx={{ ml: 'auto' }} /></TableCell>
                <TableCell align="right"><Skeleton width={90} sx={{ ml: 'auto' }} /></TableCell>
                <TableCell align="center"><Skeleton width={140} sx={{ mx: 'auto' }} /></TableCell>
              </TableRow>
            ))
          ) : rows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                <Typography color="text.secondary">
                  <FormattedMessage id="balance-sheet-empty" defaultMessage="لا توجد أرصدة تطابق الفلاتر المحددة." />
                </Typography>
              </TableCell>
            </TableRow>
          ) : (
            rows.map((row) => (
              <TableRow
                key={row.isDerived ? `derived-${row.accountArabicName}` : row.accountId ?? row.accountArabicName}
                hover
                sx={{
                  bgcolor: row.isDerived ? 'info.lighter' : row.isAbnormalBalance ? 'warning.lighter' : undefined,
                  fontWeight: row.isDerived || !row.isPosting ? 700 : undefined
                }}
              >
                <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.accountCode || '—'}</TableCell>
                <TableCell>
                  <Stack spacing={0.25}>
                    <Typography variant="body2" fontWeight={row.isDerived || !row.isPosting ? 700 : 600}>
                      {row.hierarchyLevel > 0 && !row.isDerived ? (
                        <Box component="span" sx={{ pl: row.hierarchyLevel * 2 }}>
                          {row.accountArabicName}
                        </Box>
                      ) : (
                        row.accountArabicName
                      )}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {row.isDerived ? row.accountEnglishName : row.hierarchyPath}
                    </Typography>
                  </Stack>
                </TableCell>
                <TableCell align="right">{formatAmount(intl.locale, row.debitAmount)}</TableCell>
                <TableCell align="right">{formatAmount(intl.locale, row.creditAmount)}</TableCell>
                <TableCell align="right">
                  <Stack spacing={0.5} alignItems="flex-end">
                    <Typography variant="body2" fontWeight={700} color={row.isAbnormalBalance ? 'error.main' : 'text.primary'}>
                      {formatAmount(intl.locale, row.netAmount)}
                    </Typography>
                    {row.isAbnormalBalance && (
                      <Chip size="small" color="warning" variant="outlined" label={intl.formatMessage({ id: 'abnormal-balance', defaultMessage: 'Abnormal balance' })} />
                    )}
                  </Stack>
                </TableCell>
                <TableCell align="right">
                  <Typography variant="body2" fontWeight={600}>
                    {row.normalBalanceLabel}
                  </Typography>
                </TableCell>
                <TableCell align="center">{renderRowActions(row)}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </MainCard>
  );

  return (
    <Box>
      <Breadcrumbs
        custom
        heading="balance-sheet-report"
        links={[
          { title: 'general-ledger', to: '/accounting' },
          { title: 'accounting-reports', to: '/accounting/reports/general-ledger' },
          { title: 'balance-sheet-report' }
        ]}
      />
      <Stack spacing={3}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 2, flexWrap: 'wrap' }}>
          <Box>
            <PageTitle>
              <FormattedMessage id="balance-sheet-report" defaultMessage="تقرير الميزانية العمومية" />
            </PageTitle>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              <FormattedMessage
                id="balance-sheet-report-description"
                defaultMessage="راجع الأصول والالتزامات وحقوق الملكية ونتائج الأعمال غير المقفلة ومعادلة الرصيد الدقيقة حتى تاريخ محدد."
              />
            </Typography>
          </Box>
          {report && (
            <Stack direction="row" spacing={1} flexWrap="wrap" justifyContent="flex-end">
              <Chip
                color={report.isBalanced ? 'success' : 'error'}
                variant="outlined"
                label={report.isBalanced ? intl.formatMessage({ id: 'balance-sheet-balanced', defaultMessage: 'Balanced' }) : intl.formatMessage({ id: 'balance-sheet-unbalanced', defaultMessage: 'Out of balance' })}
                sx={{ fontWeight: 600 }}
              />
              <Chip
                variant="outlined"
                label={`${intl.formatMessage({ id: 'balance-difference', defaultMessage: 'Balance difference' })}: ${formatAmount(intl.locale, report.balanceDifference)}`}
              />
              {report.hiddenPostingAccountCount > 0 && (
                <Chip
                  variant="outlined"
                  color={report.hasHiddenBalances ? 'warning' : 'default'}
                  label={`${intl.formatMessage({ id: 'hidden-posting-account-count', defaultMessage: 'Hidden posting accounts' })}: ${report.hiddenPostingAccountCount}`}
                />
              )}
            </Stack>
          )}
        </Box>

        <Card sx={{ p: 2, borderRadius: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={3}>
              <TextField
                type="date"
                fullWidth
                label={<FormattedMessage id="as-of-date" defaultMessage="حتى تاريخ" />}
                value={params.asOfDate}
                onChange={(event) => setParams((current) => ({ ...current, asOfDate: event.target.value }))}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label={<FormattedMessage id="search" defaultMessage="بحث" />}
                value={params.search ?? ''}
                onChange={(event) => setParams((current) => ({ ...current, search: event.target.value }))}
                helperText={<FormattedMessage id="balance-sheet-search-helper" defaultMessage="صفِّ حسب الكود أو الاسم العربي أو الاسم الإنجليزي." />}
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <FormControlLabel
                control={
                  <Switch
                    checked={params.includeZeroBalances ?? false}
                    onChange={(event) => setParams((current) => ({ ...current, includeZeroBalances: event.target.checked }))}
                  />
                }
                label={<FormattedMessage id="include-zero-balances" defaultMessage="تضمين الأرصدة الصفرية" />}
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <FormControlLabel
                control={
                  <Switch
                    checked={params.includeInactiveAccounts ?? false}
                    onChange={(event) => setParams((current) => ({ ...current, includeInactiveAccounts: event.target.checked }))}
                  />
                }
                label={<FormattedMessage id="include-inactive-accounts" defaultMessage="تضمين الحسابات غير النشطة" />}
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <FormControlLabel
                control={
                  <Switch
                    checked={params.includeHeaderAccounts ?? true}
                    onChange={(event) => setParams((current) => ({ ...current, includeHeaderAccounts: event.target.checked }))}
                  />
                }
                label={<FormattedMessage id="include-header-rows" defaultMessage="تضمين الحسابات الرئيسية" />}
              />
            </Grid>
          </Grid>
        </Card>

        {error && (
          <Alert
            severity="error"
            action={
              <Button color="inherit" size="small" startIcon={<IconRefresh size={16} />} onClick={() => mutate()}>
                <FormattedMessage id="retry" defaultMessage="إعادة المحاولة" />
              </Button>
            }
          >
            {error instanceof Error
              ? error.message
              : intl.formatMessage({ id: 'balance-sheet-load-error', defaultMessage: 'Unable to load the balance sheet report.' })}
          </Alert>
        )}

        {isLoading && !report && !error && (
          <Alert severity="info">
            <FormattedMessage id="loading" defaultMessage="جارٍ التحميل..." />
          </Alert>
        )}

        {report && (
          <>
            <Grid container spacing={2}>
              <Grid item xs={12} md={3}>
                <Card sx={{ p: 2.5, borderRadius: 3 }}>
                  <Typography variant="overline" color="text.secondary">
                    <FormattedMessage id="total-assets" defaultMessage="إجمالي الأصول" />
                  </Typography>
                  <Typography variant="h4" fontWeight={800} sx={{ mt: 1 }}>
                    {formatAmount(intl.locale, report.totalAssets)}
                  </Typography>
                </Card>
              </Grid>
              <Grid item xs={12} md={3}>
                <Card sx={{ p: 2.5, borderRadius: 3 }}>
                  <Typography variant="overline" color="text.secondary">
                    <FormattedMessage id="total-liabilities" defaultMessage="إجمالي الالتزامات" />
                  </Typography>
                  <Typography variant="h4" fontWeight={800} sx={{ mt: 1 }}>
                    {formatAmount(intl.locale, report.totalLiabilities)}
                  </Typography>
                </Card>
              </Grid>
              <Grid item xs={12} md={3}>
                <Card sx={{ p: 2.5, borderRadius: 3 }}>
                  <Typography variant="overline" color="text.secondary">
                    <FormattedMessage id="total-equity" defaultMessage="إجمالي حقوق الملكية" />
                  </Typography>
                  <Typography variant="h4" fontWeight={800} sx={{ mt: 1 }}>
                    {formatAmount(intl.locale, report.totalEquity)}
                  </Typography>
                </Card>
              </Grid>
              <Grid item xs={12} md={3}>
                <Card sx={{ p: 2.5, borderRadius: 3 }}>
                  <Typography variant="overline" color="text.secondary">
                    <FormattedMessage id="balance-difference" defaultMessage="فرق الرصيد" />
                  </Typography>
                  <Typography variant="h4" fontWeight={800} sx={{ mt: 1 }} color={report.isBalanced ? 'success.main' : 'error.main'}>
                    {formatAmount(intl.locale, report.balanceDifference)}
                  </Typography>
                </Card>
              </Grid>
              <Grid item xs={12} md={3}>
                <Card sx={{ p: 2.5, borderRadius: 3 }}>
                  <Typography variant="overline" color="text.secondary">
                    <FormattedMessage id="total-equity-before-unclosed-earnings" defaultMessage="حقوق الملكية قبل الأرباح غير المقفلة" />
                  </Typography>
                  <Typography variant="h4" fontWeight={800} sx={{ mt: 1 }}>
                    {formatAmount(intl.locale, report.totalEquityBeforeUnclosedEarnings)}
                  </Typography>
                </Card>
              </Grid>
              <Grid item xs={12} md={3}>
                <Card sx={{ p: 2.5, borderRadius: 3 }}>
                    <Typography variant="overline" color="text.secondary">
                      <FormattedMessage id="unclosed-earnings" defaultMessage="نتيجة الأعمال غير المقفلة" />
                    </Typography>
                    <Typography variant="h4" fontWeight={800} sx={{ mt: 1 }} color={report.unclosedEarnings > 0 ? 'success.main' : report.unclosedEarnings < 0 ? 'error.main' : 'text.primary'}>
                      {formatAmount(intl.locale, report.unclosedEarnings)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {report.unclosedEarningsLabel}
                    </Typography>
                  </Card>
                </Grid>
              <Grid item xs={12} md={3}>
                <Card sx={{ p: 2.5, borderRadius: 3 }}>
                  <Typography variant="overline" color="text.secondary">
                    <FormattedMessage id="total-liabilities-and-equity" defaultMessage="إجمالي الالتزامات وحقوق الملكية" />
                  </Typography>
                  <Typography variant="h4" fontWeight={800} sx={{ mt: 1 }}>
                    {formatAmount(intl.locale, report.totalLiabilitiesAndEquity)}
                  </Typography>
                </Card>
              </Grid>
              <Grid item xs={12} md={3}>
                <Card sx={{ p: 2.5, borderRadius: 3 }}>
                  <Typography variant="overline" color="text.secondary">
                    <FormattedMessage id="balance-sheet-result-type" defaultMessage="نوع النتيجة" />
                  </Typography>
                  <Typography variant="h4" fontWeight={800} sx={{ mt: 1 }}>
                    {intl.formatMessage({
                      id: report.unclosedEarningsResultType === 'Profit' ? 'profit' : report.unclosedEarningsResultType === 'Loss' ? 'loss' : 'break-even',
                      defaultMessage: report.unclosedEarningsResultType === 'Profit' ? 'Profit' : report.unclosedEarningsResultType === 'Loss' ? 'Loss' : 'Break even'
                    })}
                  </Typography>
                </Card>
              </Grid>
            </Grid>

            {report.hasHiddenBalances && (
              <Alert severity="warning">
                <FormattedMessage
                  id="balance-sheet-hidden-balances-warning"
                  defaultMessage="الفلاتر المعروضة تُخفي حساب ترحيل واحدًا أو أكثر، لكن الإجماليات الموجزة تبقى دون تغيير."
                />
              </Alert>
            )}

            {!report.hasActivity && (
              <Alert severity="info">
                <FormattedMessage
                  id="balance-sheet-empty-asof"
                  defaultMessage="لا توجد أرصدة محاسبية حتى التاريخ المحدد."
                />
              </Alert>
            )}

            {renderSection('balance-sheet-assets', 'Assets', report.assetRows, report.totalAssets)}
            {renderSection('balance-sheet-liabilities', 'Liabilities', report.liabilityRows, report.totalLiabilities)}
            {renderSection('balance-sheet-equity', 'Equity', [...report.equityRows, report.unclosedEarningsRow], report.totalEquity)}
          </>
        )}
      </Stack>
    </Box>
  );
}
