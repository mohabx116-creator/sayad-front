import { IconBuildingBank } from '@tabler/icons-react';

import { NavItemType } from 'types';
import { TREASURY_PERMISSIONS, TREASURY_VIEW_PERMISSIONS } from 'modules/Treasury/utils/treasury.constants';

const icons = {
  IconBuildingBank
};

const treasury: NavItemType = {
  id: 'treasury',
  title: 'cashboxes',
  icon: icons.IconBuildingBank,
  type: 'group',
  anyPermissions: [...TREASURY_VIEW_PERMISSIONS],
  children: [
    {
      id: 'cashboxes',
      title: 'cashboxes',
      type: 'item',
      url: '/treasury/accounts',
      icon: icons.IconBuildingBank,
      breadcrumbs: false,
      permission: TREASURY_PERMISSIONS.accountsView
    }
  ]
};

export default treasury;
