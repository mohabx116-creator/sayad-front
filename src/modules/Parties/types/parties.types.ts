export type PartyDto = {
  id: string;
  code: string;
  nameArabic: string;
  nameEnglish: string | null;
  partyType: string;
  partyTypeLabel: string;
  isCustomer: boolean;
  isSupplier: boolean;
  primaryPhone: string | null;
  secondaryPhone: string | null;
  email: string | null;
  address: string | null;
  notes: string | null;
  isActive: boolean;
  debitTotal: number;
  creditTotal: number;
  balance: number;
  balanceNature: string;
  createdAtUtc: string;
  updatedAtUtc: string | null;
  rowVersion: string;
};

export type PartyLedgerEntryDto = {
  id: string;
  entryDate: string;
  entryType: string;
  referenceType: string;
  referenceId: string | null;
  referenceNumber: string | null;
  descriptionArabic: string;
  descriptionEnglish: string | null;
  debitAmount: number;
  creditAmount: number;
  runningBalance: number;
  runningBalanceNature: string;
};

export type PartyAdjustmentType =
  | 'CustomerDiscount'
  | 'CustomerDebitAdjustment'
  | 'SupplierDiscount'
  | 'SupplierCreditAdjustment';

export type PartyAdjustmentStatus = 'Posted' | 'Reversed';

export type PartyAdjustmentDto = {
  adjustmentId: string;
  number: string;
  partyId: string;
  adjustmentType: PartyAdjustmentType;
  direction: 'Debit' | 'Credit';
  entryDate: string;
  amount: number;
  descriptionArabic: string;
  descriptionEnglish: string | null;
  referenceNumber: string | null;
  status: PartyAdjustmentStatus;
  partyLedgerEntryId: string | null;
  journalEntryId: string | null;
  reversedAtUtc: string | null;
  reversalAdjustmentId: string | null;
  rowVersion: string;
};

export type CreatePartyAdjustmentRequest = {
  partyId: string;
  adjustmentType: PartyAdjustmentType;
  entryDate: string;
  amount: number;
  descriptionArabic: string;
  descriptionEnglish?: string | null;
  referenceNumber?: string | null;
};

export type ReversePartyAdjustmentRequest = {
  reversalReason: string;
  rowVersion: string;
};

export type OpeningBalanceDto = {
  entryId: string | null;
  entryDate: string | null;
  amount: number;
  balanceNature: string;
  notes: string | null;
};

export type PartyStatementDto = {
  partyId: string;
  partyCode: string;
  partyNameArabic: string;
  partyNameEnglish: string | null;
  openingBalance: OpeningBalanceDto;
  broughtForwardBalance: number;
  broughtForwardNature: string;
  debitTotal: number;
  creditTotal: number;
  closingBalance: number;
  closingBalanceNature: string;
  entries: PartyLedgerEntryDto[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
};

export type PartyDeletionPreview = {
  id: string;
  code: string;
  nameArabic: string;
  nameEnglish: string | null;
  isCustomer: boolean;
  isSupplier: boolean;
  salesInvoiceCount: number;
  salesInvoiceLineCount: number;
  purchaseInvoiceCount: number;
  purchaseInvoiceLineCount: number;
  salesReturnCount: number;
  salesReturnLineCount: number;
  purchaseReturnCount: number;
  purchaseReturnLineCount: number;
  treasuryReceiptCount: number;
  treasuryPaymentCount: number;
  treasuryMovementCount: number;
  treasuryReceiptAllocationCount: number;
  treasuryPaymentAllocationCount: number;
  expenseCount: number;
  partyLedgerEntryCount: number;
  openingBalanceCount: number;
  partyItemRelationCount: number;
  inventoryMovementCount: number;
  addressCount: number;
  contactCount: number;
  currentBalance: number;
  currentBalanceNature: string;
  canDelete: boolean;
  rowVersion: string;
  previewToken: string;
  previewTokenExpiresAtUtc: string;
};

export type ListMeta = {
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
};

export type CreatePartyRequest = {
  nameArabic: string;
  nameEnglish?: string | null;
  isCustomer: boolean;
  isSupplier: boolean;
  primaryPhone?: string | null;
  secondaryPhone?: string | null;
  email?: string | null;
  address?: string | null;
  notes?: string | null;
  openingBalance?: OpeningBalanceRequest | null;
};

export type UpdatePartyRequest = {
  nameArabic: string;
  nameEnglish?: string | null;
  isCustomer: boolean;
  isSupplier: boolean;
  primaryPhone?: string | null;
  secondaryPhone?: string | null;
  email?: string | null;
  address?: string | null;
  notes?: string | null;
  rowVersion: string;
};

export type PartyImportValidationErrorDto = {
  rowNumber: number;
  field: string;
  code: string;
  message: string;
};

export type PartyImportPreviewRowDto = {
  rowNumber: number;
  nameArabic?: string | null;
  nameEnglish?: string | null;
  partyType?: string | null;
  primaryPhone?: string | null;
  secondaryPhone?: string | null;
  email?: string | null;
  address?: string | null;
  notes?: string | null;
  errors: PartyImportValidationErrorDto[];
  isValid: boolean;
};

export type PartyImportPreviewResultDto = {
  rows: PartyImportPreviewRowDto[];
  totalRows: number;
  validRows: number;
  failedRows: number;
};

export type PartyImportCommitRequest = {
  rows: PartyImportPreviewRowDto[];
};

export type PartyImportCommitResultDto = {
  totalRows: number;
  importedRows: number;
  failedRows: number;
};

export type OpeningBalanceRequest = {
  entryDate: string;
  amount: number;
  balanceNature: 'Debit' | 'Credit' | '';
  notes?: string | null;
};

export type PartyCashTransactionRequest = {
  treasuryAccountId: string;
  transactionDate: string;
  amount: number;
  notes?: string | null;
};

export type CorrectOpeningBalanceRequest = {
  entryDate: string;
  amount: number;
  balanceNature: 'Debit' | 'Credit' | '';
  reason: string;
  expectedOpeningBalanceEntryId: string;
};

export type PartyFinalDeleteRequest = {
  code: string;
  reason: string;
  rowVersion: string;
  previewToken: string;
  ownerPassword: string;
};

export type PartyStatementParams = {
  fromDate?: string;
  toDate?: string;
  page?: number;
  pageSize?: number;
  entryType?: string;
};
