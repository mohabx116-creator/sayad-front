import { useMemo } from 'react';
import useSWR from 'swr';

import { fetcher } from 'utils/axios';
import type { ApiResponse } from 'types/api';
import type { ListMeta } from 'modules/Workers/types/workers.types';
import type {
  WorkerOperationDto,
  WorkerOperationListItemDto,
  WorkerOperationListParams
} from '../types/operations.types';

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

export function useOperations(params: WorkerOperationListParams = {}) {
  const key = `/api/labor/operations?${buildQuery(params)}`;
  const { data, error, isLoading, mutate } = useSWR<ApiResponse<WorkerOperationListItemDto[]>>(key, fetcher);
  return useMemo(() => ({ ...toListResult(data), error, isLoading, mutate, key }), [data, error, isLoading, key, mutate]);
}

export function useOperation(id?: string) {
  const { data, error, isLoading, mutate } = useSWR<ApiResponse<WorkerOperationDto>>(id ? `/api/labor/operations/${id}` : null, fetcher);
  return useMemo(() => ({ operation: data?.data ?? null, error, isLoading, mutate }), [data, error, isLoading, mutate]);
}
