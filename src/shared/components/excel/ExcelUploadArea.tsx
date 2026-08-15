import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';
import {
  IconCheck,
  IconDownload,
  IconEye,
  IconFileSpreadsheet,
  IconRefresh,
  IconTrash,
  IconUpload
} from '@tabler/icons-react';

export interface ExcelUploadAreaProps {
  file: File | null;
  onFileSelect: (file: File | null) => void;
  onPreview: () => void | Promise<void>;
  isPreviewing?: boolean;
  onDownloadTemplate?: () => void | Promise<void>;
  isDownloadingTemplate?: boolean;
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export default function ExcelUploadArea({
  file,
  onFileSelect,
  onPreview,
  isPreviewing = false,
  onDownloadTemplate,
  isDownloadingTemplate = false
}: ExcelUploadAreaProps) {
  const theme = useTheme();

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles && acceptedFiles.length > 0) {
        onFileSelect(acceptedFiles[0]);
      }
    },
    [onFileSelect]
  );

  const { getRootProps, getInputProps, isDragActive, isDragReject, open } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls', '.xlsm']
    },
    maxFiles: 1,
    multiple: false,
    noClick: Boolean(file)
  });

  return (
    <Stack spacing={2}>
      {!file ? (
        <Paper
          {...getRootProps()}
          variant="outlined"
          sx={{
            p: { xs: 3, sm: 4 },
            borderRadius: 3,
            borderStyle: 'dashed',
            borderWidth: 2,
            borderColor: isDragActive ? 'primary.main' : isDragReject ? 'error.main' : 'divider',
            bgcolor: isDragActive
              ? alpha(theme.palette.primary.main, 0.06)
              : theme.palette.mode === 'dark'
                ? 'background.paper'
                : 'grey.50',
            textAlign: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s ease-in-out',
            '&:hover': {
              borderColor: 'primary.main',
              bgcolor: alpha(theme.palette.primary.main, 0.04)
            }
          }}
        >
          <input {...getInputProps()} />
          <Stack spacing={2} alignItems="center">
            <Box
              sx={{
                width: 64,
                height: 64,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: alpha(theme.palette.success.main, 0.12),
                color: theme.palette.success.main
              }}
            >
              <IconFileSpreadsheet size={36} stroke={1.5} />
            </Box>

            <Box>
              <Typography variant="h5" sx={{ fontWeight: 600, mb: 0.5 }}>
                {isDragActive ? 'أفلت ملف Excel هنا الآن' : 'اسحب ملف Excel هنا أو اضغط للاختيار'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                صيغة الملف المدعومة: <Box component="span" sx={{ fontWeight: 600, color: 'text.primary' }}>.xlsx</Box>
              </Typography>
            </Box>

            <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap" justifyContent="center">
              <Button
                variant="contained"
                size="small"
                startIcon={<IconUpload size={18} />}
                onClick={(e) => {
                  e.stopPropagation();
                  open();
                }}
              >
                اختيار ملف من الجهاز
              </Button>

              {onDownloadTemplate && (
                <Button
                  variant="outlined"
                  color="inherit"
                  size="small"
                  startIcon={
                    isDownloadingTemplate ? <CircularProgress size={16} color="inherit" /> : <IconDownload size={18} />
                  }
                  onClick={(e) => {
                    e.stopPropagation();
                    void onDownloadTemplate();
                  }}
                  disabled={isDownloadingTemplate}
                >
                  تحميل القالب الفارغ
                </Button>
              )}
            </Stack>
          </Stack>
        </Paper>
      ) : (
        <Paper
          variant="outlined"
          sx={{
            p: 2.5,
            borderRadius: 3,
            borderColor: 'divider',
            bgcolor: theme.palette.mode === 'dark' ? 'background.paper' : 'grey.50'
          }}
        >
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            justifyContent="space-between"
            alignItems={{ xs: 'flex-start', sm: 'center' }}
            spacing={2}
          >
            <Stack direction="row" spacing={2} alignItems="center" sx={{ minWidth: 0, flex: 1 }}>
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: alpha(theme.palette.success.main, 0.12),
                  color: theme.palette.success.main,
                  flexShrink: 0
                }}
              >
                <IconFileSpreadsheet size={28} stroke={1.75} />
              </Box>

              <Box sx={{ minWidth: 0, flex: 1 }}>
                <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" sx={{ mb: 0.25 }}>
                  <Typography variant="subtitle1" noWrap sx={{ fontWeight: 600, maxWidth: 350 }}>
                    {file.name}
                  </Typography>
                  <Chip
                    size="small"
                    label={formatFileSize(file.size)}
                    variant="outlined"
                    sx={{ height: 22, fontSize: '0.75rem' }}
                  />
                  <Chip
                    size="small"
                    label="جاهز للمعاينة"
                    color="success"
                    variant="filled"
                    icon={<IconCheck size={14} />}
                    sx={{ height: 22, fontSize: '0.75rem' }}
                  />
                </Stack>
                <Typography variant="caption" color="text.secondary">
                  انقر على &quot;عرض المعاينة&quot; لفحص ومراجعة الصفوف قبل الاستيراد.
                </Typography>
              </Box>
            </Stack>

            <Stack direction="row" spacing={1} alignItems="center">
              <Button
                variant="outlined"
                color="inherit"
                size="small"
                startIcon={<IconRefresh size={16} />}
                onClick={() => {
                  onFileSelect(null);
                  setTimeout(() => open(), 50);
                }}
              >
                تغيير الملف
              </Button>

              <IconButton
                color="error"
                size="small"
                title="حذف الملف"
                onClick={() => onFileSelect(null)}
                sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1.5 }}
              >
                <IconTrash size={18} />
              </IconButton>

              <Button
                variant="contained"
                color="primary"
                size="small"
                onClick={onPreview}
                disabled={isPreviewing}
                startIcon={
                  isPreviewing ? <CircularProgress size={16} color="inherit" /> : <IconEye size={18} />
                }
              >
                {isPreviewing ? 'جارِ فحص الملف...' : 'عرض المعاينة'}
              </Button>
            </Stack>
          </Stack>
        </Paper>
      )}
    </Stack>
  );
}
