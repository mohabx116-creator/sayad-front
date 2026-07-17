import { FormattedMessage, useIntl } from 'react-intl';
import { useParams, Link } from 'react-router-dom';
import dayjs from 'dayjs';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/GridLegacy';
import Typography from '@mui/material/Typography';
import { IconArrowRight, IconInfoCircle, IconCashBanknote, IconBan } from '@tabler/icons-react';

import Breadcrumbs from 'ui-component/extended/Breadcrumbs';
import PageTitle from 'ui-component/PageTitle';
import MainCard from 'ui-component/cards/MainCard';
import Loader from 'ui-component/Loader';

import { useExpense } from '../hooks/useExpenses';
import ExpenseStatusChip from '../components/ExpenseStatusChip';
import ExpenseAccountingStatusChip from '../components/ExpenseAccountingStatusChip';
import ExpenseLifecycleActions from '../components/ExpenseLifecycleActions';
import { formatTreasuryMoney } from 'modules/Treasury/utils/treasury.format';
import { getTreasuryStatusLabel } from 'modules/Treasury/utils/treasury.labels';

const formatDateTime = (utc: string | null | undefined) =>
  utc ? dayjs(utc).format('YYYY-MM-DD HH:mm') : '-';


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

export default function ExpenseDetailsPage() {
  const { id } = useParams();
  const intl = useIntl();
  const { expense, isLoading, error, mutate } = useExpense(id);
  const treasuryLocale = intl.locale?.toLowerCase().startsWith('en') ? 'en' : 'ar';

  if (isLoading) {
    return <Loader />;
  }

  if (error || !expense) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography color="error" variant="h5">
          <FormattedMessage id="error-loading-data" defaultMessage="حدث خطأ أثناء تحميل البيانات" />
        </Typography>
        <Typography variant="body1" sx={{ mt: 1 }}>
          {error?.message}
        </Typography>
        <Box sx={{ mt: 3 }}>
          <Link to="/expenses/list" style={{ textDecoration: 'none' }}>
            <FormattedMessage id="back-to-list" defaultMessage="العودة للقائمة" />
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
          links={[{ title: 'expenses', to: '/expenses' }, { title: 'expenses.list', to: '/expenses/list' }, { title: expense.expenseNumber }]}
          sx={{ mb: 0 }}
        />
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mt: 1, flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <PageTitle>
              {expense.expenseNumber}
            </PageTitle>
            <Box sx={{ mt: 1, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <ExpenseStatusChip status={expense.status} />
              <ExpenseAccountingStatusChip isAccountingPosted={expense.isAccountingPosted} accountingPostingStatus={expense.accountingPostingStatus} />
            </Box>
          </Box>
          <Box>
            <ExpenseLifecycleActions expense={expense} onSuccess={mutate} />
          </Box>
        </Box>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <MainCard
            title={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <IconInfoCircle color="var(--mui-palette-primary-main)" size={24} />
                <Typography variant="h4" fontWeight={600}>
                  <FormattedMessage id="basic-information" defaultMessage="المعلومات الأساسية" />
                </Typography>
              </Box>
            }
            sx={{ border: '1px solid', borderColor: 'divider', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', borderRadius: 3, mb: 3 }}
          >
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <DetailItem label={<FormattedMessage id="expense-number" defaultMessage="رقم المصروف" />} value={expense.expenseNumber} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <DetailItem label={<FormattedMessage id="date" />} value={expense.expenseDate} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <DetailItem
                  label={<FormattedMessage id="expense-category" defaultMessage="تصنيف المصروف" />}
                  value={
                    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                      <Typography variant="body2" color="primary.main" fontWeight={600}>{expense.expenseCategoryCode}</Typography>
                      <span>{expense.expenseCategoryNameArabic}</span>
                    </Box>
                  }
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <DetailItem
                  label={<FormattedMessage id="beneficiary" defaultMessage="المستفيد" />}
                  value={
                    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                      <Typography variant="body2" color="primary.main" fontWeight={600}>{expense.beneficiaryPartyCode}</Typography>
                      <span>{expense.beneficiaryPartyNameArabic}</span>
                    </Box>
                  }
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <DetailItem
                  label={<FormattedMessage id="treasury-account" defaultMessage="حساب الخزينة" />}
                  value={
                    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                      <Typography variant="body2" color="primary.main" fontWeight={600}>{expense.treasuryAccountCode}</Typography>
                      <span>{expense.treasuryAccountNameArabic}</span>
                    </Box>
                  }
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <DetailItem label={<FormattedMessage id="reference-number" defaultMessage="رقم المرجع" />} value={expense.referenceNumber} />
              </Grid>
              <Grid item xs={12}>
                <Divider sx={{ my: 1 }} />
              </Grid>
              <Grid item xs={12}>
                <DetailItem label={<FormattedMessage id="description" />} value={expense.description} />
              </Grid>
            </Grid>
          </MainCard>

          <MainCard
            title={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <IconInfoCircle color="var(--mui-palette-primary-main)" size={24} />
                <Typography variant="h4" fontWeight={600}>
                  <FormattedMessage id="expenses.accounting-integration" defaultMessage="الربط المحاسبي" />
                </Typography>
              </Box>
            }
            sx={{ border: '1px solid', borderColor: 'divider', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', borderRadius: 3, mb: 3 }}
          >
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <DetailItem
                  label={<FormattedMessage id="expenses.expense-accounting-account" defaultMessage="حساب المصروف" />}
                  value={
                    expense.expenseCategoryAccountingAccountCode ? (
                      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                        <Typography variant="body2" color="primary.main" fontWeight={600}>
                          {expense.expenseCategoryAccountingAccountCode}
                        </Typography>
                        <span>{expense.expenseCategoryAccountingAccountArabicName}</span>
                      </Box>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        <FormattedMessage id="expenses.unmapped-accounting" defaultMessage="غير مرتبط محاسبيًا" />
                      </Typography>
                    )
                  }
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <DetailItem
                  label={<FormattedMessage id="expenses.treasury-accounting-account" defaultMessage="حساب الخزينة" />}
                  value={
                    expense.treasuryAccountAccountingAccountCode ? (
                      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                        <Typography variant="body2" color="primary.main" fontWeight={600}>
                          {expense.treasuryAccountAccountingAccountCode}
                        </Typography>
                        <span>{expense.treasuryAccountAccountingAccountArabicName}</span>
                      </Box>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        <FormattedMessage id="expenses.unmapped-accounting" defaultMessage="غير مرتبط محاسبيًا" />
                      </Typography>
                    )
                  }
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <DetailItem
                  label={<FormattedMessage id="expenses.accounting-entry-number" defaultMessage="رقم القيد المحاسبي" />}
                  value={
                    expense.accountingJournalEntryId ? (
                      <Button component={Link} to={`/accounting/journal-entries/${expense.accountingJournalEntryId}`} size="small" endIcon={<IconArrowRight size={16} />}>
                        {expense.accountingEntryNumber || expense.accountingJournalEntryId}
                      </Button>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        -
                      </Typography>
                    )
                  }
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <DetailItem
                  label={<FormattedMessage id="expenses.accounting-posting-status" defaultMessage="حالة الترحيل المحاسبي" />}
                  value={<ExpenseAccountingStatusChip isAccountingPosted={expense.isAccountingPosted} accountingPostingStatus={expense.accountingPostingStatus} />}
                />
              </Grid>
            </Grid>
          </MainCard>

          {expense.status === 'Cancelled' && (
            <MainCard
              title={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'error.main' }}>
                  <IconBan size={24} />
                  <Typography variant="h4" fontWeight={600} color="inherit">
                    <FormattedMessage id="expenses.cancellation-details" defaultMessage="تفاصيل الإلغاء" />
                  </Typography>
                </Box>
              }
              sx={{ border: '1px solid', borderColor: 'error.light', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', borderRadius: 3, mb: 3, bgcolor: 'error.lighter' }}
            >
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <DetailItem label={<FormattedMessage id="cancelled-by" defaultMessage="بواسطة" />} value={expense.cancelledBy} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <DetailItem label={<FormattedMessage id="cancelled-at" defaultMessage="في تاريخ" />} value={expense.cancelledAtUtc ? formatDateTime(expense.cancelledAtUtc) : '-'} />
                </Grid>
                <Grid item xs={12}>
                  <DetailItem label={<FormattedMessage id="expenses.cancellation-reason" defaultMessage="سبب الإلغاء" />} value={expense.cancellationReason} />
                </Grid>
              </Grid>
            </MainCard>
          )}

          {expense.treasuryPaymentId && expense.treasuryPayment && (
            <MainCard
              title={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'success.dark' }}>
                  <IconCashBanknote size={24} />
                  <Typography variant="h4" fontWeight={600} color="inherit">
                    <FormattedMessage id="expenses.treasury-payment" defaultMessage="سند الصرف المالي" />
                  </Typography>
                </Box>
              }
              sx={{ border: '1px solid', borderColor: 'success.light', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', borderRadius: 3, mb: 3, bgcolor: 'success.lighter' }}
            >
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <DetailItem label={<FormattedMessage id="document-number" defaultMessage="رقم المستند" />} value={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography fontWeight="bold">{expense.treasuryPayment.number}</Typography>
                      <Link to={`/treasury/payments/${expense.treasuryPayment.id}`} style={{ display: 'flex', alignItems: 'center' }}>
                        <IconArrowRight size={16} />
                      </Link>
                    </Box>
                  } />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <DetailItem label={<FormattedMessage id="status" />} value={
                    <Typography fontWeight="bold" color={expense.treasuryPayment.status === 'Cancelled' ? 'error.main' : 'success.main'}>
                      {getTreasuryStatusLabel(expense.treasuryPayment.status, treasuryLocale)}
                    </Typography>
                  } />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <DetailItem label={<FormattedMessage id="amount" />} value={formatTreasuryMoney(expense.treasuryPayment.totalAmount)} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <DetailItem label={<FormattedMessage id="posted-at" defaultMessage="تاريخ الترحيل" />} value={expense.treasuryPayment.postedAtUtc ? formatDateTime(expense.treasuryPayment.postedAtUtc) : '-'} />
                </Grid>
              </Grid>
            </MainCard>
          )}
        </Grid>

        <Grid item xs={12} md={4}>
          <MainCard sx={{ border: '1px solid', borderColor: 'divider', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', borderRadius: 3, mb: 3 }}>
            <Typography variant="h4" fontWeight={600} sx={{ mb: 3 }}>
              <FormattedMessage id="summary" defaultMessage="الملخص" />
            </Typography>

            <Box sx={{ bgcolor: 'grey.50', p: 3, borderRadius: 2, textAlign: 'center', mb: 3 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                <FormattedMessage id="expenses.expense-amount" defaultMessage="قيمة المصروف" />
              </Typography>
              <Typography variant="h3" color="primary.main" fontWeight={800}>
                {formatTreasuryMoney(expense.amount)}
              </Typography>
            </Box>

            <DetailItem label={<FormattedMessage id="created-at" defaultMessage="تاريخ الإنشاء" />} value={expense.createdAtUtc ? formatDateTime(expense.createdAtUtc) : '-'} />
            
            {expense.updatedAtUtc && (
              <DetailItem label={<FormattedMessage id="updated-at" defaultMessage="تاريخ التعديل" />} value={formatDateTime(expense.updatedAtUtc)} />
            )}

            {expense.postedBy && (
              <DetailItem label={<FormattedMessage id="posted-by" defaultMessage="تم الترحيل بواسطة" />} value={expense.postedBy} />
            )}
            
            {expense.postedAtUtc && (
              <DetailItem label={<FormattedMessage id="posted-at" defaultMessage="تاريخ الترحيل" />} value={formatDateTime(expense.postedAtUtc)} />
            )}
          </MainCard>
        </Grid>
      </Grid>
    </Box>
  );
}
