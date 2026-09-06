import type { ListMeta } from 'modules/Workers/types/workers.types';

export type PayrollPeriodStatus = 1 | 2 | 3 | 4;

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
  createdByUserId: string | null;
  createdByDisplayName: string | null;
  createdBySourceLabel: string;
  movementTypeSnapshot: number;
  movementTypeLabel: string;
  movementDateSnapshot: string;
  quantitySnapshot: number | null;
  amountSnapshot: number;
  effectSnapshot: number;
  effectLabel: string;
  reasonSnapshot: string;
  noteSnapshot: string | null;
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

export type PayrollPeriodPaymentDto = {
  id: string;
  payrollPeriodId: string;
  treasuryAccountId: string;
  treasuryAccountCode: string;
  treasuryAccountNameArabic: string;
  paymentDate: string;
  amount: number;
  paidAtUtc: string;
  paidByUserId: string;
  paidByDisplayName: string | null;
  notes: string | null;
  treasuryTransactionId: string;
  treasuryTransactionReferenceNumber: string | null;
  journalEntryId: string;
  journalEntryNumber: string;
  postingKey: string;
};

export type PayrollPeriodDetailDto = PayrollPeriodListItemDto & {
  payment: PayrollPeriodPaymentDto | null;
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

export type PayrollPeriodReopenRequest = {
  rowVersion: string;
  reason: string;
};

export type PayrollPeriodPaymentRequest = {
  rowVersion: string;
  treasuryAccountId: string;
  paymentDate: string;
  notes?: string | null;
};

export type PayrollPeriodUpdateInput = {
  notes?: string | null;
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
