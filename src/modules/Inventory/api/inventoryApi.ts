import { AxiosResponse } from 'axios';

import axiosServices from 'utils/axios';
import type { ApiResponse } from 'types/api';
import type {
  CreateCategoryRequest,
  CreateItemRequest,
  CreateUnitRequest,
  ItemCategoryDto,
  ItemDto,
  UnitOfMeasureDto,
  UpdateItemRequest
} from '../types/inventory.types';

function unwrap<T>(request: Promise<AxiosResponse<ApiResponse<T>>>): Promise<T> {
  return request.then((response) => {
    const payload = response.data;
    if (!payload.success || payload.data == null) {
      throw new Error(payload.message || payload.errors[0] || 'Request failed');
    }

    return payload.data;
  });
}

export function createItem(request: CreateItemRequest) {
  return unwrap(axiosServices.post<ApiResponse<ItemDto>>('/api/inventory/items', request));
}

export function updateItem(id: string, request: UpdateItemRequest) {
  return unwrap(axiosServices.put<ApiResponse<ItemDto>>(`/api/inventory/items/${id}`, request));
}

export function activateItem(id: string) {
  return unwrap(axiosServices.post<ApiResponse<object>>(`/api/inventory/items/${id}/activate`, {}));
}

export function deactivateItem(id: string) {
  return unwrap(axiosServices.post<ApiResponse<object>>(`/api/inventory/items/${id}/deactivate`, {}));
}

export function createCategory(request: CreateCategoryRequest) {
  return unwrap(axiosServices.post<ApiResponse<ItemCategoryDto>>('/api/inventory/categories', request));
}

export function createUnit(request: CreateUnitRequest) {
  return unwrap(axiosServices.post<ApiResponse<UnitOfMeasureDto>>('/api/inventory/units', request));
}
