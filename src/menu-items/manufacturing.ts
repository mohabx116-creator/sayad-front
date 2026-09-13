import { IconBuildingFactory2, IconListCheck, IconDashboard, IconReport, IconSettings, IconTool } from '@tabler/icons-react';

import { NavItemType } from 'types';
import {
  MANUFACTURING_PERMISSIONS,
  MANUFACTURING_VIEW_PERMISSIONS
} from 'modules/Manufacturing/utils/manufacturing.constants';

const icons = {
  IconBuildingFactory2,
  IconListCheck,
  IconDashboard,
  IconReport,
  IconSettings,
  IconTool
};

const manufacturing: NavItemType = {
  id: 'manufacturing',
  title: 'manufacturing',
  icon: icons.IconBuildingFactory2,
  type: 'group',
  anyPermissions: [...MANUFACTURING_VIEW_PERMISSIONS],
  children: [
    {
      id: 'manufacturing-boms',
      title: 'manufacturing-boms',
      type: 'item',
      url: '/manufacturing/boms',
      icon: icons.IconListCheck,
      breadcrumbs: true,
      permission: MANUFACTURING_PERMISSIONS.bomsView
    },
    {
      id: 'manufacturing-orders',
      title: 'manufacturing-orders',
      type: 'item',
      url: '/manufacturing/orders',
      icon: icons.IconBuildingFactory2,
      breadcrumbs: true,
      permission: MANUFACTURING_PERMISSIONS.ordersView
    },
    {
      id: 'manufacturing-setup',
      title: 'manufacturing-setup',
      type: 'collapse',
      icon: icons.IconSettings,
      permission: MANUFACTURING_PERMISSIONS.workCentersView,
      children: [
        {
          id: 'manufacturing-work-centers',
          title: 'manufacturing-work-centers',
          type: 'item',
          url: '/manufacturing/work-centers',
          icon: icons.IconTool,
          breadcrumbs: true,
          permission: MANUFACTURING_PERMISSIONS.workCentersView
        }
      ]
    },
    {
      id: 'manufacturing-dashboard',
      title: 'manufacturing-dashboard',
      type: 'item',
      url: '/manufacturing/dashboard',
      icon: icons.IconDashboard,
      breadcrumbs: true,
      permission: MANUFACTURING_PERMISSIONS.dashboardView
    },
    {
      id: 'manufacturing-reports',
      title: 'manufacturing-reports',
      type: 'collapse',
      icon: icons.IconReport,
      permission: MANUFACTURING_PERMISSIONS.reportsView,
      children: [
        {
          id: 'manufacturing-wip-report',
          title: 'manufacturing-wip-report',
          type: 'item',
          url: '/manufacturing/reports/wip',
          breadcrumbs: true,
          permission: MANUFACTURING_PERMISSIONS.reportsView
        },
        {
          id: 'manufacturing-cost-analysis',
          title: 'manufacturing-cost-analysis',
          type: 'item',
          url: '/manufacturing/reports/cost-analysis',
          breadcrumbs: true,
          permission: MANUFACTURING_PERMISSIONS.reportsView
        },
        {
          id: 'manufacturing-cost-variance',
          title: 'manufacturing-cost-variance',
          type: 'item',
          url: '/manufacturing/reports/cost-variance',
          breadcrumbs: true,
          permission: MANUFACTURING_PERMISSIONS.reportsView
        }
      ]
    }
  ]
};

export default manufacturing;
