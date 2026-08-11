import { AxiosResponse } from 'axios';

import axiosServices from 'utils/axios';
import type { ApiResponse } from 'types/api';
import type {
  ListMeta,
  PurchaseInvoice,
  PurchaseInvoiceInput,
  PurchaseInvoiceListItem,
  PurchaseListParams,
  PurchaseReturn,
  PurchaseReturnInput,
  PurchaseReturnListItem
} from '../types/purchases.types';
import { toInvoicePaymentMethodCode, type InvoicePaymentMethod } from 'shared/utils/invoiceSettlement';

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

export function listInvoices(params: PurchaseListParams) {
  return unwrapList<PurchaseInvoiceListItem>(axiosServices.get('/api/purchases/invoices', { params }));
}

export function getInvoice(id: string) {
  return unwrap(axiosServices.get<ApiResponse<PurchaseInvoice>>(`/api/purchases/invoices/${id}`));
}

export function createInvoice(request: PurchaseInvoiceInput) {
  return unwrap(
    axiosServices.post<ApiResponse<PurchaseInvoice>>('/api/purchases/invoices', {
      ...request,
      paymentMethod: toInvoicePaymentMethodCode(request.paymentMethod)
    })
  );
}

export function updateInvoice(id: string, request: PurchaseInvoiceInput & { rowVersion: string }) {
  return unwrap(
    axiosServices.put<ApiResponse<PurchaseInvoice>>(`/api/purchases/invoices/${id}`, {
      ...request,
      paymentMethod: toInvoicePaymentMethodCode(request.paymentMethod)
    })
  );
}

export function postInvoice(id: string, rowVersion: string) {
  return unwrap(axiosServices.post<ApiResponse<PurchaseInvoice>>(`/api/purchases/invoices/${id}/post`, { rowVersion }));
}

export function payInvoice(
  id: string,
  request: {
    rowVersion: string;
    paymentMethod: InvoicePaymentMethod;
    treasuryAccountId: string;
  }
) {
  return unwrap(
    axiosServices.post<ApiResponse<PurchaseInvoice>>(`/api/purchases/invoices/${id}/pay`, {
      ...request,
      paymentMethod: toInvoicePaymentMethodCode(request.paymentMethod)
    })
  );
}

export function cancelInvoice(id: string, request: { reason: string; rowVersion: string }) {
  return unwrap(axiosServices.post<ApiResponse<PurchaseInvoice>>(`/api/purchases/invoices/${id}/cancel`, request));
}

export function listReturns(params: PurchaseListParams) {
  return unwrapList<PurchaseReturnListItem>(axiosServices.get('/api/purchases/returns', { params }));
}

export function getReturn(id: string) {
  return unwrap(axiosServices.get<ApiResponse<PurchaseReturn>>(`/api/purchases/returns/${id}`));
}

export function createReturn(request: PurchaseReturnInput) {
  return unwrap(axiosServices.post<ApiResponse<PurchaseReturn>>('/api/purchases/returns', request));
}

export function updateReturn(id: string, request: PurchaseReturnInput & { rowVersion: string }) {
  return unwrap(axiosServices.put<ApiResponse<PurchaseReturn>>(`/api/purchases/returns/${id}`, request));
}

export function postReturn(id: string, rowVersion: string) {
  return unwrap(axiosServices.post<ApiResponse<PurchaseReturn>>(`/api/purchases/returns/${id}/post`, { rowVersion }));
}

export function cancelReturn(id: string, request: { reason: string; rowVersion: string }) {
  return unwrap(axiosServices.post<ApiResponse<PurchaseReturn>>(`/api/purchases/returns/${id}/cancel`, request));
}
