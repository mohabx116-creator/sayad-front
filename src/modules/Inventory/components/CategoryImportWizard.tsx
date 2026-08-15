import { useEffect, useState } from 'react';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';
import { IconCategory, IconUpload, IconX } from '@tabler/icons-react';

import {
  ExcelUploadArea,
  ImportPreviewErrorList,
  ImportPreviewSummary,
  ImportStep,
  ImportStepIndicator,
  ImportSuccessState
} from 'shared/components/excel';
import { useDispatch } from 'store';
import { openSnackbar } from 'store/slices/snackbar';
import {
  commitCategoriesImport,
  downloadCategoriesImportTemplate,
  previewCategoriesImport
} from '../api/inventoryApi';
import type {
  CategoryImportCommitResultDto,
  CategoryImportPreviewResultDto,
  CategoryImportPreviewRowDto
} from '../types/inventory.types';

type CategoryImportWizardProps = {
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

function groupErrors(row: CategoryImportPreviewRowDto) {
  return row.errors.reduce<Record<string, string[]>>((acc, error) => {
    if (!acc[error.field]) {
      acc[error.field] = [];
    }

    acc[error.field].push(error.message);
    return acc;
  }, {});
}

export default function CategoryImportWizard({ open, onClose, onImported }: CategoryImportWizardProps) {
  const theme = useTheme();
  const dispatch = useDispatch();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<CategoryImportPreviewResultDto | null>(null);
  const [commitResult, setCommitResult] = useState<CategoryImportCommitResultDto | null>(null);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [isDownloadingTemplate, setIsDownloadingTemplate] = useState(false);

  useEffect(() => {
    if (!open) {
      setFile(null);
      setPreview(null);
      setCommitResult(null);
      setIsPreviewing(false);
      setIsImporting(false);
      setIsDownloadingTemplate(false);
    }
  }, [open]);

  const notify = (message: string, severity: 'success' | 'error' = 'success') => {
    dispatch(openSnackbar({ open: true, message, variant: 'alert', severity }));
  };

  const canImport = Boolean(preview) && (preview?.failedRows ?? 0) === 0 && !isImporting;

  let currentStep: ImportStep = 1;
  if (commitResult) {
    currentStep = 4;
  } else if (preview) {
    currentStep = preview.failedRows > 0 ? 3 : 4;
  } else if (file) {
    currentStep = 2;
  }

  const handleTemplateDownload = async () => {
    try {
      setIsDownloadingTemplate(true);
      const blob = await downloadCategoriesImportTemplate();
      downloadBlob(blob, 'categories-import-template.xlsx');
      notify('تم تحميل قالب الاستيراد بنجاح.');
    } catch (error) {
      notify(error instanceof Error ? error.message : 'تعذر تنزيل قالب الاستيراد.', 'error');
    } finally {
      setIsDownloadingTemplate(false);
    }
  };

  const handlePreview = async () => {
    if (!file) {
      notify('اختر ملف Excel أولاً.', 'error');
      return;
    }

    try {
      setIsPreviewing(true);
      const response = await previewCategoriesImport(file);
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
      const result = await commitCategoriesImport({ rows: preview.rows });
      setCommitResult(result);
      await onImported();
      notify('تم استيراد التصنيفات بنجاح.');
    } catch (error) {
      notify(error instanceof Error ? error.message : 'تعذر تنفيذ الاستيراد.', 'error');
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xl">
      <DialogTitle sx={{ p: 2.5, pb: 2 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2}>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Box
              sx={{
                width: 42,
                height: 42,
                borderRadius: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                color: theme.palette.primary.main
              }}
            >
              <IconCategory size={24} stroke={1.75} />
            </Box>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                استيراد جماعي للتصنيفات
              </Typography>
              <Typography variant="body2" color="text.secondary">
                رفع ملف Excel لمعاينة وتدقيق تصنيفات الأصناف واستيرادها دفعة واحدة.
              </Typography>
            </Box>
          </Stack>
          <IconButton onClick={onClose} size="small" sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1.5 }}>
            <IconX size={18} />
          </IconButton>
        </Stack>
      </DialogTitle>

      <DialogContent dividers sx={{ p: { xs: 2, sm: 3 } }}>
        <Stack spacing={3}>
          <ImportStepIndicator
            currentStep={currentStep}
            hasErrors={Boolean(preview && preview.failedRows > 0)}
            isSuccess={Boolean(commitResult)}
          />

          {commitResult ? (
            <ImportSuccessState
              totalRows={commitResult.totalRows}
              importedRows={commitResult.importedRows}
              failedRows={commitResult.failedRows}
              onClose={onClose}
              title="تم استيراد التصنيفات بنجاح!"
              subtitle="تم حفظ وإضافة التصنيفات إلى النظام بنجاح."
            />
          ) : (
            <>
              <ExcelUploadArea
                file={file}
                onFileSelect={(selected) => {
                  setFile(selected);
                  setPreview(null);
                }}
                onPreview={handlePreview}
                isPreviewing={isPreviewing}
                onDownloadTemplate={handleTemplateDownload}
                isDownloadingTemplate={isDownloadingTemplate}
              />

              {preview && (
                <Stack spacing={2.5}>
                  <ImportPreviewSummary
                    totalRows={preview.totalRows}
                    validRows={preview.validRows}
                    failedRows={preview.failedRows}
                  />

                  <TableContainer
                    component={Paper}
                    variant="outlined"
                    sx={{
                      borderRadius: 2.5,
                      maxHeight: 520,
                      border: '1px solid',
                      borderColor: 'divider',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
                    }}
                  >
                    <Table size="small" stickyHeader>
                      <TableHead>
                        <TableRow>
                          <TableCell width={70} sx={{ fontWeight: 700, bgcolor: 'grey.100' }}>#</TableCell>
                          <TableCell sx={{ fontWeight: 700, bgcolor: 'grey.100' }}>الاسم بالعربية</TableCell>
                          <TableCell sx={{ fontWeight: 700, bgcolor: 'grey.100' }}>الاسم بالإنجليزية</TableCell>
                          <TableCell sx={{ fontWeight: 700, bgcolor: 'grey.100' }}>الملاحظات</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {preview.rows.map((row) => {
                          const errors = groupErrors(row);
                          const hasRowError = !row.isValid;
                          return (
                            <TableRow
                              key={row.rowNumber}
                              hover
                              sx={{
                                bgcolor: hasRowError ? alpha(theme.palette.error.main, 0.04) : undefined,
                                '&:hover': {
                                  bgcolor: hasRowError
                                    ? `${alpha(theme.palette.error.main, 0.08)} !important`
                                    : undefined
                                }
                              }}
                            >
                              <TableCell sx={{ fontWeight: 600, color: hasRowError ? 'error.main' : 'text.secondary' }}>
                                {row.rowNumber}
                              </TableCell>
                              <TableCell>
                                <Typography variant="body2">{row.nameArabic || '-'}</Typography>
                                <ImportPreviewErrorList messages={errors.nameArabic} />
                              </TableCell>
                              <TableCell>
                                <Typography variant="body2">{row.nameEnglish || '-'}</Typography>
                                <ImportPreviewErrorList messages={errors.nameEnglish} />
                              </TableCell>
                              <TableCell>
                                <Typography variant="body2">{row.notes || '-'}</Typography>
                                <ImportPreviewErrorList messages={errors.notes} />
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Stack>
              )}
            </>
          )}
        </Stack>
      </DialogContent>

      {!commitResult && (
        <DialogActions sx={{ px: 3, py: 2, bgcolor: theme.palette.mode === 'dark' ? 'background.paper' : 'grey.50' }}>
          <Button onClick={onClose} color="inherit" variant="outlined" size="small">
            إلغاء
          </Button>
          <Button
            onClick={handleCommit}
            variant="contained"
            color="primary"
            size="small"
            disabled={!canImport}
            startIcon={isImporting ? <CircularProgress size={16} color="inherit" /> : <IconUpload size={18} />}
          >
            {isImporting
              ? 'جارِ الاستيراد...'
              : preview && preview.validRows > 0
                ? `تأكيد الاستيراد (${preview.validRows} تصنيف)`
                : 'تأكيد الاستيراد'}
          </Button>
        </DialogActions>
      )}
    </Dialog>
  );
}
