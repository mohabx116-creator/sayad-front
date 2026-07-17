import { AxiosResponse } from 'axios';

import axiosServices from 'utils/axios';
import type { ApiResponse } from 'types/api';
import { TREASURY_MAX_PAGE_SIZE } from '../utils/treasury.constants';
import type {
  TreasuryAccount,
  TreasuryAccountDeletionPreview,
  TreasuryAccountInput,
  TreasuryAccountListItem,
  TreasuryAccountFinalDeletionStrategy,
  TreasuryAccountingAccountLookup,
  TreasuryDashboardSummary,
  TreasuryEligibleInvoice,
  TreasuryLookups,
  TreasuryPagedMeta,
  TreasuryPayment,
  TreasuryPaymentInput,
  TreasuryPaymentListItem,
  TreasuryReceipt,
  TreasuryReceiptInput,
  TreasuryReceiptListItem,
  TreasuryStatement,
  TreasuryStatementParams,
  TreasuryTransfer,
  TreasuryTransferInput,
  TreasuryTransferListItem,
  TreasuryListParams
} from '../types/treasury.types';

function unwrap<T>(request: Promise<AxiosResponse<ApiResponse<T>>>): Promise<T> {
  return request.then((response) => {
    const payload = response.data;
    if (!payload.success || payload.data == null) {
      throw new Error(payload.message || payload.errors[0] || 'Request failed');
    }

    return payload.data;
  });
}

function unwrapPaged<T>(request: Promise<AxiosResponse<ApiResponse<T[]>>>): Promise<{ items: T[]; meta: TreasuryPagedMeta }> {
  return request.then((response) => ({
    items: response.data.data ?? [],
    meta: (response.data.meta as TreasuryPagedMeta) ?? { page: 1, pageSize: 20, totalCount: 0, totalPages: 0 }
  }));
}

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

function clampLookupParams<T extends { pageSize?: number }>(params: T) {
  return { ...params, pageSize: normalizePageSize(params.pageSize) };
}

// Accounts
export function listTreasuryAccounts(params: TreasuryListParams) {
  return unwrapPaged<TreasuryAccountListItem>(axiosServices.get('/api/treasury/accounts', { params: clampLookupParams(params) }));
}

export function getTreasuryAccount(id: string) {
  return unwrap(axiosServices.get<ApiResponse<TreasuryAccount>>(`/api/treasury/accounts/${id}`));
}

export function createTreasuryAccount(request: TreasuryAccountInput) {
  return unwrap(axiosServices.post<ApiResponse<TreasuryAccount>>('/api/treasury/accounts', request));
}

export function updateTreasuryAccount(id: string, request: TreasuryAccountInput & { rowVersion: string }) {
  return unwrap(axiosServices.put<ApiResponse<TreasuryAccount>>(`/api/treasury/accounts/${id}`, request));
}

export function getTreasuryAccountingAccountLookups(params: { page?: number; pageSize?: number; search?: string; treasuryAccountId?: string }) {
  return unwrapPaged<TreasuryAccountingAccountLookup>(axiosServices.get('/api/treasury/accounts/accounting-lookups', { params }));
}

export function activateTreasuryAccount(id: string, rowVersion: string) {
  return unwrap(axiosServices.post<ApiResponse<TreasuryAccount>>(`/api/treasury/accounts/${id}/activate`, { rowVersion }));
}

export function deactivateTreasuryAccount(id: string, rowVersion: string) {
  return unwrap(axiosServices.post<ApiResponse<TreasuryAccount>>(`/api/treasury/accounts/${id}/deactivate`, { rowVersion }));
}

export function deleteTreasuryAccount(id: string, request: { code: string; rowVersion: string }) {
  return unwrap(axiosServices.delete<ApiResponse<unknown>>(`/api/treasury/accounts/${id}`, { data: request }));
}

export function getTreasuryAccountDeletionPreview(id: string) {
  return unwrap(axiosServices.get<ApiResponse<TreasuryAccountDeletionPreview>>(`/api/treasury/accounts/${id}/deletion-preview`));
}

export function finalDeleteTreasuryAccount(
  id: string,
  request: {
    reason: string;
    code: string;
    rowVersion: string;
    ownerPassword: string;
    strategy: TreasuryAccountFinalDeletionStrategy;
    replacementAccountId: string | null;
  }
) {
  return unwrap(axiosServices.post<ApiResponse<unknown>>(`/api/treasury/accounts/${id}/final-delete`, request));
}

// Receipts
export function listTreasuryReceipts(params: TreasuryListParams) {
  return unwrapPaged<TreasuryReceiptListItem>(axiosServices.get('/api/treasury/receipts', { params: clampLookupParams(params) }));
}

export function getTreasuryReceipt(id: string) {
  return unwrap(axiosServices.get<ApiResponse<TreasuryReceipt>>(`/api/treasury/receipts/${id}`));
}

export function createTreasuryReceipt(request: TreasuryReceiptInput) {
  return unwrap(axiosServices.post<ApiResponse<TreasuryReceipt>>('/api/treasury/receipts', request));
}

export function updateTreasuryReceipt(id: string, request: TreasuryReceiptInput & { rowVersion: string }) {
  return unwrap(axiosServices.put<ApiResponse<TreasuryReceipt>>(`/api/treasury/receipts/${id}`, request));
}

export function postTreasuryReceipt(id: string, rowVersion: string) {
  return unwrap(axiosServices.post<ApiResponse<TreasuryReceipt>>(`/api/treasury/receipts/${id}/post`, { rowVersion }));
}

export function cancelTreasuryReceipt(id: string, request: { reason: string; rowVersion: string }) {
  return unwrap(axiosServices.post<ApiResponse<TreasuryReceipt>>(`/api/treasury/receipts/${id}/cancel`, request));
}

export function getEligibleSalesInvoices(params: { partyId: string; search?: string; page?: number; pageSize?: number }) {
  return unwrapPaged<TreasuryEligibleInvoice>(axiosServices.get('/api/treasury/receipts/eligible-sales-invoices', { params: clampLookupParams(params) }));
}

// Payments
export function listTreasuryPayments(params: TreasuryListParams) {
  return unwrapPaged<TreasuryPaymentListItem>(axiosServices.get('/api/treasury/payments', { params: clampLookupParams(params) }));
}

export function getTreasuryPayment(id: string) {
  return unwrap(axiosServices.get<ApiResponse<TreasuryPayment>>(`/api/treasury/payments/${id}`));
}

export function createTreasuryPayment(request: TreasuryPaymentInput) {
  return unwrap(axiosServices.post<ApiResponse<TreasuryPayment>>('/api/treasury/payments', request));
}

export function updateTreasuryPayment(id: string, request: TreasuryPaymentInput & { rowVersion: string }) {
  return unwrap(axiosServices.put<ApiResponse<TreasuryPayment>>(`/api/treasury/payments/${id}`, request));
}

export function postTreasuryPayment(id: string, rowVersion: string) {
  return unwrap(axiosServices.post<ApiResponse<TreasuryPayment>>(`/api/treasury/payments/${id}/post`, { rowVersion }));
}

export function cancelTreasuryPayment(id: string, request: { reason: string; rowVersion: string }) {
  return unwrap(axiosServices.post<ApiResponse<TreasuryPayment>>(`/api/treasury/payments/${id}/cancel`, request));
}

export function getEligiblePurchaseInvoices(params: { partyId: string; search?: string; page?: number; pageSize?: number }) {
  return unwrapPaged<TreasuryEligibleInvoice>(axiosServices.get('/api/treasury/payments/eligible-purchase-invoices', { params: clampLookupParams(params) }));
}

// Transfers
export function listTreasuryTransfers(params: TreasuryListParams) {
  return unwrapPaged<TreasuryTransferListItem>(axiosServices.get('/api/treasury/transfers', { params: clampLookupParams(params) }));
}

export function getTreasuryTransfer(id: string) {
  return unwrap(axiosServices.get<ApiResponse<TreasuryTransfer>>(`/api/treasury/transfers/${id}`));
}

export function createTreasuryTransfer(request: TreasuryTransferInput) {
  return unwrap(axiosServices.post<ApiResponse<TreasuryTransfer>>('/api/treasury/transfers', request));
}

export function updateTreasuryTransfer(id: string, request: TreasuryTransferInput & { rowVersion: string }) {
  return unwrap(axiosServices.put<ApiResponse<TreasuryTransfer>>(`/api/treasury/transfers/${id}`, request));
}

export function postTreasuryTransfer(id: string, rowVersion: string) {
  return unwrap(axiosServices.post<ApiResponse<TreasuryTransfer>>(`/api/treasury/transfers/${id}/post`, { rowVersion }));
}

export function cancelTreasuryTransfer(id: string, request: { reason: string; rowVersion: string }) {
  return unwrap(axiosServices.post<ApiResponse<TreasuryTransfer>>(`/api/treasury/transfers/${id}/cancel`, request));
}

// Statement and lookups
export function getTreasuryStatement(params: TreasuryStatementParams) {
  return unwrap(axiosServices.get<ApiResponse<TreasuryStatement>>('/api/treasury/statements', { params }));
}

export function getTreasuryLookups() {
  return unwrap(axiosServices.get<ApiResponse<TreasuryLookups>>('/api/treasury/lookups'));
}

export function getTreasuryDashboardSummary(params?: { dateFrom?: string; dateTo?: string }) {
  return unwrap(axiosServices.get<ApiResponse<TreasuryDashboardSummary>>('/api/treasury/dashboard/summary', { params }));
}

export { buildQuery };
