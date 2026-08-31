import { AxiosResponse } from 'axios';

import axiosServices from 'utils/axios';
import type { ApiResponse } from 'types/api';
import type { ListMeta } from 'modules/Workers/types/workers.types';
import type {
  WorkerOperationDto,
  WorkerOperationListItemDto,
  WorkerOperationListParams,
  WorkerOperationRequest,
  UpdateWorkerOperationRequest
} from '../types/operations.types';

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

export function getOperations(params: WorkerOperationListParams) {
  return unwrap(axiosServices.get<ApiResponse<WorkerOperationListItemDto[]>>(`/api/labor/operations?${buildQuery(params)}`));
}

export function getOperation(id: string) {
  return unwrap(axiosServices.get<ApiResponse<WorkerOperationDto>>(`/api/labor/operations/${id}`));
}

export function createOperation(request: WorkerOperationRequest) {
  return unwrap(axiosServices.post<ApiResponse<WorkerOperationDto>>('/api/labor/operations', request));
}

export function updateOperation(id: string, request: UpdateWorkerOperationRequest) {
  return unwrap(axiosServices.put<ApiResponse<WorkerOperationDto>>(`/api/labor/operations/${id}`, request));
}

export function deleteOperation(id: string, rowVersion: string) {
  return unwrap(axiosServices.delete<ApiResponse<object>>(`/api/labor/operations/${id}`, { data: { rowVersion } }));
}
