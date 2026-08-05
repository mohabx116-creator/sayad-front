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

export type WorkerSalarySettingsDto = {
  workerId: string;
  workerCode: string;
  workerName: string;
  operationalJobId: string | null;
  operationalJobName: string | null;
  dailyWage: number;
  mealAllowance: number;
  expectedMonthlySalary: number;
  effectiveFrom: string | null;
  updatedAtUtc: string | null;
  rowVersion: string | null;
};

export type WorkerDto = {
  id: string;
  code: string;
  name: string;
  mobileNumber: string | null;
  address: string | null;
  operationalJobId: string | null;
  operationalJobCode: string | null;
  operationalJobName: string | null;
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
  operationalJobId: string | null;
  operationalJobCode: string | null;
  operationalJobName: string | null;
  isActive: boolean;
  createdAtUtc: string;
  updatedAtUtc: string | null;
  rowVersion: string;
  currentWageProfile: WorkerWageProfileDto | null;
};

export type WorkerMonthlySalaryDeductionDto = {
  amount: number;
  reason: string;
  source: string;
};

export type WorkerMonthlySalaryListItemDto = {
  id: string;
  workerId: string;
  year: number;
  month: number;
  monthLabel: string;
  baseSalary: number;
  additions: number;
  deductions: number;
  netSalary: number;
  isPaid: boolean;
  paymentDate: string | null;
  treasuryAccountCode: string | null;
  treasuryAccountNameArabic: string | null;
  paidAmount: number | null;
  createdAtUtc: string;
  updatedAtUtc: string | null;
  rowVersion: string;
};

export type WorkerMonthlySalaryDto = {
  id: string;
  workerId: string;
  workerCode: string;
  workerName: string;
  operationalJobId: string | null;
  operationalJobName: string | null;
  year: number;
  month: number;
  monthLabel: string;
  dailyWageSnapshot: number;
  mealAllowanceSnapshot: number;
  calculatedDays: number;
  absenceDays: number;
  normalOvertimeAmount: number;
  nightOvertimeAmount: number;
  bonusAmount: number;
  baseSalary: number;
  totalAdditions: number;
  totalDeductions: number;
  netSalary: number;
  isPaid: boolean;
  paymentDate: string | null;
  paidAtUtc: string | null;
  paidByUserId: string | null;
  paidByDisplayName: string | null;
  treasuryAccountId: string | null;
  treasuryAccountCode: string | null;
  treasuryAccountNameArabic: string | null;
  paidAmount: number | null;
  paymentNotes: string | null;
  treasuryTransactionId: string | null;
  treasuryTransactionReferenceNumber: string | null;
  notes: string | null;
  createdAtUtc: string;
  updatedAtUtc: string | null;
  rowVersion: string;
  deductions: WorkerMonthlySalaryDeductionDto[];
};

export type WorkerMonthlySalaryReportRowDto = {
  id: string;
  workerId: string;
  workerCode: string;
  workerName: string;
  operationalJobName: string | null;
  monthLabel: string;
  baseSalary: number;
  mealAllowance: number;
  overtime: number;
  bonuses: number;
  absenceDeduction: number;
  otherDeductions: number;
  totalAdditions: number;
  totalDeductions: number;
  netSalary: number;
  isPaid: boolean;
  paymentDate: string | null;
  treasuryAccountCode: string | null;
  treasuryAccountNameArabic: string | null;
  paidAmount: number | null;
  createdAtUtc: string;
  updatedAtUtc: string | null;
  rowVersion: string;
};

export type WorkerMonthlySalaryReportDto = {
  month: number;
  year: number;
  paymentStatus: 'all' | 'paid' | 'unpaid';
  search: string | null;
  rows: WorkerMonthlySalaryReportRowDto[];
  workersCount: number;
  totalBaseSalaries: number;
  totalAdditions: number;
  totalDeductions: number;
  totalNetSalaries: number;
  totalPaid: number;
  totalUnpaid: number;
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
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
  operationalJobId: string | null;
  notes?: string | null;
  isActive: boolean;
  wageProfile?: WorkerWageProfileInput | null;
};

export type UpdateWorkerRequest = CreateWorkerRequest & {
  code: string;
  rowVersion: string;
};

export type WorkerMonthlySalaryDeductionInput = {
  amount: number;
  reason: string;
  source: 'Manager' | 'Accountant';
};

export type WorkerMonthlySalaryRequest = {
  year: number;
  month: number;
  calculatedDays?: number;
  absenceDays?: number;
  normalOvertimeAmount?: number;
  nightOvertimeAmount?: number;
  bonusAmount?: number;
  deductions?: WorkerMonthlySalaryDeductionInput[];
  notes?: string | null;
};

export type WorkerMonthlySalaryPaymentRequest = {
  treasuryAccountId: string;
  paymentDate: string;
  notes?: string | null;
};

export type WorkerMonthlySalaryReportParams = {
  month?: number;
  year?: number;
  paymentStatus?: 'all' | 'paid' | 'unpaid';
  search?: string;
  page?: number;
  pageSize?: number;
};

export type OperationalJobOption = OperationalJobListItemDto;
