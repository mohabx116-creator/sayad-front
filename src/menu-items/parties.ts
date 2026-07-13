import { IconBuildingStore, IconUsersGroup } from '@tabler/icons-react';

import { NavItemType } from 'types';
import { PARTIES_PERMISSIONS, PARTIES_VIEW_PERMISSIONS } from 'modules/Parties/utils/parties.constants';

const icons = {
  IconBuildingStore,
  IconUsersGroup
};

const parties: NavItemType = {
  id: 'parties',
  title: 'parties',
  icon: icons.IconBuildingStore,
  type: 'group',
  anyPermissions: [...PARTIES_VIEW_PERMISSIONS],
  children: [
    {
      id: 'parties-list',
      title: 'parties-list',
      type: 'item',
      url: '/parties',
      icon: icons.IconUsersGroup,
      breadcrumbs: true,
      permission: PARTIES_PERMISSIONS.view
    }
  ]
};

export default parties;
