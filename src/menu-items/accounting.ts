import { IconCalendarStats, IconCalculator, IconFileDescription, IconHierarchy2, IconReportAnalytics } from '@tabler/icons-react';

import { NavItemType } from 'types';

import { ACCOUNTING_PERMISSIONS, ACCOUNTING_VIEW_PERMISSIONS } from 'modules/Accounting/utils/accounting.constants';

const icons = {
  IconCalculator,
  IconCalendarStats,
  IconFileDescription,
  IconHierarchy2,
  IconReportAnalytics
};

const accounting: NavItemType = {
  id: 'accounting',
  title: 'accounting',
  icon: icons.IconCalculator,
  type: 'group',
  anyPermissions: [...ACCOUNTING_VIEW_PERMISSIONS, ACCOUNTING_PERMISSIONS.reportsView],
  children: [
    {
      id: 'accounting-chart-of-accounts',
      title: 'chart-of-accounts',
      type: 'item',
      url: '/accounting/chart-of-accounts',
      icon: icons.IconHierarchy2,
      breadcrumbs: false,
      permission: ACCOUNTING_PERMISSIONS.accountsView
    },
    {
      id: 'accounting-journal-entries',
      title: 'journal-entries',
      type: 'item',
      url: '/accounting/journal-entries',
      icon: icons.IconFileDescription,
      breadcrumbs: true,
      permission: ACCOUNTING_PERMISSIONS.journalEntriesView
    },
    {
      id: 'accounting-reports',
      title: 'accounting-reports',
      type: 'collapse',
      icon: icons.IconReportAnalytics,
      permission: ACCOUNTING_PERMISSIONS.reportsView,
      children: [
        {
          id: 'accounting-general-ledger-report',
          title: 'general-ledger-report',
          type: 'item',
          url: '/accounting/reports/general-ledger',
          icon: icons.IconReportAnalytics,
          breadcrumbs: true,
          permission: ACCOUNTING_PERMISSIONS.reportsView
        },
        {
          id: 'accounting-trial-balance-report',
          title: 'trial-balance-report',
          type: 'item',
          url: '/accounting/reports/trial-balance',
          icon: icons.IconReportAnalytics,
          breadcrumbs: true,
          permission: ACCOUNTING_PERMISSIONS.reportsView
        },
        {
          id: 'accounting-income-statement-report',
          title: 'income-statement-report',
          type: 'item',
          url: '/accounting/reports/income-statement',
          icon: icons.IconReportAnalytics,
          breadcrumbs: true,
          permission: ACCOUNTING_PERMISSIONS.reportsView
        },
        {
          id: 'accounting-balance-sheet-report',
          title: 'balance-sheet-report',
          type: 'item',
          url: '/accounting/reports/balance-sheet',
          icon: icons.IconReportAnalytics,
          breadcrumbs: true,
          permission: ACCOUNTING_PERMISSIONS.reportsView
        },
        {
          id: 'accounting-cash-flow-report',
          title: 'cash-flow-report',
          type: 'item',
          url: '/accounting/reports/cash-flow',
          icon: icons.IconReportAnalytics,
          breadcrumbs: true,
          permission: ACCOUNTING_PERMISSIONS.reportsView
        },
        {
          id: 'accounting-treasury-gl-reconciliation-report',
          title: 'treasury-gl-reconciliation-report',
          type: 'item',
          url: '/accounting/reports/treasury-gl-reconciliation',
          icon: icons.IconReportAnalytics,
          breadcrumbs: true,
          permission: ACCOUNTING_PERMISSIONS.reportsView
        },
        {
          id: 'accounting-inventory-gl-reconciliation-report',
          title: 'inventory-gl-reconciliation-report',
          type: 'item',
          url: '/accounting/reports/inventory-gl-reconciliation',
          icon: icons.IconReportAnalytics,
          breadcrumbs: true,
          permission: ACCOUNTING_PERMISSIONS.reportsView
        },
        {
          id: 'accounting-customer-receivables-aging-report',
          title: 'customer-receivables-aging-report',
          type: 'item',
          url: '/accounting/reports/customer-receivables-aging',
          icon: icons.IconReportAnalytics,
          breadcrumbs: true,
          permission: ACCOUNTING_PERMISSIONS.reportsView
        },
        {
          id: 'accounting-supplier-payables-aging-report',
          title: 'supplier-payables-aging-report',
          type: 'item',
          url: '/accounting/reports/supplier-payables-aging',
          icon: icons.IconReportAnalytics,
          breadcrumbs: true,
          permission: ACCOUNTING_PERMISSIONS.reportsView
        },
        {
          id: 'accounting-purchase-invoices-report',
          title: 'purchase-invoices-report',
          type: 'item',
          url: '/accounting/reports/purchase-invoices',
          icon: icons.IconReportAnalytics,
          breadcrumbs: true,
          permission: ACCOUNTING_PERMISSIONS.reportsView
        },
        {
          id: 'accounting-receipts-payments-report',
          title: 'receipts-payments-report',
          type: 'item',
          url: '/accounting/reports/receipts-payments',
          icon: icons.IconReportAnalytics,
          breadcrumbs: true,
          permission: ACCOUNTING_PERMISSIONS.reportsView
        },
        {
          id: 'accounting-sales-customer-item-analysis-report',
          title: 'sales-customer-item-analysis-report',
          type: 'item',
          url: '/accounting/reports/sales-customer-item-analysis',
          icon: icons.IconReportAnalytics,
          breadcrumbs: true,
          permission: ACCOUNTING_PERMISSIONS.reportsView
        },
        {
          id: 'accounting-sales-profitability-report',
          title: 'sales-profitability-report',
          type: 'item',
          url: '/accounting/reports/sales-profitability',
          icon: icons.IconReportAnalytics,
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
      icon: icons.IconCalculator,
      breadcrumbs: true,
      permission: ACCOUNTING_PERMISSIONS.settingsView
    },
    {
      id: 'accounting-periods',
      title: 'accounting-periods',
      type: 'item',
      url: '/accounting/periods',
      icon: icons.IconCalendarStats,
      breadcrumbs: true,
      permission: ACCOUNTING_PERMISSIONS.periodsView
    },
    {
      id: 'accounting-year-end-closing',
      title: 'year-end-closing',
      type: 'item',
      url: '/accounting/year-end-closing',
      icon: icons.IconCalendarStats,
      breadcrumbs: true,
      permission: ACCOUNTING_PERMISSIONS.yearEndView
    },
  ]
};

export default accounting;
