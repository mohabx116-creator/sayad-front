import { IconPackage, IconReportAnalytics, IconTransfer } from '@tabler/icons-react';

import { NavItemType } from 'types';
import { INVENTORY_PERMISSIONS, INVENTORY_VIEW_PERMISSIONS } from 'modules/Inventory/utils/inventory.constants';

const icons = {
  IconPackage,
  IconTransfer,
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
      id: 'inventory-overview',
      title: 'overview',
      type: 'item',
      url: '/inventory/items',
      icon: icons.IconPackage,
      breadcrumbs: true,
      permission: INVENTORY_PERMISSIONS.itemsView
    },
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
      id: 'inventory-stock-movements',
      title: 'inventory-stock-movements',
      type: 'item',
      url: '/inventory/reports/stock',
      icon: icons.IconReportAnalytics,
      breadcrumbs: true,
      permission: INVENTORY_PERMISSIONS.view
    },
    {
      id: 'inventory-customer-materials',
      title: 'customer-materials',
      type: 'item',
      url: '/inventory/customer-materials',
      icon: icons.IconTransfer,
      breadcrumbs: true,
      permission: INVENTORY_PERMISSIONS.customerMaterialIntakesView
    }
  ]
};

export default inventory;
