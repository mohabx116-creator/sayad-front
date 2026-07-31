import { useEffect, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useSWRConfig } from 'swr';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import Grid from '@mui/material/GridLegacy';
import TextField from '@mui/material/TextField';

import { IconDeviceFloppy } from '@tabler/icons-react';

import { useDispatch } from 'store';
import { openSnackbar } from 'store/slices/snackbar';
import MainCard from 'ui-component/cards/MainCard';
import Breadcrumbs from 'ui-component/extended/Breadcrumbs';
import Loader from 'ui-component/Loader';

import { activateTreasuryAccount, createTreasuryAccount, deactivateTreasuryAccount, updateTreasuryAccount } from '../api/treasuryApi';
import { useTreasuryAccount } from '../hooks/useTreasury';
import type { TreasuryAccountInput } from '../types/treasury.types';

type TreasuryCashboxFormState = TreasuryAccountInput & {
  isActive: boolean;
};

function buildRequest(form: TreasuryCashboxFormState): TreasuryAccountInput {
  const openingBalanceAmount = Number(form.openingBalanceAmount) || 0;

  return {
    code: '',
    nameArabic: form.nameArabic.trim(),
    nameEnglish: null,
    accountType: 'Cash',
    currencyCode: 'EGP',
    notes: form.notes?.trim() ? form.notes.trim() : null,
    openingBalanceAmount,
    openingBalanceNature: openingBalanceAmount > 0 ? 'Debit' : null,
    allowNegativeBalance: false,
    accountingAccountId: null
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
  const [form, setForm] = useState<TreasuryCashboxFormState>({
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

  useEffect(() => {
    if (!account) {
      return;
    }

    setForm({
      code: account.code,
      nameArabic: account.nameArabic,
      nameEnglish: account.nameEnglish,
      accountType: 'Cash',
      currencyCode: 'EGP',
      notes: account.notes,
      openingBalanceAmount: account.openingBalance,
      openingBalanceNature: account.openingBalanceNature,
      allowNegativeBalance: false,
      accountingAccountId: null,
      isActive: account.isActive
    });
  }, [account]);

  const notify = (message: string, severity: 'success' | 'error' = 'success') => {
    dispatch(openSnackbar({ open: true, message, variant: 'alert', severity }));
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();

    try {
      setIsSaving(true);
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

        notify(intl.formatMessage({ id: 'cashbox-updated', defaultMessage: 'Cashbox updated successfully.' }));
        await mutateTreasury((key) => typeof key === 'string' && key.startsWith('/api/treasury/'));
        navigate(`/treasury/accounts/${account.id}`);
        return;
      }

      const created = await createTreasuryAccount(request);
      if (!form.isActive) {
        await deactivateTreasuryAccount(created.id, created.rowVersion);
      }

      notify(intl.formatMessage({ id: 'cashbox-created', defaultMessage: 'Cashbox created successfully.' }));
      await mutateTreasury((key) => typeof key === 'string' && key.startsWith('/api/treasury/'));
      navigate(`/treasury/accounts/${created.id}`);
    } catch (error) {
      notify(error instanceof Error ? error.message : intl.formatMessage({ id: 'action-failed', defaultMessage: 'The operation failed.' }), 'error');
    } finally {
      setIsSaving(false);
    }
  };

  if (isEdit && isLoading) {
    return <Loader />;
  }

  const openingBalanceLocked = isEdit && Boolean(account?.hasNonOpeningMovements);

  return (
    <Box component="form" onSubmit={submit}>
      <Box sx={{ mb: 3 }}>
        <Breadcrumbs
          custom
          heading={isEdit ? 'edit-account' : 'add-cashbox'}
          links={[{ title: 'cashboxes', to: '/treasury/accounts' }, { title: isEdit ? 'edit-account' : 'add-cashbox' }]}
        />
      </Box>

      <MainCard title={<FormattedMessage id={isEdit ? 'edit-account' : 'add-cashbox'} defaultMessage={isEdit ? 'Edit Cashbox' : 'Add Cashbox'} />}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <TextField
              required
              fullWidth
              label={<FormattedMessage id="cashbox-name" defaultMessage="Cashbox Name" />}
              value={form.nameArabic}
              onChange={(event) => setForm({ ...form, nameArabic: event.target.value })}
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
            />
          </Grid>
          <Grid item xs={12}>
            {openingBalanceLocked && (
              <Alert severity="warning">
                <FormattedMessage
                  id="opening-balance-locked"
                  defaultMessage="Opening balance can no longer be changed after non-opening movements exist."
                />
              </Alert>
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
