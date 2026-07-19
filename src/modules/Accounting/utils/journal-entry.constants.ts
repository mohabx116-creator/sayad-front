import { ACCOUNTING_PERMISSIONS } from './accounting.constants';

export const JOURNAL_ENTRY_STATUSES = {
  DRAFT: 'Draft',
  POSTED: 'Posted',
  CANCELLED: 'Cancelled'
} as const;

export const JOURNAL_ENTRY_SOURCE_TYPES = {
  MANUAL: 'Manual',
  REVERSAL: 'Reversal',
  TREASURY_RECEIPT: 'TreasuryReceipt',
  TREASURY_PAYMENT: 'TreasuryPayment',
  TREASURY_TRANSFER: 'TreasuryTransfer',
  EXPENSE: 'Expense',
  SALES_INVOICE: 'SalesInvoice',
  SALES_RETURN: 'SalesReturn',
  PURCHASE_INVOICE: 'PurchaseInvoice',
  PURCHASE_RETURN: 'PurchaseReturn',
  INVENTORY_MOVEMENT: 'InventoryMovement',
  FISCAL_YEAR_CLOSING: 'FiscalYearClosing'
} as const;

export const JOURNAL_ENTRY_PERMISSIONS = {
  view: ACCOUNTING_PERMISSIONS.journalEntriesView,
  create: ACCOUNTING_PERMISSIONS.journalEntriesCreate,
  update: ACCOUNTING_PERMISSIONS.journalEntriesUpdate,
  post: ACCOUNTING_PERMISSIONS.journalEntriesPost,
  cancel: ACCOUNTING_PERMISSIONS.journalEntriesCancel,
  delete: ACCOUNTING_PERMISSIONS.journalEntriesDelete
} as const;

export const JOURNAL_ENTRY_ACCOUNT_LOOKUP_PAGE_SIZE = 100;
