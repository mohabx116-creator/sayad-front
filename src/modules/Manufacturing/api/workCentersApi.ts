import { AxiosResponse } from 'axios';

import axiosServices from 'utils/axios';
import type { ApiResponse } from 'types/api';
import type {
  ActivateWorkCenterRequest,
  CreateWorkCenterRequest,
  ListMeta,
  UpdateWorkCenterRequest,
  WorkCenterDto,
  WorkCenterListDto,
  WorkCenterListParams
} from '../types/manufacturing.types';

function unwrap<T>(request: Promise<AxiosResponse<ApiResponse<T>>>): Promise<T> {
  return request.then((response) => {
    const payload = response.data;
    if (!payload.success) {
      throw new Error(payload.message || (payload.errors && payload.errors[0]) || 'Request failed');
    }

    return payload.data as T;
  });
}

function unwrapList<T>(request: Promise<AxiosResponse<ApiResponse<T[]>>>): Promise<{ items: T[]; meta: ListMeta }> {
  return request.then((response) => ({
    items: response.data.data ?? [],
    meta: (response.data.meta as ListMeta) ?? { page: 1, pageSize: 20, totalCount: 0, totalPages: 0 }
  }));
}

export function getWorkCenters(params?: WorkCenterListParams) {
  return unwrapList<WorkCenterListDto>(axiosServices.get('/api/manufacturing/work-centers', { params }));
}

export function getWorkCenter(id: string) {
  return unwrap(axiosServices.get<ApiResponse<WorkCenterDto>>(`/api/manufacturing/work-centers/${id}`));
}

export function createWorkCenter(request: CreateWorkCenterRequest) {
  return unwrap(axiosServices.post<ApiResponse<WorkCenterDto>>('/api/manufacturing/work-centers', request));
}

export function updateWorkCenter(id: string, request: UpdateWorkCenterRequest) {
  return unwrap(axiosServices.put<ApiResponse<WorkCenterDto>>(`/api/manufacturing/work-centers/${id}`, request));
}

export function activateWorkCenter(id: string, request: ActivateWorkCenterRequest) {
  return unwrap(axiosServices.post<ApiResponse<WorkCenterDto>>(`/api/manufacturing/work-centers/${id}/activate`, request));
}

export function deleteWorkCenter(id: string, rowVersion?: string | null) {
  return unwrap(
    axiosServices.delete<ApiResponse<object>>(`/api/manufacturing/work-centers/${id}`, {
      params: rowVersion ? { rowVersion } : undefined
    })
  );
}
