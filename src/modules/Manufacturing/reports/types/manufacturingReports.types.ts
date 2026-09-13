export interface ManufacturingDashboardDto {
  activeOrdersCount: number;
  releasedOrdersCount: number;
  inProgressOrdersCount: number;
  completedTodayCount: number;
  totalWipValue: number;
  currentMonthProductionCost: number;
}

export interface ManufacturingWipReportItemDto {
  orderNumber: string;
  finishedProductCode: string;
  finishedProductNameArabic: string;
  finishedProductNameEnglish: string | null;
  status: string;
  ownershipType: string;
  materialCost: number;
  laborCost: number;
  overheadCost: number;
  totalWip: number;
}

export interface ProductionCostAnalysisDto {
  finishedProductCode: string;
  finishedProductNameArabic: string;
  finishedProductNameEnglish: string | null;
  producedQuantity: number;
  materialCost: number;
  laborCost: number;
  overheadCost: number;
  totalCost: number;
  unitCost: number;
}

export interface ProductionCostVarianceDto {
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
}
