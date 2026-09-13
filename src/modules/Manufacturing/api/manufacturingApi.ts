import { AxiosResponse } from 'axios';

import axiosServices from 'utils/axios';
import type { ApiResponse } from 'types/api';
import type {
  BillOfMaterialsDto,
  BillOfMaterialsListItemDto,
  BillOfMaterialsListParams,
  CancelProductionOrderRequest,
  AddProductionOperationRequest,
  CompleteProductionOperationRequest,
  CreateBillOfMaterialsRequest,
  CreateProductionOrderRequest,
  IssueProductionMaterialsRequest,
  ListMeta,
  ProductionMaterialIssueDto,
  ProductionOperationDto,
  ProductionOrderActivityDto,
  ProductionOrderDto,
  ProductionOrderListItemDto,
  ProductionOrderListParams,
  ProductionReceiptDto,
  ReceiveProductionGoodsRequest,
  SetBillOfMaterialsActiveRequest,
  UpdateBillOfMaterialsRequest,
  UpdateProductionOperationRequest,
  UpdateProductionOrderRequest
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

// ==============================|| BILLS OF MATERIALS (BOM) API ||============================== //

export function listBoms(params?: BillOfMaterialsListParams) {
  return unwrapList<BillOfMaterialsListItemDto>(axiosServices.get('/api/manufacturing/boms', { params }));
}

export function getBom(id: string) {
  return unwrap(axiosServices.get<ApiResponse<BillOfMaterialsDto>>(`/api/manufacturing/boms/${id}`));
}

export function createBom(request: CreateBillOfMaterialsRequest) {
  return unwrap(axiosServices.post<ApiResponse<BillOfMaterialsDto>>('/api/manufacturing/boms', request));
}

export function updateBom(id: string, request: UpdateBillOfMaterialsRequest) {
  return unwrap(axiosServices.put<ApiResponse<BillOfMaterialsDto>>(`/api/manufacturing/boms/${id}`, request));
}

export function setBomActive(id: string, request: SetBillOfMaterialsActiveRequest) {
  return unwrap(axiosServices.post<ApiResponse<BillOfMaterialsDto>>(`/api/manufacturing/boms/${id}/active`, request));
}

export function deleteBom(id: string, rowVersion?: string | null) {
  return unwrap(
    axiosServices.delete<ApiResponse<object>>(`/api/manufacturing/boms/${id}`, {
      params: rowVersion ? { rowVersion } : undefined
    })
  );
}

// ==============================|| PRODUCTION ORDERS API ||============================== //

export function listProductionOrders(params?: ProductionOrderListParams) {
  return unwrapList<ProductionOrderListItemDto>(axiosServices.get('/api/manufacturing/orders', { params }));
}

export function getProductionOrder(id: string) {
  return unwrap(axiosServices.get<ApiResponse<ProductionOrderDto>>(`/api/manufacturing/orders/${id}`));
}

export function createProductionOrder(request: CreateProductionOrderRequest) {
  return unwrap(axiosServices.post<ApiResponse<ProductionOrderDto>>('/api/manufacturing/orders', request));
}

export function updateProductionOrder(id: string, request: UpdateProductionOrderRequest) {
  return unwrap(axiosServices.put<ApiResponse<ProductionOrderDto>>(`/api/manufacturing/orders/${id}`, request));
}

export function approveProductionOrder(id: string, rowVersion?: string | null) {
  return unwrap(
    axiosServices.post<ApiResponse<ProductionOrderDto>>(`/api/manufacturing/orders/${id}/approve`, {
      rowVersion
    })
  );
}

export function releaseProductionOrder(id: string, rowVersion?: string | null) {
  return unwrap(
    axiosServices.post<ApiResponse<ProductionOrderDto>>(`/api/manufacturing/orders/${id}/release`, {
      rowVersion
    })
  );
}

export function issueProductionMaterials(id: string, request: IssueProductionMaterialsRequest) {
  return unwrap(
    axiosServices.post<ApiResponse<ProductionMaterialIssueDto>>(`/api/manufacturing/orders/${id}/issue-materials`, request)
  );
}

export function receiveProductionGoods(id: string, request: ReceiveProductionGoodsRequest) {
  return unwrap(
    axiosServices.post<ApiResponse<ProductionReceiptDto>>(`/api/manufacturing/orders/${id}/receive-goods`, request)
  );
}

export function cancelProductionOrder(id: string, request: CancelProductionOrderRequest) {
  return unwrap(
    axiosServices.post<ApiResponse<object>>(`/api/manufacturing/orders/${id}/cancel`, request)
  );
}

export function closeProductionOrder(id: string, rowVersion?: string | null) {
  return unwrap(
    axiosServices.post<ApiResponse<ProductionOrderDto>>(`/api/manufacturing/orders/${id}/close`, {
      rowVersion
    })
  );
}



export function getProductionOrderTimeline(id: string) {
  return unwrap(
    axiosServices.get<ApiResponse<ProductionOrderActivityDto[]>>(`/api/manufacturing/orders/${id}/timeline`)
  );
}

export function getProductionOperations(orderId: string) {
  return unwrap(
    axiosServices.get<ApiResponse<ProductionOperationDto[]>>(`/api/manufacturing/orders/${orderId}/operations`)
  );
}

export function addProductionOperation(orderId: string, request: AddProductionOperationRequest) {
  return unwrap(
    axiosServices.post<ApiResponse<ProductionOperationDto>>(`/api/manufacturing/orders/${orderId}/operations`, request)
  );
}

export function updateProductionOperation(orderId: string, operationId: string, request: UpdateProductionOperationRequest) {
  return unwrap(
    axiosServices.put<ApiResponse<ProductionOperationDto>>(
      `/api/manufacturing/orders/${orderId}/operations/${operationId}`,
      request
    )
  );
}

export function startProductionOperation(orderId: string, operationId: string, rowVersion?: string | null) {
  return unwrap(
    axiosServices.post<ApiResponse<ProductionOperationDto>>(
      `/api/manufacturing/orders/${orderId}/operations/${operationId}/start`,
      { rowVersion }
    )
  );
}

export function completeProductionOperation(
  orderId: string,
  operationId: string,
  request: CompleteProductionOperationRequest
) {
  return unwrap(
    axiosServices.post<ApiResponse<ProductionOperationDto>>(
      `/api/manufacturing/orders/${orderId}/operations/${operationId}/complete`,
      request
    )
  );
}


