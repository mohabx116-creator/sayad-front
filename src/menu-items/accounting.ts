import { IconFileDescription, IconHierarchy2, IconReportAnalytics, IconSettings, IconTree } from '@tabler/icons-react';

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
    },
    {
      id: 'journal-entries',
      title: 'journal-entries',
      type: 'item',
      url: '/accounting/journal-entries',
      icon: IconFileDescription,
      breadcrumbs: true,
      permission: ACCOUNTING_PERMISSIONS.journalEntriesView
    },
    {
      id: 'accounting-reports',
      title: 'accounting-reports',
      type: 'collapse',
      icon: IconReportAnalytics,
      anyPermissions: [ACCOUNTING_PERMISSIONS.reportsView],
      children: [
        {
          id: 'general-ledger-report',
          title: 'general-ledger-report',
          type: 'item',
          url: '/accounting/reports/general-ledger',
          icon: IconFileDescription,
          breadcrumbs: true,
          permission: ACCOUNTING_PERMISSIONS.reportsView
        },
        {
          id: 'trial-balance-report',
          title: 'trial-balance-report',
          type: 'item',
          url: '/accounting/reports/trial-balance',
          icon: IconReportAnalytics,
          breadcrumbs: true,
          permission: ACCOUNTING_PERMISSIONS.reportsView
        }
      ]
    },
    {
      id: 'accounting-settings',
      title: 'accounting-settings',
      type: 'item',
      url: '/accounting/settings',
      icon: IconSettings,
      breadcrumbs: true,
      permission: ACCOUNTING_PERMISSIONS.settingsView
    }
  ]
};

export default accounting;
