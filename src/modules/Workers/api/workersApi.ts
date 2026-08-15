import { AxiosResponse } from 'axios';

import axiosServices from 'utils/axios';
import type { ApiResponse } from 'types/api';
import type {
  CreateWorkerRequest,
  WorkerImportCommitRequest,
  WorkerImportCommitResultDto,
  WorkerImportPreviewResultDto,
  ListMeta,
  UpdateWorkerRequest,
  WorkerMonthlySalaryDto,
  WorkerMonthlySalaryListItemDto,
  WorkerMonthlySalaryReportDto,
  WorkerMonthlySalaryReportParams,
  WorkerMonthlySalaryRequest,
  WorkerMonthlySalaryPaymentRequest,
  WorkerDto,
  WorkerListItemDto,
  WorkerListParams,
  WorkerSalarySettingsDto,
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

export function getWorkerSalarySettings(id: string) {
  return unwrap(axiosServices.get<ApiResponse<WorkerSalarySettingsDto>>(`/api/labor/workers/${id}/salary-settings`));
}

export async function exportWorkersToExcel() {
  const response = await axiosServices.get<Blob>('/api/labor/workers/export', { responseType: 'blob' });
  return response.data;
}

export async function downloadWorkersImportTemplate() {
  const response = await axiosServices.get<Blob>('/api/labor/workers/template', { responseType: 'blob' });
  return response.data;
}

export function previewWorkersImport(file: File) {
  const formData = new FormData();
  formData.append('file', file);
  return unwrap(axiosServices.post<ApiResponse<WorkerImportPreviewResultDto>>('/api/labor/workers/import/preview', formData));
}

export function commitWorkersImport(request: WorkerImportCommitRequest) {
  return unwrap(axiosServices.post<ApiResponse<WorkerImportCommitResultDto>>('/api/labor/workers/import/commit', request));
}

export function getWorkerMonthlySalaries(id: string) {
  return unwrap(axiosServices.get<ApiResponse<WorkerMonthlySalaryListItemDto[]>>(`/api/labor/workers/${id}/monthly-salaries`));
}

export function getWorkerMonthlySalary(id: string, salaryId: string) {
  return unwrap(axiosServices.get<ApiResponse<WorkerMonthlySalaryDto>>(`/api/labor/workers/${id}/monthly-salaries/${salaryId}`));
}

export function getWorkerMonthlySalaryReport(params: WorkerMonthlySalaryReportParams) {
  return unwrap(axiosServices.get<ApiResponse<WorkerMonthlySalaryReportDto>>(`/api/labor/workers/monthly-salaries/report?${buildQuery(params)}`));
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

export function createWorkerMonthlySalary(id: string, request: WorkerMonthlySalaryRequest) {
  return unwrap(axiosServices.post<ApiResponse<WorkerMonthlySalaryDto>>(`/api/labor/workers/${id}/monthly-salaries`, request));
}

export function payWorkerMonthlySalary(id: string, monthlySalaryId: string, request: WorkerMonthlySalaryPaymentRequest) {
  return unwrap(axiosServices.post<ApiResponse<WorkerMonthlySalaryDto>>(`/api/labor/workers/${id}/monthly-salaries/${monthlySalaryId}/pay`, request));
}
