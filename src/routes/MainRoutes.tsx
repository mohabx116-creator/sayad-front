import { lazy } from 'react';

// project imports
import MainLayout from 'layout/MainLayout';
import AuthGuard from 'utils/route-guard/AuthGuard';
import Loadable from 'ui-component/Loadable';
import PermissionRouteGuard from 'modules/Administration/components/PermissionRouteGuard';
import { ADMINISTRATION_PERMISSIONS } from 'modules/Administration/utils/administration.constants';
import { INVENTORY_PERMISSIONS } from 'modules/Inventory/utils/inventory.constants';
import { PARTIES_PERMISSIONS } from 'modules/Parties/utils/parties.constants';
import { PURCHASES_PERMISSIONS } from 'modules/Purchases/utils/purchases.constants';
import { TREASURY_PERMISSIONS } from 'modules/Treasury/utils/treasury.constants';
import { SALES_PERMISSIONS } from 'modules/Sales/utils/sales.constants';

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
const InventoryItemsListPage = Loadable(lazy(() => import('modules/Inventory/pages/InventoryItemsListPage')));
const InventoryItemDetailsPage = Loadable(lazy(() => import('modules/Inventory/pages/InventoryItemDetailsPage')));
const InventoryItemFormPage = Loadable(lazy(() => import('modules/Inventory/pages/InventoryItemFormPage')));
const InventoryItemMovementsPage = Loadable(lazy(() => import('modules/Inventory/pages/InventoryItemMovementsPage')));
const InventoryCategoriesPage = Loadable(lazy(() => import('modules/Inventory/pages/InventoryCategoriesPage')));
const InventoryUnitsPage = Loadable(lazy(() => import('modules/Inventory/pages/InventoryUnitsPage')));
const InventoryPartyItemsPage = Loadable(lazy(() => import('modules/Inventory/pages/InventoryPartyItemsPage')));
const InventoryLowStockPage = Loadable(lazy(() => import('modules/Inventory/pages/InventoryLowStockPage')));
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
