import { IconReceipt2, IconReceiptRefund } from '@tabler/icons-react';

import { NavItemType } from 'types';
import { SALES_PERMISSIONS, SALES_VIEW_PERMISSIONS } from 'modules/Sales/utils/sales.constants';

const icons = {
  IconReceipt2,
  IconReceiptRefund
};

const sales: NavItemType = {
  id: 'sales',
  title: 'sales',
  icon: icons.IconReceipt2,
  type: 'group',
  anyPermissions: [...SALES_VIEW_PERMISSIONS],
  children: [
    {
      id: 'sales-invoices',
      title: 'sales-invoices',
      type: 'item',
      url: '/sales/invoices',
      icon: icons.IconReceipt2,
      breadcrumbs: true,
      permission: SALES_PERMISSIONS.invoicesView
    },
    {
      id: 'sales-returns',
      title: 'sales-returns',
      type: 'item',
      url: '/sales/returns',
      icon: icons.IconReceiptRefund,
      breadcrumbs: true,
      permission: SALES_PERMISSIONS.returnsView
    },
    {
      id: 'sales-reports',
      title: 'reports',
      type: 'collapse',
      icon: icons.IconReceipt2,
      permission: SALES_PERMISSIONS.invoicesView,
      children: [
        {
          id: 'sales-invoices-report',
          title: 'sales-invoices-report',
          type: 'item',
          url: '/sales/reports/invoices',
          breadcrumbs: true,
          permission: SALES_PERMISSIONS.invoicesView
        }
      ]
    }
  ]
};

export default sales;
