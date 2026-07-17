import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import { FormattedMessage } from 'react-intl';

type Props = {
  open: boolean;
  isProcessing?: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

export default function JournalEntryDeleteDialog({ open, isProcessing = false, onClose, onConfirm }: Props) {
  return (
    <Dialog open={open} onClose={isProcessing ? undefined : onClose} fullWidth maxWidth="sm">
      <DialogTitle>
        <FormattedMessage id="delete-draft-journal-entry" defaultMessage="حذف المسودة" />
      </DialogTitle>
      <DialogContent>
        <DialogContentText>
          <FormattedMessage
            id="journal-entry-delete-confirm"
            defaultMessage="سيتم حذف المسودة وجميع سطورها نهائيًا. لا يمكن التراجع بعد تنفيذ هذا الإجراء."
          />
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isProcessing}>
          <FormattedMessage id="cancel" />
        </Button>
        <Button variant="contained" color="error" disabled={isProcessing} onClick={onConfirm}>
          <FormattedMessage id="delete-draft-journal-entry" defaultMessage="حذف المسودة" />
        </Button>
      </DialogActions>
    </Dialog>
  );
}
