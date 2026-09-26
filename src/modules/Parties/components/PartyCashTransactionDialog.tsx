import { useEffect, useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FormattedMessage, useIntl } from 'react-intl';

import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormLabel from '@mui/material/FormLabel';
import MenuItem from '@mui/material/MenuItem';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import { useCashboxAccounts } from 'modules/Treasury/hooks/useTreasury';
import TreasuryAllocationTable from 'modules/Treasury/components/TreasuryAllocationTable';
import type { TreasuryEligibleInvoice } from 'modules/Treasury/types/treasury.types';
import type {
  PartySettlementAllocationRequest,
  PartySettlementDirection,
  PartySettlementOpenDocumentDto,
  PartySettlementRequest
} from '../types/parties.types';
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
  maxSettlementAmount?: number;
  openDocuments?: PartySettlementOpenDocumentDto[];
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

type PartyCashTransactionAllocationMode = 'onAccount' | 'documents';

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
        titleLabel: 'party-customer-payment-title',
        helpLabel: 'party-customer-payment-help',
        submitLabel: 'party-customer-payment-submit',
        successLabel: 'party-customer-payment-success',
        failureLabel: 'party-customer-payment-failed',
        dateLabel: 'settlement-date',
        defaultDescription: 'Customer payment'
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

function buildSchema(intl: ReturnType<typeof useIntl>, maxSettlementAmount?: number) {
  return z.object({
    treasuryAccountId: z.string().min(1, intl.formatMessage({ id: 'cashbox-required' })),
    transactionDate: z.string().min(1, intl.formatMessage({ id: 'party-cash-transaction-date-required' })),
    amount: z
      .string()
      .min(1, intl.formatMessage({ id: 'payment-amount-required' }))
      .refine((value) => Number(value) > 0, intl.formatMessage({ id: 'party-cash-transaction-amount-positive' }))
      .refine(
        (value) => maxSettlementAmount == null || Number(value) <= maxSettlementAmount,
        intl.formatMessage({ id: 'party-settlement-amount-exceeds-balance' })
      ),
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
  maxSettlementAmount,
  openDocuments,
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
  const schema = useMemo(() => buildSchema(intl, maxSettlementAmount), [intl, maxSettlementAmount]);
  const copy = useMemo(() => getSettlementCopy(mode, settlementDirection), [mode, settlementDirection]);
  const isCashInDirection = resolveDirection(mode, settlementDirection) === 'CustomerReceipt' || resolveDirection(mode, settlementDirection) === 'SupplierReceipt';
  const settlementOpenDocuments = useMemo(() => openDocuments ?? [], [openDocuments]);
  const hasOpenDocuments = settlementOpenDocuments.length > 0 && !buildAllocations;
  const [allocationMode, setAllocationMode] = useState<PartyCashTransactionAllocationMode>('onAccount');
  const [allocationAmounts, setAllocationAmounts] = useState<Record<string, number>>({});
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

    const nextAllocationMode: PartyCashTransactionAllocationMode = hasOpenDocuments ? 'documents' : 'onAccount';
    form.reset({
      treasuryAccountId: cashboxes[0]?.id ?? '',
      transactionDate: getLocalDateInputValue(),
      amount: settlementAmount != null ? String(settlementAmount) : '',
      notes: ''
    });
    setAllocationMode(nextAllocationMode);
    setAllocationAmounts(Object.fromEntries(settlementOpenDocuments.map((document) => [document.documentId, 0])));
  }, [cashboxes, form, hasOpenDocuments, open, settlementAmount, settlementOpenDocuments]);

  const receiptAmount = Number(form.watch('amount') || 0);
  const openDocumentRows = useMemo<TreasuryEligibleInvoice[]>(
    () =>
      settlementOpenDocuments.map((document) => ({
        invoiceId: document.documentId,
        invoiceNumber: document.documentDisplayNumber ?? document.documentNumber,
        invoiceDate: document.documentDate,
        grandTotal: document.documentAmount,
        allocatedAmount: allocationAmounts[document.documentId] ?? 0,
        outstandingAmount: document.outstandingAmount
      })),
    [allocationAmounts, settlementOpenDocuments]
  );
  const allocatedTotal = openDocumentRows.reduce((sum, row) => sum + row.allocatedAmount, 0);
  const remainingOnAccount = Math.max(0, receiptAmount - allocatedTotal);

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
    const allocations =
      buildAllocations != null
        ? buildAllocations(amount)
        : allocationMode === 'documents'
          ? openDocumentRows
              .filter((row) => row.allocatedAmount > 0)
              .map((row, index) => ({
                lineNumber: index + 1,
                documentType: settlementOpenDocuments.find((document) => document.documentId === row.invoiceId)?.documentType ?? 'SalesInvoice',
                documentId: row.invoiceId,
                documentNumber: row.invoiceNumber,
                allocatedAmount: row.allocatedAmount,
                notes: null
              }))
          : [];

    if (allocationMode === 'documents' && !buildAllocations && openDocumentRows.length > 0) {
      if (allocatedTotal <= 0) {
        notify(
          intl.formatMessage({
            id: 'party-settlement-allocation-required',
            defaultMessage: 'اختر مستندًا واحدًا على الأقل للتخصيص.'
          }),
          'error'
        );
        return;
      }

      if (allocatedTotal > amount) {
        notify(
          intl.formatMessage({
            id: 'party-settlement-allocation-exceeds-amount',
            defaultMessage: 'إجمالي التخصيص لا يمكن أن يتجاوز مبلغ القبض.'
          }),
          'error'
        );
        return;
      }
    }

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
      allocations
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
  const canAllocateDocuments = openDocuments !== undefined && !buildAllocations;

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
                  inputProps={{ min: 0, max: maxSettlementAmount, step: '0.01' }}
                  label={<FormattedMessage id="payment-amount" />}
                  error={!!fieldState.error}
                  helperText={
                    fieldState.error?.message ??
                    (maxSettlementAmount != null ? (
                      <FormattedMessage
                        id="party-settlement-max-amount"
                        values={{ amount: new Intl.NumberFormat(intl.locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(maxSettlementAmount) }}
                      />
                    ) : undefined)
                  }
                />
              )}
            />

            {canAllocateDocuments && (
              <Stack spacing={2}>
                <FormControl>
                  <FormLabel>
                    <FormattedMessage id="party-settlement-mode" defaultMessage="وضع التسوية" />
                  </FormLabel>
                  <RadioGroup
                    row
                    value={allocationMode}
                    onChange={(event) => setAllocationMode(event.target.value as PartyCashTransactionAllocationMode)}
                  >
                    <FormControlLabel
                      value="documents"
                      control={<Radio />}
                      label={<FormattedMessage id="settle-by-documents" defaultMessage="تخصيص على مستندات" />}
                    />
                    <FormControlLabel
                      value="onAccount"
                      control={<Radio />}
                      label={<FormattedMessage id={isCashInDirection ? 'settle-on-account' : 'settle-on-account-payment'} />}
                    />
                  </RadioGroup>
                </FormControl>

                {allocationMode === 'documents' ? (
                  openDocumentRows.length > 0 ? (
                    <Stack spacing={1.5}>
                      <Typography variant="body2" color="text.secondary">
                        <FormattedMessage
                          id="party-settlement-documents-help"
                          defaultMessage="اختر مستندًا أو أكثر للتخصيص. يمكن ترك جزء من مبلغ القبض على الحساب."
                        />
                      </Typography>
                      <TreasuryAllocationTable
                        invoices={openDocumentRows}
                        onAllocationChange={(invoiceId, amount) => {
                          setAllocationAmounts((current) => ({ ...current, [invoiceId]: amount }));
                        }}
                        maxTotalAllocation={receiptAmount}
                      />
                      <Typography variant="body2" color="text.secondary">
                        <FormattedMessage
                          id="party-settlement-allocation-summary"
                          defaultMessage="إجمالي التخصيص: {allocatedTotal} | المتبقي على الحساب: {remainingOnAccount}"
                          values={{
                            allocatedTotal: new Intl.NumberFormat(intl.locale, {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2
                            }).format(allocatedTotal),
                            remainingOnAccount: new Intl.NumberFormat(intl.locale, {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2
                            }).format(remainingOnAccount)
                          }}
                        />
                      </Typography>
                    </Stack>
                  ) : (
                    <Alert severity="info">
                      <FormattedMessage
                        id="party-settlement-no-open-documents"
                        defaultMessage="لا توجد مستندات مفتوحة للتخصيص. يمكنك تسجيل القبض على الحساب."
                      />
                    </Alert>
                  )
                ) : (
                  <Alert severity="info">
                    <FormattedMessage
                      id="party-settlement-on-account-info"
                      defaultMessage="سيتم تسجيل القبض على الحساب بدون تخصيص أي مستندات."
                    />
                  </Alert>
                )}
              </Stack>
            )}

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
