import { useEffect, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { useNavigate, useParams } from 'react-router-dom';
import dayjs from 'dayjs';

import Box from '@mui/material/Box';

import Breadcrumbs from 'ui-component/extended/Breadcrumbs';
import PageTitle from 'ui-component/PageTitle';
import Loader from 'ui-component/Loader';
import { useDispatch } from 'store';
import { openSnackbar } from 'store/slices/snackbar';
import { useParties } from 'modules/Parties/hooks/useParties';
import { useTreasuryAccounts } from 'modules/Treasury/hooks/useTreasury';

import { getExpense, createExpense, updateExpense, postExpense } from '../api/expensesApi';
import { useExpenseCategories } from '../hooks/useExpenses';
import { EXPENSES_PERMISSIONS } from '../utils/expense.constants';
import type { ExpenseInput, ExpenseStatus } from '../types/expense.types';
import ExpenseForm from '../components/ExpenseForm';

export default function ExpenseFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const intl = useIntl();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(isEdit);
  const [isSaving, setIsSaving] = useState(false);
  const [rowVersion, setRowVersion] = useState('');
  const [status, setStatus] = useState<ExpenseStatus | undefined>();
  const [expenseNumber, setExpenseNumber] = useState<string | undefined>();

  const [form, setForm] = useState<ExpenseInput>({
    expenseCategoryId: '',
    treasuryAccountId: '',
    beneficiaryPartyId: '',
    expenseDate: dayjs().format('YYYY-MM-DD'),
    amount: 0,
    referenceNumber: '',
    description: ''
  });

  const { items: categories, isLoading: isCategoriesLoading } = useExpenseCategories({ page: 1, pageSize: 100, isActive: true });
  const { items: accounts, isLoading: isAccountsLoading } = useTreasuryAccounts({ page: 1, pageSize: 100, status: 'Active' });
  const { items: parties, isLoading: isPartiesLoading } = useParties({ page: 1, pageSize: 100, isActive: true });

  useEffect(() => {
    if (isEdit && id) {
      getExpense(id)
        .then((data) => {
          if (!data.canEdit) {
            dispatch(openSnackbar({ open: true, message: 'لا يمكن تعديل هذا المصروف', variant: 'alert', severity: 'error' }));
            navigate(`/expenses/${id}`);
            return;
          }
          setForm({
            expenseCategoryId: data.expenseCategoryId,
            treasuryAccountId: data.treasuryAccountId,
            beneficiaryPartyId: data.beneficiaryPartyId,
            expenseDate: data.expenseDate,
            amount: data.amount,
            referenceNumber: data.referenceNumber,
            description: data.description
          });
          setRowVersion(data.rowVersion);
          setStatus(data.status);
          setExpenseNumber(data.expenseNumber);
        })
        .catch((error) => {
          dispatch(openSnackbar({ open: true, message: error.message, variant: 'alert', severity: 'error' }));
          navigate('/expenses/list');
        })
        .finally(() => setIsLoading(false));
    }
  }, [id, isEdit, dispatch, navigate]);

  const notify = (message: string, severity: 'success' | 'error' = 'success') => {
    dispatch(openSnackbar({ open: true, message, variant: 'alert', severity }));
  };

  const handleSubmit = async (actionType: 'draft' | 'post') => {
    setIsSaving(true);
    try {
      let expenseId = id;
      let newRowVersion = rowVersion;

      if (isEdit && expenseId) {
        const response = await updateExpense(expenseId, { ...form, rowVersion });
        newRowVersion = response.rowVersion;
        notify(intl.formatMessage({ id: 'expenses.updated-successfully', defaultMessage: 'تم تعديل المصروف بنجاح كمسودة' }));
      } else {
        const response = await createExpense(form);
        expenseId = response.id;
        newRowVersion = response.rowVersion;
        notify(intl.formatMessage({ id: 'expenses.created-successfully', defaultMessage: 'تم إنشاء المصروف بنجاح كمسودة' }));
      }

      if (actionType === 'post' && expenseId) {
        await postExpense(expenseId, newRowVersion);
        notify(intl.formatMessage({ id: 'expenses.posted-successfully', defaultMessage: 'تم ترحيل المصروف بنجاح' }));
      }

      navigate(actionType === 'post' ? `/expenses/${expenseId}` : '/expenses/list');
    } catch (error) {
      notify(error instanceof Error ? error.message : 'Error', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading || isCategoriesLoading || isAccountsLoading || isPartiesLoading) {
    return <Loader />;
  }

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Breadcrumbs
          custom
          card={false}
          title={false}
          divider={false}
          heading={isEdit ? 'expenses.edit-expense' : 'expenses.create-expense'}
          links={[
            { title: 'expenses', to: '/expenses' },
            { title: 'expenses.list', to: '/expenses/list' },
            { title: isEdit ? 'edit' : 'create' }
          ]}
          sx={{ mb: 0 }}
        />
        <PageTitle>
          <FormattedMessage id={isEdit ? 'expenses.edit-expense' : 'expenses.create-expense'} />
        </PageTitle>
      </Box>

      <ExpenseForm
        isEdit={isEdit}
        isLoading={false}
        isSaving={isSaving}
        status={status}
        expenseNumber={expenseNumber}
        form={form}
        setForm={setForm}
        categories={categories}
        accounts={accounts}
        parties={parties}
        onSubmit={handleSubmit}
        backUrl="/expenses/list"
        postPermission={EXPENSES_PERMISSIONS.post}
      />
    </Box>
  );
}
