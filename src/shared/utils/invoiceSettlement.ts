import type { TreasuryAccountListItem } from 'modules/Treasury/types/treasury.types';
import { TREASURY_ACCOUNT_TYPES } from 'modules/Treasury/utils/treasury.constants';
import { resolveLocalizedText } from './localizedText';

export type InvoicePaymentMethod = 'Credit' | 'Cash' | 'Wallet' | 'InstaPay';
export type InvoiceSettlementStatus = 'Outstanding' | 'Settled' | 'Reversed';

export const INVOICE_PAYMENT_METHODS: InvoicePaymentMethod[] = ['Credit', 'Cash', 'Wallet', 'InstaPay'];
export const DIRECT_INVOICE_PAYMENT_METHODS: Exclude<InvoicePaymentMethod, 'Credit'>[] = ['Cash', 'Wallet', 'InstaPay'];

export function normalizeInvoicePaymentMethod(value?: string | number | null): InvoicePaymentMethod | null {
  switch (String(value ?? '').trim()) {
    case '1':
    case 'Credit':
    case 'credit':
      return 'Credit';
    case '2':
    case 'Cash':
    case 'cash':
      return 'Cash';
    case '3':
    case 'Wallet':
    case 'wallet':
      return 'Wallet';
    case '4':
    case 'InstaPay':
    case 'instapay':
      return 'InstaPay';
    default:
      return null;
  }
}

export function normalizeInvoiceSettlementStatus(value?: string | number | null): InvoiceSettlementStatus | null {
  switch (String(value ?? '').trim()) {
    case '1':
    case 'Outstanding':
    case 'outstanding':
      return 'Outstanding';
    case '2':
    case 'Settled':
    case 'settled':
      return 'Settled';
    case '3':
    case 'Reversed':
    case 'reversed':
      return 'Reversed';
    default:
      return null;
  }
}

export function isDirectInvoicePaymentMethod(value?: string | number | null): value is Exclude<InvoicePaymentMethod, 'Credit'> {
  const normalized = normalizeInvoicePaymentMethod(value);
  return normalized === 'Cash' || normalized === 'Wallet' || normalized === 'InstaPay';
}

export function isInvoicePaymentMethod(value?: string | number | null): value is InvoicePaymentMethod {
  return normalizeInvoicePaymentMethod(value) !== null;
}

export function toInvoicePaymentMethodCode(value: InvoicePaymentMethod): 1 | 2 | 3 | 4 {
  switch (value) {
    case 'Credit':
      return 1;
    case 'Cash':
      return 2;
    case 'Wallet':
      return 3;
    case 'InstaPay':
      return 4;
  }
}

export function getInvoicePaymentMethodLabel(locale: string, value?: string | number | null) {
  switch (normalizeInvoicePaymentMethod(value)) {
    case 'Credit':
      return resolveLocalizedText(locale, 'آجل', 'Credit');
    case 'Cash':
      return resolveLocalizedText(locale, 'نقدي', 'Cash');
    case 'Wallet':
      return resolveLocalizedText(locale, 'محفظة', 'Wallet');
    case 'InstaPay':
      return resolveLocalizedText(locale, 'إنستا باي', 'InstaPay');
    default:
      return value == null ? '—' : String(value);
  }
}

export function getInvoiceSettlementStatusLabel(locale: string, value?: string | number | null) {
  switch (normalizeInvoiceSettlementStatus(value)) {
    case 'Outstanding':
      return resolveLocalizedText(locale, 'غير مسددة', 'Outstanding');
    case 'Settled':
      return resolveLocalizedText(locale, 'مدفوعة', 'Settled');
    case 'Reversed':
      return resolveLocalizedText(locale, 'معكوسة', 'Reversed');
    default:
      return value == null ? '—' : String(value);
  }
}

export function getCompatibleTreasuryAccounts(
  accounts: TreasuryAccountListItem[],
  paymentMethod: string | number | null | undefined,
  currencyCode: string | null | undefined
) {
  const normalizedPaymentMethod = normalizeInvoicePaymentMethod(paymentMethod);
  const normalizedCurrency = (currencyCode ?? '').trim().toUpperCase();
  const filtered = accounts.filter((account) => {
    if (!account.isActive) {
      return false;
    }

    if (normalizedCurrency && account.currencyCode.trim().toUpperCase() !== normalizedCurrency) {
      return false;
    }

    switch (normalizedPaymentMethod) {
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
  paymentMethod: string | number | null | undefined,
  currencyCode: string | null | undefined
) {
  const compatibleAccounts = getCompatibleTreasuryAccounts(accounts, paymentMethod, currencyCode);
  return compatibleAccounts.length === 1 ? compatibleAccounts[0] : null;
}
