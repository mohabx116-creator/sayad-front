import { useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';

import PermissionGuard from 'modules/Administration/components/PermissionGuard';
import { useDispatch } from 'store';
import { openSnackbar } from 'store/slices/snackbar';
import { useTreasuryAccount } from 'modules/Treasury/hooks/useTreasury';

import { postExpense, cancelExpense } from '../api/expensesApi';
import { EXPENSES_PERMISSIONS, formatFinancialBalance } from '../utils/expense.constants';
import type { ExpenseDto } from '../types/expense.types';
import ExpenseConfirmationDialog from './ExpenseConfirmationDialog';

interface Props {
  expense: ExpenseDto;
  onSuccess: () => void;
}

export default function ExpenseLifecycleActions({ expense, onSuccess }: Props) {
  const [isPostOpen, setIsPostOpen] = useState(false);
  const [isCancelOpen, setIsCancelOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const dispatch = useDispatch();
  const intl = useIntl();

  const { account, isLoading: isAccountLoading } = useTreasuryAccount(isPostOpen ? expense.treasuryAccountId : undefined);

  const notify = (message: string, severity: 'success' | 'error' = 'success') => {
    dispatch(openSnackbar({ open: true, message, variant: 'alert', severity }));
  };

  const handlePost = async () => {
    try {
      setIsProcessing(true);
      await postExpense(expense.id, expense.rowVersion);
      notify(intl.formatMessage({ id: 'expenses.posted-successfully', defaultMessage: 'تم ترحيل المصروف بنجاح' }));
      setIsPostOpen(false);
      onSuccess();
    } catch (error) {
      notify(error instanceof Error ? error.message : 'Error', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancel = async (reason?: string) => {
    try {
      setIsProcessing(true);
      await cancelExpense(expense.id, { reason: reason || '', rowVersion: expense.rowVersion });
      notify(intl.formatMessage({ id: 'expenses.cancelled-successfully', defaultMessage: 'تم إلغاء المصروف بنجاح' }));
      setIsCancelOpen(false);
      onSuccess();
    } catch (error) {
      notify(error instanceof Error ? error.message : 'Error', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const resultingBalance = account ? (account.balanceNature === 'Credit' ? -account.balance : account.balance) - expense.amount : 0;
  const isInsufficient: boolean = !!(account && !account.allowNegativeBalance && resultingBalance < 0);

  return (
    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
      {expense.canPost && (
        <PermissionGuard permission={EXPENSES_PERMISSIONS.post}>
          <Button variant="contained" color="primary" onClick={() => setIsPostOpen(true)}>
            <FormattedMessage id="expenses.post-expense" defaultMessage="ترحيل المصروف" />
          </Button>
        </PermissionGuard>
      )}

      {expense.canCancel && (
        <PermissionGuard permission={EXPENSES_PERMISSIONS.cancel}>
          <Button variant="contained" color="error" onClick={() => setIsCancelOpen(true)}>
            <FormattedMessage id="expenses.cancel-expense" defaultMessage="إلغاء المصروف" />
          </Button>
        </PermissionGuard>
      )}

      {/* Post Confirmation */}
      <ExpenseConfirmationDialog
        open={isPostOpen}
        title={<FormattedMessage id="expenses.post-expense" defaultMessage="ترحيل المصروف" />}
        content={
          <Box>
            <FormattedMessage id="expenses.post-confirmation-desc" defaultMessage="هل أنت متأكد من ترحيل هذا المصروف؟" />
            <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography><FormattedMessage id="amount" />:</Typography>
                <Typography fontWeight="bold">{expense.amount}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography><FormattedMessage id="treasury-account" />:</Typography>
                <Typography fontWeight="bold">{expense.treasuryAccountNameArabic}</Typography>
              </Box>
              {isAccountLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                  <CircularProgress size={24} />
                </Box>
              ) : account ? (
                <>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography><FormattedMessage id="expenses.current-balance" defaultMessage="الرصيد الحالي" />:</Typography>
                    <Typography fontWeight="bold">{formatFinancialBalance(account.balance, account.balanceNature, account.currencyCode)}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography><FormattedMessage id="expenses.resulting-balance" defaultMessage="الرصيد بعد المصروف" />:</Typography>
                    <Typography fontWeight="bold" color={resultingBalance < 0 ? 'error.main' : 'success.main'}>
                      {formatFinancialBalance(Math.abs(resultingBalance), resultingBalance < 0 ? 'Credit' : 'Debit', account.currencyCode)}
                    </Typography>
                  </Box>
                  {isInsufficient && (
                    <Typography color="error" variant="body2" sx={{ mt: 1, fontWeight: 'bold' }}>
                      <FormattedMessage id="expenses.insufficient-balance" defaultMessage="الرصيد غير كافٍ" />
                    </Typography>
                  )}
                  {account.allowNegativeBalance && (
                    <Typography color="warning.main" variant="body2" sx={{ mt: 1 }}>
                      <FormattedMessage id="expenses.allow-negative-balance" defaultMessage="يسمح برصيد سالب" />
                    </Typography>
                  )}
                </>
              ) : null}
            </Box>
          </Box>
        }
        confirmLabel={<FormattedMessage id="expenses.post-expense" defaultMessage="ترحيل المصروف" />}
        confirmColor="primary"
        isProcessing={isProcessing || isAccountLoading || isInsufficient}
        onConfirm={() => handlePost()}
        onCancel={() => setIsPostOpen(false)}
      />

      {/* Cancel Confirmation */}
      <ExpenseConfirmationDialog
        open={isCancelOpen}
        title={<FormattedMessage id="expenses.cancel-expense" defaultMessage="إلغاء المصروف" />}
        content={
          <Box>
            <FormattedMessage id="expenses.cancel-confirmation-desc" defaultMessage="إلغاء المصروف سيعيد المبلغ إلى الخزنة ويعكس أثره المحاسبي. سيظل المصروف ظاهرًا في السجل بحالة ملغي." />
          </Box>
        }
        requireReason
        confirmLabel={<FormattedMessage id="expenses.confirm-cancellation" defaultMessage="تأكيد الإلغاء" />}
        cancelLabel={<FormattedMessage id="expenses.back" defaultMessage="رجوع" />}
        confirmColor="error"
        isProcessing={isProcessing}
        onConfirm={handleCancel}
        onCancel={() => setIsCancelOpen(false)}
      />
    </Box>
  );
}
