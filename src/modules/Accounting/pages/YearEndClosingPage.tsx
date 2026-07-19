import { useEffect, useMemo, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import { IconCheck, IconLock, IconRotateClockwise2 } from '@tabler/icons-react';

import { useDispatch } from 'store';
import { openSnackbar } from 'store/slices/snackbar';
import useAuth from 'hooks/useAuth';
import { hasPermission } from 'modules/Administration/utils/permission-utils';
import Breadcrumbs from 'ui-component/extended/Breadcrumbs';
import Loader from 'ui-component/Loader';
import MainCard from 'ui-component/cards/MainCard';
import PageTitle from 'ui-component/PageTitle';

import { closeFiscalYear, reopenFiscalYear } from '../api/fiscalYearClosingApi';
import { useAccountingFiscalYears } from '../hooks/useAccountingPeriods';
import { useFiscalYearClosingOverview } from '../hooks/useFiscalYearClosing';
import { ACCOUNTING_PERMISSIONS } from '../utils/accounting.constants';
import type { FiscalYearClosingActionType } from '../types/fiscal-year-closing.types';

function getDisplayLabel(locale: string, labelArabic: string, labelEnglish: string | null) {
  return locale.toLowerCase().startsWith('ar') ? labelArabic : labelEnglish ?? labelArabic;
}

function formatMoney(locale: string, value: number) {
  return new Intl.NumberFormat(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value);
}

function formatDate(locale: string, value: string) {
  return new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(new Date(value));
}

function getActionLabel(locale: string, actionType: FiscalYearClosingActionType) {
  const isArabic = locale.toLowerCase().startsWith('ar');
  if (actionType === 'Close') {
    return isArabic ? 'إقفال' : 'Close';
  }

  return isArabic ? 'إعادة فتح' : 'Reopen';
}

export default function YearEndClosingPage() {
  const intl = useIntl();
  const dispatch = useDispatch();
  const { user } = useAuth();
  const { years, isLoading: yearsLoading, error: yearsError } = useAccountingFiscalYears();

  const [selectedFiscalYearId, setSelectedFiscalYearId] = useState<string>('');
  const { overview, isLoading: overviewLoading, error: overviewError, mutate } = useFiscalYearClosingOverview(selectedFiscalYearId || null);

  const canView = hasPermission(user, ACCOUNTING_PERMISSIONS.yearEndView);
  const canClose = hasPermission(user, ACCOUNTING_PERMISSIONS.yearEndClose);
  const canReopen = hasPermission(user, ACCOUNTING_PERMISSIONS.yearEndReopen);

  useEffect(() => {
    if (!selectedFiscalYearId && years.length > 0) {
      setSelectedFiscalYearId(years[0].id);
    }
  }, [selectedFiscalYearId, years]);

  const selectedYear = useMemo(() => years.find((year) => year.id === selectedFiscalYearId) ?? null, [selectedFiscalYearId, years]);
  const isLoading = yearsLoading || (!selectedFiscalYearId && years.length > 0) || (Boolean(selectedFiscalYearId) && overviewLoading);

  const notify = (message: string, severity: 'success' | 'error' = 'success') => {
    dispatch(openSnackbar({ open: true, message, variant: 'alert', severity }));
  };

  const handleAction = async (action: FiscalYearClosingActionType) => {
    if (!selectedFiscalYearId || !overview) {
      return;
    }

    if (action === 'Close' && !overview.canClose) {
      notify(intl.formatMessage({ id: 'fiscal-year-close-not-allowed', defaultMessage: 'Fiscal year cannot be closed yet.' }), 'error');
      return;
    }

    if (action === 'Reopen' && !overview.canReopen) {
      notify(intl.formatMessage({ id: 'fiscal-year-reopen-not-allowed', defaultMessage: 'Fiscal year is not currently closed.' }), 'error');
      return;
    }

    const reason = window
      .prompt(
        action === 'Close'
          ? intl.formatMessage({ id: 'fiscal-year-close-reason', defaultMessage: 'Enter a reason for fiscal year closing.' })
          : intl.formatMessage({ id: 'fiscal-year-reopen-reason', defaultMessage: 'Enter a reason for reopening fiscal year closing.' })
      )
      ?.trim();

    if (!reason) {
      return;
    }

    try {
      const updated =
        action === 'Close'
          ? await closeFiscalYear({ fiscalYearId: selectedFiscalYearId, reason })
          : await reopenFiscalYear({ fiscalYearId: selectedFiscalYearId, reason });

      await mutate({ success: true, message: null, data: updated, errors: [] }, { revalidate: false });
      notify(
        action === 'Close'
          ? intl.formatMessage({ id: 'fiscal-year-closed-successfully', defaultMessage: 'Fiscal year closed successfully.' })
          : intl.formatMessage({ id: 'fiscal-year-reopened-successfully', defaultMessage: 'Fiscal year closing reopened successfully.' })
      );
    } catch (error) {
      notify(error instanceof Error ? error.message : intl.formatMessage({ id: 'fiscal-year-closing-action-failed', defaultMessage: 'Fiscal year closing action failed.' }), 'error');
    }
  };

  if (!canView) {
    return <Loader />;
  }

  if (isLoading) {
    return <Loader />;
  }

  return (
    <Box>
      <Breadcrumbs custom heading="year-end-closing" links={[{ title: 'general-ledger', to: '/accounting' }, { title: 'year-end-closing' }]} />
      <Stack spacing={3}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 2, flexWrap: 'wrap' }}>
          <Box>
            <PageTitle>
              <FormattedMessage id="year-end-closing" defaultMessage="Year-End Closing" />
            </PageTitle>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1, maxWidth: 840 }}>
              <FormattedMessage
                id="year-end-closing-description"
                defaultMessage="Review the fiscal year activity, close profit and expense balances to retained earnings, and reopen the closing when adjustments are required."
              />
            </Typography>
          </Box>
          <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
            <Chip color={overview?.isClosed ? 'success' : overview?.isReopened ? 'warning' : 'default'} label={overview?.currentStatusLabel ?? intl.formatMessage({ id: 'not-closed', defaultMessage: 'Not closed' })} />
            <Button
              variant="contained"
              startIcon={<IconLock size={18} />}
              onClick={() => handleAction('Close')}
              disabled={!overview?.canClose || !canClose}
            >
              <FormattedMessage id="close-fiscal-year" defaultMessage="Close fiscal year" />
            </Button>
            <Button
              variant="outlined"
              startIcon={<IconRotateClockwise2 size={18} />}
              onClick={() => handleAction('Reopen')}
              disabled={!overview?.canReopen || !canReopen}
            >
              <FormattedMessage id="reopen-fiscal-year" defaultMessage="Reopen closing" />
            </Button>
          </Stack>
        </Box>

        {yearsError && (
          <Card sx={{ p: 2, borderRadius: 3, border: '1px solid', borderColor: 'error.light' }}>
            <Typography color="error">
              {yearsError instanceof Error ? yearsError.message : intl.formatMessage({ id: 'fiscal-years-load-failed', defaultMessage: 'Failed to load fiscal years.' })}
            </Typography>
          </Card>
        )}

        {overviewError && (
          <Card sx={{ p: 2, borderRadius: 3, border: '1px solid', borderColor: 'error.light' }}>
            <Typography color="error">
              {overviewError instanceof Error ? overviewError.message : intl.formatMessage({ id: 'year-end-closing-load-failed', defaultMessage: 'Failed to load year-end closing details.' })}
            </Typography>
          </Card>
        )}

        <Card sx={{ p: 2.5, borderRadius: 3 }}>
          <Stack spacing={2}>
            <Typography variant="overline" color="text.secondary">
              <FormattedMessage id="fiscal-year" defaultMessage="Fiscal Year" />
            </Typography>
            <TextField
              select
              fullWidth
              label={<FormattedMessage id="select-fiscal-year" defaultMessage="Select fiscal year" />}
              value={selectedFiscalYearId}
              onChange={(event) => setSelectedFiscalYearId(event.target.value)}
            >
              {years.map((year) => (
                <MenuItem key={year.id} value={year.id}>
                  {getDisplayLabel(intl.locale, year.nameArabic, year.nameEnglish ?? year.nameArabic)}
                </MenuItem>
              ))}
            </TextField>
            {selectedYear && overview && (
              <Typography variant="body2" color="text.secondary">
                {formatDate(intl.locale, selectedYear.startDate)} - {formatDate(intl.locale, selectedYear.endDate)}
              </Typography>
            )}
          </Stack>
        </Card>

        {overview && (
          <>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
              <Card sx={{ p: 2.5, flex: 1, borderRadius: 3 }}>
                <Typography variant="overline" color="text.secondary">
                  <FormattedMessage id="retained-earnings-account" defaultMessage="Retained earnings account" />
                </Typography>
                <Typography variant="h5" fontWeight={700} sx={{ mt: 0.5 }}>
                  {overview.retainedEarningsAccountCode ?? '—'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {getDisplayLabel(intl.locale, overview.retainedEarningsAccountNameArabic ?? '—', overview.retainedEarningsAccountNameEnglish ?? overview.retainedEarningsAccountNameArabic ?? '—')}
                </Typography>
              </Card>
              <Card sx={{ p: 2.5, flex: 1, borderRadius: 3 }}>
                <Typography variant="overline" color="text.secondary">
                  <FormattedMessage id="net-profit-or-loss" defaultMessage="Net profit or loss" />
                </Typography>
                <Typography variant="h5" fontWeight={700} sx={{ mt: 0.5 }}>
                  {formatMoney(intl.locale, overview.netProfitOrLoss)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {overview.netProfitOrLoss > 0 ? (
                    <FormattedMessage id="profit" defaultMessage="Profit" />
                  ) : overview.netProfitOrLoss < 0 ? (
                    <FormattedMessage id="loss" defaultMessage="Loss" />
                  ) : (
                    <FormattedMessage id="break-even" defaultMessage="Break even" />
                  )}
                </Typography>
              </Card>
              <Card sx={{ p: 2.5, flex: 1, borderRadius: 3 }}>
                <Typography variant="overline" color="text.secondary">
                  <FormattedMessage id="period-summary" defaultMessage="Period summary" />
                </Typography>
                <Typography variant="h5" fontWeight={700} sx={{ mt: 0.5 }}>
                  {overview.closedPeriodCount}/{overview.periodCount}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  <FormattedMessage id="closed-periods" defaultMessage="closed periods" /> {overview.allPeriodsClosed ? <FormattedMessage id="ready-for-close" defaultMessage="ready for close" /> : <FormattedMessage id="not-ready-for-close" defaultMessage="not ready" />}
                </Typography>
              </Card>
            </Stack>

            <Card sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
              <Stack spacing={2}>
                <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'center' }} spacing={2}>
                  <Box>
                    <Typography variant="h6" fontWeight={700}>
                      <FormattedMessage id="closing-preview" defaultMessage="Closing preview" />
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                      <FormattedMessage id="closing-preview-description" defaultMessage="These lines will be posted to zero revenue and expense balances against retained earnings." />
                    </Typography>
                  </Box>
                  <Stack direction="row" spacing={1} flexWrap="wrap">
                    <Chip color={overview.hasDraftJournalEntries ? 'warning' : 'success'} label={overview.hasDraftJournalEntries ? intl.formatMessage({ id: 'draft-entries-found', defaultMessage: 'Draft entries found' }) : intl.formatMessage({ id: 'no-draft-entries', defaultMessage: 'No draft entries' })} />
                    <Chip color={overview.hasActivity ? 'info' : 'default'} label={overview.hasActivity ? intl.formatMessage({ id: 'activity-found', defaultMessage: 'Activity found' }) : intl.formatMessage({ id: 'no-activity', defaultMessage: 'No activity' })} />
                  </Stack>
                </Stack>

                {overview.blockingIssues.length > 0 && (
                  <Stack spacing={1}>
                    {overview.blockingIssues.map((issue) => (
                      <Card key={issue} sx={{ p: 1.5, borderRadius: 2, bgcolor: 'warning.lighter' }}>
                        <Typography variant="body2" color="warning.dark">
                          {issue}
                        </Typography>
                      </Card>
                    ))}
                  </Stack>
                )}

                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>
                        <FormattedMessage id="account" defaultMessage="Account" />
                      </TableCell>
                      <TableCell>
                        <FormattedMessage id="type" defaultMessage="Type" />
                      </TableCell>
                      <TableCell align="right">
                        <FormattedMessage id="debit" />
                      </TableCell>
                      <TableCell align="right">
                        <FormattedMessage id="credit" />
                      </TableCell>
                      <TableCell align="right">
                        <FormattedMessage id="net-amount" defaultMessage="Net amount" />
                      </TableCell>
                      <TableCell>
                        <FormattedMessage id="retained-earnings" defaultMessage="Retained earnings" />
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {overview.previewLines.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                          <Typography color="text.secondary">
                            <FormattedMessage id="no-closing-lines" defaultMessage="No closing lines are required for this fiscal year." />
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      overview.previewLines.map((line) => (
                        <TableRow key={`${line.accountCode ?? 'retained'}-${line.accountNameArabic}`}>
                          <TableCell>
                            <Stack spacing={0.25}>
                              <Typography fontWeight={600}>
                                {line.accountCode ? `${line.accountCode} - ${line.accountNameArabic}` : line.accountNameArabic}
                              </Typography>
                              {line.accountNameEnglish && <Typography variant="caption" color="text.secondary">{line.accountNameEnglish}</Typography>}
                            </Stack>
                          </TableCell>
                          <TableCell>{line.accountTypeLabel}</TableCell>
                          <TableCell align="right">{formatMoney(intl.locale, line.debitAmount)}</TableCell>
                          <TableCell align="right">{formatMoney(intl.locale, line.creditAmount)}</TableCell>
                          <TableCell align="right">{formatMoney(intl.locale, line.netAmount)}</TableCell>
                          <TableCell>{line.isRetainedEarningsLine ? <IconCheck size={16} /> : '—'}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </Stack>
            </Card>

            <Card sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
              <Stack spacing={2}>
                <Typography variant="h6" fontWeight={700}>
                  <FormattedMessage id="closing-history" defaultMessage="Closing history" />
                </Typography>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>
                        <FormattedMessage id="action" defaultMessage="Action" />
                      </TableCell>
                      <TableCell>
                        <FormattedMessage id="date" />
                      </TableCell>
                      <TableCell>
                        <FormattedMessage id="journal-entry" defaultMessage="Journal entry" />
                      </TableCell>
                      <TableCell>
                        <FormattedMessage id="reason" defaultMessage="Reason" />
                      </TableCell>
                      <TableCell align="right">
                        <FormattedMessage id="net-amount" defaultMessage="Net amount" />
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {overview.history.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                          <Typography color="text.secondary">
                            <FormattedMessage id="no-closing-history" defaultMessage="No closing actions have been recorded yet." />
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      overview.history.map((item) => (
                        <TableRow key={item.id} hover>
                          <TableCell>
                            <Stack spacing={0.25}>
                              <Typography fontWeight={600}>{getActionLabel(intl.locale, item.actionType)}</Typography>
                              <Typography variant="caption" color="text.secondary">
                                {item.actionTypeLabel}
                              </Typography>
                            </Stack>
                          </TableCell>
                          <TableCell>{formatDate(intl.locale, item.actionDate)}</TableCell>
                          <TableCell>{item.journalEntryNumber ?? '—'}</TableCell>
                          <TableCell>{item.reason ?? '—'}</TableCell>
                          <TableCell align="right">{formatMoney(intl.locale, item.netProfitOrLoss)}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </Stack>
            </Card>

            {!overview.hasActivity && (
              <Card sx={{ p: 2.5, borderRadius: 3, border: '1px solid', borderColor: 'info.light', bgcolor: 'info.lighter' }}>
                <Typography variant="body2" color="info.dark">
                  <FormattedMessage
                    id="zero-activity-year-note"
                    defaultMessage="This fiscal year has no revenue or expense activity. Closing it will still create a closing history record, but no journal lines are required."
                  />
                </Typography>
              </Card>
            )}
          </>
        )}
      </Stack>
    </Box>
  );
}
