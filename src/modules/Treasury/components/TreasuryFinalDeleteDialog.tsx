import { useMemo, useState } from 'react';
import { FormattedMessage } from 'react-intl';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Divider from '@mui/material/Divider';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormLabel from '@mui/material/FormLabel';
import Grid from '@mui/material/GridLegacy';
import InputAdornment from '@mui/material/InputAdornment';
import MenuItem from '@mui/material/MenuItem';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import { IconAlertTriangle, IconTrash } from '@tabler/icons-react';

import type {
  TreasuryAccountDeletionPreview,
  TreasuryAccountFinalDeletionStrategy
} from '../types/treasury.types';
import { formatTreasuryMoney } from '../utils/treasury.format';

type Props = {
  open: boolean;
  isLoading: boolean;
  isProcessing: boolean;
  preview: TreasuryAccountDeletionPreview | null;
  onClose: () => void;
  onConfirm: (request: {
    reason: string;
    code: string;
    rowVersion: string;
    ownerPassword: string;
    strategy: TreasuryAccountFinalDeletionStrategy;
    replacementAccountId: string | null;
  }) => void;
};

function balanceNatureLabel(nature: string) {
  if (nature === 'Debit') return 'مدين — رصيد موجب';
  if (nature === 'Credit') return 'دائن — رصيد سالب';
  return 'رصيد متزن';
}

export default function TreasuryFinalDeleteDialog({ open, isLoading, isProcessing, preview, onClose, onConfirm }: Props) {
  const [strategy, setStrategy] = useState<TreasuryAccountFinalDeletionStrategy>('DeleteAll');
  const [replacementAccountId, setReplacementAccountId] = useState('');
  const [reason, setReason] = useState('');
  const [ownerPassword, setOwnerPassword] = useState('');
  const [confirmationCode, setConfirmationCode] = useState('');
  const [finalConfirmation, setFinalConfirmation] = useState(false);
  const [error, setError] = useState('');

  const selectedReplacement = useMemo(
    () => preview?.replacementAccounts.find((account) => account.id === replacementAccountId) ?? null,
    [preview, replacementAccountId]
  );

  const canMoveLinks = Boolean(preview && preview.replacementAccounts.length > 0);
  const canSubmit =
    Boolean(preview) &&
    Boolean(reason.trim()) &&
    Boolean(ownerPassword.trim()) &&
    Boolean(finalConfirmation) &&
    confirmationCode.trim() === preview?.code &&
    (!canMoveLinks || strategy === 'DeleteAll' || Boolean(replacementAccountId));

  const handleClose = () => {
    if (isProcessing) return;
    setStrategy('DeleteAll');
    setReplacementAccountId('');
    setReason('');
    setOwnerPassword('');
    setConfirmationCode('');
    setFinalConfirmation(false);
    setError('');
    onClose();
  };

  const handleConfirm = () => {
    if (!preview) return;
    if (confirmationCode.trim() !== preview.code) {
      setError('اكتب كود الحساب كما هو ظاهر قبل الحذف.');
      return;
    }
    if (strategy === 'MoveLinks' && !replacementAccountId) {
      setError('اختر حساب الخزينة البديل أولًا.');
      return;
    }
    if (!reason.trim()) {
      setError('سبب الحذف مطلوب.');
      return;
    }
    if (!ownerPassword.trim()) {
      setError('كلمة مرور المالك مطلوبة.');
      return;
    }
    if (!finalConfirmation) {
      setError('أكد أنك تريد إتمام الحذف النهائي.');
      return;
    }

    onConfirm({
      reason: reason.trim(),
      code: confirmationCode.trim(),
      rowVersion: preview.rowVersion,
      ownerPassword: ownerPassword.trim(),
      strategy,
      replacementAccountId: strategy === 'MoveLinks' ? replacementAccountId : null
    });
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1.5, pb: 2 }}>
        <Box sx={{ display: 'flex', p: 1, borderRadius: 2, bgcolor: 'error.lighter', color: 'error.main' }}>
          <IconAlertTriangle size={24} />
        </Box>
        <Typography variant="h4" fontWeight={700}>
          <FormattedMessage id="final-delete-account" defaultMessage="حذف نهائي" />
        </Typography>
      </DialogTitle>

      <DialogContent sx={{ pt: 1 }}>
        {isLoading && <Typography color="text.secondary">جاري تجهيز ملخص الحذف...</Typography>}

        {!isLoading && preview && (
          <Box sx={{ display: 'grid', gap: 2.5 }}>
            <Alert severity="warning" variant="outlined">
              <FormattedMessage
                id="final-delete-warning"
                defaultMessage="هذا الإجراء سيحذف الحساب أو ينقل ارتباطاته نهائيًا حسب الخيار المحدد. راجع الملخص قبل التأكيد."
              />
            </Alert>

            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField fullWidth label="كود الحساب" value={preview.code} InputProps={{ readOnly: true }} />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField fullWidth label="اسم الحساب" value={preview.nameArabic} InputProps={{ readOnly: true }} />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="الرصيد الافتتاحي"
                  value={formatTreasuryMoney(preview.openingBalance, preview.currencyCode)}
                  InputProps={{ readOnly: true, endAdornment: <InputAdornment position="end">{balanceNatureLabel(preview.openingBalanceNature)}</InputAdornment> }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="الرصيد الحالي"
                  value={formatTreasuryMoney(preview.currentBalance, preview.currencyCode)}
                  InputProps={{ readOnly: true, endAdornment: <InputAdornment position="end">{balanceNatureLabel(preview.currentBalanceNature)}</InputAdornment> }}
                />
              </Grid>
            </Grid>

            <Grid container spacing={2}>
              <Grid item xs={6} md={3}>
                <TextField fullWidth label="سندات القبض" value={preview.receiptCount} InputProps={{ readOnly: true }} />
              </Grid>
              <Grid item xs={6} md={3}>
                <TextField fullWidth label="سندات الصرف" value={preview.paymentCount} InputProps={{ readOnly: true }} />
              </Grid>
              <Grid item xs={6} md={3}>
                <TextField fullWidth label="الحوالات" value={preview.transferCount} InputProps={{ readOnly: true }} />
              </Grid>
              <Grid item xs={6} md={3}>
                <TextField fullWidth label="المصروفات" value={preview.expenseCount} InputProps={{ readOnly: true }} />
              </Grid>
              <Grid item xs={6} md={3}>
                <TextField fullWidth label="الحركات" value={preview.movementCount} InputProps={{ readOnly: true }} />
              </Grid>
              <Grid item xs={6} md={3}>
                <TextField fullWidth label="الروابط على الفواتير" value={preview.linkedInvoiceAllocationCount} InputProps={{ readOnly: true }} />
              </Grid>
            </Grid>

            <Divider />

            <FormControl>
              <FormLabel sx={{ mb: 1, fontWeight: 700 }}>استراتيجية الحذف</FormLabel>
              <RadioGroup
                value={strategy}
                onChange={(event) => {
                  const nextStrategy = event.target.value as TreasuryAccountFinalDeletionStrategy;
                  setStrategy(nextStrategy);
                  setError('');
                }}
              >
                <FormControlLabel
                  value="MoveLinks"
                  control={<Radio />}
                  label="نقل الارتباطات إلى حساب خزينة آخر ثم حذف الحساب"
                  disabled={!canMoveLinks}
                />
                <FormControlLabel value="DeleteAll" control={<Radio />} label="حذف الحساب وكل السجلات المالية التابعة له نهائيًا" />
              </RadioGroup>
            </FormControl>

            {strategy === 'MoveLinks' && (
              <TextField
                select
                fullWidth
                label="حساب الخزينة البديل"
                value={replacementAccountId}
                onChange={(event) => {
                  setReplacementAccountId(event.target.value);
                  setError('');
                }}
                helperText={selectedReplacement ? `${selectedReplacement.code} - ${selectedReplacement.nameArabic}` : 'اختر حسابًا نشطًا بنفس العملة.'}
                disabled={!canMoveLinks}
              >
                {preview.replacementAccounts.map((account) => (
                  <MenuItem key={account.id} value={account.id}>
                    {account.code} - {account.nameArabic}
                  </MenuItem>
                ))}
              </TextField>
            )}

            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="سبب الحذف"
                  value={reason}
                  onChange={(event) => {
                    setReason(event.target.value);
                    setError('');
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  type="password"
                  label="كلمة مرور المالك"
                  value={ownerPassword}
                  onChange={(event) => {
                    setOwnerPassword(event.target.value);
                    setError('');
                  }}
                  helperText="أعد إدخال كلمة مرور المالك قبل تنفيذ الحذف."
                />
              </Grid>
            </Grid>

            <TextField
              fullWidth
              label="اكتب كود الحساب"
              value={confirmationCode}
              onChange={(event) => {
                setConfirmationCode(event.target.value);
                setError('');
              }}
              error={Boolean(error)}
              helperText={error || 'اكتب الكود كما هو ظاهر تمامًا.'}
            />

            <FormControlLabel
              control={
                <Checkbox
                  checked={finalConfirmation}
                  onChange={(event) => {
                    setFinalConfirmation(event.target.checked);
                    setError('');
                  }}
                />
              }
              label="أؤكد أنني أريد تنفيذ الحذف النهائي الآن"
            />
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={handleClose} disabled={isProcessing} color="inherit" sx={{ borderRadius: 2, px: 3 }}>
          <FormattedMessage id="cancel" defaultMessage="إلغاء" />
        </Button>
        <Button
          onClick={handleConfirm}
          variant="contained"
          color="error"
          disabled={isProcessing || !canSubmit}
          startIcon={<IconTrash size={18} />}
          sx={{ borderRadius: 2, px: 3, boxShadow: 2 }}
        >
          <FormattedMessage id="delete-permanent" defaultMessage="حذف نهائي" />
        </Button>
      </DialogActions>
    </Dialog>
  );
}
