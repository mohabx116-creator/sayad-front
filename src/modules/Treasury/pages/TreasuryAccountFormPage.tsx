import { useEffect, useMemo, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useSWRConfig } from 'swr';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Autocomplete from '@mui/material/Autocomplete';
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
import { useTreasuryAccount, useTreasuryAccountingAccountLookups, useTreasuryLookups } from '../hooks/useTreasury';
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
  const [mappingSearch, setMappingSearch] = useState('');
  const { items: accountingLookups, isLoading: isAccountingLookupLoading } = useTreasuryAccountingAccountLookups(isEdit ? id : undefined, mappingSearch);

  const [form, setForm] = useState<TreasuryAccountInput>({
    code: '',
    nameArabic: '',
    nameEnglish: '',
    accountType: TREASURY_ACCOUNT_TYPES.CASH,
    currencyCode: 'EGP',
    notes: '',
    openingBalanceAmount: 0,
    openingBalanceNature: 'Debit',
    allowNegativeBalance: false,
    accountingAccountId: null
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
      allowNegativeBalance: account.allowNegativeBalance,
      accountingAccountId: account.accountingAccountId
    });
  }, [account]);

  const selectedAccountingAccount = useMemo(() => {
    if (!form.accountingAccountId) {
      return null;
    }

    const mapped = accountingLookups.find((item) => item.id === form.accountingAccountId);
    if (mapped) {
      return mapped;
    }

    if (isEdit && account && account.accountingAccountId === form.accountingAccountId && account.accountingAccountCode && account.accountingAccountArabicName) {
      return {
        id: account.accountingAccountId,
        code: account.accountingAccountCode,
        displayName: `${account.accountingAccountCode} - ${account.accountingAccountArabicName}`
      };
    }

    return null;
  }, [account, accountingLookups, form.accountingAccountId, isEdit]);

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
        openingBalanceNature: form.openingBalanceAmount === 0 ? null : form.openingBalanceNature,
        accountingAccountId: form.accountingAccountId
      };

      if (isEdit && account) {
        await updateTreasuryAccount(account.id, { ...request, rowVersion: account.rowVersion });
        notify('طھظ… طھط­ط¯ظٹط« ط§ظ„ط­ط³ط§ط¨ ط¨ظ†ط¬ط§ط­.');
        await mutateTreasury((key) => typeof key === 'string' && key.startsWith('/api/treasury/'));
        navigate(`/treasury/accounts/${account.id}`);
      } else {
        const created = await createTreasuryAccount(request);
        notify('طھظ… ط¥ظ†ط´ط§ط، ط§ظ„ط­ط³ط§ط¨ ط¨ظ†ط¬ط§ط­.');
        await mutateTreasury((key) => typeof key === 'string' && key.startsWith('/api/treasury/'));
        navigate(`/treasury/accounts/${created.id}`);
      }
    } catch (error) {
      notify(error instanceof Error ? error.message : 'ظپط´ظ„طھ ط§ظ„ط¹ظ…ظ„ظٹط©.', 'error');
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

      <MainCard title={<FormattedMessage id={isEdit ? 'edit-account' : 'create-account'} defaultMessage={isEdit ? 'طھط¹ط¯ظٹظ„ ط­ط³ط§ط¨' : 'ط¥ظ†ط´ط§ط، ط­ط³ط§ط¨'} />}>
        <Box sx={{ pt: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, pb: 1, mb: 2 }}>
            <IconInfoCircle color="var(--mui-palette-primary-main)" size={24} />
            <Typography variant="h4" fontWeight={600}>
              <FormattedMessage id="basic-information" defaultMessage="ط§ظ„ظ…ط¹ظ„ظˆظ…ط§طھ ط§ظ„ط£ط³ط§ط³ظٹط©" />
            </Typography>
          </Box>
          <Divider sx={{ mb: 3 }} />

          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <TextField
                required
                fullWidth
                label={<FormattedMessage id="code" defaultMessage="ط§ظ„ظƒظˆط¯" />}
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                required
                fullWidth
                label={<FormattedMessage id="name-arabic" defaultMessage="ط§ظ„ط§ط³ظ… ط¨ط§ظ„ط¹ط±ط¨ظٹط©" />}
                value={form.nameArabic}
                onChange={(e) => setForm({ ...form, nameArabic: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label={<FormattedMessage id="name-english" defaultMessage="ط§ظ„ط§ط³ظ… ط¨ط§ظ„ط¥ظ†ط¬ظ„ظٹط²ظٹط©" />}
                value={form.nameEnglish}
                onChange={(e) => setForm({ ...form, nameEnglish: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                required
                select
                fullWidth
                label={<FormattedMessage id="account-type" defaultMessage="ظ†ظˆط¹ ط§ظ„ط­ط³ط§ط¨" />}
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
              <Autocomplete
                fullWidth
                options={accountingLookups}
                loading={isAccountingLookupLoading}
                value={selectedAccountingAccount}
                onChange={(_, value) => setForm({ ...form, accountingAccountId: value?.id ?? null })}
                onInputChange={(_, nextValue) => setMappingSearch(nextValue)}
                isOptionEqualToValue={(option, value) => option.id === value.id}
                getOptionLabel={(option) => option.displayName}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label={<FormattedMessage id="mapping" defaultMessage="الربط المحاسبي" />}
                    placeholder={intl.formatMessage({ id: 'select-account', defaultMessage: 'اختر حسابًا' })}
                    helperText={form.accountingAccountId ? undefined : intl.formatMessage({ id: 'not-configured', defaultMessage: 'غير مضبوط' })}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={<Checkbox checked={form.allowNegativeBalance} onChange={(e) => setForm({ ...form, allowNegativeBalance: e.target.checked })} />}
                label={<FormattedMessage id="allow-overdraft" defaultMessage="ط§ظ„ط³ظ…ط§ط­ ط¨ط§ظ„ط³ط­ط¨ ط¹ظ„ظ‰ ط§ظ„ظ…ظƒط´ظˆظپ" />}
              />
            </Grid>

            <Grid item xs={12}>
              <Typography variant="h5" fontWeight={600} sx={{ mb: 2 }}>
                <FormattedMessage id="opening-balance" defaultMessage="ط§ظ„ط±طµظٹط¯ ط§ظ„ط§ظپطھطھط§ط­ظٹ" />
              </Typography>
              {hasNonOpeningMovements && (
                <Alert severity="warning" sx={{ mb: 3 }}>
                  <FormattedMessage
                    id="opening-balance-locked"
                    defaultMessage="ظ„ط§ ظٹظ…ظƒظ† طھط¹ط¯ظٹظ„ ط§ظ„ط±طµظٹط¯ ط§ظ„ط§ظپطھطھط§ط­ظٹ ط¨ط¹ط¯ ظˆط¬ظˆط¯ ط­ط±ظƒط§طھ ظ…ط§ظ„ظٹط© ط؛ظٹط± ط§ظپطھطھط§ط­ظٹط© ط¹ظ„ظ‰ ظ‡ط°ط§ ط§ظ„ط­ط³ط§ط¨."
                  />
                </Alert>
              )}
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <TextField
                    required
                    fullWidth
                    type="number"
                    label={<FormattedMessage id="amount" defaultMessage="ط§ظ„ظ…ط¨ظ„ط؛" />}
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
                    label={<FormattedMessage id="balance-nature" defaultMessage="ط§طھط¬ط§ظ‡ ط§ظ„ط±طµظٹط¯" />}
                    value={form.openingBalanceNature}
                    onChange={(e) => setForm({ ...form, openingBalanceNature: e.target.value })}
                    disabled={hasNonOpeningMovements || !form.openingBalanceAmount}
                  >
                    <MenuItem value="Debit">
                      <FormattedMessage id="debit" defaultMessage="ظ…ط¯ظٹظ† â€” ط±طµظٹط¯ ظ…ظˆط¬ط¨" />
                    </MenuItem>
                    <MenuItem value="Credit">
                      <FormattedMessage id="credit" defaultMessage="ط¯ط§ط¦ظ† â€” ط±طµظٹط¯ ط³ط§ظ„ط¨" />
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
                label={<FormattedMessage id="notes" defaultMessage="ظ…ظ„ط§ط­ط¸ط§طھ" />}
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
              />
            </Grid>
          </Grid>
        </Box>
      </MainCard>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3, gap: 2 }}>
        <Button component={Link} to="/treasury/accounts" variant="outlined" color="inherit" disabled={isSaving} sx={{ borderRadius: 2, px: 4 }}>
          <FormattedMessage id="cancel" defaultMessage="ط¥ظ„ط؛ط§ط،" />
        </Button>
        <Button type="submit" variant="contained" color="primary" disabled={isSaving} sx={{ borderRadius: 2, px: 4, boxShadow: 2 }} startIcon={<IconDeviceFloppy size={18} />}>
          <FormattedMessage id="save" defaultMessage="ط­ظپط¸" />
        </Button>
      </Box>
    </Box>
  );
}
