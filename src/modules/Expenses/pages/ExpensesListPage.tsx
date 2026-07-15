import { useState } from 'react';
import { FormattedMessage } from 'react-intl';
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
import Autocomplete from '@mui/material/Autocomplete';

import { IconPlus, IconEye } from '@tabler/icons-react';

import Breadcrumbs from 'ui-component/extended/Breadcrumbs';
import PageTitle from 'ui-component/PageTitle';
import PermissionGuard from 'modules/Administration/components/PermissionGuard';
import { useParties } from 'modules/Parties/hooks/useParties';
import { useTreasuryAccounts } from 'modules/Treasury/hooks/useTreasury';

import { useExpenses, useExpenseCategories } from '../hooks/useExpenses';
import { EXPENSES_PERMISSIONS } from '../utils/expense.constants';
import type { ExpensesListParams } from '../types/expense.types';
import ExpenseStatusChip from '../components/ExpenseStatusChip';
import { formatTreasuryMoney } from 'modules/Treasury/utils/treasury.format';

export default function ExpensesListPage() {
  const [params, setParams] = useState<ExpensesListParams>({
    page: 1,
    pageSize: 20,
    search: '',
    status: '',
    expenseCategoryId: '',
    treasuryAccountId: '',
    beneficiaryPartyId: '',
    dateFrom: '',
    dateTo: ''
  });
  
  // local filter state to apply on search button click
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    expenseCategoryId: '',
    treasuryAccountId: '',
    beneficiaryPartyId: '',
    dateFrom: '',
    dateTo: ''
  });

  const { items, meta, isLoading } = useExpenses(params);

  // Data for filters
  const { items: categories } = useExpenseCategories({ page: 1, pageSize: 100, isActive: true });
  const { items: accounts } = useTreasuryAccounts({ page: 1, pageSize: 100, status: 'Active' });
  const { items: parties } = useParties({ page: 1, pageSize: 100, isActive: true });

  const handleSearch = () => {
    setParams({ ...params, page: 1, ...filters });
  };

  const handleClear = () => {
    const emptyFilters = {
      search: '',
      status: '',
      expenseCategoryId: '',
      treasuryAccountId: '',
      beneficiaryPartyId: '',
      dateFrom: '',
      dateTo: ''
    };
    setFilters(emptyFilters);
    setParams({ ...params, page: 1, ...emptyFilters });
  };

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Breadcrumbs custom card={false} title={false} divider={false} heading="expenses.list" links={[{ title: 'expenses', to: '/expenses' }, { title: 'expenses.list' }]} sx={{ mb: 0 }} />
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', mt: 1 }}>
          <PageTitle>
            <FormattedMessage id="expenses.list" defaultMessage="قائمة المصروفات" />
          </PageTitle>
          <PermissionGuard permission={EXPENSES_PERMISSIONS.create}>
            <Button
              component={Link}
              to="/expenses/new"
              variant="contained"
              startIcon={<IconPlus />}
              sx={{ borderRadius: 2 }}
            >
              <FormattedMessage id="expenses.create-expense" defaultMessage="إنشاء مصروف" />
            </Button>
          </PermissionGuard>
        </Box>
      </Box>

      <Card sx={{ p: 2, mb: 3, border: '1px solid', borderColor: 'divider', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', borderRadius: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={4} md={3}>
            <TextField
              size="small"
              fullWidth
              label={<FormattedMessage id="search" defaultMessage="بحث" />}
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
          </Grid>
          <Grid item xs={12} sm={4} md={3}>
            <TextField
              select
              size="small"
              fullWidth
              label={<FormattedMessage id="status" defaultMessage="الحالة" />}
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            >
              <MenuItem value=""><FormattedMessage id="all" defaultMessage="الكل" /></MenuItem>
              <MenuItem value="Draft"><FormattedMessage id="expenses.status.draft" defaultMessage="مسودة" /></MenuItem>
              <MenuItem value="Posted"><FormattedMessage id="expenses.status.posted" defaultMessage="مرحل" /></MenuItem>
              <MenuItem value="Cancelled"><FormattedMessage id="expenses.status.cancelled" defaultMessage="ملغي" /></MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} sm={4} md={3}>
            <Autocomplete
              size="small"
              options={categories}
              getOptionLabel={(opt) => `${opt.code} - ${opt.nameArabic}`}
              value={categories.find((c) => c.id === filters.expenseCategoryId) || null}
              onChange={(_, val) => setFilters({ ...filters, expenseCategoryId: val?.id || '' })}
              renderInput={(params) => <TextField {...params} label={<FormattedMessage id="expense-category" defaultMessage="التصنيف" />} />}
            />
          </Grid>
          <Grid item xs={12} sm={4} md={3}>
            <Autocomplete
              size="small"
              options={parties}
              getOptionLabel={(opt) => `${opt.code} - ${opt.nameArabic}`}
              value={parties.find((p) => p.id === filters.beneficiaryPartyId) || null}
              onChange={(_, val) => setFilters({ ...filters, beneficiaryPartyId: val?.id || '' })}
              renderInput={(params) => <TextField {...params} label={<FormattedMessage id="beneficiary" defaultMessage="المستفيد" />} />}
            />
          </Grid>
          <Grid item xs={12} sm={4} md={3}>
            <Autocomplete
              size="small"
              options={accounts}
              getOptionLabel={(opt) => `${opt.code} - ${opt.nameArabic}`}
              value={accounts.find((a) => a.id === filters.treasuryAccountId) || null}
              onChange={(_, val) => setFilters({ ...filters, treasuryAccountId: val?.id || '' })}
              renderInput={(params) => <TextField {...params} label={<FormattedMessage id="treasury-account" defaultMessage="حساب الخزينة" />} />}
            />
          </Grid>
          <Grid item xs={12} sm={4} md={3}>
            <TextField
              type="date"
              size="small"
              fullWidth
              label={<FormattedMessage id="date-from" defaultMessage="من تاريخ" />}
              value={filters.dateFrom}
              onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} sm={4} md={3}>
            <TextField
              type="date"
              size="small"
              fullWidth
              label={<FormattedMessage id="date-to" defaultMessage="إلى تاريخ" />}
              value={filters.dateTo}
              onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} sm={12} md={3} sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
            <Button variant="outlined" color="inherit" onClick={handleClear} sx={{ borderRadius: 2 }}>
              <FormattedMessage id="clear" defaultMessage="مسح" />
            </Button>
            <Button variant="outlined" color="primary" onClick={handleSearch} sx={{ borderRadius: 2 }}>
              <FormattedMessage id="search" defaultMessage="بحث" />
            </Button>
          </Grid>
        </Grid>
      </Card>

      <Card sx={{ border: '1px solid', borderColor: 'divider', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', borderRadius: 3, overflow: 'hidden' }}>
        <TableContainer sx={{ overflowX: 'auto' }}>
          <Table sx={{ minWidth: 1000 }}>
            <TableHead sx={{ bgcolor: 'grey.50' }}>
              <TableRow>
                <TableCell><FormattedMessage id="expense-number" defaultMessage="رقم المصروف" /></TableCell>
                <TableCell><FormattedMessage id="date" defaultMessage="التاريخ" /></TableCell>
                <TableCell><FormattedMessage id="expense-category" defaultMessage="التصنيف" /></TableCell>
                <TableCell><FormattedMessage id="beneficiary" defaultMessage="المستفيد" /></TableCell>
                <TableCell><FormattedMessage id="treasury-account" defaultMessage="حساب الخزينة" /></TableCell>
                <TableCell align="right"><FormattedMessage id="amount" defaultMessage="المبلغ" /></TableCell>
                <TableCell><FormattedMessage id="status" defaultMessage="الحالة" /></TableCell>
                <TableCell align="center"><FormattedMessage id="actions" defaultMessage="الإجراءات" /></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton width={80} /></TableCell>
                    <TableCell><Skeleton width={100} /></TableCell>
                    <TableCell><Skeleton width={140} /></TableCell>
                    <TableCell><Skeleton width={140} /></TableCell>
                    <TableCell><Skeleton width={140} /></TableCell>
                    <TableCell align="right"><Skeleton width={80} sx={{ ml: 'auto' }} /></TableCell>
                    <TableCell><Skeleton width={80} /></TableCell>
                    <TableCell align="center"><Skeleton width={40} sx={{ mx: 'auto' }} /></TableCell>
                  </TableRow>
                ))
              ) : items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
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
                        {row.expenseNumber}
                      </Typography>
                    </TableCell>
                    <TableCell>{row.expenseDate}</TableCell>
                    <TableCell>{row.expenseCategoryNameArabic}</TableCell>
                    <TableCell>{row.beneficiaryPartyNameArabic}</TableCell>
                    <TableCell>{row.treasuryAccountNameArabic}</TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" fontWeight={700}>
                        {formatTreasuryMoney(row.amount)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <ExpenseStatusChip status={row.status} />
                    </TableCell>
                    <TableCell align="center">
                      <PermissionGuard permission={EXPENSES_PERMISSIONS.view}>
                        <Tooltip title={<FormattedMessage id="view" defaultMessage="عرض" />}>
                          <IconButton component={Link} to={`/expenses/${row.id}`} size="small" color="primary">
                            <IconEye size={18} />
                          </IconButton>
                        </Tooltip>
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
    </Box>
  );
}
