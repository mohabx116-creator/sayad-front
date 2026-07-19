export type FiscalYearClosingActionType = 'Close' | 'Reopen';

export type FiscalYearClosingPreviewLineDto = {
  accountId: string | null;
  accountCode: string | null;
  accountNameArabic: string;
  accountNameEnglish: string | null;
  accountType: string;
  accountTypeLabel: string;
  debitAmount: number;
  creditAmount: number;
  netAmount: number;
  isRetainedEarningsLine: boolean;
};

export type FiscalYearClosingHistoryItemDto = {
  id: string;
  actionType: FiscalYearClosingActionType;
  actionTypeLabel: string;
  actionDate: string;
  journalEntryId: string | null;
  journalEntryNumber: string | null;
  relatedClosingId: string | null;
  reason: string | null;
  netProfitOrLoss: number;
  createdAtUtc: string;
  rowVersion: string;
};

export type FiscalYearClosingOverviewDto = {
  fiscalYearId: string;
  fiscalYearNameArabic: string;
  fiscalYearNameEnglish: string | null;
  startDate: string;
  endDate: string;
  periodCount: number;
  closedPeriodCount: number;
  openPeriodCount: number;
  allPeriodsClosed: boolean;
  hasDraftJournalEntries: boolean;
  hasActivity: boolean;
  currentStatus: string | null;
  currentStatusLabel: string;
  isClosed: boolean;
  isReopened: boolean;
  canClose: boolean;
  canReopen: boolean;
  retainedEarningsAccountId: string | null;
  retainedEarningsAccountCode: string | null;
  retainedEarningsAccountNameArabic: string | null;
  retainedEarningsAccountNameEnglish: string | null;
  retainedEarningsRowVersion: string | null;
  revenueTotal: number;
  expenseTotal: number;
  netProfitOrLoss: number;
  previewLines: FiscalYearClosingPreviewLineDto[];
  history: FiscalYearClosingHistoryItemDto[];
  blockingIssues: string[];
};

export type FiscalYearClosingActionRequest = {
  fiscalYearId: string;
  reason: string;
};
