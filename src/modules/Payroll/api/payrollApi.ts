import { AxiosResponse } from 'axios';

import axiosServices from 'utils/axios';
import type { ApiResponse } from 'types/api';
import type {
  PayrollPeriodApprovalRequest,
  PayrollPeriodDetailDto,
  PayrollPeriodInput,
  PayrollPeriodListItemDto,
  PayrollPeriodListParams,
  PayrollListMeta,
  PayrollPaymentDetailDto,
  PayrollPaymentListItemDto,
  PayrollPeriodPaymentRequest,
  PayrollPeriodReopenRequest,
  PayrollPeriodUpdateInput,
  PayPayrollStatementsRequest,
  ReversePayrollPaymentRequest
} from '../types/payroll.types';

function buildQuery(params: Record<string, string | number | boolean | undefined | null>) {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      search.set(key, String(value));
    }
  });
  return search.toString();
}

function unwrap<T>(request: Promise<AxiosResponse<ApiResponse<T>>>): Promise<T> {
  return request.then((response) => {
    const payload = response.data;
    if (!payload.success || payload.data == null) {
      throw new Error(payload.message || payload.errors[0] || 'Request failed');
    }
    return payload.data;
  });
}

export function unwrapList<T>(response: ApiResponse<T[]>): { items: T[]; meta: PayrollListMeta } {
  return {
    items: response.data ?? [],
    meta: (response.meta as PayrollListMeta) ?? { page: 1, pageSize: 20, totalCount: 0, totalPages: 0 }
  };
}

export function getPayrollPeriods(params: PayrollPeriodListParams) {
  return unwrap(axiosServices.get<ApiResponse<PayrollPeriodListItemDto[]>>(`/api/payroll/periods?${buildQuery(params)}`));
}

export function getPayrollPeriod(id: string) {
  return unwrap(axiosServices.get<ApiResponse<PayrollPeriodDetailDto>>(`/api/payroll/periods/${id}`));
}

export function createPayrollPeriod(request: PayrollPeriodInput) {
  return unwrap(axiosServices.post<ApiResponse<PayrollPeriodDetailDto>>('/api/payroll/periods', request));
}

export function updatePayrollPeriod(id: string, request: PayrollPeriodUpdateInput) {
  return unwrap(axiosServices.put<ApiResponse<PayrollPeriodDetailDto>>(`/api/payroll/periods/${id}`, request));
}

export function calculatePayrollPeriod(id: string) {
  return unwrap(axiosServices.post<ApiResponse<PayrollPeriodDetailDto>>(`/api/payroll/periods/${id}/calculate`));
}

export function confirmPayrollPeriod(id: string) {
  return unwrap(axiosServices.post<ApiResponse<PayrollPeriodDetailDto>>(`/api/payroll/periods/${id}/confirm`));
}

export function recalculatePayrollPeriod(id: string) {
  return unwrap(axiosServices.post<ApiResponse<PayrollPeriodDetailDto>>(`/api/payroll/periods/${id}/recalculate`));
}

export function approvePayrollPeriod(id: string, request: PayrollPeriodApprovalRequest) {
  return unwrap(axiosServices.post<ApiResponse<PayrollPeriodDetailDto>>(`/api/payroll/periods/${id}/approve`, request));
}

export function reopenPayrollPeriod(id: string, request: PayrollPeriodReopenRequest) {
  return unwrap(axiosServices.post<ApiResponse<PayrollPeriodDetailDto>>(`/api/payroll/periods/${id}/reopen`, request));
}

export function payPayrollPeriod(id: string, request: PayrollPeriodPaymentRequest) {
  return unwrap(axiosServices.post<ApiResponse<PayrollPeriodDetailDto>>(`/api/payroll/periods/${id}/pay`, request));
}

export function payPayrollStatements(id: string, request: PayPayrollStatementsRequest) {
  return unwrap(axiosServices.post<ApiResponse<PayrollPeriodDetailDto>>(`/api/payroll/periods/${id}/pay-statements`, request));
}

export function getPayrollPeriodPayments(id: string) {
  return unwrap(axiosServices.get<ApiResponse<PayrollPaymentListItemDto[]>>(`/api/payroll/periods/${id}/payments`));
}

export function getPayrollPayment(id: string) {
  return unwrap(axiosServices.get<ApiResponse<PayrollPaymentDetailDto>>(`/api/payroll/payments/${id}`));
}

export function reversePayrollPayment(id: string, request: ReversePayrollPaymentRequest) {
  return unwrap(axiosServices.post<ApiResponse<PayrollPaymentDetailDto>>(`/api/payroll/payments/${id}/reverse`, request));
}

export function deletePayrollPeriod(id: string, rowVersion: string) {
  return unwrap(axiosServices.delete<ApiResponse<object>>(`/api/payroll/periods/${id}`, { data: { rowVersion } }));
}
