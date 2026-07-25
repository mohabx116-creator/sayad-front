import { useMemo } from 'react';
import useSWR from 'swr';

import { fetcher } from 'utils/axios';
import type { ApiResponse } from 'types/api';
import type { PayrollPeriodDetailDto, PayrollPeriodListItemDto, PayrollPeriodListParams, PayrollListMeta } from '../types/payroll.types';

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
    meta: (data?.meta as PayrollListMeta) ?? { page: 1, pageSize: 20, totalCount: 0, totalPages: 0 }
  };
}

export function usePayrollPeriods(params: PayrollPeriodListParams) {
  const key = `/api/payroll/periods?${buildQuery(params)}`;
  const { data, error, isLoading, mutate } = useSWR<ApiResponse<PayrollPeriodListItemDto[]>>(key, fetcher, { revalidateOnFocus: false });

  return useMemo(() => ({ ...toListResult(data), error, isLoading, mutate, key }), [data, error, isLoading, key, mutate]);
}

export function usePayrollPeriod(id?: string) {
  const { data, error, isLoading, mutate } = useSWR<ApiResponse<PayrollPeriodDetailDto>>(id ? `/api/payroll/periods/${id}` : null, fetcher, {
    revalidateOnFocus: false
  });

  return useMemo(() => ({ period: data?.data ?? null, error, isLoading, mutate }), [data, error, isLoading, mutate]);
}
