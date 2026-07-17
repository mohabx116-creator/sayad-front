import { AxiosResponse } from 'axios';

import axiosServices from 'utils/axios';
import type { ApiResponse } from 'types/api';
import { ACCOUNTING_MAX_PAGE_SIZE, ACCOUNTING_PARENT_LOOKUP_PAGE_SIZE } from '../utils/accounting.constants';
import type {
  AccountingAccountDto,
  AccountingAccountLookupDto,
  AccountingAccountInput,
  AccountingAccountListItemDto,
  AccountingAccountListParams,
  AccountingAccountParentLookupParams,
  AccountingAccountTreeNodeDto,
  AccountingAccountTreeParams,
  AccountingPagedMeta
} from '../types/accounting.types';

function unwrap<T>(request: Promise<AxiosResponse<ApiResponse<T>>>): Promise<T> {
  return request.then((response) => {
    const payload = response.data;
    if (!payload.success || payload.data == null) {
      throw new Error(payload.message || payload.errors[0] || 'Request failed');
    }

    return payload.data;
  });
}

function unwrapPaged<T>(request: Promise<AxiosResponse<ApiResponse<T[]>>>): Promise<{ items: T[]; meta: AccountingPagedMeta }> {
  return request.then((response) => ({
    items: response.data.data ?? [],
    meta: (response.data.meta as AccountingPagedMeta) ?? { page: 1, pageSize: 20, totalCount: 0, totalPages: 0 }
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

function normalizePageSize(pageSize?: number, max = ACCOUNTING_MAX_PAGE_SIZE) {
  if (pageSize == null || Number.isNaN(pageSize)) {
    return undefined;
  }

  return Math.min(Math.max(1, pageSize), max);
}

export function listAccountingAccounts(params: AccountingAccountListParams) {
  const normalized = { ...params, pageSize: normalizePageSize(params.pageSize) };
  return unwrapPaged<AccountingAccountListItemDto>(axiosServices.get('/api/accounting/accounts', { params: normalized }));
}

export function getAccountingAccount(id: string) {
  return unwrap(axiosServices.get<ApiResponse<AccountingAccountDto>>(`/api/accounting/accounts/${id}`));
}

export function getAccountingAccountTree(params: AccountingAccountTreeParams = {}) {
  return unwrap(axiosServices.get<ApiResponse<AccountingAccountTreeNodeDto[]>>(`/api/accounting/accounts/tree?${buildQuery(params)}`));
}

export function getAccountingAccountParents(params: AccountingAccountParentLookupParams = {}) {
  const normalized = { ...params, pageSize: normalizePageSize(params.pageSize, ACCOUNTING_PARENT_LOOKUP_PAGE_SIZE) };
  return unwrapPaged<AccountingAccountLookupDto>(axiosServices.get('/api/accounting/accounts/parents', { params: normalized }));
}

export function createAccountingAccount(request: AccountingAccountInput) {
  return unwrap(axiosServices.post<ApiResponse<AccountingAccountDto>>('/api/accounting/accounts', request));
}

export function updateAccountingAccount(id: string, request: AccountingAccountInput & { rowVersion: string }) {
  return unwrap(axiosServices.put<ApiResponse<AccountingAccountDto>>(`/api/accounting/accounts/${id}`, request));
}

export function activateAccountingAccount(id: string, rowVersion: string) {
  return unwrap(axiosServices.post<ApiResponse<AccountingAccountDto>>(`/api/accounting/accounts/${id}/activate`, { rowVersion }));
}

export function deactivateAccountingAccount(id: string, rowVersion: string) {
  return unwrap(axiosServices.post<ApiResponse<AccountingAccountDto>>(`/api/accounting/accounts/${id}/deactivate`, { rowVersion }));
}

export function deleteAccountingAccount(id: string, request: { code: string; rowVersion: string }) {
  return unwrap(axiosServices.delete<ApiResponse<object>>(`/api/accounting/accounts/${id}`, { data: request }));
}
