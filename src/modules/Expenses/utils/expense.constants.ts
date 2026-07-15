import { formatTreasuryMoney } from 'modules/Treasury/utils/treasury.format';

export const EXPENSES_PERMISSIONS = {
  view: 'expenses.view',
  create: 'expenses.create',
  edit: 'expenses.edit',
  post: 'expenses.post',
  cancel: 'expenses.cancel',
  categoriesView: 'expenses.categories.view',
  categoriesManage: 'expenses.categories.manage'
} as const;

export function formatFinancialBalance(amount: number, nature: string, currencyCode = 'EGP') {
  // Treats Credit balance as negative for visual display where appropriate
  const visualAmount = nature === 'Credit' ? -Math.abs(amount) : Math.abs(amount);
  return formatTreasuryMoney(visualAmount, currencyCode);
}
