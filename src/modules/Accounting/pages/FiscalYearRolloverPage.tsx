import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FormattedMessage, useIntl } from 'react-intl';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import { IconArrowBackUp, IconArrowRight, IconCheck, IconRefresh, IconRotateClockwise2 } from '@tabler/icons-react';

import { useDispatch } from 'store';
import { openSnackbar } from 'store/slices/snackbar';
import useAuth from 'hooks/useAuth';
import { hasPermission } from 'modules/Administration/utils/permission-utils';
import Breadcrumbs from 'ui-component/extended/Breadcrumbs';
import Loader from 'ui-component/Loader';
import MainCard from 'ui-component/cards/MainCard';
import PageTitle from 'ui-component/PageTitle';

import { createFiscalYearRollover, rollbackFiscalYearRollover } from '../api/fiscalYearRolloverApi';
import { useFiscalYearRolloverHistory, useFiscalYearRolloverPreview } from '../hooks/useFiscalYearRollover';
import { ACCOUNTING_PERMISSIONS } from '../utils/accounting.constants';

function getDisplayLabel(locale: string, labelArabic: string, labelEnglish: string | null) {
  return locale.toLowerCase().startsWith('ar') ? labelArabic : labelEnglish ?? labelArabic;
}

function formatMoney(locale: string, value: number) {
  return new Intl.NumberFormat(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value);
}

function formatDate(locale: string, value: string) {
  return new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(new Date(value));
}

function getStatusColor(status: string) {
  return status === 'Completed' ? 'success' : 'warning';
}

export default function FiscalYearRolloverPage() {
  const intl = useIntl();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { id } = useParams<{ id: string }>();

  const fiscalYearId = id ?? null;
  const { preview, isLoading: previewLoading, error: previewError, mutate: mutatePreview } = useFiscalYearRolloverPreview(fiscalYearId);
  const { history, isLoading: historyLoading, error: historyError, mutate: mutateHistory } = useFiscalYearRolloverHistory(fiscalYearId);

  const [reason, setReason] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isRollingBack, setIsRollingBack] = useState(false);

  const canRollOver = hasPermission(user, ACCOUNTING_PERMISSIONS.fiscalYearsRollOver);
  const canRollback = hasPermission(user, ACCOUNTING_PERMISSIONS.fiscalYearsRollback);
  const isLoading = previewLoading || historyLoading;

  const notify = (message: string, severity: 'success' | 'error' = 'success') => {
    dispatch(openSnackbar({ open: true, message, variant: 'alert', severity }));
  };

  const refresh = async () => {
    await Promise.all([mutatePreview(), mutateHistory()]);
  };

  const handleCreate = async () => {
    if (!fiscalYearId || !preview) {
      return;
    }

    if (!preview.canRollOver || !canRollOver) {
      notify(intl.formatMessage({ id: 'fiscal-year-rollover-not-allowed', defaultMessage: 'Fiscal year rollover is not allowed yet.' }), 'error');
      return;
    }

    const normalizedReason = reason.trim();
    if (!normalizedReason) {
      notify(intl.formatMessage({ id: 'fiscal-year-rollover-reason-required', defaultMessage: 'Please enter a reason for the rollover.' }), 'error');
      return;
    }

    setIsCreating(true);
    try {
      const updated = await createFiscalYearRollover(fiscalYearId, { reason: normalizedReason });
      await mutatePreview({ success: true, message: null, data: updated, errors: [] }, { revalidate: false });
      await refresh();
      notify(intl.formatMessage({ id: 'fiscal-year-rollover-created-successfully', defaultMessage: 'Fiscal year rollover completed successfully.' }));
    } catch (error) {
      notify(error instanceof Error ? error.message : intl.formatMessage({ id: 'fiscal-year-rollover-create-failed', defaultMessage: 'Fiscal year rollover failed.' }), 'error');
    } finally {
      setIsCreating(false);
    }
  };

  const handleRollback = async () => {
    if (!fiscalYearId || !preview) {
      return;
    }

    if (!preview.canRollback || !canRollback) {
      notify(intl.formatMessage({ id: 'fiscal-year-rollover-rollback-not-allowed', defaultMessage: 'Fiscal year rollover cannot be rolled back.' }), 'error');
      return;
    }

    const normalizedReason = reason.trim();
    if (!normalizedReason) {
      notify(intl.formatMessage({ id: 'fiscal-year-rollover-rollback-reason-required', defaultMessage: 'Please enter a reason for the rollback.' }), 'error');
      return;
    }

    setIsRollingBack(true);
    try {
      const updated = await rollbackFiscalYearRollover(fiscalYearId, { reason: normalizedReason });
      await mutatePreview({ success: true, message: null, data: updated, errors: [] }, { revalidate: false });
      await refresh();
      notify(intl.formatMessage({ id: 'fiscal-year-rollover-rolled-back-successfully', defaultMessage: 'Fiscal year rollover rolled back successfully.' }));
    } catch (error) {
      notify(error instanceof Error ? error.message : intl.formatMessage({ id: 'fiscal-year-rollover-rollback-failed', defaultMessage: 'Fiscal year rollover rollback failed.' }), 'error');
    } finally {
      setIsRollingBack(false);
    }
  };

  if (!fiscalYearId) {
    return <Loader />;
  }

  if (isLoading) {
    return <Loader />;
  }

  if (!preview) {
    return (
      <Box>
        <Breadcrumbs custom heading="fiscal-year-rollover" links={[{ title: 'general-ledger', to: '/accounting' }, { title: 'fiscal-period-control', to: '/accounting/periods' }, { title: 'fiscal-year-rollover' }]} />
        <Card sx={{ p: 2.5, borderRadius: 3, border: '1px solid', borderColor: 'error.light' }}>
          <Typography color="error">
            {previewError instanceof Error ? previewError.message : intl.formatMessage({ id: 'fiscal-year-rollover-load-failed', defaultMessage: 'Failed to load fiscal year rollover details.' })}
          </Typography>
        </Card>
      </Box>
    );
  }

  return (
    <Box>
      <Breadcrumbs custom heading="fiscal-year-rollover" links={[{ title: 'general-ledger', to: '/accounting' }, { title: 'fiscal-period-control', to: '/accounting/periods' }, { title: 'fiscal-year-rollover' }]} />
      <Stack spacing={3}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 2, flexWrap: 'wrap' }}>
          <Box>
            <PageTitle>
              <FormattedMessage id="fiscal-year-rollover" defaultMessage="Fiscal Year Rollover" />
            </PageTitle>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1, maxWidth: 860 }}>
              <FormattedMessage
                id="fiscal-year-rollover-description"
                defaultMessage="Create the next fiscal year directly from the closed source year. The backend derives the dates, periods, and continuity checks so the rollover stays ledger-safe."
              />
            </Typography>
          </Box>
          <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
            <Chip color={preview.canRollOver ? 'success' : 'default'} label={preview.canRollOver ? intl.formatMessage({ id: 'ready-to-rollover', defaultMessage: 'Ready to roll over' }) : intl.formatMessage({ id: 'not-ready-to-rollover', defaultMessage: 'Not ready' })} />
            <Button variant="outlined" onClick={() => navigate('/accounting/periods')} startIcon={<IconArrowBackUp size={18} />}>
              <FormattedMessage id="back-to-periods" defaultMessage="Back to periods" />
            </Button>
          </Stack>
        </Box>

        {previewError && (
          <Card sx={{ p: 2, borderRadius: 3, border: '1px solid', borderColor: 'error.light' }}>
            <Typography color="error">
              {previewError instanceof Error ? previewError.message : intl.formatMessage({ id: 'fiscal-year-rollover-load-failed', defaultMessage: 'Failed to load fiscal year rollover details.' })}
            </Typography>
          </Card>
        )}

        {historyError && (
          <Card sx={{ p: 2, borderRadius: 3, border: '1px solid', borderColor: 'error.light' }}>
            <Typography color="error">
              {historyError instanceof Error ? historyError.message : intl.formatMessage({ id: 'fiscal-year-rollover-history-load-failed', defaultMessage: 'Failed to load fiscal year rollover history.' })}
            </Typography>
          </Card>
        )}

        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
          <Card sx={{ p: 2.5, flex: 1, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
            <Typography variant="overline" color="text.secondary">
              <FormattedMessage id="source-fiscal-year" defaultMessage="Source Fiscal Year" />
            </Typography>
            <Typography variant="h5" fontWeight={800} sx={{ mt: 0.5 }}>
              {getDisplayLabel(intl.locale, preview.fiscalYearNameArabic, preview.fiscalYearNameEnglish)}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              {formatDate(intl.locale, preview.sourceStartDate)} - {formatDate(intl.locale, preview.sourceEndDate)}
            </Typography>
          </Card>
          <Card sx={{ p: 2.5, flex: 1, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
            <Typography variant="overline" color="text.secondary">
              <FormattedMessage id="target-fiscal-year" defaultMessage="Target Fiscal Year" />
            </Typography>
            <Typography variant="h5" fontWeight={800} sx={{ mt: 0.5 }}>
              {formatDate(intl.locale, preview.targetStartDate)} - {formatDate(intl.locale, preview.targetEndDate)}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              <FormattedMessage id="generated-from-source-year" defaultMessage="Generated from the closed source year." />
            </Typography>
          </Card>
          <Card sx={{ p: 2.5, flex: 1, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
            <Typography variant="overline" color="text.secondary">
              <FormattedMessage id="period-summary" defaultMessage="Period Summary" />
            </Typography>
            <Typography variant="h5" fontWeight={800} sx={{ mt: 0.5 }}>
              {preview.periodCount} <FormattedMessage id="periods" defaultMessage="periods" />
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              {preview.allPeriodsClosed ? (
                <FormattedMessage id="all-periods-closed" defaultMessage="All periods are closed." />
              ) : (
                <FormattedMessage id="periods-not-closed" defaultMessage="All periods must be closed." />
              )}
            </Typography>
          </Card>
        </Stack>

        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
          <Card sx={{ p: 2.5, flex: 1, borderRadius: 3 }}>
            <Typography variant="overline" color="text.secondary">
              <FormattedMessage id="opening-balance-continuity" defaultMessage="Opening balance continuity" />
            </Typography>
            <Typography variant="h5" fontWeight={800} sx={{ mt: 0.5 }}>
              {formatMoney(intl.locale, preview.openingBalanceDifference)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              <FormattedMessage id="difference-must-be-zero" defaultMessage="Difference must be zero before the rollover can proceed." />
            </Typography>
          </Card>
          <Card sx={{ p: 2.5, flex: 1, borderRadius: 3 }}>
            <Typography variant="overline" color="text.secondary">
              <FormattedMessage id="nominal-account-closure" defaultMessage="Nominal account closure" />
            </Typography>
            <Typography variant="h5" fontWeight={800} sx={{ mt: 0.5 }}>
              {formatMoney(intl.locale, preview.nominalClosureDifference)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              <FormattedMessage id="difference-must-be-zero" defaultMessage="Difference must be zero before the rollover can proceed." />
            </Typography>
          </Card>
          <Card sx={{ p: 2.5, flex: 1, borderRadius: 3 }}>
            <Typography variant="overline" color="text.secondary">
              <FormattedMessage id="status" />
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mt: 1 }}>
              <Chip color={preview.isYearEndClosed ? 'success' : 'default'} label={preview.isYearEndClosed ? intl.formatMessage({ id: 'year-end-closed', defaultMessage: 'Year-end closed' }) : intl.formatMessage({ id: 'year-end-open', defaultMessage: 'Year-end open' })} />
              <Chip color={preview.hasDraftJournalEntries ? 'warning' : 'success'} label={preview.hasDraftJournalEntries ? intl.formatMessage({ id: 'draft-entries-found', defaultMessage: 'Draft entries found' }) : intl.formatMessage({ id: 'no-draft-entries', defaultMessage: 'No draft entries' })} />
              <Chip color={preview.hasActivity ? 'info' : 'default'} label={preview.hasActivity ? intl.formatMessage({ id: 'activity-found', defaultMessage: 'Activity found' }) : intl.formatMessage({ id: 'no-activity', defaultMessage: 'No activity' })} />
              <Chip color={preview.hasExistingActiveRollover ? 'warning' : 'default'} label={preview.hasExistingActiveRollover ? intl.formatMessage({ id: 'active-rollover-exists', defaultMessage: 'Active rollover exists' }) : intl.formatMessage({ id: 'no-active-rollover', defaultMessage: 'No active rollover' })} />
            </Stack>
          </Card>
        </Stack>

        <Card sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
          <Stack spacing={2}>
            <Typography variant="h6" fontWeight={700}>
              <FormattedMessage id="rollover-reason" defaultMessage="Rollover Reason" />
            </Typography>
            <TextField
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              fullWidth
              multiline
              minRows={3}
              label={<FormattedMessage id="reason" defaultMessage="Reason" />}
              placeholder={intl.formatMessage({ id: 'enter-rollover-reason', defaultMessage: 'Enter the reason for creating or rolling back the next fiscal year.' })}
            />
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={1} alignItems={{ xs: 'stretch', md: 'center' }}>
              <Button
                variant="contained"
                startIcon={<IconArrowRight size={18} />}
                onClick={handleCreate}
                disabled={!canRollOver || !preview.canRollOver || isCreating || !reason.trim()}
              >
                <FormattedMessage id="create-next-year" defaultMessage="Create Next Year" />
              </Button>
              <Button
                variant="outlined"
                color="warning"
                startIcon={<IconRotateClockwise2 size={18} />}
                onClick={handleRollback}
                disabled={!canRollback || !preview.canRollback || isRollingBack || !reason.trim()}
              >
                <FormattedMessage id="rollback-rollover" defaultMessage="Rollback Rollover" />
              </Button>
              <Button variant="text" startIcon={<IconRefresh size={18} />} onClick={refresh}>
                <FormattedMessage id="refresh" defaultMessage="Refresh" />
              </Button>
            </Stack>
          </Stack>
        </Card>

        {preview.blockingIssues.length > 0 && (
          <Card sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'warning.light', bgcolor: 'warning.lighter' }}>
            <Stack spacing={1.5}>
              <Typography variant="h6" fontWeight={700} color="warning.dark">
                <FormattedMessage id="blocking-issues" defaultMessage="Blocking Issues" />
              </Typography>
              {preview.blockingIssues.map((issue) => (
                <Typography key={issue} variant="body2" color="warning.dark">
                  {issue}
                </Typography>
              ))}
            </Stack>
          </Card>
        )}

        <MainCard contentSX={{ p: 0 }}>
          <Box sx={{ p: 3, borderBottom: '1px solid', borderColor: 'divider' }}>
            <Typography variant="h6" fontWeight={700}>
              <FormattedMessage id="generated-periods" defaultMessage="Generated Periods" />
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              <FormattedMessage id="generated-periods-description" defaultMessage="The backend shifts the 12 source periods by one year and keeps the period structure intact." />
            </Typography>
          </Box>
          <Box sx={{ overflowX: 'auto' }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>
                    <FormattedMessage id="period-number" defaultMessage="Period" />
                  </TableCell>
                  <TableCell>
                    <FormattedMessage id="date-range" defaultMessage="Date Range" />
                  </TableCell>
                  <TableCell>
                    <FormattedMessage id="name" defaultMessage="Name" />
                  </TableCell>
                  <TableCell align="right">
                    <FormattedMessage id="status" />
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {preview.targetPeriods.map((period) => (
                  <TableRow key={period.periodNumber} hover>
                    <TableCell sx={{ minWidth: 120 }}>
                      <Typography fontWeight={700}>{period.periodNumber}</Typography>
                    </TableCell>
                    <TableCell sx={{ minWidth: 260 }}>
                      <Typography variant="body2">
                        {formatDate(intl.locale, period.startDate)} - {formatDate(intl.locale, period.endDate)}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ minWidth: 260 }}>
                      <Stack spacing={0.25}>
                        <Typography fontWeight={600}>{getDisplayLabel(intl.locale, period.nameArabic, period.nameEnglish)}</Typography>
                        {period.nameEnglish && (
                          <Typography variant="caption" color="text.secondary">
                            {period.nameEnglish}
                          </Typography>
                        )}
                      </Stack>
                    </TableCell>
                    <TableCell align="right">
                      <Chip size="small" color="default" label={intl.formatMessage({ id: 'open', defaultMessage: 'Open' })} icon={<IconCheck size={14} />} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>
        </MainCard>

        <MainCard contentSX={{ p: 0 }}>
          <Box sx={{ p: 3, borderBottom: '1px solid', borderColor: 'divider' }}>
            <Stack spacing={0.5}>
              <Typography variant="h6" fontWeight={700}>
                <FormattedMessage id="rollover-history" defaultMessage="Rollover History" />
              </Typography>
              <Typography variant="body2" color="text.secondary">
                <FormattedMessage id="rollover-history-description" defaultMessage="Each rollover remains auditable, even if an unused rollover is rolled back later." />
              </Typography>
            </Stack>
          </Box>
          <Box sx={{ overflowX: 'auto' }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>
                    <FormattedMessage id="status" />
                  </TableCell>
                  <TableCell>
                    <FormattedMessage id="created-at" defaultMessage="Created At" />
                  </TableCell>
                  <TableCell>
                    <FormattedMessage id="rollback-at" defaultMessage="Rollback At" />
                  </TableCell>
                  <TableCell>
                    <FormattedMessage id="reason" defaultMessage="Reason" />
                  </TableCell>
                  <TableCell>
                    <FormattedMessage id="rollback-reason" defaultMessage="Rollback Reason" />
                  </TableCell>
                  <TableCell align="right">
                    <FormattedMessage id="opening-balance-continuity" defaultMessage="Opening balance continuity" />
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {history.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                      <Typography color="text.secondary">
                        <FormattedMessage id="no-rollover-history" defaultMessage="No rollover history has been recorded yet." />
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  history.map((item) => (
                    <TableRow key={item.id} hover>
                      <TableCell>
                        <Stack spacing={0.25}>
                          <Chip size="small" color={getStatusColor(item.status)} label={item.statusLabel} />
                          <Typography variant="caption" color="text.secondary">
                            {getDisplayLabel(intl.locale, item.sourceFiscalYearNameArabic, item.sourceFiscalYearNameEnglish)}
                          </Typography>
                        </Stack>
                      </TableCell>
                      <TableCell>{formatDate(intl.locale, item.createdAtUtc)}</TableCell>
                      <TableCell>{item.rolledBackAtUtc ? formatDate(intl.locale, item.rolledBackAtUtc) : '—'}</TableCell>
                      <TableCell>{item.reason ?? '—'}</TableCell>
                      <TableCell>{item.rollbackReason ?? '—'}</TableCell>
                      <TableCell align="right">{formatMoney(intl.locale, item.openingBalanceDifference)}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Box>
        </MainCard>
      </Stack>
    </Box>
  );
}
