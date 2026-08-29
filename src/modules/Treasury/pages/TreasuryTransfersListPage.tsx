import { useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { Link } from 'react-router-dom';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/GridLegacy';
import MenuItem from '@mui/material/MenuItem';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
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
import CodeNameLabel from 'shared/components/CodeNameLabel';
import { getDocumentDisplayNumber } from 'shared/utils/documentDisplay';
import { useTreasuryAccounts, useTreasuryTransfers } from '../hooks/useTreasury';
import { TREASURY_PERMISSIONS, TREASURY_LOOKUP_PAGE_SIZE } from '../utils/treasury.constants';
import TreasuryStatusChip from '../components/TreasuryStatusChip';
import type { TreasuryListParams } from '../types/treasury.types';

export default function TreasuryTransfersListPage() {
  const [params, setParams] = useState<TreasuryListParams>({
    page: 1,
    pageSize: 10,
    search: '',
    status: '',
    treasuryAccountId: '',
    partyId: '',
    dateFrom: '',
    dateTo: '',
    sortBy: 'transferDate',
    sortDirection: 'desc'
  });
  const [searchInput, setSearchInput] = useState('');
  const { items, meta, isLoading } = useTreasuryTransfers(params);
  const { items: accounts } = useTreasuryAccounts({ page: 1, pageSize: TREASURY_LOOKUP_PAGE_SIZE, isActive: true });

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Breadcrumbs custom card={false} title={false} divider={false} heading="transfers" links={[{ title: 'treasury', to: '/treasury' }, { title: 'transfers' }]} sx={{ mb: 0 }} />
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 2, flexWrap: 'wrap', mt: 1 }}>
          <Box>
            <PageTitle>
              <FormattedMessage id="transfers" defaultMessage="التحويلات" />
            </PageTitle>
            <Typography variant="body2" color="text.secondary">
              <FormattedMessage id="treasury.transfers-desc" defaultMessage="متابعة التحويلات بين حسابات الخزينة." />
            </Typography>
          </Box>
          <PermissionGuard permission={TREASURY_PERMISSIONS.transfersCreate}>
            <Button component={Link} to="/treasury/transfers/new" variant="contained" startIcon={<IconPlus size={18} />}>
              <FormattedMessage id="create-transfer" defaultMessage="إنشاء تحويل" />
            </Button>
          </PermissionGuard>
        </Box>
      </Box>

      <Card sx={{ p: 2, mb: 3, border: '1px solid', borderColor: 'divider', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', borderRadius: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <TextField fullWidth label={<FormattedMessage id="search" defaultMessage="بحث" />} value={searchInput} onChange={(event) => setSearchInput(event.target.value)} onKeyDown={(event) => event.key === 'Enter' && setParams((current) => ({ ...current, page: 1, search: searchInput }))} />
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField select fullWidth label={<FormattedMessage id="status" defaultMessage="الحالة" />} value={params.status} onChange={(event) => setParams((current) => ({ ...current, page: 1, status: event.target.value }))}>
              <MenuItem value="">
                <FormattedMessage id="all" defaultMessage="الكل" />
              </MenuItem>
              <MenuItem value="Draft">
                <FormattedMessage id="treasury.status.draft" defaultMessage="مسودة" />
              </MenuItem>
              <MenuItem value="Posted">
                <FormattedMessage id="treasury.status.posted" defaultMessage="معتمد" />
              </MenuItem>
              <MenuItem value="Cancelled">
                <FormattedMessage id="treasury.status.cancelled" defaultMessage="ملغي" />
              </MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField select fullWidth label={<FormattedMessage id="treasury-account" defaultMessage="حساب الخزينة" />} value={params.treasuryAccountId ?? ''} onChange={(event) => setParams((current) => ({ ...current, page: 1, treasuryAccountId: event.target.value }))}>
              <MenuItem value="">
                <FormattedMessage id="all" defaultMessage="الكل" />
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
              <FormattedMessage id="search" defaultMessage="بحث" />
            </Button>
          </Grid>
        </Grid>
      </Card>

      <Card sx={{ border: '1px solid', borderColor: 'divider', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', borderRadius: 3, overflow: 'hidden' }}>
        <TableContainer>
          <Table>
            <TableHead sx={{ bgcolor: 'grey.50' }}>
              <TableRow>
                <TableCell><FormattedMessage id="transfer-number" defaultMessage="رقم التحويل" /></TableCell>
                <TableCell><FormattedMessage id="date" defaultMessage="التاريخ" /></TableCell>
                <TableCell><FormattedMessage id="from-account" defaultMessage="الحساب المحول منه" /></TableCell>
                <TableCell><FormattedMessage id="to-account" defaultMessage="الحساب المحول إليه" /></TableCell>
                <TableCell align="right"><FormattedMessage id="amount" defaultMessage="المبلغ" /></TableCell>
                <TableCell><FormattedMessage id="status" defaultMessage="الحالة" /></TableCell>
                <TableCell align="center"><FormattedMessage id="actions" defaultMessage="الإجراءات" /></TableCell>
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
                items.map((transfer) => (
                  <TableRow key={transfer.id} hover>
                    <TableCell sx={{ fontWeight: 600 }}>{getDocumentDisplayNumber(transfer.displayNumber, transfer.number)}</TableCell>
                    <TableCell>{transfer.transferDate}</TableCell>
                    <TableCell>{transfer.fromAccountCode}</TableCell>
                    <TableCell>{transfer.toAccountCode}</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>{transfer.amount.toFixed(2)}</TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                        <TreasuryStatusChip status={transfer.status} />
                        <Chip
                          size="small"
                          variant="outlined"
                          label={transfer.accountingPostingStatus}
                          color={transfer.accountingPostingStatus.includes('عكس') ? 'info' : transfer.isAccountingPosted ? 'success' : transfer.accountingPostingStatus.includes('سجل سابق') ? 'warning' : 'default'}
                        />
                      </Stack>
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title={<FormattedMessage id="details" defaultMessage="تفاصيل" />}>
                        <Button component={Link} to={`/treasury/transfers/${transfer.id}`} size="small" variant="text" startIcon={<IconEye size={16} />}>
                          <FormattedMessage id="details" defaultMessage="تفاصيل" />
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
