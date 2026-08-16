import { useEffect, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useSWRConfig } from 'swr';

import axios from 'axios';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import Grid from '@mui/material/GridLegacy';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';

import { IconDeviceFloppy } from '@tabler/icons-react';

import { useDispatch } from 'store';
import { openSnackbar } from 'store/slices/snackbar';
import MainCard from 'ui-component/cards/MainCard';
import Breadcrumbs from 'ui-component/extended/Breadcrumbs';
import Loader from 'ui-component/Loader';

import { activateTreasuryAccount, createTreasuryAccount, deactivateTreasuryAccount, updateTreasuryAccount } from '../api/treasuryApi';
import { useTreasuryAccount } from '../hooks/useTreasury';
import { TREASURY_ACCOUNT_TYPES } from '../utils/treasury.constants';
import { getTreasuryAccountTypeLabel } from '../utils/treasury.labels';
import type { TreasuryAccountInput } from '../types/treasury.types';
import type { ApiResponse } from 'types/api';

type TreasuryAccountFormState = TreasuryAccountInput & {
  isActive: boolean;
};

type TreasuryFormFieldErrorState = Partial<Record<'code' | 'nameArabic' | 'openingBalanceAmount' | 'notes', string>>;

const OPENING_BALANCE_LOCK_MESSAGE = 'لا يمكن تعديل الرصيد الافتتاحي بعد وجود حركات مالية على الحساب.';
const OPENING_BALANCE_FIELD_ERROR_HINTS = [
  OPENING_BALANCE_LOCK_MESSAGE,
  'Opening balance nature must be Debit or Credit.',
  'Opening balance',
  'الرصيد الافتتاحي',
  'Treasury account is not linked to an accounting account.'
];
const NAME_FIELD_ERROR_HINTS = ['Treasury account name already exists.', 'NameArabic', 'Name Arabic', 'الاسم'];
const CODE_FIELD_ERROR_HINTS = ['Treasury account code already exists.', 'Code'];
const NOTES_FIELD_ERROR_HINTS = ['Notes', 'ملاحظات'];

function getTreasuryFormFieldErrors(error: unknown): TreasuryFormFieldErrorState {
  const apiError = axios.isAxiosError(error) ? (error.response?.data as ApiResponse<unknown> | undefined) : undefined;
  const messages = apiError?.errors ?? [];
  const fieldErrors: TreasuryFormFieldErrorState = {};

  for (const message of messages) {
    if (OPENING_BALANCE_FIELD_ERROR_HINTS.some((hint) => message.includes(hint))) {
      fieldErrors.openingBalanceAmount = message;
      continue;
    }

    if (NAME_FIELD_ERROR_HINTS.some((hint) => message.includes(hint))) {
      fieldErrors.nameArabic = message;
      continue;
    }

    if (CODE_FIELD_ERROR_HINTS.some((hint) => message.includes(hint))) {
      fieldErrors.code = message;
      continue;
    }

    if (NOTES_FIELD_ERROR_HINTS.some((hint) => message.includes(hint))) {
      fieldErrors.notes = message;
    }
  }

  return fieldErrors;
}

const TREASURY_ACCOUNT_TYPE_OPTIONS = [
  TREASURY_ACCOUNT_TYPES.CASH,
  TREASURY_ACCOUNT_TYPES.BANK,
  TREASURY_ACCOUNT_TYPES.PETTY_CASH,
  TREASURY_ACCOUNT_TYPES.DIGITAL_WALLET,
  TREASURY_ACCOUNT_TYPES.OTHER
] as const;

function buildRequest(form: TreasuryAccountFormState): TreasuryAccountInput {
  const openingBalanceAmount = Number(form.openingBalanceAmount) || 0;

  return {
    code: form.code.trim(),
    nameArabic: form.nameArabic.trim(),
    nameEnglish: null,
    accountType: form.accountType,
    currencyCode: 'EGP',
    notes: form.notes?.trim() ? form.notes.trim() : null,
    openingBalanceAmount,
    openingBalanceNature: openingBalanceAmount > 0 ? 'Debit' : null,
    allowNegativeBalance: false,
    accountingAccountId: form.accountingAccountId
  };
}

export default function TreasuryAccountFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const intl = useIntl();
  const dispatch = useDispatch();
  const { mutate: mutateTreasury } = useSWRConfig();
  const isEdit = Boolean(id);

  const { account, isLoading } = useTreasuryAccount(id);
  const [form, setForm] = useState<TreasuryAccountFormState>({
    code: '',
    nameArabic: '',
    nameEnglish: null,
    accountType: 'Cash',
    currencyCode: 'EGP',
    notes: null,
    openingBalanceAmount: 0,
    openingBalanceNature: null,
    allowNegativeBalance: false,
    accountingAccountId: null,
    isActive: true
  });
  const [isSaving, setIsSaving] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<TreasuryFormFieldErrorState>({});

  useEffect(() => {
    if (!account) {
      return;
    }

    setForm({
      code: account.code,
      nameArabic: account.nameArabic,
      nameEnglish: account.nameEnglish,
      accountType: account.accountType || 'Cash',
      currencyCode: 'EGP',
      notes: account.notes,
      openingBalanceAmount: account.openingBalance,
      openingBalanceNature: account.openingBalanceNature,
      allowNegativeBalance: false,
      accountingAccountId: account.accountingAccountId,
      isActive: account.isActive
    });
    setFieldErrors({});
  }, [account]);

  const notify = (message: string, severity: 'success' | 'error' = 'success') => {
    dispatch(openSnackbar({ open: true, message, variant: 'alert', severity }));
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();

    try {
      setIsSaving(true);
      setFieldErrors({});
      const request = buildRequest(form);

      if (isEdit && account) {
        const updated = await updateTreasuryAccount(account.id, { ...request, rowVersion: account.rowVersion });
        if (updated.isActive !== form.isActive) {
          if (form.isActive) {
            await activateTreasuryAccount(updated.id, updated.rowVersion);
          } else {
            await deactivateTreasuryAccount(updated.id, updated.rowVersion);
          }
        }

        notify(intl.formatMessage({ id: 'treasury-account-updated', defaultMessage: 'Treasury account updated successfully.' }));
        await mutateTreasury((key) => typeof key === 'string' && key.startsWith('/api/treasury/'));
        navigate(`/treasury/accounts/${account.id}`);
        return;
      }

      const created = await createTreasuryAccount(request);
      if (!form.isActive) {
        await deactivateTreasuryAccount(created.id, created.rowVersion);
      }

      notify(intl.formatMessage({ id: 'treasury-account-created', defaultMessage: 'Treasury account created successfully.' }));
      await mutateTreasury((key) => typeof key === 'string' && key.startsWith('/api/treasury/'));
      navigate(`/treasury/accounts/${created.id}`);
    } catch (error) {
      const mappedFieldErrors = getTreasuryFormFieldErrors(error);
      if (Object.keys(mappedFieldErrors).length > 0) {
        setFieldErrors(mappedFieldErrors);
      }

      notify(error instanceof Error ? error.message : intl.formatMessage({ id: 'action-failed', defaultMessage: 'The operation failed.' }), 'error');
    } finally {
      setIsSaving(false);
    }
  };

  if (isEdit && isLoading) {
    return <Loader />;
  }

  const openingBalanceLocked = isEdit && Boolean(account?.hasNonOpeningMovements);
  const openingBalanceHelperText = fieldErrors.openingBalanceAmount ?? (openingBalanceLocked ? OPENING_BALANCE_LOCK_MESSAGE : ' ');

  return (
    <Box component="form" onSubmit={submit}>
      <Box sx={{ mb: 3 }}>
        <Breadcrumbs
          custom
          heading={isEdit ? 'edit-treasury-account' : 'add-treasury-account'}
          links={[{ title: 'treasury-accounts', to: '/treasury/accounts' }, { title: isEdit ? 'edit-treasury-account' : 'add-treasury-account' }]}
        />
      </Box>

      <MainCard title={<FormattedMessage id={isEdit ? 'edit-treasury-account' : 'add-treasury-account'} defaultMessage={isEdit ? 'Edit Treasury Account' : 'Add Treasury Account'} />}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <TextField
              required
              select
              fullWidth
              label={<FormattedMessage id="account-type" defaultMessage="Account Type" />}
              value={form.accountType}
              onChange={(event) => setForm({ ...form, accountType: event.target.value })}
            >
              {TREASURY_ACCOUNT_TYPE_OPTIONS.map((accountType) => (
                <MenuItem key={accountType} value={accountType}>
                  {getTreasuryAccountTypeLabel(accountType)}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              required
              fullWidth
              label={<FormattedMessage id="account-name" defaultMessage="Account Name" />}
              value={form.nameArabic}
              onChange={(event) => setForm({ ...form, nameArabic: event.target.value })}
              error={Boolean(fieldErrors.nameArabic)}
              helperText={fieldErrors.nameArabic ?? ' '}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              required
              fullWidth
              type="number"
              label={<FormattedMessage id="opening-balance" defaultMessage="Opening Balance" />}
              value={form.openingBalanceAmount}
              onChange={(event) => setForm({ ...form, openingBalanceAmount: Number(event.target.value) })}
              inputProps={{ min: 0, step: 0.01 }}
              disabled={openingBalanceLocked}
              error={Boolean(fieldErrors.openingBalanceAmount)}
              helperText={openingBalanceHelperText}
            />
          </Grid>
          <Grid item xs={12}>
            {openingBalanceLocked && !fieldErrors.openingBalanceAmount && (
              <Alert severity="warning">{OPENING_BALANCE_LOCK_MESSAGE}</Alert>
            )}
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              rows={3}
              label={<FormattedMessage id="notes" defaultMessage="Notes" />}
              value={form.notes ?? ''}
              onChange={(event) => setForm({ ...form, notes: event.target.value })}
              error={Boolean(fieldErrors.notes)}
              helperText={fieldErrors.notes ?? ' '}
            />
          </Grid>
          <Grid item xs={12}>
            <FormControlLabel
              control={<Checkbox checked={form.isActive} onChange={(event) => setForm({ ...form, isActive: event.target.checked })} />}
              label={<FormattedMessage id="active" defaultMessage="Active" />}
            />
          </Grid>
        </Grid>
      </MainCard>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3, gap: 2 }}>
        <Button component={Link} to="/treasury/accounts" variant="outlined" color="inherit" disabled={isSaving} sx={{ borderRadius: 2, px: 4 }}>
          <FormattedMessage id="cancel" defaultMessage="Cancel" />
        </Button>
        <Button type="submit" variant="contained" color="primary" disabled={isSaving} sx={{ borderRadius: 2, px: 4, boxShadow: 2 }} startIcon={<IconDeviceFloppy size={18} />}>
          <FormattedMessage id="save" defaultMessage="Save" />
        </Button>
      </Box>
    </Box>
  );
}
