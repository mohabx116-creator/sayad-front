import { AxiosResponse } from 'axios';

import axiosServices from 'utils/axios';
import type { ApiResponse } from 'types/api';
import type { ListMeta } from '../types/inventory.types';
import type {
  CustomerMaterialConversionDto,
  CustomerMaterialConversionListItemDto,
  CustomerMaterialConversionRequest,
  CustomerMaterialDocumentActionRequest,
  CustomerMaterialDocumentCancelRequest,
  CustomerMaterialIntakeDto,
  CustomerMaterialIntakeListItemDto,
  CustomerMaterialIntakeRequest
} from '../types/customerMaterials.types';

function unwrap<T>(request: Promise<AxiosResponse<ApiResponse<T>>>): Promise<T> {
  return request.then((response) => {
    const payload = response.data;
    if (!payload.success || payload.data == null) {
      throw new Error(payload.message || payload.errors[0] || 'Request failed');
    }

    return payload.data;
  });
}

function unwrapPaged<T>(request: Promise<AxiosResponse<ApiResponse<T[]>>>): Promise<{ items: T[]; meta: ListMeta }> {
  return request.then((response) => {
    const payload = response.data;
    if (!payload.success || payload.data == null) {
      throw new Error(payload.message || payload.errors[0] || 'Request failed');
    }

    return {
      items: payload.data,
      meta: (payload.meta as ListMeta) ?? { page: 1, pageSize: 20, totalCount: 0, totalPages: 0 }
    };
  });
}

function buildQuery(params: Record<string, string | number | boolean | undefined | null>) {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      search.set(key, String(value));
    }
  });
  return search.toString();
}

export function listCustomerMaterialIntakes(params: Record<string, string | number | boolean | undefined | null>) {
  return unwrapPaged<CustomerMaterialIntakeListItemDto>(axiosServices.get('/api/inventory/customer-material-intakes', { params }));
}

export function getCustomerMaterialIntake(id: string) {
  return unwrap(axiosServices.get<ApiResponse<CustomerMaterialIntakeDto>>(`/api/inventory/customer-material-intakes/${id}`));
}

export function createCustomerMaterialIntake(request: CustomerMaterialIntakeRequest) {
  return unwrap(axiosServices.post<ApiResponse<CustomerMaterialIntakeDto>>('/api/inventory/customer-material-intakes', request));
}

export function updateCustomerMaterialIntake(id: string, request: CustomerMaterialIntakeRequest & CustomerMaterialDocumentActionRequest) {
  return unwrap(axiosServices.put<ApiResponse<CustomerMaterialIntakeDto>>(`/api/inventory/customer-material-intakes/${id}`, request));
}

export function postCustomerMaterialIntake(id: string, request: CustomerMaterialDocumentActionRequest) {
  return unwrap(axiosServices.post<ApiResponse<CustomerMaterialIntakeDto>>(`/api/inventory/customer-material-intakes/${id}/post`, request));
}

export function cancelCustomerMaterialIntake(id: string, request: CustomerMaterialDocumentCancelRequest & CustomerMaterialDocumentActionRequest) {
  return unwrap(axiosServices.post<ApiResponse<CustomerMaterialIntakeDto>>(`/api/inventory/customer-material-intakes/${id}/cancel`, request));
}

export function listCustomerMaterialConversions(params: Record<string, string | number | boolean | undefined | null>) {
  return unwrapPaged<CustomerMaterialConversionListItemDto>(axiosServices.get('/api/inventory/customer-material-conversions', { params }));
}

export function getCustomerMaterialConversion(id: string) {
  return unwrap(axiosServices.get<ApiResponse<CustomerMaterialConversionDto>>(`/api/inventory/customer-material-conversions/${id}`));
}

export function createCustomerMaterialConversion(request: CustomerMaterialConversionRequest) {
  return unwrap(axiosServices.post<ApiResponse<CustomerMaterialConversionDto>>('/api/inventory/customer-material-conversions', request));
}

export function updateCustomerMaterialConversion(id: string, request: CustomerMaterialConversionRequest & CustomerMaterialDocumentActionRequest) {
  return unwrap(axiosServices.put<ApiResponse<CustomerMaterialConversionDto>>(`/api/inventory/customer-material-conversions/${id}`, request));
}

export function postCustomerMaterialConversion(id: string, request: CustomerMaterialDocumentActionRequest) {
  return unwrap(axiosServices.post<ApiResponse<CustomerMaterialConversionDto>>(`/api/inventory/customer-material-conversions/${id}/post`, request));
}

export function cancelCustomerMaterialConversion(id: string, request: CustomerMaterialDocumentCancelRequest & CustomerMaterialDocumentActionRequest) {
  return unwrap(axiosServices.post<ApiResponse<CustomerMaterialConversionDto>>(`/api/inventory/customer-material-conversions/${id}/cancel`, request));
}

export function buildCustomerMaterialsQuery(params: Record<string, string | number | boolean | undefined | null>) {
  return buildQuery(params);
}

