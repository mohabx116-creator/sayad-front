import { useEffect, useState } from 'react';

import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import { IconDownload, IconUpload, IconX } from '@tabler/icons-react';

import { useDispatch } from 'store';
import { openSnackbar } from 'store/slices/snackbar';
import { commitPartiesImport, downloadPartiesImportTemplate, previewPartiesImport } from '../api/partiesApi';
import type { PartyImportPreviewResultDto, PartyImportPreviewRowDto } from '../types/parties.types';

type PartyImportWizardProps = {
  open: boolean;
  onClose: () => void;
  onImported: () => Promise<void> | void;
};

function downloadBlob(blob: Blob, fileName: string) {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}

function groupErrors(row: PartyImportPreviewRowDto) {
  return row.errors.reduce<Record<string, string[]>>((acc, error) => {
    if (!acc[error.field]) {
      acc[error.field] = [];
    }

    acc[error.field].push(error.message);
    return acc;
  }, {});
}

function ErrorList({ messages }: { messages: string[] }) {
  if (messages.length === 0) {
    return null;
  }

  return (
    <Stack spacing={0.25} sx={{ mt: 0.5 }}>
      {messages.map((message, index) => (
        <Typography key={`${message}-${index}`} variant="caption" color="error">
          {message}
        </Typography>
      ))}
    </Stack>
  );
}

export default function PartyImportWizard({ open, onClose, onImported }: PartyImportWizardProps) {
  const dispatch = useDispatch();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<PartyImportPreviewResultDto | null>(null);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  useEffect(() => {
    if (!open) {
      setFile(null);
      setPreview(null);
      setIsPreviewing(false);
      setIsImporting(false);
    }
  }, [open]);

  const notify = (message: string, severity: 'success' | 'error' = 'success') => {
    dispatch(openSnackbar({ open: true, message, variant: 'alert', severity }));
  };

  const canImport = Boolean(preview) && preview?.failedRows === 0 && !isImporting;

  const handleTemplateDownload = async () => {
    try {
      const blob = await downloadPartiesImportTemplate();
      downloadBlob(blob, 'parties-import-template.xlsx');
      notify('تم تحميل قالب الاستيراد بنجاح.');
    } catch (error) {
      notify(error instanceof Error ? error.message : 'تعذر تنزيل قالب الاستيراد.', 'error');
    }
  };

  const handlePreview = async () => {
    if (!file) {
      notify('اختر ملف Excel أولاً.', 'error');
      return;
    }

    try {
      setIsPreviewing(true);
      const response = await previewPartiesImport(file);
      setPreview(response);
      if (response.failedRows === 0) {
        notify('تمت معاينة الملف بنجاح.');
      }
    } catch (error) {
      notify(error instanceof Error ? error.message : 'تعذر معاينة ملف Excel.', 'error');
    } finally {
      setIsPreviewing(false);
    }
  };

  const handleCommit = async () => {
    if (!preview || preview.failedRows > 0) {
      return;
    }

    try {
      setIsImporting(true);
      await commitPartiesImport({ rows: preview.rows });
      await onImported();
      notify('تم استيراد الأطراف بنجاح.');
      onClose();
    } catch (error) {
      notify(error instanceof Error ? error.message : 'تعذر تنفيذ الاستيراد.', 'error');
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xl">
      <DialogTitle sx={{ pb: 1 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2}>
          <Stack spacing={0.5}>
            <Typography variant="h4">استيراد جماعي للأطراف</Typography>
            <Typography variant="body2" color="text.secondary">
              حمّل القالب، ثم ارفع ملف Excel بعد تعبئة الصفوف، وبعدها راجع المعاينة قبل التأكيد.
            </Typography>
          </Stack>
          <Button color="inherit" onClick={onClose} startIcon={<IconX size={18} />}>
            إغلاق
          </Button>
        </Stack>
      </DialogTitle>
      <DialogContent dividers>
        <Stack spacing={3}>
          <Alert severity="info">
            1. حمّل قالب الاستيراد. 2. اختر ملف Excel المكتمل. 3. اعرض المعاينة. 4. راجع الأخطاء إن وُجدت. 5. أكد الاستيراد.
          </Alert>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <Button variant="outlined" startIcon={<IconDownload size={18} />} onClick={handleTemplateDownload}>
              تحميل قالب الاستيراد
            </Button>
            <Button component="label" variant="outlined" startIcon={<IconUpload size={18} />}>
              اختيار ملف Excel
              <input
                type="file"
                hidden
                accept=".xlsx,.xlsm,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                onChange={(event) => {
                  const selected = event.target.files?.[0] ?? null;
                  setFile(selected);
                  setPreview(null);
                }}
              />
            </Button>
            <Button variant="contained" onClick={handlePreview} disabled={!file || isPreviewing}>
              {isPreviewing ? 'جارٍ المعاينة...' : 'عرض المعاينة'}
            </Button>
          </Stack>

          {file && <Alert severity="success">الملف المحدد: {file.name}</Alert>}

          {preview && (
            <Stack spacing={2}>
              <Alert severity={preview.failedRows === 0 ? 'success' : 'warning'}>
                الصفوف الكلية: {preview.totalRows}، الصالحة: {preview.validRows}، غير الصالحة: {preview.failedRows}
              </Alert>

              {preview.failedRows > 0 && <Alert severity="error">لا يمكن تأكيد الاستيراد قبل إصلاح جميع الأخطاء.</Alert>}

              <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2, maxHeight: 620 }}>
                <Table size="small" stickyHeader sx={{ minWidth: 1700 }}>
                  <TableHead>
                    <TableRow>
                      <TableCell width={70}>#</TableCell>
                      <TableCell>الاسم بالعربية</TableCell>
                      <TableCell>الاسم بالإنجليزية</TableCell>
                      <TableCell>نوع الطرف</TableCell>
                      <TableCell>الهاتف الرئيسي</TableCell>
                      <TableCell>الهاتف الثانوي</TableCell>
                      <TableCell>البريد الإلكتروني</TableCell>
                      <TableCell>العنوان</TableCell>
                      <TableCell>ملاحظات</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {preview.rows.map((row) => {
                      const errors = groupErrors(row);

                      return (
                        <TableRow key={row.rowNumber} hover sx={row.isValid ? undefined : { bgcolor: 'error.lighter' }}>
                          <TableCell>{row.rowNumber}</TableCell>
                          <TableCell>
                            <Typography variant="body2">{row.nameArabic || '-'}</Typography>
                            <ErrorList messages={errors.nameArabic ?? []} />
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">{row.nameEnglish || '-'}</Typography>
                            <ErrorList messages={errors.nameEnglish ?? []} />
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">{row.partyType || '-'}</Typography>
                            <ErrorList messages={errors.partyType ?? []} />
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">{row.primaryPhone || '-'}</Typography>
                            <ErrorList messages={errors.primaryPhone ?? []} />
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">{row.secondaryPhone || '-'}</Typography>
                            <ErrorList messages={errors.secondaryPhone ?? []} />
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">{row.email || '-'}</Typography>
                            <ErrorList messages={errors.email ?? []} />
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">{row.address || '-'}</Typography>
                            <ErrorList messages={errors.address ?? []} />
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">{row.notes || '-'}</Typography>
                            <ErrorList messages={errors.notes ?? []} />
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </Stack>
          )}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} color="inherit">
          إغلاق
        </Button>
        <Button onClick={handleCommit} variant="contained" disabled={!canImport}>
          {isImporting ? 'جارٍ الاستيراد...' : 'تأكيد الاستيراد'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
