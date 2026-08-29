export type ExpenseStatus = 'Draft' | 'Posted' | 'Cancelled';

export interface ExpenseCategoryDto {
  id: string;
  code: string;
  nameArabic: string;
  nameEnglish?: string | null;
  description?: string | null;
  displayOrder: number;
  isActive: boolean;
  accountingAccountId?: string | null;
  accountingAccountCode?: string | null;
  accountingAccountArabicName?: string | null;
  rowVersion: string;
}

export interface ExpenseCategoryInput {
  code: string;
  nameArabic: string;
  nameEnglish?: string | null;
  description?: string | null;
  displayOrder: number;
  accountingAccountId?: string | null;
}

export interface ExpensePaymentSummaryDto {
  id: string;
  number: string;
  status: string;
  totalAmount: number;
  postedAtUtc?: string | null;
  cancelledAtUtc?: string | null;
  sourceDocumentType?: string | null;
  sourceDocumentId?: string | null;
  sourceDocumentNumber?: string | null;
  treasuryAccountCode: string;
  treasuryAccountNameArabic: string;
  treasuryAccountNameEnglish?: string | null;
  partyId: string;
  partyCode: string;
  partyNameArabic: string;
  partyNameEnglish?: string | null;
  displayNumber?: string | null;
  sourceDocumentDisplayNumber?: string | null;
}

export interface ExpenseListItemDto {
  id: string;
  expenseNumber: string;
  expenseDate: string;
  expenseCategoryId: string;
  expenseCategoryCode: string;
  expenseCategoryNameArabic: string;
  expenseCategoryNameEnglish?: string | null;
  treasuryAccountId: string;
  treasuryAccountCode: string;
  treasuryAccountNameArabic: string;
  treasuryAccountNameEnglish?: string | null;
  beneficiaryPartyId?: string | null;
  beneficiaryPartyCode?: string | null;
  beneficiaryPartyNameArabic?: string | null;
  beneficiaryPartyNameEnglish?: string | null;
  amount: number;
  status: ExpenseStatus;
  referenceNumber?: string | null;
  paidToName?: string | null;
  notes?: string | null;
  treasuryPaymentId?: string | null;
  isAccountingPosted: boolean;
  accountingPostingStatus: string;
  createdAtUtc: string;
  rowVersion: string;
  displayNumber?: string | null;
}

export interface ExpenseDto {
  id: string;
  expenseNumber: string;
  expenseCategoryId: string;
  expenseCategoryCode: string;
  expenseCategoryNameArabic: string;
  expenseCategoryNameEnglish?: string | null;
  treasuryAccountId: string;
  treasuryAccountCode: string;
  treasuryAccountNameArabic: string;
  treasuryAccountNameEnglish?: string | null;
  beneficiaryPartyId?: string | null;
  beneficiaryPartyCode?: string | null;
  beneficiaryPartyNameArabic?: string | null;
  beneficiaryPartyNameEnglish?: string | null;
  expenseDate: string;
  amount: number;
  status: ExpenseStatus;
  referenceNumber?: string | null;
  paidToName?: string | null;
  notes?: string | null;
  treasuryPaymentId?: string | null;
  treasuryPayment?: ExpensePaymentSummaryDto | null;
  expenseCategoryAccountingAccountId?: string | null;
  expenseCategoryAccountingAccountCode?: string | null;
  expenseCategoryAccountingAccountArabicName?: string | null;
  treasuryAccountAccountingAccountId?: string | null;
  treasuryAccountAccountingAccountCode?: string | null;
  treasuryAccountAccountingAccountArabicName?: string | null;
  accountingJournalEntryId?: string | null;
  accountingEntryNumber?: string | null;
  isAccountingPosted: boolean;
  accountingPostingStatus: string;
  createdAtUtc: string;
  updatedAtUtc?: string | null;
  postedAtUtc?: string | null;
  postedBy?: string | null;
  cancelledAtUtc?: string | null;
  cancelledBy?: string | null;
  cancellationReason?: string | null;
  canEdit: boolean;
  canPost: boolean;
  canCancel: boolean;
  rowVersion: string;
  displayNumber?: string | null;
}

export interface ExpenseInput {
  expenseCategoryId: string;
  treasuryAccountId: string;
  beneficiaryPartyId?: string | null;
  paidToName?: string | null;
  expenseDate: string;
  amount: number;
  referenceNumber?: string | null;
  notes?: string | null;
}

export interface ExpensesListParams {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  expenseCategoryId?: string;
  treasuryAccountId?: string;
  beneficiaryPartyId?: string;
}

export interface ExpenseCategoriesListParams {
  page?: number;
  pageSize?: number;
  search?: string;
  isActive?: boolean | string;
}
