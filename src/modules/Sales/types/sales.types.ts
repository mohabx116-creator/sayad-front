export type ListMeta = {
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
};

export type SalesDocumentStatus = 'Draft' | 'Posted' | 'Cancelled';

export type SalesLineInput = {
  itemId: string;
  unitOfMeasureId: string;
  quantity: number;
  unitPrice: number;
  discountAmount: number;
  taxAmount: number;
  notes?: string | null;
};

export type SalesInvoiceInput = {
  customerId: string;
  invoiceDate: string;
  customerReferenceNumber?: string | null;
  headerDiscount: number;
  otherCharges: number;
  notes?: string | null;
  lines: SalesLineInput[];
};

export type SalesReturnLineInput = {
  salesInvoiceLineId: string;
  quantity: number;
  notes?: string | null;
};



export type SalesReturnableLine = {
  salesInvoiceLineId: string;
  itemId: string;
  itemCode: string;
  itemNameArabic: string;
  itemNameEnglish?: string | null;
  unitOfMeasureId: string;
  unitCode: string;
  conversionFactor: number;
  soldQuantity: number;
  returnedQuantity: number;
  returnableQuantity: number;
  unitPrice: number;
  discountPerUnit: number;
  taxPerUnit: number;
};

export type SalesReturnInput = {
  salesInvoiceId: string;
  returnDate: string;
  notes?: string | null;
  lines: SalesReturnLineInput[];
};

export type SalesLine = {
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
  unitPrice: number;
  grossAmount: number;
  discountAmount: number;
  taxAmount: number;
  lineTotal: number;
  notes?: string | null;
};



export type SalesReturnLine = SalesLine & {
  salesInvoiceLineId: string;
};

export type SalesInvoice = {
  id: string;
  number: string;
  customerId: string;
  customerCode: string;
  customerNameArabic: string;
  customerNameEnglish?: string | null;
  invoiceDate: string;
  customerReferenceNumber?: string | null;
  status: SalesDocumentStatus;
  currencyCode: 'EGP';
  subtotal: number;
  lineDiscountTotal: number;
  headerDiscount: number;
  taxTotal: number;
  otherCharges: number;
  grandTotal: number;
  notes?: string | null;
  postedAtUtc?: string | null;
  cancelledAtUtc?: string | null;
  cancellationReason?: string | null;
  rowVersion: string;
  lines: SalesLine[];
};

export type SalesInvoiceListItem = {
  id: string;
  number: string;
  invoiceDate: string;
  customerCode: string;
  customerNameArabic: string;
  customerNameEnglish?: string | null;
  customerReferenceNumber?: string | null;
  status: SalesDocumentStatus;
  grandTotal: number;
  currencyCode: 'EGP';
  rowVersion: string;
};

export type SalesReturn = {
  id: string;
  number: string;
  salesInvoiceId: string;
  salesInvoiceNumber: string;
  customerId: string;
  customerCode: string;
  customerNameArabic: string;
  customerNameEnglish?: string | null;
  returnDate: string;
  status: SalesDocumentStatus;
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
  lines: SalesReturnLine[];
};

export type SalesReturnListItem = {
  id: string;
  number: string;
  returnDate: string;
  salesInvoiceNumber: string;
  customerCode: string;
  customerNameArabic: string;
  customerNameEnglish?: string | null;
  status: SalesDocumentStatus;
  grandTotal: number;
  currencyCode: 'EGP';
  rowVersion: string;
};

export type SalesListParams = {
  page?: number;
  pageSize?: number;
  search?: string;
  customerId?: string;
  salesInvoiceId?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
};
