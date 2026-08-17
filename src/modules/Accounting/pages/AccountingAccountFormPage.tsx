import { useEffect, useMemo } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useSWRConfig } from 'swr';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/GridLegacy';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import { IconDeviceFloppy, IconInfoCircle } from '@tabler/icons-react';
import { FormattedMessage } from 'react-intl';

import { useDispatch } from 'store';
import { openSnackbar } from 'store/slices/snackbar';
import Breadcrumbs from 'ui-component/extended/Breadcrumbs';
import Loader from 'ui-component/Loader';
import MainCard from 'ui-component/cards/MainCard';
import PageTitle from 'ui-component/PageTitle';

import { createAccountingAccount, updateAccountingAccount } from '../api/accountingApi';
import { useAccountingAccount, useAccountingAccountParents } from '../hooks/useAccounting';
import { createAccountingAccountSchema, updateAccountingAccountSchema } from '../schemas/accounting.schema';
import type { AccountingAccountFormValues, AccountingAccountInput } from '../types/accounting.types';
import { ACCOUNTING_ACCOUNT_TYPE_ORDER, ACCOUNTING_ACCOUNT_TYPES, CASH_FLOW_ACTIVITY_TYPE_ORDER, CASH_FLOW_ACTIVITY_TYPES } from '../utils/accounting.constants';
import { formatAccountingAccountType, formatCashFlowActivityType } from '../utils/accounting.format';

function toFormValues(account?: ReturnType<typeof useAccountingAccount>['account'], parentId = ''): AccountingAccountFormValues {
  return {
    code: account?.code ?? '',
    nameArabic: account?.nameArabic ?? '',
    nameEnglish: account?.nameEnglish ?? '',
    accountType: account?.accountType ?? ACCOUNTING_ACCOUNT_TYPES.ASSET,
    parentId: account?.parentId ?? parentId,
    isPosting: account?.isPosting ?? false,
    isActive: account?.isActive ?? true,
    isSystem: account?.isSystem ?? false,
    cashFlowActivityType: account?.cashFlowActivityType ?? CASH_FLOW_ACTIVITY_TYPES.UNCLASSIFIED,
    description: account?.description ?? '',
    rowVersion: account?.rowVersion ?? ''
  };
}

function toRequest(values: AccountingAccountFormValues): AccountingAccountInput {
  return {
    code: values.code,
    nameArabic: values.nameArabic,
    nameEnglish: values.nameEnglish || null,
    accountType: values.accountType,
    parentId: values.parentId || null,
    isPosting: values.isPosting,
    isActive: values.isActive,
    isSystem: values.isSystem,
    cashFlowActivityType: values.cashFlowActivityType,
    description: values.description || null
  };
}

export default function AccountingAccountFormPage() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const parentIdFromQuery = searchParams.get('parentId') ?? '';
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { mutate: mutateGlobal } = useSWRConfig();
  const isEdit = Boolean(id);

  const { account, isLoading } = useAccountingAccount(id);
  const form = useForm<AccountingAccountFormValues>({
    resolver: zodResolver(isEdit ? updateAccountingAccountSchema : createAccountingAccountSchema),
    defaultValues: toFormValues(undefined, parentIdFromQuery)
  });

  const selectedParentId = form.watch('parentId');
  const accountType = form.watch('accountType');
  const isPosting = form.watch('isPosting');
  const cashFlowActivityType = form.watch('cashFlowActivityType');
  const parentLookup = useAccountingAccountParents({
    page: 1,
    pageSize: 50,
    accountType: accountType,
    excludeId: id
  });

  const selectedParent = parentLookup.items.find((option) => option.id === selectedParentId);
  const isParentLocked = Boolean(selectedParent);
  const selectedParentTypeLabel = selectedParent?.accountTypeLabel ?? '';

  useEffect(() => {
    if (!account) {
      return;
    }

    form.reset(toFormValues(account));
  }, [account, form]);

  useEffect(() => {
    if (!selectedParent) {
      return;
    }

    form.setValue('accountType', selectedParent.accountType, { shouldDirty: true, shouldValidate: true });
  }, [form, selectedParent]);

  const schemaTitle = useMemo(() => (isEdit ? 'edit-account' : parentIdFromQuery ? 'add-child-account' : 'create-account'), [isEdit, parentIdFromQuery]);

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
        navigate(`/accounting/chart-of-accounts/${account.id}`);
      } else {
        const created = await createAccountingAccount(request);
        notify('تم إنشاء الحساب بنجاح.');
        await mutateGlobal((key) => typeof key === 'string' && key.startsWith('/api/accounting/'));
        navigate(`/accounting/chart-of-accounts/${created.id}`);
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
          { title: 'general-ledger', to: '/accounting' },
          { title: 'chart-of-accounts', to: '/accounting/chart-of-accounts' },
          { title: schemaTitle }
        ]}
      />

      <Stack spacing={3}>
        {Object.keys(form.formState.errors).length > 0 && (
          <Alert severity="error">
            <FormattedMessage id="form-validation-error" defaultMessage="Please fix the validation errors before saving." />
          </Alert>
        )}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 2, flexWrap: 'wrap' }}>
          <PageTitle>
            <FormattedMessage id={schemaTitle} defaultMessage={isEdit ? 'تعديل حساب' : 'إضافة حساب'} />
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

            {isParentLocked && (
              <Alert severity="info">
                <FormattedMessage
                  id="parent-selection-help"
                  defaultMessage="اختيار الحساب الأب يقيّد نوع الحساب تلقائيًا على نفس النوع: {type}."
                  values={{ type: selectedParentTypeLabel }}
                />
              </Alert>
            )}

            {isEdit && account?.treasuryAccountId && (
              <Alert severity="info">
                <FormattedMessage
                  id="cash-flow-treasury-linked-help"
                  defaultMessage="This account is linked to Treasury and is treated as a cash account in the Cash Flow Statement."
                />
              </Alert>
            )}

            {isPosting && cashFlowActivityType === CASH_FLOW_ACTIVITY_TYPES.UNCLASSIFIED && !account?.treasuryAccountId && (
              <Alert severity="warning">
                <FormattedMessage
                  id="cash-flow-unclassified-account-warning"
                  defaultMessage="This posting account is unclassified and will appear under unclassified cash-flow activity when used as a cash counterpart."
                />
              </Alert>
            )}

            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <Controller
                  name="code"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <TextField {...field} fullWidth label={<FormattedMessage id="account-code" defaultMessage="كود الحساب" />} error={!!fieldState.error} helperText={fieldState.error?.message} required />
                  )}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <Controller
                  name="nameArabic"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <TextField {...field} fullWidth label={<FormattedMessage id="name-arabic" />} error={!!fieldState.error} helperText={fieldState.error?.message} required />
                  )}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <Controller
                  name="nameEnglish"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <TextField {...field} value={field.value ?? ''} fullWidth label={<FormattedMessage id="name-english" />} error={!!fieldState.error} helperText={fieldState.error?.message} />
                  )}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <Controller
                  name="parentId"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <TextField
                      {...field}
                      value={field.value ?? ''}
                      select
                      fullWidth
                      label={<FormattedMessage id="parent-account" defaultMessage="الحساب الأب" />}
                      error={!!fieldState.error}
                      helperText={fieldState.error?.message}
                    >
                      <MenuItem value="">
                        <FormattedMessage id="root-account" defaultMessage="حساب رئيسي" />
                      </MenuItem>
                      {parentLookup.items.map((parent) => (
                        <MenuItem key={parent.id} value={parent.id}>
                          {parent.code} - {parent.nameArabic}
                        </MenuItem>
                      ))}
                    </TextField>
                  )}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <Controller
                  name="accountType"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <TextField
                      {...field}
                      select
                      fullWidth
                      label={<FormattedMessage id="account-type" defaultMessage="نوع الحساب" />}
                      error={!!fieldState.error}
                      helperText={fieldState.error?.message}
                      InputProps={{ readOnly: isParentLocked }}
                      sx={isParentLocked ? { opacity: 0.7, pointerEvents: 'none' } : {}}
                    >
                      {ACCOUNTING_ACCOUNT_TYPE_ORDER.map((type) => (
                        <MenuItem key={type} value={type}>
                          {formatAccountingAccountType(type)}
                        </MenuItem>
                      ))}
                    </TextField>
                  )}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <Controller
                  name="isPosting"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <TextField
                      value={field.value ? 'true' : 'false'}
                      onChange={(event) => field.onChange(event.target.value === 'true')}
                      select
                      fullWidth
                      label={<FormattedMessage id="accounting-nature" defaultMessage="طبيعة الحساب" />}
                      error={!!fieldState.error}
                      helperText={fieldState.error?.message}
                    >
                      <MenuItem value="false">
                        <FormattedMessage id="header-account" defaultMessage="حساب رئيسي" />
                      </MenuItem>
                      <MenuItem value="true">
                        <FormattedMessage id="posting-account" defaultMessage="حساب ترحيل" />
                      </MenuItem>
                    </TextField>
                  )}
                />
              </Grid>
              <Grid item xs={12} md={4}>
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
              <Grid item xs={12} md={4}>
                <Controller
                  name="cashFlowActivityType"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <TextField
                      {...field}
                      select
                      fullWidth
                      label={<FormattedMessage id="cash-flow-classification" defaultMessage="Cash flow classification" />}
                      helperText={fieldState.error?.message || <FormattedMessage id="cash-flow-classification-helper" defaultMessage="Defines the cash-flow section when this account is used as the counterpart to a treasury or bank account." />}
                      error={!!fieldState.error}
                    >
                      {CASH_FLOW_ACTIVITY_TYPE_ORDER.map((type) => (
                        <MenuItem key={type} value={type}>
                          {formatCashFlowActivityType(type)}
                        </MenuItem>
                      ))}
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
          <Button component={Link} to="/accounting/chart-of-accounts" variant="outlined" color="inherit">
            <FormattedMessage id="cancel" />
          </Button>
          <Button type="submit" variant="contained" disabled={form.formState.isSubmitting} startIcon={<IconDeviceFloppy size={18} />}>
            <FormattedMessage id="save" />
          </Button>
        </Box>
      </Stack>
    </Box>
  );
}
