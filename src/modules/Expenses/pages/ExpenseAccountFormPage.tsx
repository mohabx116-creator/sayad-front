import { useEffect, useMemo } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useSWRConfig } from 'swr';
import { FormattedMessage } from 'react-intl';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/GridLegacy';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import { IconDeviceFloppy, IconInfoCircle } from '@tabler/icons-react';

import { useDispatch } from 'store';
import { openSnackbar } from 'store/slices/snackbar';
import Breadcrumbs from 'ui-component/extended/Breadcrumbs';
import Loader from 'ui-component/Loader';
import MainCard from 'ui-component/cards/MainCard';
import PageTitle from 'ui-component/PageTitle';

import { createAccountingAccount, updateAccountingAccount } from 'modules/Accounting/api/accountingApi';
import { useAccountingAccount } from 'modules/Accounting/hooks/useAccounting';
import { createAccountingAccountSchema, updateAccountingAccountSchema } from 'modules/Accounting/schemas/accounting.schema';
import type { AccountingAccountFormValues, AccountingAccountInput } from 'modules/Accounting/types/accounting.types';
import { ACCOUNTING_ACCOUNT_TYPES, CASH_FLOW_ACTIVITY_TYPES } from 'modules/Accounting/utils/accounting.constants';

function toFormValues(account?: ReturnType<typeof useAccountingAccount>['account']): AccountingAccountFormValues {
  return {
    code: account?.code ?? '',
    nameArabic: account?.nameArabic ?? '',
    nameEnglish: account?.nameEnglish ?? '',
    accountType: ACCOUNTING_ACCOUNT_TYPES.EXPENSE,
    parentId: '', // Root expense account
    isPosting: true,
    isActive: account?.isActive ?? true,
    isSystem: false,
    cashFlowActivityType: null as any,
    description: account?.description ?? '',
    rowVersion: account?.rowVersion
  };
}

function toRequest(values: AccountingAccountFormValues): AccountingAccountInput {
  return {
    code: values.code,
    nameArabic: values.nameArabic,
    nameEnglish: values.nameEnglish || null,
    accountType: ACCOUNTING_ACCOUNT_TYPES.EXPENSE,
    parentId: null,
    isPosting: true,
    isActive: values.isActive,
    isSystem: false,
    cashFlowActivityType: null as any,
    description: values.description || null
  };
}

export default function ExpenseAccountFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { mutate: mutateGlobal } = useSWRConfig();
  const isEdit = Boolean(id);

  const { account, isLoading } = useAccountingAccount(id);
  const form = useForm<AccountingAccountFormValues>({
    resolver: zodResolver(isEdit ? updateAccountingAccountSchema : createAccountingAccountSchema),
    defaultValues: toFormValues()
  });

  useEffect(() => {
    if (!account) return;
    form.reset(toFormValues(account));
  }, [account, form]);

  const schemaTitle = useMemo(() => (isEdit ? 'expenses.edit-expense-account' : 'expenses.add-expense-account'), [isEdit]);

  const notify = (message: string, severity: 'success' | 'error' = 'success') => {
    dispatch(openSnackbar({ open: true, message, variant: 'alert', severity }));
  };

  const submit = async (values: AccountingAccountFormValues) => {
    const request = toRequest(values);
    try {
      if (isEdit && account) {
        await updateAccountingAccount(account.id, { ...request, rowVersion: account.rowVersion });
        notify('تم تحديث الحساب بنجاح.');
        await mutateGlobal((key) => typeof key === 'string' && key.startsWith('/api/accounting/'));
        navigate('/expenses/accounts');
      } else {
        await createAccountingAccount(request);
        notify('تم إنشاء الحساب بنجاح.');
        await mutateGlobal((key) => typeof key === 'string' && key.startsWith('/api/accounting/'));
        navigate('/expenses/accounts');
      }
    } catch (error) {
      notify(error instanceof Error ? error.message : 'فشلت العملية.', 'error');
    }
  };

  if (isEdit && isLoading) {
    return <Loader />;
  }

  return (
    <Box component="form" onSubmit={form.handleSubmit(submit)}>
      <Breadcrumbs
        custom
        heading={schemaTitle}
        links={[
          { title: 'expenses', to: '/expenses/list' },
          { title: 'expenses.expense-accounts', to: '/expenses/accounts' },
          { title: schemaTitle }
        ]}
      />

      <Stack spacing={3}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 2, flexWrap: 'wrap' }}>
          <PageTitle>
            <FormattedMessage id={schemaTitle} defaultMessage={isEdit ? 'تعديل حساب' : 'إضافة حساب مصروف'} />
          </PageTitle>
        </Box>

        <MainCard>
          <Stack spacing={2}>
            <Stack direction="row" spacing={1} alignItems="center">
              <IconInfoCircle color="var(--mui-palette-primary-main)" size={24} />
              <Typography variant="h5" fontWeight={700}>
                <FormattedMessage id="basic-information" />
              </Typography>
            </Stack>
            <Divider />

            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Controller
                  name="code"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <TextField {...field} fullWidth label={<FormattedMessage id="account-code" defaultMessage="كود الحساب" />} error={!!fieldState.error} helperText={fieldState.error?.message} required />
                  )}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Controller
                  name="nameArabic"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <TextField {...field} fullWidth label={<FormattedMessage id="name-arabic" />} error={!!fieldState.error} helperText={fieldState.error?.message} required />
                  )}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Controller
                  name="nameEnglish"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <TextField {...field} value={field.value ?? ''} fullWidth label={<FormattedMessage id="name-english" />} error={!!fieldState.error} helperText={fieldState.error?.message} />
                  )}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Controller
                  name="isActive"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <TextField
                      value={field.value ? 'true' : 'false'}
                      onChange={(event) => field.onChange(event.target.value === 'true')}
                      select
                      fullWidth
                      label={<FormattedMessage id="status" />}
                      error={!!fieldState.error}
                      helperText={fieldState.error?.message}
                    >
                      <MenuItem value="true">
                        <FormattedMessage id="active" />
                      </MenuItem>
                      <MenuItem value="false">
                        <FormattedMessage id="inactive" />
                      </MenuItem>
                    </TextField>
                  )}
                />
              </Grid>
              <Grid item xs={12}>
                <Controller
                  name="description"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <TextField {...field} value={field.value ?? ''} fullWidth multiline minRows={3} label={<FormattedMessage id="description" />} error={!!fieldState.error} helperText={fieldState.error?.message} />
                  )}
                />
              </Grid>
            </Grid>
          </Stack>
        </MainCard>

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
          <Button component={Link} to="/expenses/accounts" variant="outlined" color="inherit">
            <FormattedMessage id="cancel" />
          </Button>
          <Button type="submit" variant="contained" startIcon={<IconDeviceFloppy size={18} />}>
            <FormattedMessage id="save" />
          </Button>
        </Box>
      </Stack>
    </Box>
  );
}
