import { useEffect, useMemo, useState } from 'react';
import { useIntl } from 'react-intl';

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
import { IconPackage, IconUpload, IconX } from '@tabler/icons-react';

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
import { commitItemsImport, downloadItemsImportTemplate, previewItemsImport } from '../api/inventoryApi';
import type {
  ItemImportCommitResultDto,
  ItemImportPreviewResultDto,
  ItemImportPreviewRowDto
} from '../types/inventory.types';
import { getItemTypeLabel } from '../utils/inventory.constants';

type ItemImportWizardProps = {
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

function groupErrors(row: ItemImportPreviewRowDto) {
  return row.errors.reduce<Record<string, string[]>>((acc, error) => {
    if (!acc[error.field]) {
      acc[error.field] = [];
    }

    acc[error.field].push(error.message);
    return acc;
  }, {});
}

function BooleanValue({ value }: { value?: boolean | null }) {
  if (value == null) {
    return <Typography variant="body2">-</Typography>;
  }

  return <Typography variant="body2">{value ? 'نعم' : 'لا'}</Typography>;
}

function NumberValue({ value }: { value?: number | null }) {
  if (value == null) {
    return <Typography variant="body2">-</Typography>;
  }

  return <Typography variant="body2">{value}</Typography>;
}

export default function ItemImportWizard({ open, onClose, onImported }: ItemImportWizardProps) {
  const intl = useIntl();
  const theme = useTheme();
  const dispatch = useDispatch();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<ItemImportPreviewResultDto | null>(null);
  const [commitResult, setCommitResult] = useState<ItemImportCommitResultDto | null>(null);
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

  const canImport = useMemo(() => Boolean(preview) && (preview?.failedRows ?? 0) === 0 && !isImporting, [isImporting, preview]);

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
      const blob = await downloadItemsImportTemplate();
      downloadBlob(blob, 'items-import-template.xlsx');
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
      const response = await previewItemsImport(file);
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
      const result = await commitItemsImport({ rows: preview.rows });
      setCommitResult(result);
      await onImported();
      notify('تم استيراد الأصناف بنجاح.');
    } catch (error) {
      notify(error instanceof Error ? error.message : 'تعذر تنفيذ الاستيراد.', 'error');
    } finally {
      setIsImporting(false);
    }
  };

  const fieldMessages = (row: ItemImportPreviewRowDto, fields: string[]) => {
    const grouped = groupErrors(row);
    return fields.flatMap((field) => grouped[field] ?? []);
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
              <IconPackage size={24} stroke={1.75} />
            </Box>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                استيراد جماعي للأصناف
              </Typography>
              <Typography variant="body2" color="text.secondary">
                رفع ملف Excel لمعاينة وتدقيق الأصناف والأسعار والمخزون واستيرادها دفعة واحدة.
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
              title="تم استيراد الأصناف بنجاح!"
              subtitle="تم حفظ وإضافة بيانات الأصناف إلى المخزون بنجاح."
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
                      maxHeight: 560,
                      border: '1px solid',
                      borderColor: 'divider',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
                    }}
                  >
                    <Table size="small" stickyHeader sx={{ minWidth: 1700 }}>
                      <TableHead>
                        <TableRow>
                          <TableCell width={70} sx={{ fontWeight: 700, bgcolor: 'grey.100' }}>#</TableCell>
                          <TableCell sx={{ fontWeight: 700, bgcolor: 'grey.100' }}>الاسم بالعربية</TableCell>
                          <TableCell sx={{ fontWeight: 700, bgcolor: 'grey.100' }}>الاسم بالإنجليزية</TableCell>
                          <TableCell sx={{ fontWeight: 700, bgcolor: 'grey.100' }}>نوع الصنف</TableCell>
                          <TableCell sx={{ fontWeight: 700, bgcolor: 'grey.100' }}>الوحدة الأساسية</TableCell>
                          <TableCell sx={{ fontWeight: 700, bgcolor: 'grey.100' }}>التصنيف</TableCell>
                          <TableCell sx={{ fontWeight: 700, bgcolor: 'grey.100' }}>SKU</TableCell>
                          <TableCell sx={{ fontWeight: 700, bgcolor: 'grey.100' }}>الباركود</TableCell>
                          <TableCell sx={{ fontWeight: 700, bgcolor: 'grey.100' }}>الوصف بالعربية</TableCell>
                          <TableCell sx={{ fontWeight: 700, bgcolor: 'grey.100' }}>الوصف بالإنجليزية</TableCell>
                          <TableCell sx={{ fontWeight: 700, bgcolor: 'grey.100' }}>قابل للشراء</TableCell>
                          <TableCell sx={{ fontWeight: 700, bgcolor: 'grey.100' }}>قابل للبيع</TableCell>
                          <TableCell sx={{ fontWeight: 700, bgcolor: 'grey.100' }}>الحد الأدنى</TableCell>
                          <TableCell sx={{ fontWeight: 700, bgcolor: 'grey.100' }}>إعادة الطلب</TableCell>
                          <TableCell sx={{ fontWeight: 700, bgcolor: 'grey.100' }}>السماح بالسالب</TableCell>
                          <TableCell sx={{ fontWeight: 700, bgcolor: 'grey.100' }}>سعر البيع الافتراضي</TableCell>
                          <TableCell sx={{ fontWeight: 700, bgcolor: 'grey.100' }}>الملاحظات</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {preview.rows.map((row) => {
                          const errors = groupErrors(row);
                          const itemTypeLabel = row.itemType ? getItemTypeLabel(intl, row.itemType) : '-';
                          const resolvedBaseUnit =
                            row.resolvedBaseUnitCode ||
                            row.resolvedBaseUnitNameArabic ||
                            row.baseUnitCode ||
                            row.baseUnitNameArabic ||
                            '-';
                          const resolvedCategory =
                            row.resolvedCategoryCode ||
                            row.resolvedCategoryNameArabic ||
                            row.categoryCode ||
                            row.categoryNameArabic ||
                            '-';
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
                                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                  {row.nameArabic || '-'}
                                </Typography>
                                <ImportPreviewErrorList messages={errors.nameArabic} />
                              </TableCell>
                              <TableCell>
                                <Typography variant="body2">{row.nameEnglish || '-'}</Typography>
                                <ImportPreviewErrorList messages={errors.nameEnglish} />
                              </TableCell>
                              <TableCell>
                                <Typography variant="body2">{itemTypeLabel}</Typography>
                                <ImportPreviewErrorList messages={errors.itemType} />
                              </TableCell>
                              <TableCell>
                                <Typography variant="body2">{resolvedBaseUnit}</Typography>
                                <ImportPreviewErrorList messages={fieldMessages(row, ['baseUnitCode', 'baseUnitNameArabic'])} />
                              </TableCell>
                              <TableCell>
                                <Typography variant="body2">{resolvedCategory}</Typography>
                                <ImportPreviewErrorList messages={fieldMessages(row, ['categoryCode', 'categoryNameArabic'])} />
                              </TableCell>
                              <TableCell>
                                <Typography variant="body2">{row.sku || '-'}</Typography>
                                <ImportPreviewErrorList messages={errors.sku} />
                              </TableCell>
                              <TableCell>
                                <Typography variant="body2">{row.barcode || '-'}</Typography>
                                <ImportPreviewErrorList messages={errors.barcode} />
                              </TableCell>
                              <TableCell>
                                <Typography variant="body2">{row.descriptionArabic || '-'}</Typography>
                                <ImportPreviewErrorList messages={errors.descriptionArabic} />
                              </TableCell>
                              <TableCell>
                                <Typography variant="body2">{row.descriptionEnglish || '-'}</Typography>
                                <ImportPreviewErrorList messages={errors.descriptionEnglish} />
                              </TableCell>
                              <TableCell>
                                <BooleanValue value={row.isPurchasable} />
                                <ImportPreviewErrorList messages={errors.isPurchasable} />
                              </TableCell>
                              <TableCell>
                                <BooleanValue value={row.isSellable} />
                                <ImportPreviewErrorList messages={errors.isSellable} />
                              </TableCell>
                              <TableCell>
                                <NumberValue value={row.minimumQuantity} />
                                <ImportPreviewErrorList messages={errors.minimumQuantity} />
                              </TableCell>
                              <TableCell>
                                <NumberValue value={row.reorderQuantity} />
                                <ImportPreviewErrorList messages={errors.reorderQuantity} />
                              </TableCell>
                              <TableCell>
                                <BooleanValue value={row.allowNegativeStock} />
                                <ImportPreviewErrorList messages={errors.allowNegativeStock} />
                              </TableCell>
                              <TableCell>
                                <NumberValue value={row.defaultSalePrice} />
                                <ImportPreviewErrorList messages={errors.defaultSalePrice} />
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
                ? `تأكيد الاستيراد (${preview.validRows} صنف)`
                : 'تأكيد الاستيراد'}
          </Button>
        </DialogActions>
      )}
    </Dialog>
  );
}
