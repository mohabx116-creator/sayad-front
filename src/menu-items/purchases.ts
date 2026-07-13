import { IconReceipt2, IconReceiptRefund } from '@tabler/icons-react';

import { NavItemType } from 'types';
import { PURCHASES_PERMISSIONS, PURCHASES_VIEW_PERMISSIONS } from 'modules/Purchases/utils/purchases.constants';

const icons = {
  IconReceipt2,
  IconReceiptRefund
};

const purchases: NavItemType = {
  id: 'purchases',
  title: 'purchases',
  icon: icons.IconReceipt2,
  type: 'group',
  anyPermissions: [...PURCHASES_VIEW_PERMISSIONS],
  children: [
    {
      id: 'purchase-invoices',
      title: 'purchase-invoices',
      type: 'item',
      url: '/purchases/invoices',
      icon: icons.IconReceipt2,
      breadcrumbs: true,
      permission: PURCHASES_PERMISSIONS.invoicesView
    },
    {
      id: 'purchase-returns',
      title: 'purchase-returns',
      type: 'item',
      url: '/purchases/returns',
      icon: icons.IconReceiptRefund,
      breadcrumbs: true,
      permission: PURCHASES_PERMISSIONS.returnsView
    }
  ]
};

export default purchases;
