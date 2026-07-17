import { ACCOUNTING_ACCOUNT_TYPES, ACCOUNTING_NORMAL_BALANCE } from './accounting.constants';

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

