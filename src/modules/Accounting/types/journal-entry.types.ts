export type JournalEntryStatus = 'Draft' | 'Posted' | 'Cancelled';

export type JournalEntryLineRequest = {
  accountId: string;
  debitAmount: number;
  creditAmount: number;
  descriptionArabic: string | null;
  descriptionEnglish: string | null;
};

export type JournalEntryRequest = {
  entryDate: string;
  descriptionArabic: string | null;
  descriptionEnglish: string | null;
  lines: JournalEntryLineRequest[];
};

export type JournalEntryLineFormValues = {
  accountId: string;
  debitAmount: string;
  creditAmount: string;
  descriptionArabic: string;
  descriptionEnglish: string;
};

export type JournalEntryFormValues = {
  entryDate: string;
  descriptionArabic: string;
  descriptionEnglish: string;
  lines: JournalEntryLineFormValues[];
  rowVersion?: string;
};

export type JournalEntryLineDto = {
  id: string;
  lineNumber: number;
  accountId: string;
  accountCode: string;
  accountNameArabic: string;
  accountNameEnglish: string | null;
  debitAmount: number;
  creditAmount: number;
  descriptionArabic: string | null;
  descriptionEnglish: string | null;
};

export type JournalEntryDto = {
  id: string;
  number: string;
  entryDate: string;
  status: JournalEntryStatus;
  statusLabel: string;
  descriptionArabic: string | null;
  descriptionEnglish: string | null;
  totalDebit: number;
  totalCredit: number;
  postedAtUtc: string | null;
  cancelledAtUtc: string | null;
  cancellationReason: string | null;
  reversesJournalEntryId: string | null;
  reversalJournalEntryNumber: string | null;
  lines: JournalEntryLineDto[];
  createdAtUtc: string;
  updatedAtUtc: string | null;
  rowVersion: string;
};

export type JournalEntryListItemDto = {
  id: string;
  number: string;
  entryDate: string;
  status: JournalEntryStatus;
  statusLabel: string;
  descriptionArabic: string | null;
  descriptionEnglish: string | null;
  totalDebit: number;
  totalCredit: number;
  linesCount: number;
  reversesJournalEntryId: string | null;
  reversalJournalEntryNumber: string | null;
  createdAtUtc: string;
  updatedAtUtc: string | null;
  rowVersion: string;
};

export type JournalEntryListParams = {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
};

export type JournalEntryAccountLookupParams = {
  page?: number;
  pageSize?: number;
  search?: string;
};

export type JournalEntryCancelRequest = {
  reason: string;
  rowVersion: string;
};
