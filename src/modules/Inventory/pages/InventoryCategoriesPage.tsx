import { useEffect, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
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
import { IconEdit, IconToggleLeft, IconToggleRight } from '@tabler/icons-react';

import PermissionGuard from 'modules/Administration/components/PermissionGuard';
import { ExcelActions } from 'shared/components/excel';
import { useDispatch } from 'store';
import { openSnackbar } from 'store/slices/snackbar';
import Breadcrumbs from 'ui-component/extended/Breadcrumbs';
import Loader from 'ui-component/Loader';
import MainCard from 'ui-component/cards/MainCard';
import { activateCategory, createCategory, deactivateCategory, downloadCategoriesImportTemplate, exportCategoriesToExcel, updateCategory } from '../api/inventoryApi';
import CategoryImportWizard from '../components/CategoryImportWizard';
import { useInventoryCategories } from '../hooks/useInventory';
import type { CreateCategoryRequest, ItemCategoryDto, UpdateCategoryRequest } from '../types/inventory.types';
import { INVENTORY_PERMISSIONS } from '../utils/inventory.constants';

const emptyForm: CreateCategoryRequest = {
  nameArabic: '',
  nameEnglish: '',
  notes: '',
  parentCategoryId: ''
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

export default function InventoryCategoriesPage() {
  const intl = useIntl();
  const dispatch = useDispatch();
  const { items, isLoading, error, mutate } = useInventoryCategories();
  const [form, setForm] = useState<CreateCategoryRequest>(emptyForm);
  const [editing, setEditing] = useState<ItemCategoryDto | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isImportWizardOpen, setIsImportWizardOpen] = useState(false);

  useEffect(() => {
    if (editing) {
      setForm({
        nameArabic: editing.nameArabic,
        nameEnglish: editing.nameEnglish ?? '',
        notes: editing.notes ?? '',
        parentCategoryId: editing.parentCategoryId ?? ''
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
      const blob = await exportCategoriesToExcel();
      downloadBlob(blob, 'categories-export.xlsx');
      notify('تم تصدير التصنيفات إلى Excel بنجاح.');
    } catch (error) {
      notify(error instanceof Error ? error.message : 'تعذر تصدير التصنيفات إلى Excel.', 'error');
    }
  };

  const handleTemplateDownload = async () => {
    try {
      const blob = await downloadCategoriesImportTemplate();
      downloadBlob(blob, 'categories-import-template.xlsx');
      notify('تم تحميل قالب الاستيراد بنجاح.');
    } catch (error) {
      notify(error instanceof Error ? error.message : 'تعذر تنزيل قالب الاستيراد.', 'error');
    }
  };

  const refresh = async () => {
    await mutate();
  };

  const submit = async () => {
    try {
      setIsSaving(true);
      if (editing) {
        const request: UpdateCategoryRequest = { ...form, parentCategoryId: form.parentCategoryId || null, rowVersion: editing.rowVersion };
        await updateCategory(editing.id, request);
      } else {
        await createCategory({ ...form, parentCategoryId: form.parentCategoryId || null });
      }
      await refresh();
      setEditing(null);
      notify(intl.formatMessage({ id: 'inventory-action-success' }));
    } catch (saveError) {
      notify(saveError instanceof Error ? saveError.message : intl.formatMessage({ id: 'inventory-action-failed' }), 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const toggle = async (category: ItemCategoryDto) => {
    try {
      setIsSaving(true);
      await (category.isActive ? deactivateCategory(category.id) : activateCategory(category.id));
      await refresh();
      notify(intl.formatMessage({ id: 'inventory-action-success' }));
    } catch (actionError) {
      notify(actionError instanceof Error ? actionError.message : intl.formatMessage({ id: 'inventory-action-failed' }), 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <Breadcrumbs custom heading="inventory-categories" links={[{ title: 'inventory' }, { title: 'inventory-categories' }]} />

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, gap: 2, flexWrap: 'wrap' }}>
        <Box>
          <Typography variant="h2" gutterBottom>
            <FormattedMessage id="inventory-categories" />
          </Typography>
          <Typography variant="body2" color="text.secondary">
            إدارة التصنيفات المستخدمة في الأصناف.
          </Typography>
        </Box>

        <ExcelActions
          onExport={handleExport}
          onDownloadTemplate={handleTemplateDownload}
          onImportClick={() => setIsImportWizardOpen(true)}
          templatePermission={INVENTORY_PERMISSIONS.categoriesManage}
          importPermission={INVENTORY_PERMISSIONS.categoriesManage}
          size="small"
        />
      </Box>

      <MainCard title={<FormattedMessage id="inventory-categories" />}>
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={12} md={5}>
            <TextField required fullWidth label={<FormattedMessage id="name-arabic" />} value={form.nameArabic} onChange={(event) => setForm({ ...form, nameArabic: event.target.value })} />
          </Grid>
          <Grid item xs={12} md={5}>
            <TextField fullWidth label={<FormattedMessage id="name-english" />} value={form.nameEnglish ?? ''} onChange={(event) => setForm({ ...form, nameEnglish: event.target.value })} />
          </Grid>
          <Grid item xs={12} md={2}>
            <TextField select fullWidth label={<FormattedMessage id="parent-category" />} value={form.parentCategoryId ?? ''} onChange={(event) => setForm({ ...form, parentCategoryId: event.target.value })}>
              <MenuItem value="">
                <FormattedMessage id="none" />
              </MenuItem>
              {items.filter((category) => !editing || category.id !== editing.id).map((category) => (
                <MenuItem key={category.id} value={category.id}>
                  {category.nameArabic}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12}>
            <TextField fullWidth multiline minRows={2} label={<FormattedMessage id="notes" />} value={form.notes ?? ''} onChange={(event) => setForm({ ...form, notes: event.target.value })} />
          </Grid>
          <Grid item xs={12}>
            <Stack direction="row" spacing={1}>
              <Button variant="contained" onClick={submit} disabled={isSaving}>
                <FormattedMessage id={editing ? 'save' : 'create'} />
              </Button>
              {editing && (
                <Button onClick={() => setEditing(null)} disabled={isSaving}>
                  <FormattedMessage id="cancel" />
                </Button>
              )}
            </Stack>
          </Grid>
        </Grid>

        {isLoading && <Loader />}
        {error && (
          <Typography color="error">
            <FormattedMessage id="inventory-load-error" />
          </Typography>
        )}
        {!isLoading && items.length === 0 && (
          <Typography>
            <FormattedMessage id="inventory-empty-items" />
          </Typography>
        )}
        {items.length > 0 && (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>
                    <FormattedMessage id="item-code" />
                  </TableCell>
                  <TableCell>
                    <FormattedMessage id="name" />
                  </TableCell>
                  <TableCell>
                    <FormattedMessage id="parent-category" />
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
                {items.map((category) => (
                  <TableRow key={category.id} hover>
                    <TableCell>{category.code}</TableCell>
                    <TableCell>{category.nameArabic}</TableCell>
                    <TableCell>{category.parentCategoryId ? items.find((parent) => parent.id === category.parentCategoryId)?.nameArabic ?? '-' : '-'}</TableCell>
                    <TableCell>{category.isActive ? <FormattedMessage id="active" /> : <FormattedMessage id="inactive" />}</TableCell>
                    <TableCell align="right">
                      <Stack direction="row" spacing={1} justifyContent="flex-end">
                        <PermissionGuard permission={INVENTORY_PERMISSIONS.categoriesManage}>
                          <Tooltip title={<FormattedMessage id="edit" />}>
                            <IconButton onClick={() => setEditing(category)}>
                              <IconEdit size={18} />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title={<FormattedMessage id={category.isActive ? 'deactivate' : 'activate'} />}>
                            <IconButton onClick={() => toggle(category)} disabled={isSaving}>
                              {category.isActive ? <IconToggleLeft size={18} /> : <IconToggleRight size={18} />}
                            </IconButton>
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

      <CategoryImportWizard
        open={isImportWizardOpen}
        onClose={() => setIsImportWizardOpen(false)}
        onImported={async () => {
          await mutate();
        }}
      />
    </>
  );
}
