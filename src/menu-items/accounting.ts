import { IconHierarchy2, IconTree } from '@tabler/icons-react';

import { NavItemType } from 'types';

import { ACCOUNTING_PERMISSIONS, ACCOUNTING_VIEW_PERMISSIONS } from 'modules/Accounting/utils/accounting.constants';

const icons = {
  IconHierarchy2,
  IconTree
};

const accounting: NavItemType = {
  id: 'accounting',
  title: 'general-ledger',
  icon: icons.IconHierarchy2,
  type: 'group',
  anyPermissions: [...ACCOUNTING_VIEW_PERMISSIONS],
  children: [
    {
      id: 'chart-of-accounts',
      title: 'chart-of-accounts',
      type: 'item',
      url: '/accounting/chart-of-accounts',
      icon: icons.IconTree,
      breadcrumbs: true,
      permission: ACCOUNTING_PERMISSIONS.accountsView
    }
  ]
};

export default accounting;
