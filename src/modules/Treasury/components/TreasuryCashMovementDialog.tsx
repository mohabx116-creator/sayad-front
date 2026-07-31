import { useEffect, useState } from 'react';
import { FormattedMessage } from 'react-intl';

import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Grid from '@mui/material/GridLegacy';
import TextField from '@mui/material/TextField';

import { IconCheck, IconPlus, IconMinus } from '@tabler/icons-react';

export interface TreasuryCashMovementFormValue {
  transactionDate: string;
  amount: number;
  reason: string;
  notes: string | null;
}

interface Props {
  open: boolean;
  mode: 'in' | 'out';
  accountName: string;
  isSubmitting?: boolean;
  onClose: () => void;
  onSubmit: (value: TreasuryCashMovementFormValue) => Promise<void> | void;
}

function getTodayValue() {
  return new Date().toISOString().slice(0, 10);
}

export default function TreasuryCashMovementDialog({ open, mode, accountName, isSubmitting = false, onClose, onSubmit }: Props) {
  const [transactionDate, setTransactionDate] = useState(getTodayValue());
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (!open) {
      return;
    }

    setTransactionDate(getTodayValue());
    setAmount('');
    setReason('');
    setNotes('');
  }, [open]);

  const titleId = mode === 'in' ? 'cash-in' : 'cash-out';
  const confirmId = mode === 'in' ? 'confirm-cash-in' : 'confirm-cash-out';
  const icon = mode === 'in' ? <IconPlus size={18} /> : <IconMinus size={18} />;

  return (
    <Dialog open={open} onClose={isSubmitting ? undefined : onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ pb: 1 }}>
        <FormattedMessage id={titleId} defaultMessage={mode === 'in' ? 'Cash In' : 'Cash Out'} />
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
          onClick={() =>
            onSubmit({
              transactionDate,
              amount: Number(amount),
              reason: reason.trim(),
              notes: notes.trim() ? notes.trim() : null
            })
          }
          disabled={isSubmitting}
          startIcon={icon}
        >
          <FormattedMessage id={confirmId} defaultMessage={mode === 'in' ? 'Confirm Cash In' : 'Confirm Cash Out'} />
        </Button>
      </DialogActions>
    </Dialog>
  );
}
