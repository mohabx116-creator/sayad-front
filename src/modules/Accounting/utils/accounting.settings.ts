export const ACCOUNTING_SETTING_MAPPINGS = [
  { key: 'CustomerControl', labelArabic: 'حساب ضبط العملاء', labelEnglish: 'Customer control' },
  { key: 'SupplierControl', labelArabic: 'حساب ضبط الموردين', labelEnglish: 'Supplier control' },
  { key: 'SalesRevenue', labelArabic: 'حساب إيراد المبيعات', labelEnglish: 'Sales revenue' },
  { key: 'SalesReturns', labelArabic: 'حساب مرتجعات المبيعات', labelEnglish: 'Sales returns' },
  { key: 'InventoryAsset', labelArabic: 'حساب مخزون الأصناف', labelEnglish: 'Inventory asset' },
  { key: 'OpeningBalanceEquity', labelArabic: 'حساب رأس المال المفتتح', labelEnglish: 'Opening balance equity' },
  { key: 'RetainedEarnings', labelArabic: 'حساب الأرباح المحتجزة', labelEnglish: 'Retained earnings' },
  { key: 'CostOfGoodsSold', labelArabic: 'حساب تكلفة البضاعة المباعة', labelEnglish: 'Cost of goods sold' },
  { key: 'PayrollExpense', labelArabic: 'حساب مصروف الرواتب والأجور', labelEnglish: 'Payroll and wages expense' }
] as const;

export type AccountingSettingMappingKey = (typeof ACCOUNTING_SETTING_MAPPINGS)[number]['key'];
