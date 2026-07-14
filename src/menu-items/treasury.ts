import { IconArrowsRightLeft, IconBuildingBank, IconReceipt, IconReceiptRefund, IconReportAnalytics, IconDashboard } from '@tabler/icons-react';

import { NavItemType } from 'types';
import { TREASURY_PERMISSIONS, TREASURY_VIEW_PERMISSIONS } from 'modules/Treasury/utils/treasury.constants';

const icons = {
  IconBuildingBank,
  IconReceipt,
  IconReceiptRefund,
  IconArrowsRightLeft,
  IconReportAnalytics,
  IconDashboard
};

const treasury: NavItemType = {
  id: 'treasury',
  title: 'treasury',
  icon: icons.IconBuildingBank,
  type: 'group',
  anyPermissions: [...TREASURY_VIEW_PERMISSIONS],
  children: [
    {
      id: 'treasury-dashboard',
      title: 'treasury-dashboard',
      type: 'item',
      url: '/treasury',
      icon: icons.IconDashboard,
      breadcrumbs: false,
      permission: TREASURY_PERMISSIONS.view
    },
    {
      id: 'treasury-accounts',
      title: 'treasury-accounts',
      type: 'item',
      url: '/treasury/accounts',
      icon: icons.IconBuildingBank,
      breadcrumbs: true,
      permission: TREASURY_PERMISSIONS.accountsView
    },
    {
      id: 'receipts',
      title: 'receipts',
      type: 'item',
      url: '/treasury/receipts',
      icon: icons.IconReceipt,
      breadcrumbs: true,
      permission: TREASURY_PERMISSIONS.receiptsView
    },
    {
      id: 'payments',
      title: 'payments',
      type: 'item',
      url: '/treasury/payments',
      icon: icons.IconReceiptRefund,
      breadcrumbs: true,
      permission: TREASURY_PERMISSIONS.paymentsView
    },
    {
      id: 'transfers',
      title: 'transfers',
      type: 'item',
      url: '/treasury/transfers',
      icon: icons.IconArrowsRightLeft,
      breadcrumbs: true,
      permission: TREASURY_PERMISSIONS.transfersView
    },
    {
      id: 'statements',
      title: 'statements',
      type: 'item',
      url: '/treasury/statements',
      icon: icons.IconReportAnalytics,
      breadcrumbs: true,
      permission: TREASURY_PERMISSIONS.statementsView
    }
  ]
};

export default treasury;
