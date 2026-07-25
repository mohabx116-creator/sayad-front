import { AxiosResponse } from 'axios';

import axiosServices from 'utils/axios';
import type { ApiResponse } from 'types/api';
import type {
  ListMeta,
  MonthlyMovementDto,
  MonthlyMovementListParams,
  MonthlyMovementPreviewDto,
  MonthlyMovementRequest
} from '../types/monthlyMovements.types';

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

export function unwrapList<T>(response: ApiResponse<T[]>): { items: T[]; meta: ListMeta } {
  return {
    items: response.data ?? [],
    meta: (response.meta as ListMeta) ?? { page: 1, pageSize: 20, totalCount: 0, totalPages: 0 }
  };
}

export function getMonthlyMovements(params: MonthlyMovementListParams) {
  return unwrap(axiosServices.get<ApiResponse<MonthlyMovementDto[]>>(`/api/labor/monthly-movements?${buildQuery(params)}`));
}

export function getMonthlyMovement(id: string) {
  return unwrap(axiosServices.get<ApiResponse<MonthlyMovementDto>>(`/api/labor/monthly-movements/${id}`));
}

export function createMonthlyMovement(request: MonthlyMovementRequest) {
  return unwrap(axiosServices.post<ApiResponse<MonthlyMovementDto>>('/api/labor/monthly-movements', request));
}

export function updateMonthlyMovement(id: string, request: MonthlyMovementRequest) {
  return unwrap(axiosServices.put<ApiResponse<MonthlyMovementDto>>(`/api/labor/monthly-movements/${id}`, request));
}

export function deleteMonthlyMovement(id: string, rowVersion: string) {
  return unwrap(axiosServices.delete<ApiResponse<object>>(`/api/labor/monthly-movements/${id}`, { data: { rowVersion } }));
}

export function approveMonthlyMovement(id: string, rowVersion: string) {
  return unwrap(axiosServices.post<ApiResponse<MonthlyMovementDto>>(`/api/labor/monthly-movements/${id}/approve`, { rowVersion }));
}

export function rejectMonthlyMovement(id: string, rowVersion: string, reason: string) {
  return unwrap(axiosServices.post<ApiResponse<MonthlyMovementDto>>(`/api/labor/monthly-movements/${id}/reject`, { rowVersion, reason }));
}

export function previewMonthlyMovement(request: MonthlyMovementRequest) {
  return unwrap(axiosServices.post<ApiResponse<MonthlyMovementPreviewDto>>('/api/labor/monthly-movements/preview', request));
}
