import { useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { Link } from 'react-router-dom';
import { useSWRConfig } from 'swr';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/GridLegacy';
import IconButton from '@mui/material/IconButton';
import MenuItem from '@mui/material/MenuItem';
import Skeleton from '@mui/material/Skeleton';
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

import { IconCheck, IconEdit, IconEye, IconPlus, IconReport, IconTrash, IconX } from '@tabler/icons-react';

import useAuth from 'hooks/useAuth';
import { useDispatch } from 'store';
import { openSnackbar } from 'store/slices/snackbar';
import Breadcrumbs from 'ui-component/extended/Breadcrumbs';
import PageTitle from 'ui-component/PageTitle';
import PermissionGuard from 'modules/Administration/components/PermissionGuard';

import TreasuryConfirmationDialog, { TreasuryActionType } from '../components/TreasuryConfirmationDialog';
import TreasuryFinalDeleteDialog from '../components/TreasuryFinalDeleteDialog';
import { useTreasuryAccounts, useTreasuryAccountDeletionPreview, useTreasuryLookups } from '../hooks/useTreasury';
import { activateTreasuryAccount, deactivateTreasuryAccount, finalDeleteTreasuryAccount } from '../api/treasuryApi';
import { TREASURY_PERMISSIONS } from '../utils/treasury.constants';
import { formatTreasuryMoney } from '../utils/treasury.format';
import type { TreasuryListParams } from '../types/treasury.types';

export default function TreasuryAccountsListPage() {
  const intl = useIntl();
  const dispatch = useDispatch();
  const { user } = useAuth();
  const { mutate: mutateTreasury } = useSWRConfig();

  const [params, setParams] = useState<TreasuryListParams>({
    page: 1,
    pageSize: 20,
    search: '',
    accountType: '',
    status: ''
  });
  const [searchInput, setSearchInput] = useState('');
  const [actionDialog, setActionDialog] = useState<{ open: boolean; action: TreasuryActionType; id: string; rowVersion: string; code: string }>({
    open: false,
    action: 'activate',
    id: '',
    rowVersion: '',
    code: ''
  });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; rowVersion: string }>({ id: '', rowVersion: '' });
  const [isProcessing, setIsProcessing] = useState(false);

  const { items, meta, isLoading, mutate } = useTreasuryAccounts(params);
  const { preview: deletionPreview, isLoading: isDeletionPreviewLoading } = useTreasuryAccountDeletionPreview(deleteTarget.id || undefined, deleteDialogOpen);
  const { lookups } = useTreasuryLookups();

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
        await activateTreasuryAccount(actionDialog.id, actionDialog.rowVersion);
        notify('تم تفعيل الحساب بنجاح.');
      } else if (actionDialog.action === 'deactivate') {
        await deactivateTreasuryAccount(actionDialog.id, actionDialog.rowVersion);
        notify('تم إيقاف الحساب بنجاح.');
      }

      await mutateTreasury((key) => typeof key === 'string' && key.startsWith('/api/treasury/'));
      await mutate();
    } catch (error) {
      notify(error instanceof Error ? error.message : 'فشلت العملية.', 'error');
    } finally {
      setIsProcessing(false);
      setActionDialog({ open: false, action: 'activate', id: '', rowVersion: '', code: '' });
    }
  };

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Breadcrumbs custom card={false} title={false} divider={false} heading="treasury-accounts" links={[{ title: 'treasury', to: '/treasury' }]} sx={{ mb: 0 }} />
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', mt: 1 }}>
          <PageTitle>
            <FormattedMessage id="treasury-accounts" defaultMessage="حسابات الخزينة" />
          </PageTitle>
          <PermissionGuard permission={TREASURY_PERMISSIONS.accountsCreate}>
            <Button component={Link} to="/treasury/accounts/new" variant="contained" startIcon={<IconPlus />} sx={{ borderRadius: 2 }}>
              <FormattedMessage id="create-account" defaultMessage="إنشاء حساب" />
            </Button>
          </PermissionGuard>
        </Box>
      </Box>

      <Card sx={{ p: 2, mb: 3, border: '1px solid', borderColor: 'divider', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', borderRadius: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={4} md={3}>
            <TextField fullWidth size="small" label={<FormattedMessage id="search" defaultMessage="بحث" />} value={searchInput} onChange={(e) => setSearchInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSearch()} />
          </Grid>
          <Grid item xs={12} sm={4} md={3}>
            <TextField select fullWidth size="small" label={<FormattedMessage id="account-type" defaultMessage="نوع الحساب" />} value={params.accountType} onChange={(e) => setParams({ ...params, page: 1, accountType: e.target.value })}>
              <MenuItem value="">
                <FormattedMessage id="all" defaultMessage="الكل" />
              </MenuItem>
              {lookups?.accountTypes.map((type) => (
                <MenuItem key={type.id} value={type.value}>
                  {type.displayName}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={4} md={3}>
            <TextField select fullWidth size="small" label={<FormattedMessage id="status" defaultMessage="الحالة" />} value={params.status} onChange={(e) => setParams({ ...params, page: 1, status: e.target.value })}>
              <MenuItem value="">
                <FormattedMessage id="all" defaultMessage="الكل" />
              </MenuItem>
              <MenuItem value="Active">
                <FormattedMessage id="active" defaultMessage="نشط" />
              </MenuItem>
              <MenuItem value="Inactive">
                <FormattedMessage id="inactive" defaultMessage="موقوف" />
              </MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} sm={12} md={3} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button variant="outlined" onClick={handleSearch} sx={{ borderRadius: 2 }}>
              <FormattedMessage id="search" defaultMessage="بحث" />
            </Button>
          </Grid>
        </Grid>
      </Card>

      <Card sx={{ border: '1px solid', borderColor: 'divider', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', borderRadius: 3, overflow: 'hidden' }}>
        <TableContainer sx={{ overflowX: 'auto' }}>
          <Table sx={{ minWidth: 1400 }}>
            <TableHead sx={{ bgcolor: 'grey.50' }}>
              <TableRow>
                <TableCell><FormattedMessage id="code" defaultMessage="الكود" /></TableCell>
                <TableCell><FormattedMessage id="account-name" defaultMessage="اسم الحساب" /></TableCell>
                <TableCell><FormattedMessage id="type" defaultMessage="النوع" /></TableCell>
                <TableCell align="right"><FormattedMessage id="opening-balance" defaultMessage="الرصيد الافتتاحي" /></TableCell>
                <TableCell align="right"><FormattedMessage id="total-receipts" defaultMessage="إجمالي المقبوضات" /></TableCell>
                <TableCell align="right"><FormattedMessage id="total-payments" defaultMessage="إجمالي المدفوعات" /></TableCell>
                <TableCell align="right"><FormattedMessage id="current-balance" defaultMessage="الرصيد الحالي" /></TableCell>
                <TableCell><FormattedMessage id="status" defaultMessage="الحالة" /></TableCell>
                <TableCell align="center"><FormattedMessage id="actions" defaultMessage="الإجراءات" /></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton width={80} /></TableCell>
                    <TableCell><Skeleton width={150} /></TableCell>
                    <TableCell><Skeleton width={100} /></TableCell>
                    <TableCell align="right"><Skeleton width={80} sx={{ ml: 'auto' }} /></TableCell>
                    <TableCell align="right"><Skeleton width={80} sx={{ ml: 'auto' }} /></TableCell>
                    <TableCell align="right"><Skeleton width={80} sx={{ ml: 'auto' }} /></TableCell>
                    <TableCell align="right"><Skeleton width={80} sx={{ ml: 'auto' }} /></TableCell>
                    <TableCell><Skeleton width={60} /></TableCell>
                    <TableCell align="center"><Skeleton width={140} sx={{ mx: 'auto' }} /></TableCell>
                  </TableRow>
                ))
              ) : items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} align="center" sx={{ py: 4 }}>
                    <Typography variant="body1" color="text.secondary">
                      <FormattedMessage id="no-records-found" defaultMessage="لا توجد سجلات." />
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
                    <TableCell>{row.accountTypeLabel}</TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" fontWeight={600}>
                        {formatTreasuryMoney(row.openingBalance, row.currencyCode)}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" fontWeight={600} color="success.dark">
                        {formatTreasuryMoney(row.debitTotal, row.currencyCode)}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" fontWeight={600} color="error.dark">
                        {formatTreasuryMoney(row.creditTotal, row.currencyCode)}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" fontWeight={700}>
                        {formatTreasuryMoney(row.balance, row.currencyCode)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {row.balanceNature === 'Debit' ? 'مدين' : row.balanceNature === 'Credit' ? 'دائن' : 'مستقر'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip size="small" label={<FormattedMessage id={row.isActive ? 'active' : 'inactive'} defaultMessage={row.isActive ? 'نشط' : 'موقوف'} />} color={row.isActive ? 'success' : 'default'} variant="outlined" />
                    </TableCell>
                    <TableCell align="center">
                      <PermissionGuard permission={TREASURY_PERMISSIONS.accountsView}>
                        <Tooltip title={<FormattedMessage id="view" defaultMessage="عرض" />}>
                          <IconButton component={Link} to={`/treasury/accounts/${row.id}`} size="small" color="primary">
                            <IconEye size={18} />
                          </IconButton>
                        </Tooltip>
                      </PermissionGuard>
                      <PermissionGuard permission={TREASURY_PERMISSIONS.statementsView}>
                        <Tooltip title={<FormattedMessage id="statement" defaultMessage="كشف الحساب" />}>
                          <IconButton component={Link} to={`/treasury/statements?accountId=${row.id}`} size="small" color="secondary">
                            <IconReport size={18} />
                          </IconButton>
                        </Tooltip>
                      </PermissionGuard>
                      <PermissionGuard permission={TREASURY_PERMISSIONS.accountsUpdate}>
                        <Tooltip title={<FormattedMessage id="edit" defaultMessage="تعديل" />}>
                          <IconButton component={Link} to={`/treasury/accounts/${row.id}/edit`} size="small">
                            <IconEdit size={18} />
                          </IconButton>
                        </Tooltip>
                      </PermissionGuard>
                      {row.isActive ? (
                        <PermissionGuard permission={TREASURY_PERMISSIONS.accountsDeactivate}>
                          <Tooltip title={<FormattedMessage id="deactivate" defaultMessage="إيقاف" />}>
                            <IconButton onClick={() => setActionDialog({ open: true, action: 'deactivate', id: row.id, rowVersion: row.rowVersion, code: row.code })} size="small" color="error">
                              <IconX size={18} />
                            </IconButton>
                          </Tooltip>
                        </PermissionGuard>
                      ) : (
                        <PermissionGuard permission={TREASURY_PERMISSIONS.accountsActivate}>
                          <Tooltip title={<FormattedMessage id="activate" defaultMessage="تفعيل" />}>
                            <IconButton onClick={() => setActionDialog({ open: true, action: 'activate', id: row.id, rowVersion: row.rowVersion, code: row.code })} size="small" color="success">
                              <IconCheck size={18} />
                            </IconButton>
                          </Tooltip>
                        </PermissionGuard>
                      )}
                      {user?.isSystemOwner && (
                        <Tooltip title={<FormattedMessage id="delete-permanent" defaultMessage="حذف نهائي" />}>
                          <IconButton onClick={() => { setDeleteTarget({ id: row.id, rowVersion: row.rowVersion }); setDeleteDialogOpen(true); }} size="small" color="error">
                            <IconTrash size={18} />
                          </IconButton>
                        </Tooltip>
                      )}
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

      <TreasuryConfirmationDialog
        open={actionDialog.open}
        action={actionDialog.action}
        isProcessing={isProcessing}
        onConfirm={handleConfirmAction}
        onClose={() => setActionDialog({ open: false, action: 'activate', id: '', rowVersion: '', code: '' })}
      />

      <TreasuryFinalDeleteDialog
        open={deleteDialogOpen}
        preview={deletionPreview}
        isLoading={isDeletionPreviewLoading}
        isProcessing={isProcessing}
        onClose={() => {
          setDeleteDialogOpen(false);
          setDeleteTarget({ id: '', rowVersion: '' });
        }}
        onConfirm={async (request) => {
          if (!deleteTarget.id) {
            return;
          }

          setIsProcessing(true);
          try {
            await finalDeleteTreasuryAccount(deleteTarget.id, request);
            notify('تم حذف الحساب نهائيًا.');
            await mutateTreasury((key) => typeof key === 'string' && key.startsWith('/api/treasury/'));
            await mutate();
          } catch (error) {
            notify(error instanceof Error ? error.message : 'فشلت العملية.', 'error');
          } finally {
            setIsProcessing(false);
            setDeleteDialogOpen(false);
            setDeleteTarget({ id: '', rowVersion: '' });
          }
        }}
      />
    </Box>
  );
}
