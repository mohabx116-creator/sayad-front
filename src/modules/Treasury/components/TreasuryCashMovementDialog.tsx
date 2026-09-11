import { useEffect, useRef, useState } from 'react';
import { FormattedMessage } from 'react-intl';

import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Grid from '@mui/material/GridLegacy';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';

import { IconPlus, IconMinus } from '@tabler/icons-react';

import { useAccountingAccounts } from 'modules/Accounting/hooks/useAccounting';

export interface TreasuryCashMovementFormValue {
  transactionDate: string;
  amount: number;
  reason: string;
  notes: string | null;
  counterAccountingAccountId: string;
  operationId: string;
}

interface Props {
  open: boolean;
  mode: 'in' | 'out';
  accountName: string;
  treasuryAccountingAccountId?: string | null;
  isSubmitting?: boolean;
  onClose: () => void;
  onSubmit: (value: TreasuryCashMovementFormValue) => Promise<void> | void;
}

function getTodayValue() {
  return new Date().toISOString().slice(0, 10);
}

export default function TreasuryCashMovementDialog({
  open,
  mode,
  accountName,
  treasuryAccountingAccountId,
  isSubmitting = false,
  onClose,
  onSubmit
}: Props) {
  const [transactionDate, setTransactionDate] = useState(getTodayValue());
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');
  const [counterAccountingAccountId, setCounterAccountingAccountId] = useState('');
  const operationIdRef = useRef<string | null>(null);
  const { items: accountingAccounts, isLoading: isLoadingAccountingAccounts } = useAccountingAccounts({
    page: 1,
    pageSize: 100,
    isActive: true,
    isPosting: true
  });
  const counterAccountingAccounts = accountingAccounts.filter((account) => account.id !== treasuryAccountingAccountId);

  useEffect(() => {
    if (!open) {
      return;
    }

    setTransactionDate(getTodayValue());
    setAmount('');
    setReason('');
    setNotes('');
    setCounterAccountingAccountId('');
    operationIdRef.current = null;
  }, [open]);

  const titleId = mode === 'in' ? 'cash-in' : 'cash-out';
  const confirmId = mode === 'in' ? 'confirm-cash-in' : 'confirm-cash-out';
  const icon = mode === 'in' ? <IconPlus size={18} /> : <IconMinus size={18} />;
  const canSubmit = Boolean(transactionDate && Number(amount) > 0 && reason.trim() && counterAccountingAccountId);

  return (
    <Dialog open={open} onClose={isSubmitting ? undefined : onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ pb: 1 }}>
        <FormattedMessage id={titleId} defaultMessage={mode === 'in' ? 'Cash In' : 'Cash Out'} /> - {accountName}
      </DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              required
              type="date"
              label={<FormattedMessage id={mode === 'in' ? 'receipt-date' : 'payment-date'} defaultMessage={mode === 'in' ? 'Receipt Date' : 'Payment Date'} />}
              value={transactionDate}
              onChange={(event) => setTransactionDate(event.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              required
              type="number"
              label={<FormattedMessage id="amount" defaultMessage="Amount" />}
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              inputProps={{ min: 0.01, step: 0.01 }}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              required
              select
              label={<FormattedMessage id="treasury.counter-accounting-account" defaultMessage="Counter Accounting Account" />}
              value={counterAccountingAccountId}
              onChange={(event) => setCounterAccountingAccountId(event.target.value)}
              disabled={isSubmitting || isLoadingAccountingAccounts}
              helperText={
                <FormattedMessage
                  id="treasury.counter-accounting-account-help"
                  defaultMessage="Select the GL account that offsets this manual treasury movement."
                />
              }
            >
              {counterAccountingAccounts.map((account) => (
                <MenuItem key={account.id} value={account.id}>
                  {account.code} - {account.nameArabic}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              required
              label={<FormattedMessage id="reason" defaultMessage="Reason" />}
              value={reason}
              onChange={(event) => setReason(event.target.value)}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              rows={3}
              label={<FormattedMessage id="notes" defaultMessage="Notes" />}
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} color="inherit" disabled={isSubmitting}>
          <FormattedMessage id="cancel" defaultMessage="Cancel" />
        </Button>
        <Button
          variant="contained"
          onClick={() => {
            operationIdRef.current ??= crypto.randomUUID();
            onSubmit({
              transactionDate,
              amount: Number(amount),
              reason: reason.trim(),
              notes: notes.trim() ? notes.trim() : null,
              counterAccountingAccountId,
              operationId: operationIdRef.current
            });
          }}
          disabled={isSubmitting || !canSubmit}
          startIcon={icon}
        >
          <FormattedMessage id={confirmId} defaultMessage={mode === 'in' ? 'Confirm Cash In' : 'Confirm Cash Out'} />
        </Button>
      </DialogActions>
    </Dialog>
  );
}
