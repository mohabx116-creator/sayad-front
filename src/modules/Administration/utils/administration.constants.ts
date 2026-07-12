export const ADMINISTRATION_PERMISSIONS = {
  usersView: 'administration.users.view',
  usersCreate: 'administration.users.create',
  usersUpdate: 'administration.users.update',
  usersActivate: 'administration.users.activate',
  usersDeactivate: 'administration.users.deactivate',
  usersLock: 'administration.users.lock',
  usersUnlock: 'administration.users.unlock',
  usersResetPassword: 'administration.users.reset-password',
  usersAssignRoles: 'administration.users.assign-roles',
  rolesView: 'administration.roles.view',
  rolesCreate: 'administration.roles.create',
  rolesUpdate: 'administration.roles.update',
  rolesActivate: 'administration.roles.activate',
  rolesDeactivate: 'administration.roles.deactivate',
  rolesAssignPermissions: 'administration.roles.assign-permissions',
  permissionsView: 'administration.permissions.view'
} as const;

export type AdministrationPermission = (typeof ADMINISTRATION_PERMISSIONS)[keyof typeof ADMINISTRATION_PERMISSIONS];

export const ADMINISTRATION_VIEW_PERMISSIONS = [
  ADMINISTRATION_PERMISSIONS.usersView,
  ADMINISTRATION_PERMISSIONS.rolesView,
  ADMINISTRATION_PERMISSIONS.permissionsView
] as const;
