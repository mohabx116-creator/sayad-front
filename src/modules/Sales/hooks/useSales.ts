import { useMemo } from 'react';
import useSWR from 'swr';

import { fetcher } from 'utils/axios';
import type { ApiResponse } from 'types/api';
import type {
  ListMeta,
  SalesInvoice,
  SalesInvoiceListItem,
  SalesListParams,
  SalesReturn,
  SalesReturnListItem,
  SalesReturnableLine
} from '../types/sales.types';

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

export function useSalesInvoices(params: SalesListParams) {
  const key = `/api/sales/invoices?${buildQuery(params)}`;
  const { data, error, isLoading, mutate } = useSWR<ApiResponse<SalesInvoiceListItem[]>>(key, fetcher);
  return useMemo(() => ({ ...toListResult(data), error, isLoading, mutate, key }), [data, error, isLoading, key, mutate]);
}

export function useSalesInvoice(id?: string) {
  const { data, error, isLoading, mutate } = useSWR<ApiResponse<SalesInvoice>>(id ? `/api/sales/invoices/${id}` : null, fetcher);
  return useMemo(() => ({ invoice: data?.data ?? null, error, isLoading, mutate }), [data, error, isLoading, mutate]);
}

export function useSalesReturns(params: SalesListParams) {
  const key = `/api/sales/returns?${buildQuery(params)}`;
  const { data, error, isLoading, mutate } = useSWR<ApiResponse<SalesReturnListItem[]>>(key, fetcher);
  return useMemo(() => ({ ...toListResult(data), error, isLoading, mutate, key }), [data, error, isLoading, key, mutate]);
}

export function useSalesReturn(id?: string) {
  const { data, error, isLoading, mutate } = useSWR<ApiResponse<SalesReturn>>(id ? `/api/sales/returns/${id}` : null, fetcher);
  return useMemo(() => ({ salesReturn: data?.data ?? null, error, isLoading, mutate }), [data, error, isLoading, mutate]);
}

export function useSalesReturnableLines(salesInvoiceId?: string) {
  const { data, error, isLoading, mutate } = useSWR<ApiResponse<SalesReturnableLine[]>>(
    salesInvoiceId ? `/api/sales/invoices/${salesInvoiceId}/returnable-lines` : null,
    fetcher
  );
  return useMemo(() => ({ items: data?.data ?? [], error, isLoading, mutate }), [data, error, isLoading, mutate]);
}


export function useSalesInvoicesReport(params: import('../types/sales.types').SalesInvoicesReportQuery) {
  const query = buildQuery(params as any);
  const key = `/api/reports/sales/invoices?${query}`;
  const { data, error, isLoading, mutate } = useSWR<ApiResponse<import('../types/sales.types').SalesInvoicesReportResponse>>(key, fetcher);
  return useMemo(() => ({ report: data?.data ?? null, error, isLoading, mutate, key }), [data, error, isLoading, key, mutate]);
}
