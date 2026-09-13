import { useMemo } from 'react';
import useSWR from 'swr';

import { fetcher } from 'utils/axios';
import type { ApiResponse } from 'types/api';
import type {
  BillOfMaterialsDto,
  BillOfMaterialsListItemDto,
  BillOfMaterialsListParams,
  ListMeta,
  ProductionCostVarianceDto,
  ProductionOperationDto,
  ProductionOrderDto,
  ProductionOrderListItemDto,
  ProductionOrderListParams,
  WorkCenterDto,
  WorkCenterListDto,
  WorkCenterListParams
} from '../types/manufacturing.types';

function buildQuery(params?: Record<string, string | number | boolean | undefined | null>) {
  if (!params) return '';
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

export function useBoms(params?: BillOfMaterialsListParams) {
  const query = buildQuery(params as Record<string, string | number | boolean | undefined | null> | undefined);
  const key = `/api/manufacturing/boms${query ? `?${query}` : ''}`;
  const { data, error, isLoading, mutate } = useSWR<ApiResponse<BillOfMaterialsListItemDto[]>>(key, fetcher);
  return useMemo(() => ({ ...toListResult(data), error, isLoading, mutate, key }), [data, error, isLoading, key, mutate]);
}

export function useBom(id?: string | null) {
  const key = id ? `/api/manufacturing/boms/${id}` : null;
  const { data, error, isLoading, mutate } = useSWR<ApiResponse<BillOfMaterialsDto>>(key, fetcher);
  return useMemo(() => ({ bom: data?.data ?? null, error, isLoading, mutate }), [data, error, isLoading, mutate]);
}

export function useProductionOrders(params?: ProductionOrderListParams) {
  const query = buildQuery(params as Record<string, string | number | boolean | undefined | null> | undefined);
  const key = `/api/manufacturing/orders${query ? `?${query}` : ''}`;
  const { data, error, isLoading, mutate } = useSWR<ApiResponse<ProductionOrderListItemDto[]>>(key, fetcher);
  return useMemo(() => ({ ...toListResult(data), error, isLoading, mutate, key }), [data, error, isLoading, key, mutate]);
}

export function useProductionOrder(id?: string | null) {
  const key = id ? `/api/manufacturing/orders/${id}` : null;
  const { data, error, isLoading, mutate } = useSWR<ApiResponse<ProductionOrderDto>>(key, fetcher);
  return useMemo(() => ({ order: data?.data ?? null, error, isLoading, mutate }), [data, error, isLoading, mutate]);
}

export function useProductionOrderCostVariance(id?: string | null) {
  const key = id ? `/api/manufacturing/orders/${id}/cost-variance` : null;
  const { data, error, isLoading, mutate } = useSWR<ApiResponse<ProductionCostVarianceDto>>(key, fetcher);
  return useMemo(() => ({ variance: data?.data ?? null, error, isLoading, mutate }), [data, error, isLoading, mutate]);
}

export function useWorkCenters(params?: WorkCenterListParams) {
  const query = buildQuery(params as Record<string, string | number | boolean | undefined | null> | undefined);
  const key = `/api/manufacturing/work-centers${query ? `?${query}` : ''}`;
  const { data, error, isLoading, mutate } = useSWR<ApiResponse<WorkCenterListDto[]>>(key, fetcher);
  return useMemo(() => ({ ...toListResult(data), error, isLoading, mutate, key }), [data, error, isLoading, key, mutate]);
}

export function useWorkCenter(id?: string | null) {
  const key = id ? `/api/manufacturing/work-centers/${id}` : null;
  const { data, error, isLoading, mutate } = useSWR<ApiResponse<WorkCenterDto>>(key, fetcher);
  return useMemo(() => ({ workCenter: data?.data ?? null, error, isLoading, mutate }), [data, error, isLoading, mutate]);
}

export function useProductionOperations(orderId?: string | null) {
  const key = orderId ? `/api/manufacturing/orders/${orderId}/operations` : null;
  const { data, error, isLoading, mutate } = useSWR<ApiResponse<ProductionOperationDto[]>>(key, fetcher);
  return useMemo(() => ({ operations: data?.data ?? [], error, isLoading, mutate }), [data, error, isLoading, mutate]);
}
