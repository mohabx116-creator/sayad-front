export const TREASURY_PERMISSIONS = {
  view: 'Treasury.View',
  accountsView: 'Treasury.Accounts.View',
  accountsCreate: 'Treasury.Accounts.Create',
  accountsUpdate: 'Treasury.Accounts.Update',
  accountsActivate: 'Treasury.Accounts.Activate',
  accountsDeactivate: 'Treasury.Accounts.Deactivate',
  receiptsView: 'Treasury.Receipts.View',
  receiptsCreate: 'Treasury.Receipts.Create',
  receiptsUpdate: 'Treasury.Receipts.Update',
  receiptsPost: 'Treasury.Receipts.Post',
  receiptsCancel: 'Treasury.Receipts.Cancel',
  paymentsView: 'Treasury.Payments.View',
  paymentsCreate: 'Treasury.Payments.Create',
  paymentsUpdate: 'Treasury.Payments.Update',
  paymentsPost: 'Treasury.Payments.Post',
  paymentsCancel: 'Treasury.Payments.Cancel',
  transfersView: 'Treasury.Transfers.View',
  transfersCreate: 'Treasury.Transfers.Create',
  transfersUpdate: 'Treasury.Transfers.Update',
  transfersPost: 'Treasury.Transfers.Post',
  transfersCancel: 'Treasury.Transfers.Cancel',
  statementsView: 'Treasury.Statements.View',
  lookupsView: 'Treasury.Lookups.View'
};

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
