import { useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { Link } from 'react-router-dom';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
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
import Autocomplete from '@mui/material/Autocomplete';
import { IconEye, IconPlus } from '@tabler/icons-react';

import Breadcrumbs from 'ui-component/extended/Breadcrumbs';
import PageTitle from 'ui-component/PageTitle';
import { useTreasuryAccounts } from 'modules/Treasury/hooks/useTreasury';

import { useExpenses, useExpenseCategories } from '../hooks/useExpenses';
import type { ExpensesListParams } from '../types/expense.types';
import { formatTreasuryMoney } from 'modules/Treasury/utils/treasury.format';

export default function ExpensesListPage() {
  const [params, setParams] = useState<ExpensesListParams>({
    page: 1,
    pageSize: 20,
    search: '',
    expenseCategoryId: '',
    treasuryAccountId: '',
    dateFrom: '',
    dateTo: ''
  });
  const [filters, setFilters] = useState(params);

  const { items, meta, isLoading } = useExpenses(params);
  const { items: categories } = useExpenseCategories({ page: 1, pageSize: 100, isActive: true });
  const { items: accounts } = useTreasuryAccounts({ page: 1, pageSize: 100, status: 'Active' });

  const applyFilters = () => setParams({ ...filters, page: 1, pageSize: params.pageSize });
  const clearFilters = () => {
    const empty = { page: 1, pageSize: params.pageSize, search: '', expenseCategoryId: '', treasuryAccountId: '', dateFrom: '', dateTo: '' };
    setFilters(empty);
    setParams(empty);
  };

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Breadcrumbs custom card={false} title={false} divider={false} heading="expenses.list" links={[{ title: 'expenses.list' }]} sx={{ mb: 0 }} />
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', mt: 1, gap: 2, flexWrap: 'wrap' }}>
          <PageTitle>
            <FormattedMessage id="expenses.list" defaultMessage="Expenses" />
          </PageTitle>
          <Button component={Link} to="/expenses/new" variant="contained" startIcon={<IconPlus />}>
            <FormattedMessage id="expenses.create-expense" defaultMessage="Create Expense" />
          </Button>
        </Box>
      </Box>

      <Card sx={{ p: 2, mb: 3, border: '1px solid', borderColor: 'divider', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', borderRadius: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={3}>
            <TextField
              size="small"
              fullWidth
              label={<FormattedMessage id="search" defaultMessage="Search" />}
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <Autocomplete
              size="small"
              options={categories}
              getOptionLabel={(opt) => `${opt.code} - ${opt.nameArabic}`}
              value={categories.find((c) => c.id === filters.expenseCategoryId) || null}
              onChange={(_, value) => setFilters({ ...filters, expenseCategoryId: value?.id || '' })}
              renderInput={(params) => <TextField {...params} label={<FormattedMessage id="expenses.expense-type" defaultMessage="Expense Type" />} />}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <Autocomplete
              size="small"
              options={accounts}
              getOptionLabel={(opt) => `${opt.code} - ${opt.nameArabic}`}
              value={accounts.find((a) => a.id === filters.treasuryAccountId) || null}
              onChange={(_, value) => setFilters({ ...filters, treasuryAccountId: value?.id || '' })}
              renderInput={(params) => <TextField {...params} label={<FormattedMessage id="expenses.cashbox" defaultMessage="Cashbox" />} />}
            />
          </Grid>
          <Grid item xs={12} md={1.5}>
            <TextField
              type="date"
              size="small"
              fullWidth
              label={<FormattedMessage id="date-from" defaultMessage="From Date" />}
              value={filters.dateFrom}
              onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} md={1.5}>
            <TextField
              type="date"
              size="small"
              fullWidth
              label={<FormattedMessage id="date-to" defaultMessage="To Date" />}
              value={filters.dateTo}
              onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} md={1.5} sx={{ display: 'flex', alignItems: 'flex-end', gap: 1, justifyContent: 'flex-end' }}>
            <Button variant="outlined" color="inherit" onClick={clearFilters}>
              <FormattedMessage id="clear" defaultMessage="Clear" />
            </Button>
            <Button variant="outlined" onClick={applyFilters}>
              <FormattedMessage id="search" defaultMessage="Search" />
            </Button>
          </Grid>
        </Grid>
      </Card>

      <Card sx={{ border: '1px solid', borderColor: 'divider', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', borderRadius: 3, overflow: 'hidden' }}>
        <TableContainer sx={{ overflowX: 'auto' }}>
          <Table sx={{ minWidth: 1000 }}>
            <TableHead sx={{ bgcolor: 'grey.50' }}>
              <TableRow>
                <TableCell><FormattedMessage id="date" defaultMessage="Date" /></TableCell>
                <TableCell><FormattedMessage id="expenses.expense-type" defaultMessage="Expense Type" /></TableCell>
                <TableCell align="right"><FormattedMessage id="expenses.amount" defaultMessage="Amount" /></TableCell>
                <TableCell><FormattedMessage id="expenses.cashbox" defaultMessage="Cashbox" /></TableCell>
                <TableCell><FormattedMessage id="expenses.paid-to" defaultMessage="Paid To" /></TableCell>
                <TableCell><FormattedMessage id="expenses.notes" defaultMessage="Notes" /></TableCell>
                <TableCell align="center"><FormattedMessage id="view" defaultMessage="View" /></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <TableRow key={index}>
                    <TableCell><Skeleton width={110} /></TableCell>
                    <TableCell><Skeleton width={150} /></TableCell>
                    <TableCell align="right"><Skeleton width={90} sx={{ ml: 'auto' }} /></TableCell>
                    <TableCell><Skeleton width={150} /></TableCell>
                    <TableCell><Skeleton width={140} /></TableCell>
                    <TableCell><Skeleton width={180} /></TableCell>
                    <TableCell align="center"><Skeleton width={40} sx={{ mx: 'auto' }} /></TableCell>
                  </TableRow>
                ))
              ) : items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                    <Typography variant="body1" color="text.secondary">
                      <FormattedMessage id="expenses.empty" defaultMessage="No expenses found." />
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                items.map((row) => (
                  <TableRow key={row.id} hover>
                    <TableCell>{row.expenseDate}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                        <Typography variant="body2" fontWeight={600}>{row.expenseCategoryNameArabic}</Typography>
                        <Typography variant="caption" color="text.secondary">{row.expenseCategoryCode}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" fontWeight={700}>{formatTreasuryMoney(row.amount)}</Typography>
                    </TableCell>
                    <TableCell>{row.treasuryAccountNameArabic}</TableCell>
                    <TableCell>{row.paidToName || row.beneficiaryPartyNameArabic || '-'}</TableCell>
                    <TableCell sx={{ maxWidth: 240 }}>
                      <Typography variant="body2" noWrap title={row.notes || ''}>
                        {row.notes || '-'}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title={<FormattedMessage id="view" defaultMessage="View" />}>
                        <IconButton component={Link} to={`/expenses/${row.id}`} size="small" color="primary">
                          <IconEye size={18} />
                        </IconButton>
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
          onPageChange={(_, newPage) => setParams({ ...params, page: newPage + 1 })}
          rowsPerPage={meta.pageSize}
          onRowsPerPageChange={(e) => setParams({ ...params, pageSize: parseInt(e.target.value, 10), page: 1 })}
          rowsPerPageOptions={[10, 20, 50]}
        />
      </Card>
    </Box>
  );
}
