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
  supplierInvoiceNumber?: string | null;
  headerDiscount: number;
  otherCosts: number;
  notes?: string | null;
  lines: PurchaseLineInput[];
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
  supplierInvoiceNumber?: string | null;
  status: PurchaseDocumentStatus;
  currencyCode: 'EGP';
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
};

export type PurchaseInvoiceListItem = {
  id: string;
  number: string;
  invoiceDate: string;
  supplierCode: string;
  supplierNameArabic: string;
  supplierNameEnglish?: string | null;
  supplierInvoiceNumber?: string | null;
  status: PurchaseDocumentStatus;
  grandTotal: number;
  currencyCode: 'EGP';
  rowVersion: string;
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
