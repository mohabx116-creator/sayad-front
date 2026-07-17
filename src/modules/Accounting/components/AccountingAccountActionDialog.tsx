import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Button from '@mui/material/Button';
import { FormattedMessage } from 'react-intl';

type AccountingAccountActionDialogProps = {
  open: boolean;
  titleId: string;
  descriptionId: string;
  isProcessing?: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

export default function AccountingAccountActionDialog({ open, titleId, descriptionId, isProcessing = false, onClose, onConfirm }: AccountingAccountActionDialogProps) {
  return (
    <Dialog open={open} onClose={isProcessing ? undefined : onClose} fullWidth maxWidth="sm">
      <DialogTitle>
        <FormattedMessage id={titleId} />
      </DialogTitle>
      <DialogContent>
        <DialogContentText>
          <FormattedMessage id={descriptionId} />
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isProcessing}>
          <FormattedMessage id="cancel" />
        </Button>
        <Button onClick={onConfirm} variant="contained" disabled={isProcessing}>
          <FormattedMessage id="confirm" defaultMessage="تأكيد" />
        </Button>
      </DialogActions>
    </Dialog>
  );
}

