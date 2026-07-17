import { useMemo } from 'react';
import useSWR from 'swr';

import { fetcher } from 'utils/axios';
import type { ApiResponse } from 'types/api';
import type {
  SystemAuditLogDto,
  SystemDashboardDto,
  SystemMaintenanceDto,
  SystemOwnerDto,
  SystemOwnerIntegrityDto
} from '../types/system.types';
import type { ListMeta } from 'modules/Administration/types/administration.types';

function buildQuery(params: Record<string, string | number | boolean | undefined | null>) {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') search.set(key, String(value));
  });
  return search.toString();
}

export function useSystemDashboard() {
  const { data, error, isLoading, mutate } = useSWR<ApiResponse<SystemDashboardDto>>('/api/system', fetcher);
  return useMemo(() => ({ dashboard: data?.data ?? null, error, isLoading, mutate }), [data, error, isLoading, mutate]);
}

export function useSystemOwner() {
  const { data, error, isLoading, mutate } = useSWR<ApiResponse<SystemOwnerDto>>('/api/system/owner', fetcher);
  return useMemo(() => ({ owner: data?.data ?? null, error, isLoading, mutate }), [data, error, isLoading, mutate]);
}

export function useSystemOwnerIntegrity() {
  const { data, error, isLoading, mutate } = useSWR<ApiResponse<SystemOwnerIntegrityDto>>('/api/system/owner/integrity', fetcher);
  return useMemo(() => ({ integrity: data?.data ?? null, error, isLoading, mutate }), [data, error, isLoading, mutate]);
}

export function useSystemAuditLogs(params: Record<string, string | number | boolean | undefined | null>) {
  const key = `/api/system/audit?${buildQuery(params)}`;
  const { data, error, isLoading, mutate } = useSWR<ApiResponse<SystemAuditLogDto[]>>(key, fetcher);
  return useMemo(
    () => ({
      items: data?.data ?? [],
      meta: (data?.meta as ListMeta) ?? { page: 1, pageSize: 20, totalCount: 0, totalPages: 0 },
      error,
      isLoading,
      mutate,
      key
    }),
    [
    data,
    error,
    isLoading,
    key,
    mutate
    ]
  );
}

export function useSystemMaintenance() {
  const { data, error, isLoading, mutate } = useSWR<ApiResponse<SystemMaintenanceDto>>('/api/system/maintenance', fetcher);
  return useMemo(() => ({ maintenance: data?.data ?? null, error, isLoading, mutate }), [data, error, isLoading, mutate]);
}
