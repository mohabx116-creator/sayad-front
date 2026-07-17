import { IconShieldLock, IconUsers, IconKey, IconFileAnalytics, IconTool, IconAlertTriangle } from '@tabler/icons-react';

import { NavItemType } from 'types';

const icons = {
  IconShieldLock,
  IconUsers,
  IconKey,
  IconFileAnalytics,
  IconTool,
  IconAlertTriangle
};

const system: NavItemType = {
  id: 'system',
  title: 'system-administration',
  icon: icons.IconShieldLock,
  type: 'group',
  systemOwnerOnly: true,
  children: [
    {
      id: 'system-dashboard',
      title: 'system-administration',
      type: 'item',
      url: '/system',
      icon: icons.IconShieldLock,
      breadcrumbs: true,
      systemOwnerOnly: true
    },
    {
      id: 'system-users',
      title: 'system-users',
      type: 'item',
      url: '/system/users',
      icon: icons.IconUsers,
      breadcrumbs: true,
      systemOwnerOnly: true
    },
    {
      id: 'system-roles',
      title: 'system-roles-permissions',
      type: 'item',
      url: '/system/roles',
      icon: icons.IconKey,
      breadcrumbs: true,
      systemOwnerOnly: true
    },
    {
      id: 'system-permissions',
      title: 'system-permissions',
      type: 'item',
      url: '/system/permissions',
      icon: icons.IconFileAnalytics,
      breadcrumbs: true,
      systemOwnerOnly: true
    },
    {
      id: 'system-audit',
      title: 'system-audit-log',
      type: 'item',
      url: '/system/audit',
      icon: icons.IconFileAnalytics,
      breadcrumbs: true,
      systemOwnerOnly: true
    },
    {
      id: 'system-maintenance',
      title: 'system-maintenance',
      type: 'item',
      url: '/system/maintenance',
      icon: icons.IconTool,
      breadcrumbs: true,
      systemOwnerOnly: true
    },
    {
      id: 'system-danger-zone',
      title: 'system-danger-zone',
      type: 'item',
      url: '/system/danger-zone',
      icon: icons.IconAlertTriangle,
      breadcrumbs: true,
      systemOwnerOnly: true
    }
  ]
};

export default system;
