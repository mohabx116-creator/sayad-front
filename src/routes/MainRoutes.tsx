import { lazy } from 'react';

// project imports
import MainLayout from 'layout/MainLayout';
import AuthGuard from 'utils/route-guard/AuthGuard';
import Loadable from 'ui-component/Loadable';
import PermissionRouteGuard from 'modules/Administration/components/PermissionRouteGuard';
import { ADMINISTRATION_PERMISSIONS } from 'modules/Administration/utils/administration.constants';
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
