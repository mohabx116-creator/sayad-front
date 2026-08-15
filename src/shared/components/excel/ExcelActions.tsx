import { ReactNode } from 'react';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Stack from '@mui/material/Stack';
import { SxProps, Theme } from '@mui/material/styles';
import { IconDownload, IconFileSpreadsheet, IconUpload } from '@tabler/icons-react';

import PermissionGuard from 'modules/Administration/components/PermissionGuard';

export interface ExcelActionsProps {
  onExport?: () => void | Promise<void>;
  onDownloadTemplate?: () => void | Promise<void>;
  onImportClick?: () => void;
  exportPermission?: string;
  templatePermission?: string;
  importPermission?: string;
  isExporting?: boolean;
  isDownloadingTemplate?: boolean;
  exportLabel?: ReactNode;
  templateLabel?: ReactNode;
  importLabel?: ReactNode;
  size?: 'small' | 'medium';
  sx?: SxProps<Theme>;
}

export default function ExcelActions({
  onExport,
  onDownloadTemplate,
  onImportClick,
  exportPermission,
  templatePermission,
  importPermission,
  isExporting = false,
  isDownloadingTemplate = false,
  exportLabel = 'تصدير Excel',
  templateLabel = 'تحميل قالب الاستيراد',
  importLabel = 'استيراد جماعي',
  size = 'small',
  sx
}: ExcelActionsProps) {
  return (
    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems="center" flexWrap="wrap" sx={sx}>
      {onExport && (
        <PermissionGuard permission={exportPermission}>
          <Button
            variant="outlined"
            color="inherit"
            size={size}
            onClick={onExport}
            disabled={isExporting}
            startIcon={
              isExporting ? <CircularProgress size={16} color="inherit" /> : <IconFileSpreadsheet size={18} stroke={1.75} />
            }
            sx={{
              borderColor: 'divider',
              '&:hover': {
                borderColor: 'primary.main',
                bgcolor: 'action.hover'
              }
            }}
          >
            {exportLabel}
          </Button>
        </PermissionGuard>
      )}

      {onDownloadTemplate && (
        <PermissionGuard permission={templatePermission}>
          <Button
            variant="outlined"
            color="inherit"
            size={size}
            onClick={onDownloadTemplate}
            disabled={isDownloadingTemplate}
            startIcon={
              isDownloadingTemplate ? <CircularProgress size={16} color="inherit" /> : <IconDownload size={18} stroke={1.75} />
            }
            sx={{
              borderColor: 'divider',
              '&:hover': {
                borderColor: 'primary.main',
                bgcolor: 'action.hover'
              }
            }}
          >
            {templateLabel}
          </Button>
        </PermissionGuard>
      )}

      {onImportClick && (
        <PermissionGuard permission={importPermission}>
          <Button
            variant="contained"
            color="primary"
            size={size}
            onClick={onImportClick}
            startIcon={<IconUpload size={18} stroke={1.75} />}
            sx={{
              boxShadow: 'none',
              '&:hover': {
                boxShadow: 2
              }
            }}
          >
            {importLabel}
          </Button>
        </PermissionGuard>
      )}
    </Stack>
  );
}
