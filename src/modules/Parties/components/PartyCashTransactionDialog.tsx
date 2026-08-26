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

import { useCashboxAccounts } from 'modules/Treasury/hooks/useTreasury';
import type { PartySettlementAllocationRequest, PartySettlementDirection, PartySettlementRequest } from '../types/parties.types';
import { usePartySettlementActions } from '../hooks/usePartySettlements';
import { useDispatch } from 'store';
import { openSnackbar } from 'store/slices/snackbar';

type PartyCashTransactionMode = 'receipt' | 'payment';

type PartyCashTransactionCopy = {
  titleLabel: string;
  helpLabel: string;
  submitLabel: string;
  successLabel: string;
  failureLabel: string;
  dateLabel: string;
  defaultDescription: string;
};

type PartyCashTransactionDialogProps = {
  open: boolean;
  mode: PartyCashTransactionMode;
  partyId: string;
  partyName: string;
  settlementDirection?: PartySettlementDirection;
  settlementAmount?: number;
  settlementDescriptionArabic?: string | null;
  settlementDescriptionEnglish?: string | null;
  settlementReferenceNumber?: string | null;
  buildAllocations?: (amount: number) => PartySettlementAllocationRequest[];
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

function resolveDirection(mode: PartyCashTransactionMode, settlementDirection?: PartySettlementDirection) {
  return settlementDirection ?? (mode === 'receipt' ? 'CustomerReceipt' : 'SupplierPayment');
}

function getSettlementCopy(mode: PartyCashTransactionMode, settlementDirection?: PartySettlementDirection): PartyCashTransactionCopy {
  switch (resolveDirection(mode, settlementDirection)) {
    case 'CustomerRefund':
      return {
        titleLabel: 'party-customer-refund-title',
        helpLabel: 'party-customer-refund-help',
        submitLabel: 'party-customer-refund-submit',
        successLabel: 'party-customer-refund-success',
        failureLabel: 'party-customer-refund-failed',
        dateLabel: 'settlement-date',
        defaultDescription: 'Customer refund'
      };
    case 'SupplierReceipt':
      return {
        titleLabel: 'party-supplier-receipt-title',
        helpLabel: 'party-supplier-receipt-help',
        submitLabel: 'party-supplier-receipt-submit',
        successLabel: 'party-supplier-receipt-success',
        failureLabel: 'party-supplier-receipt-failed',
        dateLabel: 'settlement-date',
        defaultDescription: 'Supplier receipt'
      };
    case 'SupplierPayment':
      return {
        titleLabel: 'party-supplier-payment-title',
        helpLabel: 'party-supplier-payment-help',
        submitLabel: 'party-supplier-payment-submit',
        successLabel: 'party-supplier-payment-success',
        failureLabel: 'party-supplier-payment-failed',
        dateLabel: 'payment-date',
        defaultDescription: 'Supplier payment'
      };
    case 'CustomerReceipt':
    default:
      return {
        titleLabel: 'party-customer-receipt-title',
        helpLabel: 'party-customer-receipt-help',
        submitLabel: 'party-customer-receipt-submit',
        successLabel: 'party-customer-receipt-success',
        failureLabel: 'party-customer-receipt-failed',
        dateLabel: 'receipt-date',
        defaultDescription: 'Customer receipt'
      };
  }
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

export default function PartyCashTransactionDialog({
  open,
  mode,
  partyId,
  partyName,
  settlementDirection,
  settlementAmount,
  settlementDescriptionArabic,
  settlementDescriptionEnglish,
  settlementReferenceNumber,
  buildAllocations,
  onClose,
  onSaved
}: PartyCashTransactionDialogProps) {
  const intl = useIntl();
  const dispatch = useDispatch();
  const { createSettlement } = usePartySettlementActions();
  const { items: cashboxes, isLoading } = useCashboxAccounts();
  const schema = useMemo(() => buildSchema(intl), [intl]);
  const copy = useMemo(() => getSettlementCopy(mode, settlementDirection), [mode, settlementDirection]);
  const form = useForm<PartyCashTransactionFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      treasuryAccountId: '',
      transactionDate: getLocalDateInputValue(),
      amount: settlementAmount != null ? String(settlementAmount) : '',
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
      amount: settlementAmount != null ? String(settlementAmount) : '',
      notes: ''
    });
  }, [cashboxes, form, open, settlementAmount]);

  const notify = (message: string, severity: 'success' | 'error' = 'success') => {
    dispatch(openSnackbar({ open: true, message, variant: 'alert', severity }));
  };

  const submit = async (values: PartyCashTransactionFormValues) => {
    const selectedAccount = cashboxes.find((account) => account.id === values.treasuryAccountId);
    if (!selectedAccount) {
      notify(intl.formatMessage({ id: 'no-cashbox-accounts' }), 'error');
      return;
    }

    const amount = Number(values.amount);
    const direction = resolveDirection(mode, settlementDirection);

    const request: PartySettlementRequest = {
      direction,
      settlementDate: values.transactionDate,
      amount,
      currencyCode: selectedAccount.currencyCode,
      treasuryAccountId: values.treasuryAccountId,
      paymentMethod: 'Cash',
      referenceNumber: settlementReferenceNumber ?? null,
      descriptionArabic: settlementDescriptionArabic?.trim() || values.notes.trim() || copy.defaultDescription,
      descriptionEnglish: settlementDescriptionEnglish?.trim() || values.notes.trim() || copy.defaultDescription,
      idempotencyKey: null,
      allocations: buildAllocations ? buildAllocations(amount) : []
    };

    try {
      await createSettlement(partyId, request);
      notify(intl.formatMessage({ id: copy.successLabel }));

      await onSaved?.();
      onClose();
    } catch (error) {
      notify(error instanceof Error ? error.message : intl.formatMessage({ id: copy.failureLabel }), 'error');
    }
  };

  const submitLabel = copy.submitLabel;
  const titleLabel = copy.titleLabel;
  const helperLabel = copy.helpLabel;
  const dateLabel = copy.dateLabel;

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
