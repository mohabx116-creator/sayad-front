import { IconHierarchy2 } from '@tabler/icons-react';

import { NavItemType } from 'types';

import { ACCOUNTING_PERMISSIONS, ACCOUNTING_VIEW_PERMISSIONS } from 'modules/Accounting/utils/accounting.constants';

const icons = {
  IconHierarchy2
};

const accounting: NavItemType = {
  id: 'accounting',
  title: 'money',
  icon: icons.IconHierarchy2,
  type: 'group',
  anyPermissions: [...ACCOUNTING_VIEW_PERMISSIONS],
  children: [
    {
      id: 'money',
      title: 'money',
      type: 'item',
      url: '/accounting',
      icon: icons.IconHierarchy2,
      breadcrumbs: false,
      permission: ACCOUNTING_PERMISSIONS.view
    }
  ]
};

export default accounting;
