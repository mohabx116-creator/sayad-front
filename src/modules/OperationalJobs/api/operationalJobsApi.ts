import { AxiosResponse } from 'axios';

import axiosServices from 'utils/axios';
import type { ApiResponse } from 'types/api';
import type {
  ListMeta,
  OperationalJobDto,
  OperationalJobListItemDto,
  OperationalJobListParams,
  OperationalJobRequest,
  UpdateOperationalJobRequest
} from '../types/operationalJobs.types';

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

export function getOperationalJobs(params: OperationalJobListParams) {
  return unwrap(axiosServices.get<ApiResponse<OperationalJobListItemDto[]>>(`/api/labor/operational-jobs?${buildQuery(params)}`));
}

export function getOperationalJob(id: string) {
  return unwrap(axiosServices.get<ApiResponse<OperationalJobDto>>(`/api/labor/operational-jobs/${id}`));
}

export function createOperationalJob(request: OperationalJobRequest) {
  return unwrap(axiosServices.post<ApiResponse<OperationalJobDto>>('/api/labor/operational-jobs', request));
}

export function updateOperationalJob(id: string, request: UpdateOperationalJobRequest) {
  return unwrap(axiosServices.put<ApiResponse<OperationalJobDto>>(`/api/labor/operational-jobs/${id}`, request));
}

export function activateOperationalJob(id: string, rowVersion: string) {
  return unwrap(axiosServices.post<ApiResponse<OperationalJobDto>>(`/api/labor/operational-jobs/${id}/activate`, { rowVersion }));
}

export function deactivateOperationalJob(id: string, rowVersion: string) {
  return unwrap(axiosServices.post<ApiResponse<OperationalJobDto>>(`/api/labor/operational-jobs/${id}/deactivate`, { rowVersion }));
}

export function deleteOperationalJob(id: string, rowVersion: string) {
  return unwrap(axiosServices.delete<ApiResponse<object>>(`/api/labor/operational-jobs/${id}`, { data: { rowVersion } }));
}
