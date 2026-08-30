import { FormattedMessage } from 'react-intl';
import { Link } from 'react-router-dom';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CircularProgress from '@mui/material/CircularProgress';
import Grid from '@mui/material/GridLegacy';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import Loader from 'ui-component/Loader';
import CodeNameLabel from 'shared/components/CodeNameLabel';
import { useTreasuryAccount } from 'modules/Treasury/hooks/useTreasury';
import type { TreasuryAccountListItem } from 'modules/Treasury/types/treasury.types';

import type { ExpenseCategoryDto, ExpenseInput } from '../types/expense.types';
import { formatFinancialBalance } from '../utils/expense.constants';

interface Props {
  isLoading: boolean;
  isSaving: boolean;
  form: ExpenseInput;
  setForm: React.Dispatch<React.SetStateAction<ExpenseInput>>;
  categories: ExpenseCategoryDto[];
  accounts: TreasuryAccountListItem[];
  backUrl: string;
  onSubmit: () => void;
}

export default function ExpenseForm({ isLoading, isSaving, form, setForm, categories, accounts, backUrl, onSubmit }: Props) {
  const { account, isLoading: isAccountLoading } = useTreasuryAccount(form.treasuryAccountId || undefined);

  if (isLoading) {
    return <Loader />;
  }

  const selectedAccount = accounts.find((item) => item.id === form.treasuryAccountId) || null;

  return (
    <Box component="form" noValidate onSubmit={(e) => { e.preventDefault(); onSubmit(); }}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={9} xl={9}>
          <Card sx={{ p: 3, border: '1px solid', borderColor: 'divider', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', borderRadius: 3 }}>
            <Typography variant="h4" fontWeight={700} sx={{ mb: 1 }}>
              <FormattedMessage id="expenses.create-expense" defaultMessage="Create Expense" />
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              <FormattedMessage id="expenses.record-explanation" defaultMessage="Record the expense after payment. It will be deducted from the treasury automatically." />
            </Typography>

            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  select
                  fullWidth
                  required
                  label={<FormattedMessage id="expenses.what-for" defaultMessage="What was the expense for?" />}
                  value={form.expenseCategoryId}
                  onChange={(e) => setForm((curr) => ({ ...curr, expenseCategoryId: e.target.value }))}
                >
                  {categories.map((category) => (
                    <MenuItem key={category.id} value={category.id}>
                      <CodeNameLabel code={category.code} nameArabic={category.nameArabic} />
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  type="number"
                  fullWidth
                  required
                  label={<FormattedMessage id="expenses.how-much" defaultMessage="How much?" />}
                  value={form.amount || ''}
                  onChange={(e) => setForm((curr) => ({ ...curr, amount: Number(e.target.value) }))}
                  inputProps={{ min: 0, step: 0.01 }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  select
                  fullWidth
                  required
                  label={<FormattedMessage id="expenses.paid-from" defaultMessage="Paid from where?" />}
                  value={form.treasuryAccountId}
                  onChange={(e) => setForm((curr) => ({ ...curr, treasuryAccountId: e.target.value }))}
                >
                  {accounts.map((acc) => (
                    <MenuItem key={acc.id} value={acc.id}>
                      <CodeNameLabel code={acc.code} nameArabic={acc.nameArabic} />
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

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label={<FormattedMessage id="expenses.paid-to" defaultMessage="Paid To" />}
                  value={form.paidToName ?? ''}
                  onChange={(e) => setForm((curr) => ({ ...curr, paidToName: e.target.value }))}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label={<FormattedMessage id="expenses.note" defaultMessage="Note" />}
                  value={form.notes ?? ''}
                  onChange={(e) => setForm((curr) => ({ ...curr, notes: e.target.value }))}
                />
              </Grid>
            </Grid>
          </Card>
        </Grid>

        <Grid item xs={12} md={3} xl={3}>
          <Card sx={{ p: 3, border: '1px solid', borderColor: 'divider', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', borderRadius: 3 }}>
            <Typography variant="h4" fontWeight={700} sx={{ mb: 3 }}>
              <FormattedMessage id="operation-summary-section" defaultMessage="Summary" />
            </Typography>

            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                <FormattedMessage id="expenses.cashbox" defaultMessage="Cashbox" />
              </Typography>
              {selectedAccount ? (
                <Typography variant="body2" fontWeight={600}>
                  <CodeNameLabel code={selectedAccount.code} nameArabic={selectedAccount.nameArabic} />
                </Typography>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  -
                </Typography>
              )}
            </Box>

            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                <FormattedMessage id="expenses.current-balance" defaultMessage="Current Balance" />
              </Typography>
              {isAccountLoading ? (
                <CircularProgress size={20} />
              ) : account ? (
                <Typography variant="body2" fontWeight={600}>
                  {formatFinancialBalance(account.balance, account.balanceNature, account.currencyCode)}
                </Typography>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  -
                </Typography>
              )}
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Button type="submit" variant="contained" disabled={isSaving || !form.expenseCategoryId || !form.treasuryAccountId || !form.amount}>
                <FormattedMessage id="expenses.record-expense" defaultMessage="Record Expense" />
              </Button>
              <Button component={Link} to={backUrl} variant="text" color="inherit" disabled={isSaving}>
                <FormattedMessage id="cancel" />
              </Button>
            </Box>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
