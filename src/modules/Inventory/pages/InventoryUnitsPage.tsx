import { useEffect, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/GridLegacy';
import IconButton from '@mui/material/IconButton';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { IconDeviceFloppy, IconDownload, IconEdit, IconPlus, IconScale, IconToggleLeft, IconToggleRight, IconTrash, IconUpload, IconX } from '@tabler/icons-react';

import PermissionGuard from 'modules/Administration/components/PermissionGuard';
import { ExcelActions } from 'shared/components/excel';
import { useDispatch } from 'store';
import { openSnackbar } from 'store/slices/snackbar';
import Breadcrumbs from 'ui-component/extended/Breadcrumbs';
import Loader from 'ui-component/Loader';
import MainCard from 'ui-component/cards/MainCard';
import { activateUnit, createUnit, deactivateUnit, deleteUnit, downloadUnitsImportTemplate, exportUnitsToExcel, updateUnit } from '../api/inventoryApi';
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

export default function InventoryUnitsPage() {
  const intl = useIntl();
  const dispatch = useDispatch();
  const { items, isLoading, error, mutate } = useInventoryUnits();
  const [form, setForm] = useState<CreateUnitRequest>(emptyForm);
  const [editing, setEditing] = useState<UnitOfMeasureDto | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isImportWizardOpen, setIsImportWizardOpen] = useState(false);

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
      notify('تم تصدير الوحدات إلى Excel بنجاح.');
    } catch (error) {
      notify(error instanceof Error ? error.message : 'تعذر تصدير الوحدات إلى Excel.', 'error');
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
      <Breadcrumbs custom heading="inventory-units" links={[{ title: 'inventory', to: '/inventory/items' }, { title: 'inventory-units' }]} />

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3, gap: 2, flexWrap: 'wrap' }}>
        <Box>
          <Typography variant="h2" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconScale color="var(--mui-palette-primary-main)" size={28} />
            <FormattedMessage id="inventory-units" />
          </Typography>
          <Typography variant="body2" color="text.secondary">
            إدارة وحدات القياس المستخدمة في الأصناف وعمليات الشراء والبيع.
          </Typography>
        </Box>

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

      <Grid container spacing={3}>
        <Grid item xs={12} lg={8}>
          <MainCard content={false} sx={{ borderRadius: 2, border: '1px solid', borderColor: 'divider', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
            {isLoading && (
              <Box sx={{ p: 4, display: 'flex', justifyContent: 'center' }}>
                <Loader />
              </Box>
            )}
            {error && (
              <Box sx={{ p: 4, textAlign: 'center' }}>
                <Typography color="error">
                  <FormattedMessage id="inventory-load-error" />
                </Typography>
              </Box>
            )}
            {!isLoading && items.length === 0 && (
              <Box sx={{ p: 6, textAlign: 'center' }}>
                <Typography color="text.secondary">
                  <FormattedMessage id="inventory-empty-items" />
                </Typography>
              </Box>
            )}
            {items.length > 0 && (
              <TableContainer>
                <Table size="medium">
                  <TableHead sx={{ bgcolor: 'grey.50' }}>
                    <TableRow>
                      <TableCell>
                        <FormattedMessage id="unit-code" />
                      </TableCell>
                      <TableCell>
                        <FormattedMessage id="name" />
                      </TableCell>
                      <TableCell>
                        <FormattedMessage id="symbol" />
                      </TableCell>
                      <TableCell>
                        <FormattedMessage id="decimal-places" />
                      </TableCell>
                      <TableCell>
                        <FormattedMessage id="status" />
                      </TableCell>
                      <TableCell align="right">
                        <FormattedMessage id="actions" />
                      </TableCell>
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
                                label={<FormattedMessage id="system-unit" defaultMessage="نظام" />}
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
                            label={<FormattedMessage id={unit.isActive ? 'active' : 'inactive'} />}
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
                              <Tooltip title={<FormattedMessage id="edit" />}>
                                <span>
                                  <IconButton size="small" onClick={() => setEditing(unit)} disabled={unit.isSystem} color="primary">
                                    <IconEdit size={18} />
                                  </IconButton>
                                </span>
                              </Tooltip>
                              {!unit.isSystem && (
                                <Tooltip title={<FormattedMessage id="delete" defaultMessage="حذف" />}>
                                  <span>
                                    <IconButton size="small" onClick={() => handleDelete(unit.id)} disabled={isSaving} color="error">
                                      <IconTrash size={18} />
                                    </IconButton>
                                  </span>
                                </Tooltip>
                              )}
                              <Tooltip title={<FormattedMessage id={unit.isActive ? 'deactivate' : 'activate'} />}>
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
          </MainCard>
        </Grid>

        <Grid item xs={12} lg={4}>
          <PermissionGuard permission={INVENTORY_PERMISSIONS.unitsManage}>
            <MainCard
              title={
                <Typography variant="h4" fontWeight={600} display="flex" alignItems="center" gap={1}>
                  {editing ? <IconEdit size={20} /> : <IconPlus size={20} />}
                  <FormattedMessage id={editing ? 'edit-unit' : 'create-unit'} />
                </Typography>
              }
              sx={{ borderRadius: 2, border: '1px solid', borderColor: 'divider', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', position: 'sticky', top: 20 }}
            >
              <Stack spacing={2.5}>
                <TextField
                  required
                  fullWidth
                  size="small"
                  label={<FormattedMessage id="unit-code" />}
                  value={form.code}
                  onChange={(event) => setForm({ ...form, code: event.target.value })}
                  disabled={Boolean(editing)}
                />
                <TextField required fullWidth size="small" label={<FormattedMessage id="name-arabic" />} value={form.nameArabic} onChange={(event) => setForm({ ...form, nameArabic: event.target.value })} />
                <TextField fullWidth size="small" label={<FormattedMessage id="name-english" />} value={form.nameEnglish ?? ''} onChange={(event) => setForm({ ...form, nameEnglish: event.target.value })} />
                <TextField
                  select
                  fullWidth
                  size="small"
                  label={<FormattedMessage id="decimal-places" />}
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
                    <TextField fullWidth size="small" label={<FormattedMessage id="symbol-arabic" />} value={form.symbolArabic ?? ''} onChange={(event) => setForm({ ...form, symbolArabic: event.target.value })} />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField fullWidth size="small" label={<FormattedMessage id="symbol-english" />} value={form.symbolEnglish ?? ''} onChange={(event) => setForm({ ...form, symbolEnglish: event.target.value })} />
                  </Grid>
                </Grid>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', bgcolor: 'grey.50', p: 1, borderRadius: 1 }}>
                  <FormattedMessage id="unit-decimal-help" />
                </Typography>
                <Stack direction="row" spacing={1.5} sx={{ mt: 2, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
                  <Button variant="contained" color="primary" onClick={submit} disabled={isSaving} fullWidth startIcon={<IconDeviceFloppy size={18} />}>
                    <FormattedMessage id={editing ? 'save' : 'create'} />
                  </Button>
                  {editing && (
                    <Button variant="outlined" color="inherit" onClick={() => setEditing(null)} disabled={isSaving} fullWidth startIcon={<IconX size={18} />}>
                      <FormattedMessage id="cancel" />
                    </Button>
                  )}
                </Stack>
              </Stack>
            </MainCard>
          </PermissionGuard>
        </Grid>
      </Grid>

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
