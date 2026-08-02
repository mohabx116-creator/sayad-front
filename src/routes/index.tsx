import { lazy } from 'react';
import { createBrowserRouter } from 'react-router-dom';

// routes
import LoginRoutes from './LoginRoutes';
import MainRoutes from './MainRoutes';

// project imports
import GuestGuard from 'utils/route-guard/GuestGuard';
import Loadable from 'ui-component/Loadable';

const PagesLanding = Loadable(lazy(() => import('views/pages/landing')));
const NotFoundPage = Loadable(lazy(() => import('views/pages/errors/NotFound')));
const ForbiddenPage = Loadable(lazy(() => import('views/pages/errors/Forbidden')));
const UnauthorizedPage = Loadable(lazy(() => import('views/pages/errors/Unauthorized')));

const router = createBrowserRouter(
  [
    {
      path: '/',
      element: (
        <GuestGuard>
          <PagesLanding />
        </GuestGuard>
      )
    },
    {
      path: '/401',
      element: <UnauthorizedPage />
    },
    {
      path: '/403',
      element: <ForbiddenPage />
    },
    {
      path: '*',
      element: <NotFoundPage />
    },
    LoginRoutes,
    MainRoutes
  ],
  {
    basename: import.meta.env.VITE_APP_BASE_NAME
  }
);

export default router;
