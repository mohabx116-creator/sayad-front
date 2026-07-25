import type { OperationalJobListItemDto } from 'modules/OperationalJobs/types/operationalJobs.types';

export type ListMeta = {
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
};

export type WorkerWageProfileDto = {
  id: string;
  workerId: string;
  effectiveFrom: string;
  effectiveTo: string | null;
  dailyWage: number;
  monthlyDaysBasis: number;
  mealAllowanceType: number;
  mealAllowanceValue: number;
  overtimeCalculationType: number;
  overtimeRate: number;
  notes: string | null;
  isCurrent: boolean;
  createdAtUtc: string;
  updatedAtUtc: string | null;
  rowVersion: string;
};

export type WorkerDto = {
  id: string;
  code: string;
  name: string;
  mobileNumber: string | null;
  address: string | null;
  operationalJobId: string;
  operationalJobCode: string;
  operationalJobName: string;
  notes: string | null;
  isActive: boolean;
  createdAtUtc: string;
  updatedAtUtc: string | null;
  rowVersion: string;
  currentWageProfile: WorkerWageProfileDto | null;
};

export type WorkerListItemDto = {
  id: string;
  code: string;
  name: string;
  mobileNumber: string | null;
  operationalJobId: string;
  operationalJobCode: string;
  operationalJobName: string;
  isActive: boolean;
  createdAtUtc: string;
  updatedAtUtc: string | null;
  rowVersion: string;
  currentWageProfile: WorkerWageProfileDto | null;
};

export type WorkerListParams = {
  page?: number;
  pageSize?: number;
  search?: string;
  isActive?: boolean | '';
  operationalJobId?: string;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc' | '';
};

export type WorkerWageProfileInput = {
  effectiveFrom: string;
  dailyWage: number;
  monthlyDaysBasis: number;
  mealAllowanceType: number;
  mealAllowanceValue: number;
  overtimeCalculationType: number;
  overtimeRate: number;
  notes?: string | null;
  rowVersion?: string | null;
};

export type CreateWorkerRequest = {
  code?: string | null;
  name: string;
  mobileNumber?: string | null;
  address?: string | null;
  operationalJobId: string;
  notes?: string | null;
  isActive: boolean;
  wageProfile?: WorkerWageProfileInput | null;
};

export type UpdateWorkerRequest = CreateWorkerRequest & {
  code: string;
  rowVersion: string;
};

export type OperationalJobOption = OperationalJobListItemDto;
