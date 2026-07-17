export type AccountingAccountType =
  | 'Asset'
  | 'Liability'
  | 'Equity'
  | 'Revenue'
  | 'Expense';

export type AccountingAccountLookupDto = {
  id: string;
  code: string;
  nameArabic: string;
  nameEnglish: string | null;
  accountType: AccountingAccountType;
  accountTypeLabel: string;
  isPosting: boolean;
  isSystem: boolean;
};

export type AccountingAccountChildDto = {
  id: string;
  code: string;
  nameArabic: string;
  nameEnglish: string | null;
  accountType: AccountingAccountType;
  accountTypeLabel: string;
  normalBalance: 'Debit' | 'Credit';
  normalBalanceLabel: string;
  isPosting: boolean;
  isActive: boolean;
  isSystem: boolean;
};

export type AccountingAccountTreeNodeDto = {
  id: string;
  code: string;
  nameArabic: string;
  nameEnglish: string | null;
  accountType: AccountingAccountType;
  accountTypeLabel: string;
  normalBalance: 'Debit' | 'Credit';
  normalBalanceLabel: string;
  parentId: string | null;
  isPosting: boolean;
  isActive: boolean;
  isSystem: boolean;
  description: string | null;
  hierarchyPath: string | null;
  rowVersion: string;
  children: AccountingAccountTreeNodeDto[];
};

export type AccountingAccountDto = {
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
  parentNameEnglish: string | null;
  isPosting: boolean;
  isActive: boolean;
  isSystem: boolean;
  description: string | null;
  hierarchyPath: string | null;
  treasuryAccountId: string | null;
  treasuryAccountCode: string | null;
  treasuryAccountArabicName: string | null;
  directChildren: AccountingAccountChildDto[];
  createdAtUtc: string;
  updatedAtUtc: string | null;
  rowVersion: string;
};

export type AccountingAccountListItemDto = {
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
  isPosting: boolean;
  isActive: boolean;
  isSystem: boolean;
  description: string | null;
  rowVersion: string;
};

export type AccountingAccountFormValues = {
  code: string;
  nameArabic: string;
  nameEnglish?: string;
  accountType: AccountingAccountType;
  parentId?: string;
  isPosting: boolean;
  isActive: boolean;
  isSystem: boolean;
  description?: string;
  rowVersion?: string;
};

export type AccountingAccountInput = {
  code: string;
  nameArabic: string;
  nameEnglish: string | null;
  accountType: AccountingAccountType;
  parentId: string | null;
  isPosting: boolean;
  isActive: boolean;
  isSystem: boolean;
  description: string | null;
};

export type AccountingAccountListParams = {
  page?: number;
  pageSize?: number;
  search?: string;
  accountType?: string;
  isActive?: boolean;
  isPosting?: boolean;
  parentId?: string;
  rootOnly?: boolean;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
};

export type AccountingAccountTreeParams = {
  search?: string;
  accountType?: string;
  isActive?: boolean;
  isPosting?: boolean;
  rootOnly?: boolean;
};

export type AccountingAccountParentLookupParams = {
  page?: number;
  pageSize?: number;
  search?: string;
  accountType?: string;
  excludeId?: string;
};

export type AccountingPagedMeta = {
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
};
