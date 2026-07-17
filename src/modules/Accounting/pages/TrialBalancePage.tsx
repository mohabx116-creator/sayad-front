import { useState } from 'react';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
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

import { FormattedMessage, useIntl } from 'react-intl';

import Breadcrumbs from 'ui-component/extended/Breadcrumbs';
import MainCard from 'ui-component/cards/MainCard';
import PageTitle from 'ui-component/PageTitle';

import { useTrialBalanceReport } from '../hooks/useAccountingReports';
import type { TrialBalanceParams } from '../types/report.types';

function formatAmount(locale: string, value: number) {
  return new Intl.NumberFormat(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value);
}

export default function TrialBalancePage() {
  const intl = useIntl();
  const [params, setParams] = useState<TrialBalanceParams>({
    fromDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().slice(0, 10),
    toDate: new Date().toISOString().slice(0, 10),
    includeInactiveAccounts: false,
    includeZeroBalances: false,
    includeHeaderAccounts: true
  });

  const { report, error, isLoading } = useTrialBalanceReport(params);

  return (
    <Box>
      <Breadcrumbs custom heading="trial-balance-report" links={[{ title: 'general-ledger', to: '/accounting' }, { title: 'trial-balance-report' }]} />
      <Stack spacing={3}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 2, flexWrap: 'wrap' }}>
          <Box>
            <PageTitle>
              <FormattedMessage id="trial-balance-report" defaultMessage="Trial Balance Report" />
            </PageTitle>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              <FormattedMessage
                id="trial-balance-report-description"
                defaultMessage="Review period and closing balances across the chart of accounts with header rollups and backend totals."
              />
            </Typography>
          </Box>
          {report && (
            <Chip
              color={report.totals.isBalanced ? 'success' : 'error'}
              variant="outlined"
              label={
                report.totals.isBalanced ? (
                  <FormattedMessage id="balanced-entry" defaultMessage="Balanced" />
                ) : (
                  intl.formatMessage({ id: 'out-of-balance', defaultMessage: 'Out of balance' })
                )
              }
              sx={{ fontWeight: 600 }}
            />
          )}
        </Box>

        <Card sx={{ p: 2, borderRadius: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={3}>
              <TextField
                type="date"
                fullWidth
                label={<FormattedMessage id="date-from" />}
                value={params.fromDate}
                onChange={(event) => setParams((current) => ({ ...current, fromDate: event.target.value }))}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                type="date"
                fullWidth
                label={<FormattedMessage id="date-to" />}
                value={params.toDate}
                onChange={(event) => setParams((current) => ({ ...current, toDate: event.target.value }))}
                InputLabelProps={{ shrink: true }}
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
                label={<FormattedMessage id="include-header-rows" defaultMessage="Include header rows" />}
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
                label={<FormattedMessage id="include-inactive-accounts" defaultMessage="Include inactive" />}
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
                label={<FormattedMessage id="include-zero-balances" defaultMessage="Include zero balances" />}
              />
            </Grid>
          </Grid>
        </Card>

        {error && (
          <Alert severity="error">
            {error instanceof Error ? error.message : intl.formatMessage({ id: 'trial-balance-load-error', defaultMessage: 'Unable to load the trial balance report.' })}
          </Alert>
        )}

        {report && (
          <>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <Card sx={{ p: 2.5, borderRadius: 3 }}>
                  <Typography variant="overline" color="text.secondary">
                    <FormattedMessage id="opening-balance" defaultMessage="Opening balance" />
                  </Typography>
                  <Typography variant="h5" fontWeight={800} sx={{ mt: 1 }}>
                    {formatAmount(intl.locale, report.totals.openingDebit)} / {formatAmount(intl.locale, report.totals.openingCredit)}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    <FormattedMessage id="difference" defaultMessage="Difference" /> {formatAmount(intl.locale, report.totals.openingDifference)}
                  </Typography>
                </Card>
              </Grid>
              <Grid item xs={12} md={4}>
                <Card sx={{ p: 2.5, borderRadius: 3 }}>
                  <Typography variant="overline" color="text.secondary">
                    <FormattedMessage id="period-totals" defaultMessage="Period totals" />
                  </Typography>
                  <Typography variant="h5" fontWeight={800} sx={{ mt: 1 }}>
                    {formatAmount(intl.locale, report.totals.periodDebit)} / {formatAmount(intl.locale, report.totals.periodCredit)}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    <FormattedMessage id="difference" defaultMessage="Difference" /> {formatAmount(intl.locale, report.totals.periodDifference)}
                  </Typography>
                </Card>
              </Grid>
              <Grid item xs={12} md={4}>
                <Card sx={{ p: 2.5, borderRadius: 3 }}>
                  <Typography variant="overline" color="text.secondary">
                    <FormattedMessage id="closing-balance" defaultMessage="Closing balance" />
                  </Typography>
                  <Typography variant="h5" fontWeight={800} sx={{ mt: 1 }}>
                    {formatAmount(intl.locale, report.totals.closingDebit)} / {formatAmount(intl.locale, report.totals.closingCredit)}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    <FormattedMessage id="difference" defaultMessage="Difference" /> {formatAmount(intl.locale, report.totals.closingDifference)}
                  </Typography>
                </Card>
              </Grid>
            </Grid>

            {!report.totals.isBalanced && (
              <Alert severity="warning">
                <FormattedMessage
                  id="trial-balance-imbalance-warning"
                  defaultMessage="The report is not balanced. The backend returned the exact variance instead of hiding it."
                />
              </Alert>
            )}

            <MainCard contentSX={{ p: 0 }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>
                      <FormattedMessage id="account" defaultMessage="Account" />
                    </TableCell>
                    <TableCell>
                      <FormattedMessage id="account-type" defaultMessage="Account type" />
                    </TableCell>
                    <TableCell align="right">
                      <FormattedMessage id="opening-debit" defaultMessage="Opening debit" />
                    </TableCell>
                    <TableCell align="right">
                      <FormattedMessage id="opening-credit" defaultMessage="Opening credit" />
                    </TableCell>
                    <TableCell align="right">
                      <FormattedMessage id="period-debit" defaultMessage="Period debit" />
                    </TableCell>
                    <TableCell align="right">
                      <FormattedMessage id="period-credit" defaultMessage="Period credit" />
                    </TableCell>
                    <TableCell align="right">
                      <FormattedMessage id="closing-debit" defaultMessage="Closing debit" />
                    </TableCell>
                    <TableCell align="right">
                      <FormattedMessage id="closing-credit" defaultMessage="Closing credit" />
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {isLoading ? (
                    Array.from({ length: 8 }).map((_, index) => (
                      <TableRow key={index}>
                        <TableCell><Skeleton width={220} /></TableCell>
                        <TableCell><Skeleton width={120} /></TableCell>
                        <TableCell align="right"><Skeleton width={80} sx={{ ml: 'auto' }} /></TableCell>
                        <TableCell align="right"><Skeleton width={80} sx={{ ml: 'auto' }} /></TableCell>
                        <TableCell align="right"><Skeleton width={80} sx={{ ml: 'auto' }} /></TableCell>
                        <TableCell align="right"><Skeleton width={80} sx={{ ml: 'auto' }} /></TableCell>
                        <TableCell align="right"><Skeleton width={80} sx={{ ml: 'auto' }} /></TableCell>
                        <TableCell align="right"><Skeleton width={80} sx={{ ml: 'auto' }} /></TableCell>
                      </TableRow>
                    ))
                  ) : report.rows.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                        <Typography color="text.secondary">
                          <FormattedMessage id="trial-balance-empty" defaultMessage="No balances matched the selected filters." />
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    report.rows.map((row) => (
                      <TableRow key={row.accountId} hover>
                        <TableCell>
                          <Stack spacing={0.25}>
                            <Typography variant="body2" fontWeight={600}>
                              {row.code} - {row.nameArabic}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {row.hierarchyPath}
                            </Typography>
                          </Stack>
                        </TableCell>
                        <TableCell>{row.accountTypeLabel}</TableCell>
                        <TableCell align="right">{formatAmount(intl.locale, row.openingDebit)}</TableCell>
                        <TableCell align="right">{formatAmount(intl.locale, row.openingCredit)}</TableCell>
                        <TableCell align="right">{formatAmount(intl.locale, row.periodDebit)}</TableCell>
                        <TableCell align="right">{formatAmount(intl.locale, row.periodCredit)}</TableCell>
                        <TableCell align="right">{formatAmount(intl.locale, row.closingDebit)}</TableCell>
                        <TableCell align="right">{formatAmount(intl.locale, row.closingCredit)}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </MainCard>
          </>
        )}
      </Stack>
    </Box>
  );
}
