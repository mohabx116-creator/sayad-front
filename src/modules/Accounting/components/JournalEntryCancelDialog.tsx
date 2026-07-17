import { useEffect, useState } from 'react';

import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';
import { FormattedMessage } from 'react-intl';

type Props = {
  open: boolean;
  isProcessing?: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
};

export default function JournalEntryCancelDialog({ open, isProcessing = false, onClose, onConfirm }: Props) {
  const [reason, setReason] = useState('');

  useEffect(() => {
    if (!open) {
      setReason('');
    }
  }, [open]);

  return (
    <Dialog open={open} onClose={isProcessing ? undefined : onClose} fullWidth maxWidth="sm">
      <DialogTitle>
        <FormattedMessage id="cancel-journal-entry" defaultMessage="Cancel Journal Entry" />
      </DialogTitle>
      <DialogContent sx={{ display: 'grid', gap: 2 }}>
        <DialogContentText>
          <FormattedMessage id="journal-entry-cancel-confirm" defaultMessage="This action will reverse the posted journal entry with an automatic reversal entry." />
        </DialogContentText>
        <TextField
          fullWidth
          multiline
          minRows={3}
          value={reason}
          onChange={(event) => setReason(event.target.value)}
          label={<FormattedMessage id="cancellation-reason" defaultMessage="Cancellation reason" />}
          required
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isProcessing}>
          <FormattedMessage id="cancel" />
        </Button>
        <Button variant="contained" color="error" disabled={isProcessing || reason.trim().length === 0} onClick={() => onConfirm(reason.trim())}>
          <FormattedMessage id="cancel-document" defaultMessage="Cancel document" />
        </Button>
      </DialogActions>
    </Dialog>
  );
}
