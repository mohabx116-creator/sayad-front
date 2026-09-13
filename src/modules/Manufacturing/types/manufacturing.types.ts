export type ListMeta = {
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
};

export type ProductionStatus = 'Draft' | 'Approved' | 'Released' | 'InProgress' | 'Completed' | 'Closed' | 'Cancelled';

export type ProductionActivityType = 'Created' | 'Updated' | 'Approved' | 'Released' | 'MaterialIssued' | 'GoodsReceived' | 'CostRecalculated' | 'Cancelled' | 'Closed';

export type ProductionOwnershipType = 'Company' | 'Customer' | 'Mixed';

export type InventoryOwnershipType = 'Company' | 'Customer';

export type ProductionOperationStatus = 'Planned' | 'InProgress' | 'Completed' | 'Cancelled';

// ==============================|| BILL OF MATERIALS (BOM) ||============================== //

export type BillOfMaterialsLineInput = {
  rawMaterialItemId: string;
  unitOfMeasureId: string;
  quantity: number;
  factorToBase: number;
  baseQuantity: number;
  scrapPercentage?: number;
  lineNumber?: number;
  notes?: string | null;
};

export type BillOfMaterialsLineDto = {
  id: string;
  billOfMaterialsId: string;
  rawMaterialItemId: string;
  rawMaterialItemCode: string;
  rawMaterialItemNameArabic: string;
  rawMaterialItemNameEnglish?: string | null;
  unitOfMeasureId: string;
  unitOfMeasureCode: string;
  unitOfMeasureNameArabic: string;
  quantity: number;
  factorToBase: number;
  baseQuantity: number;
  scrapPercentage: number;
  lineNumber: number;
  notes?: string | null;
};

export type BillOfMaterialsListItemDto = {
  id: string;
  code: string;
  nameArabic: string;
  nameEnglish?: string | null;
  finishedGoodItemId: string;
  finishedGoodItemCode: string;
  finishedGoodItemNameArabic: string;
  finishedGoodItemNameEnglish?: string | null;
  baseUnitId: string;
  baseUnitCode: string;
  batchSize: number;
  version: number;
  isActive: boolean;
  lineCount: number;
  createdAtUtc: string;
  rowVersion: string;
};

export type BillOfMaterialsDto = {
  id: string;
  code: string;
  nameArabic: string;
  nameEnglish?: string | null;
  finishedGoodItemId: string;
  finishedGoodItemCode: string;
  finishedGoodItemNameArabic: string;
  finishedGoodItemNameEnglish?: string | null;
  baseUnitId: string;
  baseUnitCode: string;
  baseUnitNameArabic: string;
  batchSize: number;
  version: number;
  routingNotes?: string | null;
  notes?: string | null;
  isActive: boolean;
  createdAtUtc: string;
  updatedAtUtc?: string | null;
  rowVersion: string;
  lines: BillOfMaterialsLineDto[];
};

export type CreateBillOfMaterialsRequest = {
  code?: string | null;
  nameArabic: string;
  nameEnglish?: string | null;
  finishedGoodItemId: string;
  baseUnitId: string;
  batchSize: number;
  version: number;
  routingNotes?: string | null;
  notes?: string | null;
  lines: BillOfMaterialsLineInput[];
};

export type UpdateBillOfMaterialsRequest = {
  nameArabic: string;
  nameEnglish?: string | null;
  finishedGoodItemId: string;
  baseUnitId: string;
  batchSize: number;
  version: number;
  routingNotes?: string | null;
  notes?: string | null;
  lines: BillOfMaterialsLineInput[];
  rowVersion?: string | null;
};

export type SetBillOfMaterialsActiveRequest = {
  isActive: boolean;
  rowVersion?: string | null;
};

export type BillOfMaterialsListParams = {
  finishedGoodItemId?: string | null;
  isActive?: boolean | null;
  search?: string | null;
  page?: number;
  pageSize?: number;
};

// ==============================|| WORK CENTERS ||============================== //

export type WorkCenterDto = {
  id: string;
  code: string;
  name: string;
  description?: string | null;
  laborRatePerHour: number;
  machineRatePerHour: number;
  capacityMinutesPerDay: number;
  isActive: boolean;
  createdAtUtc?: string | null;
  updatedAtUtc?: string | null;
  rowVersion?: string | null;
};

export type WorkCenterListDto = {
  id: string;
  code: string;
  name: string;
  laborRatePerHour: number;
  machineRatePerHour: number;
  capacityMinutesPerDay: number;
  isActive: boolean;
  rowVersion?: string | null;
};

export type WorkCenterListParams = {
  isActive?: boolean | null;
  search?: string | null;
  page?: number;
  pageSize?: number;
};

export type CreateWorkCenterRequest = {
  code: string;
  name: string;
  description?: string | null;
  laborRatePerHour: number;
  machineRatePerHour: number;
  capacityMinutesPerDay: number;
};

export type UpdateWorkCenterRequest = {
  name: string;
  description?: string | null;
  laborRatePerHour: number;
  machineRatePerHour: number;
  capacityMinutesPerDay: number;
  rowVersion?: string | null;
};

export type ActivateWorkCenterRequest = {
  isActive: boolean;
  rowVersion?: string | null;
};

// ==============================|| PRODUCTION ORDERS ||============================== //

export type ProductionOrderListItemDto = {
  id: string;
  number: string;
  billOfMaterialsId: string;
  billOfMaterialsCode: string;
  finishedGoodItemId: string;
  finishedGoodItemCode: string;
  finishedGoodItemNameArabic: string;
  finishedGoodItemNameEnglish?: string | null;
  sourceWarehouseId: string;
  sourceWarehouseNameArabic: string;
  targetWarehouseId: string;
  targetWarehouseNameArabic: string;
  plannedQuantity: number;
  producedQuantity: number;
  scrapQuantity: number;
  status: ProductionStatus;
  productionType: ProductionOwnershipType;
  ownerPartyId?: string | null;
  ownerPartyNameArabic?: string | null;
  plannedStartDate: string;
  plannedEndDate: string;
  actualStartDate?: string | null;
  actualEndDate?: string | null;
  materialCostTotal: number;
  laborCostTotal: number;
  overheadCostTotal: number;
  tollingRevenueTotal: number;
  totalCost: number;
  unitCostProduced: number;
  createdAtUtc: string;
  rowVersion: string;
};

export type ProductionOrderDto = {
  id: string;
  number: string;
  billOfMaterialsId: string;
  billOfMaterialsCode: string;
  billOfMaterialsVersion: number;
  finishedGoodItemId: string;
  finishedGoodItemCode: string;
  finishedGoodItemNameArabic: string;
  finishedGoodItemNameEnglish?: string | null;
  sourceWarehouseId: string;
  sourceWarehouseNameArabic: string;
  targetWarehouseId: string;
  targetWarehouseNameArabic: string;
  plannedQuantity: number;
  producedQuantity: number;
  scrapQuantity: number;
  status: ProductionStatus;
  productionType: ProductionOwnershipType;
  ownerPartyId?: string | null;
  ownerPartyCode?: string | null;
  ownerPartyNameArabic?: string | null;
  plannedStartDate: string;
  plannedEndDate: string;
  actualStartDate?: string | null;
  actualEndDate?: string | null;
  approvedBy?: string | null;
  approvedAtUtc?: string | null;
  cancellationReason?: string | null;
  notes?: string | null;
  materialCostTotal: number;
  laborCostTotal: number;
  overheadCostTotal: number;
  tollingRevenueTotal: number;
  totalCost: number;
  unitCostProduced: number;
  createdAtUtc: string;
  updatedAtUtc?: string | null;
  rowVersion: string;
  issueCount: number;
  receiptCount: number;
  laborOperationCount: number;
  chargeCount: number;
};

export type ProductionCostVarianceDto = {
  productionOrderId: string;
  orderNumber: string;
  finishedGood: string;
  plannedMaterialCost: number;
  actualMaterialCost: number;
  materialVariance: number;
  plannedLaborCost: number;
  actualLaborCost: number;
  laborVariance: number;
  plannedOverheadCost: number;
  actualOverheadCost: number;
  overheadVariance: number;
  plannedTotalCost: number;
  actualTotalCost: number;
  totalVariance: number;
  variancePercentage: number;
};

export type CreateProductionOrderRequest = {
  number?: string | null;
  billOfMaterialsId: string;
  finishedGoodItemId: string;
  sourceWarehouseId: string;
  targetWarehouseId: string;
  plannedQuantity: number;
  plannedStartDate: string;
  plannedEndDate: string;
  productionType?: ProductionOwnershipType;
  ownerPartyId?: string | null;
  notes?: string | null;
};

export type UpdateProductionOrderRequest = {
  sourceWarehouseId: string;
  targetWarehouseId: string;
  plannedQuantity: number;
  plannedStartDate: string;
  plannedEndDate: string;
  notes?: string | null;
  rowVersion?: string | null;
};

export type ProductionOrderRowVersionRequest = {
  rowVersion?: string | null;
};

export type CancelProductionOrderRequest = {
  reason: string;
  rowVersion?: string | null;
};

export type ProductionOrderListParams = {
  status?: ProductionStatus | null;
  productionType?: ProductionOwnershipType | null;
  finishedGoodItemId?: string | null;
  ownerPartyId?: string | null;
  fromPlannedDate?: string | null;
  toPlannedDate?: string | null;
  search?: string | null;
  page?: number;
  pageSize?: number;
};

// ==============================|| PRODUCTION OPERATIONS ||============================== //

export type ProductionOperationDto = {
  id: string;
  productionOrderId: string;
  productionOrderNumber?: string | null;
  workCenterId: string;
  workCenterCode?: string | null;
  workCenterName: string;
  sequence: number;
  operationName: string;
  plannedMinutes: number;
  actualMinutes: number;
  laborCost: number;
  machineCost: number;
  status: ProductionOperationStatus;
  createdAtUtc?: string | null;
  updatedAtUtc?: string | null;
  rowVersion?: string | null;
};

export type AddProductionOperationRequest = {
  workCenterId: string;
  sequence: number;
  operationName: string;
  plannedMinutes: number;
};

export type UpdateProductionOperationRequest = {
  workCenterId: string;
  sequence: number;
  operationName: string;
  plannedMinutes: number;
  rowVersion?: string | null;
};

export type CompleteProductionOperationRequest = {
  actualMinutes: number;
  rowVersion?: string | null;
};

// ==============================|| MATERIAL ISSUES ||============================== //

export type ProductionMaterialIssueLineInput = {
  rawMaterialItemId: string;
  unitOfMeasureId: string;
  quantity: number;
  factorToBase: number;
  baseQuantity: number;
  lineNumber?: number;
  ownershipType?: InventoryOwnershipType;
  ownerPartyId?: string | null;
  notes?: string | null;
};

export type ProductionMaterialIssueLineDto = {
  id: string;
  lineNumber: number;
  rawMaterialItemId: string;
  rawMaterialItemCode: string;
  rawMaterialItemNameArabic: string;
  rawMaterialItemNameEnglish?: string | null;
  unitOfMeasureId: string;
  unitCode: string;
  quantity: number;
  factorToBase: number;
  baseQuantity: number;
  unitCost: number;
  totalCost: number;
  ownershipType: string;
  ownerPartyId?: string | null;
  inventoryMovementId?: string | null;
  notes?: string | null;
};

export type ProductionMaterialIssueDto = {
  id: string;
  productionOrderId: string;
  productionOrderNumber: string;
  issueNumber: string;
  issueDate: string;
  status: string;
  totalMaterialCost: number;
  notes?: string | null;
  lines: ProductionMaterialIssueLineDto[];
  createdAtUtc: string;
};

export type IssueProductionMaterialsRequest = {
  issueDate?: string | null;
  issueNumber?: string | null;
  notes?: string | null;
  customLines?: ProductionMaterialIssueLineInput[] | null;
  rowVersion?: string | null;
};

// ==============================|| PRODUCTION RECEIPTS ||============================== //

export type ProductionReceiptLineInput = {
  finishedGoodItemId: string;
  unitOfMeasureId: string;
  quantity: number;
  costRate: number;
};

// ==============================|| PRODUCTION AUDIT TIMELINE ||============================== //

export type ProductionOrderActivityDto = {
  id: string;
  activityType: ProductionActivityType;
  description: string;
  userId: string;
  userName?: string | null;
  createdAtUtc: string;
  referenceId?: string | null;
  referenceType?: string | null;
  metadataJson?: string | null;
};

export type ProductionReceiptLineDto = {
  id: string;
  lineNumber: number;
  itemId: string;
  itemCode: string;
  itemNameArabic: string;
  itemNameEnglish?: string | null;
  unitOfMeasureId: string;
  unitCode: string;
  quantity: number;
  factorToBase: number;
  baseQuantity: number;
  unitCost: number;
  totalCost: number;
  isByProduct: boolean;
  ownershipType: string;
  ownerPartyId?: string | null;
  inventoryMovementId?: string | null;
  notes?: string | null;
};

export type ProductionReceiptDto = {
  id: string;
  productionOrderId: string;
  productionOrderNumber: string;
  receiptNumber: string;
  receiptDate: string;
  producedQuantity: number;
  baseQuantity: number;
  allocatedMaterialCost: number;
  allocatedLaborCost: number;
  allocatedOverheadCost: number;
  totalCost: number;
  unitCost: number;
  status: string;
  inventoryMovementId?: string | null;
  notes?: string | null;
  lines: ProductionReceiptLineDto[];
  createdAtUtc: string;
};

export type ReceiveProductionGoodsRequest = {
  producedQuantity: number;
  receiptDate?: string | null;
  receiptNumber?: string | null;
  allocatedMaterialCost?: number | null;
  allocatedLaborCost?: number | null;
  allocatedOverheadCost?: number | null;
  notes?: string | null;
  byProducts?: ProductionReceiptLineInput[] | null;
  rowVersion?: string | null;
};
