import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSWRConfig } from 'swr';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import FormControlLabel from '@mui/material/FormControlLabel';
import Grid from '@mui/material/GridLegacy';
import MenuItem from '@mui/material/MenuItem';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import { IconPlus, IconSearch, IconRefresh } from '@tabler/icons-react';
import { FormattedMessage } from 'react-intl';

import useAuth from 'hooks/useAuth';
import { useDispatch } from 'store';
import { openSnackbar } from 'store/slices/snackbar';
import Breadcrumbs from 'ui-component/extended/Breadcrumbs';
import Loader from 'ui-component/Loader';
import MainCard from 'ui-component/cards/MainCard';
import PageTitle from 'ui-component/PageTitle';
import { hasPermission } from 'modules/Administration/utils/permission-utils';

import AccountingAccountActionDialog from '../components/AccountingAccountActionDialog';
import AccountingAccountDeleteDialog from '../components/AccountingAccountDeleteDialog';
import AccountingAccountTree from '../components/AccountingAccountTree';
import { activateAccountingAccount, deactivateAccountingAccount, deleteAccountingAccount } from '../api/accountingApi';
import { useAccountingAccountTree } from '../hooks/useAccounting';
import type { AccountingAccountTreeNodeDto, AccountingAccountTreeParams } from '../types/accounting.types';
import { ACCOUNTING_ACCOUNT_TYPES, ACCOUNTING_PERMISSIONS, ACCOUNTING_VIEW_PERMISSIONS } from '../utils/accounting.constants';
import { formatAccountingAccountType } from '../utils/accounting.format';

export default function AccountingChartOfAccountsPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useAuth();
  const { mutate: mutateGlobal } = useSWRConfig();

  const [searchInput, setSearchInput] = useState('');
  const [filters, setFilters] = useState<AccountingAccountTreeParams>({});
  const [selectedNode, setSelectedNode] = useState<AccountingAccountTreeNodeDto | null>(null);
  const [actionMode, setActionMode] = useState<'activate' | 'deactivate'>('deactivate');
  const [isProcessing, setIsProcessing] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const { tree, isLoading, error, mutate } = useAccountingAccountTree(filters);

  const canCreateChild = hasPermission(user, ACCOUNTING_PERMISSIONS.accountsCreate);
  const canEdit = hasPermission(user, ACCOUNTING_PERMISSIONS.accountsUpdate);
  const canToggleActive = hasPermission(user, ACCOUNTING_PERMISSIONS.accountsActivate) || hasPermission(user, ACCOUNTING_PERMISSIONS.accountsDeactivate);
  const canDelete = hasPermission(user, ACCOUNTING_PERMISSIONS.accountsDelete);

  const notify = (message: string, severity: 'success' | 'error' = 'success') => {
    dispatch(openSnackbar({ open: true, message, variant: 'alert', severity }));
  };

  const handleSearch = () => {
    setFilters((current) => ({ ...current, search: searchInput.trim() || undefined }));
  };

  const filteredTree = useMemo(() => tree, [tree]);

  const openAction = (node: AccountingAccountTreeNodeDto) => {
    setSelectedNode(node);
    setActionMode(node.isActive ? 'deactivate' : 'activate');
  };

  const handleToggleActive = async () => {
    if (!selectedNode) {
      return;
    }

    setIsProcessing(true);
    try {
      if (actionMode === 'activate') {
        await activateAccountingAccount(selectedNode.id, selectedNode.rowVersion);
        notify('تم تفعيل الحساب بنجاح.');
      } else {
        await deactivateAccountingAccount(selectedNode.id, selectedNode.rowVersion);
        notify('تم إيقاف الحساب بنجاح.');
      }

      await mutate();
      await mutateGlobal((key) => typeof key === 'string' && key.startsWith('/api/accounting/'));
    } catch (error) {
      notify(error instanceof Error ? error.message : 'فشلت العملية.', 'error');
    } finally {
      setIsProcessing(false);
      setSelectedNode(null);
    }
  };

  const handleDelete = async (request: { code: string; rowVersion: string }) => {
    if (!selectedNode) {
      return;
    }

    setIsProcessing(true);
    try {
      await deleteAccountingAccount(selectedNode.id, request);
      notify('تم حذف الحساب بنجاح.');
      await mutate();
      await mutateGlobal((key) => typeof key === 'string' && key.startsWith('/api/accounting/'));
    } catch (error) {
      notify(error instanceof Error ? error.message : 'فشلت العملية.', 'error');
    } finally {
      setIsProcessing(false);
      setDeleteDialogOpen(false);
      setSelectedNode(null);
    }
  };

  return (
    <Box>
      <Breadcrumbs custom heading="chart-of-accounts" links={[{ title: 'general-ledger', to: '/accounting' }]} />
      <Stack spacing={3}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 2, flexWrap: 'wrap' }}>
          <PageTitle>
            <FormattedMessage id="chart-of-accounts" defaultMessage="شجرة الحسابات" />
          </PageTitle>
          {canCreateChild && (
            <Button component={Link} to="/accounting/chart-of-accounts/new" variant="contained" startIcon={<IconPlus size={18} />}>
              <FormattedMessage id="create-account" defaultMessage="إضافة حساب" />
            </Button>
          )}
        </Box>

        <Card sx={{ p: 2.5, borderRadius: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                size="small"
                label={<FormattedMessage id="search" />}
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <TextField
                select
                fullWidth
                size="small"
                label={<FormattedMessage id="account-type" defaultMessage="نوع الحساب" />}
                value={filters.accountType ?? ''}
                onChange={(e) => setFilters((current) => ({ ...current, accountType: e.target.value || undefined }))}
              >
                <MenuItem value="">
                  <FormattedMessage id="all" />
                </MenuItem>
                {Object.values(ACCOUNTING_ACCOUNT_TYPES).map((type) => (
                  <MenuItem key={type} value={type}>
                    {formatAccountingAccountType(type)}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} md={2}>
              <TextField
                select
                fullWidth
                size="small"
                label={<FormattedMessage id="status" />}
                value={filters.isActive === undefined ? '' : filters.isActive ? 'active' : 'inactive'}
                onChange={(e) =>
                  setFilters((current) => ({
                    ...current,
                    isActive: e.target.value === '' ? undefined : e.target.value === 'active'
                  }))
                }
              >
                <MenuItem value="">
                  <FormattedMessage id="all" />
                </MenuItem>
                <MenuItem value="active">
                  <FormattedMessage id="active" />
                </MenuItem>
                <MenuItem value="inactive">
                  <FormattedMessage id="inactive" />
                </MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} md={2}>
              <TextField
                select
                fullWidth
                size="small"
                label={<FormattedMessage id="posting-account" defaultMessage="حساب ترحيل" />}
                value={filters.isPosting === undefined ? '' : filters.isPosting ? 'posting' : 'header'}
                onChange={(e) =>
                  setFilters((current) => ({
                    ...current,
                    isPosting: e.target.value === '' ? undefined : e.target.value === 'posting'
                  }))
                }
              >
                <MenuItem value="">
                  <FormattedMessage id="all" />
                </MenuItem>
                <MenuItem value="posting">
                  <FormattedMessage id="posting-account" defaultMessage="حساب ترحيل" />
                </MenuItem>
                <MenuItem value="header">
                  <FormattedMessage id="header-account" defaultMessage="حساب رئيسي" />
                </MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} md={2}>
              <FormControlLabel
                control={<Switch checked={filters.rootOnly ?? false} onChange={(e) => setFilters((current) => ({ ...current, rootOnly: e.target.checked }))} />}
                label={<FormattedMessage id="root-only" defaultMessage="الجذور فقط" />}
              />
            </Grid>
            <Grid item xs={12} md={12} sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
              <Button variant="outlined" onClick={() => setFilters({})} startIcon={<IconRefresh size={18} />}>
                <FormattedMessage id="reset-filters" />
              </Button>
              <Button variant="outlined" onClick={handleSearch} startIcon={<IconSearch size={18} />}>
                <FormattedMessage id="search" />
              </Button>
            </Grid>
          </Grid>
        </Card>

        <MainCard contentSX={{ p: 2.5 }}>
          {isLoading ? (
            <Stack spacing={1.5}>
              {Array.from({ length: 5 }).map((_, index) => (
                <Skeleton key={index} variant="rounded" height={72} />
              ))}
            </Stack>
          ) : error ? (
            <Typography color="error">
              <FormattedMessage id="accounting-load-error" defaultMessage="تعذر تحميل شجرة الحسابات." />
            </Typography>
          ) : filteredTree.length === 0 ? (
            <Typography color="text.secondary">
              <FormattedMessage id="accounting-empty" defaultMessage="لا توجد حسابات." />
            </Typography>
          ) : (
            <AccountingAccountTree
              nodes={filteredTree}
              canCreateChild={canCreateChild}
              canEdit={canEdit}
              canToggleActive={canToggleActive}
              canDelete={canDelete}
              onCreateChild={(node) => navigate(`/accounting/chart-of-accounts/new?parentId=${node.id}`)}
              onEdit={(node) => navigate(`/accounting/chart-of-accounts/${node.id}/edit`)}
              onToggleActive={openAction}
              onDelete={(node) => {
                setSelectedNode(node);
                setDeleteDialogOpen(true);
              }}
            />
          )}
        </MainCard>
      </Stack>

      <AccountingAccountActionDialog
        open={Boolean(selectedNode && !deleteDialogOpen)}
        titleId={actionMode === 'activate' ? 'activate-account' : 'deactivate-account'}
        descriptionId={actionMode === 'activate' ? 'activate-account-description' : 'deactivate-account-description'}
        isProcessing={isProcessing}
        onClose={() => setSelectedNode(null)}
        onConfirm={handleToggleActive}
      />

      <AccountingAccountDeleteDialog
        open={deleteDialogOpen}
        account={selectedNode}
        isProcessing={isProcessing}
        onClose={() => {
          setDeleteDialogOpen(false);
          setSelectedNode(null);
        }}
        onConfirm={handleDelete}
      />
    </Box>
  );
}

