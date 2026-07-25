import { useMemo } from 'react';
import useSWR from 'swr';

import { fetcher } from 'utils/axios';
import type { ApiResponse } from 'types/api';
import type { ListMeta, OperationalJobDto, OperationalJobListItemDto, OperationalJobListParams } from '../types/operationalJobs.types';

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

export function useOperationalJobs(params: OperationalJobListParams = {}) {
  const key = `/api/labor/operational-jobs?${buildQuery(params)}`;
  const { data, error, isLoading, mutate } = useSWR<ApiResponse<OperationalJobListItemDto[]>>(key, fetcher);
  return useMemo(() => ({ ...toListResult(data), error, isLoading, mutate, key }), [data, error, isLoading, key, mutate]);
}

export function useOperationalJob(id?: string) {
  const { data, error, isLoading, mutate } = useSWR<ApiResponse<OperationalJobDto>>(id ? `/api/labor/operational-jobs/${id}` : null, fetcher);
  return useMemo(() => ({ operationalJob: data?.data ?? null, error, isLoading, mutate }), [data, error, isLoading, mutate]);
}
