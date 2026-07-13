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
  referenceNumber: string | null;
  descriptionArabic: string;
  descriptionEnglish: string | null;
  debitAmount: number;
  creditAmount: number;
  runningBalance: number;
  runningBalanceNature: string;
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

export type OpeningBalanceRequest = {
  entryDate: string;
  amount: number;
  balanceNature: 'Debit' | 'Credit' | '';
  notes?: string | null;
};
