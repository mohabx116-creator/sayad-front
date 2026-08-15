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
import { commitWorkersImport, downloadWorkersImportTemplate, previewWorkersImport } from '../api/workersApi';
import type { WorkerImportPreviewResultDto, WorkerImportPreviewRowDto } from '../types/workers.types';

type WorkerImportWizardProps = {
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

function groupErrors(row: WorkerImportPreviewRowDto) {
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

export default function WorkerImportWizard({ open, onClose, onImported }: WorkerImportWizardProps) {
  const dispatch = useDispatch();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<WorkerImportPreviewResultDto | null>(null);
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
      const blob = await downloadWorkersImportTemplate();
      downloadBlob(blob, 'workers-import-template.xlsx');
      notify('تم تنزيل قالب الاستيراد بنجاح.');
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
      const response = await previewWorkersImport(file);
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
      await commitWorkersImport({ rows: preview.rows });
      await onImported();
      notify('تم استيراد العمال بنجاح.');
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
            <Typography variant="h4">استيراد جماعي للعمال</Typography>
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
            1. حمّل قالب الاستيراد. 2. اختر ملف Excel المكتمل. 3. اعرض المعاينة. 4. راجع الأخطاء إن وجدت. 5. أكد الاستيراد.
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
              {isPreviewing ? 'جارِ المعاينة...' : 'عرض المعاينة'}
            </Button>
          </Stack>

          {file && <Alert severity="success">الملف المحدد: {file.name}</Alert>}

          {preview && (
            <Stack spacing={2}>
              <Alert severity={preview.failedRows === 0 ? 'success' : 'warning'}>
                الصفوف الكلية: {preview.totalRows}، الصالحة: {preview.validRows}، غير الصالحة: {preview.failedRows}
              </Alert>

              {preview.failedRows > 0 && (
                <Alert severity="error">لا يمكن تأكيد الاستيراد قبل إصلاح جميع الأخطاء.</Alert>
              )}

              <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2, maxHeight: 640 }}>
                <Table size="small" stickyHeader sx={{ minWidth: 2200 }}>
                  <TableHead>
                    <TableRow>
                      <TableCell width={70}>#</TableCell>
                      <TableCell>الكود</TableCell>
                      <TableCell>الاسم</TableCell>
                      <TableCell>رقم الهاتف</TableCell>
                      <TableCell>العنوان</TableCell>
                      <TableCell>كود الوظيفة التشغيلية</TableCell>
                      <TableCell>اسم الوظيفة التشغيلية</TableCell>
                      <TableCell>الحالة</TableCell>
                      <TableCell>تاريخ سريان الأجر</TableCell>
                      <TableCell>الأجر اليومي</TableCell>
                      <TableCell>أساس أيام الشهر</TableCell>
                      <TableCell>نوع بدل الوجبة</TableCell>
                      <TableCell>قيمة بدل الوجبة</TableCell>
                      <TableCell>طريقة احتساب الإضافي</TableCell>
                      <TableCell>معدل الإضافي</TableCell>
                      <TableCell>ملاحظات الأجر</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {preview.rows.map((row) => {
                      const errors = groupErrors(row);
                      return (
                        <TableRow key={row.rowNumber} hover sx={row.isValid ? undefined : { bgcolor: 'error.lighter' }}>
                          <TableCell>{row.rowNumber}</TableCell>
                          <TableCell>
                            <Typography variant="body2">{row.code || '-'}</Typography>
                            <ErrorList messages={errors.code ?? []} />
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">{row.name || '-'}</Typography>
                            <ErrorList messages={errors.name ?? []} />
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" dir="ltr">{row.mobileNumber || '-'}</Typography>
                            <ErrorList messages={errors.mobileNumber ?? []} />
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">{row.address || '-'}</Typography>
                            <ErrorList messages={errors.address ?? []} />
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">{row.operationalJobCode || '-'}</Typography>
                            <ErrorList messages={errors.operationalJobCode ?? []} />
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">{row.operationalJobName || '-'}</Typography>
                            <ErrorList messages={errors.operationalJobName ?? []} />
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">{row.isActive ? 'نعم' : 'لا'}</Typography>
                            <ErrorList messages={errors.isActive ?? []} />
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" dir="ltr">{row.wageEffectiveFrom || '-'}</Typography>
                            <ErrorList messages={errors.wageEffectiveFrom ?? []} />
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" dir="ltr">{row.dailyWage ?? '-'}</Typography>
                            <ErrorList messages={errors.dailyWage ?? []} />
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">{row.monthlyDaysBasis ?? '-'}</Typography>
                            <ErrorList messages={errors.monthlyDaysBasis ?? []} />
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">{row.mealAllowanceType || '-'}</Typography>
                            <ErrorList messages={errors.mealAllowanceType ?? []} />
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" dir="ltr">{row.mealAllowanceValue ?? '-'}</Typography>
                            <ErrorList messages={errors.mealAllowanceValue ?? []} />
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">{row.overtimeCalculationType || '-'}</Typography>
                            <ErrorList messages={errors.overtimeCalculationType ?? []} />
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" dir="ltr">{row.overtimeRate ?? '-'}</Typography>
                            <ErrorList messages={errors.overtimeRate ?? []} />
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">{row.wageNotes || '-'}</Typography>
                            <ErrorList messages={errors.wageNotes ?? []} />
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
          {isImporting ? 'جارِ الاستيراد...' : 'تأكيد الاستيراد'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
