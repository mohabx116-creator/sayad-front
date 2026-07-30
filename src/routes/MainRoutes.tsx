import { lazy } from 'react';
import { Navigate } from 'react-router-dom';

// project imports
import MainLayout from 'layout/MainLayout';
import AuthGuard from 'utils/route-guard/AuthGuard';
import Loadable from 'ui-component/Loadable';
import PermissionRouteGuard from 'modules/Administration/components/PermissionRouteGuard';
import { ADMINISTRATION_PERMISSIONS } from 'modules/Administration/utils/administration.constants';
import { INVENTORY_PERMISSIONS } from 'modules/Inventory/utils/inventory.constants';
import { PARTIES_PERMISSIONS } from 'modules/Parties/utils/parties.constants';
import { PURCHASES_PERMISSIONS } from 'modules/Purchases/utils/purchases.constants';
import { WORKERS_PERMISSIONS } from 'modules/Workers/utils/workers.constants';
import { OPERATIONAL_JOBS_PERMISSIONS } from 'modules/OperationalJobs/utils/operationalJobs.constants';
import { TREASURY_PERMISSIONS } from 'modules/Treasury/utils/treasury.constants';
import { SALES_PERMISSIONS } from 'modules/Sales/utils/sales.constants';
import { EXPENSES_PERMISSIONS } from 'modules/Expenses/utils/expense.constants';
import SystemOwnerRouteGuard from 'modules/System/components/SystemOwnerRouteGuard';
import { ACCOUNTING_PERMISSIONS } from 'modules/Accounting/utils/accounting.constants';

// dashboard routing
const DashboardDefault = Loadable(lazy(() => import('views/dashboard/Default')));
const UsersListPage = Loadable(lazy(() => import('modules/Administration/pages/UsersListPage')));
const UserDetailsPage = Loadable(lazy(() => import('modules/Administration/pages/UserDetailsPage')));
const RolesListPage = Loadable(lazy(() => import('modules/Administration/pages/RolesListPage')));
const RoleDetailsPage = Loadable(lazy(() => import('modules/Administration/pages/RoleDetailsPage')));
const PartiesListPage = Loadable(lazy(() => import('modules/Parties/pages/PartiesListPage')));
const PartyDetailsPage = Loadable(lazy(() => import('modules/Parties/pages/PartyDetailsPage')));
const PartyCreatePage = Loadable(lazy(() => import('modules/Parties/pages/PartyCreatePage')));
const PartyEditPage = Loadable(lazy(() => import('modules/Parties/pages/PartyEditPage')));
const PartyStatementPage = Loadable(lazy(() => import('modules/Parties/pages/PartyStatementPage')));
const WorkersListPage = Loadable(lazy(() => import('modules/Workers/pages/WorkersListPage')));
const WorkerCreatePage = Loadable(lazy(() => import('modules/Workers/pages/WorkerCreatePage')));
const WorkerMonthlySalaryReportPage = Loadable(lazy(() => import('modules/Workers/pages/WorkerMonthlySalaryReportPage')));
const WorkerDetailsPage = Loadable(lazy(() => import('modules/Workers/pages/WorkerDetailsPage')));
const WorkerEditPage = Loadable(lazy(() => import('modules/Workers/pages/WorkerEditPage')));
const OperationalJobsListPage = Loadable(lazy(() => import('modules/OperationalJobs/pages/OperationalJobsListPage')));
const OperationalJobCreatePage = Loadable(lazy(() => import('modules/OperationalJobs/pages/OperationalJobCreatePage')));
const OperationalJobDetailsPage = Loadable(lazy(() => import('modules/OperationalJobs/pages/OperationalJobDetailsPage')));
const OperationalJobEditPage = Loadable(lazy(() => import('modules/OperationalJobs/pages/OperationalJobEditPage')));
const TreasuryHomePage = Loadable(lazy(() => import('modules/Treasury/pages/TreasuryHomePage')));
const TreasuryAccountsListPage = Loadable(lazy(() => import('modules/Treasury/pages/TreasuryAccountsListPage')));
const TreasuryAccountDetailsPage = Loadable(lazy(() => import('modules/Treasury/pages/TreasuryAccountDetailsPage')));
const TreasuryAccountFormPage = Loadable(lazy(() => import('modules/Treasury/pages/TreasuryAccountFormPage')));
const TreasuryReceiptsListPage = Loadable(lazy(() => import('modules/Treasury/pages/TreasuryReceiptsListPage')));
const TreasuryReceiptDetailsPage = Loadable(lazy(() => import('modules/Treasury/pages/TreasuryReceiptDetailsPage')));
const TreasuryReceiptFormPage = Loadable(lazy(() => import('modules/Treasury/pages/TreasuryReceiptFormPage')));
const TreasuryPaymentsListPage = Loadable(lazy(() => import('modules/Treasury/pages/TreasuryPaymentsListPage')));
const TreasuryPaymentDetailsPage = Loadable(lazy(() => import('modules/Treasury/pages/TreasuryPaymentDetailsPage')));
const TreasuryPaymentFormPage = Loadable(lazy(() => import('modules/Treasury/pages/TreasuryPaymentFormPage')));
const TreasuryTransfersListPage = Loadable(lazy(() => import('modules/Treasury/pages/TreasuryTransfersListPage')));
const TreasuryTransferDetailsPage = Loadable(lazy(() => import('modules/Treasury/pages/TreasuryTransferDetailsPage')));
const TreasuryTransferFormPage = Loadable(lazy(() => import('modules/Treasury/pages/TreasuryTransferFormPage')));
const TreasuryStatementsPage = Loadable(lazy(() => import('modules/Treasury/pages/TreasuryStatementsPage')));
const AccountingHomePage = Loadable(lazy(() => import('modules/Accounting/pages/AccountingHomePage')));
const AccountingSettingsPage = Loadable(lazy(() => import('modules/Accounting/pages/AccountingSettingsPage')));
const AccountingPeriodsPage = Loadable(lazy(() => import('modules/Accounting/pages/AccountingPeriodsPage')));
const FiscalYearRolloverPage = Loadable(lazy(() => import('modules/Accounting/pages/FiscalYearRolloverPage')));
const YearEndClosingPage = Loadable(lazy(() => import('modules/Accounting/pages/YearEndClosingPage')));
const JournalEntriesListPage = Loadable(lazy(() => import('modules/Accounting/pages/JournalEntriesListPage')));
const JournalEntryDetailsPage = Loadable(lazy(() => import('modules/Accounting/pages/JournalEntryDetailsPage')));
const JournalEntryFormPage = Loadable(lazy(() => import('modules/Accounting/pages/JournalEntryFormPage')));
const GeneralLedgerPage = Loadable(lazy(() => import('modules/Accounting/pages/GeneralLedgerPage')));
const TrialBalancePage = Loadable(lazy(() => import('modules/Accounting/pages/TrialBalancePage')));
const IncomeStatementPage = Loadable(lazy(() => import('modules/Accounting/pages/IncomeStatementPage')));
const BalanceSheetPage = Loadable(lazy(() => import('modules/Accounting/pages/BalanceSheetPage')));
const CashFlowPage = Loadable(lazy(() => import('modules/Accounting/pages/CashFlowPage')));
const TreasuryGlReconciliationPage = Loadable(lazy(() => import('modules/Accounting/pages/TreasuryGlReconciliationPage')));
const InventoryGlReconciliationPage = Loadable(lazy(() => import('modules/Accounting/pages/InventoryGlReconciliationPage')));
const CustomerReceivablesAgingPage = Loadable(lazy(() => import('modules/Accounting/pages/CustomerReceivablesAgingPage')));
const SupplierPayablesAgingPage = Loadable(lazy(() => import('modules/Accounting/pages/SupplierPayablesAgingPage')));
const AccountingChartOfAccountsPage = Loadable(lazy(() => import('modules/Accounting/pages/AccountingChartOfAccountsPage')));
const AccountingAccountDetailsPage = Loadable(lazy(() => import('modules/Accounting/pages/AccountingAccountDetailsPage')));
const AccountingAccountFormPage = Loadable(lazy(() => import('modules/Accounting/pages/AccountingAccountFormPage')));
const InventoryItemsListPage = Loadable(lazy(() => import('modules/Inventory/pages/InventoryItemsListPage')));
const InventoryItemDetailsPage = Loadable(lazy(() => import('modules/Inventory/pages/InventoryItemDetailsPage')));
const InventoryItemFormPage = Loadable(lazy(() => import('modules/Inventory/pages/InventoryItemFormPage')));
const InventoryItemMovementsPage = Loadable(lazy(() => import('modules/Inventory/pages/InventoryItemMovementsPage')));
const InventoryCategoriesPage = Loadable(lazy(() => import('modules/Inventory/pages/InventoryCategoriesPage')));
const InventoryUnitsPage = Loadable(lazy(() => import('modules/Inventory/pages/InventoryUnitsPage')));
const InventoryPartyItemsPage = Loadable(lazy(() => import('modules/Inventory/pages/InventoryPartyItemsPage')));
const InventoryLowStockPage = Loadable(lazy(() => import('modules/Inventory/pages/InventoryLowStockPage')));
const InventoryValuationPage = Loadable(lazy(() => import('modules/Inventory/pages/InventoryValuationPage')));
const SalesInvoicesListPage = Loadable(lazy(() => import('modules/Sales/pages/SalesInvoicesListPage')));
const SalesInvoiceDetailsPage = Loadable(lazy(() => import('modules/Sales/pages/SalesInvoiceDetailsPage')));
const SalesInvoiceFormPage = Loadable(lazy(() => import('modules/Sales/pages/SalesInvoiceFormPage')));
const SalesReturnsListPage = Loadable(lazy(() => import('modules/Sales/pages/SalesReturnsListPage')));
const SalesReturnDetailsPage = Loadable(lazy(() => import('modules/Sales/pages/SalesReturnDetailsPage')));
const SalesReturnFormPage = Loadable(lazy(() => import('modules/Sales/pages/SalesReturnFormPage')));
const PurchaseInvoicesListPage = Loadable(lazy(() => import('modules/Purchases/pages/PurchaseInvoicesListPage')));
const PurchaseInvoiceDetailsPage = Loadable(lazy(() => import('modules/Purchases/pages/PurchaseInvoiceDetailsPage')));
const PurchaseInvoiceFormPage = Loadable(lazy(() => import('modules/Purchases/pages/PurchaseInvoiceFormPage')));
const PurchaseReturnsListPage = Loadable(lazy(() => import('modules/Purchases/pages/PurchaseReturnsListPage')));
const PurchaseReturnDetailsPage = Loadable(lazy(() => import('modules/Purchases/pages/PurchaseReturnDetailsPage')));
const PurchaseReturnFormPage = Loadable(lazy(() => import('modules/Purchases/pages/PurchaseReturnFormPage')));

// Expenses
const ExpensesHomePage = Loadable(lazy(() => import('modules/Expenses/pages/ExpensesHomePage')));
const ExpenseCategoriesListPage = Loadable(lazy(() => import('modules/Expenses/pages/ExpenseCategoriesListPage')));
const ExpenseCategoryFormPage = Loadable(lazy(() => import('modules/Expenses/pages/ExpenseCategoryFormPage')));
const ExpensesListPage = Loadable(lazy(() => import('modules/Expenses/pages/ExpensesListPage')));
const ExpenseDetailsPage = Loadable(lazy(() => import('modules/Expenses/pages/ExpenseDetailsPage')));
const ExpenseFormPage = Loadable(lazy(() => import('modules/Expenses/pages/ExpenseFormPage')));
const SystemDashboardPage = Loadable(lazy(() => import('modules/System/pages/SystemDashboardPage')));
const SystemPermissionsPage = Loadable(lazy(() => import('modules/System/pages/SystemPermissionsPage')));
const SystemAuditPage = Loadable(lazy(() => import('modules/System/pages/SystemAuditPage')));
const SystemMaintenancePage = Loadable(lazy(() => import('modules/System/pages/SystemMaintenancePage')));
const SystemDangerZonePage = Loadable(lazy(() => import('modules/System/pages/SystemDangerZonePage')));

// ==============================|| MAIN ROUTING ||============================== //

const MainRoutes = {
  path: '/',
  element: (
    <AuthGuard>
      <MainLayout />
    </AuthGuard>
  ),
  children: [
    {
      path: '/dashboard',
      element: <DashboardDefault />
    },
    {
      path: '/treasury',
      element: (
        <PermissionRouteGuard permission={TREASURY_PERMISSIONS.view}>
          <TreasuryHomePage />
        </PermissionRouteGuard>
      )
    },
    {
      path: '/labor/workers',
      element: (
        <PermissionRouteGuard permission={WORKERS_PERMISSIONS.view}>
          <WorkersListPage />
        </PermissionRouteGuard>
      )
    },
    {
      path: '/labor/workers/new',
      element: (
        <PermissionRouteGuard permission={WORKERS_PERMISSIONS.create}>
          <WorkerCreatePage />
        </PermissionRouteGuard>
      )
    },
    {
      path: '/labor/workers/salary-report',
      element: (
        <PermissionRouteGuard permission={WORKERS_PERMISSIONS.view}>
          <WorkerMonthlySalaryReportPage />
        </PermissionRouteGuard>
      )
    },
    {
      path: '/labor/workers/:id',
      element: (
        <PermissionRouteGuard permission={WORKERS_PERMISSIONS.view}>
          <WorkerDetailsPage />
        </PermissionRouteGuard>
      )
    },
    {
      path: '/labor/workers/:id/edit',
      element: (
        <PermissionRouteGuard permission={WORKERS_PERMISSIONS.edit}>
          <WorkerEditPage />
        </PermissionRouteGuard>
      )
    },
    { path: '/labor/monthly-movements', element: <Navigate to="/labor/workers" replace /> },
    { path: '/labor/monthly-movements/new', element: <Navigate to="/labor/workers" replace /> },
    { path: '/labor/monthly-movements/:id/edit', element: <Navigate to="/labor/workers" replace /> },
    { path: '/labor/payroll', element: <Navigate to="/labor/workers" replace /> },
    { path: '/payroll/periods', element: <Navigate to="/labor/workers" replace /> },
    {
      path: '/labor/operational-jobs',
      element: (
        <PermissionRouteGuard permission={OPERATIONAL_JOBS_PERMISSIONS.view}>
          <OperationalJobsListPage />
        </PermissionRouteGuard>
      )
    },
    {
      path: '/labor/operational-jobs/new',
      element: (
        <PermissionRouteGuard permission={OPERATIONAL_JOBS_PERMISSIONS.create}>
          <OperationalJobCreatePage />
        </PermissionRouteGuard>
      )
    },
    {
      path: '/labor/operational-jobs/:id',
      element: (
        <PermissionRouteGuard permission={OPERATIONAL_JOBS_PERMISSIONS.view}>
          <OperationalJobDetailsPage />
        </PermissionRouteGuard>
      )
    },
    {
      path: '/labor/operational-jobs/:id/edit',
      element: (
        <PermissionRouteGuard permission={OPERATIONAL_JOBS_PERMISSIONS.edit}>
          <OperationalJobEditPage />
        </PermissionRouteGuard>
      )
    },
    {
      path: '/treasury/accounts',
      element: (
        <PermissionRouteGuard permission={TREASURY_PERMISSIONS.accountsView}>
          <TreasuryAccountsListPage />
        </PermissionRouteGuard>
      )
    },
    {
      path: '/treasury/accounts/new',
      element: (
        <PermissionRouteGuard permission={TREASURY_PERMISSIONS.accountsCreate}>
          <TreasuryAccountFormPage />
        </PermissionRouteGuard>
      )
    },
    {
      path: '/treasury/accounts/:id',
      element: (
        <PermissionRouteGuard permission={TREASURY_PERMISSIONS.accountsView}>
          <TreasuryAccountDetailsPage />
        </PermissionRouteGuard>
      )
    },
    {
      path: '/treasury/accounts/:id/edit',
      element: (
        <PermissionRouteGuard permission={TREASURY_PERMISSIONS.accountsUpdate}>
          <TreasuryAccountFormPage />
        </PermissionRouteGuard>
      )
    },
    {
      path: '/treasury/receipts',
      element: (
        <PermissionRouteGuard permission={TREASURY_PERMISSIONS.receiptsView}>
          <TreasuryReceiptsListPage />
        </PermissionRouteGuard>
      )
    },
    {
      path: '/treasury/receipts/new',
      element: (
        <PermissionRouteGuard permission={TREASURY_PERMISSIONS.receiptsCreate}>
          <TreasuryReceiptFormPage />
        </PermissionRouteGuard>
      )
    },
    {
      path: '/treasury/receipts/:id',
      element: (
        <PermissionRouteGuard permission={TREASURY_PERMISSIONS.receiptsView}>
          <TreasuryReceiptDetailsPage />
        </PermissionRouteGuard>
      )
    },
    {
      path: '/treasury/receipts/:id/edit',
      element: (
        <PermissionRouteGuard permission={TREASURY_PERMISSIONS.receiptsUpdate}>
          <TreasuryReceiptFormPage />
        </PermissionRouteGuard>
      )
    },
    {
      path: '/treasury/payments',
      element: (
        <PermissionRouteGuard permission={TREASURY_PERMISSIONS.paymentsView}>
          <TreasuryPaymentsListPage />
        </PermissionRouteGuard>
      )
    },
    {
      path: '/treasury/payments/new',
      element: (
        <PermissionRouteGuard permission={TREASURY_PERMISSIONS.paymentsCreate}>
          <TreasuryPaymentFormPage />
        </PermissionRouteGuard>
      )
    },
    {
      path: '/treasury/payments/:id',
      element: (
        <PermissionRouteGuard permission={TREASURY_PERMISSIONS.paymentsView}>
          <TreasuryPaymentDetailsPage />
        </PermissionRouteGuard>
      )
    },
    {
      path: '/treasury/payments/:id/edit',
      element: (
        <PermissionRouteGuard permission={TREASURY_PERMISSIONS.paymentsUpdate}>
          <TreasuryPaymentFormPage />
        </PermissionRouteGuard>
      )
    },
    {
      path: '/treasury/transfers',
      element: (
        <PermissionRouteGuard permission={TREASURY_PERMISSIONS.transfersView}>
          <TreasuryTransfersListPage />
        </PermissionRouteGuard>
      )
    },
    {
      path: '/treasury/transfers/new',
      element: (
        <PermissionRouteGuard permission={TREASURY_PERMISSIONS.transfersCreate}>
          <TreasuryTransferFormPage />
        </PermissionRouteGuard>
      )
    },
    {
      path: '/treasury/transfers/:id',
      element: (
        <PermissionRouteGuard permission={TREASURY_PERMISSIONS.transfersView}>
          <TreasuryTransferDetailsPage />
        </PermissionRouteGuard>
      )
    },
    {
      path: '/treasury/transfers/:id/edit',
      element: (
        <PermissionRouteGuard permission={TREASURY_PERMISSIONS.transfersUpdate}>
          <TreasuryTransferFormPage />
        </PermissionRouteGuard>
      )
    },
    {
      path: '/treasury/statements',
      element: (
        <PermissionRouteGuard permission={TREASURY_PERMISSIONS.statementsView}>
          <TreasuryStatementsPage />
        </PermissionRouteGuard>
      )
    },
    {
      path: '/accounting',
      element: (
        <PermissionRouteGuard permission={ACCOUNTING_PERMISSIONS.view}>
          <AccountingHomePage />
        </PermissionRouteGuard>
      )
    },
    {
      path: '/accounting/chart-of-accounts',
      element: (
        <PermissionRouteGuard permission={ACCOUNTING_PERMISSIONS.accountsView}>
          <AccountingChartOfAccountsPage />
        </PermissionRouteGuard>
      )
    },
    {
      path: '/accounting/chart-of-accounts/new',
      element: (
        <PermissionRouteGuard permission={ACCOUNTING_PERMISSIONS.accountsCreate}>
          <AccountingAccountFormPage />
        </PermissionRouteGuard>
      )
    },
    {
      path: '/accounting/chart-of-accounts/:id',
      element: (
        <PermissionRouteGuard permission={ACCOUNTING_PERMISSIONS.accountsView}>
          <AccountingAccountDetailsPage />
        </PermissionRouteGuard>
      )
    },
    {
      path: '/accounting/chart-of-accounts/:id/edit',
      element: (
        <PermissionRouteGuard permission={ACCOUNTING_PERMISSIONS.accountsUpdate}>
          <AccountingAccountFormPage />
        </PermissionRouteGuard>
      )
    },
    {
      path: '/accounting/journal-entries',
      element: (
        <PermissionRouteGuard permission={ACCOUNTING_PERMISSIONS.journalEntriesView}>
          <JournalEntriesListPage />
        </PermissionRouteGuard>
      )
    },
    {
      path: '/accounting/journal-entries/new',
      element: (
        <PermissionRouteGuard permission={ACCOUNTING_PERMISSIONS.journalEntriesCreate}>
          <JournalEntryFormPage />
        </PermissionRouteGuard>
      )
    },
    {
      path: '/accounting/journal-entries/:id',
      element: (
        <PermissionRouteGuard permission={ACCOUNTING_PERMISSIONS.journalEntriesView}>
          <JournalEntryDetailsPage />
        </PermissionRouteGuard>
      )
    },
    {
      path: '/accounting/journal-entries/:id/edit',
      element: (
        <PermissionRouteGuard permission={ACCOUNTING_PERMISSIONS.journalEntriesUpdate}>
          <JournalEntryFormPage />
        </PermissionRouteGuard>
      )
    },
    {
      path: '/accounting/reports/general-ledger',
      element: (
        <PermissionRouteGuard permission={ACCOUNTING_PERMISSIONS.reportsView}>
          <GeneralLedgerPage />
        </PermissionRouteGuard>
      )
    },
    {
      path: '/accounting/reports/trial-balance',
      element: (
        <PermissionRouteGuard permission={ACCOUNTING_PERMISSIONS.reportsView}>
          <TrialBalancePage />
        </PermissionRouteGuard>
      )
    },
    {
      path: '/accounting/reports/income-statement',
      element: (
        <PermissionRouteGuard permission={ACCOUNTING_PERMISSIONS.reportsView}>
          <IncomeStatementPage />
        </PermissionRouteGuard>
      )
    },
    {
      path: '/accounting/reports/balance-sheet',
      element: (
        <PermissionRouteGuard permission={ACCOUNTING_PERMISSIONS.reportsView}>
          <BalanceSheetPage />
        </PermissionRouteGuard>
      )
    },
    {
      path: '/accounting/reports/cash-flow',
      element: (
        <PermissionRouteGuard permission={ACCOUNTING_PERMISSIONS.reportsView}>
          <CashFlowPage />
        </PermissionRouteGuard>
      )
    },
    {
      path: '/accounting/reports/treasury-gl-reconciliation',
      element: (
        <PermissionRouteGuard permission={ACCOUNTING_PERMISSIONS.reportsView}>
          <TreasuryGlReconciliationPage />
        </PermissionRouteGuard>
      )
    },
    {
      path: '/accounting/reports/inventory-gl-reconciliation',
      element: (
        <PermissionRouteGuard permission={ACCOUNTING_PERMISSIONS.reportsView}>
          <InventoryGlReconciliationPage />
        </PermissionRouteGuard>
      )
    },
    {
      path: '/accounting/reports/customer-receivables-aging',
      element: (
        <PermissionRouteGuard permission={ACCOUNTING_PERMISSIONS.reportsView}>
          <CustomerReceivablesAgingPage />
        </PermissionRouteGuard>
      )
    },
    {
      path: '/accounting/reports/supplier-payables-aging',
      element: (
        <PermissionRouteGuard permission={ACCOUNTING_PERMISSIONS.reportsView}>
          <SupplierPayablesAgingPage />
        </PermissionRouteGuard>
      )
    },
    {
      path: '/accounting/settings',
      element: (
        <PermissionRouteGuard permission={ACCOUNTING_PERMISSIONS.settingsView}>
          <AccountingSettingsPage />
        </PermissionRouteGuard>
      )
    },
    {
      path: '/accounting/periods',
      element: (
        <PermissionRouteGuard permission={ACCOUNTING_PERMISSIONS.periodsView}>
          <AccountingPeriodsPage />
        </PermissionRouteGuard>
      )
    },
    {
      path: '/accounting/fiscal-years/:id/rollover',
      element: (
        <PermissionRouteGuard permission={ACCOUNTING_PERMISSIONS.periodsView}>
          <FiscalYearRolloverPage />
        </PermissionRouteGuard>
      )
    },
    {
      path: '/accounting/year-end-closing',
      element: (
        <PermissionRouteGuard permission={ACCOUNTING_PERMISSIONS.yearEndView}>
          <YearEndClosingPage />
        </PermissionRouteGuard>
      )
    },
    {
      path: '/administration/users',
      element: (
        <PermissionRouteGuard permission={ADMINISTRATION_PERMISSIONS.usersView}>
          <UsersListPage />
        </PermissionRouteGuard>
      )
    },
    {
      path: '/administration/users/:id',
      element: (
        <PermissionRouteGuard permission={ADMINISTRATION_PERMISSIONS.usersView}>
          <UserDetailsPage />
        </PermissionRouteGuard>
      )
    },
    {
      path: '/system',
      element: (
        <SystemOwnerRouteGuard>
          <SystemDashboardPage />
        </SystemOwnerRouteGuard>
      )
    },
    {
      path: '/system/users',
      element: (
        <SystemOwnerRouteGuard>
          <UsersListPage />
        </SystemOwnerRouteGuard>
      )
    },
    {
      path: '/system/users/:id',
      element: (
        <SystemOwnerRouteGuard>
          <UserDetailsPage />
        </SystemOwnerRouteGuard>
      )
    },
    {
      path: '/system/roles',
      element: (
        <SystemOwnerRouteGuard>
          <RolesListPage />
        </SystemOwnerRouteGuard>
      )
    },
    {
      path: '/system/roles/:id',
      element: (
        <SystemOwnerRouteGuard>
          <RoleDetailsPage />
        </SystemOwnerRouteGuard>
      )
    },
    {
      path: '/system/permissions',
      element: (
        <SystemOwnerRouteGuard>
          <SystemPermissionsPage />
        </SystemOwnerRouteGuard>
      )
    },
    {
      path: '/system/audit',
      element: (
        <SystemOwnerRouteGuard>
          <SystemAuditPage />
        </SystemOwnerRouteGuard>
      )
    },
    {
      path: '/system/maintenance',
      element: (
        <SystemOwnerRouteGuard>
          <SystemMaintenancePage />
        </SystemOwnerRouteGuard>
      )
    },
    {
      path: '/system/danger-zone',
      element: (
        <SystemOwnerRouteGuard>
          <SystemDangerZonePage />
        </SystemOwnerRouteGuard>
      )
    },
    {
      path: '/parties',
      element: (
        <PermissionRouteGuard permission={PARTIES_PERMISSIONS.view}>
          <PartiesListPage />
        </PermissionRouteGuard>
      )
    },
    {
      path: '/parties/new',
      element: (
        <PermissionRouteGuard permission={PARTIES_PERMISSIONS.create}>
          <PartyCreatePage />
        </PermissionRouteGuard>
      )
    },
    {
      path: '/parties/:id',
      element: (
        <PermissionRouteGuard permission={PARTIES_PERMISSIONS.view}>
          <PartyDetailsPage />
        </PermissionRouteGuard>
      )
    },
    {
      path: '/parties/:id/edit',
      element: (
        <PermissionRouteGuard permission={PARTIES_PERMISSIONS.update}>
          <PartyEditPage />
        </PermissionRouteGuard>
      )
    },
    {
      path: '/parties/:id/statement',
      element: (
        <PermissionRouteGuard permission={PARTIES_PERMISSIONS.statementView}>
          <PartyStatementPage />
        </PermissionRouteGuard>
      )
    },
    {
      path: '/inventory/items',
      element: (
        <PermissionRouteGuard permission={INVENTORY_PERMISSIONS.itemsView}>
          <InventoryItemsListPage />
        </PermissionRouteGuard>
      )
    },
    {
      path: '/inventory/items/new',
      element: (
        <PermissionRouteGuard permission={INVENTORY_PERMISSIONS.itemsCreate}>
          <InventoryItemFormPage />
        </PermissionRouteGuard>
      )
    },
    {
      path: '/inventory/items/:id',
      element: (
        <PermissionRouteGuard permission={INVENTORY_PERMISSIONS.itemsView}>
          <InventoryItemDetailsPage />
        </PermissionRouteGuard>
      )
    },
    {
      path: '/inventory/items/:id/edit',
      element: (
        <PermissionRouteGuard permission={INVENTORY_PERMISSIONS.itemsUpdate}>
          <InventoryItemFormPage />
        </PermissionRouteGuard>
      )
    },
    {
      path: '/inventory/items/:id/movements',
      element: (
        <PermissionRouteGuard permission={INVENTORY_PERMISSIONS.movementsView}>
          <InventoryItemMovementsPage />
        </PermissionRouteGuard>
      )
    },
    {
      path: '/inventory/categories',
      element: (
        <PermissionRouteGuard permission={INVENTORY_PERMISSIONS.categoriesView}>
          <InventoryCategoriesPage />
        </PermissionRouteGuard>
      )
    },
    {
      path: '/inventory/units',
      element: (
        <PermissionRouteGuard permission={INVENTORY_PERMISSIONS.unitsView}>
          <InventoryUnitsPage />
        </PermissionRouteGuard>
      )
    },
    {
      path: '/inventory/party-items',
      element: (
        <PermissionRouteGuard permission={INVENTORY_PERMISSIONS.partyItemsView}>
          <InventoryPartyItemsPage />
        </PermissionRouteGuard>
      )
    },
    {
      path: '/inventory/low-stock',
      element: (
        <PermissionRouteGuard permission={INVENTORY_PERMISSIONS.alertsView}>
          <InventoryLowStockPage />
        </PermissionRouteGuard>
      )
    },
    {
      path: '/inventory/valuation',
      element: (
        <PermissionRouteGuard permission={INVENTORY_PERMISSIONS.view}>
          <InventoryValuationPage />
        </PermissionRouteGuard>
      )
    },
    {
      path: '/sales/invoices',
      element: (
        <PermissionRouteGuard permission={SALES_PERMISSIONS.invoicesView}>
          <SalesInvoicesListPage />
        </PermissionRouteGuard>
      )
    },
    {
      path: '/sales/invoices/new',
      element: (
        <PermissionRouteGuard permission={SALES_PERMISSIONS.invoicesCreate}>
          <SalesInvoiceFormPage />
        </PermissionRouteGuard>
      )
    },
    {
      path: '/sales/invoices/:id',
      element: (
        <PermissionRouteGuard permission={SALES_PERMISSIONS.invoicesView}>
          <SalesInvoiceDetailsPage />
        </PermissionRouteGuard>
      )
    },
    {
      path: '/sales/invoices/:id/edit',
      element: (
        <PermissionRouteGuard permission={SALES_PERMISSIONS.invoicesUpdate}>
          <SalesInvoiceFormPage />
        </PermissionRouteGuard>
      )
    },
    {
      path: '/sales/returns',
      element: (
        <PermissionRouteGuard permission={SALES_PERMISSIONS.returnsView}>
          <SalesReturnsListPage />
        </PermissionRouteGuard>
      )
    },
    {
      path: '/sales/returns/new',
      element: (
        <PermissionRouteGuard permission={SALES_PERMISSIONS.returnsCreate}>
          <SalesReturnFormPage />
        </PermissionRouteGuard>
      )
    },
    {
      path: '/sales/returns/:id',
      element: (
        <PermissionRouteGuard permission={SALES_PERMISSIONS.returnsView}>
          <SalesReturnDetailsPage />
        </PermissionRouteGuard>
      )
    },
    {
      path: '/sales/returns/:id/edit',
      element: (
        <PermissionRouteGuard permission={SALES_PERMISSIONS.returnsUpdate}>
          <SalesReturnFormPage />
        </PermissionRouteGuard>
      )
    },
    {
      path: '/purchases/invoices',
      element: (
        <PermissionRouteGuard permission={PURCHASES_PERMISSIONS.invoicesView}>
          <PurchaseInvoicesListPage />
        </PermissionRouteGuard>
      )
    },
    {
      path: '/purchases/invoices/new',
      element: (
        <PermissionRouteGuard permission={PURCHASES_PERMISSIONS.invoicesCreate}>
          <PurchaseInvoiceFormPage />
        </PermissionRouteGuard>
      )
    },
    {
      path: '/purchases/invoices/:id',
      element: (
        <PermissionRouteGuard permission={PURCHASES_PERMISSIONS.invoicesView}>
          <PurchaseInvoiceDetailsPage />
        </PermissionRouteGuard>
      )
    },
    {
      path: '/purchases/invoices/:id/edit',
      element: (
        <PermissionRouteGuard permission={PURCHASES_PERMISSIONS.invoicesUpdate}>
          <PurchaseInvoiceFormPage />
        </PermissionRouteGuard>
      )
    },
    {
      path: '/purchases/returns',
      element: (
        <PermissionRouteGuard permission={PURCHASES_PERMISSIONS.returnsView}>
          <PurchaseReturnsListPage />
        </PermissionRouteGuard>
      )
    },
    {
      path: '/purchases/returns/new',
      element: (
        <PermissionRouteGuard permission={PURCHASES_PERMISSIONS.returnsCreate}>
          <PurchaseReturnFormPage />
        </PermissionRouteGuard>
      )
    },
    {
      path: '/purchases/returns/:id',
      element: (
        <PermissionRouteGuard permission={PURCHASES_PERMISSIONS.returnsView}>
          <PurchaseReturnDetailsPage />
        </PermissionRouteGuard>
      )
    },
    {
      path: '/purchases/returns/:id/edit',
      element: (
        <PermissionRouteGuard permission={PURCHASES_PERMISSIONS.returnsUpdate}>
          <PurchaseReturnFormPage />
        </PermissionRouteGuard>
      )
    },
    {
      path: '/expenses',
      element: <ExpensesHomePage />
    },
    {
      path: '/expenses/categories',
      element: (
        <PermissionRouteGuard permission={EXPENSES_PERMISSIONS.categoriesView}>
          <ExpenseCategoriesListPage />
        </PermissionRouteGuard>
      )
    },
    {
      path: '/expenses/categories/new',
      element: (
        <PermissionRouteGuard permission={EXPENSES_PERMISSIONS.categoriesManage}>
          <ExpenseCategoryFormPage />
        </PermissionRouteGuard>
      )
    },
    {
      path: '/expenses/categories/:id/edit',
      element: (
        <PermissionRouteGuard permission={EXPENSES_PERMISSIONS.categoriesManage}>
          <ExpenseCategoryFormPage />
        </PermissionRouteGuard>
      )
    },
    {
      path: '/expenses/list',
      element: (
        <PermissionRouteGuard permission={EXPENSES_PERMISSIONS.view}>
          <ExpensesListPage />
        </PermissionRouteGuard>
      )
    },
    {
      path: '/expenses/new',
      element: (
        <PermissionRouteGuard permission={EXPENSES_PERMISSIONS.create}>
          <ExpenseFormPage />
        </PermissionRouteGuard>
      )
    },
    {
      path: '/expenses/:id',
      element: (
        <PermissionRouteGuard permission={EXPENSES_PERMISSIONS.view}>
          <ExpenseDetailsPage />
        </PermissionRouteGuard>
      )
    },
    {
      path: '/expenses/:id/edit',
      element: (
        <PermissionRouteGuard permission={EXPENSES_PERMISSIONS.edit}>
          <ExpenseFormPage />
        </PermissionRouteGuard>
      )
    },
    {
      path: '/administration/roles',
      element: (
        <PermissionRouteGuard permission={ADMINISTRATION_PERMISSIONS.rolesView}>
          <RolesListPage />
        </PermissionRouteGuard>
      )
    },
    {
      path: '/administration/roles/:id',
      element: (
        <PermissionRouteGuard permission={ADMINISTRATION_PERMISSIONS.rolesView}>
          <RoleDetailsPage />
        </PermissionRouteGuard>
      )
    }
  ]
};

export default MainRoutes;
