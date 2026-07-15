export interface TreasuryLookupOption {
  value: string;
  labelArabic: string;
  labelEnglish: string;
}

export interface TreasuryEligibleInvoice {
  invoiceId: string;
  invoiceNumber: string;
  invoiceDate: string;
  grandTotal: number;
  allocatedAmount: number;
  outstandingAmount: number;
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
  openingBalance: number;
  openingBalanceNature: string;
  hasNonOpeningMovements: boolean;
  debitTotal: number;
  creditTotal: number;
  balance: number;
  balanceNature: string;
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
  openingBalance: number;
  debitTotal: number;
  creditTotal: number;
  balance: number;
  balanceNature: string;
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

export interface TreasuryReceipt {
  id: string;
  number: string;
  treasuryAccountId: string;
  treasuryAccountCode: string;
  treasuryAccountNameArabic: string;
  partyId: string;
  partyCode: string;
  partyNameArabic: string;
  partyNameEnglish: string | null;
  receiptDate: string;
  relatedDocumentNumber: string | null;
  reason: string | null;
  status: string;
  currencyCode: string;
  totalAmount: number;
  notes: string | null;
  postedAtUtc: string | null;
  cancelledAtUtc: string | null;
  cancellationReason: string | null;
  rowVersion: string;
  allocations: TreasuryAllocation[];
}

export interface TreasuryReceiptListItem {
  id: string;
  number: string;
  receiptDate: string;
  treasuryAccountCode: string;
  treasuryAccountNameArabic: string;
  partyCode: string;
  partyNameArabic: string;
  status: string;
  totalAmount: number;
  currencyCode: string;
  rowVersion: string;
}

export interface TreasuryReceiptInput {
  treasuryAccountId: string;
  partyId: string;
  receiptDate: string;
  relatedDocumentNumber: string | null;
  reason: string | null;
  notes: string | null;
  allocations: TreasuryAllocationInput[];
}

export interface TreasuryPayment {
  id: string;
  number: string;
  treasuryAccountId: string;
  treasuryAccountCode: string;
  treasuryAccountNameArabic: string;
  partyId: string;
  partyCode: string;
  partyNameArabic: string;
  partyNameEnglish: string | null;
  paymentDate: string;
  relatedDocumentNumber: string | null;
  reason: string | null;
  sourceDocumentType: string | null;
  sourceDocumentId: string | null;
  sourceDocumentNumber: string | null;
  status: string;
  currencyCode: string;
  totalAmount: number;
  notes: string | null;
  postedAtUtc: string | null;
  cancelledAtUtc: string | null;
  cancellationReason: string | null;
  rowVersion: string;
  allocations: TreasuryAllocation[];
}

export interface TreasuryPaymentListItem {
  id: string;
  number: string;
  paymentDate: string;
  treasuryAccountCode: string;
  treasuryAccountNameArabic: string;
  partyCode: string;
  partyNameArabic: string;
  status: string;
  totalAmount: number;
  currencyCode: string;
  rowVersion: string;
}

export interface TreasuryPaymentInput {
  treasuryAccountId: string;
  partyId: string;
  paymentDate: string;
  relatedDocumentNumber: string | null;
  reason: string | null;
  notes: string | null;
  allocations: TreasuryAllocationInput[];
}

export interface TreasuryTransfer {
  id: string;
  number: string;
  fromAccountId: string;
  fromAccountCode: string;
  fromAccountNameArabic: string;
  toAccountId: string;
  toAccountCode: string;
  toAccountNameArabic: string;
  transferDate: string;
  status: string;
  currencyCode: string;
  amount: number;
  notes: string | null;
  postedAtUtc: string | null;
  cancelledAtUtc: string | null;
  cancellationReason: string | null;
  rowVersion: string;
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
  rowVersion: string;
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
  referenceNumber: string | null;
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
  totalCurrentBalance: number;
  cashboxBalance: number;
  bankAccountBalance: number;
  electronicWalletBalance: number;
  periodReceipts: number;
  periodPayments: number;
  recentMovements: TreasuryMovement[];
}

export interface TreasuryLookups {
  accountTypes: TreasuryLookupOption[];
  allocationTypes: TreasuryLookupOption[];
  movementTypes: TreasuryLookupOption[];
  documentStatuses: TreasuryLookupOption[];
}

export interface TreasuryListParams {
  page?: number;
  pageSize?: number;
  search?: string;
  accountType?: string;
  treasuryAccountId?: string;
  partyId?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}

export interface TreasuryStatementParams {
  treasuryAccountId: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  pageSize?: number;
  movementType?: string;
}
