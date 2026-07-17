import { useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { Link } from 'react-router-dom';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Grid from '@mui/material/GridLegacy';
import IconButton from '@mui/material/IconButton';
import MenuItem from '@mui/material/MenuItem';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import Skeleton from '@mui/material/Skeleton';

import { IconPlus, IconEdit, IconCheck, IconX } from '@tabler/icons-react';

import { useDispatch } from 'store';
import { openSnackbar } from 'store/slices/snackbar';
import Breadcrumbs from 'ui-component/extended/Breadcrumbs';
import PageTitle from 'ui-component/PageTitle';
import PermissionGuard from 'modules/Administration/components/PermissionGuard';
import CodeNameLabel from 'shared/components/CodeNameLabel';

import { useExpenseCategories } from '../hooks/useExpenses';
import { activateExpenseCategory, deactivateExpenseCategory } from '../api/expensesApi';
import { EXPENSES_PERMISSIONS } from '../utils/expense.constants';
import type { ExpenseCategoriesListParams } from '../types/expense.types';
import ExpenseCategoryStatusChip from '../components/ExpenseCategoryStatusChip';
import ExpenseConfirmationDialog from '../components/ExpenseConfirmationDialog';

export default function ExpenseCategoriesListPage() {
  const intl = useIntl();
  const dispatch = useDispatch();

  const [params, setParams] = useState<ExpenseCategoriesListParams>({
    page: 1,
    pageSize: 20,
    search: '',
    isActive: ''
  });
  const [searchInput, setSearchInput] = useState('');

  const [actionDialog, setActionDialog] = useState<{ open: boolean; action: 'activate' | 'deactivate'; id: string }>({
    open: false,
    action: 'activate',
    id: ''
  });
  const [isProcessing, setIsProcessing] = useState(false);

  const { items, meta, isLoading, mutate } = useExpenseCategories(params);

  const notify = (message: string, severity: 'success' | 'error' = 'success') => {
    dispatch(openSnackbar({ open: true, message, variant: 'alert', severity }));
  };

  const handleSearch = () => {
    setParams({ ...params, page: 1, search: searchInput });
  };

  const handleConfirmAction = async () => {
    setIsProcessing(true);
    try {
      if (actionDialog.action === 'activate') {
        await activateExpenseCategory(actionDialog.id);
        notify(intl.formatMessage({ id: 'expenses.category-activated', defaultMessage: 'تم تفعيل التصنيف بنجاح' }));
      } else if (actionDialog.action === 'deactivate') {
        await deactivateExpenseCategory(actionDialog.id);
        notify(intl.formatMessage({ id: 'expenses.category-deactivated', defaultMessage: 'تم إيقاف التصنيف بنجاح' }));
      }
      mutate();
    } catch (error) {
      notify(error instanceof Error ? error.message : intl.formatMessage({ id: 'action-failed', defaultMessage: 'فشلت العملية' }), 'error');
    } finally {
      setIsProcessing(false);
      setActionDialog({ ...actionDialog, open: false });
    }
  };

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Breadcrumbs custom card={false} title={false} divider={false} heading="expenses.categories" links={[{ title: 'expenses', to: '/expenses' }, { title: 'expenses.categories' }]} sx={{ mb: 0 }} />
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', mt: 1 }}>
          <PageTitle>
            <FormattedMessage id="expenses.categories" defaultMessage="تصنيفات المصروفات" />
          </PageTitle>
          <PermissionGuard permission={EXPENSES_PERMISSIONS.categoriesManage}>
            <Button
              component={Link}
              to="/expenses/categories/new"
              variant="contained"
              startIcon={<IconPlus />}
              sx={{ borderRadius: 2 }}
            >
              <FormattedMessage id="expenses.create-category" defaultMessage="إنشاء تصنيف" />
            </Button>
          </PermissionGuard>
        </Box>
      </Box>

      <Card sx={{ p: 2, mb: 3, border: '1px solid', borderColor: 'divider', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', borderRadius: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={4} md={3}>
            <TextField
              size="small"
              fullWidth
              label={<FormattedMessage id="search" defaultMessage="بحث" />}
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
          </Grid>
          <Grid item xs={12} sm={4} md={3}>
            <TextField
              select
              size="small"
              fullWidth
              label={<FormattedMessage id="status" defaultMessage="الحالة" />}
              value={params.isActive}
              onChange={(e) => setParams({ ...params, page: 1, isActive: e.target.value })}
            >
              <MenuItem value="">
                <FormattedMessage id="all" defaultMessage="الكل" />
              </MenuItem>
              <MenuItem value="true">
                <FormattedMessage id="active" defaultMessage="نشط" />
              </MenuItem>
              <MenuItem value="false">
                <FormattedMessage id="inactive" defaultMessage="غير نشط" />
              </MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} sm={12} md={6} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button variant="outlined" onClick={handleSearch} sx={{ borderRadius: 2 }}>
              <FormattedMessage id="search" defaultMessage="بحث" />
            </Button>
          </Grid>
        </Grid>
      </Card>

      <Card sx={{ border: '1px solid', borderColor: 'divider', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', borderRadius: 3, overflow: 'hidden' }}>
        <TableContainer sx={{ overflowX: 'auto' }}>
          <Table sx={{ minWidth: 800 }}>
            <TableHead sx={{ bgcolor: 'grey.50' }}>
              <TableRow>
                <TableCell>
                  <FormattedMessage id="code" defaultMessage="الكود" />
                </TableCell>
                <TableCell>
                  <FormattedMessage id="name" defaultMessage="الاسم" />
                </TableCell>
                <TableCell>
                  <FormattedMessage id="description" defaultMessage="الوصف" />
                </TableCell>
                <TableCell>
                  <FormattedMessage id="expenses.category-accounting-account" defaultMessage="الحساب المحاسبي" />
                </TableCell>
                <TableCell align="center">
                  <FormattedMessage id="display-order" defaultMessage="ترتيب العرض" />
                </TableCell>
                <TableCell>
                  <FormattedMessage id="status" defaultMessage="الحالة" />
                </TableCell>
                <TableCell align="center">
                  <FormattedMessage id="actions" defaultMessage="الإجراءات" />
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton width={80} /></TableCell>
                    <TableCell><Skeleton width={150} /></TableCell>
                    <TableCell><Skeleton width={200} /></TableCell>
                    <TableCell><Skeleton width={220} /></TableCell>
                    <TableCell align="center"><Skeleton width={40} sx={{ mx: 'auto' }} /></TableCell>
                    <TableCell><Skeleton width={60} /></TableCell>
                    <TableCell align="center"><Skeleton width={120} sx={{ mx: 'auto' }} /></TableCell>
                  </TableRow>
                ))
              ) : items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                    <Typography variant="body1" color="text.secondary">
                      <FormattedMessage id="no-records-found" defaultMessage="لا توجد سجلات" />
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                items.map((row) => (
                  <TableRow key={row.id} hover>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600} color="primary.main">
                        {row.code}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={500}>
                        {row.nameArabic}
                      </Typography>
                      {row.nameEnglish && (
                        <Typography variant="caption" color="text.secondary" display="block">
                          {row.nameEnglish}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 250 }} noWrap>
                        {row.description || '-'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {row.accountingAccountCode ? (
                        <CodeNameLabel code={row.accountingAccountCode} nameArabic={row.accountingAccountArabicName ?? ''} />
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          <FormattedMessage id="expenses.unmapped-accounting" defaultMessage="غير مرتبط محاسبيًا" />
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell align="center">
                      {row.displayOrder}
                    </TableCell>
                    <TableCell>
                      <ExpenseCategoryStatusChip isActive={row.isActive} />
                    </TableCell>
                    <TableCell align="center">
                      <PermissionGuard permission={EXPENSES_PERMISSIONS.categoriesManage}>
                        <Tooltip title={<FormattedMessage id="edit" defaultMessage="تعديل" />}>
                          <IconButton component={Link} to={`/expenses/categories/${row.id}/edit`} size="small">
                            <IconEdit size={18} />
                          </IconButton>
                        </Tooltip>
                        {row.isActive ? (
                          <Tooltip title={<FormattedMessage id="deactivate" defaultMessage="إيقاف" />}>
                            <IconButton onClick={() => setActionDialog({ open: true, action: 'deactivate', id: row.id })} size="small" color="error">
                              <IconX size={18} />
                            </IconButton>
                          </Tooltip>
                        ) : (
                          <Tooltip title={<FormattedMessage id="activate" defaultMessage="تفعيل" />}>
                            <IconButton onClick={() => setActionDialog({ open: true, action: 'activate', id: row.id })} size="small" color="success">
                              <IconCheck size={18} />
                            </IconButton>
                          </Tooltip>
                        )}
                      </PermissionGuard>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component="div"
          count={meta.totalCount}
          page={meta.page - 1}
          onPageChange={(_, newPage) => setParams({ ...params, page: newPage + 1 })}
          rowsPerPage={meta.pageSize}
          onRowsPerPageChange={(e) => setParams({ ...params, pageSize: parseInt(e.target.value, 10), page: 1 })}
          rowsPerPageOptions={[10, 20, 50]}
        />
      </Card>

      <ExpenseConfirmationDialog
        open={actionDialog.open}
        title={<FormattedMessage id={actionDialog.action === 'activate' ? 'expenses.activate-category' : 'expenses.deactivate-category'} />}
        content={<FormattedMessage id={actionDialog.action === 'activate' ? 'expenses.activate-category-desc' : 'expenses.deactivate-category-desc'} />}
        confirmLabel={<FormattedMessage id="confirm" />}
        confirmColor={actionDialog.action === 'activate' ? 'primary' : 'error'}
        isProcessing={isProcessing}
        onConfirm={handleConfirmAction}
        onCancel={() => setActionDialog({ ...actionDialog, open: false })}
      />
    </Box>
  );
}
