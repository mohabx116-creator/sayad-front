export const ACCOUNTING_SETTING_MAPPINGS = [
  { key: 'CustomerControl', labelArabic: 'ط­ط³ط§ط¨ طھط­ظƒظ… ط§ظ„ط¹ظ…ظ„ط§ط،', labelEnglish: 'Customer control' },
  { key: 'SupplierControl', labelArabic: 'ط­ط³ط§ط¨ طھط­ظƒظ… ط§ظ„ظ…ظˆط±ط¯ظٹظ†', labelEnglish: 'Supplier control' },
  { key: 'SalesRevenue', labelArabic: 'ط­ط³ط§ط¨ ط¥ظٹط±ط§ط¯ ط§ظ„ظ…ط¨ظٹط¹ط§طھ', labelEnglish: 'Sales revenue' },
  { key: 'SalesReturns', labelArabic: 'ط­ط³ط§ط¨ ظ…ط±طھط¬ط¹ط§طھ ط§ظ„ظ…ط¨ظٹط¹ط§طھ', labelEnglish: 'Sales returns' },
  { key: 'InventoryAsset', labelArabic: 'ط­ط³ط§ط¨ ظ…ط®ط²ظˆظ† ط§ظ„ط£طµظ†ط§ظپ', labelEnglish: 'Inventory asset' },
  { key: 'OpeningBalanceEquity', labelArabic: 'حساب رأس المال المفتتح', labelEnglish: 'Opening balance equity' },
  { key: 'CostOfGoodsSold', labelArabic: 'ط­ط³ط§ط¨ طھظƒظ„ظپط© ط§ظ„ط¨ط¶ط§ط¹ط© ط§ظ„ظ…ط¨ط§ط¹ط©', labelEnglish: 'Cost of goods sold' }
] as const;

export type AccountingSettingMappingKey = (typeof ACCOUNTING_SETTING_MAPPINGS)[number]['key'];
