import { IconAlertTriangle, IconFileAnalytics, IconShieldLock, IconTool, IconUsers } from '@tabler/icons-react';

import { NavItemType } from 'types';
import { ADMINISTRATION_PERMISSIONS, ADMINISTRATION_VIEW_PERMISSIONS } from 'modules/Administration/utils/administration.constants';

const icons = {
  IconShieldLock,
  IconUsers,
  IconFileAnalytics,
  IconTool,
  IconAlertTriangle
};

const administration: NavItemType = {
  id: 'administration',
  title: 'administration',
  icon: icons.IconShieldLock,
  type: 'group',
  anyPermissions: [...ADMINISTRATION_VIEW_PERMISSIONS],
  children: [
    {
      id: 'administration-users',
      title: 'administration-users',
      type: 'item',
      url: '/administration/users',
      icon: icons.IconUsers,
      breadcrumbs: true,
      permission: ADMINISTRATION_PERMISSIONS.usersView
    },
    {
      id: 'administration-roles',
      title: 'roles',
      type: 'item',
      url: '/administration/roles',
      icon: icons.IconFileAnalytics,
      breadcrumbs: true,
      permission: ADMINISTRATION_PERMISSIONS.rolesView
    },
    {
      id: 'administration-permissions',
      title: 'permissions',
      type: 'item',
      url: '/system/permissions',
      icon: icons.IconFileAnalytics,
      breadcrumbs: true,
      systemOwnerOnly: true
    },
    {
      id: 'administration-audit-log',
      title: 'system-audit-log',
      type: 'item',
      url: '/system/audit',
      icon: icons.IconFileAnalytics,
      breadcrumbs: true,
      systemOwnerOnly: true
    },
    {
      id: 'administration-system-maintenance',
      title: 'system-maintenance',
      type: 'item',
      url: '/system/maintenance',
      icon: icons.IconTool,
      breadcrumbs: true,
      systemOwnerOnly: true
    },
    {
      id: 'administration-danger-zone',
      title: 'system-danger-zone',
      type: 'item',
      url: '/system/danger-zone',
      icon: icons.IconAlertTriangle,
      breadcrumbs: true,
      systemOwnerOnly: true
    }
  ]
};

export default administration;
