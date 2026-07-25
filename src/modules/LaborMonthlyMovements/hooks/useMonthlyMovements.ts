import { useEffect, useMemo, useState } from 'react';
import useSWR from 'swr';

import { fetcher } from 'utils/axios';
import type { ApiResponse } from 'types/api';
import type { ListMeta, MonthlyMovementDto, MonthlyMovementListParams, MonthlyMovementPreviewDto, MonthlyMovementRequest } from '../types/monthlyMovements.types';
import { previewMonthlyMovement } from '../api/monthlyMovementsApi';

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

export function useMonthlyMovements(params: MonthlyMovementListParams) {
  const key = `/api/labor/monthly-movements?${buildQuery(params)}`;
  const { data, error, isLoading, mutate } = useSWR<ApiResponse<MonthlyMovementDto[]>>(key, fetcher);
  return useMemo(() => ({ ...toListResult(data), error, isLoading, mutate, key }), [data, error, isLoading, key, mutate]);
}

export function useMonthlyMovement(id?: string) {
  const { data, error, isLoading, mutate } = useSWR<ApiResponse<MonthlyMovementDto>>(id ? `/api/labor/monthly-movements/${id}` : null, fetcher);
  return useMemo(() => ({ movement: data?.data ?? null, error, isLoading, mutate }), [data, error, isLoading, mutate]);
}

export function useMonthlyMovementPreview(request: MonthlyMovementRequest | null) {
  const [preview, setPreview] = useState<MonthlyMovementPreviewDto | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let alive = true;

    if (!request) {
      setPreview(null);
      setError(null);
      setIsLoading(false);
      return () => {
        alive = false;
      };
    }

    const handle = window.setTimeout(async () => {
      try {
        setIsLoading(true);
        setError(null);
        const result = await previewMonthlyMovement(request);
        if (alive) {
          setPreview(result);
        }
      } catch (previewError) {
        if (alive) {
          setPreview(null);
          setError(previewError instanceof Error ? previewError : new Error('Preview failed'));
        }
      } finally {
        if (alive) {
          setIsLoading(false);
        }
      }
    }, 350);

    return () => {
      alive = false;
      window.clearTimeout(handle);
    };
  }, [request]);

  return useMemo(() => ({ preview, error, isLoading }), [preview, error, isLoading]);
}
