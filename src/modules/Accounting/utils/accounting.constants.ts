export const ACCOUNTING_PERMISSIONS = {
  view: 'accounting.view',
  accountsView: 'accounting.accounts.view',
  accountsCreate: 'accounting.accounts.create',
  accountsUpdate: 'accounting.accounts.update',
  accountsActivate: 'accounting.accounts.activate',
  accountsDeactivate: 'accounting.accounts.deactivate',
  accountsDelete: 'accounting.accounts.delete',
  settingsView: 'accounting.settings.view',
  settingsUpdate: 'accounting.settings.update',
  periodsView: 'accounting.periods.view',
  periodsManage: 'accounting.periods.manage',
  periodsReopen: 'accounting.periods.reopen',
  reportsView: 'accounting.reports.view',
  journalEntriesView: 'accounting.journal-entries.view',
  journalEntriesCreate: 'accounting.journal-entries.create',
  journalEntriesUpdate: 'accounting.journal-entries.update',
  journalEntriesPost: 'accounting.journal-entries.post',
  journalEntriesCancel: 'accounting.journal-entries.cancel',
  journalEntriesDelete: 'accounting.journal-entries.delete'
} as const;

export const ACCOUNTING_MAX_PAGE_SIZE = 100;
export const ACCOUNTING_PARENT_LOOKUP_PAGE_SIZE = 50;

export const ACCOUNTING_VIEW_PERMISSIONS = [
  ACCOUNTING_PERMISSIONS.view,
  ACCOUNTING_PERMISSIONS.accountsView,
  ACCOUNTING_PERMISSIONS.settingsView,
  ACCOUNTING_PERMISSIONS.periodsView,
  ACCOUNTING_PERMISSIONS.reportsView,
  ACCOUNTING_PERMISSIONS.journalEntriesView
] as const;

export const ACCOUNTING_ACCOUNT_TYPES = {
  ASSET: 'Asset',
  LIABILITY: 'Liability',
  EQUITY: 'Equity',
  REVENUE: 'Revenue',
  EXPENSE: 'Expense'
} as const;

export const ACCOUNTING_ACCOUNT_TYPE_ORDER = [
  ACCOUNTING_ACCOUNT_TYPES.ASSET,
  ACCOUNTING_ACCOUNT_TYPES.LIABILITY,
  ACCOUNTING_ACCOUNT_TYPES.EQUITY,
  ACCOUNTING_ACCOUNT_TYPES.REVENUE,
  ACCOUNTING_ACCOUNT_TYPES.EXPENSE
] as const;

export const ACCOUNTING_NORMAL_BALANCE = {
  DEBIT: 'Debit',
  CREDIT: 'Credit'
} as const;

export const CASH_FLOW_ACTIVITY_TYPES = {
  OPERATING: 'Operating',
  INVESTING: 'Investing',
  FINANCING: 'Financing',
  EXCLUDED: 'Excluded',
  UNCLASSIFIED: 'Unclassified'
} as const;

export const CASH_FLOW_ACTIVITY_TYPE_ORDER = [
  CASH_FLOW_ACTIVITY_TYPES.OPERATING,
  CASH_FLOW_ACTIVITY_TYPES.INVESTING,
  CASH_FLOW_ACTIVITY_TYPES.FINANCING,
  CASH_FLOW_ACTIVITY_TYPES.EXCLUDED,
  CASH_FLOW_ACTIVITY_TYPES.UNCLASSIFIED
] as const;
