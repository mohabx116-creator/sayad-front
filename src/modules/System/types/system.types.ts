import type { ListMeta, PermissionDto, UserDto } from 'modules/Administration/types/administration.types';

export type SystemOwnerDto = {
  id: string;
  displayName: string;
  email: string;
  isActive: boolean;
  isLocked: boolean;
  isSystemOwner: boolean;
  createdAtUtc: string;
  updatedAtUtc: string | null;
  rowVersion: string;
  roles: string[];
};

export type SystemOwnerIntegrityDto = {
  isHealthy: boolean;
  ownerCount: number;
  ownerId: string | null;
  ownerEmail: string | null;
  ownerDisplayName: string | null;
  ownerIsActive: boolean | null;
  ownerIsLocked: boolean | null;
  ownerHasSystemAdministratorRole: boolean;
  issues: string[];
};

export type SystemInfrastructureStatusDto = {
  providerName: string;
  canConnect: boolean;
  pendingMigrationsCount: number;
  isHealthy: boolean;
};

export type SystemPrivilegedOperationDto = {
  createdAtUtc: string;
  action: string;
  entityName: string;
  entityId: string | null;
  actorName: string | null;
  actorEmail: string | null;
};

export type SystemDashboardDto = {
  owner: SystemOwnerDto;
  ownerIntegrity: SystemOwnerIntegrityDto;
  activeUsersCount: number;
  inactiveOrLockedUsersCount: number;
  rolesCount: number;
  permissionsCount: number;
  infrastructureStatus: SystemInfrastructureStatusDto;
  latestPrivilegedOperations: SystemPrivilegedOperationDto[];
};

export type MaintenanceCheckDto = {
  code: string;
  title: string;
  description: string;
  isHealthy: boolean;
  issueCount: number;
  issues: string[];
};

export type SystemMaintenanceDto = {
  infrastructureStatus: SystemInfrastructureStatusDto;
  checks: MaintenanceCheckDto[];
};

export type SystemAuditLogDto = {
  id: string;
  createdAtUtc: string;
  actorName: string | null;
  actorEmail: string | null;
  action: string;
  entityName: string;
  entityId: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  oldValuesJson: string | null;
  newValuesJson: string | null;
};

export type SystemAuditListMeta = ListMeta;

export type RotateSystemOwnerRequest = {
  targetUserId: string;
  currentOwnerPassword: string;
  reason: string;
  confirmationText: string;
};

export type SystemPermissionDto = PermissionDto;
export type SystemUserDto = UserDto;
