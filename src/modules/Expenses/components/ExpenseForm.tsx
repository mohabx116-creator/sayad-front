import { FormattedMessage } from 'react-intl';
import { Link } from 'react-router-dom';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Grid from '@mui/material/GridLegacy';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { IconInfoCircle } from '@tabler/icons-react';
import Divider from '@mui/material/Divider';

import MainCard from 'ui-component/cards/MainCard';
import Loader from 'ui-component/Loader';
import PermissionGuard from 'modules/Administration/components/PermissionGuard';
import type { PartyDto } from 'modules/Parties/types/parties.types';
import type { TreasuryAccountListItem } from 'modules/Treasury/types/treasury.types';
import { useTreasuryAccount } from 'modules/Treasury/hooks/useTreasury';

import type { ExpenseInput, ExpenseCategoryDto, ExpenseStatus } from '../types/expense.types';
import { formatFinancialBalance } from '../utils/expense.constants';
import ExpenseStatusChip from './ExpenseStatusChip';

interface Props {
  isEdit: boolean;
  isLoading: boolean;
  isSaving: boolean;
  status?: ExpenseStatus;
  expenseNumber?: string;
  form: ExpenseInput;
  setForm: React.Dispatch<React.SetStateAction<ExpenseInput>>;
  categories: ExpenseCategoryDto[];
  accounts: TreasuryAccountListItem[];
  parties: PartyDto[];
  onSubmit: (actionType: 'draft' | 'post') => void;
  backUrl: string;
  postPermission: string;
}

export default function ExpenseForm({
  isEdit,
  isLoading,
  isSaving,
  status,
  expenseNumber,
  form,
  setForm,
  categories,
  accounts,
  parties,
  onSubmit,
  backUrl,
  postPermission
}: Props) {
  const { account, isLoading: isAccountLoading } = useTreasuryAccount(form.treasuryAccountId || undefined);

  if (isLoading) {
    return <Loader />;
  }

  const resultingBalance = account ? (account.balanceNature === 'Credit' ? -account.balance : account.balance) - (form.amount || 0) : 0;
  const isInsufficient: boolean = !!(account && !account.allowNegativeBalance && resultingBalance < 0);

  const handleDraftSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit('draft');
  };

  return (
    <Box component="form" onSubmit={handleDraftSubmit} noValidate>
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <MainCard
            title={
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <IconInfoCircle color="var(--mui-palette-primary-main)" size={24} />
                  <Typography variant="h4" fontWeight={600}>
                    <FormattedMessage id="basic-information" defaultMessage="المعلومات الأساسية" />
                  </Typography>
                </Box>
                {expenseNumber && <Typography variant="h5" color="text.secondary">#{expenseNumber}</Typography>}
              </Box>
            }
            sx={{ border: '1px solid', borderColor: 'divider', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', borderRadius: 3, mb: 3 }}
          >
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  select
                  fullWidth
                  required
                  label={<FormattedMessage id="expense-category" defaultMessage="تصنيف المصروف" />}
                  value={form.expenseCategoryId}
                  onChange={(e) => setForm((curr) => ({ ...curr, expenseCategoryId: e.target.value }))}
                >
                  {categories.map((category) => (
                    <MenuItem key={category.id} value={category.id}>
                      {category.code} - {category.nameArabic}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  select
                  fullWidth
                  required
                  label={<FormattedMessage id="beneficiary" defaultMessage="المستفيد" />}
                  value={form.beneficiaryPartyId}
                  onChange={(e) => setForm((curr) => ({ ...curr, beneficiaryPartyId: e.target.value }))}
                >
                  {parties.map((party) => (
                    <MenuItem key={party.id} value={party.id}>
                      {party.code} - {party.nameArabic}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  select
                  fullWidth
                  required
                  label={<FormattedMessage id="treasury-account" defaultMessage="حساب الخزينة" />}
                  value={form.treasuryAccountId}
                  onChange={(e) => setForm((curr) => ({ ...curr, treasuryAccountId: e.target.value }))}
                >
                  {accounts.map((acc) => (
                    <MenuItem key={acc.id} value={acc.id}>
                      {acc.code} - {acc.nameArabic}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  type="date"
                  fullWidth
                  required
                  label={<FormattedMessage id="date" />}
                  value={form.expenseDate}
                  onChange={(e) => setForm((curr) => ({ ...curr, expenseDate: e.target.value }))}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              <Grid item xs={12} md={12}>
                <TextField
                  fullWidth
                  label={<FormattedMessage id="reference-number" defaultMessage="رقم المرجع" />}
                  value={form.referenceNumber ?? ''}
                  onChange={(e) => setForm((curr) => ({ ...curr, referenceNumber: e.target.value }))}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label={<FormattedMessage id="description" />}
                  value={form.description ?? ''}
                  onChange={(e) => setForm((curr) => ({ ...curr, description: e.target.value }))}
                />
              </Grid>
            </Grid>
          </MainCard>
        </Grid>

        <Grid item xs={12} md={4}>
          <MainCard sx={{ border: '1px solid', borderColor: 'divider', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', borderRadius: 3 }}>
            <Typography variant="h4" fontWeight={600} sx={{ mb: 3 }}>
              <FormattedMessage id="summary" defaultMessage="الملخص" />
            </Typography>

            {status && (
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography color="text.secondary"><FormattedMessage id="status" /></Typography>
                <ExpenseStatusChip status={status} />
              </Box>
            )}

            <Box sx={{ mb: 3 }}>
              <TextField
                type="number"
                fullWidth
                required
                label={<FormattedMessage id="expenses.expense-amount" defaultMessage="قيمة المصروف" />}
                value={form.amount || ''}
                onChange={(e) => setForm((curr) => ({ ...curr, amount: Number(e.target.value) }))}
                inputProps={{ min: 0, step: 0.01 }}
              />
            </Box>

            <Box sx={{ bgcolor: 'grey.50', p: 2, borderRadius: 2, mb: 3 }}>
              <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2 }}>
                <FormattedMessage id="financial-impact" defaultMessage="التأثير المالي" />
              </Typography>
              
              {!form.treasuryAccountId ? (
                <Typography variant="body2" color="text.disabled">
                  <FormattedMessage id="expenses.select-account-balance" defaultMessage="اختر حساب الخزينة لعرض الرصيد" />
                </Typography>
              ) : isAccountLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                  <CircularProgress size={24} />
                </Box>
              ) : account ? (
                <>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2"><FormattedMessage id="expenses.current-balance" defaultMessage="الرصيد الحالي" />:</Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {formatFinancialBalance(account.balance, account.balanceNature, account.currencyCode)}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2"><FormattedMessage id="expenses.resulting-balance" defaultMessage="الرصيد بعد المصروف" />:</Typography>
                    <Typography variant="body2" fontWeight={700} color={resultingBalance < 0 ? 'error.main' : 'success.main'}>
                      {formatFinancialBalance(Math.abs(resultingBalance), resultingBalance < 0 ? 'Credit' : 'Debit', account.currencyCode)}
                    </Typography>
                  </Box>

                  <Divider sx={{ my: 1.5 }} />

                  {account.allowNegativeBalance ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'warning.dark' }}>
                      <IconInfoCircle size={16} />
                      <Typography variant="caption"><FormattedMessage id="expenses.allow-negative-balance" defaultMessage="يسمح برصيد سالب" /></Typography>
                    </Box>
                  ) : (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary' }}>
                      <IconInfoCircle size={16} />
                      <Typography variant="caption"><FormattedMessage id="expenses.negative-not-allowed" defaultMessage="لا يسمح برصيد سالب" /></Typography>
                    </Box>
                  )}

                  {isInsufficient && (
                    <Typography color="error" variant="body2" sx={{ mt: 1, fontWeight: 'bold' }}>
                      <FormattedMessage id="expenses.insufficient-balance" defaultMessage="الرصيد غير كافٍ" />
                    </Typography>
                  )}
                </>
              ) : (
                <Typography variant="body2" color="error">
                  <FormattedMessage id="error-loading-data" defaultMessage="حدث خطأ أثناء تحميل البيانات" />
                </Typography>
              )}
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Button
                type="submit"
                variant="outlined"
                color="primary"
                fullWidth
                disabled={isSaving || !form.expenseCategoryId || !form.treasuryAccountId || !form.beneficiaryPartyId || !form.amount}
              >
                <FormattedMessage id="save-as-draft" />
              </Button>

              {isEdit && (
                <PermissionGuard permission={postPermission}>
                  <Button
                    variant="contained"
                    color="primary"
                    fullWidth
                    disabled={isSaving || isInsufficient || !form.amount}
                    onClick={() => onSubmit('post')}
                  >
                    <FormattedMessage id="expenses.post-expense" defaultMessage="ترحيل المصروف" />
                  </Button>
                </PermissionGuard>
              )}
              
              <Button component={Link} to={backUrl} variant="text" color="inherit" fullWidth disabled={isSaving}>
                <FormattedMessage id="cancel" />
              </Button>
            </Box>
          </MainCard>
        </Grid>
      </Grid>
    </Box>
  );
}
