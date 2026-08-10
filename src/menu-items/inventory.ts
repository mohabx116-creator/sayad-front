import { IconAlertTriangle, IconCalculator, IconCategory, IconLink, IconPackage, IconReportAnalytics, IconRulerMeasure, IconTransfer } from '@tabler/icons-react';

import { NavItemType } from 'types';
import { INVENTORY_PERMISSIONS, INVENTORY_VIEW_PERMISSIONS } from 'modules/Inventory/utils/inventory.constants';

const icons = {
  IconPackage,
  IconCategory,
  IconLink,
  IconRulerMeasure,
  IconTransfer,
  IconAlertTriangle,
  IconCalculator,
  IconReportAnalytics
};

const inventory: NavItemType = {
  id: 'inventory',
  title: 'inventory',
  icon: icons.IconPackage,
  type: 'group',
  anyPermissions: [...INVENTORY_VIEW_PERMISSIONS],
  children: [
    {
      id: 'inventory-items',
      title: 'inventory-items',
      type: 'item',
      url: '/inventory/items',
      icon: icons.IconPackage,
      breadcrumbs: true,
      permission: INVENTORY_PERMISSIONS.itemsView
    },
    {
      id: 'inventory-categories',
      title: 'inventory-categories',
      type: 'item',
      url: '/inventory/categories',
      icon: icons.IconCategory,
      breadcrumbs: true,
      permission: INVENTORY_PERMISSIONS.categoriesView
    },
    {
      id: 'inventory-units',
      title: 'inventory-units',
      type: 'item',
      url: '/inventory/units',
      icon: icons.IconRulerMeasure,
      breadcrumbs: true,
      permission: INVENTORY_PERMISSIONS.unitsView
    },
    {
      id: 'inventory-party-items',
      title: 'party-item-relations',
      type: 'item',
      url: '/inventory/party-items',
      icon: icons.IconLink,
      breadcrumbs: true,
      permission: INVENTORY_PERMISSIONS.partyItemsView
    },
    {
      id: 'inventory-customer-materials',
      title: 'customer-materials',
      type: 'item',
      url: '/inventory/customer-materials',
      icon: icons.IconTransfer,
      breadcrumbs: true,
      permission: INVENTORY_PERMISSIONS.customerMaterialIntakesView
    },
    {
      id: 'inventory-low-stock',
      title: 'inventory-low-stock',
      type: 'item',
      url: '/inventory/low-stock',
      icon: icons.IconAlertTriangle,
      breadcrumbs: true,
      permission: INVENTORY_PERMISSIONS.alertsView
    },
    {
      id: 'inventory-stock-report',
      title: 'inventory-stock-report',
      type: 'item',
      url: '/inventory/reports/stock',
      icon: icons.IconReportAnalytics,
      breadcrumbs: true,
      permission: INVENTORY_PERMISSIONS.view
    },
    {
      id: 'inventory-valuation',
      title: 'inventory-valuation',
      type: 'item',
      url: '/inventory/valuation',
      icon: icons.IconCalculator,
      breadcrumbs: true,
      permission: INVENTORY_PERMISSIONS.view
    }
  ]
};

export default inventory;
