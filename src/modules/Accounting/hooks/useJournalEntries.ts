import { useMemo } from 'react';
import useSWR from 'swr';

import { fetcher } from 'utils/axios';
import type { ApiResponse } from 'types/api';
import type { AccountingAccountLookupDto } from '../types/accounting.types';
import type {
  JournalEntryAccountLookupParams,
  JournalEntryDto,
  JournalEntryListItemDto,
  JournalEntryListParams
} from '../types/journal-entry.types';

function buildQuery(params: Record<string, string | number | boolean | undefined | null>) {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      search.set(key, String(value));
    }
  });

  return search.toString();
}

function toPagedResult<T>(data?: ApiResponse<T[]>) {
  return {
    items: data?.data ?? [],
    meta: (data?.meta as { page: number; pageSize: number; totalCount: number; totalPages: number }) ?? { page: 1, pageSize: 20, totalCount: 0, totalPages: 0 }
  };
}

export function useJournalEntries(params: JournalEntryListParams) {
  const key = `/api/accounting/journal-entries?${buildQuery(params)}`;
  const { data, error, isLoading, mutate } = useSWR<ApiResponse<JournalEntryListItemDto[]>>(key, fetcher, { revalidateOnFocus: false });
  return useMemo(() => ({ ...toPagedResult(data), error, isLoading, mutate, key }), [data, error, isLoading, key, mutate]);
}

export function useJournalEntry(id?: string) {
  const { data, error, isLoading, mutate } = useSWR<ApiResponse<JournalEntryDto>>(id ? `/api/accounting/journal-entries/${id}` : null, fetcher, {
    revalidateOnFocus: false
  });
  return useMemo(() => ({ entry: data?.data ?? null, error, isLoading, mutate }), [data, error, isLoading, mutate]);
}

export function useJournalEntryAccounts(params: JournalEntryAccountLookupParams) {
  const key = `/api/accounting/journal-entries/accounts?${buildQuery(params)}`;
  const { data, error, isLoading, mutate } = useSWR<ApiResponse<AccountingAccountLookupDto[]>>(key, fetcher, { revalidateOnFocus: false });
  return useMemo(
    () => ({
      items: data?.data ?? [],
      meta: (data?.meta as { page: number; pageSize: number; totalCount: number; totalPages: number }) ?? { page: 1, pageSize: 20, totalCount: 0, totalPages: 0 },
      error,
      isLoading,
      mutate,
      key
    }),
    [data, error, isLoading, key, mutate]
  );
}
