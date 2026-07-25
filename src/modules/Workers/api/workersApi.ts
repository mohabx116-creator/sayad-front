import { AxiosResponse } from 'axios';

import axiosServices from 'utils/axios';
import type { ApiResponse } from 'types/api';
import type {
  CreateWorkerRequest,
  ListMeta,
  UpdateWorkerRequest,
  WorkerDto,
  WorkerListItemDto,
  WorkerListParams,
  WorkerWageProfileDto,
  WorkerWageProfileInput
} from '../types/workers.types';

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

export function getWorkers(params: WorkerListParams) {
  return unwrap(axiosServices.get<ApiResponse<WorkerListItemDto[]>>(`/api/labor/workers?${buildQuery(params)}`));
}

export function getWorker(id: string) {
  return unwrap(axiosServices.get<ApiResponse<WorkerDto>>(`/api/labor/workers/${id}`));
}

export function getWorkerWageProfiles(id: string) {
  return unwrap(axiosServices.get<ApiResponse<WorkerWageProfileDto[]>>(`/api/labor/workers/${id}/wage-profiles`));
}

export function createWorker(request: CreateWorkerRequest) {
  return unwrap(axiosServices.post<ApiResponse<WorkerDto>>('/api/labor/workers', request));
}

export function updateWorker(id: string, request: UpdateWorkerRequest) {
  return unwrap(axiosServices.put<ApiResponse<WorkerDto>>(`/api/labor/workers/${id}`, request));
}

export function activateWorker(id: string, rowVersion: string) {
  return unwrap(axiosServices.post<ApiResponse<WorkerDto>>(`/api/labor/workers/${id}/activate`, { rowVersion }));
}

export function deactivateWorker(id: string, rowVersion: string) {
  return unwrap(axiosServices.post<ApiResponse<WorkerDto>>(`/api/labor/workers/${id}/deactivate`, { rowVersion }));
}

export function deleteWorker(id: string, rowVersion: string) {
  return unwrap(axiosServices.delete<ApiResponse<object>>(`/api/labor/workers/${id}`, { data: { rowVersion } }));
}

export function upsertWorkerWageProfile(id: string, request: WorkerWageProfileInput) {
  return unwrap(axiosServices.post<ApiResponse<WorkerWageProfileDto>>(`/api/labor/workers/${id}/wage-profiles`, request));
}
