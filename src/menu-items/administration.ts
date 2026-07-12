import { IconShieldLock, IconUsers } from '@tabler/icons-react';

import { NavItemType } from 'types';
import { ADMINISTRATION_PERMISSIONS, ADMINISTRATION_VIEW_PERMISSIONS } from 'modules/Administration/utils/administration.constants';

const icons = {
  IconShieldLock,
  IconUsers
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
      title: 'administration-roles-permissions',
      type: 'item',
      url: '/administration/roles',
      icon: icons.IconShieldLock,
      breadcrumbs: true,
      permission: ADMINISTRATION_PERMISSIONS.rolesView
    }
  ]
};

export default administration;
