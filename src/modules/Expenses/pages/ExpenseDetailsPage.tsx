import { useEffect } from 'react';
import { FormattedMessage } from 'react-intl';
import { Link, useParams } from 'react-router-dom';
import dayjs from 'dayjs';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/GridLegacy';
import Typography from '@mui/material/Typography';
import { IconInfoCircle } from '@tabler/icons-react';

import Breadcrumbs from 'ui-component/extended/Breadcrumbs';
import PageTitle from 'ui-component/PageTitle';
import Loader from 'ui-component/Loader';
import { getDocumentDisplayNumber } from 'shared/utils/documentDisplay';
import { useBrowserTitle } from 'shared/hooks/useBrowserTitle';

import { useExpense } from '../hooks/useExpenses';
import ExpenseStatusChip from '../components/ExpenseStatusChip';
import ExpenseAccountingStatusChip from '../components/ExpenseAccountingStatusChip';
import { formatTreasuryMoney } from 'modules/Treasury/utils/treasury.format';

function DetailItem({ label, value }: { label: React.ReactNode; value: React.ReactNode }) {
  return (
    <Box sx={{ mb: 2 }}>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
        {label}
      </Typography>
      <Typography variant="body1" fontWeight={500}>
        {value || '-'}
      </Typography>
    </Box>
  );
}

const formatDateTime = (utc: string | null | undefined) => (utc ? dayjs(utc).format('YYYY-MM-DD HH:mm') : '-');

export default function ExpenseDetailsPage() {
  const { id } = useParams();
  const { expense, isLoading, error } = useExpense(id);
  const expenseDisplayNumber = getDocumentDisplayNumber(expense?.displayNumber, expense?.expenseNumber);
  useBrowserTitle(expense ? [expenseDisplayNumber] : []);

  useEffect(() => {
    if (!expense) {
      return;
    }
  }, [expense, expenseDisplayNumber]);

  if (isLoading) {
    return <Loader />;
  }

  if (error || !expense) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography color="error" variant="h5">
          <FormattedMessage id="error-loading-data" defaultMessage="Failed to load data" />
        </Typography>
        <Box sx={{ mt: 3 }}>
          <Link to="/expenses/list" style={{ textDecoration: 'none' }}>
            <FormattedMessage id="back-to-list" defaultMessage="Back to list" />
          </Link>
        </Box>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Breadcrumbs
          custom
          card={false}
          title={false}
          divider={false}
          heading="expenses.details"
          links={[{ title: 'expenses.list', to: '/expenses/list' }, { title: expenseDisplayNumber }]}
          sx={{ mb: 0 }}
        />
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mt: 1, flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <PageTitle>{expenseDisplayNumber}</PageTitle>
            <Box sx={{ mt: 1, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <ExpenseStatusChip status={expense.status} />
              <ExpenseAccountingStatusChip isAccountingPosted={expense.isAccountingPosted} accountingPostingStatus={expense.accountingPostingStatus} />
            </Box>
          </Box>
          {expense.treasuryPaymentId && (
            <Box sx={{ textAlign: 'right' }}>
              <Typography variant="body2" color="text.secondary">
                <FormattedMessage id="expenses.treasury-reference" defaultMessage="Treasury Reference" />
              </Typography>
            </Box>
          )}
        </Box>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={9} xl={9}>
          <Card sx={{ p: 3, border: '1px solid', borderColor: 'divider', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', borderRadius: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
              <IconInfoCircle color="var(--mui-palette-primary-main)" size={24} />
              <Typography variant="h4" fontWeight={700}>
                <FormattedMessage id="basic-information" defaultMessage="Basic Information" />
              </Typography>
            </Box>

            <Grid container spacing={3}>
              <Grid item xs={12} sm={6} md={4}>
                <DetailItem label={<FormattedMessage id="date" defaultMessage="Date" />} value={expense.expenseDate} />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <DetailItem
                  label={<FormattedMessage id="expenses.expense-type" defaultMessage="Expense Type" />}
                  value={
                    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                      <Typography variant="body2" color="primary.main" fontWeight={600}>{expense.expenseCategoryCode}</Typography>
                      <span>{expense.expenseCategoryNameArabic}</span>
                    </Box>
                  }
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <DetailItem
                  label={<FormattedMessage id="expenses.cashbox" defaultMessage="Cashbox" />}
                  value={
                    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                      <Typography variant="body2" color="primary.main" fontWeight={600}>{expense.treasuryAccountCode}</Typography>
                      <span>{expense.treasuryAccountNameArabic}</span>
                    </Box>
                  }
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Box sx={{ mb: 2, bgcolor: 'primary.light', p: 1.5, borderRadius: 2 }}>
                  <Typography variant="body2" color="primary.main" fontWeight={600} sx={{ mb: 0.5 }}>
                    <FormattedMessage id="expenses.amount" defaultMessage="Amount" />
                  </Typography>
                  <Typography variant="h5" color="primary.dark" fontWeight={700}>
                    {formatTreasuryMoney(expense.amount)}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <DetailItem
                  label={<FormattedMessage id="expenses.paid-to" defaultMessage="Paid To" />}
                  value={expense.paidToName || expense.beneficiaryPartyNameArabic || '-'}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <DetailItem
                  label={<FormattedMessage id="expenses.treasury-reference" defaultMessage="Treasury Reference" />}
                  value={expense.treasuryPayment?.number || expense.treasuryPaymentId || '-'}
                />
              </Grid>
              <Grid item xs={12}>
                <Divider sx={{ my: 1 }} />
              </Grid>
              <Grid item xs={12}>
                <DetailItem label={<FormattedMessage id="expenses.notes" defaultMessage="Notes" />} value={expense.notes} />
              </Grid>
            </Grid>
          </Card>
        </Grid>

        <Grid item xs={12} md={3} xl={3}>
          <Card sx={{ p: 3, border: '1px solid', borderColor: 'divider', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', borderRadius: 3 }}>
            <Typography variant="h4" fontWeight={700} sx={{ mb: 3 }}>
              <FormattedMessage id="operation-summary-section" defaultMessage="Summary" />
            </Typography>

            <DetailItem label={<FormattedMessage id="created-at" defaultMessage="Created At" />} value={formatDateTime(expense.createdAtUtc)} />
            {expense.updatedAtUtc && <DetailItem label={<FormattedMessage id="updated-at" defaultMessage="Updated At" />} value={formatDateTime(expense.updatedAtUtc)} />}
            {expense.postedAtUtc && <DetailItem label={<FormattedMessage id="posted-at" defaultMessage="Posted At" />} value={formatDateTime(expense.postedAtUtc)} />}
            {expense.cancelledAtUtc && <DetailItem label={<FormattedMessage id="cancelled-at" defaultMessage="Cancelled At" />} value={formatDateTime(expense.cancelledAtUtc)} />}
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
