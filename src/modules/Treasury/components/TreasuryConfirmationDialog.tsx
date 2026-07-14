import { useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import { IconAlertTriangle, IconCheck } from '@tabler/icons-react';

export type TreasuryActionType = 'post' | 'cancel' | 'activate' | 'deactivate';

interface Props {
  open: boolean;
  action: TreasuryActionType;
  titleId?: string;
  messageId?: string;
  requireReason?: boolean;
  isProcessing?: boolean;
  onConfirm: (reason?: string) => void;
  onClose: () => void;
}

export default function TreasuryConfirmationDialog({
  open,
  action,
  titleId,
  messageId,
  requireReason = false,
  isProcessing = false,
  onConfirm,
  onClose
}: Props) {
  const intl = useIntl();
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  const handleConfirm = () => {
    if (requireReason && !reason.trim()) {
      setError(intl.formatMessage({ id: 'reason-required', defaultMessage: 'السبب مطلوب' }));
      return;
    }
    onConfirm(reason);
  };

  const handleClose = () => {
    if (isProcessing) return;
    setReason('');
    setError('');
    onClose();
  };

  const isDestructive = action === 'cancel' || action === 'deactivate';
  const Icon = isDestructive ? IconAlertTriangle : IconCheck;
  const color = isDestructive ? 'error' : 'primary';

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1.5, pb: 2 }}>
        <Box sx={{ display: 'flex', p: 1, borderRadius: 2, bgcolor: `${color}.light`, color: `${color}.main` }}>
          <Icon size={24} />
        </Box>
        <Typography variant="h4" fontWeight={600}>
          <FormattedMessage id={titleId || `treasury.confirm.${action}.title`} defaultMessage="تأكيد الإجراء" />
        </Typography>
      </DialogTitle>
      
      <DialogContent>
        <Typography variant="body1" sx={{ mb: requireReason ? 3 : 1 }}>
          <FormattedMessage id={messageId || `treasury.confirm.${action}.message`} defaultMessage="هل أنت متأكد من تنفيذ هذا الإجراء؟" />
        </Typography>

        {requireReason && (
          <TextField
            autoFocus
            fullWidth
            required
            multiline
            rows={3}
            label={<FormattedMessage id="reason" defaultMessage="السبب" />}
            value={reason}
            onChange={(e) => {
              setReason(e.target.value);
              if (error) setError('');
            }}
            error={Boolean(error)}
            helperText={error}
            disabled={isProcessing}
          />
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={handleClose} disabled={isProcessing} color="inherit" sx={{ borderRadius: 2, px: 3 }}>
          <FormattedMessage id="cancel" defaultMessage="إلغاء" />
        </Button>
        <Button 
          onClick={handleConfirm} 
          variant="contained" 
          color={color}
          disabled={isProcessing} 
          sx={{ borderRadius: 2, px: 3, boxShadow: 2 }}
        >
          <FormattedMessage id="confirm" defaultMessage="تأكيد" />
        </Button>
      </DialogActions>
    </Dialog>
  );
}
