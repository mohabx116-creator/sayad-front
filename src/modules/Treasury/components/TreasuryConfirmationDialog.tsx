import { useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import { IconAlertTriangle, IconCheck } from '@tabler/icons-react';

export type TreasuryActionType = 'post' | 'cancel' | 'activate' | 'deactivate' | 'delete';

interface Props {
  open: boolean;
  action: TreasuryActionType;
  titleId?: string;
  messageId?: string;
  confirmationValue?: string;
  confirmationLabelId?: string;
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
  confirmationValue,
  confirmationLabelId,
  requireReason = false,
  isProcessing = false,
  onConfirm,
  onClose
}: Props) {
  const intl = useIntl();
  const [reason, setReason] = useState('');
  const [confirmationText, setConfirmationText] = useState('');
  const [error, setError] = useState('');

  const handleConfirm = () => {
    if (confirmationValue && confirmationText.trim() !== confirmationValue.trim()) {
      setError(intl.formatMessage({ id: 'confirmation-value-mismatch', defaultMessage: 'يرجى كتابة الكود الصحيح للتأكيد.' }));
      return;
    }

    if (requireReason && !reason.trim()) {
      setError(intl.formatMessage({ id: 'reason-required', defaultMessage: 'السبب مطلوب.' }));
      return;
    }

    onConfirm(confirmationValue ? confirmationText : reason);
  };

  const handleClose = () => {
    if (isProcessing) return;
    setReason('');
    setConfirmationText('');
    setError('');
    onClose();
  };

  const isDestructive = action === 'cancel' || action === 'deactivate' || action === 'delete';
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
        <Typography variant="body1" sx={{ mb: 2 }}>
          <FormattedMessage id={messageId || `treasury.confirm.${action}.message`} defaultMessage="هل أنت متأكد من تنفيذ هذا الإجراء؟" />
        </Typography>

        {confirmationValue && (
          <TextField
            autoFocus
            fullWidth
            required
            label={confirmationLabelId ? <FormattedMessage id={confirmationLabelId} defaultMessage="اكتب كود الحساب للتأكيد" /> : 'اكتب كود الحساب للتأكيد'}
            value={confirmationText}
            onChange={(e) => {
              setConfirmationText(e.target.value);
              if (error) setError('');
            }}
            error={Boolean(error)}
            helperText={error}
            disabled={isProcessing}
            sx={{ mb: 2 }}
          />
        )}

        {requireReason && (
          <TextField
            autoFocus={!confirmationValue}
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
        <Button onClick={handleConfirm} variant="contained" color={color} disabled={isProcessing} sx={{ borderRadius: 2, px: 3, boxShadow: 2 }}>
          <FormattedMessage id={action === 'delete' ? 'delete' : 'confirm'} defaultMessage={action === 'delete' ? 'حذف نهائي' : 'تأكيد'} />
        </Button>
      </DialogActions>
    </Dialog>
  );
}
