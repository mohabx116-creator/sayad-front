// assets
import { IconDashboard } from '@tabler/icons-react';

// types
import { NavItemType } from 'types';

const icons = {
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
    }
  ]
};

export default dashboard;
