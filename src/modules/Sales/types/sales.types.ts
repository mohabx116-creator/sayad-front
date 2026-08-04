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
  dueDate?: string | null;
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
  dueDate?: string | null;
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
  accountingJournalEntryId?: string | null;
  accountingEntryNumber?: string | null;
  isAccountingPosted?: boolean;
  accountingPostingStatus?: string;
  customerControlAccountId?: string | null;
  customerControlAccountCode?: string | null;
  customerControlAccountNameArabic?: string | null;
  revenueOrReturnAccountId?: string | null;
  revenueOrReturnAccountCode?: string | null;
  revenueOrReturnAccountNameArabic?: string | null;
  inventoryCostAccountingStatus?: string | null;
  recognizedInventoryCost?: number;
  inventoryAssetAccountId?: string | null;
  inventoryAssetAccountCode?: string | null;
  inventoryAssetAccountArabicName?: string | null;
  costOfGoodsSoldAccountId?: string | null;
  costOfGoodsSoldAccountCode?: string | null;
  costOfGoodsSoldAccountArabicName?: string | null;
};

export type SalesInvoiceListItem = {
  id: string;
  number: string;
  invoiceDate: string;
  dueDate?: string | null;
  customerCode: string;
  customerNameArabic: string;
  customerNameEnglish?: string | null;
  customerReferenceNumber?: string | null;
  status: SalesDocumentStatus;
  grandTotal: number;
  currencyCode: 'EGP';
  rowVersion: string;
  isAccountingPosted?: boolean;
  accountingPostingStatus?: string;
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
  accountingJournalEntryId?: string | null;
  accountingEntryNumber?: string | null;
  isAccountingPosted?: boolean;
  accountingPostingStatus?: string;
  customerControlAccountId?: string | null;
  customerControlAccountCode?: string | null;
  customerControlAccountNameArabic?: string | null;
  revenueOrReturnAccountId?: string | null;
  revenueOrReturnAccountCode?: string | null;
  revenueOrReturnAccountNameArabic?: string | null;
  inventoryCostAccountingStatus?: string | null;
  recognizedInventoryCost?: number;
  inventoryAssetAccountId?: string | null;
  inventoryAssetAccountCode?: string | null;
  inventoryAssetAccountArabicName?: string | null;
  costOfGoodsSoldAccountId?: string | null;
  costOfGoodsSoldAccountCode?: string | null;
  costOfGoodsSoldAccountArabicName?: string | null;
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
  isAccountingPosted?: boolean;
  accountingPostingStatus?: string;
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

export type SalesInvoicesReportQuery = {
  page?: number;
  pageSize?: number;
  search?: string;
  customerId?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  sortBy?: string;
  sortDirection?: string;
};

export type SalesInvoicesReportRow = {
  invoiceId: string;
  invoiceNumber: string;
  invoiceDate: string;
  customerId: string;
  customerNameArabic: string;
  customerNameEnglish?: string | null;
  itemCount: number;
  grandTotal: number;
  currencyCode: string;
  status: SalesDocumentStatus;
};

export type CurrencyTotal = {
  currencyCode: string;
  totalValue: number;
};

export type SalesInvoicesReportSummary = {
  totalInvoices: number;
  postedInvoices: number;
  draftInvoices: number;
  cancelledInvoices: number;
  postedSales: CurrencyTotal[];
  uniqueCustomers: number;
};

export type SalesInvoicesReportResponse = {
  rows: SalesInvoicesReportRow[];
  summary: SalesInvoicesReportSummary;
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
};
