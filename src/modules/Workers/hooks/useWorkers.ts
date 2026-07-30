import { useMemo } from 'react';
import useSWR from 'swr';

import { fetcher } from 'utils/axios';
import type { ApiResponse } from 'types/api';
import type {
  ListMeta,
  WorkerDto,
  WorkerListItemDto,
  WorkerListParams,
  WorkerMonthlySalaryDto,
  WorkerMonthlySalaryListItemDto,
  WorkerMonthlySalaryReportDto,
  WorkerMonthlySalaryReportParams,
  WorkerSalarySettingsDto,
  WorkerWageProfileDto
} from '../types/workers.types';

function buildQuery(params: Record<string, string | number | boolean | undefined | null>) {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      search.set(key, String(value));
    }
  });
  return search.toString();
}

function toListResult<T>(data?: ApiResponse<T[]>) {
  return {
    items: data?.data ?? [],
    meta: (data?.meta as ListMeta) ?? { page: 1, pageSize: 20, totalCount: 0, totalPages: 0 }
  };
}

export function useWorkers(params: WorkerListParams) {
  const key = `/api/labor/workers?${buildQuery(params)}`;
  const { data, error, isLoading, mutate } = useSWR<ApiResponse<WorkerListItemDto[]>>(key, fetcher);
  return useMemo(() => ({ ...toListResult(data), error, isLoading, mutate, key }), [data, error, isLoading, key, mutate]);
}

export function useWorker(id?: string) {
  const { data, error, isLoading, mutate } = useSWR<ApiResponse<WorkerDto>>(id ? `/api/labor/workers/${id}` : null, fetcher);
  return useMemo(() => ({ worker: data?.data ?? null, error, isLoading, mutate }), [data, error, isLoading, mutate]);
}

export function useWorkerWageProfiles(id?: string) {
  const { data, error, isLoading, mutate } = useSWR<ApiResponse<WorkerWageProfileDto[]>>(id ? `/api/labor/workers/${id}/wage-profiles` : null, fetcher);
  return useMemo(() => ({ items: data?.data ?? [], error, isLoading, mutate }), [data, error, isLoading, mutate]);
}

export function useWorkerSalarySettings(id?: string) {
  const { data, error, isLoading, mutate } = useSWR<ApiResponse<WorkerSalarySettingsDto>>(id ? `/api/labor/workers/${id}/salary-settings` : null, fetcher);
  return useMemo(() => ({ settings: data?.data ?? null, error, isLoading, mutate }), [data, error, isLoading, mutate]);
}

export function useWorkerMonthlySalaries(id?: string) {
  const { data, error, isLoading, mutate } = useSWR<ApiResponse<WorkerMonthlySalaryListItemDto[]>>(id ? `/api/labor/workers/${id}/monthly-salaries` : null, fetcher);
  return useMemo(() => ({ items: data?.data ?? [], error, isLoading, mutate }), [data, error, isLoading, mutate]);
}

export function useWorkerMonthlySalary(workerId?: string, salaryId?: string) {
  const { data, error, isLoading, mutate } = useSWR<ApiResponse<WorkerMonthlySalaryDto>>(workerId && salaryId ? `/api/labor/workers/${workerId}/monthly-salaries/${salaryId}` : null, fetcher);
  return useMemo(() => ({ salary: data?.data ?? null, error, isLoading, mutate }), [data, error, isLoading, mutate]);
}

export function useWorkerMonthlySalaryReport(params: WorkerMonthlySalaryReportParams) {
  const key = `/api/labor/workers/monthly-salaries/report?${buildQuery(params)}`;
  const { data, error, isLoading, mutate } = useSWR<ApiResponse<WorkerMonthlySalaryReportDto>>(key, fetcher, { revalidateOnFocus: false });

  return useMemo(() => ({ report: data?.data ?? null, error, isLoading, mutate, key }), [data, error, isLoading, key, mutate]);
}
