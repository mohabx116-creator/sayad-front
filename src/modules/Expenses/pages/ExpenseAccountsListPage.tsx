import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useSWRConfig } from 'swr';
import { FormattedMessage } from 'react-intl';

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
import Typography from '@mui/material/Typography';
import Menu from '@mui/material/Menu';
import { IconEdit, IconPlus, IconCheck, IconX, IconDotsVertical } from '@tabler/icons-react';

import useAuth from 'hooks/useAuth';
import { useDispatch } from 'store';
import { openSnackbar } from 'store/slices/snackbar';
import Breadcrumbs from 'ui-component/extended/Breadcrumbs';
import PageTitle from 'ui-component/PageTitle';
import { hasPermission } from 'modules/Administration/utils/permission-utils';
import PermissionGuard from 'modules/Administration/components/PermissionGuard';

import { activateAccountingAccount, deactivateAccountingAccount } from 'modules/Accounting/api/accountingApi';
import { useAccountingAccounts } from 'modules/Accounting/hooks/useAccounting';
import { ACCOUNTING_PERMISSIONS, ACCOUNTING_ACCOUNT_TYPES } from 'modules/Accounting/utils/accounting.constants';
import type { AccountingAccountListItemDto } from 'modules/Accounting/types/accounting.types';
import AccountingAccountActionDialog from 'modules/Accounting/components/AccountingAccountActionDialog';

export default function ExpenseAccountsListPage() {
  const dispatch = useDispatch();
  const { user } = useAuth();
  const { mutate: mutateGlobal } = useSWRConfig();

  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedAccount, setSelectedAccount] = useState<AccountingAccountListItemDto | null>(null);
  const [actionMode, setActionMode] = useState<'activate' | 'deactivate'>('deactivate');
  const [isProcessing, setIsProcessing] = useState(false);

  // Permanently enforced filters
  const accountType = ACCOUNTING_ACCOUNT_TYPES.EXPENSE;
  const isPosting = true;

  const { items, meta, isLoading, error, mutate } = useAccountingAccounts({
    page: page + 1,
    pageSize,
    search: search || undefined,
    accountType,
    isPosting
  });

  const canEdit = hasPermission(user, ACCOUNTING_PERMISSIONS.accountsUpdate);
  const canToggleActive = hasPermission(user, ACCOUNTING_PERMISSIONS.accountsActivate) || hasPermission(user, ACCOUNTING_PERMISSIONS.accountsDeactivate);

  const notify = (message: string, severity: 'success' | 'error' = 'success') => {
    dispatch(openSnackbar({ open: true, message, variant: 'alert', severity }));
  };

  const handleMenuClick = (event: React.MouseEvent<HTMLButtonElement>, account: AccountingAccountListItemDto) => {
    setAnchorEl(event.currentTarget);
    setSelectedAccount(account);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedAccount(null);
  };

  const handleSearch = () => {
    setSearch(searchInput.trim());
    setPage(0);
  };

  const openAction = (mode: 'activate' | 'deactivate') => {
    setActionMode(mode);
    setAnchorEl(null);
  };

  const handleToggleActive = async () => {
    if (!selectedAccount) return;
    setIsProcessing(true);
    try {
      if (actionMode === 'activate') {
        await activateAccountingAccount(selectedAccount.id, selectedAccount.rowVersion);
        notify('تم تفعيل الحساب بنجاح.');
      } else {
        await deactivateAccountingAccount(selectedAccount.id, selectedAccount.rowVersion);
        notify('تم إيقاف الحساب بنجاح.');
      }
      await mutate();
      await mutateGlobal((key) => typeof key === 'string' && key.startsWith('/api/accounting/'));
    } catch (err) {
      notify(err instanceof Error ? err.message : 'فشلت العملية.', 'error');
    } finally {
      setIsProcessing(false);
      setSelectedAccount(null);
    }
  };

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Breadcrumbs custom card={false} title={false} divider={false} heading="expenses" links={[{ title: 'expenses' }]} sx={{ mb: 0 }} />
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', mt: 1, gap: 2, flexWrap: 'wrap' }}>
          <PageTitle>
            <FormattedMessage id="expenses.expense-accounts" defaultMessage="حسابات المصروفات" />
          </PageTitle>
          <PermissionGuard permission={ACCOUNTING_PERMISSIONS.accountsCreate}>
            <Button component={Link} to="/expenses/accounts/new" variant="contained" startIcon={<IconPlus />}>
              <FormattedMessage id="expenses.add-expense-account" defaultMessage="إضافة حساب مصروف" />
            </Button>
          </PermissionGuard>
        </Box>
      </Box>

      <Card sx={{ p: 2, mb: 3, border: '1px solid', borderColor: 'divider', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', borderRadius: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <TextField
              size="small"
              fullWidth
              label={<FormattedMessage id="search" />}
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
          </Grid>
          <Grid item xs={12} md={8} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button variant="outlined" onClick={handleSearch}>
              <FormattedMessage id="search" />
            </Button>
          </Grid>
        </Grid>
      </Card>

      <Card sx={{ border: '1px solid', borderColor: 'divider', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', borderRadius: 3 }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><FormattedMessage id="account-code" defaultMessage="كود الحساب" /></TableCell>
                <TableCell><FormattedMessage id="name-arabic" /></TableCell>
                <TableCell><FormattedMessage id="name-english" /></TableCell>
                <TableCell align="center"><FormattedMessage id="status" /></TableCell>
                <TableCell align="center"><FormattedMessage id="actions" /></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                Array.from({ length: pageSize }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton variant="text" width={80} /></TableCell>
                    <TableCell><Skeleton variant="text" width={150} /></TableCell>
                    <TableCell><Skeleton variant="text" width={150} /></TableCell>
                    <TableCell align="center"><Skeleton variant="rounded" width={60} height={24} sx={{ mx: 'auto' }} /></TableCell>
                    <TableCell align="center"><Skeleton variant="circular" width={32} height={32} sx={{ mx: 'auto' }} /></TableCell>
                  </TableRow>
                ))
              ) : error ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    <Typography color="error"><FormattedMessage id="error-loading-data" defaultMessage="حدث خطأ أثناء تحميل البيانات" /></Typography>
                  </TableCell>
                </TableRow>
              ) : items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    <Typography color="textSecondary"><FormattedMessage id="no-data-found" defaultMessage="لا توجد بيانات" /></Typography>
                  </TableCell>
                </TableRow>
              ) : (
                items.map((account) => (
                  <TableRow key={account.id}>
                    <TableCell>{account.code}</TableCell>
                    <TableCell>{account.nameArabic}</TableCell>
                    <TableCell>{account.nameEnglish}</TableCell>
                    <TableCell align="center">
                      {account.isActive ? (
                        <Chip label={<FormattedMessage id="active" />} color="success" size="small" variant="outlined" />
                      ) : (
                        <Chip label={<FormattedMessage id="inactive" />} color="error" size="small" variant="outlined" />
                      )}
                    </TableCell>
                    <TableCell align="center">
                      <IconButton onClick={(e) => handleMenuClick(e, account)} size="small">
                        <IconDotsVertical size={18} />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component="div"
          count={meta?.totalCount ?? 0}
          page={page}
          onPageChange={(e, newPage) => setPage(newPage)}
          rowsPerPage={pageSize}
          onRowsPerPageChange={(e) => {
            setPageSize(parseInt(e.target.value, 10));
            setPage(0);
          }}
          labelRowsPerPage={<FormattedMessage id="rows-per-page" defaultMessage="الصفوف في الصفحة:" />}
        />
      </Card>

      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
        {canEdit && (
          <MenuItem component={Link} to={`/expenses/accounts/${selectedAccount?.id}/edit`} onClick={handleMenuClose}>
            <IconEdit size={18} style={{ marginRight: 8 }} />
            <FormattedMessage id="edit" />
          </MenuItem>
        )}
        {canToggleActive && selectedAccount && !selectedAccount.isActive && (
          <MenuItem onClick={() => openAction('activate')}>
            <IconCheck size={18} style={{ marginRight: 8 }} color="var(--mui-palette-success-main)" />
            <FormattedMessage id="activate" />
          </MenuItem>
        )}
        {canToggleActive && selectedAccount && selectedAccount.isActive && (
          <MenuItem onClick={() => openAction('deactivate')}>
            <IconX size={18} style={{ marginRight: 8 }} color="var(--mui-palette-error-main)" />
            <FormattedMessage id="deactivate" />
          </MenuItem>
        )}
      </Menu>

      <AccountingAccountActionDialog
        open={Boolean(selectedAccount && !anchorEl)}
        titleId={actionMode === 'activate' ? 'activate-account' : 'deactivate-account'}
        descriptionId={actionMode === 'activate' ? 'activate-account-description' : 'deactivate-account-description'}
        isProcessing={isProcessing}
        onClose={() => setSelectedAccount(null)}
        onConfirm={handleToggleActive}
      />
    </Box>
  );
}
