import { useEffect, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { useNavigate, useParams, Link } from 'react-router-dom';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Grid from '@mui/material/GridLegacy';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import InputAdornment from '@mui/material/InputAdornment';
import Alert from '@mui/material/Alert';

import { IconDeviceFloppy, IconInfoCircle } from '@tabler/icons-react';

import { useDispatch } from 'store';
import { openSnackbar } from 'store/slices/snackbar';
import MainCard from 'ui-component/cards/MainCard';
import Breadcrumbs from 'ui-component/extended/Breadcrumbs';
import PageTitle from 'ui-component/PageTitle';
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
    openingBalanceNature: 'Debit'
  });
  const [isSaving, setIsSaving] = useState(false);

  // If movements exist, opening balance cannot be changed
  const hasMovements = isEdit && account ? (account.debitTotal > 0 || account.creditTotal > 0) : false;

  useEffect(() => {
    if (account) {
      setForm({
        code: account.code,
        nameArabic: account.nameArabic,
        nameEnglish: account.nameEnglish || '',
        accountType: account.accountType,
        currencyCode: account.currencyCode,
        notes: account.notes || '',
        openingBalanceAmount: account.openingBalance,
        openingBalanceNature: account.openingBalanceNature || 'Debit'
      });
    }
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
        notify(intl.formatMessage({ id: 'account-updated', defaultMessage: 'تم تحديث الحساب بنجاح' }));
        navigate(`/treasury/accounts/${account.id}`);
      } else {
        const created = await createTreasuryAccount(request);
        notify(intl.formatMessage({ id: 'account-created', defaultMessage: 'تم إنشاء الحساب بنجاح' }));
        navigate(`/treasury/accounts/${created.id}`);
      }
    } catch (error) {
      notify(error instanceof Error ? error.message : intl.formatMessage({ id: 'action-failed', defaultMessage: 'فشلت العملية' }), 'error');
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
          card={false} 
          title={false} 
          divider={false} 
          heading={isEdit ? 'edit-account' : 'create-account'} 
          links={[{ title: 'treasury', to: '/treasury' }, { title: 'treasury-accounts', to: '/treasury/accounts' }]} 
          sx={{ mb: 0 }} 
        />
        <Box sx={{ mt: 1 }}>
          <PageTitle><FormattedMessage id={isEdit ? 'edit-account' : 'create-account'} defaultMessage={isEdit ? 'تعديل حساب' : 'إنشاء حساب'} /></PageTitle>
        </Box>
      </Box>

      <MainCard 
        content={false} 
        sx={{ border: '1px solid', borderColor: 'divider', boxShadow: 'none', borderRadius: 2 }}
      >
        <Box sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, pb: 2, mb: 3, borderBottom: '1px solid', borderColor: 'divider' }}>
            <IconInfoCircle color="var(--mui-palette-primary-main)" size={24} />
            <Typography variant="h4" fontWeight={600}><FormattedMessage id="basic-information" defaultMessage="البيانات الأساسية" /></Typography>
          </Box>
          
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
                label={<FormattedMessage id="name-arabic" defaultMessage="الاسم (عربي)" />}
                value={form.nameArabic}
                onChange={(e) => setForm({ ...form, nameArabic: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label={<FormattedMessage id="name-english" defaultMessage="الاسم (إنجليزي)" />}
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
                  <MenuItem key={type.value} value={type.value}>{type.labelArabic}</MenuItem>
                ))}
              </TextField>
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="h5" fontWeight={600} sx={{ mb: 2 }}><FormattedMessage id="opening-balance" defaultMessage="الرصيد الافتتاحي" /></Typography>
              {hasMovements && (
                <Alert severity="warning" sx={{ mb: 3 }}>
                  <FormattedMessage id="opening-balance-locked" defaultMessage="لا يمكن تعديل الرصيد الافتتاحي بعد وجود حركات مرحّلة على هذا الحساب." />
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
                    disabled={hasMovements}
                    inputProps={{ min: 0, step: 0.01 }}
                    InputProps={{
                      endAdornment: <InputAdornment position="end">{form.currencyCode}</InputAdornment>
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    required
                    select
                    fullWidth
                    label={<FormattedMessage id="balance-nature" defaultMessage="طبيعة الرصيد" />}
                    value={form.openingBalanceNature}
                    onChange={(e) => setForm({ ...form, openingBalanceNature: e.target.value })}
                    disabled={hasMovements || !form.openingBalanceAmount}
                  >
                    <MenuItem value="Debit"><FormattedMessage id="debit" defaultMessage="مدين (رصيد متاح)" /></MenuItem>
                    <MenuItem value="Credit"><FormattedMessage id="credit" defaultMessage="دائن (سحب على المكشوف / التزام)" /></MenuItem>
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
