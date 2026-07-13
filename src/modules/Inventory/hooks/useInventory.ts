import { useMemo } from 'react';
import useSWR from 'swr';

import { fetcher } from 'utils/axios';
import type { ApiResponse } from 'types/api';
import type {
  InventoryMovementDto,
  ItemCategoryDto,
  ItemDto,
  ItemUnitDto,
  ListMeta,
  LowStockItemDto,
  PartyItemRelationDto,
  UnitOfMeasureDto
} from '../types/inventory.types';

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

export function useInventoryItems(params: Record<string, string | number | boolean | undefined | null>) {
  const key = `/api/inventory/items?${buildQuery(params)}`;
  const { data, error, isLoading, mutate } = useSWR<ApiResponse<ItemDto[]>>(key, fetcher);
  return useMemo(() => ({ ...toListResult(data), error, isLoading, mutate, key }), [data, error, isLoading, key, mutate]);
}

export function useInventoryItem(id?: string) {
  const { data, error, isLoading, mutate } = useSWR<ApiResponse<ItemDto>>(id ? `/api/inventory/items/${id}` : null, fetcher);
  return useMemo(() => ({ item: data?.data ?? null, error, isLoading, mutate }), [data, error, isLoading, mutate]);
}

export function useInventoryItemUnits(id?: string) {
  const { data, error, isLoading, mutate } = useSWR<ApiResponse<ItemUnitDto[]>>(id ? `/api/inventory/items/${id}/units` : null, fetcher);
  return useMemo(() => ({ items: data?.data ?? [], error, isLoading, mutate }), [data, error, isLoading, mutate]);
}

export function useInventoryItemOpeningStock(id?: string) {
  const { data, error, isLoading, mutate } = useSWR<ApiResponse<{ movementId?: string | null; movementDate?: string | null; quantity: number; notes?: string | null }>>(id ? `/api/inventory/items/${id}/opening-stock` : null, fetcher);
  return useMemo(() => ({ openingStock: data?.data ?? null, error, isLoading, mutate }), [data, error, isLoading, mutate]);
}

export function usePartyItemRelations(params: Record<string, string | number | boolean | undefined | null> = { page: 1, pageSize: 20 }) {
  const key = `/api/inventory/party-items?${buildQuery(params)}`;
  const { data, error, isLoading, mutate } = useSWR<ApiResponse<PartyItemRelationDto[]>>(key, fetcher);
  return useMemo(() => ({ ...toListResult(data), error, isLoading, mutate, key }), [data, error, isLoading, key, mutate]);
}

export function useInventoryUnits(params: Record<string, string | number | boolean | undefined | null> = { page: 1, pageSize: 100 }) {
  const key = `/api/inventory/units?${buildQuery(params)}`;
  const { data, error, isLoading, mutate } = useSWR<ApiResponse<UnitOfMeasureDto[]>>(key, fetcher);
  return useMemo(() => ({ ...toListResult(data), error, isLoading, mutate, key }), [data, error, isLoading, key, mutate]);
}

export function useInventoryCategories(params: Record<string, string | number | boolean | undefined | null> = { page: 1, pageSize: 100 }) {
  const key = `/api/inventory/categories?${buildQuery(params)}`;
  const { data, error, isLoading, mutate } = useSWR<ApiResponse<ItemCategoryDto[]>>(key, fetcher);
  return useMemo(() => ({ ...toListResult(data), error, isLoading, mutate, key }), [data, error, isLoading, key, mutate]);
}

export function useItemMovements(id?: string, params: Record<string, string | number | boolean | undefined | null> = { page: 1, pageSize: 20 }) {
  const query = buildQuery(params);
  const key = id ? `/api/inventory/items/${id}/movements${query ? `?${query}` : ''}` : null;
  const { data, error, isLoading, mutate } = useSWR<ApiResponse<InventoryMovementDto[]>>(key, fetcher);
  return useMemo(() => ({ ...toListResult(data), error, isLoading, mutate }), [data, error, isLoading, mutate]);
}

export function useLowStockItems(params: Record<string, string | number | boolean | undefined | null> = { page: 1, pageSize: 20 }) {
  const key = `/api/inventory/alerts/low-stock?${buildQuery(params)}`;
  const { data, error, isLoading, mutate } = useSWR<ApiResponse<LowStockItemDto[]>>(key, fetcher);
  return useMemo(() => ({ ...toListResult(data), error, isLoading, mutate, key }), [data, error, isLoading, key, mutate]);
}
