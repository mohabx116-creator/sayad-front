export const TREASURY_PERMISSIONS = {
  view: 'treasury.view',
  accountsView: 'treasury.accounts.view',
  accountsCreate: 'treasury.accounts.create',
  accountsUpdate: 'treasury.accounts.update',
  accountsActivate: 'treasury.accounts.activate',
  accountsDeactivate: 'treasury.accounts.deactivate',
  receiptsView: 'treasury.receipts.view',
  receiptsCreate: 'treasury.receipts.create',
  receiptsUpdate: 'treasury.receipts.update',
  receiptsPost: 'treasury.receipts.post',
  receiptsCancel: 'treasury.receipts.cancel',
  paymentsView: 'treasury.payments.view',
  paymentsCreate: 'treasury.payments.create',
  paymentsUpdate: 'treasury.payments.update',
  paymentsPost: 'treasury.payments.post',
  paymentsCancel: 'treasury.payments.cancel',
  transfersView: 'treasury.transfers.view',
  transfersCreate: 'treasury.transfers.create',
  transfersUpdate: 'treasury.transfers.update',
  transfersPost: 'treasury.transfers.post',
  transfersCancel: 'treasury.transfers.cancel',
  statementsView: 'treasury.statements.view',
  lookupsView: 'treasury.lookups.view'
} as const;

export const TREASURY_MAX_PAGE_SIZE = 100;
export const TREASURY_LOOKUP_PAGE_SIZE = 100;

export const TREASURY_VIEW_PERMISSIONS = [
  TREASURY_PERMISSIONS.view,
  TREASURY_PERMISSIONS.accountsView,
  TREASURY_PERMISSIONS.statementsView
] as const;

export const TREASURY_DOCUMENT_STATUS = {
  DRAFT: 'Draft',
  POSTED: 'Posted',
  CANCELLED: 'Cancelled'
} as const;

export const TREASURY_ACCOUNT_TYPES = {
  CASH: 'Cash',
  BANK: 'Bank',
  PETTY_CASH: 'PettyCash',
  DIGITAL_WALLET: 'DigitalWallet',
  OTHER: 'Other'
} as const;

export const TREASURY_ALLOCATION_TYPES = {
  INVOICE_SETTLEMENT: 'InvoiceSettlement',
  ADVANCE: 'Advance',
  REFUND: 'Refund',
  OTHER: 'Other'
} as const;

export const TREASURY_PAYMENT_METHODS = {
  CASH: 'Cash',
  BANK_TRANSFER: 'BankTransfer',
  CARD: 'Card',
  CHEQUE: 'Cheque',
  ELECTRONIC_WALLET: 'ElectronicWallet',
  OTHER: 'Other'
} as const;

export const RECEIPT_PURPOSES = [
  'تحصيل عميل',
  'استرداد من مورد',
  'تمويل أو رأس مال',
  'قبض آخر'
];

export const PAYMENT_PURPOSES = [
  'دفع مورد',
  'رد مبلغ لعميل',
  'صرف آخر'
];
