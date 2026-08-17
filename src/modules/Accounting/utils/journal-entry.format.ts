import { JOURNAL_ENTRY_SOURCE_TYPES, JOURNAL_ENTRY_STATUSES } from './journal-entry.constants';
import type { JournalEntrySourceType, JournalEntryStatus } from '../types/journal-entry.types';

const EMPTY_VALUE = '\u2014';

export function formatJournalEntryStatus(status?: JournalEntryStatus | string | null, locale?: string) {
  if (!status) {
    return EMPTY_VALUE;
  }

  const isArabic = locale?.toLowerCase().startsWith('ar');

  switch (status) {
    case JOURNAL_ENTRY_STATUSES.DRAFT:
      return isArabic ? '\u0645\u0633\u0648\u062F\u0629' : 'Draft';
    case JOURNAL_ENTRY_STATUSES.POSTED:
      return isArabic ? '\u0645\u064F\u0639\u062A\u0645\u062F' : 'Posted';
    case JOURNAL_ENTRY_STATUSES.CANCELLED:
      return isArabic ? '\u0645\u0644\u063A\u064A' : 'Cancelled';
    default:
      return EMPTY_VALUE;
  }
}

export function formatJournalEntrySourceType(sourceType?: JournalEntrySourceType | string | null, locale?: string) {
  if (!sourceType) {
    return EMPTY_VALUE;
  }

  const isArabic = locale?.toLowerCase().startsWith('ar');

  switch (sourceType) {
    case JOURNAL_ENTRY_SOURCE_TYPES.MANUAL:
      return isArabic ? '\u064A\u062F\u0648\u064A' : 'Manual';
    case JOURNAL_ENTRY_SOURCE_TYPES.REVERSAL:
      return isArabic ? '\u0639\u0643\u0633\u064A' : 'Reversal';
    case JOURNAL_ENTRY_SOURCE_TYPES.TREASURY_RECEIPT:
      return isArabic ? '\u0633\u0646\u062F \u0642\u0628\u0636' : 'Treasury Receipt';
    case JOURNAL_ENTRY_SOURCE_TYPES.TREASURY_PAYMENT:
      return isArabic ? '\u0633\u0646\u062F \u0635\u0631\u0641' : 'Treasury Payment';
    case JOURNAL_ENTRY_SOURCE_TYPES.TREASURY_TRANSFER:
      return isArabic ? '\u062A\u062D\u0648\u064A\u0644 \u062E\u0632\u064A\u0646\u0629' : 'Treasury Transfer';
    case JOURNAL_ENTRY_SOURCE_TYPES.EXPENSE:
      return isArabic ? '\u0645\u0635\u0631\u0648\u0641' : 'Expense';
    case JOURNAL_ENTRY_SOURCE_TYPES.SALES_INVOICE:
      return isArabic ? '\u0641\u0627\u062A\u0648\u0631\u0629 \u0628\u064A\u0639' : 'Sales Invoice';
    case JOURNAL_ENTRY_SOURCE_TYPES.SALES_RETURN:
      return isArabic ? '\u0645\u0631\u062A\u062C\u0639 \u0628\u064A\u0639' : 'Sales Return';
    case JOURNAL_ENTRY_SOURCE_TYPES.PURCHASE_INVOICE:
      return isArabic ? '\u0641\u0627\u062A\u0648\u0631\u0629 \u0634\u0631\u0627\u0621' : 'Purchase Invoice';
    case JOURNAL_ENTRY_SOURCE_TYPES.SALES_INVOICE_SETTLEMENT:
      return isArabic ? '\u0633\u062F\u0627\u062F \u0641\u0627\u062A\u0648\u0631\u0629 \u0628\u064A\u0639' : 'Sales Invoice Settlement';
    case JOURNAL_ENTRY_SOURCE_TYPES.PURCHASE_INVOICE_SETTLEMENT:
      return isArabic ? '\u0633\u062F\u0627\u062F \u0641\u0627\u062A\u0648\u0631\u0629 \u0634\u0631\u0627\u0621' : 'Purchase Invoice Settlement';
    case JOURNAL_ENTRY_SOURCE_TYPES.PURCHASE_RETURN:
      return isArabic ? '\u0645\u0631\u062A\u062C\u0639 \u0634\u0631\u0627\u0621' : 'Purchase Return';
    case JOURNAL_ENTRY_SOURCE_TYPES.INVENTORY_MOVEMENT:
      return isArabic ? '\u062D\u0631\u0643\u0629 \u0645\u062E\u0632\u0648\u0646' : 'Inventory Movement';
    case JOURNAL_ENTRY_SOURCE_TYPES.FISCAL_YEAR_CLOSING:
      return isArabic ? 'إقفال سنة مالية' : 'Fiscal Year Closing';
    case JOURNAL_ENTRY_SOURCE_TYPES.PAYROLL_PAYMENT:
      return isArabic ? 'صرف رواتب' : 'Payroll Payment';
    default:
      return EMPTY_VALUE;
  }
}
