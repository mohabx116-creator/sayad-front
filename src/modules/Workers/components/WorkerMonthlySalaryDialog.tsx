import { useEffect, useMemo, useState } from 'react';
import { Controller, SubmitHandler, useFieldArray, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { FormattedMessage, useIntl } from 'react-intl';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/GridLegacy';
import IconButton from '@mui/material/IconButton';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { IconPlus, IconTrash, IconX } from '@tabler/icons-react';

import { useDispatch } from 'store';
import { openSnackbar } from 'store/slices/snackbar';
import { createWorkerMonthlySalary, payWorkerMonthlySalary } from '../api/workersApi';
import { useWorkerMonthlySalary } from '../hooks/useWorkers';
import { monthlySalarySchema } from '../schemas/monthlySalary.schema';
import type {
  WorkerMonthlySalaryDto,
  WorkerMonthlySalaryRequest,
  WorkerSalarySettingsDto
} from '../types/workers.types';
import { useTreasuryAccounts } from 'modules/Treasury/hooks/useTreasury';
import type { TreasuryAccountListItem } from 'modules/Treasury/types/treasury.types';
import { TREASURY_ACCOUNT_TYPES } from 'modules/Treasury/utils/treasury.constants';

const numberInputSx = {
  '& input[type=number]': {
    MozAppearance: 'textfield'
  },
  '& input[type=number]::-webkit-outer-spin-button, & input[type=number]::-webkit-inner-spin-button': {
    WebkitAppearance: 'none',
    margin: 0
  }
} as const;

type MonthlySalaryFormValues = {
  year: string;
  month: string;
  calculatedDays: string;
  absenceDays: string;
  normalOvertimeAmount: string;
  nightOvertimeAmount: string;
  bonusAmount: string;
  notes: string;
  deductions: Array<{
    amount: string;
    reason: string;
    source: 'Manager' | 'Accountant';
  }>;
};

type WorkerMonthlySalaryDialogProps = {
  open: boolean;
  mode: 'create' | 'view' | 'pay';
  workerId: string;
  salarySettings?: WorkerSalarySettingsDto | null;
  monthlySalaryId?: string;
  saving?: boolean;
  onClose: () => void;
  onSaved?: (salary: WorkerMonthlySalaryDto) => Promise<void> | void;
};

type WorkerMonthlySalaryPayFormValues = {
  treasuryAccountId: string;
  paymentDate: string;
  notes: string;
};

const currentMonthYear = () => {
  const now = new Date();
  return {
    year: String(now.getFullYear()),
    month: String(now.getMonth() + 1)
  };
};

const emptyValues = (salarySettings?: WorkerSalarySettingsDto | null): MonthlySalaryFormValues => {
  const monthYear = currentMonthYear();
  return {
    year: monthYear.year,
    month: monthYear.month,
    calculatedDays: '26',
    absenceDays: '0',
    normalOvertimeAmount: '0',
    nightOvertimeAmount: '0',
    bonusAmount: '0',
    notes: '',
    deductions: salarySettings ? [] : []
  };
};

const paymentFormDefaults = (): WorkerMonthlySalaryPayFormValues => {
  const now = new Date();
  return {
    treasuryAccountId: '',
    paymentDate: now.toISOString().slice(0, 10),
    notes: ''
  };
};

function parseMoney(value: string) {
  return Number(value || 0);
}

function isCashboxAccount(account: TreasuryAccountListItem) {
  return account.isActive && (account.accountType === TREASURY_ACCOUNT_TYPES.CASH || account.accountType === TREASURY_ACCOUNT_TYPES.PETTY_CASH);
}

function toRequest(values: MonthlySalaryFormValues): WorkerMonthlySalaryRequest {
  return {
    year: Number(values.year),
    month: Number(values.month),
    calculatedDays: Number(values.calculatedDays || 26),
    absenceDays: Number(values.absenceDays || 0),
    normalOvertimeAmount: Number(values.normalOvertimeAmount || 0),
    nightOvertimeAmount: Number(values.nightOvertimeAmount || 0),
    bonusAmount: Number(values.bonusAmount || 0),
    deductions: values.deductions
      .filter((row) => row.reason.trim() !== '' || row.amount.trim() !== '')
      .map((row) => ({
        amount: Number(row.amount || 0),
        reason: row.reason.trim(),
        source: row.source
      })),
    notes: values.notes.trim() || null
  };
}

export function useMonthlySalaryResolver() {
  return zodResolver(monthlySalarySchema);
}

function readOnlyField(label: string, value: string) {
  return (
    <TextField
      fullWidth
      label={label}
      value={value}
      inputProps={{ readOnly: true, dir: 'ltr' }}
      sx={numberInputSx}
    />
  );
}

function MonthlySalarySummary({
  salarySettings,
  values
}: {
  salarySettings: WorkerSalarySettingsDto;
  values: MonthlySalaryFormValues;
}) {
  const dailyWage = salarySettings.dailyWage;
  const mealAllowance = salarySettings.mealAllowance;
  const calculatedDays = Number(values.calculatedDays || 26);
  const absenceDays = Number(values.absenceDays || 0);
  const normalOvertime = parseMoney(values.normalOvertimeAmount);
  const nightOvertime = parseMoney(values.nightOvertimeAmount);
  const bonus = parseMoney(values.bonusAmount);
  const deductionRows = values.deductions.reduce((sum, row) => sum + parseMoney(row.amount), 0);
  const baseSalary = dailyWage * calculatedDays;
  const absenceDeduction = dailyWage * absenceDays;
  const additions = normalOvertime + nightOvertime + bonus;
  const deductions = absenceDeduction + deductionRows;
  const netSalary = baseSalary + mealAllowance + additions - deductions;

  return (
    <Stack spacing={1}>
      <Typography variant="subtitle2" color="text.secondary">
        <FormattedMessage id="monthly-salary-preview" />
      </Typography>
      <Typography variant="h4" dir="ltr">
        {netSalary.toFixed(2)}
      </Typography>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} flexWrap="wrap">
        <Typography variant="body2" color="text.secondary">
          <FormattedMessage id="payroll-basic-wage" />: {baseSalary.toFixed(2)}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          <FormattedMessage id="worker-meal-allowance" />: {mealAllowance.toFixed(2)}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          <FormattedMessage id="total-additions" />: {additions.toFixed(2)}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          <FormattedMessage id="payroll-total-deductions" />: {deductions.toFixed(2)}
        </Typography>
      </Stack>
    </Stack>
  );
}

function SalaryFormContent({
  workerId,
  salarySettings,
  onClose,
  onSaved
}: {
  workerId: string;
  salarySettings: WorkerSalarySettingsDto;
  onClose: () => void;
  onSaved?: (salary: WorkerMonthlySalaryDto) => void;
}) {
  const form = useForm<MonthlySalaryFormValues>({
    resolver: useMonthlySalaryResolver(),
    defaultValues: emptyValues(salarySettings)
  });
  const deductionRows = useFieldArray({ control: form.control, name: 'deductions' });
  const dispatch = useDispatch();
  const intl = useIntl();
  const [isSaving, setIsSaving] = useState(false);

  const values = form.watch();

  useEffect(() => {
    form.reset(emptyValues(salarySettings));
  }, [form, salarySettings]);

  const submit: SubmitHandler<MonthlySalaryFormValues> = async (submitted) => {
    try {
      setIsSaving(true);
      const salary = await createWorkerMonthlySalary(workerId, toRequest(submitted));
      await onSaved?.(salary);
      onClose();
      dispatch(openSnackbar({ open: true, message: intl.formatMessage({ id: 'monthly-salary-action-success' }), variant: 'alert', severity: 'success' }));
    } catch (error) {
      dispatch(openSnackbar({
        open: true,
        message: error instanceof Error ? error.message : intl.formatMessage({ id: 'monthly-salary-action-failed' }),
        variant: 'alert',
        severity: 'error'
      }));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Stack component="form" spacing={2.5} onSubmit={form.handleSubmit(submit)}>
      <Grid container spacing={2.5}>
        <Grid item xs={12} md={4}>
          <Controller
            name="year"
            control={form.control}
            render={({ field, fieldState }) => (
              <TextField
                {...field}
                fullWidth
                type="number"
                label={<FormattedMessage id="year" />}
                error={!!fieldState.error}
                helperText={fieldState.error?.message}
                inputProps={{ min: 2000, max: 3000, dir: 'ltr' }}
                sx={numberInputSx}
                onChange={(event) => field.onChange(event.target.value)}
              />
            )}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <Controller
            name="month"
            control={form.control}
            render={({ field, fieldState }) => (
              <TextField
                {...field}
                fullWidth
                type="number"
                label={<FormattedMessage id="month" />}
                error={!!fieldState.error}
                helperText={fieldState.error?.message}
                inputProps={{ min: 1, max: 12, dir: 'ltr' }}
                sx={numberInputSx}
                onChange={(event) => field.onChange(event.target.value)}
              />
            )}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <Controller
            name="calculatedDays"
            control={form.control}
            render={({ field, fieldState }) => (
              <TextField
                {...field}
                fullWidth
                type="number"
                label={<FormattedMessage id="calculated-days" />}
                error={!!fieldState.error}
                helperText={fieldState.error?.message}
                inputProps={{ min: 1, max: 31, dir: 'ltr' }}
                sx={numberInputSx}
                onChange={(event) => field.onChange(event.target.value)}
              />
            )}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          {readOnlyField(intl.formatMessage({ id: 'daily-wage-snapshot' }), salarySettings.dailyWage.toFixed(2))}
        </Grid>

        <Grid item xs={12} md={4}>
          <Controller
            name="absenceDays"
            control={form.control}
            render={({ field, fieldState }) => (
              <TextField
                {...field}
                fullWidth
                type="number"
                label={<FormattedMessage id="absence-days" />}
                error={!!fieldState.error}
                helperText={fieldState.error?.message}
                inputProps={{ min: 0, step: '0.01', dir: 'ltr' }}
                sx={numberInputSx}
                onChange={(event) => field.onChange(event.target.value)}
              />
            )}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <Controller
            name="normalOvertimeAmount"
            control={form.control}
            render={({ field, fieldState }) => (
              <TextField
                {...field}
                fullWidth
                type="number"
                label={<FormattedMessage id="normal-overtime" />}
                error={!!fieldState.error}
                helperText={fieldState.error?.message}
                inputProps={{ min: 0, step: '0.01', dir: 'ltr' }}
                sx={numberInputSx}
                onChange={(event) => field.onChange(event.target.value)}
              />
            )}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <Controller
            name="nightOvertimeAmount"
            control={form.control}
            render={({ field, fieldState }) => (
              <TextField
                {...field}
                fullWidth
                type="number"
                label={<FormattedMessage id="night-overtime" />}
                error={!!fieldState.error}
                helperText={fieldState.error?.message}
                inputProps={{ min: 0, step: '0.01', dir: 'ltr' }}
                sx={numberInputSx}
                onChange={(event) => field.onChange(event.target.value)}
              />
            )}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <Controller
            name="bonusAmount"
            control={form.control}
            render={({ field, fieldState }) => (
              <TextField
                {...field}
                fullWidth
                type="number"
                label={<FormattedMessage id="bonuses" />}
                error={!!fieldState.error}
                helperText={fieldState.error?.message}
                inputProps={{ min: 0, step: '0.01', dir: 'ltr' }}
                sx={numberInputSx}
                onChange={(event) => field.onChange(event.target.value)}
              />
            )}
          />
        </Grid>
        <Grid item xs={12}>
          <Controller
            name="notes"
            control={form.control}
            render={({ field, fieldState }) => (
              <TextField
                {...field}
                value={field.value ?? ''}
                fullWidth
                multiline
                minRows={2}
                label={<FormattedMessage id="notes" />}
                error={!!fieldState.error}
                helperText={fieldState.error?.message}
              />
            )}
          />
        </Grid>
      </Grid>

      <Box>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
          <Typography variant="h6">
            <FormattedMessage id="deductions" />
          </Typography>
          <Button
            variant="outlined"
            startIcon={<IconPlus size={18} />}
            onClick={() => deductionRows.append({ amount: '', reason: '', source: 'Manager' })}
          >
            <FormattedMessage id="add" />
          </Button>
        </Stack>
        <Divider sx={{ mb: 2 }} />
        {deductionRows.fields.length === 0 ? (
          <Typography color="text.secondary">
            <FormattedMessage id="no-deduction-rows" />
          </Typography>
        ) : (
          <Stack spacing={1.5}>
            {deductionRows.fields.map((field, index) => (
              <Grid container spacing={1.5} key={field.id} alignItems="center">
                <Grid item xs={12} md={3}>
                  <Controller
                    name={`deductions.${index}.amount`}
                    control={form.control}
                    render={({ field: amountField, fieldState }) => (
                      <TextField
                        {...amountField}
                        fullWidth
                        type="number"
                        label={<FormattedMessage id="amount" />}
                        error={!!fieldState.error}
                        helperText={fieldState.error?.message}
                        inputProps={{ min: 0, step: '0.01', dir: 'ltr' }}
                        sx={numberInputSx}
                        onChange={(event) => amountField.onChange(event.target.value)}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} md={5}>
                  <Controller
                    name={`deductions.${index}.reason`}
                    control={form.control}
                    render={({ field: reasonField, fieldState }) => (
                      <TextField
                        {...reasonField}
                        fullWidth
                        label={<FormattedMessage id="deduction-reason" />}
                        error={!!fieldState.error}
                        helperText={fieldState.error?.message}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} md={3}>
                  <Controller
                    name={`deductions.${index}.source`}
                    control={form.control}
                    render={({ field: sourceField, fieldState }) => (
                      <TextField
                        {...sourceField}
                        select
                        fullWidth
                        label={<FormattedMessage id="deduction-source" />}
                        error={!!fieldState.error}
                        helperText={fieldState.error?.message}
                      >
                        <MenuItem value="Manager"><FormattedMessage id="manager" /></MenuItem>
                        <MenuItem value="Accountant"><FormattedMessage id="accountant" /></MenuItem>
                      </TextField>
                    )}
                  />
                </Grid>
                <Grid item xs={12} md={1}>
                  <IconButton onClick={() => deductionRows.remove(index)} aria-label={intl.formatMessage({ id: 'delete' })}>
                    <IconTrash size={18} />
                  </IconButton>
                </Grid>
              </Grid>
            ))}
          </Stack>
        )}
      </Box>

      <MonthlySalarySummary salarySettings={salarySettings} values={values} />

      <DialogActions sx={{ px: 0 }}>
        <Button onClick={onClose}>
          <FormattedMessage id="cancel" />
        </Button>
        <Button variant="contained" type="submit" disabled={isSaving}>
          <FormattedMessage id="save" />
        </Button>
      </DialogActions>
    </Stack>
  );
}

function PaySalaryFormContent({
  workerId,
  salary,
  onClose,
  onSaved
}: {
  workerId: string;
  salary: WorkerMonthlySalaryDto;
  onClose: () => void;
  onSaved?: (salary: WorkerMonthlySalaryDto) => void;
}) {
  const form = useForm<WorkerMonthlySalaryPayFormValues>({
    defaultValues: paymentFormDefaults()
  });
  const dispatch = useDispatch();
  const intl = useIntl();
  const [isSaving, setIsSaving] = useState(false);
  const { items: treasuryAccounts } = useTreasuryAccounts({ page: 1, pageSize: 100, isActive: true });

  const cashboxAccounts = useMemo(() => treasuryAccounts.filter((account: TreasuryAccountListItem) => isCashboxAccount(account)), [treasuryAccounts]);
  const paymentAmount = salary.netSalary;

  useEffect(() => {
    form.reset(paymentFormDefaults());
  }, [form, salary.id]);

  const submit: SubmitHandler<WorkerMonthlySalaryPayFormValues> = async (submitted) => {
    try {
      setIsSaving(true);
      const updated = await payWorkerMonthlySalary(workerId, salary.id, {
        treasuryAccountId: submitted.treasuryAccountId,
        paymentDate: submitted.paymentDate,
        notes: submitted.notes.trim() || null
      });
      await onSaved?.(updated);
      onClose();
      dispatch(openSnackbar({ open: true, message: intl.formatMessage({ id: 'monthly-salary-payment-success' }), variant: 'alert', severity: 'success' }));
    } catch (error) {
      dispatch(openSnackbar({
        open: true,
        message: error instanceof Error ? error.message : intl.formatMessage({ id: 'monthly-salary-payment-failed' }),
        variant: 'alert',
        severity: 'error'
      }));
    } finally {
      setIsSaving(false);
    }
  };

  if (salary.isPaid) {
    return (
      <Stack spacing={2.5}>
        <Typography color="text.secondary">
          <FormattedMessage id="monthly-salary-already-paid" />
        </Typography>
        <DialogActions sx={{ px: 0 }}>
          <Button onClick={onClose}>
            <FormattedMessage id="close" />
          </Button>
        </DialogActions>
      </Stack>
    );
  }

  return (
    <Stack component="form" spacing={2.5} onSubmit={form.handleSubmit(submit)}>
      <Grid container spacing={2.5}>
        <Grid item xs={12} md={4}>
          <Typography variant="body2" color="text.secondary"><FormattedMessage id="worker-name" /></Typography>
          <Typography variant="h6">{salary.workerName}</Typography>
        </Grid>
        <Grid item xs={12} md={4}>
          <Typography variant="body2" color="text.secondary"><FormattedMessage id="month" /></Typography>
          <Typography variant="h6" dir="ltr">{salary.monthLabel}</Typography>
        </Grid>
        <Grid item xs={12} md={4}>
          <Typography variant="body2" color="text.secondary"><FormattedMessage id="net-salary" /></Typography>
          <Typography variant="h6" dir="ltr">{salary.netSalary.toFixed(2)}</Typography>
        </Grid>
        <Grid item xs={12} md={4}>
          {readOnlyField(intl.formatMessage({ id: 'payment-amount' }), paymentAmount.toFixed(2))}
        </Grid>
        <Grid item xs={12} md={4}>
          {readOnlyField(intl.formatMessage({ id: 'worker-meal-allowance' }), salary.mealAllowanceSnapshot.toFixed(2))}
        </Grid>
        <Grid item xs={12} md={4}>
          <Controller
            name="treasuryAccountId"
            control={form.control}
            rules={{ required: true }}
            render={({ field, fieldState }) => (
              <TextField
                {...field}
                select
                fullWidth
                label={<FormattedMessage id="cashbox" />}
                error={!!fieldState.error}
                helperText={fieldState.error ? intl.formatMessage({ id: 'cashbox-required' }) : ' '}
              >
                {cashboxAccounts.length === 0 ? (
                  <MenuItem disabled value="">
                    <FormattedMessage id="no-cashbox-accounts" />
                  </MenuItem>
                ) : cashboxAccounts.map((account) => (
                  <MenuItem key={account.id} value={account.id}>
                    {account.code} - {account.nameArabic}
                  </MenuItem>
                ))}
              </TextField>
            )}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <Controller
            name="paymentDate"
            control={form.control}
            rules={{ required: true }}
            render={({ field, fieldState }) => (
              <TextField
                {...field}
                fullWidth
                type="date"
                label={<FormattedMessage id="payment-date" />}
                error={!!fieldState.error}
                helperText={fieldState.error?.message}
                inputProps={{ dir: 'ltr' }}
              />
            )}
          />
        </Grid>
        <Grid item xs={12}>
          <Controller
            name="notes"
            control={form.control}
            render={({ field, fieldState }) => (
              <TextField
                {...field}
                value={field.value ?? ''}
                fullWidth
                multiline
                minRows={2}
                label={<FormattedMessage id="notes" />}
                error={!!fieldState.error}
                helperText={fieldState.error?.message}
              />
            )}
          />
        </Grid>
      </Grid>

      <DialogActions sx={{ px: 0 }}>
        <Button onClick={onClose}>
          <FormattedMessage id="cancel" />
        </Button>
        <Button variant="contained" type="submit" disabled={isSaving || cashboxAccounts.length === 0}>
          <FormattedMessage id="pay-salary" />
        </Button>
      </DialogActions>
    </Stack>
  );
}

function MonthlySalaryViewContent({
  salary,
  error,
  onClose
}: {
  salary?: WorkerMonthlySalaryDto | null;
  error?: Error | null;
  onClose: () => void;
}) {
  if (error) {
    return (
      <Typography color="error">
        {error.message}
      </Typography>
    );
  }

  if (!salary) {
    return (
      <Typography color="text.secondary">
        <FormattedMessage id="loading" />
      </Typography>
    );
  }

  return (
    <Stack spacing={2.5}>
      <Grid container spacing={2.5}>
        <Grid item xs={12} md={4}>
          <Typography variant="body2" color="text.secondary"><FormattedMessage id="month" /></Typography>
          <Typography variant="h6" dir="ltr">{salary.monthLabel}</Typography>
        </Grid>
        <Grid item xs={12} md={4}>
          <Typography variant="body2" color="text.secondary"><FormattedMessage id="daily-wage-snapshot" /></Typography>
          <Typography variant="h6" dir="ltr">{salary.dailyWageSnapshot.toFixed(2)}</Typography>
        </Grid>

        <Grid item xs={12} md={4}>
          <Typography variant="body2" color="text.secondary"><FormattedMessage id="calculated-days" /></Typography>
          <Typography variant="h6" dir="ltr">{salary.calculatedDays}</Typography>
        </Grid>
        <Grid item xs={12} md={4}>
          <Typography variant="body2" color="text.secondary"><FormattedMessage id="absence-days" /></Typography>
          <Typography variant="h6" dir="ltr">{salary.absenceDays.toFixed(2)}</Typography>
        </Grid>
        <Grid item xs={12} md={4}>
          <Typography variant="body2" color="text.secondary"><FormattedMessage id="net-salary" /></Typography>
          <Typography variant="h6" dir="ltr">{salary.netSalary.toFixed(2)}</Typography>
        </Grid>
        <Grid item xs={12} md={4}>
          <Typography variant="body2" color="text.secondary"><FormattedMessage id="normal-overtime" /></Typography>
          <Typography variant="h6" dir="ltr">{salary.normalOvertimeAmount.toFixed(2)}</Typography>
        </Grid>
        <Grid item xs={12} md={4}>
          <Typography variant="body2" color="text.secondary"><FormattedMessage id="night-overtime" /></Typography>
          <Typography variant="h6" dir="ltr">{salary.nightOvertimeAmount.toFixed(2)}</Typography>
        </Grid>
        <Grid item xs={12} md={4}>
          <Typography variant="body2" color="text.secondary"><FormattedMessage id="bonuses" /></Typography>
          <Typography variant="h6" dir="ltr">{salary.bonusAmount.toFixed(2)}</Typography>
        </Grid>
      </Grid>

      <Grid container spacing={2}>
        <Grid item xs={12} md={3}>
          <Typography variant="body2" color="text.secondary"><FormattedMessage id="payroll-basic-wage" /></Typography>
          <Typography variant="h6" dir="ltr">{salary.baseSalary.toFixed(2)}</Typography>
        </Grid>
        <Grid item xs={12} md={3}>
          <Typography variant="body2" color="text.secondary"><FormattedMessage id="worker-meal-allowance" /></Typography>
          <Typography variant="h6" dir="ltr">{salary.mealAllowanceSnapshot.toFixed(2)}</Typography>
        </Grid>
        <Grid item xs={12} md={3}>
          <Typography variant="body2" color="text.secondary"><FormattedMessage id="total-additions" /></Typography>
          <Typography variant="h6" dir="ltr">{salary.totalAdditions.toFixed(2)}</Typography>
        </Grid>
        <Grid item xs={12} md={3}>
          <Typography variant="body2" color="text.secondary"><FormattedMessage id="payroll-total-deductions" /></Typography>
          <Typography variant="h6" dir="ltr">{salary.totalDeductions.toFixed(2)}</Typography>
        </Grid>
        <Grid item xs={12} md={3}>
          <Typography variant="body2" color="text.secondary"><FormattedMessage id="notes" /></Typography>
          <Typography variant="h6">{salary.notes ?? '-'}</Typography>
        </Grid>
      </Grid>

      <Box>
        <Typography variant="h6" sx={{ mb: 1 }}>
          <FormattedMessage id="salary-details" />
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={3}>
            <Typography variant="body2" color="text.secondary"><FormattedMessage id="salary-status" /></Typography>
            <Typography variant="h6">
              <FormattedMessage id={salary.isPaid ? 'paid' : 'unpaid'} />
            </Typography>
          </Grid>
          <Grid item xs={12} md={3}>
            <Typography variant="body2" color="text.secondary"><FormattedMessage id="payment-date" /></Typography>
            <Typography variant="h6" dir="ltr">{salary.paymentDate ?? '-'}</Typography>
          </Grid>
          <Grid item xs={12} md={3}>
            <Typography variant="body2" color="text.secondary"><FormattedMessage id="cashbox" /></Typography>
            <Typography variant="h6">{salary.treasuryAccountNameArabic ?? '-'}</Typography>
          </Grid>
          <Grid item xs={12} md={3}>
            <Typography variant="body2" color="text.secondary"><FormattedMessage id="paid-amount" /></Typography>
            <Typography variant="h6" dir="ltr">{salary.paidAmount?.toFixed(2) ?? '-'}</Typography>
          </Grid>
          <Grid item xs={12} md={3}>
            <Typography variant="body2" color="text.secondary"><FormattedMessage id="paid-at" /></Typography>
            <Typography variant="h6">{salary.paidAtUtc ? new Date(salary.paidAtUtc).toLocaleString() : '-'}</Typography>
          </Grid>
          <Grid item xs={12} md={3}>
            <Typography variant="body2" color="text.secondary"><FormattedMessage id="treasury-transaction" /></Typography>
            <Typography variant="h6" dir="ltr">{salary.treasuryTransactionReferenceNumber ?? '-'}</Typography>
          </Grid>
        </Grid>
      </Box>

      <Box>
        <Typography variant="h6" sx={{ mb: 1 }}>
          <FormattedMessage id="deductions" />
        </Typography>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell><FormattedMessage id="amount" /></TableCell>
              <TableCell><FormattedMessage id="deduction-reason" /></TableCell>
              <TableCell><FormattedMessage id="deduction-source" /></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {salary.deductions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3}>
                  <Typography color="text.secondary">
                    <FormattedMessage id="no-deduction-rows" />
                  </Typography>
                </TableCell>
              </TableRow>
            ) : salary.deductions.map((row, index) => (
              <TableRow key={`${row.reason}-${index}`}>
                <TableCell dir="ltr">{row.amount.toFixed(2)}</TableCell>
                <TableCell>{row.reason}</TableCell>
                <TableCell>{row.source}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Box>

      <DialogActions sx={{ px: 0 }}>
        <Button onClick={onClose}>
          <FormattedMessage id="close" />
        </Button>
      </DialogActions>
    </Stack>
  );
}

export default function WorkerMonthlySalaryDialog({
  open,
  mode,
  workerId,
  salarySettings,
  monthlySalaryId,
  onClose,
  onSaved
}: WorkerMonthlySalaryDialogProps) {
  const { salary, error, isLoading } = useWorkerMonthlySalary(workerId, monthlySalaryId);

  const title = mode === 'create' ? 'monthly-salary-create' : mode === 'pay' ? 'pay-salary' : 'monthly-salary-view';

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
        <FormattedMessage id={title} />
        <IconButton onClick={onClose}>
          <IconX size={18} />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        {mode === 'create' ? (
          salarySettings ? (
            <SalaryFormContent workerId={workerId} salarySettings={salarySettings} onClose={onClose} onSaved={onSaved} />
          ) : (
            <Typography color="text.secondary">
              <FormattedMessage id="worker-wage-empty" />
            </Typography>
          )
        ) : mode === 'pay' ? (
          isLoading ? (
            <Typography color="text.secondary">
              <FormattedMessage id="loading" />
            </Typography>
          ) : salary ? (
            <PaySalaryFormContent workerId={workerId} salary={salary} onClose={onClose} onSaved={onSaved} />
          ) : (
            <Typography color="error">
              <FormattedMessage id="monthly-salary-not-found" />
            </Typography>
          )
        ) : isLoading ? (
          <Typography color="text.secondary">
            <FormattedMessage id="loading" />
          </Typography>
        ) : (
          <MonthlySalaryViewContent salary={salary} error={error instanceof Error ? error : null} onClose={onClose} />
        )}
      </DialogContent>
    </Dialog>
  );
}
