import type { AccountingAccountType } from './accounting.types';

export type AccountingReportAccountDto = {
  id: string;
  code: string;
  nameArabic: string;
  nameEnglish: string | null;
  accountType: AccountingAccountType;
  accountTypeLabel: string;
  normalBalance: 'Debit' | 'Credit';
  normalBalanceLabel: string;
  parentId: string | null;
  parentCode: string | null;
  parentNameArabic: string | null;
  hierarchyPath: string | null;
  hierarchyLevel: number;
  isPosting: boolean;
  isActive: boolean;
  isSystem: boolean;
};

export type GeneralLedgerEntryDto = {
  journalEntryId: string;
  entryNumber: string;
  entryDate: string;
  sourceType: string;
  sourceTypeLabel: string;
  sourceId: string | null;
  lineNumber: number;
  accountId: string;
  accountCode: string;
  accountNameArabic: string;
  accountNameEnglish: string | null;
  descriptionArabic: string | null;
  descriptionEnglish: string | null;
  debitAmount: number;
  creditAmount: number;
  runningBalance: number;
};

export type GeneralLedgerReportDto = {
  account: AccountingReportAccountDto;
  fromDate: string;
  toDate: string;
  includeDescendants: boolean;
  openingBalance: number;
  periodChange: number;
  closingBalance: number;
  rows: GeneralLedgerEntryDto[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
};

export type GeneralLedgerParams = {
  accountId: string;
  fromDate: string;
  toDate: string;
  page?: number;
  pageSize?: number;
  includeDescendants?: boolean;
};

export type IncomeStatementFiltersDto = {
  fromDate: string;
  toDate: string;
  includeZeroBalances: boolean;
  includeInactiveAccounts: boolean;
  includeHeaderAccounts: boolean;
  search: string | null;
};

export type IncomeStatementRowDto = {
  accountId: string;
  accountCode: string;
  accountArabicName: string;
  accountEnglishName: string | null;
  accountType: AccountingAccountType;
  accountTypeLabel: string;
  normalBalance: 'Debit' | 'Credit';
  normalBalanceLabel: string;
  parentId: string | null;
  hierarchyLevel: number;
  hierarchyPath: string;
  isPosting: boolean;
  isActive: boolean;
  isSystem: boolean;
  debitAmount: number;
  creditAmount: number;
  netAmount: number;
  normalBalanceAmount: number;
  abnormalBalanceAmount: number;
  isAbnormalBalance: boolean;
};

export type IncomeStatementReportDto = {
  fromDate: string;
  toDate: string;
  appliedFilters: IncomeStatementFiltersDto;
  revenueRows: IncomeStatementRowDto[];
  expenseRows: IncomeStatementRowDto[];
  totalRevenue: number;
  totalExpenses: number;
  netProfitOrLoss: number;
  resultType: 'Profit' | 'Loss' | 'BreakEven' | string;
  revenueAccountCount: number;
  expenseAccountCount: number;
  hasActivity: boolean;
};

export type IncomeStatementParams = {
  fromDate?: string;
  toDate?: string;
  includeZeroBalances?: boolean;
  includeInactiveAccounts?: boolean;
  includeHeaderAccounts?: boolean;
  search?: string;
};

export type TrialBalanceRowDto = {
  accountId: string;
  code: string;
  nameArabic: string;
  nameEnglish: string | null;
  accountType: AccountingAccountType;
  accountTypeLabel: string;
  normalBalance: 'Debit' | 'Credit';
  normalBalanceLabel: string;
  parentId: string | null;
  parentCode: string | null;
  parentNameArabic: string | null;
  hierarchyPath: string;
  hierarchyLevel: number;
  isPosting: boolean;
  isActive: boolean;
  isSystem: boolean;
  openingDebit: number;
  openingCredit: number;
  periodDebit: number;
  periodCredit: number;
  closingDebit: number;
  closingCredit: number;
};

export type TrialBalanceTotalsDto = {
  openingDebit: number;
  openingCredit: number;
  openingDifference: number;
  isOpeningBalanced: boolean;
  periodDebit: number;
  periodCredit: number;
  periodDifference: number;
  isPeriodBalanced: boolean;
  closingDebit: number;
  closingCredit: number;
  closingDifference: number;
  isClosingBalanced: boolean;
  isBalanced: boolean;
};

export type TrialBalanceReportDto = {
  fromDate: string;
  toDate: string;
  includeInactiveAccounts: boolean;
  includeZeroBalances: boolean;
  includeHeaderAccounts: boolean;
  rows: TrialBalanceRowDto[];
  totals: TrialBalanceTotalsDto;
};

export type TrialBalanceParams = {
  fromDate: string;
  toDate: string;
  includeInactiveAccounts?: boolean;
  includeZeroBalances?: boolean;
  includeHeaderAccounts?: boolean;
};

export type BalanceSheetFiltersDto = {
  asOfDate: string;
  includeZeroBalances: boolean;
  includeInactiveAccounts: boolean;
  includeHeaderAccounts: boolean;
  search: string | null;
};

export type BalanceSheetRowDto = {
  accountId: string | null;
  accountCode: string | null;
  accountArabicName: string;
  accountEnglishName: string | null;
  accountType: AccountingAccountType;
  accountTypeLabel: string;
  normalBalance: 'Debit' | 'Credit';
  normalBalanceLabel: string;
  parentId: string | null;
  hierarchyLevel: number;
  hierarchyPath: string;
  isPosting: boolean;
  isActive: boolean;
  isSystem: boolean;
  isDerived: boolean;
  debitAmount: number;
  creditAmount: number;
  netAmount: number;
  normalBalanceAmount: number;
  abnormalBalanceAmount: number;
  isAbnormalBalance: boolean;
};

export type BalanceSheetReportDto = {
  asOfDate: string;
  appliedFilters: BalanceSheetFiltersDto;
  assetRows: BalanceSheetRowDto[];
  liabilityRows: BalanceSheetRowDto[];
  equityRows: BalanceSheetRowDto[];
  unclosedEarningsRow: BalanceSheetRowDto;
  totalAssets: number;
  totalLiabilities: number;
  totalEquityBeforeUnclosedEarnings: number;
  unclosedEarnings: number;
  unclosedEarningsResultType: 'Profit' | 'Loss' | 'BreakEven' | string;
  unclosedEarningsLabel: string;
  totalEquity: number;
  totalLiabilitiesAndEquity: number;
  balanceDifference: number;
  isBalanced: boolean;
  hiddenPostingAccountCount: number;
  hasHiddenBalances: boolean;
  hasActivity: boolean;
};

export type BalanceSheetParams = {
  asOfDate?: string;
  includeZeroBalances?: boolean;
  includeInactiveAccounts?: boolean;
  includeHeaderAccounts?: boolean;
  search?: string;
};
