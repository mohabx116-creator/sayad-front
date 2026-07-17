export type AccountingSettingMappingDto = {
  id: string | null;
  mappingKey: string;
  accountId: string | null;
  accountCode: string | null;
  accountNameArabic: string | null;
  accountNameEnglish: string | null;
  accountType: string | null;
  accountTypeLabel: string | null;
  rowVersion: string | null;
};

export type AccountingSettingMappingInput = {
  mappingKey: string;
  accountId: string | null;
  rowVersion: string | null;
};
