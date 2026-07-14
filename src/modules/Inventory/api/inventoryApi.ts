import { AxiosResponse } from 'axios';

import axiosServices from 'utils/axios';
import type { ApiResponse } from 'types/api';
import type {
  CorrectOpeningStockRequest,
  CreateItemPartyRelationRequest,
  CreatePartyItemRelationRequest,
  CreateCategoryRequest,
  CreateItemRequest,
  CreateUnitRequest,
  InventoryAdjustmentRequest,
  InventoryMovementRequest,
  ItemCategoryDto,
  ItemDto,
  ItemUnitInput,
  ItemUnitDto,
  PartyItemRelationDto,
  ReverseInventoryMovementRequest,
  UpdateCategoryRequest,
  UpdatePartyItemRelationRequest,
  UpdateUnitRequest,
  UnitOfMeasureDto,
  UpdateItemRequest,
  OpeningStockRequest,
  InventoryMovementDto
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

export function updateCategory(id: string, request: UpdateCategoryRequest) {
  return unwrap(axiosServices.put<ApiResponse<ItemCategoryDto>>(`/api/inventory/categories/${id}`, request));
}

export function activateCategory(id: string) {
  return unwrap(axiosServices.post<ApiResponse<object>>(`/api/inventory/categories/${id}/activate`, {}));
}

export function deactivateCategory(id: string) {
  return unwrap(axiosServices.post<ApiResponse<object>>(`/api/inventory/categories/${id}/deactivate`, {}));
}

export function createUnit(request: CreateUnitRequest) {
  return unwrap(axiosServices.post<ApiResponse<UnitOfMeasureDto>>('/api/inventory/units', request));
}

export function updateUnit(id: string, request: UpdateUnitRequest) {
  return unwrap(axiosServices.put<ApiResponse<UnitOfMeasureDto>>(`/api/inventory/units/${id}`, request));
}

export function activateUnit(id: string) {
  return unwrap(axiosServices.post<ApiResponse<object>>(`/api/inventory/units/${id}/activate`, {}));
}

export function deactivateUnit(id: string) {
  return unwrap(axiosServices.post<ApiResponse<object>>(`/api/inventory/units/${id}/deactivate`, {}));
}

export function deleteUnit(id: string) {
  return unwrap(axiosServices.delete<ApiResponse<object>>(`/api/inventory/units/${id}`));
}

export function getItemUnits(id: string) {
  return unwrap(axiosServices.get<ApiResponse<ItemUnitDto[]>>(`/api/inventory/items/${id}/units`));
}

export function setItemUnits(id: string, request: { units: ItemUnitInput[] }) {
  return unwrap(axiosServices.put<ApiResponse<ItemUnitDto[]>>(`/api/inventory/items/${id}/units`, request));
}

export function getItemOpeningStock(id: string, warehouseId?: string | null) {
  return unwrap(
    axiosServices.get<ApiResponse<{ movementId?: string | null; movementDate?: string | null; quantity: number; notes?: string | null }>>(
      `/api/inventory/items/${id}/opening-stock${warehouseId ? `?warehouseId=${warehouseId}` : ''}`
    )
  );
}

export function setItemOpeningStock(id: string, request: OpeningStockRequest) {
  return unwrap(axiosServices.put<ApiResponse<{ movementId?: string | null; movementDate?: string | null; quantity: number; notes?: string | null }>>(`/api/inventory/items/${id}/opening-stock`, request));
}

export function correctItemOpeningStock(id: string, request: CorrectOpeningStockRequest) {
  return unwrap(
    axiosServices.post<ApiResponse<{ movementId?: string | null; movementDate?: string | null; quantity: number; notes?: string | null }>>(`/api/inventory/items/${id}/opening-stock/correct`, request)
  );
}

export function postStockIn(id: string, request: InventoryMovementRequest) {
  return unwrap(axiosServices.post<ApiResponse<InventoryMovementDto>>(`/api/inventory/items/${id}/stock-in`, request));
}

export function postStockOut(id: string, request: InventoryMovementRequest) {
  return unwrap(axiosServices.post<ApiResponse<InventoryMovementDto>>(`/api/inventory/items/${id}/stock-out`, request));
}

export function postAdjustment(id: string, request: InventoryAdjustmentRequest) {
  return unwrap(axiosServices.post<ApiResponse<InventoryMovementDto>>(`/api/inventory/items/${id}/adjust`, request));
}

export function reverseMovement(id: string, request: ReverseInventoryMovementRequest) {
  return unwrap(axiosServices.post<ApiResponse<InventoryMovementDto>>(`/api/inventory/movements/${id}/reverse`, request));
}

export function getPartyItemRelations(params: string) {
  return unwrap(axiosServices.get<ApiResponse<PartyItemRelationDto[]>>(`/api/inventory/party-items${params ? `?${params}` : ''}`));
}

export function createPartyItemRelation(request: CreatePartyItemRelationRequest) {
  return unwrap(axiosServices.post<ApiResponse<PartyItemRelationDto>>('/api/inventory/party-items', request));
}

export function createItemPartyRelation(itemId: string, request: CreateItemPartyRelationRequest) {
  return unwrap(axiosServices.post<ApiResponse<PartyItemRelationDto>>(`/api/inventory/items/${itemId}/parties`, request));
}

export function updatePartyItemRelation(id: string, request: UpdatePartyItemRelationRequest) {
  return unwrap(axiosServices.put<ApiResponse<PartyItemRelationDto>>(`/api/inventory/party-items/${id}`, request));
}

export function activatePartyItemRelation(id: string) {
  return unwrap(axiosServices.post<ApiResponse<object>>(`/api/inventory/party-items/${id}/activate`, {}));
}

export function deactivatePartyItemRelation(id: string) {
  return unwrap(axiosServices.post<ApiResponse<object>>(`/api/inventory/party-items/${id}/deactivate`, {}));
}

export function deletePartyItemRelation(id: string) {
  return unwrap(axiosServices.delete<ApiResponse<object>>(`/api/inventory/party-items/${id}`));
}
