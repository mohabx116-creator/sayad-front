export type ListMeta = {
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
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
  notes?: string | null;
};

export type CorrectOpeningStockRequest = {
  movementDate: string;
  unitOfMeasureId: string;
  quantity: number;
  reason: string;
  expectedOpeningMovementId: string;
};

export type InventoryMovementRequest = {
  movementDate: string;
  unitOfMeasureId: string;
  quantity: number;
  notes?: string | null;
};

export type InventoryAdjustmentRequest = {
  movementDate: string;
  unitOfMeasureId: string;
  quantity: number;
  adjustmentType: 'Increase' | 'Decrease';
  reason: string;
};

export type ReverseInventoryMovementRequest = {
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
