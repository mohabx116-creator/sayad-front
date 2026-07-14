import { IconArrowsRightLeft, IconBuildingBank, IconReceipt, IconReceiptRefund, IconReportAnalytics } from '@tabler/icons-react';

import { NavItemType } from 'types';
import { TREASURY_PERMISSIONS } from 'modules/Treasury/utils/treasury.constants';

const icons = {
  IconBuildingBank,
  IconReceipt,
  IconReceiptRefund,
  IconArrowsRightLeft,
  IconReportAnalytics
};

const treasury: NavItemType = {
  id: 'treasury',
  title: 'treasury',
  icon: icons.IconBuildingBank,
  type: 'group',
  anyPermissions: [
    TREASURY_PERMISSIONS.accountsView,
    TREASURY_PERMISSIONS.receiptsView,
    TREASURY_PERMISSIONS.paymentsView,
    TREASURY_PERMISSIONS.transfersView,
    TREASURY_PERMISSIONS.statementsView
  ],
  children: [
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
