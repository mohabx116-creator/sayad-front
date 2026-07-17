import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useSWRConfig } from 'swr';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/GridLegacy';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';

import { IconEdit, IconPlus, IconPower, IconToggleLeft, IconToggleRight, IconTrash } from '@tabler/icons-react';
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
import { activateAccountingAccount, deactivateAccountingAccount, deleteAccountingAccount } from '../api/accountingApi';
import { useAccountingAccount } from '../hooks/useAccounting';
import { ACCOUNTING_PERMISSIONS } from '../utils/accounting.constants';

export default function AccountingAccountDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useAuth();
  const { mutate: mutateGlobal } = useSWRConfig();

  const { account, isLoading, mutate } = useAccountingAccount(id);
  const [pendingAction, setPendingAction] = useState<'activate' | 'deactivate' | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedNode, setSelectedNode] = useState<{ code: string; rowVersion: string } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const canCreateChild = hasPermission(user, ACCOUNTING_PERMISSIONS.accountsCreate);
  const canEdit = hasPermission(user, ACCOUNTING_PERMISSIONS.accountsUpdate);
  const canToggleActive = hasPermission(user, ACCOUNTING_PERMISSIONS.accountsActivate) || hasPermission(user, ACCOUNTING_PERMISSIONS.accountsDeactivate);
  const canDelete = hasPermission(user, ACCOUNTING_PERMISSIONS.accountsDelete);

  const notify = (message: string, severity: 'success' | 'error' = 'success') => {
    dispatch(openSnackbar({ open: true, message, variant: 'alert', severity }));
  };

  const handleToggle = async () => {
    if (!account || !pendingAction) {
      return;
    }

      setIsProcessing(true);
    try {
      if (pendingAction === 'activate') {
        await activateAccountingAccount(account.id, account.rowVersion);
        notify('تم تفعيل الحساب بنجاح.');
      } else {
        await deactivateAccountingAccount(account.id, account.rowVersion);
        notify('تم إيقاف الحساب بنجاح.');
      }

      await mutate();
      await mutateGlobal((key) => typeof key === 'string' && key.startsWith('/api/accounting/'));
    } catch (error) {
      notify(error instanceof Error ? error.message : 'فشلت العملية.', 'error');
    } finally {
      setIsProcessing(false);
      setPendingAction(null);
    }
  };

  const handleDelete = async (request: { code: string; rowVersion: string }) => {
    if (!account) {
      return;
    }

    setIsProcessing(true);
    try {
      await deleteAccountingAccount(account.id, request);
      notify('تم حذف الحساب بنجاح.');
      await mutateGlobal((key) => typeof key === 'string' && key.startsWith('/api/accounting/'));
      navigate('/accounting/chart-of-accounts');
    } catch (error) {
      notify(error instanceof Error ? error.message : 'فشلت العملية.', 'error');
    } finally {
      setIsProcessing(false);
      setDeleteDialogOpen(false);
      setSelectedNode(null);
    }
  };

  if (isLoading || !account) {
    return <Loader />;
  }

  return (
    <Box>
      <Breadcrumbs
        custom
        heading="account-details"
        links={[
          { title: 'general-ledger', to: '/accounting' },
          { title: 'chart-of-accounts', to: '/accounting/chart-of-accounts' }
        ]}
      />
      <Stack spacing={3}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 2, flexWrap: 'wrap' }}>
          <Box>
            <PageTitle>
              <FormattedMessage id="account-details" defaultMessage="تفاصيل الحساب" />
            </PageTitle>
            <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" sx={{ mt: 1 }}>
              <Chip size="small" label={account.accountTypeLabel} />
              <Chip size="small" color={account.isPosting ? 'info' : 'secondary'} label={<FormattedMessage id={account.isPosting ? 'posting-account' : 'header-account'} />} />
              <Chip size="small" color={account.isActive ? 'success' : 'default'} label={<FormattedMessage id={account.isActive ? 'active' : 'inactive'} />} />
              {account.isSystem && <Chip size="small" color="warning" label={<FormattedMessage id="system-account" defaultMessage="حساب نظامي" />} />}
            </Stack>
          </Box>
          <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
            {canCreateChild && (
              <Button component={Link} to={`/accounting/chart-of-accounts/new?parentId=${account.id}`} variant="outlined" startIcon={<IconPlus size={18} />}>
                <FormattedMessage id="add-child-account" defaultMessage="إضافة حساب فرعي" />
              </Button>
            )}
            {canEdit && (
              <Button component={Link} to={`/accounting/chart-of-accounts/${account.id}/edit`} variant="outlined" startIcon={<IconEdit size={18} />}>
                <FormattedMessage id="edit" />
              </Button>
            )}
            {canToggleActive && (
              <Button variant="outlined" color={account.isActive ? 'warning' : 'success'} onClick={() => setPendingAction(account.isActive ? 'deactivate' : 'activate')} startIcon={account.isActive ? <IconToggleLeft size={18} /> : <IconToggleRight size={18} />}>
                <FormattedMessage id={account.isActive ? 'deactivate' : 'activate'} />
              </Button>
            )}
            {canDelete && (
              <Button variant="outlined" color="error" onClick={() => { setSelectedNode({ code: account.code, rowVersion: account.rowVersion }); setDeleteDialogOpen(true); }} startIcon={<IconTrash size={18} />} disabled={account.isSystem}>
                <FormattedMessage id="delete-permanent" defaultMessage="حذف نهائي" />
              </Button>
            )}
          </Stack>
        </Box>

        <Card sx={{ p: 3, borderRadius: 3 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={3}>
              <Typography variant="caption" color="text.secondary" display="block">
                <FormattedMessage id="account-code" defaultMessage="كود الحساب" />
              </Typography>
              <Typography variant="body1" fontWeight={700}>
                {account.code}
              </Typography>
            </Grid>
            <Grid item xs={12} md={3}>
              <Typography variant="caption" color="text.secondary" display="block">
                <FormattedMessage id="name-arabic" />
              </Typography>
              <Typography variant="body1" fontWeight={700}>
                {account.nameArabic}
              </Typography>
            </Grid>
            <Grid item xs={12} md={3}>
              <Typography variant="caption" color="text.secondary" display="block">
                <FormattedMessage id="name-english" />
              </Typography>
              <Typography variant="body1" fontWeight={700}>
                {account.nameEnglish || '-'}
              </Typography>
            </Grid>
            <Grid item xs={12} md={3}>
              <Typography variant="caption" color="text.secondary" display="block">
                <FormattedMessage id="account-type" defaultMessage="نوع الحساب" />
              </Typography>
              <Typography variant="body1" fontWeight={700}>
                {account.accountTypeLabel}
              </Typography>
            </Grid>
            <Grid item xs={12} md={3}>
              <Typography variant="caption" color="text.secondary" display="block">
                <FormattedMessage id="normal-balance" defaultMessage="الطبيعة العادية" />
              </Typography>
              <Typography variant="body1" fontWeight={700}>
                {account.normalBalanceLabel}
              </Typography>
            </Grid>
            <Grid item xs={12} md={3}>
              <Typography variant="caption" color="text.secondary" display="block">
                <FormattedMessage id="parent-account" defaultMessage="الحساب الأب" />
              </Typography>
              <Typography variant="body1" fontWeight={700}>
                {account.parentCode ? `${account.parentCode} - ${account.parentNameArabic ?? ''}` : '-'}
              </Typography>
            </Grid>
            <Grid item xs={12} md={3}>
              <Typography variant="caption" color="text.secondary" display="block">
                <FormattedMessage id="treasury-account" defaultMessage="حساب الخزنة" />
              </Typography>
              <Typography variant="body1" fontWeight={700}>
                {account.treasuryAccountId && account.treasuryAccountCode && account.treasuryAccountArabicName ? (
                  <Button component={Link} to={`/treasury/accounts/${account.treasuryAccountId}`} variant="text" size="small" sx={{ p: 0, minWidth: 0, fontWeight: 700 }}>
                    {account.treasuryAccountCode} - {account.treasuryAccountArabicName}
                  </Button>
                ) : (
                  '-'
                )}
              </Typography>
            </Grid>
            <Grid item xs={12} md={3}>
              <Typography variant="caption" color="text.secondary" display="block">
                <FormattedMessage id="posting-account" defaultMessage="حساب ترحيل" />
              </Typography>
              <Typography variant="body1" fontWeight={700}>
                {account.isPosting ? <FormattedMessage id="posting-account" defaultMessage="حساب ترحيل" /> : <FormattedMessage id="header-account" defaultMessage="حساب رئيسي" />}
              </Typography>
            </Grid>
            <Grid item xs={12} md={3}>
              <Typography variant="caption" color="text.secondary" display="block">
                <FormattedMessage id="system-account" defaultMessage="حساب نظامي" />
              </Typography>
              <Typography variant="body1" fontWeight={700}>
                {account.isSystem ? <FormattedMessage id="yes" /> : <FormattedMessage id="no" />}
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="caption" color="text.secondary" display="block">
                <FormattedMessage id="hierarchy-path" defaultMessage="المسار الهرمي" />
              </Typography>
              <Typography variant="body1" fontWeight={700}>
                {account.hierarchyPath || '-'}
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="caption" color="text.secondary" display="block">
                <FormattedMessage id="description" />
              </Typography>
              <Typography variant="body1">{account.description || '-'}</Typography>
            </Grid>
          </Grid>
        </Card>

        <Card sx={{ p: 3, borderRadius: 3 }}>
          <Stack spacing={2}>
            <Typography variant="h5" fontWeight={700}>
              <FormattedMessage id="direct-children" defaultMessage="الأبناء المباشرون" />
            </Typography>
            <Typography variant="body2" color="text.secondary">
              <FormattedMessage id="direct-children-description" defaultMessage="تظهر هنا الحسابات الفرعية المباشرة فقط." />
            </Typography>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell><FormattedMessage id="account-code" defaultMessage="كود الحساب" /></TableCell>
                  <TableCell><FormattedMessage id="name-arabic" /></TableCell>
                  <TableCell><FormattedMessage id="account-type" defaultMessage="نوع الحساب" /></TableCell>
                  <TableCell><FormattedMessage id="posting-account" defaultMessage="حساب ترحيل" /></TableCell>
                  <TableCell><FormattedMessage id="status" /></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {account.directChildren.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5}>
                      <Typography color="text.secondary">
                        <FormattedMessage id="accounting-empty" defaultMessage="لا توجد حسابات." />
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  account.directChildren.map((child) => (
                    <TableRow key={child.id} hover>
                      <TableCell>{child.code}</TableCell>
                      <TableCell>{child.nameArabic}</TableCell>
                      <TableCell>{child.accountTypeLabel}</TableCell>
                      <TableCell>{child.isPosting ? <FormattedMessage id="posting-account" defaultMessage="حساب ترحيل" /> : <FormattedMessage id="header-account" defaultMessage="حساب رئيسي" />}</TableCell>
                      <TableCell>{child.isActive ? <FormattedMessage id="active" /> : <FormattedMessage id="inactive" />}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Stack>
        </Card>
      </Stack>

      <AccountingAccountActionDialog
        open={pendingAction !== null}
        titleId={pendingAction === 'activate' ? 'activate-account' : 'deactivate-account'}
        descriptionId={pendingAction === 'activate' ? 'activate-account-description' : 'deactivate-account-description'}
        isProcessing={isProcessing}
        onClose={() => setPendingAction(null)}
        onConfirm={handleToggle}
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
