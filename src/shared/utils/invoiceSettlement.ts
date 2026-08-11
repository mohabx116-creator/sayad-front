import type { TreasuryAccountListItem } from 'modules/Treasury/types/treasury.types';
import { TREASURY_ACCOUNT_TYPES } from 'modules/Treasury/utils/treasury.constants';
import { resolveLocalizedText } from './localizedText';

export type InvoicePaymentMethod = 'Credit' | 'Cash' | 'Wallet' | 'InstaPay';
export type InvoiceSettlementStatus = 'Outstanding' | 'Settled' | 'Reversed';

export const INVOICE_PAYMENT_METHODS: InvoicePaymentMethod[] = ['Credit', 'Cash', 'Wallet', 'InstaPay'];
export const DIRECT_INVOICE_PAYMENT_METHODS: Exclude<InvoicePaymentMethod, 'Credit'>[] = ['Cash', 'Wallet', 'InstaPay'];

export function isDirectInvoicePaymentMethod(value?: string | null): value is Exclude<InvoicePaymentMethod, 'Credit'> {
  return value === 'Cash' || value === 'Wallet' || value === 'InstaPay';
}

export function isInvoicePaymentMethod(value?: string | null): value is InvoicePaymentMethod {
  return value === 'Credit' || value === 'Cash' || value === 'Wallet' || value === 'InstaPay';
}

export function getInvoicePaymentMethodLabel(locale: string, value?: string | null) {
  switch (value) {
    case 'Credit':
      return resolveLocalizedText(locale, 'آجل', 'Credit');
    case 'Cash':
      return resolveLocalizedText(locale, 'نقدي', 'Cash');
    case 'Wallet':
      return resolveLocalizedText(locale, 'محفظة', 'Wallet');
    case 'InstaPay':
      return resolveLocalizedText(locale, 'إنستا باي', 'InstaPay');
    default:
      return value ?? '—';
  }
}

export function getInvoiceSettlementStatusLabel(locale: string, value?: string | null) {
  switch (value) {
    case 'Outstanding':
      return resolveLocalizedText(locale, 'غير مسددة', 'Outstanding');
    case 'Settled':
      return resolveLocalizedText(locale, 'مدفوعة', 'Settled');
    case 'Reversed':
      return resolveLocalizedText(locale, 'معكوسة', 'Reversed');
    default:
      return value ?? '—';
  }
}

export function getCompatibleTreasuryAccounts(
  accounts: TreasuryAccountListItem[],
  paymentMethod: string | null | undefined,
  currencyCode: string | null | undefined
) {
  const normalizedCurrency = (currencyCode ?? '').trim().toUpperCase();
  const filtered = accounts.filter((account) => {
    if (!account.isActive) {
      return false;
    }

    if (normalizedCurrency && account.currencyCode.trim().toUpperCase() !== normalizedCurrency) {
      return false;
    }

    switch (paymentMethod) {
      case 'Cash':
        return account.accountType === TREASURY_ACCOUNT_TYPES.CASH || account.accountType === TREASURY_ACCOUNT_TYPES.PETTY_CASH;
      case 'Wallet':
        return account.accountType === TREASURY_ACCOUNT_TYPES.DIGITAL_WALLET;
      case 'InstaPay':
        return account.accountType === TREASURY_ACCOUNT_TYPES.BANK;
      default:
        return false;
    }
  });

  return filtered.sort((left, right) => left.code.localeCompare(right.code));
}

export function getCompatibleTreasuryAccount(
  accounts: TreasuryAccountListItem[],
  paymentMethod: string | null | undefined,
  currencyCode: string | null | undefined
) {
  const compatibleAccounts = getCompatibleTreasuryAccounts(accounts, paymentMethod, currencyCode);
  return compatibleAccounts.length === 1 ? compatibleAccounts[0] : null;
}
