import { useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { Link } from 'react-router-dom';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Grid from '@mui/material/GridLegacy';
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
import { IconEye, IconPlus } from '@tabler/icons-react';

import Breadcrumbs from 'ui-component/extended/Breadcrumbs';
import PageTitle from 'ui-component/PageTitle';
import PermissionGuard from 'modules/Administration/components/PermissionGuard';
import { useTreasuryAccounts, useTreasuryPayments } from '../hooks/useTreasury';
import { TREASURY_PERMISSIONS } from '../utils/treasury.constants';
import TreasuryStatusChip from '../components/TreasuryStatusChip';
import type { TreasuryListParams } from '../types/treasury.types';
import CodeNameLabel from 'shared/components/CodeNameLabel';

export default function TreasuryPaymentsListPage() {
  const [params, setParams] = useState<TreasuryListParams>({
    page: 1,
    pageSize: 10,
    search: '',
    status: '',
    treasuryAccountId: '',
    partyId: '',
    dateFrom: '',
    dateTo: '',
    sortBy: 'paymentDate',
    sortDirection: 'desc'
  });
  const [searchInput, setSearchInput] = useState('');
  const { items, meta, isLoading } = useTreasuryPayments(params);
  const { items: accounts } = useTreasuryAccounts({ page: 1, pageSize: 200, status: 'Active' });

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Breadcrumbs custom card={false} title={false} divider={false} heading="payments" links={[{ title: 'treasury', to: '/treasury' }, { title: 'payments' }]} sx={{ mb: 0 }} />
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 2, flexWrap: 'wrap', mt: 1 }}>
          <Box>
            <PageTitle>
              <FormattedMessage id="payments" defaultMessage="سندات الصرف" />
            </PageTitle>
            <Typography variant="body2" color="text.secondary">
              <FormattedMessage id="treasury.payments-desc" defaultMessage="مراجعة مستندات سندات الصرف النقدية والمصرفية." />
            </Typography>
          </Box>
          <PermissionGuard permission={TREASURY_PERMISSIONS.paymentsCreate}>
            <Button component={Link} to="/treasury/payments/new" variant="contained" startIcon={<IconPlus size={18} />}>
              <FormattedMessage id="create-payment" />
            </Button>
          </PermissionGuard>
        </Box>
      </Box>

      <Card sx={{ p: 2, mb: 3, border: '1px solid', borderColor: 'divider', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', borderRadius: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <TextField fullWidth label={<FormattedMessage id="search" />} value={searchInput} onChange={(event) => setSearchInput(event.target.value)} onKeyDown={(event) => event.key === 'Enter' && setParams((current) => ({ ...current, page: 1, search: searchInput }))} />
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField select fullWidth label={<FormattedMessage id="status" />} value={params.status} onChange={(event) => setParams((current) => ({ ...current, page: 1, status: event.target.value }))}>
              <MenuItem value="">
                <FormattedMessage id="all" />
              </MenuItem>
              <MenuItem value="Draft">
                <FormattedMessage id="treasury.status.draft" />
              </MenuItem>
              <MenuItem value="Posted">
                <FormattedMessage id="treasury.status.posted" />
              </MenuItem>
              <MenuItem value="Cancelled">
                <FormattedMessage id="treasury.status.cancelled" />
              </MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField select fullWidth label={<FormattedMessage id="treasury-account" defaultMessage="حساب الخزينة" />} value={params.treasuryAccountId ?? ''} onChange={(event) => setParams((current) => ({ ...current, page: 1, treasuryAccountId: event.target.value }))}>
              <MenuItem value="">
                <FormattedMessage id="all" />
              </MenuItem>
              {accounts.map((account) => (
                <MenuItem key={account.id} value={account.id}>
                  <CodeNameLabel code={account.code} nameArabic={account.nameArabic} />
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} md={2} sx={{ display: 'flex', alignItems: 'center' }}>
            <Button variant="outlined" onClick={() => setParams((current) => ({ ...current, page: 1, search: searchInput }))} sx={{ width: '100%' }}>
              <FormattedMessage id="search" />
            </Button>
          </Grid>
        </Grid>
      </Card>

      <Card sx={{ border: '1px solid', borderColor: 'divider', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', borderRadius: 3, overflow: 'hidden' }}>
        <TableContainer>
          <Table>
            <TableHead sx={{ bgcolor: 'grey.50' }}>
              <TableRow>
                <TableCell><FormattedMessage id="payment-number" defaultMessage="رقم سند الصرف" /></TableCell>
                <TableCell><FormattedMessage id="date" /></TableCell>
                <TableCell><FormattedMessage id="treasury-account" defaultMessage="حساب الخزينة" /></TableCell>
                <TableCell><FormattedMessage id="party" /></TableCell>
                <TableCell align="right"><FormattedMessage id="amount" /></TableCell>
                <TableCell><FormattedMessage id="status" /></TableCell>
                <TableCell align="center"><FormattedMessage id="actions" /></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <TableRow key={index}>
                    <TableCell><Skeleton width={80} /></TableCell>
                    <TableCell><Skeleton width={100} /></TableCell>
                    <TableCell><Skeleton width={140} /></TableCell>
                    <TableCell><Skeleton width={140} /></TableCell>
                    <TableCell align="right"><Skeleton width={80} sx={{ ml: 'auto' }} /></TableCell>
                    <TableCell><Skeleton width={80} /></TableCell>
                    <TableCell align="center"><Skeleton width={60} sx={{ mx: 'auto' }} /></TableCell>
                  </TableRow>
                ))
              ) : items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                    <Typography color="text.secondary">
                      <FormattedMessage id="treasury.empty" defaultMessage="لا توجد سجلات." />
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                items.map((payment) => (
                  <TableRow key={payment.id} hover>
                    <TableCell sx={{ fontWeight: 600 }}>{payment.number}</TableCell>
                    <TableCell>{payment.paymentDate}</TableCell>
                    <TableCell>{payment.treasuryAccountCode}</TableCell>
                    <TableCell>{payment.partyNameArabic}</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>{payment.totalAmount.toFixed(2)}</TableCell>
                    <TableCell>
                      <TreasuryStatusChip status={payment.status} />
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title={<FormattedMessage id="details" />}>
                        <Button component={Link} to={`/treasury/payments/${payment.id}`} size="small" variant="text" startIcon={<IconEye size={16} />}>
                          <FormattedMessage id="details" />
                        </Button>
                      </Tooltip>
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
          onPageChange={(_, nextPage) => setParams((current) => ({ ...current, page: nextPage + 1 }))}
          rowsPerPage={meta.pageSize}
          onRowsPerPageChange={(event) => setParams((current) => ({ ...current, pageSize: parseInt(event.target.value, 10), page: 1 }))}
          rowsPerPageOptions={[10, 20, 50]}
        />
      </Card>
    </Box>
  );
}
