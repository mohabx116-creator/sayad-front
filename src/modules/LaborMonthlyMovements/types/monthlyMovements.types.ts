import type { WorkerListItemDto } from 'modules/Workers/types/workers.types';

export type ListMeta = {
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
};

export type MonthlyMovementDto = {
  id: string;
  workerId: string;
  workerCode: string;
  workerName: string;
  operationalJobId: string;
  operationalJobCode: string;
  operationalJobName: string;
  movementType: number;
  movementTypeLabel: string;
  status: number;
  statusLabel: string;
  movementDate: string;
  quantity: number | null;
  unitRateSnapshot: number | null;
  amount: number;
  reason: string | null;
  notes: string | null;
  approvedAtUtc: string | null;
  approvedBy: string | null;
  rejectedAtUtc: string | null;
  rejectedBy: string | null;
  rejectionReason: string | null;
  dailyWageSnapshot: number;
  baseHourlyRate: number;
  monthlyDaysBasisSnapshot: number;
  standardHoursPerDaySnapshot: number;
  overtimeCalculationTypeSnapshot: number;
  overtimeRateSnapshot: number;
  nightWorkMultiplierSnapshot: number;
  createdAtUtc: string;
  updatedAtUtc: string | null;
  rowVersion: string;
};

export type MonthlyMovementPreviewDto = {
  workerId: string;
  workerCode: string;
  workerName: string;
  operationalJobId: string;
  operationalJobCode: string;
  operationalJobName: string;
  movementType: number;
  movementTypeLabel: string;
  movementDate: string;
  quantity: number | null;
  unitRateSnapshot: number | null;
  amount: number;
  dailyWageSnapshot: number;
  baseHourlyRate: number;
  monthlyDaysBasisSnapshot: number;
  standardHoursPerDaySnapshot: number;
  overtimeCalculationTypeSnapshot: number;
  overtimeRateSnapshot: number;
  nightWorkMultiplierSnapshot: number;
};

export type MonthlyMovementRequest = {
  workerId: string;
  movementDate: string;
  movementType: number;
  quantity: number | null;
  amount: number | null;
  reason: string;
  notes?: string | null;
  overtimeCalculationTypeOverride?: number | null;
  overtimeRateOverride?: number | null;
  nightWorkMultiplierOverride?: number | null;
  rowVersion?: string | null;
};

export type MonthlyMovementListParams = {
  page?: number;
  pageSize?: number;
  search?: string;
  workerId?: string;
  movementType?: number | '';
  status?: number | '';
  month?: number | '';
  year?: number | '';
  sortBy?: string;
  sortDirection?: 'asc' | 'desc' | '';
};

export type MonthlyMovementFormValues = {
  workerId: string;
  movementDate: string;
  movementType: string;
  quantity: string;
  amount: string;
  reason: string;
  notes: string;
  overtimeCalculationType: string;
  overtimeRate: string;
  nightWorkMultiplier: string;
  rowVersion?: string;
};

export type MonthlyMovementWorkerOption = WorkerListItemDto;
