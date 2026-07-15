import { Link } from 'react-router-dom';
import { FormattedMessage } from 'react-intl';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/GridLegacy';
import Skeleton from '@mui/material/Skeleton';
import Typography from '@mui/material/Typography';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Tooltip from '@mui/material/Tooltip';
import {
  IconArrowRight,
  IconReceipt2,
  IconCategory,
  IconEye
} from '@tabler/icons-react';

import Breadcrumbs from 'ui-component/extended/Breadcrumbs';
import PageTitle from 'ui-component/PageTitle';

import { useExpenses } from '../hooks/useExpenses';
import ExpenseStatusChip from '../components/ExpenseStatusChip';
import { formatTreasuryMoney } from 'modules/Treasury/utils/treasury.format';

const tiles = [
  {
    titleId: 'expenses.categories',
    descriptionId: 'expenses.categories-desc',
    href: '/expenses/categories',
    icon: IconCategory,
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: '#764ba2'
  },
  {
    titleId: 'expenses.list',
    descriptionId: 'expenses.list-desc',
    href: '/expenses/list',
    icon: IconReceipt2,
    gradient: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
    color: '#11998e'
  }
];

export default function ExpensesHomePage() {
  const { items, isLoading, error } = useExpenses({ page: 1, pageSize: 5 });

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Breadcrumbs custom card={false} title={false} divider={false} heading="expenses.dashboard" links={[{ title: 'expenses', to: '/expenses' }, { title: 'expenses.dashboard' }]} sx={{ mb: 0 }} />
        <PageTitle>
          <FormattedMessage id="expenses.dashboard" defaultMessage="لوحة المصروفات" />
        </PageTitle>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          <FormattedMessage id="expenses.home-subtitle" defaultMessage="إدارة المصروفات وتصنيفاتها" />
        </Typography>
      </Box>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        {tiles.map((tile) => {
          const Icon = tile.icon;
          return (
            <Grid key={tile.href} item xs={12} sm={6}>
              <Card
                sx={{
                  height: '100%',
                  border: '1px solid',
                  borderColor: 'divider',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                  borderRadius: 3,
                  overflow: 'hidden',
                  transition: 'all 0.25s ease',
                  cursor: 'pointer',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 12px 32px rgba(0,0,0,0.1)',
                    borderColor: 'transparent'
                  }
                }}
              >
                <Box sx={{ height: 4, background: tile.gradient }} />

                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2.5, mb: 3 }}>
                    <Box
                      sx={{
                        width: 52,
                        height: 52,
                        borderRadius: 2.5,
                        background: tile.gradient,
                        display: 'grid',
                        placeItems: 'center',
                        flexShrink: 0,
                        boxShadow: `0 6px 16px ${tile.color}40`
                      }}
                    >
                      <Icon size={26} color="#fff" />
                    </Box>
                    <Box>
                      <Typography variant="h4" fontWeight={700} sx={{ mb: 0.5 }}>
                        <FormattedMessage id={tile.titleId} />
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                        <FormattedMessage id={tile.descriptionId} defaultMessage="عرض وإدارة السجلات." />
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Button
                      component={Link}
                      to={tile.href}
                      size="small"
                      endIcon={<IconArrowRight size={15} />}
                      sx={{
                        color: tile.color,
                        fontWeight: 600,
                        px: 0,
                        '&:hover': { background: 'transparent', opacity: 0.75 }
                      }}
                    >
                      <FormattedMessage id="view-all" defaultMessage="عرض الكل" />
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      <Typography variant="h4" sx={{ mb: 2 }}>
        <FormattedMessage id="expenses.recent" defaultMessage="أحدث المصروفات" />
      </Typography>
      
      <Card sx={{ border: '1px solid', borderColor: 'divider', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', borderRadius: 3, overflow: 'hidden' }}>
        <TableContainer>
          <Table>
            <TableHead sx={{ bgcolor: 'grey.50' }}>
              <TableRow>
                <TableCell><FormattedMessage id="expense-number" defaultMessage="رقم المصروف" /></TableCell>
                <TableCell><FormattedMessage id="date" /></TableCell>
                <TableCell><FormattedMessage id="expense-category" defaultMessage="تصنيف المصروف" /></TableCell>
                <TableCell><FormattedMessage id="beneficiary" defaultMessage="المستفيد" /></TableCell>
                <TableCell align="right"><FormattedMessage id="amount" /></TableCell>
                <TableCell><FormattedMessage id="status" /></TableCell>
                <TableCell align="center"><FormattedMessage id="actions" /></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 3 }).map((_, index) => (
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
              ) : error ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                    <Typography color="error.main">
                      <FormattedMessage id="error-loading-data" defaultMessage="حدث خطأ أثناء تحميل البيانات" />
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                    <Typography color="text.secondary">
                      <FormattedMessage id="expenses.empty" defaultMessage="لا توجد سجلات." />
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                items.map((expense) => (
                  <TableRow key={expense.id} hover>
                    <TableCell sx={{ fontWeight: 600 }}>{expense.expenseNumber}</TableCell>
                    <TableCell>{expense.expenseDate}</TableCell>
                    <TableCell>{expense.expenseCategoryNameArabic}</TableCell>
                    <TableCell>{expense.beneficiaryPartyNameArabic}</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>{formatTreasuryMoney(expense.amount)}</TableCell>
                    <TableCell>
                      <ExpenseStatusChip status={expense.status} />
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title={<FormattedMessage id="details" />}>
                        <Button component={Link} to={`/expenses/${expense.id}`} size="small" variant="text" startIcon={<IconEye size={16} />}>
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
      </Card>
    </Box>
  );
}
