import { IconHierarchy2, IconReportAnalytics } from '@tabler/icons-react';

import { NavItemType } from 'types';

import { ACCOUNTING_PERMISSIONS, ACCOUNTING_VIEW_PERMISSIONS } from 'modules/Accounting/utils/accounting.constants';

const icons = {
  IconHierarchy2,
  IconReportAnalytics
};

const accounting: NavItemType = {
  id: 'accounting',
  title: 'money',
  icon: icons.IconHierarchy2,
  type: 'group',
  anyPermissions: [...ACCOUNTING_VIEW_PERMISSIONS, ACCOUNTING_PERMISSIONS.reportsView],
  children: [
    {
      id: 'money',
      title: 'money',
      type: 'item',
      url: '/accounting',
      icon: icons.IconHierarchy2,
      breadcrumbs: false,
      permission: ACCOUNTING_PERMISSIONS.view
    },
    {
      id: 'trial-balance',
      title: 'trial-balance-report',
      type: 'item',
      url: '/accounting/reports/trial-balance',
      icon: icons.IconReportAnalytics,
      breadcrumbs: true,
      permission: ACCOUNTING_PERMISSIONS.reportsView
    }
  ]
};

export default accounting;
