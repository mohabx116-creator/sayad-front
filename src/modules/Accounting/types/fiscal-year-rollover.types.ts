export type FiscalYearRolloverTargetPeriodDto = {
  periodNumber: number;
  nameArabic: string;
  nameEnglish: string | null;
  startDate: string;
  endDate: string;
};

export type FiscalYearRolloverHistoryItemDto = {
  id: string;
  sourceFiscalYearId: string;
  targetFiscalYearId: string;
  sourceFiscalYearNameArabic: string;
  sourceFiscalYearNameEnglish: string | null;
  targetFiscalYearNameArabic: string;
  targetFiscalYearNameEnglish: string | null;
  sourceStartDate: string;
  sourceEndDate: string;
  targetStartDate: string;
  targetEndDate: string;
  targetPeriodCount: number;
  status: 'Completed' | 'RolledBack' | string;
  statusLabel: string;
  reason: string | null;
  rollbackReason: string | null;
  openingBalanceDifference: number;
  nominalClosureDifference: number;
  createdAtUtc: string;
  rolledBackAtUtc: string | null;
  rowVersion: string;
};

export type FiscalYearRolloverPreviewDto = {
  fiscalYearId: string;
  fiscalYearNameArabic: string;
  fiscalYearNameEnglish: string | null;
  sourceStartDate: string;
  sourceEndDate: string;
  targetStartDate: string;
  targetEndDate: string;
  periodCount: number;
  allPeriodsClosed: boolean;
  hasDraftJournalEntries: boolean;
  hasActivity: boolean;
  isYearEndClosed: boolean;
  hasExistingActiveRollover: boolean;
  canRollOver: boolean;
  canRollback: boolean;
  openingBalanceDifference: number;
  nominalClosureDifference: number;
  targetPeriods: FiscalYearRolloverTargetPeriodDto[];
  latestRolloverId: string | null;
  latestRolloverStatus: string | null;
  latestRolloverReason: string | null;
  latestRollbackReason: string | null;
  latestRolloverCreatedAtUtc: string | null;
  latestRollbackAtUtc: string | null;
  blockingIssues: string[];
};

export type FiscalYearRolloverActionInput = {
  reason: string;
};
