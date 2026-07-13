import { lazy } from 'react';

// project imports
import MainLayout from 'layout/MainLayout';
import AuthGuard from 'utils/route-guard/AuthGuard';
import Loadable from 'ui-component/Loadable';
import PermissionRouteGuard from 'modules/Administration/components/PermissionRouteGuard';
import { ADMINISTRATION_PERMISSIONS } from 'modules/Administration/utils/administration.constants';
import { INVENTORY_PERMISSIONS } from 'modules/Inventory/utils/inventory.constants';
import { PARTIES_PERMISSIONS } from 'modules/Parties/utils/parties.constants';

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
const InventoryItemsListPage = Loadable(lazy(() => import('modules/Inventory/pages/InventoryItemsListPage')));
const InventoryItemDetailsPage = Loadable(lazy(() => import('modules/Inventory/pages/InventoryItemDetailsPage')));
const InventoryItemFormPage = Loadable(lazy(() => import('modules/Inventory/pages/InventoryItemFormPage')));
const InventoryItemMovementsPage = Loadable(lazy(() => import('modules/Inventory/pages/InventoryItemMovementsPage')));
const InventoryCategoriesPage = Loadable(lazy(() => import('modules/Inventory/pages/InventoryCategoriesPage')));
const InventoryUnitsPage = Loadable(lazy(() => import('modules/Inventory/pages/InventoryUnitsPage')));
const InventoryLowStockPage = Loadable(lazy(() => import('modules/Inventory/pages/InventoryLowStockPage')));

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
      path: '/inventory/low-stock',
      element: (
        <PermissionRouteGuard permission={INVENTORY_PERMISSIONS.alertsView}>
          <InventoryLowStockPage />
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
    },
  ]
};

export default MainRoutes;
