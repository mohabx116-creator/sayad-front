export type PermissionDto = {
  id: string;
  code: string;
  nameArabic: string;
  nameEnglish: string;
  module: string;
  descriptionArabic: string;
  descriptionEnglish: string;
  isActive: boolean;
};

export type RoleOptionDto = {
  id: string;
  name: string;
  isSystem: boolean;
  isActive: boolean;
};

export type RoleDto = {
  id: string;
  name: string;
  normalizedName: string;
  descriptionArabic: string;
  descriptionEnglish: string;
  isSystem: boolean;
  isActive: boolean;
  usersCount: number;
  permissionsCount: number;
  rowVersion: string;
  permissions: PermissionDto[];
};

export type UserDto = {
  id: string;
  displayName: string;
  email: string;
  isActive: boolean;
  isLocked: boolean;
  isSystemOwner: boolean;
  lastLoginAtUtc: string | null;
  createdAtUtc: string;
  updatedAtUtc: string | null;
  rowVersion: string;
  roles: RoleOptionDto[];
};

export type ListMeta = {
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
};

export type ListResult<T> = {
  items: T[];
  meta: ListMeta;
};

export type CreateUserRequest = {
  displayName: string;
  email: string;
  password: string;
  confirmPassword: string;
  roleIds: string[];
};

export type UpdateUserRequest = {
  displayName: string;
  email: string;
  rowVersion: string;
};

export type ResetPasswordRequest = {
  newPassword: string;
  confirmPassword: string;
};

export type AssignRolesRequest = {
  roleIds: string[];
};

export type CreateRoleRequest = {
  name: string;
  descriptionArabic: string;
  descriptionEnglish: string;
  permissionIds: string[];
};

export type UpdateRoleRequest = {
  name: string;
  descriptionArabic: string;
  descriptionEnglish: string;
  rowVersion: string;
};

export type AssignPermissionsRequest = {
  permissionIds: string[];
};
