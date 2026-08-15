import { useEffect, useState } from 'react';
import { useIntl } from 'react-intl';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Grid from '@mui/material/GridLegacy';
import IconButton from '@mui/material/IconButton';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import Tooltip from '@mui/material/Tooltip';
import { IconDeviceFloppy, IconEdit, IconPlus, IconScale, IconToggleLeft, IconToggleRight, IconTrash, IconX } from '@tabler/icons-react';

import PermissionGuard from 'modules/Administration/components/PermissionGuard';
import { ExcelActions } from 'shared/components/excel';
import { useDispatch } from 'store';
import { openSnackbar } from 'store/slices/snackbar';

import {
  activateUnit,
  createUnit,
  deactivateUnit,
  deleteUnit,
  downloadUnitsImportTemplate,
  exportUnitsToExcel,
  updateUnit
} from '../api/inventoryApi';
import UnitImportWizard from '../components/UnitImportWizard';
import { useInventoryUnits } from '../hooks/useInventory';
import type { CreateUnitRequest, UnitOfMeasureDto, UpdateUnitRequest } from '../types/inventory.types';
import { INVENTORY_PERMISSIONS } from '../utils/inventory.constants';

const emptyForm: CreateUnitRequest = {
  code: '',
  nameArabic: '',
  nameEnglish: '',
  symbolArabic: '',
  symbolEnglish: '',
  decimalPlaces: 0
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

type UnitsManagementDialogProps = {
  open: boolean;
  onClose: () => void;
};

export default function UnitsManagementDialog({ open, onClose }: UnitsManagementDialogProps) {
  const intl = useIntl();
  const theme = useTheme();
  const downSm = useMediaQuery(theme.breakpoints.down('sm'));
  const dispatch = useDispatch();
  const { items, isLoading, error, mutate } = useInventoryUnits();
  const [form, setForm] = useState<CreateUnitRequest>(emptyForm);
  const [editing, setEditing] = useState<UnitOfMeasureDto | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isImportWizardOpen, setIsImportWizardOpen] = useState(false);

  useEffect(() => {
    if (!open) {
      setEditing(null);
      setForm(emptyForm);
      setIsImportWizardOpen(false);
    }
  }, [open]);

  useEffect(() => {
    if (editing) {
      setForm({
        code: editing.code,
        nameArabic: editing.nameArabic,
        nameEnglish: editing.nameEnglish ?? '',
        symbolArabic: editing.symbolArabic ?? '',
        symbolEnglish: editing.symbolEnglish ?? '',
        decimalPlaces: editing.decimalPlaces
      });
      return;
    }

    setForm(emptyForm);
  }, [editing]);

  const notify = (message: string, severity: 'success' | 'error' = 'success') => {
    dispatch(openSnackbar({ open: true, message, variant: 'alert', severity }));
  };

  const handleExport = async () => {
    try {
      const blob = await exportUnitsToExcel();
      downloadBlob(blob, 'units-export.xlsx');
      notify('تم تصدير وحدات القياس إلى Excel بنجاح.');
    } catch (error) {
      notify(error instanceof Error ? error.message : 'تعذر تصدير وحدات القياس إلى Excel.', 'error');
    }
  };

  const handleTemplateDownload = async () => {
    try {
      const blob = await downloadUnitsImportTemplate();
      downloadBlob(blob, 'units-import-template.xlsx');
      notify('تم تحميل قالب الاستيراد بنجاح.');
    } catch (error) {
      notify(error instanceof Error ? error.message : 'تعذر تنزيل قالب الاستيراد.', 'error');
    }
  };

  const submit = async () => {
    try {
      setIsSaving(true);
      if (editing) {
        const request: UpdateUnitRequest = {
          nameArabic: form.nameArabic,
          nameEnglish: form.nameEnglish || null,
          symbolArabic: form.symbolArabic || null,
          symbolEnglish: form.symbolEnglish || null,
          decimalPlaces: Number(form.decimalPlaces),
          rowVersion: editing.rowVersion
        };
        await updateUnit(editing.id, request);
      } else {
        await createUnit(form);
      }

      await mutate();
      setEditing(null);
      notify(intl.formatMessage({ id: 'inventory-action-success' }));
    } catch (saveError) {
      notify(saveError instanceof Error ? saveError.message : intl.formatMessage({ id: 'inventory-action-failed' }), 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const toggle = async (unit: UnitOfMeasureDto) => {
    if (unit.isSystem) {
      notify(intl.formatMessage({ id: 'system-unit-protected' }), 'error');
      return;
    }

    try {
      setIsSaving(true);
      await (unit.isActive ? deactivateUnit(unit.id) : activateUnit(unit.id));
      await mutate();
      notify(intl.formatMessage({ id: 'inventory-action-success' }));
    } catch (actionError) {
      notify(actionError instanceof Error ? actionError.message : intl.formatMessage({ id: 'inventory-action-failed' }), 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('هل أنت متأكد من الحذف؟')) {
      try {
        setIsSaving(true);
        await deleteUnit(id);
        await mutate();
        notify(intl.formatMessage({ id: 'inventory-action-success' }));
      } catch (err) {
        notify(err instanceof Error ? err.message : intl.formatMessage({ id: 'inventory-action-failed' }), 'error');
      } finally {
        setIsSaving(false);
      }
    }
  };

  const handleDeleteAllCustom = async () => {
    if (!window.confirm('هل أنت متأكد من حذف كافة الوحدات المخصصة نهائيًا؟')) {
      return;
    }

    try {
      setIsSaving(true);
      const customUnits = items.filter((unit) => !unit.isSystem);
      for (const unit of customUnits) {
        await deleteUnit(unit.id);
      }
      await mutate();
      notify('تم الحذف بنجاح.');
    } catch (err) {
      notify(err instanceof Error ? err.message : 'حدث خطأ أثناء الحذف.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} fullWidth maxWidth="xl" fullScreen={downSm} PaperProps={{ sx: { borderRadius: downSm ? 0 : 3 } }}>
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
                <IconScale size={24} stroke={1.75} />
              </Box>
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                  إدارة وحدات القياس
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  عرض وحدات القياس وإنشاؤها وتعديلها وإدارتها من داخل نافذة واحدة.
                </Typography>
              </Box>
            </Stack>
            <IconButton onClick={onClose} size="small" sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1.5 }}>
              <IconX size={18} />
            </IconButton>
          </Stack>
        </DialogTitle>

        <DialogContent dividers sx={{ p: { xs: 2, sm: 3 } }}>
          <Grid container spacing={3}>
            <Grid item xs={12} lg={8}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2, mb: 2, flexWrap: 'wrap' }}>
                <Typography variant="body2" color="text.secondary">
                  إدارة الوحدات الأساسية ووحدات التحويل المرتبطة بالأصناف والعمليات.
                </Typography>

                <Stack direction="row" spacing={1.25} alignItems="center" flexWrap="wrap">
                  <ExcelActions
                    onExport={handleExport}
                    onDownloadTemplate={handleTemplateDownload}
                    onImportClick={() => setIsImportWizardOpen(true)}
                    templatePermission={INVENTORY_PERMISSIONS.unitsManage}
                    importPermission={INVENTORY_PERMISSIONS.unitsManage}
                    size="small"
                  />
                  <Button
                    variant="outlined"
                    color="error"
                    size="small"
                    onClick={handleDeleteAllCustom}
                    disabled={isSaving || items.filter((unit) => !unit.isSystem).length === 0}
                  >
                    حذف الوحدات المخصصة
                  </Button>
                </Stack>
              </Box>

              <Box sx={{ borderRadius: 2, border: '1px solid', borderColor: 'divider', overflow: 'hidden' }}>
                {isLoading && (
                  <Box sx={{ p: 4, display: 'flex', justifyContent: 'center' }}>
                    <CircularProgress />
                  </Box>
                )}

                {error && (
                  <Box sx={{ p: 4, textAlign: 'center' }}>
                    <Typography color="error">تعذر تحميل الوحدات.</Typography>
                  </Box>
                )}

                {!isLoading && items.length === 0 && (
                  <Box sx={{ p: 6, textAlign: 'center' }}>
                    <Typography color="text.secondary">لا توجد وحدات قياس حالياً.</Typography>
                  </Box>
                )}

                {items.length > 0 && (
                  <TableContainer component={Paper} variant="outlined" sx={{ border: 'none', borderRadius: 0, maxHeight: 640 }}>
                    <Table size="medium" stickyHeader>
                      <TableHead sx={{ bgcolor: 'grey.50' }}>
                        <TableRow>
                          <TableCell>كود الوحدة</TableCell>
                          <TableCell>الاسم</TableCell>
                          <TableCell>الرمز</TableCell>
                          <TableCell>الخانات العشرية</TableCell>
                          <TableCell>الحالة</TableCell>
                          <TableCell align="right">الإجراءات</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {items.map((unit) => (
                          <TableRow key={unit.id} hover>
                            <TableCell sx={{ fontWeight: 600, color: 'primary.main' }}>{unit.code}</TableCell>
                            <TableCell sx={{ fontWeight: 500 }}>
                              <Stack direction="row" spacing={1} alignItems="center">
                                <span>{unit.nameArabic}</span>
                                {unit.isSystem && (
                                  <Chip
                                    size="small"
                                    label="نظامي"
                                    sx={{ height: 20, fontSize: '0.7rem', bgcolor: 'primary.lighter', color: 'primary.main', border: 'none' }}
                                  />
                                )}
                              </Stack>
                            </TableCell>
                            <TableCell>
                              <Chip size="small" label={unit.symbolArabic || unit.symbolEnglish || '-'} variant="outlined" sx={{ borderRadius: 1 }} />
                            </TableCell>
                            <TableCell>{unit.decimalPlaces}</TableCell>
                            <TableCell>
                              <Chip
                                label={unit.isActive ? 'نشط' : 'غير نشط'}
                                color={unit.isActive ? 'success' : 'default'}
                                size="small"
                                sx={{
                                  bgcolor: unit.isActive ? 'success.lighter' : 'grey.100',
                                  color: unit.isActive ? 'success.dark' : 'text.secondary',
                                  border: 'none',
                                  fontWeight: 600
                                }}
                              />
                            </TableCell>
                            <TableCell align="right">
                              <Stack direction="row" spacing={1} justifyContent="flex-end">
                                <PermissionGuard permission={INVENTORY_PERMISSIONS.unitsManage}>
                                  <Tooltip title="تعديل">
                                    <span>
                                      <IconButton size="small" onClick={() => setEditing(unit)} disabled={unit.isSystem} color="primary">
                                        <IconEdit size={18} />
                                      </IconButton>
                                    </span>
                                  </Tooltip>
                                  {!unit.isSystem && (
                                    <Tooltip title="حذف">
                                      <span>
                                        <IconButton size="small" onClick={() => handleDelete(unit.id)} disabled={isSaving} color="error">
                                          <IconTrash size={18} />
                                        </IconButton>
                                      </span>
                                    </Tooltip>
                                  )}
                                  <Tooltip title={unit.isActive ? 'تعطيل' : 'تفعيل'}>
                                    <span>
                                      <IconButton size="small" onClick={() => toggle(unit)} disabled={isSaving || unit.isSystem} color={unit.isActive ? 'error' : 'success'}>
                                        {unit.isActive ? <IconToggleLeft size={18} /> : <IconToggleRight size={18} />}
                                      </IconButton>
                                    </span>
                                  </Tooltip>
                                </PermissionGuard>
                              </Stack>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </Box>
            </Grid>

            <Grid item xs={12} lg={4}>
              <PermissionGuard permission={INVENTORY_PERMISSIONS.unitsManage}>
                <Box
                  sx={{
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: 'divider',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
                    position: { lg: 'sticky' },
                    top: { lg: 20 },
                    p: 2.5
                  }}
                >
                  <Typography variant="h4" fontWeight={600} display="flex" alignItems="center" gap={1} sx={{ mb: 2 }}>
                    {editing ? <IconEdit size={20} /> : <IconPlus size={20} />}
                    {editing ? 'تعديل وحدة' : 'إنشاء وحدة'}
                  </Typography>

                  <Stack spacing={2.5}>
                    <TextField
                      required
                      fullWidth
                      size="small"
                      label="كود الوحدة"
                      value={form.code}
                      onChange={(event) => setForm({ ...form, code: event.target.value })}
                      disabled={Boolean(editing)}
                    />
                    <TextField
                      required
                      fullWidth
                      size="small"
                      label="الاسم بالعربية"
                      value={form.nameArabic}
                      onChange={(event) => setForm({ ...form, nameArabic: event.target.value })}
                    />
                    <TextField
                      fullWidth
                      size="small"
                      label="الاسم بالإنجليزية"
                      value={form.nameEnglish ?? ''}
                      onChange={(event) => setForm({ ...form, nameEnglish: event.target.value })}
                    />
                    <TextField
                      select
                      fullWidth
                      size="small"
                      label="الخانات العشرية"
                      value={form.decimalPlaces}
                      onChange={(event) => setForm({ ...form, decimalPlaces: Number(event.target.value) })}
                    >
                      {[0, 2, 3, 4].map((value) => (
                        <MenuItem key={value} value={value}>
                          {value}
                        </MenuItem>
                      ))}
                    </TextField>
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <TextField
                          fullWidth
                          size="small"
                          label="الرمز بالعربية"
                          value={form.symbolArabic ?? ''}
                          onChange={(event) => setForm({ ...form, symbolArabic: event.target.value })}
                        />
                      </Grid>
                      <Grid item xs={6}>
                        <TextField
                          fullWidth
                          size="small"
                          label="الرمز بالإنجليزية"
                          value={form.symbolEnglish ?? ''}
                          onChange={(event) => setForm({ ...form, symbolEnglish: event.target.value })}
                        />
                      </Grid>
                    </Grid>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', bgcolor: 'grey.50', p: 1, borderRadius: 1 }}>
                      استخدم عدد الخانات العشرية المناسب لطبيعة الوحدة.
                    </Typography>
                    <Stack direction="row" spacing={1.5} sx={{ mt: 2, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
                      <Button variant="contained" color="primary" onClick={submit} disabled={isSaving} fullWidth startIcon={<IconDeviceFloppy size={18} />}>
                        {editing ? 'حفظ' : 'إنشاء'}
                      </Button>
                      {editing && (
                        <Button variant="outlined" color="inherit" onClick={() => setEditing(null)} disabled={isSaving} fullWidth startIcon={<IconX size={18} />}>
                          إلغاء
                        </Button>
                      )}
                    </Stack>
                  </Stack>
                </Box>
              </PermissionGuard>
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2, bgcolor: theme.palette.mode === 'dark' ? 'background.paper' : 'grey.50' }}>
          <Button onClick={onClose} color="inherit" variant="outlined" size="small">
            إغلاق
          </Button>
        </DialogActions>
      </Dialog>

      <UnitImportWizard
        open={isImportWizardOpen}
        onClose={() => setIsImportWizardOpen(false)}
        onImported={async () => {
          await mutate();
        }}
      />
    </>
  );
}
