import { IconSettings } from '@tabler/icons-react';

import { NavItemType } from 'types';

const icons = {
  IconSettings
};

const settings: NavItemType = {
  id: 'settings',
  title: 'settings',
  type: 'group',
  children: [
    {
      id: 'settings-overview',
      title: 'settings-overview',
      type: 'item',
      url: '/settings',
      icon: icons.IconSettings,
      breadcrumbs: true
    }
  ]
};

export default settings;
