import { useMemo } from 'react';
import useSWR from 'swr';

import { fetcher } from 'utils/axios';
import type { ApiResponse } from 'types/api';
import type {
  ListMeta,
  PurchaseInvoice,
  PurchaseInvoiceListItem,
  PurchaseListParams,
  PurchaseReturn,
  PurchaseReturnListItem
} from '../types/purchases.types';

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

export function usePurchaseInvoices(params: PurchaseListParams) {
  const key = `/api/purchases/invoices?${buildQuery(params)}`;
  const { data, error, isLoading, mutate } = useSWR<ApiResponse<PurchaseInvoiceListItem[]>>(key, fetcher);
  return useMemo(() => ({ ...toListResult(data), error, isLoading, mutate, key }), [data, error, isLoading, key, mutate]);
}

export function usePurchaseInvoice(id?: string) {
  const { data, error, isLoading, mutate } = useSWR<ApiResponse<PurchaseInvoice>>(id ? `/api/purchases/invoices/${id}` : null, fetcher);
  return useMemo(() => ({ invoice: data?.data ?? null, error, isLoading, mutate }), [data, error, isLoading, mutate]);
}

export function usePurchaseReturns(params: PurchaseListParams) {
  const key = `/api/purchases/returns?${buildQuery(params)}`;
  const { data, error, isLoading, mutate } = useSWR<ApiResponse<PurchaseReturnListItem[]>>(key, fetcher);
  return useMemo(() => ({ ...toListResult(data), error, isLoading, mutate, key }), [data, error, isLoading, key, mutate]);
}

export function usePurchaseReturn(id?: string) {
  const { data, error, isLoading, mutate } = useSWR<ApiResponse<PurchaseReturn>>(id ? `/api/purchases/returns/${id}` : null, fetcher);
  return useMemo(() => ({ purchaseReturn: data?.data ?? null, error, isLoading, mutate }), [data, error, isLoading, mutate]);
}
