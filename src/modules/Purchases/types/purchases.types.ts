import type { InvoicePaymentMethod, InvoiceSettlementStatus } from 'shared/utils/invoiceSettlement';

export type ListMeta = {
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
};

export type PurchaseDocumentStatus = 'Draft' | 'Posted' | 'Cancelled';

export type PurchaseLineInput = {
  itemId: string;
  unitOfMeasureId: string;
  quantity: number;
  unitCost: number;
  discountAmount: number;
  taxAmount: number;
  notes?: string | null;
};

export type PurchaseInvoiceInput = {
  supplierId: string;
  invoiceDate: string;
  dueDate?: string | null;
  supplierInvoiceNumber?: string | null;
  headerDiscount: number;
  otherCosts: number;
  notes?: string | null;
  lines: PurchaseLineInput[];
  paymentMethod: InvoicePaymentMethod;
  treasuryAccountId?: string | null;
};

export type PurchaseReturnLineInput = {
  purchaseInvoiceLineId: string;
  quantity: number;
  notes?: string | null;
};

export type PurchaseReturnInput = {
  purchaseInvoiceId: string;
  returnDate: string;
  notes?: string | null;
  lines: PurchaseReturnLineInput[];
};

export type PurchaseLine = {
  id: string;
  lineNumber: number;
  itemId: string;
  itemCode: string;
  itemNameArabic: string;
  itemNameEnglish?: string | null;
  unitOfMeasureId: string;
  unitCode: string;
  conversionFactor: number;
  quantity: number;
  baseQuantity: number;
  unitCost: number;
  grossAmount: number;
  discountAmount: number;
  taxAmount: number;
  lineTotal: number;
  notes?: string | null;
};

export type PurchaseInvoice = {
  id: string;
  number: string;
  supplierId: string;
  supplierCode: string;
  supplierNameArabic: string;
  supplierNameEnglish?: string | null;
  invoiceDate: string;
  dueDate?: string | null;
  supplierInvoiceNumber?: string | null;
  status: PurchaseDocumentStatus;
  currencyCode: 'EGP';
  accountingJournalEntryId?: string | null;
  accountingEntryNumber?: string | null;
  isAccountingPosted: boolean;
  accountingPostingStatus: string;
  supplierControlAccountId?: string | null;
  supplierControlAccountCode?: string | null;
  supplierControlAccountArabicName?: string | null;
  inventoryAssetAccountId?: string | null;
  inventoryAssetAccountCode?: string | null;
  inventoryAssetAccountArabicName?: string | null;
  subtotal: number;
  lineDiscountTotal: number;
  headerDiscount: number;
  taxTotal: number;
  otherCosts: number;
  grandTotal: number;
  notes?: string | null;
  postedAtUtc?: string | null;
  cancelledAtUtc?: string | null;
  cancellationReason?: string | null;
  rowVersion: string;
  lines: PurchaseLine[];
  paymentMethod?: InvoicePaymentMethod;
  paymentMethodLabel?: string;
  settlementStatus?: InvoiceSettlementStatus;
  settlementStatusLabel?: string;
  treasuryAccountId?: string | null;
  treasuryAccountCode?: string | null;
  treasuryAccountNameArabic?: string | null;
};

export type PurchaseInvoiceListItem = {
  id: string;
  number: string;
  invoiceDate: string;
  dueDate?: string | null;
  supplierCode: string;
  supplierNameArabic: string;
  supplierNameEnglish?: string | null;
  supplierInvoiceNumber?: string | null;
  status: PurchaseDocumentStatus;
  grandTotal: number;
  currencyCode: 'EGP';
  accountingJournalEntryId?: string | null;
  accountingEntryNumber?: string | null;
  isAccountingPosted: boolean;
  accountingPostingStatus: string;
  rowVersion: string;
  paymentMethod?: InvoicePaymentMethod;
  paymentMethodLabel?: string;
  settlementStatus?: InvoiceSettlementStatus;
  settlementStatusLabel?: string;
  treasuryAccountId?: string | null;
  treasuryAccountCode?: string | null;
  treasuryAccountNameArabic?: string | null;
};

export type PurchaseReturn = {
  id: string;
  number: string;
  purchaseInvoiceId: string;
  purchaseInvoiceNumber: string;
  supplierId: string;
  supplierCode: string;
  supplierNameArabic: string;
  supplierNameEnglish?: string | null;
  returnDate: string;
  status: PurchaseDocumentStatus;
  currencyCode: 'EGP';
  accountingJournalEntryId?: string | null;
  accountingEntryNumber?: string | null;
  isAccountingPosted: boolean;
  accountingPostingStatus: string;
  supplierControlAccountId?: string | null;
  supplierControlAccountCode?: string | null;
  supplierControlAccountArabicName?: string | null;
  inventoryAssetAccountId?: string | null;
  inventoryAssetAccountCode?: string | null;
  inventoryAssetAccountArabicName?: string | null;
  subtotal: number;
  discountTotal: number;
  taxTotal: number;
  grandTotal: number;
  notes?: string | null;
  postedAtUtc?: string | null;
  cancelledAtUtc?: string | null;
  cancellationReason?: string | null;
  rowVersion: string;
  lines: PurchaseLine[];
};

export type PurchaseReturnListItem = {
  id: string;
  number: string;
  returnDate: string;
  purchaseInvoiceNumber: string;
  supplierCode: string;
  supplierNameArabic: string;
  supplierNameEnglish?: string | null;
  status: PurchaseDocumentStatus;
  grandTotal: number;
  currencyCode: 'EGP';
  accountingJournalEntryId?: string | null;
  accountingEntryNumber?: string | null;
  isAccountingPosted: boolean;
  accountingPostingStatus: string;
  rowVersion: string;
};

export type PurchaseListParams = {
  page?: number;
  pageSize?: number;
  search?: string;
  supplierId?: string;
  purchaseInvoiceId?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
};
