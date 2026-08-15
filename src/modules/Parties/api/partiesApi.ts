import { AxiosResponse } from 'axios';

import axiosServices from 'utils/axios';
import type { ApiResponse } from 'types/api';
import type {
  CorrectOpeningBalanceRequest,
  CreatePartyAdjustmentRequest,
  CreatePartyRequest,
  PartyImportCommitRequest,
  PartyImportCommitResultDto,
  PartyImportPreviewResultDto,
  ListMeta,
  OpeningBalanceDto,
  OpeningBalanceRequest,
  PartyDeletionPreview,
  PartyAdjustmentDto,
  PartyDto,
  PartyFinalDeleteRequest,
  PartyCashTransactionRequest,
  ReversePartyAdjustmentRequest,
  PartyStatementDto,
  PartyStatementParams,
  UpdatePartyRequest
} from '../types/parties.types';

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

export async function exportPartiesToExcel() {
  const response = await axiosServices.get<Blob>('/api/parties/export', { responseType: 'blob' });
  return response.data;
}

export async function downloadPartiesImportTemplate() {
  const response = await axiosServices.get<Blob>('/api/parties/template', { responseType: 'blob' });
  return response.data;
}

export function previewPartiesImport(file: File) {
  const formData = new FormData();
  formData.append('file', file);
  return unwrap(axiosServices.post<ApiResponse<PartyImportPreviewResultDto>>('/api/parties/import/preview', formData));
}

export function commitPartiesImport(request: PartyImportCommitRequest) {
  return unwrap(axiosServices.post<ApiResponse<PartyImportCommitResultDto>>('/api/parties/import/commit', request));
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

export function getPartyDeletionPreview(id: string) {
  return unwrap(axiosServices.get<ApiResponse<PartyDeletionPreview>>(`/api/parties/${id}/deletion-preview`));
}

export function finalDeleteParty(id: string, request: PartyFinalDeleteRequest) {
  return unwrap(axiosServices.post<ApiResponse<object>>(`/api/parties/${id}/final-delete`, request));
}

export function getPartyOpeningBalance(id: string) {
  return unwrap(axiosServices.get<ApiResponse<OpeningBalanceDto>>(`/api/parties/${id}/opening-balance`));
}

export function setPartyOpeningBalance(id: string, request: OpeningBalanceRequest) {
  return unwrap(axiosServices.put<ApiResponse<OpeningBalanceDto>>(`/api/parties/${id}/opening-balance`, request));
}

export function correctPartyOpeningBalance(id: string, request: CorrectOpeningBalanceRequest) {
  return unwrap(axiosServices.post<ApiResponse<OpeningBalanceDto>>(`/api/parties/${id}/opening-balance/correct`, request));
}

export function getPartyStatement(id: string, params?: PartyStatementParams) {
  return unwrap(axiosServices.get<ApiResponse<PartyStatementDto>>(`/api/parties/${id}/statement`, { params }));
}

export function createCustomerReceipt(id: string, request: PartyCashTransactionRequest) {
  return unwrap(axiosServices.post<ApiResponse<object>>(`/api/parties/${id}/customer-receipts`, request));
}

export function createSupplierPayment(id: string, request: PartyCashTransactionRequest) {
  return unwrap(axiosServices.post<ApiResponse<object>>(`/api/parties/${id}/supplier-payments`, request));
}

export function createPartyAdjustment(id: string, request: CreatePartyAdjustmentRequest) {
  return unwrap(axiosServices.post<ApiResponse<PartyAdjustmentDto>>(`/api/parties/${id}/adjustments`, request));
}

export function reversePartyAdjustment(id: string, adjustmentId: string, request: ReversePartyAdjustmentRequest) {
  return unwrap(axiosServices.post<ApiResponse<PartyAdjustmentDto>>(`/api/parties/${id}/adjustments/${adjustmentId}/reverse`, request));
}
