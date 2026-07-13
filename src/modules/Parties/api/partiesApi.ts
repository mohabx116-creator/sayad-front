import { AxiosResponse } from 'axios';

import axiosServices from 'utils/axios';
import type { ApiResponse } from 'types/api';
import type { CreatePartyRequest, ListMeta, PartyDto, PartyLedgerEntryDto, UpdatePartyRequest } from '../types/parties.types';

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

export function createParty(request: CreatePartyRequest) {
  return unwrap(axiosServices.post<ApiResponse<PartyDto>>('/api/parties', request));
}

export function updateParty(id: string, request: UpdatePartyRequest) {
  return unwrap(axiosServices.put<ApiResponse<PartyDto>>(`/api/parties/${id}`, request));
}

export function activateParty(id: string) {
  return unwrap(axiosServices.post<ApiResponse<object>>(`/api/parties/${id}/activate`, {}));
}

export function deactivateParty(id: string) {
  return unwrap(axiosServices.post<ApiResponse<object>>(`/api/parties/${id}/deactivate`, {}));
}

export function getPartyStatement(id: string) {
  return axiosServices.get<ApiResponse<PartyLedgerEntryDto[]>>(`/api/parties/${id}/statement`).then((response) => unwrapList(response.data));
}
