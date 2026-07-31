import { useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { Link } from 'react-router-dom';
import { useSWRConfig } from 'swr';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/GridLegacy';
import IconButton from '@mui/material/IconButton';
import Skeleton from '@mui/material/Skeleton';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';

import { IconCheck, IconEye, IconPlus, IconX } from '@tabler/icons-react';

import { useDispatch } from 'store';
import { openSnackbar } from 'store/slices/snackbar';
import Breadcrumbs from 'ui-component/extended/Breadcrumbs';
import PageTitle from 'ui-component/PageTitle';
import PermissionGuard from 'modules/Administration/components/PermissionGuard';

import TreasuryConfirmationDialog, { TreasuryActionType } from '../components/TreasuryConfirmationDialog';
import { activateTreasuryAccount, deactivateTreasuryAccount } from '../api/treasuryApi';
import { useTreasuryAccounts } from '../hooks/useTreasury';
import { TREASURY_PERMISSIONS } from '../utils/treasury.constants';
import { formatTreasuryMoney } from '../utils/treasury.format';
import type { TreasuryListParams } from '../types/treasury.types';

function formatMovementDate(value: string | null) {
  if (!value) {
    return '-';
  }

  const parsed = new Date(`${value}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat('en-GB', { year: 'numeric', month: 'short', day: '2-digit' }).format(parsed);
}

export default function TreasuryAccountsListPage() {
  const dispatch = useDispatch();
  const { mutate: mutateTreasury } = useSWRConfig();

  const [params, setParams] = useState<TreasuryListParams>({
    page: 1,
    pageSize: 20
  });
  const [actionDialog, setActionDialog] = useState<{ open: boolean; action: TreasuryActionType; id: string; rowVersion: string }>({
    open: false,
    action: 'activate',
    id: '',
    rowVersion: ''
  });
  const [isProcessing, setIsProcessing] = useState(false);

  const { items, meta, isLoading, mutate } = useTreasuryAccounts(params);

  const notify = (message: string, severity: 'success' | 'error' = 'success') => {
    dispatch(openSnackbar({ open: true, message, variant: 'alert', severity }));
  };

  const handleConfirmAction = async () => {
    setIsProcessing(true);
    try {
      if (actionDialog.action === 'activate') {
        await activateTreasuryAccount(actionDialog.id, actionDialog.rowVersion);
        notify('تم تفعيل الخزينة بنجاح.');
      } else {
        await deactivateTreasuryAccount(actionDialog.id, actionDialog.rowVersion);
        notify('تم إيقاف الخزينة بنجاح.');
      }

      await mutateTreasury((key) => typeof key === 'string' && key.startsWith('/api/treasury/'));
      await mutate();
    } catch (error) {
      notify(error instanceof Error ? error.message : 'فشلت العملية.', 'error');
    } finally {
      setIsProcessing(false);
      setActionDialog({ open: false, action: 'activate', id: '', rowVersion: '' });
    }
  };

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Breadcrumbs custom card={false} title={false} divider={false} heading="cashboxes" links={[{ title: 'cashboxes' }]} sx={{ mb: 0 }} />
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', mt: 1, gap: 2, flexWrap: 'wrap' }}>
          <Box>
            <PageTitle>
              <FormattedMessage id="cashboxes" defaultMessage="Cashboxes" />
            </PageTitle>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              <FormattedMessage id="cashboxes-page-description" defaultMessage="Manage simple cashboxes, balances, and movement history." />
            </Typography>
          </Box>
          <PermissionGuard permission={TREASURY_PERMISSIONS.accountsCreate}>
            <Button component={Link} to="/treasury/accounts/new" variant="contained" startIcon={<IconPlus size={18} />} sx={{ borderRadius: 2 }}>
              <FormattedMessage id="add-cashbox" defaultMessage="Add Cashbox" />
            </Button>
          </PermissionGuard>
        </Box>
      </Box>

      <Card sx={{ border: '1px solid', borderColor: 'divider', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', borderRadius: 3, overflow: 'hidden' }}>
        <TableContainer sx={{ overflowX: 'auto' }}>
          <Table sx={{ minWidth: 920 }}>
            <TableHead sx={{ bgcolor: 'grey.50' }}>
              <TableRow>
                <TableCell>
                  <FormattedMessage id="cashbox-name" defaultMessage="Cashbox Name" />
                </TableCell>
                <TableCell align="right">
                  <FormattedMessage id="current-balance" defaultMessage="Current Balance" />
                </TableCell>
                <TableCell>
                  <FormattedMessage id="status" defaultMessage="Status" />
                </TableCell>
                <TableCell>
                  <FormattedMessage id="last-movement" defaultMessage="Last Movement" />
                </TableCell>
                <TableCell align="center">
                  <FormattedMessage id="actions" defaultMessage="Actions" />
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <Skeleton width={220} />
                    </TableCell>
                    <TableCell align="right">
                      <Skeleton width={100} sx={{ ml: 'auto' }} />
                    </TableCell>
                    <TableCell>
                      <Skeleton width={90} />
                    </TableCell>
                    <TableCell>
                      <Skeleton width={120} />
                    </TableCell>
                    <TableCell align="center">
                      <Skeleton width={120} sx={{ mx: 'auto' }} />
                    </TableCell>
                  </TableRow>
                ))
              ) : items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 5 }}>
                    <Typography variant="body1" color="text.secondary">
                      <FormattedMessage id="no-records-found" defaultMessage="No records found." />
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                items.map((row) => (
                  <TableRow key={row.id} hover>
                    <TableCell>
                      <Typography variant="body2" fontWeight={700}>
                        {row.nameArabic}
                      </Typography>
                      {row.nameEnglish && (
                        <Typography variant="caption" color="text.secondary" display="block">
                          {row.nameEnglish}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" fontWeight={700}>
                        {formatTreasuryMoney(row.balance, row.currencyCode)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" display="block">
                        {row.balanceNature === 'Debit' ? 'Debit' : row.balanceNature === 'Credit' ? 'Credit' : 'Settled'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip size="small" label={<FormattedMessage id={row.isActive ? 'active' : 'inactive'} defaultMessage={row.isActive ? 'Active' : 'Inactive'} />} color={row.isActive ? 'success' : 'default'} variant="outlined" />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={500}>
                        {formatMovementDate(row.lastMovementDate)}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <IconButton component={Link} to={`/treasury/accounts/${row.id}`} size="small" color="primary">
                        <IconEye size={18} />
                      </IconButton>
                      {row.isActive ? (
                        <PermissionGuard permission={TREASURY_PERMISSIONS.accountsDeactivate}>
                          <IconButton onClick={() => setActionDialog({ open: true, action: 'deactivate', id: row.id, rowVersion: row.rowVersion })} size="small" color="error">
                            <IconX size={18} />
                          </IconButton>
                        </PermissionGuard>
                      ) : (
                        <PermissionGuard permission={TREASURY_PERMISSIONS.accountsActivate}>
                          <IconButton onClick={() => setActionDialog({ open: true, action: 'activate', id: row.id, rowVersion: row.rowVersion })} size="small" color="success">
                            <IconCheck size={18} />
                          </IconButton>
                        </PermissionGuard>
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
          page={Math.max(0, meta.page - 1)}
          onPageChange={(_, newPage) => setParams({ ...params, page: newPage + 1 })}
          rowsPerPage={meta.pageSize}
          onRowsPerPageChange={(event) => setParams({ ...params, pageSize: parseInt(event.target.value, 10), page: 1 })}
          rowsPerPageOptions={[10, 20, 50]}
        />
      </Card>

      <TreasuryConfirmationDialog
        open={actionDialog.open}
        action={actionDialog.action}
        isProcessing={isProcessing}
        onConfirm={handleConfirmAction}
        onClose={() => setActionDialog({ open: false, action: 'activate', id: '', rowVersion: '' })}
      />
    </Box>
  );
}
