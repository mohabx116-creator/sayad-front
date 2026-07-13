import { useMemo } from 'react';
import useSWR from 'swr';

import { fetcher } from 'utils/axios';
import type { ApiResponse } from 'types/api';
import type { ListMeta, PartyDto, PartyStatementDto, PartyStatementParams } from '../types/parties.types';

function buildQuery(params: Record<string, string | number | boolean | undefined | null>) {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') search.set(key, String(value));
  });
  return search.toString();
}

function toListResult<T>(data?: ApiResponse<T[]>) {
  return {
    items: data?.data ?? [],
    meta: (data?.meta as ListMeta) ?? { page: 1, pageSize: 20, totalCount: 0, totalPages: 0 }
  };
}

export function useParties(params: Record<string, string | number | boolean | undefined | null>) {
  const key = `/api/parties?${buildQuery(params)}`;
  const { data, error, isLoading, mutate } = useSWR<ApiResponse<PartyDto[]>>(key, fetcher);
  return useMemo(() => ({ ...toListResult(data), error, isLoading, mutate, key }), [data, error, isLoading, key, mutate]);
}

export function useParty(id?: string) {
  const { data, error, isLoading, mutate } = useSWR<ApiResponse<PartyDto>>(id ? `/api/parties/${id}` : null, fetcher);
  return useMemo(() => ({ party: data?.data ?? null, error, isLoading, mutate }), [data, error, isLoading, mutate]);
}

export function usePartyStatement(id?: string, params: PartyStatementParams = {}) {
  const query=buildQuery(params);
  const key=id ? `/api/parties/${id}/statement${query ? `?${query}` : ''}` : null;
  const { data, error, isLoading, mutate } = useSWR<ApiResponse<PartyStatementDto>>(key, fetcher);
  return useMemo(() => ({ statement: data?.data ?? null, error, isLoading, mutate }), [data, error, isLoading, mutate]);
}
