// assets
import { IconBellRinging, IconDashboard } from '@tabler/icons-react';

// types
import { NavItemType } from 'types';

const icons = {
  IconBellRinging,
  IconDashboard
};

const dashboard: NavItemType = {
  id: 'dashboard',
  title: 'dashboard',
  icon: icons.IconDashboard,
  type: 'group',
  children: [
    {
      id: 'default',
      title: 'dashboard',
      type: 'item',
      url: '/dashboard',
      icon: icons.IconDashboard,
      breadcrumbs: false
    },
    {
      id: 'notifications',
      title: 'notifications-title',
      type: 'item',
      url: '/notifications',
      icon: icons.IconBellRinging,
      breadcrumbs: true,
      permission: 'notifications.view'
    }
  ]
};

export default dashboard;
