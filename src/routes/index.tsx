import { lazy } from 'react';
import { createBrowserRouter } from 'react-router-dom';

// routes
import LoginRoutes from './LoginRoutes';
import MainRoutes from './MainRoutes';

// project imports
import Loadable from 'ui-component/Loadable';

const PagesLanding = Loadable(lazy(() => import('views/pages/landing')));

const router = createBrowserRouter(
  [
    { path: '/', element: <PagesLanding /> },
    LoginRoutes,
    MainRoutes
  ],
  {
    basename: import.meta.env.VITE_APP_BASE_NAME
  }
);

export default router;
