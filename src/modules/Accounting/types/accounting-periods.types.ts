export type AccountingPeriodControlDto = {
  id: string;
  isEnabled: boolean;
  createdAtUtc: string;
  updatedAtUtc: string | null;
  rowVersion: string;
};

export type AccountingPeriodDto = {
  id: string;
  fiscalYearId: string;
  fiscalYearNameArabic: string;
  fiscalYearNameEnglish: string | null;
  periodNumber: number;
  nameArabic: string;
  nameEnglish: string | null;
  startDate: string;
  endDate: string;
  status: 'Open' | 'Closed';
  statusLabel: string;
  createdAtUtc: string;
  updatedAtUtc: string | null;
  rowVersion: string;
};

export type AccountingFiscalYearDto = {
  id: string;
  nameArabic: string;
  nameEnglish: string | null;
  startDate: string;
  endDate: string;
  openPeriodsCount: number;
  closedPeriodsCount: number;
  periods: AccountingPeriodDto[];
  createdAtUtc: string;
  updatedAtUtc: string | null;
  rowVersion: string;
};

export type AccountingFiscalYearInput = {
  nameArabic: string;
  nameEnglish: string | null;
  startDate: string;
  endDate: string;
  periodCount: number;
};

export type AccountingPeriodControlInput = {
  isEnabled: boolean;
  rowVersion: string;
};
