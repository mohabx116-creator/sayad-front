import { AxiosResponse } from 'axios';

import axiosServices from 'utils/axios';
import type { ApiResponse } from 'types/api';
import type {
  AssignPermissionsRequest,
  AssignRolesRequest,
  CreateRoleRequest,
  CreateUserRequest,
  ListMeta,
  PermissionDto,
  ResetPasswordRequest,
  RoleDto,
  UpdateRoleRequest,
  UpdateUserRequest,
  UserDto
} from '../types/administration.types';
import { getAdministrationApiBasePath } from '../utils/administration-scope';

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

export function createUser(request: CreateUserRequest) {
  return unwrap(axiosServices.post<ApiResponse<UserDto>>(`${getAdministrationApiBasePath()}/users`, request));
}

export function updateUser(id: string, request: UpdateUserRequest) {
  return unwrap(axiosServices.put<ApiResponse<UserDto>>(`${getAdministrationApiBasePath()}/users/${id}`, request));
}

export function deleteUser(id: string) {
  return unwrap(axiosServices.delete<ApiResponse<object>>(`${getAdministrationApiBasePath()}/users/${id}`));
}

export function activateUser(id: string) {
  return unwrap(axiosServices.post<ApiResponse<object>>(`${getAdministrationApiBasePath()}/users/${id}/activate`, {}));
}

export function deactivateUser(id: string) {
  return unwrap(axiosServices.post<ApiResponse<object>>(`${getAdministrationApiBasePath()}/users/${id}/deactivate`, {}));
}

export function lockUser(id: string) {
  return unwrap(axiosServices.post<ApiResponse<object>>(`${getAdministrationApiBasePath()}/users/${id}/lock`, {}));
}

export function unlockUser(id: string) {
  return unwrap(axiosServices.post<ApiResponse<object>>(`${getAdministrationApiBasePath()}/users/${id}/unlock`, {}));
}

export function resetUserPassword(id: string, request: ResetPasswordRequest) {
  return unwrap(axiosServices.post<ApiResponse<object>>(`${getAdministrationApiBasePath()}/users/${id}/reset-password`, request));
}

export function assignUserRoles(id: string, request: AssignRolesRequest) {
  return unwrap(axiosServices.put<ApiResponse<UserDto>>(`${getAdministrationApiBasePath()}/users/${id}/roles`, request));
}

export function createRole(request: CreateRoleRequest) {
  return unwrap(axiosServices.post<ApiResponse<RoleDto>>(`${getAdministrationApiBasePath()}/roles`, request));
}

export function updateRole(id: string, request: UpdateRoleRequest) {
  return unwrap(axiosServices.put<ApiResponse<RoleDto>>(`${getAdministrationApiBasePath()}/roles/${id}`, request));
}

export function activateRole(id: string) {
  return unwrap(axiosServices.post<ApiResponse<object>>(`${getAdministrationApiBasePath()}/roles/${id}/activate`, {}));
}

export function deactivateRole(id: string) {
  return unwrap(axiosServices.post<ApiResponse<object>>(`${getAdministrationApiBasePath()}/roles/${id}/deactivate`, {}));
}

export function assignRolePermissions(id: string, request: AssignPermissionsRequest) {
  return unwrap(axiosServices.put<ApiResponse<RoleDto>>(`${getAdministrationApiBasePath()}/roles/${id}/permissions`, request));
}

export function getPermissions() {
  return unwrap(axiosServices.get<ApiResponse<PermissionDto[]>>(`${getAdministrationApiBasePath()}/permissions`));
}
