import { useMemo } from 'react';
import useSWR from 'swr';

import { fetcher } from 'utils/axios';
import type { ApiResponse } from 'types/api';
import { TREASURY_MAX_PAGE_SIZE } from '../utils/treasury.constants';
import type {
  TreasuryAccount,
  TreasuryAccountDeletionPreview,
  TreasuryAccountingAccountLookup,
  TreasuryAccountListItem,
  TreasuryDashboardSummary,
  TreasuryEligibleInvoice,
  TreasuryLookupOption,
  TreasuryLookups,
  TreasuryListParams,
  TreasuryPagedMeta,
  TreasuryPayment,
  TreasuryPaymentListItem,
  TreasuryReceipt,
  TreasuryReceiptListItem,
  TreasuryStatement,
  TreasuryStatementParams,
  TreasuryTransfer,
  TreasuryTransferListItem
} from '../types/treasury.types';

function buildQuery(params: object) {
  const searchParams = new URLSearchParams();
  Object.entries(params as Record<string, unknown>).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.set(key, String(value));
    }
  });
  return searchParams.toString();
}

function normalizePageSize(pageSize?: number) {
  if (pageSize == null || Number.isNaN(pageSize)) {
    return undefined;
  }

  return Math.min(Math.max(1, pageSize), TREASURY_MAX_PAGE_SIZE);
}

function normalizeParams<T extends { pageSize?: number }>(params: T) {
  return { ...params, pageSize: normalizePageSize(params.pageSize) };
}

function mapLookupOption(option: TreasuryLookupOption): TreasuryLookupOption {
  return {
    ...option,
    id: option.value,
    code: option.value,
    displayName: option.labelArabic
  };
}

function mapLookups(data?: TreasuryLookups | null): TreasuryLookups | null {
  if (!data) {
    return null;
  }

  return {
    accountTypes: data.accountTypes.map(mapLookupOption),
    allocationTypes: data.allocationTypes.map(mapLookupOption),
    movementTypes: data.movementTypes.map(mapLookupOption),
    documentStatuses: data.documentStatuses.map(mapLookupOption),
    paymentMethods: data.paymentMethods.map(mapLookupOption)
  };
}

function toListResult<T>(data?: ApiResponse<T[]>) {
  return {
    items: data?.data ?? [],
    meta: (data?.meta as TreasuryPagedMeta) ?? { page: 1, pageSize: 20, totalCount: 0, totalPages: 0 }
  };
}

export function useTreasuryAccounts(params: TreasuryListParams) {
  const normalizedParams = normalizeParams(params);
  const key = `/api/treasury/accounts?${buildQuery(normalizedParams)}`;
  const { data, error, isLoading, mutate } = useSWR<ApiResponse<TreasuryAccountListItem[]>>(key, fetcher);
  return useMemo(() => ({ ...toListResult(data), error, isLoading, mutate, key }), [data, error, isLoading, key, mutate]);
}

export function useTreasuryAccount(id?: string) {
  const { data, error, isLoading, mutate } = useSWR<ApiResponse<TreasuryAccount>>(id ? `/api/treasury/accounts/${id}` : null, fetcher);
  return useMemo(() => ({ account: data?.data ?? null, error, isLoading, mutate }), [data, error, isLoading, mutate]);
}

export function useTreasuryAccountDeletionPreview(id?: string, enabled = false) {
  const key = id && enabled ? `/api/treasury/accounts/${id}/deletion-preview` : null;
  const { data, error, isLoading, mutate } = useSWR<ApiResponse<TreasuryAccountDeletionPreview>>(key, fetcher);
  return useMemo(() => ({ preview: data?.data ?? null, error, isLoading, mutate, key }), [data, error, isLoading, key, mutate]);
}

export function useTreasuryReceipts(params: TreasuryListParams) {
  const normalizedParams = normalizeParams(params);
  const key = `/api/treasury/receipts?${buildQuery(normalizedParams)}`;
  const { data, error, isLoading, mutate } = useSWR<ApiResponse<TreasuryReceiptListItem[]>>(key, fetcher);
  return useMemo(() => ({ ...toListResult(data), error, isLoading, mutate, key }), [data, error, isLoading, key, mutate]);
}

export function useTreasuryReceipt(id?: string) {
  const { data, error, isLoading, mutate } = useSWR<ApiResponse<TreasuryReceipt>>(id ? `/api/treasury/receipts/${id}` : null, fetcher);
  return useMemo(() => ({ receipt: data?.data ?? null, error, isLoading, mutate }), [data, error, isLoading, mutate]);
}

export function useTreasuryPayments(params: TreasuryListParams) {
  const normalizedParams = normalizeParams(params);
  const key = `/api/treasury/payments?${buildQuery(normalizedParams)}`;
  const { data, error, isLoading, mutate } = useSWR<ApiResponse<TreasuryPaymentListItem[]>>(key, fetcher);
  return useMemo(() => ({ ...toListResult(data), error, isLoading, mutate, key }), [data, error, isLoading, key, mutate]);
}

export function useTreasuryPayment(id?: string) {
  const { data, error, isLoading, mutate } = useSWR<ApiResponse<TreasuryPayment>>(id ? `/api/treasury/payments/${id}` : null, fetcher);
  return useMemo(() => ({ payment: data?.data ?? null, error, isLoading, mutate }), [data, error, isLoading, mutate]);
}

export function useTreasuryTransfers(params: TreasuryListParams) {
  const normalizedParams = normalizeParams(params);
  const key = `/api/treasury/transfers?${buildQuery(normalizedParams)}`;
  const { data, error, isLoading, mutate } = useSWR<ApiResponse<TreasuryTransferListItem[]>>(key, fetcher);
  return useMemo(() => ({ ...toListResult(data), error, isLoading, mutate, key }), [data, error, isLoading, key, mutate]);
}

export function useTreasuryTransfer(id?: string) {
  const { data, error, isLoading, mutate } = useSWR<ApiResponse<TreasuryTransfer>>(id ? `/api/treasury/transfers/${id}` : null, fetcher);
  return useMemo(() => ({ transfer: data?.data ?? null, error, isLoading, mutate }), [data, error, isLoading, mutate]);
}

export function useTreasuryStatement(params: TreasuryStatementParams | null) {
  const key = params ? `/api/treasury/statements?${buildQuery(normalizeParams(params))}` : null;
  const { data, error, isLoading, mutate } = useSWR<ApiResponse<TreasuryStatement>>(key, fetcher);
  return useMemo(() => ({ statement: data?.data ?? null, error, isLoading, mutate, key }), [data, error, isLoading, key, mutate]);
}

export function useTreasuryLookups() {
  const { data, error, isLoading, mutate } = useSWR<ApiResponse<TreasuryLookups>>('/api/treasury/lookups', fetcher, { revalidateOnFocus: false });
  return useMemo(() => ({ lookups: mapLookups(data?.data), error, isLoading, mutate }), [data, error, isLoading, mutate]);
}

export function useTreasuryAccountingAccountLookups(treasuryAccountId?: string, search = '') {
  const key = `/api/treasury/accounts/accounting-lookups?${buildQuery({ page: 1, pageSize: 50, search, treasuryAccountId })}`;
  const { data, error, isLoading, mutate } = useSWR<ApiResponse<TreasuryAccountingAccountLookup[]>>(key, fetcher, { revalidateOnFocus: false });
  return useMemo(() => ({ items: data?.data ?? [], error, isLoading, mutate, key }), [data, error, isLoading, key, mutate]);
}

export function useTreasuryDashboardSummary(dateFrom?: string, dateTo?: string) {
  const key = `/api/treasury/dashboard/summary?${buildQuery({ dateFrom, dateTo })}`;
  const { data, error, isLoading, mutate } = useSWR<ApiResponse<TreasuryDashboardSummary>>(key, fetcher, { revalidateOnFocus: false });
  return useMemo(() => ({ summary: data?.data ?? null, error, isLoading, mutate, key }), [data, error, isLoading, key, mutate]);
}

export function useEligibleSalesInvoices(partyId?: string, page = 1, pageSize = 20, search = '') {
  const key = partyId ? `/api/treasury/receipts/eligible-sales-invoices?${buildQuery(normalizeParams({ partyId, page, pageSize, search }))}` : null;
  const { data, error, isLoading, mutate } = useSWR<ApiResponse<TreasuryEligibleInvoice[]>>(key, fetcher);
  return useMemo(() => ({ ...toListResult(data), error, isLoading, mutate, key }), [data, error, isLoading, key, mutate]);
}

export function useEligiblePurchaseInvoices(partyId?: string, page = 1, pageSize = 20, search = '') {
  const key = partyId ? `/api/treasury/payments/eligible-purchase-invoices?${buildQuery(normalizeParams({ partyId, page, pageSize, search }))}` : null;
  const { data, error, isLoading, mutate } = useSWR<ApiResponse<TreasuryEligibleInvoice[]>>(key, fetcher);
  return useMemo(() => ({ ...toListResult(data), error, isLoading, mutate, key }), [data, error, isLoading, key, mutate]);
}
