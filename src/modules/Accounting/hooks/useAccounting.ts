import { useMemo } from 'react';
import useSWR from 'swr';

import { fetcher } from 'utils/axios';
import type { ApiResponse } from 'types/api';
import type {
  AccountingAccountDto,
  AccountingAccountListItemDto,
  AccountingAccountListParams,
  AccountingAccountParentLookupParams,
  AccountingAccountTreeNodeDto,
  AccountingAccountTreeParams,
  AccountingPagedMeta,
  AccountingAccountLookupDto
} from '../types/accounting.types';
import { ACCOUNTING_MAX_PAGE_SIZE, ACCOUNTING_PARENT_LOOKUP_PAGE_SIZE } from '../utils/accounting.constants';

function buildQuery(params: Record<string, string | number | boolean | undefined | null>) {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      search.set(key, String(value));
    }
  });

  return search.toString();
}

function normalizePageSize(pageSize?: number, max = ACCOUNTING_MAX_PAGE_SIZE) {
  if (pageSize == null || Number.isNaN(pageSize)) {
    return undefined;
  }

  return Math.min(Math.max(1, pageSize), max);
}

function toPagedResult<T>(data?: ApiResponse<T[]>) {
  return {
    items: data?.data ?? [],
    meta: (data?.meta as AccountingPagedMeta) ?? { page: 1, pageSize: 20, totalCount: 0, totalPages: 0 }
  };
}

export function useAccountingAccounts(params: AccountingAccountListParams) {
  const key = `/api/accounting/accounts?${buildQuery({ ...params, pageSize: normalizePageSize(params.pageSize) })}`;
  const { data, error, isLoading, mutate } = useSWR<ApiResponse<AccountingAccountListItemDto[]>>(key, fetcher);
  return useMemo(() => ({ ...toPagedResult(data), error, isLoading, mutate, key }), [data, error, isLoading, key, mutate]);
}

export function useAccountingAccount(id?: string) {
  const { data, error, isLoading, mutate } = useSWR<ApiResponse<AccountingAccountDto>>(id ? `/api/accounting/accounts/${id}` : null, fetcher);
  return useMemo(() => ({ account: data?.data ?? null, error, isLoading, mutate }), [data, error, isLoading, mutate]);
}

export function useAccountingAccountTree(params: AccountingAccountTreeParams = {}) {
  const key = `/api/accounting/accounts/tree?${buildQuery(params)}`;
  const { data, error, isLoading, mutate } = useSWR<ApiResponse<AccountingAccountTreeNodeDto[]>>(key, fetcher, { revalidateOnFocus: false });
  return useMemo(() => ({ tree: data?.data ?? [], error, isLoading, mutate, key }), [data, error, isLoading, key, mutate]);
}

export function useAccountingAccountParents(params: AccountingAccountParentLookupParams) {
  const key = `/api/accounting/accounts/parents?${buildQuery({ ...params, pageSize: normalizePageSize(params.pageSize, ACCOUNTING_PARENT_LOOKUP_PAGE_SIZE) })}`;
  const { data, error, isLoading, mutate } = useSWR<ApiResponse<AccountingAccountLookupDto[]>>(key, fetcher, { revalidateOnFocus: false });
  return useMemo(() => ({ ...toPagedResult(data), error, isLoading, mutate, key }), [data, error, isLoading, key, mutate]);
}

