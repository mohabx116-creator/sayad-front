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

  const { items, meta, isLoading, error, mutate } = useExpenses(params);
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
        <Breadcrumbs custom card={false} title={false} divider={false} heading="expenses" links={[{ title: 'expenses' }]} sx={{ mb: 0 }} />
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', mt: 1, gap: 2, flexWrap: 'wrap' }}>
          <PageTitle>
            <FormattedMessage id="expenses" defaultMessage="Expenses" />
          </PageTitle>
          <Button component={Link} to="/expenses/new" variant="contained" startIcon={<IconPlus />}>
            <FormattedMessage id="expenses.add-expense" defaultMessage="Add Expense" />
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
          <Grid item xs={12} md={2}>
            <TextField
              select
              size="small"
              fullWidth
              label={<FormattedMessage id="status" defaultMessage="Status" />}
              value={filters.status || ''}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            >
              <MenuItem value=""><FormattedMessage id="all" defaultMessage="All" /></MenuItem>
              <MenuItem value="Posted"><FormattedMessage id="expenses.status.recorded" defaultMessage="Recorded" /></MenuItem>
              <MenuItem value="Cancelled"><FormattedMessage id="expenses.status.cancelled" defaultMessage="Cancelled" /></MenuItem>
            </TextField>
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
          <Grid item xs={12} md={1} sx={{ display: 'flex', alignItems: 'flex-end', gap: 1, justifyContent: 'flex-end' }}>
            <Button variant="outlined" onClick={applyFilters}>
              <FormattedMessage id="search" defaultMessage="Search" />
            </Button>
          </Grid>
        </Grid>
      </Card>

      <Card sx={{ border: '1px solid', borderColor: 'divider', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', borderRadius: 3, overflow: 'hidden' }}>
        {isLoading && (
          <Box sx={{ py: 6 }}>
            <Skeleton variant="rectangular" height={240} />
          </Box>
        )}
        {error && !isLoading && (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography color="error" sx={{ mb: 2 }}>
              <FormattedMessage id="expenses-load-error" defaultMessage="Unable to load expenses." />
            </Typography>
            <Button variant="outlined" onClick={() => mutate()}>
              <FormattedMessage id="retry" defaultMessage="Retry" />
            </Button>
          </Box>
        )}
        {!isLoading && !error && items.length === 0 && (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography color="text.secondary">
              <FormattedMessage id="expenses.empty-recorded" defaultMessage="No expenses recorded." />
            </Typography>
          </Box>
        )}
        {!isLoading && !error && items.length > 0 && (
          <TableContainer sx={{ overflowX: 'auto' }}>
            <Table sx={{ minWidth: 1000 }}>
              <TableHead sx={{ bgcolor: 'grey.50' }}>
                <TableRow>
                  <TableCell><FormattedMessage id="date" defaultMessage="Date" /></TableCell>
                  <TableCell><FormattedMessage id="expenses.expense-type" defaultMessage="Expense Type" /></TableCell>
                  <TableCell><FormattedMessage id="expenses.cashbox" defaultMessage="Cashbox" /></TableCell>
                  <TableCell align="right"><FormattedMessage id="expenses.amount" defaultMessage="Amount" /></TableCell>
                  <TableCell><FormattedMessage id="expenses.paid-to" defaultMessage="Paid To" /></TableCell>
                  <TableCell align="center"><FormattedMessage id="status" defaultMessage="Status" /></TableCell>
                  <TableCell align="center"><FormattedMessage id="actions" defaultMessage="Actions" /></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {items.map((row) => (
                  <TableRow key={row.id} hover>
                    <TableCell>{row.expenseDate}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                        <Typography variant="body2" fontWeight={600}>{row.expenseCategoryNameArabic}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell>{row.treasuryAccountNameArabic}</TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" fontWeight={700}>{formatTreasuryMoney(row.amount)}</Typography>
                    </TableCell>
                    <TableCell>{row.paidToName || '-'}</TableCell>
                    <TableCell align="center">
                      <Box
                        sx={{
                          display: 'inline-block',
                          px: 1.5,
                          py: 0.5,
                          borderRadius: 1,
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          bgcolor: row.status === 'Cancelled' ? 'error.light' : 'success.light',
                          color: row.status === 'Cancelled' ? 'error.dark' : 'success.dark'
                        }}
                      >
                        {row.status === 'Cancelled' ? (
                          <FormattedMessage id="expenses.status.cancelled" defaultMessage="Cancelled" />
                        ) : (
                          <FormattedMessage id="expenses.status.recorded" defaultMessage="Recorded" />
                        )}
                      </Box>
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title={<FormattedMessage id="view" defaultMessage="View" />}>
                        <IconButton component={Link} to={`/expenses/${row.id}`} size="small" color="primary">
                          <IconEye size={18} />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
        {!isLoading && !error && (
          <TablePagination
            component="div"
            count={meta.totalCount}
            page={meta.page - 1}
            onPageChange={(_, newPage) => setParams({ ...params, page: newPage + 1 })}
            rowsPerPage={meta.pageSize}
            onRowsPerPageChange={(e) => setParams({ ...params, pageSize: parseInt(e.target.value, 10), page: 1 })}
            rowsPerPageOptions={[10, 20, 50]}
          />
        )}
      </Card>
    </Box>
  );
}
