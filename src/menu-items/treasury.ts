import { IconArrowsLeftRight, IconBuildingBank, IconReportAnalytics } from '@tabler/icons-react';

import { NavItemType } from 'types';
import { TREASURY_PERMISSIONS, TREASURY_VIEW_PERMISSIONS } from 'modules/Treasury/utils/treasury.constants';

const icons = {
  IconArrowsLeftRight,
  IconBuildingBank,
  IconReportAnalytics
};

const treasury: NavItemType = {
  id: 'treasury',
  title: 'treasury',
  icon: icons.IconBuildingBank,
  type: 'group',
  anyPermissions: [...TREASURY_VIEW_PERMISSIONS, TREASURY_PERMISSIONS.transfersView],
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
