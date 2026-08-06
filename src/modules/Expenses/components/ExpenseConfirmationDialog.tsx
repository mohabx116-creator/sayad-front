import { useState } from 'react';
import { FormattedMessage } from 'react-intl';

import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

interface Props {
  open: boolean;
  title: React.ReactNode;
  content: React.ReactNode;
  confirmColor?: 'primary' | 'error' | 'warning' | 'info' | 'success';
  confirmLabel?: React.ReactNode;
  cancelLabel?: React.ReactNode;
  requireReason?: boolean;
  onConfirm: (reason?: string) => void;
  onCancel: () => void;
  isProcessing?: boolean;
}

export default function ExpenseConfirmationDialog({ open, title, content, confirmColor = 'primary', confirmLabel, cancelLabel, requireReason, onConfirm, onCancel, isProcessing }: Props) {
  const [reason, setReason] = useState('');

  const handleConfirm = () => {
    if (requireReason && !reason.trim()) return;
    onConfirm(requireReason ? reason : undefined);
  };

  const handleClose = () => {
    if (!isProcessing) {
      setReason('');
      onCancel();
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent dividers>
        <Typography component="div" variant="body1" sx={{ mb: requireReason ? 3 : 0 }}>
          {content}
        </Typography>
        {requireReason && (
          <TextField
            autoFocus
            fullWidth
            multiline
            rows={3}
            label={<FormattedMessage id="expenses.cancellation-reason" defaultMessage="سبب الإلغاء" />}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            error={reason.trim() === ''}
            disabled={isProcessing}
          />
        )}
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={handleClose} color="inherit" disabled={isProcessing}>
          {cancelLabel || <FormattedMessage id="cancel" />}
        </Button>
        <Button onClick={handleConfirm} color={confirmColor} variant="contained" disabled={isProcessing || (requireReason && !reason.trim())}>
          {confirmLabel || <FormattedMessage id="confirm" />}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
