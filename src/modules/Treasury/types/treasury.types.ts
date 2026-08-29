export interface TreasuryLookupOption {
  id: string;
  code: string;
  displayName: string;
  value: string;
  labelArabic: string;
  labelEnglish: string;
}

export interface TreasuryAccountingAccountLookup {
  id: string;
  code: string;
  displayName: string;
}

export interface TreasuryEligibleInvoice {
  invoiceId: string;
  invoiceNumber: string;
  invoiceDate: string;
  grandTotal: number;
  allocatedAmount: number;
  outstandingAmount: number;
  invoiceDisplayNumber?: string | null;
}

export interface TreasuryPagedMeta {
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

export interface TreasuryPagedResult<T> {
  items: T[];
  meta: TreasuryPagedMeta;
}

export interface TreasuryAccount {
  id: string;
  code: string;
  nameArabic: string;
  nameEnglish: string | null;
  accountType: string;
  accountTypeLabel: string;
  currencyCode: string;
  isActive: boolean;
  allowNegativeBalance: boolean;
  accountingAccountId: string | null;
  accountingAccountCode: string | null;
  accountingAccountArabicName: string | null;
  isAccountingMapped: boolean;
  openingBalance: number;
  openingBalanceNature: string;
  hasNonOpeningMovements: boolean;
  debitTotal: number;
  creditTotal: number;
  balance: number;
  balanceNature: string;
  lastMovementDate: string | null;
  notes: string | null;
  createdAtUtc: string;
  updatedAtUtc: string | null;
  rowVersion: string;
}

export interface TreasuryAccountListItem {
  id: string;
  code: string;
  nameArabic: string;
  nameEnglish: string | null;
  accountType: string;
  accountTypeLabel: string;
  currencyCode: string;
  isActive: boolean;
  allowNegativeBalance: boolean;
  accountingAccountId: string | null;
  accountingAccountCode: string | null;
  accountingAccountArabicName: string | null;
  isAccountingMapped: boolean;
  openingBalance: number;
  debitTotal: number;
  creditTotal: number;
  balance: number;
  balanceNature: string;
  lastMovementDate: string | null;
  rowVersion: string;
}

export interface TreasuryAccountImportValidationErrorDto {
  rowNumber: number;
  field: string;
  code: string;
  message: string;
}

export interface TreasuryAccountImportPreviewRowDto {
  rowNumber: number;
  code: string | null;
  nameArabic: string | null;
  nameEnglish: string | null;
  accountType: string | null;
  accountTypeLabel: string | null;
  currencyCode: string | null;
  notes: string | null;
  allowNegativeBalance: boolean | null;
  accountingAccountCode: string | null;
  accountingAccountNameArabic: string | null;
  resolvedAccountingAccountDisplayName: string | null;
  errors: TreasuryAccountImportValidationErrorDto[];
  isValid: boolean;
}

export interface TreasuryAccountImportPreviewResultDto {
  rows: TreasuryAccountImportPreviewRowDto[];
  totalRows: number;
  validRows: number;
  failedRows: number;
}

export interface TreasuryAccountImportCommitRequest {
  rows: TreasuryAccountImportPreviewRowDto[];
}

export interface TreasuryAccountImportCommitResultDto {
  totalRows: number;
  importedRows: number;
  failedRows: number;
}

export interface TreasuryAccountLookup {
  id: string;
  code: string;
  nameArabic: string;
  nameEnglish: string | null;
  currencyCode: string;
}

export type TreasuryAccountFinalDeletionStrategy = 'MoveLinks' | 'DeleteAll';

export interface TreasuryAccountDeletionPreview {
  id: string;
  code: string;
  nameArabic: string;
  nameEnglish: string | null;
  currencyCode: string;
  openingBalance: number;
  openingBalanceNature: string;
  currentBalance: number;
  currentBalanceNature: string;
  receiptCount: number;
  paymentCount: number;
  transferCount: number;
  expenseCount: number;
  movementCount: number;
  linkedInvoiceAllocationCount: number;
  replacementAccounts: TreasuryAccountLookup[];
  rowVersion: string;
}

export interface TreasuryAccountInput {
  code: string;
  nameArabic: string;
  nameEnglish: string | null;
  accountType: string;
  currencyCode: string;
  notes: string | null;
  openingBalanceAmount: number | null;
  openingBalanceNature: string | null;
  allowNegativeBalance: boolean;
  accountingAccountId: string | null;
}

export interface TreasuryCashMovementInput {
  transactionDate: string;
  amount: number;
  reason: string;
  notes: string | null;
}

export interface TreasuryAllocation {
  id: string;
  lineNumber: number;
  allocationType: string;
  allocationTypeLabel: string;
  sourceDocumentType: string | null;
  sourceDocumentNumber: string | null;
  amount: number;
  notes: string | null;
}

export interface TreasuryAllocationInput {
  allocationType: string;
  sourceDocumentType: string | null;
  sourceDocumentNumber: string | null;
  amount: number;
  notes: string | null;
}

export interface TreasuryTransfer {
  id: string;
  number: string;
  fromAccountId: string;
  fromAccountCode: string;
  fromAccountNameArabic: string;
  sourceAccountingAccountId: string | null;
  sourceAccountingAccountCode: string | null;
  sourceAccountingAccountArabicName: string | null;
  toAccountId: string;
  toAccountCode: string;
  toAccountNameArabic: string;
  destinationAccountingAccountId: string | null;
  destinationAccountingAccountCode: string | null;
  destinationAccountingAccountArabicName: string | null;
  transferDate: string;
  status: string;
  currencyCode: string;
  amount: number;
  notes: string | null;
  postedAtUtc: string | null;
  cancelledAtUtc: string | null;
  cancellationReason: string | null;
  accountingJournalEntryId: string | null;
  accountingEntryNumber: string | null;
  accountingPostingStatus: string;
  isAccountingPosted: boolean;
  rowVersion: string;
  displayNumber?: string | null;
}

export interface TreasuryTransferListItem {
  id: string;
  number: string;
  transferDate: string;
  fromAccountCode: string;
  toAccountCode: string;
  status: string;
  amount: number;
  currencyCode: string;
  isAccountingPosted: boolean;
  accountingPostingStatus: string;
  rowVersion: string;
  displayNumber?: string | null;
}

export interface TreasuryTransferInput {
  fromAccountId: string;
  toAccountId: string;
  transferDate: string;
  amount: number;
  notes: string | null;
}

export interface TreasuryMovement {
  id: string;
  movementDate: string;
  movementType: string;
  referenceType: string;
  referenceId: string | null;
  referenceNumber: string | null;
  sourceDocumentType: string | null;
  sourceDocumentId: string | null;
  sourceDocumentNumber: string | null;
  referenceDisplayNumber?: string | null;
  sourceDocumentDisplayNumber?: string | null;
  partyId: string | null;
  partyCode: string | null;
  partyNameArabic: string | null;
  debitAmount: number;
  creditAmount: number;
  balanceAfter: number;
  balanceNature: string;
  descriptionArabic: string;
  descriptionEnglish: string | null;
  isReversal: boolean;
  reversesMovementId: string | null;
  createdAtUtc: string;
}

export interface TreasuryStatement {
  treasuryAccountId: string;
  treasuryAccountCode: string;
  treasuryAccountNameArabic: string;
  treasuryAccountNameEnglish: string | null;
  currencyCode: string;
  openingBalance: number;
  openingBalanceNature: string;
  debitTotal: number;
  creditTotal: number;
  closingBalance: number;
  closingBalanceNature: string;
  movements: TreasuryMovement[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

export interface TreasuryDashboardSummary {
  currencySummaries: TreasuryDashboardCurrencySummary[];
  recentMovements: TreasuryMovement[];
}

export interface TreasuryDashboardCurrencySummary {
  currencyCode: string;
  totalCurrentBalance: number;
  cashboxBalance: number;
  bankAccountBalance: number;
  electronicWalletBalance: number;
  periodReceipts: number;
  periodPayments: number;
  accounts: TreasuryDashboardAccount[];
}

export interface TreasuryDashboardAccount {
  id: string;
  code: string;
  nameArabic: string;
  nameEnglish: string | null;
  accountType: string;
  accountTypeLabel: string;
  currencyCode: string;
  isActive: boolean;
  allowNegativeBalance: boolean;
  balance: number;
  balanceNature: string;
  rowVersion: string;
}

export interface TreasuryLookups {
  accountTypes: TreasuryLookupOption[];
  allocationTypes: TreasuryLookupOption[];
  movementTypes: TreasuryLookupOption[];
  documentStatuses: TreasuryLookupOption[];
  paymentMethods: TreasuryLookupOption[];
}

export interface TreasuryListParams {
  page?: number;
  pageSize?: number;
  search?: string;
  accountType?: string;
  isActive?: boolean;
  treasuryAccountId?: string;
  partyId?: string;
  status?: string;
  paymentMethod?: string;
  dateFrom?: string;
  dateTo?: string;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}

export interface TreasuryStatementParams {
  treasuryAccountId: string;
  dateFrom?: string;
  dateTo?: string;
  partyId?: string;
  referenceNumber?: string;
  page?: number;
  pageSize?: number;
  movementType?: string;
}
