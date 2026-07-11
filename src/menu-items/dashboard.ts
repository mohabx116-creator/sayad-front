// assets
import { IconDashboard } from '@tabler/icons-react';

// types
import { NavItemType } from 'types';

const icons = {
  IconDashboard: IconDashboard
};

// ==============================|| MENU ITEMS - DASHBOARD ||============================== //

const dashboard: NavItemType = {
  id: 'dashboard',
  title: 'لوحة التحكم',
  icon: icons.IconDashboard,
  type: 'group',
  children: [
    {
      id: 'default',
      title: 'لوحة التحكم',
      type: 'item',
      url: '/dashboard',
      icon: icons.IconDashboard,
      breadcrumbs: false
    }
  ]
};

export default dashboard;
