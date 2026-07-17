import { useMemo } from 'react';
import useSWR from 'swr';

import { fetcher } from 'utils/axios';
import type { ApiResponse } from 'types/api';
import type { ListMeta, PermissionDto, RoleDto, UserDto } from '../types/administration.types';
import { getAdministrationApiBasePath } from '../utils/administration-scope';

function buildQuery(params: Record<string, string | number | boolean | undefined | null>) {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') search.set(key, String(value));
  });
  return search.toString();
}

function toListResult<T>(data?: ApiResponse<T[]>) {
  return {
    items: data?.data ?? [],
    meta: (data?.meta as ListMeta) ?? { page: 1, pageSize: 20, totalCount: 0, totalPages: 0 }
  };
}

export function useUsers(params: Record<string, string | number | boolean | undefined | null>) {
  const key = `${getAdministrationApiBasePath()}/users?${buildQuery(params)}`;
  const { data, error, isLoading, mutate } = useSWR<ApiResponse<UserDto[]>>(key, fetcher);
  return useMemo(() => ({ ...toListResult(data), error, isLoading, mutate, key }), [data, error, isLoading, key, mutate]);
}

export function useUser(id?: string) {
  const { data, error, isLoading, mutate } = useSWR<ApiResponse<UserDto>>(id ? `${getAdministrationApiBasePath()}/users/${id}` : null, fetcher);
  return useMemo(() => ({ user: data?.data ?? null, error, isLoading, mutate }), [data, error, isLoading, mutate]);
}

export function useRoles(params: Record<string, string | number | boolean | undefined | null> = {}) {
  const key = `${getAdministrationApiBasePath()}/roles?${buildQuery(params)}`;
  const { data, error, isLoading, mutate } = useSWR<ApiResponse<RoleDto[]>>(key, fetcher);
  return useMemo(() => ({ ...toListResult(data), error, isLoading, mutate, key }), [data, error, isLoading, key, mutate]);
}

export function useRole(id?: string) {
  const { data, error, isLoading, mutate } = useSWR<ApiResponse<RoleDto>>(id ? `${getAdministrationApiBasePath()}/roles/${id}` : null, fetcher);
  return useMemo(() => ({ role: data?.data ?? null, error, isLoading, mutate }), [data, error, isLoading, mutate]);
}

export function usePermissions() {
  const { data, error, isLoading, mutate } = useSWR<ApiResponse<PermissionDto[]>>(`${getAdministrationApiBasePath()}/permissions`, fetcher);
  return useMemo(() => ({ permissions: data?.data ?? [], error, isLoading, mutate }), [data, error, isLoading, mutate]);
}
