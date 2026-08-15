export type ListMeta = {
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
};

export type WarehouseDto = {
  id: string;
  code: string;
  nameArabic: string;
  nameEnglish?: string | null;
  isDefault: boolean;
  isActive: boolean;
};

export type UnitOfMeasureDto = {
  id: string;
  code: string;
  nameArabic: string;
  nameEnglish?: string | null;
  symbolArabic: string;
  symbolEnglish: string;
  allowsDecimals: boolean;
  decimalPlaces: number;
  isSystem: boolean;
  isActive: boolean;
  rowVersion: string;
};

export type ItemCategoryDto = {
  id: string;
  code: string;
  nameArabic: string;
  nameEnglish?: string | null;
  notes?: string | null;
  parentCategoryId?: string | null;
  isActive: boolean;
  rowVersion: string;
};

export type ItemDto = {
  id: string;
  code: string;
  nameArabic: string;
  nameEnglish?: string | null;
  itemType: string;
  baseUnitId: string;
  baseUnitCode: string;
  baseUnitNameArabic: string;
  categoryId?: string | null;
  categoryNameArabic?: string | null;
  sku?: string | null;
  barcode?: string | null;
  descriptionArabic?: string | null;
  descriptionEnglish?: string | null;
  isPurchasable: boolean;
  isSellable: boolean;
  minimumQuantity: number;
  reorderQuantity: number;
  allowNegativeStock: boolean;
  defaultSalePrice: number;
  isActive: boolean;
  currentQuantity: number;
  stockStatus: string;
  notes?: string | null;
  rowVersion: string;
  currentAverageUnitCost?: number | null;
  currentInventoryValue?: number | null;
  isValuationInitialized: boolean;
  valuationInitializedAtUtc?: string | null;
  valuationStatus: string;
};

export type InventoryMovementDto = {
  id: string;
  warehouseId: string;
  warehouseCode: string;
  itemId: string;
  itemCode: string;
  itemNameArabic: string;
  movementType: string;
  referenceType: string;
  referenceNumber?: string | null;
  movementDate: string;
  unitOfMeasureId: string;
  unitCode: string;
  quantity: number;
  factorToBase: number;
  baseQuantityIn: number;
  baseQuantityOut: number;
  runningQuantity: number;
  descriptionArabic: string;
  descriptionEnglish?: string | null;
  isReversal: boolean;
  reversesMovementId?: string | null;
  createdAtUtc: string;
  unitCost?: number | null;
  totalCost?: number | null;
  quantityAfterBase?: number | null;
  inventoryValueAfter?: number | null;
  averageUnitCostAfter?: number | null;
  costSourceMovementId?: string | null;
  isCostResolved: boolean;
  valuationStatus: string;
  offsetAccountingAccountId?: string | null;
  offsetAccountingAccountCode?: string | null;
  offsetAccountingAccountArabicName?: string | null;
  accountingJournalEntryId?: string | null;
  accountingEntryNumber?: string | null;
  accountingPostingStatus: string;
  recognizedInventoryCost: number;
};

export type ItemUnitDto = {
  id: string;
  unitOfMeasureId: string;
  unitCode: string;
  unitNameArabic: string;
  unitNameEnglish?: string | null;
  factorToBase: number;
  salePriceOverride?: number | null;
  effectiveSalePrice: number;
  conversionFactor: number;
  isDefaultPurchaseUnit: boolean;
  isDefaultSalesUnit: boolean;
};

export type LowStockItemDto = {
  itemId: string;
  itemCode: string;
  itemNameArabic: string;
  itemNameEnglish?: string | null;
  currentQuantity: number;
  minimumQuantity: number;
  reorderQuantity: number;
  stockStatus: string;
};

export type InventoryValuationSummaryDto = {
  itemId: string;
  itemCode: string;
  itemNameArabic: string;
  itemNameEnglish?: string | null;
  warehouseId: string;
  warehouseCode: string;
  warehouseNameArabic: string;
  baseUnitId: string;
  baseUnitCode: string;
  quantityOnHandBase: number;
  averageUnitCost?: number | null;
  inventoryValue?: number | null;
  isValuationInitialized: boolean;
  valuationInitializedAtUtc?: string | null;
  updatedAtUtc?: string | null;
  valuationStatus: string;
  stockStatus: string;
  rowVersion: string;
};

export type InventoryStockReportRowDto = {
  itemId: string;
  itemCode: string;
  itemNameArabic: string;
  itemNameEnglish?: string | null;
  categoryId?: string | null;
  categoryNameArabic?: string | null;
  warehouseId: string;
  warehouseCode: string;
  warehouseNameArabic: string;
  baseUnitId: string;
  baseUnitCode: string;
  baseUnitNameArabic: string;
  availableQuantity: number;
  minimumQuantity: number;
  reorderQuantity: number;
  stockStatus: 'InStock' | 'LowStock' | 'OutOfStock';
  averageUnitCost?: number | null;
  stockValue?: number | null;
  lastMovementDate?: string | null;
};

export type InventoryStockReportSummaryDto = {
  totalItems: number;
  availableItems: number;
  lowStockItems: number;
  outOfStockItems: number;
  totalInventoryValue?: number | null;
};

export type InventoryStockReportFiltersDto = {
  warehouseId: string;
  warehouseCode: string;
  warehouseNameArabic: string;
  categoryId?: string | null;
  categoryNameArabic?: string | null;
  itemId?: string | null;
  itemCode?: string | null;
  itemNameArabic?: string | null;
  stockStatus?: string | null;
  search?: string | null;
  page: number;
  pageSize: number;
};

export type InventoryStockReportDto = {
  rows: InventoryStockReportRowDto[];
  summary: InventoryStockReportSummaryDto;
  appliedFilters: InventoryStockReportFiltersDto;
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
};

export type ItemUnitInput = {
  unitOfMeasureId: string;
  factorToBase: number;
  isDefaultPurchaseUnit: boolean;
  isDefaultSalesUnit: boolean;
  salePriceOverride?: number | null;
};

export type OpeningStockRequest = {
  movementDate: string;
  unitOfMeasureId: string;
  quantity: number;
  unitCost: number;
  notes?: string | null;
};

export type CorrectOpeningStockRequest = {
  movementDate: string;
  unitOfMeasureId: string;
  quantity: number;
  unitCost: number;
  reason: string;
  expectedOpeningMovementId: string;
};

export type InventoryMovementRequest = {
  movementDate: string;
  unitOfMeasureId: string;
  quantity: number;
  notes?: string | null;
  unitCost?: number | null;
  offsetAccountingAccountId?: string | null;
};

export type InventoryAdjustmentRequest = {
  movementDate: string;
  unitOfMeasureId: string;
  quantity: number;
  adjustmentType: 'Increase' | 'Decrease';
  reason: string;
  unitCost?: number | null;
  offsetAccountingAccountId?: string | null;
};

export type ReverseInventoryMovementRequest = {
  reason: string;
};

export type InitializeInventoryValuationRequest = {
  warehouseId?: string | null;
  averageUnitCost: number;
  effectiveDate: string;
  reason: string;
};

export type CreateItemRequest = {
  nameArabic: string;
  nameEnglish?: string | null;
  itemType: string;
  baseUnitId: string;
  categoryId?: string | null;
  sku?: string | null;
  barcode?: string | null;
  descriptionArabic?: string | null;
  descriptionEnglish?: string | null;
  isPurchasable: boolean;
  isSellable: boolean;
  minimumQuantity: number;
  reorderQuantity: number;
  allowNegativeStock: boolean;
  defaultSalePrice: number;
  notes?: string | null;
  units: ItemUnitInput[];
  openingStock?: OpeningStockRequest | null;
};

export type UpdateItemRequest = CreateItemRequest & {
  rowVersion: string;
};

export type CreateCategoryRequest = {
  nameArabic: string;
  nameEnglish?: string | null;
  notes?: string | null;
  parentCategoryId?: string | null;
};

export type UpdateCategoryRequest = CreateCategoryRequest & {
  rowVersion: string;
};

export type CategoryImportValidationErrorDto = {
  rowNumber: number;
  field: string;
  code: string;
  message: string;
};

export type CategoryImportPreviewRowDto = {
  rowNumber: number;
  nameArabic?: string | null;
  nameEnglish?: string | null;
  notes?: string | null;
  errors: CategoryImportValidationErrorDto[];
  isValid: boolean;
};

export type CategoryImportPreviewResultDto = {
  rows: CategoryImportPreviewRowDto[];
  totalRows: number;
  validRows: number;
  failedRows: number;
};

export type CategoryImportCommitRequest = {
  rows: CategoryImportPreviewRowDto[];
};

export type CategoryImportCommitResultDto = {
  totalRows: number;
  importedRows: number;
  failedRows: number;
};

export type CreateUnitRequest = {
  code: string;
  nameArabic: string;
  nameEnglish?: string | null;
  symbolArabic?: string | null;
  symbolEnglish?: string | null;
  decimalPlaces: number;
};

export type UpdateUnitRequest = {
  nameArabic: string;
  nameEnglish?: string | null;
  symbolArabic?: string | null;
  symbolEnglish?: string | null;
  decimalPlaces: number;
  rowVersion: string;
};

export type UnitImportValidationErrorDto = {
  rowNumber: number;
  field: string;
  code: string;
  message: string;
};

export type UnitImportPreviewRowDto = {
  rowNumber: number;
  code?: string | null;
  nameArabic?: string | null;
  nameEnglish?: string | null;
  symbolArabic?: string | null;
  symbolEnglish?: string | null;
  decimalPlaces?: number | null;
  errors: UnitImportValidationErrorDto[];
  isValid: boolean;
};

export type UnitImportPreviewResultDto = {
  rows: UnitImportPreviewRowDto[];
  totalRows: number;
  validRows: number;
  failedRows: number;
};

export type UnitImportCommitRequest = {
  rows: UnitImportPreviewRowDto[];
};

export type UnitImportCommitResultDto = {
  totalRows: number;
  importedRows: number;
  failedRows: number;
};

export type PartyItemRelationDto = {
  id: string;
  partyId: string;
  partyCode: string;
  partyNameArabic: string;
  itemId: string;
  itemCode: string;
  itemNameArabic: string;
  relationType: 'Customer' | 'Supplier';
  partyItemCode?: string | null;
  notes?: string | null;
  isPreferred: boolean;
  isActive: boolean;
  rowVersion: string;
};

export type CreatePartyItemRelationRequest = {
  itemId: string;
  partyId: string;
  relationType: 'Customer' | 'Supplier';
  partyItemCode?: string | null;
  notes?: string | null;
  isPreferred?: boolean;
};

export type CreateItemPartyRelationRequest = Omit<CreatePartyItemRelationRequest, 'itemId'>;

export type UpdatePartyItemRelationRequest = {
  partyItemCode?: string | null;
  notes?: string | null;
  isPreferred: boolean;
  rowVersion: string;
};
