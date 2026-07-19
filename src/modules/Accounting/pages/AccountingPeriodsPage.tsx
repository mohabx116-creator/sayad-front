import { useMemo, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import FormControlLabel from '@mui/material/FormControlLabel';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import { IconCheck, IconPlus, IconRotateClockwise2, IconX } from '@tabler/icons-react';

import { useDispatch } from 'store';
import { openSnackbar } from 'store/slices/snackbar';
import useAuth from 'hooks/useAuth';
import { hasPermission } from 'modules/Administration/utils/permission-utils';
import Breadcrumbs from 'ui-component/extended/Breadcrumbs';
import Loader from 'ui-component/Loader';
import MainCard from 'ui-component/cards/MainCard';
import PageTitle from 'ui-component/PageTitle';

import {
  closeAccountingPeriod,
  createAccountingFiscalYear,
  reopenAccountingPeriod,
  updateAccountingPeriodControl
} from '../api/accountingPeriodsApi';
import { useAccountingFiscalYears, useAccountingPeriodControl } from '../hooks/useAccountingPeriods';
import { ACCOUNTING_PERMISSIONS } from '../utils/accounting.constants';
import type { AccountingFiscalYearInput } from '../types/accounting-periods.types';

type CreateFormState = AccountingFiscalYearInput;

function getDisplayLabel(locale: string, labelArabic: string, labelEnglish: string) {
  return locale.toLowerCase().startsWith('ar') ? labelArabic : labelEnglish;
}

function toInputDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

function toDateLabel(locale: string, date: string) {
  return new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(new Date(date));
}

function createDefaultForm(): CreateFormState {
  const today = new Date();
  const startDate = new Date(today.getFullYear(), 0, 1);
  const endDate = new Date(today.getFullYear(), 11, 31);

  return {
    nameArabic: '',
    nameEnglish: '',
    startDate: toInputDate(startDate),
    endDate: toInputDate(endDate),
    periodCount: 12
  };
}

export default function AccountingPeriodsPage() {
  const intl = useIntl();
  const dispatch = useDispatch();
  const { user } = useAuth();

  const { control, isLoading: controlLoading, error: controlError, mutate: mutateControl } = useAccountingPeriodControl();
  const { years, isLoading: yearsLoading, error: yearsError, mutate: mutateYears } = useAccountingFiscalYears();

  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState<CreateFormState>(() => createDefaultForm());
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdatingControl, setIsUpdatingControl] = useState(false);
  const [pendingPeriodId, setPendingPeriodId] = useState<string | null>(null);

  const isLoading = controlLoading || yearsLoading;
  const controlLabel = control?.isEnabled ? intl.formatMessage({ id: 'enabled', defaultMessage: 'Enabled' }) : intl.formatMessage({ id: 'disabled', defaultMessage: 'Disabled' });
  const canToggleControl = Boolean(control);
  const canManagePeriods = hasPermission(user, ACCOUNTING_PERMISSIONS.periodsManage);
  const canReopenPeriods = hasPermission(user, ACCOUNTING_PERMISSIONS.periodsReopen);
  const periodCount = useMemo(() => years.reduce((sum, year) => sum + year.periods.length, 0), [years]);

  const notify = (message: string, severity: 'success' | 'error' = 'success') => {
    dispatch(openSnackbar({ open: true, message, variant: 'alert', severity }));
  };

  const refresh = async () => {
    await Promise.all([mutateControl(), mutateYears()]);
  };

  const handleToggleControl = async () => {
    if (!control) {
      return;
    }

    const nextState = !control.isEnabled;
    const reason = nextState
      ? null
      : window.prompt(intl.formatMessage({ id: 'period-control-disable-reason', defaultMessage: 'Please enter a reason for disabling period control.' }))?.trim();

    if (!nextState && !reason) {
      return;
    }

    setIsUpdatingControl(true);
    try {
      await updateAccountingPeriodControl({ isEnabled: nextState, rowVersion: control.rowVersion, reason });
      await refresh();
      notify(
        nextState
          ? intl.formatMessage({ id: 'period-control-disabled-success', defaultMessage: 'Period control disabled successfully.' })
          : intl.formatMessage({ id: 'period-control-enabled-success', defaultMessage: 'Period control enabled successfully.' })
      );
    } catch (error) {
      notify(
        error instanceof Error
          ? error.message
          : intl.formatMessage({ id: 'period-control-update-failed', defaultMessage: 'Period control update failed.' }),
        'error'
      );
    } finally {
      setIsUpdatingControl(false);
    }
  };

  const handleCreateFiscalYear = async () => {
    setIsCreating(true);
    try {
      await createAccountingFiscalYear({
        nameArabic: createForm.nameArabic.trim(),
        nameEnglish: (createForm.nameEnglish ?? '').trim() || null,
        startDate: createForm.startDate,
        endDate: createForm.endDate,
        periodCount: createForm.periodCount
      });
      await refresh();
      setCreateOpen(false);
      setCreateForm(createDefaultForm());
      notify(intl.formatMessage({ id: 'fiscal-year-created-successfully', defaultMessage: 'Fiscal year created successfully.' }));
    } catch (error) {
      notify(error instanceof Error ? error.message : intl.formatMessage({ id: 'fiscal-year-create-failed', defaultMessage: 'Fiscal year creation failed.' }), 'error');
    } finally {
      setIsCreating(false);
    }
  };

  const handlePeriodAction = async (periodId: string, rowVersion: string, action: 'close' | 'reopen') => {
    setPendingPeriodId(periodId);
    try {
      if (action === 'close') {
        const reason = window.prompt(intl.formatMessage({ id: 'period-close-reason', defaultMessage: 'Please enter a reason for closing this period.' }))?.trim();
        if (!reason) {
          return;
        }

        await closeAccountingPeriod(periodId, rowVersion, reason);
        notify(intl.formatMessage({ id: 'period-closed-successfully', defaultMessage: 'Accounting period closed successfully.' }));
      } else {
        if (!canReopenPeriods) {
          notify(intl.formatMessage({ id: 'period-reopen-forbidden', defaultMessage: 'You do not have permission to reopen periods.' }), 'error');
          return;
        }

        const reason = window.prompt(intl.formatMessage({ id: 'period-reopen-reason', defaultMessage: 'Please enter a reason for reopening this period.' }))?.trim();
        if (!reason) {
          return;
        }

        await reopenAccountingPeriod(periodId, { rowVersion, reason });
        notify(intl.formatMessage({ id: 'period-reopened-successfully', defaultMessage: 'Accounting period reopened successfully.' }));
      }

      await refresh();
    } catch (error) {
      notify(error instanceof Error ? error.message : intl.formatMessage({ id: 'period-action-failed', defaultMessage: 'Period action failed.' }), 'error');
    } finally {
      setPendingPeriodId(null);
    }
  };

  if (isLoading) {
    return <Loader />;
  }

  return (
    <Box>
      <Breadcrumbs custom heading="fiscal-period-control" links={[{ title: 'general-ledger', to: '/accounting' }, { title: 'fiscal-period-control' }]} />
      <Stack spacing={3}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 2, flexWrap: 'wrap' }}>
          <Box>
            <PageTitle>
              <FormattedMessage id="fiscal-period-control" defaultMessage="Fiscal Period Control" />
            </PageTitle>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              <FormattedMessage
                id="fiscal-period-control-description"
                defaultMessage="Create fiscal years, review their periods, and lock or unlock posting through one central control."
              />
            </Typography>
          </Box>
          <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
            <Chip color={control?.isEnabled ? 'success' : 'default'} label={controlLabel} />
            <Button variant="outlined" onClick={() => setCreateOpen(true)} startIcon={<IconPlus size={18} />} disabled={!canManagePeriods}>
              <FormattedMessage id="create-fiscal-year" defaultMessage="Create Fiscal Year" />
            </Button>
          </Stack>
        </Box>

        {controlError && (
          <Card sx={{ p: 2, borderRadius: 3, border: '1px solid', borderColor: 'error.light' }}>
            <Typography color="error">
              {controlError instanceof Error ? controlError.message : intl.formatMessage({ id: 'period-control-load-failed', defaultMessage: 'Failed to load period control.' })}
            </Typography>
          </Card>
        )}

        {yearsError && (
          <Card sx={{ p: 2, borderRadius: 3, border: '1px solid', borderColor: 'error.light' }}>
            <Typography color="error">
              {yearsError instanceof Error ? yearsError.message : intl.formatMessage({ id: 'fiscal-years-load-failed', defaultMessage: 'Failed to load fiscal years.' })}
            </Typography>
          </Card>
        )}

        <Card sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
          <Stack spacing={2}>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'center' }}>
              <Box>
                <Typography variant="h6" fontWeight={700}>
                  <FormattedMessage id="period-control" defaultMessage="Period Control" />
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  <FormattedMessage
                    id="period-control-summary"
                    defaultMessage="When enabled, journal entries and reversals must use an open accounting period that matches the entry date."
                  />
                </Typography>
              </Box>
              <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                <Chip
                  color={control?.isEnabled ? 'success' : 'default'}
                  label={control?.isEnabled ? intl.formatMessage({ id: 'period-control-enabled', defaultMessage: 'Control enabled' }) : intl.formatMessage({ id: 'period-control-disabled', defaultMessage: 'Control disabled' })}
                />
                <FormControlLabel
                  control={<Switch checked={control?.isEnabled ?? false} onChange={handleToggleControl} disabled={!canToggleControl || isUpdatingControl || !canManagePeriods} />}
                  label={intl.formatMessage({ id: 'toggle', defaultMessage: 'Toggle' })}
                />
              </Stack>
            </Stack>
          </Stack>
        </Card>

        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
          <Card sx={{ p: 2.5, flex: 1, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
            <Typography variant="overline" color="text.secondary">
              <FormattedMessage id="fiscal-years" defaultMessage="Fiscal Years" />
            </Typography>
            <Typography variant="h4" fontWeight={800}>
              {years.length}
            </Typography>
          </Card>
          <Card sx={{ p: 2.5, flex: 1, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
            <Typography variant="overline" color="text.secondary">
              <FormattedMessage id="accounting-periods" defaultMessage="Accounting Periods" />
            </Typography>
            <Typography variant="h4" fontWeight={800}>
              {periodCount}
            </Typography>
          </Card>
        </Stack>

        <Stack spacing={2}>
          {years.length === 0 ? (
            <Card sx={{ p: 3, borderRadius: 3, border: '1px dashed', borderColor: 'divider' }}>
              <Typography color="text.secondary">
                <FormattedMessage id="no-fiscal-years" defaultMessage="No fiscal years have been created yet." />
              </Typography>
            </Card>
          ) : (
            years.map((year) => (
              <MainCard key={year.id} contentSX={{ p: 0 }}>
                <Box sx={{ p: 3, borderBottom: '1px solid', borderColor: 'divider' }}>
                  <Stack spacing={1.5} direction={{ xs: 'column', md: 'row' }} alignItems={{ xs: 'flex-start', md: 'center' }} justifyContent="space-between">
                    <Box>
                      <Typography variant="h5" fontWeight={800}>
                        {getDisplayLabel(intl.locale, year.nameArabic, year.nameEnglish ?? year.nameArabic)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                        {toDateLabel(intl.locale, year.startDate)} - {toDateLabel(intl.locale, year.endDate)}
                      </Typography>
                    </Box>
                    <Stack direction="row" spacing={1} flexWrap="wrap" alignItems="center">
                      <Chip color="success" label={`${year.openPeriodsCount} ${intl.formatMessage({ id: 'open-periods', defaultMessage: 'open' })}`} />
                      <Chip color="default" label={`${year.closedPeriodsCount} ${intl.formatMessage({ id: 'closed-periods', defaultMessage: 'closed' })}`} />
                      <Chip variant="outlined" label={`${year.periods.length} ${intl.formatMessage({ id: 'periods', defaultMessage: 'periods' })}`} />
                    </Stack>
                  </Stack>
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
                          <FormattedMessage id="status" />
                        </TableCell>
                        <TableCell align="right">
                          <FormattedMessage id="actions" />
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {year.periods.map((period) => (
                        <TableRow key={period.id} hover>
                          <TableCell sx={{ minWidth: 180 }}>
                            <Stack spacing={0.5}>
                              <Typography fontWeight={700}>{period.periodNumber}</Typography>
                              <Typography variant="caption" color="text.secondary">
                                {getDisplayLabel(intl.locale, period.nameArabic, period.nameEnglish ?? period.nameArabic)}
                              </Typography>
                            </Stack>
                          </TableCell>
                          <TableCell sx={{ minWidth: 260 }}>
                            <Typography variant="body2">
                              {toDateLabel(intl.locale, period.startDate)} - {toDateLabel(intl.locale, period.endDate)}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip
                              size="small"
                              color={period.status === 'Open' ? 'success' : 'default'}
                              label={period.status === 'Open' ? intl.formatMessage({ id: 'open', defaultMessage: 'Open' }) : intl.formatMessage({ id: 'closed', defaultMessage: 'Closed' })}
                              icon={period.status === 'Open' ? <IconCheck size={14} /> : <IconX size={14} />}
                            />
                          </TableCell>
                          <TableCell align="right">
                            <Button
                              variant={period.status === 'Open' ? 'outlined' : 'contained'}
                              size="small"
                              onClick={() => handlePeriodAction(period.id, period.rowVersion, period.status === 'Open' ? 'close' : 'reopen')}
                              disabled={pendingPeriodId === period.id || (period.status === 'Open' && !canManagePeriods) || (period.status === 'Closed' && !canReopenPeriods)}
                              startIcon={period.status === 'Open' ? <IconX size={16} /> : <IconRotateClockwise2 size={16} />}
                            >
                              {period.status === 'Open' ? (
                                <FormattedMessage id="close" defaultMessage="Close" />
                              ) : (
                                <FormattedMessage id="reopen" defaultMessage="Reopen" />
                              )}
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Box>
              </MainCard>
            ))
          )}
        </Stack>
      </Stack>

      <Dialog open={createOpen} onClose={() => setCreateOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>
          <FormattedMessage id="create-fiscal-year" defaultMessage="Create Fiscal Year" />
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <TextField
              label={<FormattedMessage id="name-arabic" defaultMessage="Arabic Name" />}
              value={createForm.nameArabic}
              onChange={(event) => setCreateForm((current) => ({ ...current, nameArabic: event.target.value }))}
              fullWidth
              required
            />
            <TextField
              label={<FormattedMessage id="name-english" defaultMessage="English Name" />}
              value={createForm.nameEnglish ?? ''}
              onChange={(event) => setCreateForm((current) => ({ ...current, nameEnglish: event.target.value }))}
              fullWidth
            />
            <TextField
              label={<FormattedMessage id="start-date" defaultMessage="Start Date" />}
              type="date"
              value={createForm.startDate}
              onChange={(event) => setCreateForm((current) => ({ ...current, startDate: event.target.value }))}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label={<FormattedMessage id="end-date" defaultMessage="End Date" />}
              type="date"
              value={createForm.endDate}
              onChange={(event) => setCreateForm((current) => ({ ...current, endDate: event.target.value }))}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label={<FormattedMessage id="period-count" defaultMessage="Period Count" />}
              type="number"
              value={createForm.periodCount}
              onChange={(event) => setCreateForm((current) => ({ ...current, periodCount: Number(event.target.value) }))}
              fullWidth
              inputProps={{ min: 1, max: 24 }}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateOpen(false)}>
            <FormattedMessage id="cancel" />
          </Button>
          <Button variant="contained" onClick={handleCreateFiscalYear} disabled={isCreating || !createForm.nameArabic.trim()}>
            <FormattedMessage id="create" />
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
