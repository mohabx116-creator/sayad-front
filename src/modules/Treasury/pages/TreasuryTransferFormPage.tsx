import { useEffect, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { useNavigate, useParams } from 'react-router-dom';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Grid from '@mui/material/GridLegacy';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';

import { useDispatch } from 'store';
import { openSnackbar } from 'store/slices/snackbar';
import MainCard from 'ui-component/cards/MainCard';
import Breadcrumbs from 'ui-component/extended/Breadcrumbs';
import Loader from 'ui-component/Loader';
import PermissionGuard from 'modules/Administration/components/PermissionGuard';

import { createTreasuryTransfer, getTreasuryTransfer, postTreasuryTransfer, updateTreasuryTransfer } from '../api/treasuryApi';
import { useTreasuryAccounts } from '../hooks/useTreasury';
import { TREASURY_PERMISSIONS } from '../utils/treasury.constants';
import type { TreasuryTransferInput } from '../types/treasury.types';

type TransferFormState = TreasuryTransferInput;

export default function TreasuryTransferFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const intl = useIntl();
  const dispatch = useDispatch();
  const isEdit = Boolean(id);

  const [form, setForm] = useState<TransferFormState>({
    fromAccountId: '',
    toAccountId: '',
    transferDate: new Date().toISOString().slice(0, 10),
    amount: 0,
    notes: ''
  });
  const [transfer, setTransfer] = useState<Awaited<ReturnType<typeof getTreasuryTransfer>> | null>(null);
  const [isLoading, setIsLoading] = useState(Boolean(id));
  const [isSaving, setIsSaving] = useState(false);

  const { items: accounts } = useTreasuryAccounts({ page: 1, pageSize: 200, status: 'Active' });

  useEffect(() => {
    let isMounted = true;
    if (!id) {
      setTransfer(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    getTreasuryTransfer(id)
      .then((data) => {
        if (isMounted) {
          setTransfer(data);
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [id]);

  useEffect(() => {
    if (transfer) {
      setForm({
        fromAccountId: transfer.fromAccountId,
        toAccountId: transfer.toAccountId,
        transferDate: transfer.transferDate,
        amount: transfer.amount,
        notes: transfer.notes ?? ''
      });
    }
  }, [transfer]);

  const notify = (message: string, severity: 'success' | 'error' = 'success') => {
    dispatch(openSnackbar({ open: true, message, variant: 'alert', severity }));
  };

  const handleSubmit = async (actionType: 'draft' | 'post') => {
    try {
      setIsSaving(true);
      const request = {
        fromAccountId: form.fromAccountId,
        toAccountId: form.toAccountId,
        transferDate: form.transferDate,
        amount: Number(form.amount),
        notes: form.notes || null
      };

      let savedTransfer = transfer;
      if (isEdit && transfer) {
        savedTransfer = await updateTreasuryTransfer(transfer.id, { ...request, rowVersion: transfer.rowVersion });
      } else {
        savedTransfer = await createTreasuryTransfer(request);
      }

      if (actionType === 'post' && savedTransfer) {
        savedTransfer = await postTreasuryTransfer(savedTransfer.id, savedTransfer.rowVersion);
      }

      notify(intl.formatMessage({ id: 'treasury.transfer-saved', defaultMessage: 'تم حفظ التحويل بنجاح.' }));
      navigate(`/treasury/transfers/${savedTransfer?.id ?? transfer?.id}`);
    } catch (error) {
      notify(error instanceof Error ? error.message : intl.formatMessage({ id: 'treasury.action-failed', defaultMessage: 'فشلت العملية.' }), 'error');
    } finally {
      setIsSaving(false);
    }
  };

  if (isEdit && isLoading) {
    return <Loader />;
  }

  return (
    <Box>
      <Breadcrumbs custom card={false} title={false} divider={false} heading={isEdit ? 'edit-transfer' : 'create-transfer'} links={[{ title: 'treasury', to: '/treasury' }, { title: 'transfers', to: '/treasury/transfers' }]} sx={{ mb: 3 }} />
      <MainCard sx={{ border: '1px solid', borderColor: 'divider', boxShadow: 'none', borderRadius: 2 }} content={false}>
        <Box sx={{ p: 3 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField select fullWidth label={<FormattedMessage id="from-account" defaultMessage="من حساب" />} value={form.fromAccountId} onChange={(event) => setForm((current) => ({ ...current, fromAccountId: event.target.value }))}>
                {accounts.map((account) => (
                  <MenuItem key={account.id} value={account.id}>{account.code} - {account.nameArabic}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField select fullWidth label={<FormattedMessage id="to-account" defaultMessage="إلى حساب" />} value={form.toAccountId} onChange={(event) => setForm((current) => ({ ...current, toAccountId: event.target.value }))}>
                {accounts.map((account) => (
                  <MenuItem key={account.id} value={account.id}>{account.code} - {account.nameArabic}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField type="date" fullWidth label={<FormattedMessage id="date" />} value={form.transferDate} onChange={(event) => setForm((current) => ({ ...current, transferDate: event.target.value }))} InputLabelProps={{ shrink: true }} />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField type="number" fullWidth label={<FormattedMessage id="amount" />} value={form.amount || ''} onChange={(event) => setForm((current) => ({ ...current, amount: Number(event.target.value) }))} inputProps={{ min: 0, step: 0.01 }} />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth multiline rows={3} label={<FormattedMessage id="notes" />} value={form.notes ?? ''} onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))} />
            </Grid>
          </Grid>

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 3 }}>
            <Button variant="outlined" color="inherit" onClick={() => navigate('/treasury/transfers')} disabled={isSaving}>
              <FormattedMessage id="cancel" />
            </Button>
            <Button variant="outlined" onClick={() => handleSubmit('draft')} disabled={isSaving}>
              <FormattedMessage id="save-as-draft" />
            </Button>
            <PermissionGuard permission={TREASURY_PERMISSIONS.transfersPost}>
              <Button variant="contained" onClick={() => handleSubmit('post')} disabled={isSaving}>
                <FormattedMessage id="post" />
              </Button>
            </PermissionGuard>
          </Box>
        </Box>
      </MainCard>
    </Box>
  );
}
