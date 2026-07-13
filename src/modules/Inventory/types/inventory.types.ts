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
  isActive: boolean;
  currentQuantity: number;
  stockStatus: string;
  notes?: string | null;
  rowVersion: string;
};

export type InventoryMovementDto = {
  id: string;
  movementType: string;
  movementDate: string;
  unitCode: string;
  quantity: number;
  baseQuantityIn: number;
  baseQuantityOut: number;
  runningQuantity: number;
  descriptionArabic: string;
  isReversal: boolean;
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
};

export type OpeningStockRequest = {
  movementDate: string;
  unitOfMeasureId: string;
  quantity: number;
  notes?: string | null;
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

export type CreateUnitRequest = {
  code: string;
  nameArabic: string;
  nameEnglish?: string | null;
  symbolArabic?: string | null;
  symbolEnglish?: string | null;
  decimalPlaces: number;
};
