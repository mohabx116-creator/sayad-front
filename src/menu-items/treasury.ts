import { IconArrowsLeftRight, IconBuildingBank, IconReceipt2, IconReportAnalytics } from '@tabler/icons-react';

import { NavItemType } from 'types';
import { TREASURY_PERMISSIONS, TREASURY_VIEW_PERMISSIONS } from 'modules/Treasury/utils/treasury.constants';

const icons = {
  IconArrowsLeftRight,
  IconBuildingBank,
  IconReceipt2,
  IconReportAnalytics
};

const treasury: NavItemType = {
  id: 'treasury',
  title: 'treasury',
  icon: icons.IconBuildingBank,
  type: 'group',
  anyPermissions: [
    ...TREASURY_VIEW_PERMISSIONS,
    TREASURY_PERMISSIONS.receiptsView,
    TREASURY_PERMISSIONS.paymentsView,
    TREASURY_PERMISSIONS.transfersView
  ],
  children: [
    {
      id: 'cashboxes',
      title: 'cashboxes',
      type: 'item',
      url: '/treasury/accounts',
      icon: icons.IconBuildingBank,
      breadcrumbs: false,
      permission: TREASURY_PERMISSIONS.accountsView
    },
    {
      id: 'treasury-receipts',
      title: 'receipts',
      type: 'item',
      url: '/treasury/receipts',
      icon: icons.IconReceipt2,
      breadcrumbs: true,
      permission: TREASURY_PERMISSIONS.receiptsView
    },
    {
      id: 'treasury-payments',
      title: 'payments',
      type: 'item',
      url: '/treasury/payments',
      icon: icons.IconReceipt2,
      breadcrumbs: true,
      permission: TREASURY_PERMISSIONS.paymentsView
    },
    {
      id: 'treasury-transfers',
      title: 'transfers',
      type: 'item',
      url: '/treasury/transfers',
      icon: icons.IconArrowsLeftRight,
      breadcrumbs: true,
      permission: TREASURY_PERMISSIONS.transfersView
    },
    {
      id: 'treasury-statements',
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
