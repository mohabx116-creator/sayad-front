import { useMemo, useState } from 'react';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Divider from '@mui/material/Divider';
import FormControlLabel from '@mui/material/FormControlLabel';
import Grid from '@mui/material/GridLegacy';
import InputAdornment from '@mui/material/InputAdornment';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { IconAlertTriangle, IconTrash } from '@tabler/icons-react';

import type { PartyDeletionPreview } from '../types/parties.types';

type Props = {
  open: boolean;
  isLoading: boolean;
  isProcessing: boolean;
  preview: PartyDeletionPreview | null;
  errorMessage?: string | null;
  onClose: () => void;
  onConfirm: (request: { code: string; reason: string; rowVersion: string }) => void;
};

function getPartyTypeLabel(isCustomer: boolean, isSupplier: boolean) {
  if (isCustomer && isSupplier) return 'عميل ومورد';
  if (isCustomer) return 'عميل';
  return 'مورد';
}

export default function PartyFinalDeleteDialog({ open, isLoading, isProcessing, preview, errorMessage, onClose, onConfirm }: Props) {
  const [reason, setReason] = useState('');
  const [confirmationCode, setConfirmationCode] = useState('');
  const [finalConfirmation, setFinalConfirmation] = useState(false);
  const [error, setError] = useState('');

  const linkedInvoiceAllocations = useMemo(
    () => (preview ? preview.treasuryReceiptAllocationCount + preview.treasuryPaymentAllocationCount : 0),
    [preview]
  );

  const handleClose = () => {
    if (isProcessing) return;
    setReason('');
    setConfirmationCode('');
    setFinalConfirmation(false);
    setError('');
    onClose();
  };

  const handleConfirm = () => {
    if (!preview) return;
    if (confirmationCode.trim() !== preview.code) {
      setError('يجب كتابة كود الطرف كما هو ظاهر قبل الحذف.');
      return;
    }
    if (!reason.trim()) {
      setError('سبب الحذف مطلوب.');
      return;
    }
    if (!finalConfirmation) {
      setError('أكّد أنك تريد حذف هذا الطرف نهائيًا.');
      return;
    }
    if (!preview.canDelete) {
      setError('لا يمكن إتمام الحذف لأن هناك فواتير أو سندات أو حركات مالية مرتبطة بهذا الطرف.');
      return;
    }

    onConfirm({
      code: confirmationCode.trim(),
      reason: reason.trim(),
      rowVersion: preview.rowVersion
    });
  };

  const canSubmit = Boolean(preview?.canDelete) && Boolean(reason.trim()) && Boolean(finalConfirmation) && confirmationCode.trim() === preview?.code;

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1.5, pb: 2 }}>
        <Box sx={{ display: 'flex', p: 1, borderRadius: 2, bgcolor: 'error.lighter', color: 'error.main' }}>
          <IconAlertTriangle size={24} />
        </Box>
        <Typography variant="h4" fontWeight={700}>
          حذف نهائي
        </Typography>
      </DialogTitle>

      <DialogContent sx={{ pt: 1 }}>
        {isLoading && <Typography color="text.secondary">جارٍ تجهيز ملخص الحذف...</Typography>}
        {errorMessage && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {errorMessage}
          </Alert>
        )}

        {!isLoading && preview && (
          <Box sx={{ display: 'grid', gap: 2.5 }}>
            <Alert severity={preview.canDelete ? 'warning' : 'error'} variant="outlined">
              {preview.canDelete
                ? 'هذا الإجراء سيحذف الطرف نهائيًا. تأكد من كتابة الكود الصحيح ثم أكّد التنفيذ.'
                : 'لا يمكن حذف هذا الطرف نهائيًا لوجود بيانات مالية أو مستندية مرتبطة به.'}
            </Alert>

            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField fullWidth label="كود الطرف" value={preview.code} InputProps={{ readOnly: true }} />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField fullWidth label="اسم الطرف" value={preview.nameArabic} InputProps={{ readOnly: true }} />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField fullWidth label="الاسم بالإنجليزية" value={preview.nameEnglish ?? '—'} InputProps={{ readOnly: true }} />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="نوع الطرف"
                  value={getPartyTypeLabel(preview.isCustomer, preview.isSupplier)}
                  InputProps={{ readOnly: true }}
                />
              </Grid>
            </Grid>

            <Grid container spacing={2}>
              <Grid item xs={6} md={3}>
                <TextField fullWidth label="فواتير البيع" value={preview.salesInvoiceCount} InputProps={{ readOnly: true }} />
              </Grid>
              <Grid item xs={6} md={3}>
                <TextField fullWidth label="فواتير الشراء" value={preview.purchaseInvoiceCount} InputProps={{ readOnly: true }} />
              </Grid>
              <Grid item xs={6} md={3}>
                <TextField fullWidth label="مرتجعات البيع" value={preview.salesReturnCount} InputProps={{ readOnly: true }} />
              </Grid>
              <Grid item xs={6} md={3}>
                <TextField fullWidth label="مرتجعات الشراء" value={preview.purchaseReturnCount} InputProps={{ readOnly: true }} />
              </Grid>
              <Grid item xs={6} md={3}>
                <TextField fullWidth label="سندات القبض" value={preview.treasuryReceiptCount} InputProps={{ readOnly: true }} />
              </Grid>
              <Grid item xs={6} md={3}>
                <TextField fullWidth label="سندات الصرف" value={preview.treasuryPaymentCount} InputProps={{ readOnly: true }} />
              </Grid>
              <Grid item xs={6} md={3}>
                <TextField fullWidth label="تخصيصات الفواتير" value={linkedInvoiceAllocations} InputProps={{ readOnly: true }} />
              </Grid>
              <Grid item xs={6} md={3}>
                <TextField fullWidth label="المصروفات" value={preview.expenseCount} InputProps={{ readOnly: true }} />
              </Grid>
              <Grid item xs={6} md={3}>
                <TextField fullWidth label="الحركات المالية" value={preview.partyLedgerEntryCount} InputProps={{ readOnly: true }} />
              </Grid>
              <Grid item xs={6} md={3}>
                <TextField fullWidth label="الرصيد الافتتاحي" value={preview.openingBalanceCount} InputProps={{ readOnly: true }} />
              </Grid>
              <Grid item xs={6} md={3}>
                <TextField fullWidth label="العلاقات غير المالية" value={preview.partyItemRelationCount} InputProps={{ readOnly: true }} />
              </Grid>
              <Grid item xs={6} md={3}>
                <TextField
                  fullWidth
                  label="الحذف النهائي"
                  value={preview.canDelete ? 'مسموح' : 'غير مسموح'}
                  InputProps={{ readOnly: true, endAdornment: <InputAdornment position="end">{preview.canDelete ? '✓' : '!'}</InputAdornment> }}
                />
              </Grid>
            </Grid>

            {preview.partyItemRelationCount > 0 && preview.canDelete && (
              <Alert severity="info">
                توجد علاقات غير مالية لهذا الطرف، وسيتم حذفها معه لأن الحذف النهائي آمن.
              </Alert>
            )}

            <Divider />

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
                  disabled={isProcessing}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="اكتب كود الطرف للتأكيد"
                  value={confirmationCode}
                  onChange={(event) => {
                    setConfirmationCode(event.target.value);
                    setError('');
                  }}
                  error={Boolean(error)}
                  helperText={error}
                  disabled={isProcessing}
                />
              </Grid>
            </Grid>

            <FormControlLabel
              control={
                <Checkbox
                  checked={finalConfirmation}
                  onChange={(event) => {
                    setFinalConfirmation(event.target.checked);
                    setError('');
                  }}
                  disabled={isProcessing}
                />
              }
              label="أؤكد أنني أريد حذف هذا الطرف نهائيًا"
            />

            {!preview.canDelete && (
              <Alert severity="error">
                لا يمكن إتمام الحذف قبل إزالة الفواتير أو السندات أو الحركات المالية المرتبطة بهذا الطرف.
              </Alert>
            )}
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={handleClose} disabled={isProcessing} color="inherit" sx={{ borderRadius: 2, px: 3 }}>
          إلغاء
        </Button>
        <Button
          onClick={handleConfirm}
          variant="contained"
          color="error"
          disabled={isProcessing || !canSubmit}
          startIcon={<IconTrash size={18} />}
          sx={{ borderRadius: 2, px: 3, boxShadow: 2 }}
        >
          حذف الطرف نهائيًا
        </Button>
      </DialogActions>
    </Dialog>
  );
}
