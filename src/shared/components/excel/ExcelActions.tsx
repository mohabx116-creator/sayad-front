import { MouseEvent, ReactNode, useState } from 'react';

import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { SxProps, Theme } from '@mui/material/styles';
import { IconChevronDown, IconDownload, IconFileSpreadsheet, IconUpload } from '@tabler/icons-react';

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
  label?: ReactNode;
  exportLabel?: ReactNode;
  templateLabel?: ReactNode;
  importLabel?: ReactNode;
  size?: 'small' | 'medium' | 'large';
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
  label = 'Excel',
  exportLabel = 'تصدير Excel',
  templateLabel = 'تحميل قالب الاستيراد',
  importLabel = 'استيراد جماعي',
  size = 'small',
  sx
}: ExcelActionsProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleAction = (action?: () => void | Promise<void>) => {
    handleClose();
    if (action) {
      void action();
    }
  };

  const isBusy = isExporting || isDownloadingTemplate;

  return (
    <>
      <Button
        id="excel-actions-button"
        aria-controls={open ? 'excel-actions-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
        variant="outlined"
        color="inherit"
        size={size}
        onClick={handleClick}
        disabled={isBusy}
        startIcon={
          isBusy ? (
            <CircularProgress size={16} color="inherit" />
          ) : (
            <IconFileSpreadsheet size={18} stroke={1.75} />
          )
        }
        endIcon={
          <IconChevronDown
            size={16}
            stroke={2}
            style={{
              transform: open ? 'rotate(180deg)' : 'none',
              transition: 'transform 0.2s ease-in-out'
            }}
          />
        }
        sx={{
          borderColor: 'divider',
          fontWeight: 600,
          whiteSpace: 'nowrap',
          '&:hover': {
            borderColor: 'primary.main',
            bgcolor: 'action.hover'
          },
          ...sx
        }}
      >
        {label}
      </Button>

      <Menu
        id="excel-actions-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          'aria-labelledby': 'excel-actions-button',
          dense: true,
          sx: { py: 0.5, minWidth: 190 }
        }}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right'
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right'
        }}
        slotProps={{
          paper: {
            sx: {
              borderRadius: 2,
              mt: 0.5,
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
              border: '1px solid',
              borderColor: 'divider'
            }
          }
        }}
      >
        {onExport && (
          <PermissionGuard permission={exportPermission}>
            <MenuItem onClick={() => handleAction(onExport)} disabled={isExporting} sx={{ py: 1, px: 1.5, gap: 1.25 }}>
              <ListItemIcon sx={{ minWidth: 'auto !important', color: 'text.secondary' }}>
                <IconFileSpreadsheet size={18} stroke={1.75} />
              </ListItemIcon>
              <ListItemText primaryTypographyProps={{ variant: 'body2', fontWeight: 500 }}>
                {exportLabel}
              </ListItemText>
            </MenuItem>
          </PermissionGuard>
        )}

        {onDownloadTemplate && (
          <PermissionGuard permission={templatePermission}>
            <MenuItem onClick={() => handleAction(onDownloadTemplate)} disabled={isDownloadingTemplate} sx={{ py: 1, px: 1.5, gap: 1.25 }}>
              <ListItemIcon sx={{ minWidth: 'auto !important', color: 'text.secondary' }}>
                <IconDownload size={18} stroke={1.75} />
              </ListItemIcon>
              <ListItemText primaryTypographyProps={{ variant: 'body2', fontWeight: 500 }}>
                {templateLabel}
              </ListItemText>
            </MenuItem>
          </PermissionGuard>
        )}

        {onImportClick && (
          <PermissionGuard permission={importPermission}>
            <MenuItem onClick={() => handleAction(onImportClick)} sx={{ py: 1, px: 1.5, gap: 1.25 }}>
              <ListItemIcon sx={{ minWidth: 'auto !important', color: 'primary.main' }}>
                <IconUpload size={18} stroke={1.75} />
              </ListItemIcon>
              <ListItemText primaryTypographyProps={{ variant: 'body2', fontWeight: 600, color: 'primary.main' }}>
                {importLabel}
              </ListItemText>
            </MenuItem>
          </PermissionGuard>
        )}
      </Menu>
    </>
  );
}
