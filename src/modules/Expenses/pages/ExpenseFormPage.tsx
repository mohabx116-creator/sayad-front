import { useEffect, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';

import Box from '@mui/material/Box';

import Breadcrumbs from 'ui-component/extended/Breadcrumbs';
import PageTitle from 'ui-component/PageTitle';
import { useDispatch } from 'store';
import { openSnackbar } from 'store/slices/snackbar';
import { useTreasuryAccounts } from 'modules/Treasury/hooks/useTreasury';

import { createExpense } from '../api/expensesApi';
import { useExpenseCategories } from '../hooks/useExpenses';
import type { ExpenseInput } from '../types/expense.types';
import ExpenseForm from '../components/ExpenseForm';

export default function ExpenseFormPage() {
  const intl = useIntl();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [isSaving, setIsSaving] = useState(false);
  const [form, setForm] = useState<ExpenseInput>({
    expenseCategoryId: '',
    treasuryAccountId: '',
    expenseDate: dayjs().format('YYYY-MM-DD'),
    amount: 0,
    referenceNumber: '',
    paidToName: '',
    notes: ''
  });

  const { items: categories, isLoading: isCategoriesLoading } = useExpenseCategories({ page: 1, pageSize: 100, isActive: true });
  const { items: accounts, isLoading: isAccountsLoading } = useTreasuryAccounts({ page: 1, pageSize: 100, status: 'Active' });

  useEffect(() => {
  }, [intl]);

  const notify = (message: string, severity: 'success' | 'error' = 'success') => {
    dispatch(openSnackbar({ open: true, message, variant: 'alert', severity }));
  };

  const handleSubmit = async () => {
    setIsSaving(true);
    try {
      const response = await createExpense({
        ...form,
        beneficiaryPartyId: undefined,
        paidToName: form.paidToName?.trim() ? form.paidToName.trim() : null,
        referenceNumber: form.referenceNumber?.trim() ? form.referenceNumber.trim() : null,
        notes: form.notes?.trim() ? form.notes.trim() : null
      });
      notify(intl.formatMessage({ id: 'expenses.created-successfully', defaultMessage: 'Expense created successfully' }));
      navigate(`/expenses/${response.id}`);
    } catch (error) {
      notify(error instanceof Error ? error.message : 'Error', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  if (isCategoriesLoading || isAccountsLoading) {
    return <Box />;
  }

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Breadcrumbs
          custom
          card={false}
          title={false}
          divider={false}
          heading="expenses.create-expense"
          links={[{ title: 'expenses.list', to: '/expenses/list' }, { title: 'expenses.create-expense' }]}
          sx={{ mb: 0 }}
        />
        <PageTitle>
          <FormattedMessage id="expenses.create-expense" defaultMessage="Create Expense" />
        </PageTitle>
      </Box>

      <ExpenseForm
        isLoading={false}
        isSaving={isSaving}
        form={form}
        setForm={setForm}
        categories={categories}
        accounts={accounts}
        backUrl="/expenses/list"
        onSubmit={handleSubmit}
      />
    </Box>
  );
}
