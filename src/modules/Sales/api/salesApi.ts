import { AxiosResponse } from 'axios';

import axiosServices from 'utils/axios';
import type { ApiResponse } from 'types/api';
import type {
  ListMeta,
  SalesInvoice,
  SalesInvoiceInput,
  SalesInvoiceListItem,
  SalesListParams,
  SalesReturn,
  SalesReturnInput,
  SalesReturnListItem,
  SalesReturnableLine
} from '../types/sales.types';

function unwrap<T>(request: Promise<AxiosResponse<ApiResponse<T>>>): Promise<T> {
  return request.then((response) => {
    const payload = response.data;
    if (!payload.success || payload.data == null) {
      throw new Error(payload.message || payload.errors[0] || 'Request failed');
    }

    return payload.data;
  });
}

function unwrapList<T>(request: Promise<AxiosResponse<ApiResponse<T[]>>>): Promise<{ items: T[]; meta: ListMeta }> {
  return request.then((response) => ({
    items: response.data.data ?? [],
    meta: (response.data.meta as ListMeta) ?? { page: 1, pageSize: 20, totalCount: 0, totalPages: 0 }
  }));
}

export function listInvoices(params: SalesListParams) {
  return unwrapList<SalesInvoiceListItem>(axiosServices.get('/api/sales/invoices', { params }));
}

export function getInvoice(id: string) {
  return unwrap(axiosServices.get<ApiResponse<SalesInvoice>>(`/api/sales/invoices/${id}`));
}

export function createInvoice(request: SalesInvoiceInput) {
  return unwrap(axiosServices.post<ApiResponse<SalesInvoice>>('/api/sales/invoices', request));
}

export function updateInvoice(id: string, request: SalesInvoiceInput & { rowVersion: string }) {
  return unwrap(axiosServices.put<ApiResponse<SalesInvoice>>(`/api/sales/invoices/${id}`, request));
}

export function postInvoice(id: string, rowVersion: string) {
  return unwrap(axiosServices.post<ApiResponse<SalesInvoice>>(`/api/sales/invoices/${id}/post`, { rowVersion }));
}

export function cancelInvoice(id: string, request: { reason: string; rowVersion: string }) {
  return unwrap(axiosServices.post<ApiResponse<SalesInvoice>>(`/api/sales/invoices/${id}/cancel`, request));
}

export function listReturns(params: SalesListParams) {
  return unwrapList<SalesReturnListItem>(axiosServices.get('/api/sales/returns', { params }));
}

export function getReturn(id: string) {
  return unwrap(axiosServices.get<ApiResponse<SalesReturn>>(`/api/sales/returns/${id}`));
}

export function getReturnableLines(salesInvoiceId: string) {
  return unwrap(
    axiosServices.get<ApiResponse<SalesReturnableLine[]>>(`/api/sales/invoices/${salesInvoiceId}/returnable-lines`)
  );
}

export function createReturn(request: SalesReturnInput) {
  return unwrap(axiosServices.post<ApiResponse<SalesReturn>>('/api/sales/returns', request));
}

export function updateReturn(id: string, request: SalesReturnInput & { rowVersion: string }) {
  return unwrap(axiosServices.put<ApiResponse<SalesReturn>>(`/api/sales/returns/${id}`, request));
}

export function postReturn(id: string, rowVersion: string) {
  return unwrap(axiosServices.post<ApiResponse<SalesReturn>>(`/api/sales/returns/${id}/post`, { rowVersion }));
}

export function cancelReturn(id: string, request: { reason: string; rowVersion: string }) {
  return unwrap(axiosServices.post<ApiResponse<SalesReturn>>(`/api/sales/returns/${id}/cancel`, request));
}

export function getSalesInvoicesReport(params: import('../types/sales.types').SalesInvoicesReportQuery) {
  return unwrap(axiosServices.get<ApiResponse<import('../types/sales.types').SalesInvoicesReportResponse>>('/api/reports/sales/invoices', { params }));
}
