import { useEffect, useState } from 'react';

import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';
import { FormattedMessage } from 'react-intl';

import type { AccountingAccountDto, AccountingAccountTreeNodeDto, AccountingAccountListItemDto } from '../types/accounting.types';

type DeleteSource = Pick<AccountingAccountDto, 'code' | 'rowVersion'> | Pick<AccountingAccountTreeNodeDto, 'code' | 'rowVersion'> | Pick<AccountingAccountListItemDto, 'code' | 'rowVersion'>;

type AccountingAccountDeleteDialogProps = {
  open: boolean;
  account: DeleteSource | null;
  isProcessing?: boolean;
  onClose: () => void;
  onConfirm: (request: { code: string; rowVersion: string }) => void;
};

export default function AccountingAccountDeleteDialog({ open, account, isProcessing = false, onClose, onConfirm }: AccountingAccountDeleteDialogProps) {
  const [code, setCode] = useState('');

  useEffect(() => {
    if (!open) {
      setCode('');
    }
  }, [open]);

  return (
    <Dialog open={open} onClose={isProcessing ? undefined : onClose} fullWidth maxWidth="sm">
      <DialogTitle>
        <FormattedMessage id="delete-permanent" defaultMessage="حذف نهائي" />
      </DialogTitle>
      <DialogContent sx={{ display: 'grid', gap: 2 }}>
        <DialogContentText>
          <FormattedMessage id="accounting-delete-confirm" defaultMessage="سيتم حذف الحساب بشكل آمن. اكتب كود الحساب للتأكيد." />
        </DialogContentText>
        <TextField value={account?.code ?? ''} label={<FormattedMessage id="account-code" defaultMessage="كود الحساب" />} fullWidth InputProps={{ readOnly: true }} />
        <TextField value={code} onChange={(event) => setCode(event.target.value)} label={<FormattedMessage id="type-account-code-to-confirm" defaultMessage="اكتب كود الحساب للتأكيد" />} fullWidth />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isProcessing}>
          <FormattedMessage id="cancel" />
        </Button>
        <Button
          onClick={() => account && onConfirm({ code: account.code, rowVersion: account.rowVersion })}
          variant="contained"
          color="error"
          disabled={isProcessing || !account || code.trim() !== account.code}
        >
          <FormattedMessage id="delete-account" defaultMessage="حذف الحساب" />
        </Button>
      </DialogActions>
    </Dialog>
  );
}
