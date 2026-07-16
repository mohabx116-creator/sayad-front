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
import { IconAlertTriangle, IconArrowRight, IconTrash } from '@tabler/icons-react';

import type { PartyDeletionPreview } from '../types/parties.types';

type Props = {
  open: boolean;
  isLoading: boolean;
  isProcessing: boolean;
  preview: PartyDeletionPreview | null;
  errorMessage?: string | null;
  onClose: () => void;
  onConfirm: (request: { code: string; reason: string; rowVersion: string; previewToken: string; ownerPassword: string }) => void;
};

type Stage = 'choice' | 'confirm';

function getPartyTypeLabel(isCustomer: boolean, isSupplier: boolean) {
  if (isCustomer && isSupplier) return 'عميل ومورد';
  if (isCustomer) return 'عميل';
  return 'مورد';
}

function formatNature(value: string) {
  if (value === 'Debit') return 'مدين';
  if (value === 'Credit') return 'دائن';
  return 'متزن';
}

export default function PartyFinalDeleteDialog({ open, isLoading, isProcessing, preview, errorMessage, onClose, onConfirm }: Props) {
  const [stage, setStage] = useState<Stage>('choice');
  const [reason, setReason] = useState('');
  const [ownerPassword, setOwnerPassword] = useState('');
  const [confirmationCode, setConfirmationCode] = useState('');
  const [finalConfirmation, setFinalConfirmation] = useState(false);
  const [error, setError] = useState('');

  const linkedInvoiceAllocations = useMemo(
    () => (preview ? preview.treasuryReceiptAllocationCount + preview.treasuryPaymentAllocationCount : 0),
    [preview]
  );

  const handleClose = () => {
    if (isProcessing) return;
    setStage('choice');
    setReason('');
    setOwnerPassword('');
    setConfirmationCode('');
    setFinalConfirmation(false);
    setError('');
    onClose();
  };

  const handleBack = () => {
    if (isProcessing) return;
    setStage('choice');
    setError('');
  };

  const handleProceed = () => {
    if (!preview) return;
    setStage('confirm');
    setError('');
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
    if (!ownerPassword.trim()) {
      setError('كلمة مرور المالك مطلوبة.');
      return;
    }
    if (!finalConfirmation) {
      setError('أكد أنك تريد حذف هذا الطرف نهائيًا.');
      return;
    }

    onConfirm({
      code: confirmationCode.trim(),
      reason: reason.trim(),
      rowVersion: preview.rowVersion,
      previewToken: preview.previewToken,
      ownerPassword: ownerPassword.trim()
    });
  };

  const canSubmit =
    Boolean(preview) &&
    stage === 'confirm' &&
    Boolean(reason.trim()) &&
    Boolean(ownerPassword.trim()) &&
    Boolean(finalConfirmation) &&
    confirmationCode.trim() === preview?.code;

  const showDependencies = Boolean(
    preview &&
      (preview.salesInvoiceCount > 0 ||
        preview.purchaseInvoiceCount > 0 ||
        preview.salesReturnCount > 0 ||
        preview.purchaseReturnCount > 0 ||
        preview.treasuryReceiptCount > 0 ||
        preview.treasuryPaymentCount > 0 ||
        preview.treasuryMovementCount > 0 ||
        preview.treasuryReceiptAllocationCount > 0 ||
        preview.treasuryPaymentAllocationCount > 0 ||
        preview.expenseCount > 0 ||
        preview.partyLedgerEntryCount > 0 ||
        preview.openingBalanceCount > 0 ||
        preview.inventoryMovementCount > 0 ||
        preview.partyItemRelationCount > 0)
  );

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{ sx: { borderRadius: 3 } }}
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1.5, pb: 2 }}>
        <Box sx={{ display: 'flex', p: 1, borderRadius: 2, bgcolor: 'error.lighter', color: 'error.main' }}>
          <IconAlertTriangle size={24} />
        </Box>
        <Typography variant="h4" fontWeight={700}>
          حذف نهائي
        </Typography>
      </DialogTitle>

      <DialogContent sx={{ pt: 1 }}>
        {isLoading && <Typography color="text.secondary">جارِ تجهيز ملخص الحذف...</Typography>}
        {errorMessage && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {errorMessage}
          </Alert>
        )}

        {!isLoading && preview && (
          <Box sx={{ display: 'grid', gap: 2.5 }}>
            <Alert severity={showDependencies ? 'warning' : 'success'} variant="outlined">
              {showDependencies
                ? 'هذا الطرف مرتبط بفواتير أو سندات أو حركات مالية. يمكنك التراجع، أو حذف الطرف وجميع البيانات المرتبطة به نهائيًا.'
                : 'هذا الطرف غير مرتبط بأي معاملات ويمكن حذفه نهائيًا.'}
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
                <TextField fullWidth label="بنود فواتير البيع" value={preview.salesInvoiceLineCount} InputProps={{ readOnly: true }} />
              </Grid>
              <Grid item xs={6} md={3}>
                <TextField fullWidth label="فواتير الشراء" value={preview.purchaseInvoiceCount} InputProps={{ readOnly: true }} />
              </Grid>
              <Grid item xs={6} md={3}>
                <TextField fullWidth label="بنود فواتير الشراء" value={preview.purchaseInvoiceLineCount} InputProps={{ readOnly: true }} />
              </Grid>
              <Grid item xs={6} md={3}>
                <TextField fullWidth label="مرتجعات البيع" value={preview.salesReturnCount} InputProps={{ readOnly: true }} />
              </Grid>
              <Grid item xs={6} md={3}>
                <TextField fullWidth label="بنود مرتجعات البيع" value={preview.salesReturnLineCount} InputProps={{ readOnly: true }} />
              </Grid>
              <Grid item xs={6} md={3}>
                <TextField fullWidth label="مرتجعات الشراء" value={preview.purchaseReturnCount} InputProps={{ readOnly: true }} />
              </Grid>
              <Grid item xs={6} md={3}>
                <TextField fullWidth label="بنود مرتجعات الشراء" value={preview.purchaseReturnLineCount} InputProps={{ readOnly: true }} />
              </Grid>
              <Grid item xs={6} md={3}>
                <TextField fullWidth label="سندات القبض" value={preview.treasuryReceiptCount} InputProps={{ readOnly: true }} />
              </Grid>
              <Grid item xs={6} md={3}>
                <TextField fullWidth label="سندات الصرف" value={preview.treasuryPaymentCount} InputProps={{ readOnly: true }} />
              </Grid>
              <Grid item xs={6} md={3}>
                <TextField fullWidth label="حركات الخزانة" value={preview.treasuryMovementCount} InputProps={{ readOnly: true }} />
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
                <TextField fullWidth label="الرصيد الحالي" value={preview.currentBalance.toFixed(2)} InputProps={{ readOnly: true, endAdornment: <InputAdornment position="end">{formatNature(preview.currentBalanceNature)}</InputAdornment> }} />
              </Grid>
              <Grid item xs={6} md={3}>
                <TextField fullWidth label="الربط اللوجستي" value={preview.inventoryMovementCount} InputProps={{ readOnly: true }} />
              </Grid>
              <Grid item xs={6} md={3}>
                <TextField fullWidth label="العناوين" value={preview.addressCount} InputProps={{ readOnly: true }} />
              </Grid>
              <Grid item xs={6} md={3}>
                <TextField fullWidth label="جهات الاتصال" value={preview.contactCount} InputProps={{ readOnly: true }} />
              </Grid>
              <Grid item xs={6} md={3}>
                <TextField
                  fullWidth
                  label="الحذف النهائي"
                  value={preview.canDelete ? 'مسموح' : 'يتطلب مراجعة'}
                  InputProps={{ readOnly: true, endAdornment: <InputAdornment position="end">{preview.canDelete ? '✓' : '!'}</InputAdornment> }}
                />
              </Grid>
            </Grid>

            {stage === 'choice' && showDependencies && (
              <Alert severity="warning">
                سيؤدي الحذف إلى إزالة كل الفواتير، السندات، الحركات المالية، والتأثيرات المرتبطة بهذا الطرف.
              </Alert>
            )}

            {stage === 'confirm' && (
              <>
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
                    <Box sx={{ display: 'grid', gap: 2 }}>
                      <TextField
                        fullWidth
                        type="password"
                        label="كلمة مرور المالك"
                        value={ownerPassword}
                        onChange={(event) => {
                          setOwnerPassword(event.target.value);
                          setError('');
                        }}
                        disabled={isProcessing}
                      />
                      <TextField
                        fullWidth
                        label="كود الطرف للتأكيد"
                        value={confirmationCode}
                        onChange={(event) => {
                          setConfirmationCode(event.target.value);
                          setError('');
                        }}
                        disabled={isProcessing}
                      />
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField fullWidth label="RowVersion" value={preview.rowVersion} InputProps={{ readOnly: true }} />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField fullWidth label="Preview Token" value={preview.previewToken} InputProps={{ readOnly: true }} />
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
                  label="أؤكد أنني أريد حذف هذا الطرف وكل البيانات المرتبطة به نهائيًا"
                />

                {error && <Alert severity="error">{error}</Alert>}
              </>
            )}
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3 }}>
        {stage === 'choice' ? (
          <>
            <Button onClick={handleClose} disabled={isProcessing} color="inherit" sx={{ borderRadius: 2, px: 3 }}>
              إلغاء والرجوع
            </Button>
            <Button
              onClick={handleProceed}
              variant="contained"
              color="error"
              disabled={isProcessing || !preview}
              startIcon={<IconArrowRight size={18} />}
              sx={{ borderRadius: 2, px: 3, boxShadow: 2 }}
            >
              حذف الطرف وكل البيانات المرتبطة
            </Button>
          </>
        ) : (
          <>
            <Button onClick={handleBack} disabled={isProcessing} color="inherit" sx={{ borderRadius: 2, px: 3 }}>
              إلغاء والرجوع
            </Button>
            <Button
              onClick={handleConfirm}
              variant="contained"
              color="error"
              disabled={isProcessing || !canSubmit}
              startIcon={<IconTrash size={18} />}
              sx={{ borderRadius: 2, px: 3, boxShadow: 2 }}
            >
              حذف الطرف وكل البيانات المرتبطة نهائيًا
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
}
