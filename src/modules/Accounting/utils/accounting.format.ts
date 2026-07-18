import { ACCOUNTING_ACCOUNT_TYPES, ACCOUNTING_NORMAL_BALANCE, CASH_FLOW_ACTIVITY_TYPES } from './accounting.constants';

export function formatAccountingAccountType(type: string) {
  switch (type) {
    case ACCOUNTING_ACCOUNT_TYPES.ASSET:
      return 'الأصول';
    case ACCOUNTING_ACCOUNT_TYPES.LIABILITY:
      return 'الالتزامات';
    case ACCOUNTING_ACCOUNT_TYPES.EQUITY:
      return 'حقوق الملكية';
    case ACCOUNTING_ACCOUNT_TYPES.REVENUE:
      return 'الإيرادات';
    case ACCOUNTING_ACCOUNT_TYPES.EXPENSE:
      return 'المصروفات';
    default:
      return type;
  }
}

export function formatNormalBalance(balance: string) {
  if (balance === ACCOUNTING_NORMAL_BALANCE.DEBIT) {
    return 'مدين';
  }

  if (balance === ACCOUNTING_NORMAL_BALANCE.CREDIT) {
    return 'دائن';
  }

  return '—';
}

export function formatCashFlowActivityType(type: string) {
  switch (type) {
    case CASH_FLOW_ACTIVITY_TYPES.OPERATING:
      return '\u0623\u0646\u0634\u0637\u0629 \u062A\u0634\u063A\u064A\u0644\u064A\u0629';
    case CASH_FLOW_ACTIVITY_TYPES.INVESTING:
      return '\u0623\u0646\u0634\u0637\u0629 \u0627\u0633\u062A\u062B\u0645\u0627\u0631\u064A\u0629';
    case CASH_FLOW_ACTIVITY_TYPES.FINANCING:
      return '\u0623\u0646\u0634\u0637\u0629 \u062A\u0645\u0648\u064A\u0644\u064A\u0629';
    case CASH_FLOW_ACTIVITY_TYPES.EXCLUDED:
      return '\u0645\u0633\u062A\u0628\u0639\u062F \u0645\u0646 \u0642\u0627\u0626\u0645\u0629 \u0627\u0644\u062A\u062F\u0641\u0642\u0627\u062A \u0627\u0644\u0646\u0642\u062F\u064A\u0629';
    case CASH_FLOW_ACTIVITY_TYPES.UNCLASSIFIED:
      return '\u063A\u064A\u0631 \u0645\u0635\u0646\u0641';
    default:
      return type;
  }
}
