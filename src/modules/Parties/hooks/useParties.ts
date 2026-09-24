import { useMemo } from 'react';
import useSWR from 'swr';

import { fetcher } from 'utils/axios';
import type { ApiResponse } from 'types/api';
import type {
  ListMeta,
  PartyDeletionPreview,
  PartyDto,
  PartySettlementDirection,
  PartySettlementOpenDocumentDto,
  PartyStatementDto,
  PartyStatementParams,
  PartiesSummaryDto
} from '../types/parties.types';

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

export function usePartyDeletionPreview(id?: string, enabled = false) {
  const key = id && enabled ? `/api/parties/${id}/deletion-preview` : null;
  const { data, error, isLoading, mutate } = useSWR<ApiResponse<PartyDeletionPreview>>(key, fetcher);
  return useMemo(() => ({ preview: data?.data ?? null, error, isLoading, mutate, key }), [data, error, isLoading, key, mutate]);
}

export function usePartyOpenDocuments(id?: string, direction?: PartySettlementDirection) {
  const key = id && direction ? `/api/parties/${id}/open-documents?direction=${encodeURIComponent(direction)}` : null;
  const { data, error, isLoading, mutate } = useSWR<ApiResponse<PartySettlementOpenDocumentDto[]>>(key, fetcher);
  return useMemo(() => ({ items: data?.data ?? [], error, isLoading, mutate, key }), [data, error, isLoading, key, mutate]);
}

export function usePartiesSummary(params: Record<string, string | number | boolean | undefined | null> = {}) {
  const query = buildQuery(params);
  const key = `/api/parties/summary${query ? `?${query}` : ''}`;
  const { data, error, isLoading, mutate } = useSWR<ApiResponse<PartiesSummaryDto>>(key, fetcher);
  return useMemo(() => ({ summary: data?.data ?? null, error, isLoading, mutate, key }), [data, error, isLoading, key, mutate]);
}
