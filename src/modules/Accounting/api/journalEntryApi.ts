import { AxiosResponse } from 'axios';

import axiosServices from 'utils/axios';
import type { ApiResponse } from 'types/api';
import { JOURNAL_ENTRY_ACCOUNT_LOOKUP_PAGE_SIZE } from '../utils/journal-entry.constants';
import type {
  JournalEntryAccountLookupParams,
  JournalEntryCancelRequest,
  JournalEntryDto,
  JournalEntryListItemDto,
  JournalEntryListParams,
  JournalEntryRequest
} from '../types/journal-entry.types';

function unwrap<T>(request: Promise<AxiosResponse<ApiResponse<T>>>): Promise<T> {
  return request.then((response) => {
    const payload = response.data;
    if (!payload.success || payload.data == null) {
      throw new Error(payload.message || payload.errors[0] || 'Request failed');
    }

    return payload.data;
  });
}

function unwrapPaged<T>(request: Promise<AxiosResponse<ApiResponse<T[]>>>): Promise<{ items: T[]; meta: { page: number; pageSize: number; totalCount: number; totalPages: number } }> {
  return request.then((response) => ({
    items: response.data.data ?? [],
    meta: (response.data.meta as { page: number; pageSize: number; totalCount: number; totalPages: number }) ?? {
      page: 1,
      pageSize: 20,
      totalCount: 0,
      totalPages: 0
    }
  }));
}

function buildQuery(params: Record<string, string | number | boolean | undefined | null>) {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      search.set(key, String(value));
    }
  });

  return search.toString();
}

function normalizePageSize(pageSize?: number, max = JOURNAL_ENTRY_ACCOUNT_LOOKUP_PAGE_SIZE) {
  if (pageSize == null || Number.isNaN(pageSize)) {
    return undefined;
  }

  return Math.min(Math.max(1, pageSize), max);
}

export function listJournalEntries(params: JournalEntryListParams) {
  return unwrapPaged<JournalEntryListItemDto>(axiosServices.get('/api/accounting/journal-entries', { params }));
}

export function getJournalEntry(id: string) {
  return unwrap(axiosServices.get<ApiResponse<JournalEntryDto>>(`/api/accounting/journal-entries/${id}`));
}

export function getJournalEntryAccounts(params: JournalEntryAccountLookupParams = {}) {
  const normalized = { ...params, pageSize: normalizePageSize(params.pageSize) };
  return unwrapPaged(axiosServices.get('/api/accounting/journal-entries/accounts', { params: normalized }));
}

export function createJournalEntry(request: JournalEntryRequest) {
  return unwrap(axiosServices.post<ApiResponse<JournalEntryDto>>('/api/accounting/journal-entries', request));
}

export function updateJournalEntry(id: string, request: JournalEntryRequest & { rowVersion: string }) {
  return unwrap(axiosServices.put<ApiResponse<JournalEntryDto>>(`/api/accounting/journal-entries/${id}`, request));
}

export function postJournalEntry(id: string, rowVersion: string) {
  return unwrap(axiosServices.post<ApiResponse<JournalEntryDto>>(`/api/accounting/journal-entries/${id}/post`, { rowVersion }));
}

export function cancelJournalEntry(id: string, request: JournalEntryCancelRequest) {
  return unwrap(axiosServices.post<ApiResponse<JournalEntryDto>>(`/api/accounting/journal-entries/${id}/cancel`, request));
}
