import { JOURNAL_ENTRY_STATUSES } from './journal-entry.constants';
import type { JournalEntryStatus } from '../types/journal-entry.types';

export function formatJournalEntryStatus(status?: JournalEntryStatus | string | null, locale?: string) {
  if (!status) {
    return '—';
  }

  const isArabic = locale?.toLowerCase().startsWith('ar');

  switch (status) {
    case JOURNAL_ENTRY_STATUSES.DRAFT:
      return isArabic ? 'مسودة' : 'Draft';
    case JOURNAL_ENTRY_STATUSES.POSTED:
      return isArabic ? 'مُعتمد' : 'Posted';
    case JOURNAL_ENTRY_STATUSES.CANCELLED:
      return isArabic ? 'ملغي' : 'Cancelled';
    default:
      return '—';
  }
}
