import { useEffect, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useSWRConfig } from 'swr';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import Divider from '@mui/material/Divider';
import FormControlLabel from '@mui/material/FormControlLabel';
import Grid from '@mui/material/GridLegacy';
import InputAdornment from '@mui/material/InputAdornment';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import { IconDeviceFloppy, IconInfoCircle } from '@tabler/icons-react';

import { useDispatch } from 'store';
import { openSnackbar } from 'store/slices/snackbar';
import MainCard from 'ui-component/cards/MainCard';
import Breadcrumbs from 'ui-component/extended/Breadcrumbs';
import Loader from 'ui-component/Loader';

import { createTreasuryAccount, updateTreasuryAccount } from '../api/treasuryApi';
import { useTreasuryAccount, useTreasuryLookups } from '../hooks/useTreasury';
import type { TreasuryAccountInput } from '../types/treasury.types';
import { TREASURY_ACCOUNT_TYPES } from '../utils/treasury.constants';

export default function TreasuryAccountFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const intl = useIntl();
  const dispatch = useDispatch();
  const { mutate: mutateTreasury } = useSWRConfig();
  const isEdit = Boolean(id);

  const { account, isLoading } = useTreasuryAccount(id);
  const { lookups } = useTreasuryLookups();

  const [form, setForm] = useState<TreasuryAccountInput>({
    code: '',
    nameArabic: '',
    nameEnglish: '',
    accountType: TREASURY_ACCOUNT_TYPES.CASH,
    currencyCode: 'EGP',
    notes: '',
    openingBalanceAmount: 0,
    openingBalanceNature: 'Debit',
    allowNegativeBalance: false
  });
  const [isSaving, setIsSaving] = useState(false);

  const hasNonOpeningMovements = isEdit && account ? account.hasNonOpeningMovements : false;

  useEffect(() => {
    if (!account) {
      return;
    }

    setForm({
      code: account.code,
      nameArabic: account.nameArabic,
      nameEnglish: account.nameEnglish || '',
      accountType: account.accountType,
      currencyCode: account.currencyCode,
      notes: account.notes || '',
      openingBalanceAmount: account.openingBalance,
      openingBalanceNature: account.openingBalanceNature || 'Debit',
      allowNegativeBalance: account.allowNegativeBalance
    });
  }, [account]);

  const notify = (message: string, severity: 'success' | 'error' = 'success') => {
    dispatch(openSnackbar({ open: true, message, variant: 'alert', severity }));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      const request = {
        ...form,
        nameEnglish: form.nameEnglish || null,
        notes: form.notes || null,
        openingBalanceAmount: Number(form.openingBalanceAmount) || 0,
        openingBalanceNature: form.openingBalanceAmount === 0 ? null : form.openingBalanceNature
      };

      if (isEdit && account) {
        await updateTreasuryAccount(account.id, { ...request, rowVersion: account.rowVersion });
        notify('تم تحديث الحساب بنجاح.');
        await mutateTreasury((key) => typeof key === 'string' && key.startsWith('/api/treasury/'));
        navigate(`/treasury/accounts/${account.id}`);
      } else {
        const created = await createTreasuryAccount(request);
        notify('تم إنشاء الحساب بنجاح.');
        await mutateTreasury((key) => typeof key === 'string' && key.startsWith('/api/treasury/'));
        navigate(`/treasury/accounts/${created.id}`);
      }
    } catch (error) {
      notify(error instanceof Error ? error.message : 'فشلت العملية.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  if (isEdit && isLoading) return <Loader />;

  return (
    <Box component="form" onSubmit={submit}>
      <Box sx={{ mb: 3 }}>
        <Breadcrumbs
          custom
          heading={isEdit ? 'edit-account' : 'create-account'}
          links={[
            { title: 'treasury', to: '/treasury' },
            { title: 'treasury-accounts', to: '/treasury/accounts' },
            { title: isEdit ? 'edit-account' : 'create-account' }
          ]}
        />
      </Box>

      <MainCard title={<FormattedMessage id={isEdit ? 'edit-account' : 'create-account'} defaultMessage={isEdit ? 'تعديل حساب' : 'إنشاء حساب'} />}>
        <Box sx={{ pt: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, pb: 1, mb: 2 }}>
            <IconInfoCircle color="var(--mui-palette-primary-main)" size={24} />
            <Typography variant="h4" fontWeight={600}>
              <FormattedMessage id="basic-information" defaultMessage="المعلومات الأساسية" />
            </Typography>
          </Box>
          <Divider sx={{ mb: 3 }} />

          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <TextField
                required
                fullWidth
                label={<FormattedMessage id="code" defaultMessage="الكود" />}
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                required
                fullWidth
                label={<FormattedMessage id="name-arabic" defaultMessage="الاسم بالعربية" />}
                value={form.nameArabic}
                onChange={(e) => setForm({ ...form, nameArabic: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label={<FormattedMessage id="name-english" defaultMessage="الاسم بالإنجليزية" />}
                value={form.nameEnglish}
                onChange={(e) => setForm({ ...form, nameEnglish: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                required
                select
                fullWidth
                label={<FormattedMessage id="account-type" defaultMessage="نوع الحساب" />}
                value={form.accountType}
                onChange={(e) => setForm({ ...form, accountType: e.target.value })}
              >
                {lookups?.accountTypes.map((type) => (
                  <MenuItem key={type.id} value={type.value}>
                    {type.displayName}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={<Checkbox checked={form.allowNegativeBalance} onChange={(e) => setForm({ ...form, allowNegativeBalance: e.target.checked })} />}
                label={<FormattedMessage id="allow-overdraft" defaultMessage="السماح بالسحب على المكشوف" />}
              />
            </Grid>

            <Grid item xs={12}>
              <Typography variant="h5" fontWeight={600} sx={{ mb: 2 }}>
                <FormattedMessage id="opening-balance" defaultMessage="الرصيد الافتتاحي" />
              </Typography>
              {hasNonOpeningMovements && (
                <Alert severity="warning" sx={{ mb: 3 }}>
                  <FormattedMessage
                    id="opening-balance-locked"
                    defaultMessage="لا يمكن تعديل الرصيد الافتتاحي بعد وجود حركات مالية غير افتتاحية على هذا الحساب."
                  />
                </Alert>
              )}
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <TextField
                    required
                    fullWidth
                    type="number"
                    label={<FormattedMessage id="amount" defaultMessage="المبلغ" />}
                    value={form.openingBalanceAmount}
                    onChange={(e) => setForm({ ...form, openingBalanceAmount: Number(e.target.value) })}
                    disabled={hasNonOpeningMovements}
                    inputProps={{ min: 0, step: 0.01 }}
                    InputProps={{ endAdornment: <InputAdornment position="end">{form.currencyCode}</InputAdornment> }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    required
                    select
                    fullWidth
                    label={<FormattedMessage id="balance-nature" defaultMessage="اتجاه الرصيد" />}
                    value={form.openingBalanceNature}
                    onChange={(e) => setForm({ ...form, openingBalanceNature: e.target.value })}
                    disabled={hasNonOpeningMovements || !form.openingBalanceAmount}
                  >
                    <MenuItem value="Debit">
                      <FormattedMessage id="debit" defaultMessage="مدين — رصيد موجب" />
                    </MenuItem>
                    <MenuItem value="Credit">
                      <FormattedMessage id="credit" defaultMessage="دائن — رصيد سالب" />
                    </MenuItem>
                  </TextField>
                </Grid>
              </Grid>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label={<FormattedMessage id="notes" defaultMessage="ملاحظات" />}
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
              />
            </Grid>
          </Grid>
        </Box>
      </MainCard>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3, gap: 2 }}>
        <Button component={Link} to="/treasury/accounts" variant="outlined" color="inherit" disabled={isSaving} sx={{ borderRadius: 2, px: 4 }}>
          <FormattedMessage id="cancel" defaultMessage="إلغاء" />
        </Button>
        <Button type="submit" variant="contained" color="primary" disabled={isSaving} sx={{ borderRadius: 2, px: 4, boxShadow: 2 }} startIcon={<IconDeviceFloppy size={18} />}>
          <FormattedMessage id="save" defaultMessage="حفظ" />
        </Button>
      </Box>
    </Box>
  );
}
