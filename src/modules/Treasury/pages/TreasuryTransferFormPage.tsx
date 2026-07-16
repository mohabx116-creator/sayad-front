import { useEffect, useMemo, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { useNavigate, useParams } from 'react-router-dom';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Grid from '@mui/material/GridLegacy';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';

import { IconInfoCircle } from '@tabler/icons-react';

import { useDispatch } from 'store';
import { openSnackbar } from 'store/slices/snackbar';
import MainCard from 'ui-component/cards/MainCard';
import Breadcrumbs from 'ui-component/extended/Breadcrumbs';
import Loader from 'ui-component/Loader';
import PermissionGuard from 'modules/Administration/components/PermissionGuard';
import CodeNameLabel from 'shared/components/CodeNameLabel';

import { createTreasuryTransfer, getTreasuryTransfer, postTreasuryTransfer, updateTreasuryTransfer } from '../api/treasuryApi';
import { useTreasuryAccounts } from '../hooks/useTreasury';
import { TREASURY_PERMISSIONS } from '../utils/treasury.constants';
import { refreshTreasuryViews } from '../utils/treasuryRefresh';
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
  const fromAccount = useMemo(() => accounts.find((account) => account.id === form.fromAccountId) ?? null, [accounts, form.fromAccountId]);
  const toAccount = useMemo(() => accounts.find((account) => account.id === form.toAccountId) ?? null, [accounts, form.toAccountId]);
  const amountValue = Number(form.amount) || 0;
  const sameAccount = Boolean(form.fromAccountId && form.toAccountId && form.fromAccountId === form.toAccountId);
  const sameCurrency = Boolean(!fromAccount || !toAccount || fromAccount.currencyCode === toAccount.currencyCode);
  const validationMessage = sameAccount
    ? 'لا يمكن التحويل بين نفس الحساب.'
    : !sameCurrency
      ? 'يجب أن يكون الحسابان بنفس العملة.'
      : amountValue <= 0
        ? 'مبلغ التحويل يجب أن يكون أكبر من صفر.'
        : '';

  const sourceProjectedBalance = fromAccount ? fromAccount.balance - amountValue : 0;
  const destinationProjectedBalance = toAccount ? toAccount.balance + amountValue : 0;

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
    if (validationMessage) {
      notify(validationMessage, 'error');
      return;
    }

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

      await refreshTreasuryViews();
      notify(
        intl.formatMessage({
          id: actionType === 'post' ? 'treasury.transfer-posted' : 'treasury.transfer-saved',
          defaultMessage: actionType === 'post' ? 'تم اعتماد التحويل بنجاح.' : 'تم حفظ التحويل كمسودة بنجاح.'
        })
      );
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
      <Box sx={{ mb: 3 }}>
        <Breadcrumbs
          custom
          heading={isEdit ? 'edit-transfer' : 'create-transfer'}
          links={[{ title: 'treasury', to: '/treasury' }, { title: 'transfers', to: '/treasury/transfers' }, { title: isEdit ? 'edit-transfer' : 'create-transfer' }]}
        />
      </Box>
      <MainCard
        title={<FormattedMessage id={isEdit ? 'edit-transfer' : 'create-transfer'} defaultMessage={isEdit ? 'تعديل تحويل' : 'إنشاء تحويل'} />}
        sx={{ border: '1px solid', borderColor: 'divider', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', borderRadius: 3 }}
      >
        <Box sx={{ pt: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, pb: 1, mb: 2 }}>
            <IconInfoCircle color="var(--mui-palette-primary-main)" size={24} />
            <Typography variant="h4" fontWeight={600}>
              <FormattedMessage id="basic-information" defaultMessage="المعلومات الأساسية" />
            </Typography>
          </Box>
          <Divider sx={{ mb: 3 }} />
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                select
                fullWidth
                label={<FormattedMessage id="from-account" defaultMessage="الحساب المحول منه" />}
                value={form.fromAccountId}
                onChange={(event) => setForm((current) => ({ ...current, fromAccountId: event.target.value }))}
              >
                {accounts.map((account) => (
                  <MenuItem key={account.id} value={account.id}>
                    <CodeNameLabel code={account.code} nameArabic={account.nameArabic} />
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                select
                fullWidth
                label={<FormattedMessage id="to-account" defaultMessage="الحساب المحول إليه" />}
                value={form.toAccountId}
                onChange={(event) => setForm((current) => ({ ...current, toAccountId: event.target.value }))}
              >
                {accounts.map((account) => (
                  <MenuItem key={account.id} value={account.id}>
                    <CodeNameLabel code={account.code} nameArabic={account.nameArabic} />
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                type="date"
                fullWidth
                label={<FormattedMessage id="date" defaultMessage="التاريخ" />}
                value={form.transferDate}
                onChange={(event) => setForm((current) => ({ ...current, transferDate: event.target.value }))}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                type="number"
                fullWidth
                label={<FormattedMessage id="amount" defaultMessage="مبلغ التحويل" />}
                value={form.amount || ''}
                onChange={(event) => setForm((current) => ({ ...current, amount: Number(event.target.value) }))}
                inputProps={{ min: 0, step: 0.01 }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label={<FormattedMessage id="notes" defaultMessage="ملاحظات" />}
                value={form.notes ?? ''}
                onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))}
              />
            </Grid>
          </Grid>

          <Box sx={{ mt: 3, p: 2.5, border: '1px solid', borderColor: 'divider', borderRadius: 2, bgcolor: 'grey.50' }}>
            <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
              <FormattedMessage id="treasury.transfer-preview" defaultMessage="الأرصدة قبل التأكيد" />
            </Typography>
            {validationMessage ? (
              <Alert severity="warning" sx={{ mb: 2 }}>
                {validationMessage}
              </Alert>
            ) : null}
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Box sx={{ p: 2, borderRadius: 2, bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider' }}>
                  <Typography variant="caption" color="text.secondary" fontWeight={600} display="block">
                    <FormattedMessage id="from-account" defaultMessage="الحساب المحول منه" />
                  </Typography>
                  <Box sx={{ mt: 0.5 }}>{fromAccount ? <CodeNameLabel code={fromAccount.code} nameArabic={fromAccount.nameArabic} /> : '—'}</Box>
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    <FormattedMessage id="current-balance" defaultMessage="الرصيد الحالي" />: {fromAccount ? fromAccount.balance.toFixed(2) : '—'} {fromAccount?.currencyCode ?? ''}
                  </Typography>
                  <Typography variant="body2" fontWeight={700} sx={{ mt: 0.5 }}>
                    <FormattedMessage id="balance-after-transfer" defaultMessage="الرصيد بعد التحويل" />: {fromAccount ? sourceProjectedBalance.toFixed(2) : '—'} {fromAccount?.currencyCode ?? ''}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Box sx={{ p: 2, borderRadius: 2, bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider' }}>
                  <Typography variant="caption" color="text.secondary" fontWeight={600} display="block">
                    <FormattedMessage id="to-account" defaultMessage="الحساب المحول إليه" />
                  </Typography>
                  <Box sx={{ mt: 0.5 }}>{toAccount ? <CodeNameLabel code={toAccount.code} nameArabic={toAccount.nameArabic} /> : '—'}</Box>
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    <FormattedMessage id="current-balance" defaultMessage="الرصيد الحالي" />: {toAccount ? toAccount.balance.toFixed(2) : '—'} {toAccount?.currencyCode ?? ''}
                  </Typography>
                  <Typography variant="body2" fontWeight={700} sx={{ mt: 0.5 }}>
                    <FormattedMessage id="balance-after-transfer" defaultMessage="الرصيد بعد التحويل" />: {toAccount ? destinationProjectedBalance.toFixed(2) : '—'} {toAccount?.currencyCode ?? ''}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 3 }}>
            <Button variant="outlined" color="inherit" onClick={() => navigate('/treasury/transfers')} disabled={isSaving}>
              <FormattedMessage id="cancel" defaultMessage="إلغاء" />
            </Button>
            <Button variant="outlined" onClick={() => handleSubmit('draft')} disabled={isSaving || Boolean(validationMessage)}>
              <FormattedMessage id="save-as-draft" defaultMessage="حفظ كمسودة" />
            </Button>
            <PermissionGuard permission={TREASURY_PERMISSIONS.transfersPost}>
              <Button variant="contained" onClick={() => handleSubmit('post')} disabled={isSaving || Boolean(validationMessage)}>
                <FormattedMessage id="post" defaultMessage="اعتماد التحويل" />
              </Button>
            </PermissionGuard>
          </Box>
        </Box>
      </MainCard>
    </Box>
  );
}
