import type { ListMeta } from 'modules/Workers/types/workers.types';

export type PayrollPeriodStatus = 1 | 2 | 3;

export type PayrollPeriodListItemDto = {
  id: string;
  year: number;
  month: number;
  startDate: string;
  endDate: string;
  status: PayrollPeriodStatus;
  statusLabel: string;
  calculatedAtUtc: string | null;
  calculatedByUserId: string | null;
  approvedAtUtc: string | null;
  approvedByUserId: string | null;
  approvedByDisplayName: string | null;
  approvalNotes: string | null;
  notes: string | null;
  workerCount: number;
  totalBasicWage: number;
  totalMealAllowance: number;
  totalOvertime: number;
  totalNightWork: number;
  totalBonuses: number;
  totalAbsenceDeductions: number;
  totalOtherDeductions: number;
  totalGrossWage: number;
  totalDeductions: number;
  totalNetWage: number;
  createdAtUtc: string;
  updatedAtUtc: string | null;
  rowVersion: string;
};

export type PayrollStatementMovementDto = {
  id: string;
  payrollStatementId: string;
  workerMonthlyMovementId: string;
  movementTypeSnapshot: number;
  movementTypeLabel: string;
  movementDateSnapshot: string;
  quantitySnapshot: number | null;
  amountSnapshot: number;
  effectSnapshot: number;
  effectLabel: string;
  reasonSnapshot: string;
  createdAtUtc: string;
};

export type PayrollStatementDto = {
  id: string;
  payrollPeriodId: string;
  workerId: string;
  workerWageProfileId: string;
  workerCodeSnapshot: string;
  workerNameSnapshot: string;
  operationalJobNameSnapshot: string;
  dailyWageSnapshot: number;
  monthlyDaysBasisSnapshot: number;
  mealAllowanceTypeSnapshot: number;
  mealAllowanceTypeLabel: string;
  mealAllowanceValueSnapshot: number;
  overtimeCalculationTypeSnapshot: number;
  overtimeCalculationTypeLabel: string;
  overtimeRateSnapshot: number;
  nightWorkMultiplierSnapshot: number;
  standardHoursPerDaySnapshot: number;
  basicWage: number;
  payableMealDays: number;
  mealAllowance: number;
  overtimeAmount: number;
  nightWorkAmount: number;
  bonusAmount: number;
  absenceDays: number;
  absenceDeduction: number;
  otherDeductionAmount: number;
  grossWage: number;
  totalDeductions: number;
  netWage: number;
  hasNegativeNetWage: boolean;
  calculationVersion: string;
  calculationNotes: string | null;
  createdAtUtc: string;
  updatedAtUtc: string | null;
  rowVersion: string;
  movements: PayrollStatementMovementDto[];
};

export type PayrollPeriodDetailDto = PayrollPeriodListItemDto & {
  statements: PayrollStatementDto[];
};

export type PayrollPeriodSummaryDto = {
  workerCount: number;
  totalBasicWage: number;
  totalMealAllowance: number;
  totalOvertime: number;
  totalNightWork: number;
  totalBonuses: number;
  totalAbsenceDeductions: number;
  totalOtherDeductions: number;
  totalGrossWage: number;
  totalDeductions: number;
  totalNetWage: number;
};

export type PayrollPeriodInput = {
  year: number;
  month: number;
  notes?: string | null;
};

export type PayrollPeriodApprovalRequest = {
  rowVersion: string;
  approvalNotes?: string | null;
};

export type PayrollPeriodListParams = {
  page?: number;
  pageSize?: number;
  search?: string;
  year?: number | '';
  month?: number | '';
  sortBy?: string;
  sortDirection?: 'asc' | 'desc' | '';
};

export type PayrollPeriodFormValues = {
  year: string;
  month: string;
  notes: string;
};

export type PayrollListMeta = ListMeta;
