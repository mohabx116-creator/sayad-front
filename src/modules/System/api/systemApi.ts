import { AxiosResponse } from 'axios';

import axiosServices from 'utils/axios';
import type { ApiResponse } from 'types/api';
import type {
  RotateSystemOwnerRequest,
  SystemAuditLogDto,
  SystemDashboardDto,
  SystemMaintenanceDto,
  SystemOwnerDto,
  SystemOwnerIntegrityDto
} from '../types/system.types';

function unwrap<T>(request: Promise<AxiosResponse<ApiResponse<T>>>): Promise<T> {
  return request.then((response) => {
    const payload = response.data;
    if (!payload.success || payload.data == null) {
      throw new Error(payload.message || payload.errors[0] || 'Request failed');
    }

    return payload.data;
  });
}

function buildQuery(params: Record<string, string | number | boolean | undefined | null>) {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') search.set(key, String(value));
  });
  return search.toString();
}

export function getSystemDashboard() {
  return unwrap(axiosServices.get<ApiResponse<SystemDashboardDto>>('/api/system'));
}

export function getSystemOwner() {
  return unwrap(axiosServices.get<ApiResponse<SystemOwnerDto>>('/api/system/owner'));
}

export function getSystemOwnerIntegrity() {
  return unwrap(axiosServices.get<ApiResponse<SystemOwnerIntegrityDto>>('/api/system/owner/integrity'));
}

export function rotateSystemOwner(request: RotateSystemOwnerRequest) {
  return unwrap(axiosServices.post<ApiResponse<SystemOwnerDto>>('/api/system/owner/rotate', request));
}

export function getSystemAuditLogs(params: Record<string, string | number | boolean | undefined | null>) {
  return unwrap(axiosServices.get<ApiResponse<SystemAuditLogDto[]>>(`/api/system/audit?${buildQuery(params)}`));
}

export function getSystemMaintenance() {
  return unwrap(axiosServices.get<ApiResponse<SystemMaintenanceDto>>('/api/system/maintenance'));
}
