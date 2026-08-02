import { useEffect, useMemo } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FormattedMessage, useIntl } from 'react-intl';

import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';

import { createCustomerReceipt, createSupplierPayment } from '../api/partiesApi';
import { useCashboxAccounts } from 'modules/Treasury/hooks/useTreasury';
import type { PartyCashTransactionRequest } from '../types/parties.types';
import { useDispatch } from 'store';
import { openSnackbar } from 'store/slices/snackbar';

type PartyCashTransactionMode = 'receipt' | 'payment';

type PartyCashTransactionDialogProps = {
  open: boolean;
  mode: PartyCashTransactionMode;
  partyId: string;
  partyName: string;
  onClose: () => void;
  onSaved?: () => Promise<void> | void;
};

type PartyCashTransactionFormValues = {
  treasuryAccountId: string;
  transactionDate: string;
  amount: string;
  notes: string;
};

function getLocalDateInputValue() {
  const now = new Date();
  const offsetMinutes = now.getTimezoneOffset();
  return new Date(now.getTime() - offsetMinutes * 60_000).toISOString().slice(0, 10);
}

function buildSchema(intl: ReturnType<typeof useIntl>) {
  return z.object({
    treasuryAccountId: z.string().min(1, intl.formatMessage({ id: 'cashbox-required' })),
    transactionDate: z.string().min(1, intl.formatMessage({ id: 'party-cash-transaction-date-required' })),
    amount: z
      .string()
      .min(1, intl.formatMessage({ id: 'payment-amount-required' }))
      .refine((value) => Number(value) > 0, intl.formatMessage({ id: 'party-cash-transaction-amount-positive' })),
    notes: z.string().max(1000, intl.formatMessage({ id: 'party-cash-transaction-notes-too-long' }))
  });
}

export default function PartyCashTransactionDialog({ open, mode, partyId, partyName, onClose, onSaved }: PartyCashTransactionDialogProps) {
  const intl = useIntl();
  const dispatch = useDispatch();
  const { items: cashboxes, isLoading } = useCashboxAccounts();
  const schema = useMemo(() => buildSchema(intl), [intl]);
  const form = useForm<PartyCashTransactionFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      treasuryAccountId: '',
      transactionDate: getLocalDateInputValue(),
      amount: '',
      notes: ''
    }
  });

  useEffect(() => {
    if (!open) {
      return;
    }

    form.reset({
      treasuryAccountId: cashboxes[0]?.id ?? '',
      transactionDate: getLocalDateInputValue(),
      amount: '',
      notes: ''
    });
  }, [cashboxes, form, open]);

  const notify = (message: string, severity: 'success' | 'error' = 'success') => {
    dispatch(openSnackbar({ open: true, message, variant: 'alert', severity }));
  };

  const submit = async (values: PartyCashTransactionFormValues) => {
    const request: PartyCashTransactionRequest = {
      treasuryAccountId: values.treasuryAccountId,
      transactionDate: values.transactionDate,
      amount: Number(values.amount),
      notes: values.notes.trim() || null
    };

    try {
      if (mode === 'receipt') {
        await createCustomerReceipt(partyId, request);
        notify(intl.formatMessage({ id: 'party-customer-receipt-success' }));
      } else {
        await createSupplierPayment(partyId, request);
        notify(intl.formatMessage({ id: 'party-supplier-payment-success' }));
      }

      await onSaved?.();
      onClose();
    } catch (error) {
      notify(error instanceof Error ? error.message : intl.formatMessage({ id: mode === 'receipt' ? 'party-customer-receipt-failed' : 'party-supplier-payment-failed' }), 'error');
    }
  };

  const submitLabel = mode === 'receipt' ? 'party-customer-receipt-submit' : 'party-supplier-payment-submit';
  const titleLabel = mode === 'receipt' ? 'party-customer-receipt-title' : 'party-supplier-payment-title';
  const helperLabel = mode === 'receipt' ? 'party-customer-receipt-help' : 'party-supplier-payment-help';
  const dateLabel = mode === 'receipt' ? 'receipt-date' : 'payment-date';

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <Stack component="form" onSubmit={form.handleSubmit(submit)}>
        <DialogTitle>
          <FormattedMessage id={titleLabel} values={{ partyName }} />
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2.5} sx={{ pt: 1 }}>
            <DialogContentText>
              <FormattedMessage id={helperLabel} values={{ partyName }} />
            </DialogContentText>

            <Controller
              name="transactionDate"
              control={form.control}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  type="date"
                  fullWidth
                  label={<FormattedMessage id={dateLabel} />}
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                  InputLabelProps={{ shrink: true }}
                />
              )}
            />

            <Controller
              name="amount"
              control={form.control}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  fullWidth
                  type="number"
                  inputProps={{ min: 0, step: '0.01' }}
                  label={<FormattedMessage id="payment-amount" />}
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                />
              )}
            />

            <Controller
              name="treasuryAccountId"
              control={form.control}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  fullWidth
                  select
                  label={<FormattedMessage id="cashbox" />}
                  error={!!fieldState.error}
                  helperText={
                    fieldState.error?.message ??
                    (isLoading
                      ? intl.formatMessage({ id: 'loading' })
                      : cashboxes.length === 0
                        ? intl.formatMessage({ id: 'no-cashbox-accounts' })
                        : '')
                  }
                  disabled={isLoading || cashboxes.length === 0}
                >
                  {cashboxes.map((account) => (
                    <MenuItem key={account.id} value={account.id}>
                      {account.code} - {account.nameArabic}
                    </MenuItem>
                  ))}
                </TextField>
              )}
            />

            <Controller
              name="notes"
              control={form.control}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  value={field.value ?? ''}
                  fullWidth
                  multiline
                  minRows={3}
                  label={<FormattedMessage id="notes" />}
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                />
              )}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={onClose} color="inherit" type="button">
            <FormattedMessage id="cancel" />
          </Button>
          <Button variant="contained" type="submit" disabled={form.formState.isSubmitting || isLoading || cashboxes.length === 0}>
            <FormattedMessage id={submitLabel} />
          </Button>
        </DialogActions>
      </Stack>
    </Dialog>
  );
}
