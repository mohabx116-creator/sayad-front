import { lazy } from 'react';

// project imports
import GuestGuard from 'utils/route-guard/GuestGuard';
import MinimalLayout from 'layout/MinimalLayout';
import NavMotion from 'layout/NavMotion';
import Loadable from 'ui-component/Loadable';

const AuthLogin = Loadable(lazy(() => import('views/pages/authentication/Login')));
const AuthRegister = Loadable(lazy(() => import('views/pages/authentication/Register')));
const AuthForgotPassword = Loadable(lazy(() => import('views/pages/authentication/ForgotPassword')));
const AuthResetPassword = Loadable(lazy(() => import('views/pages/authentication/ResetPassword')));

const LoginRoutes = {
  path: '/',
  element: (
    <NavMotion>
      <GuestGuard>
        <MinimalLayout />
      </GuestGuard>
    </NavMotion>
  ),
  children: [
    {
      path: '/login',
      element: <AuthLogin />
    },
    {
      path: '/register',
      element: <AuthRegister />
    },
    {
      path: '/forgot-password',
      element: <AuthForgotPassword />
    },
    {
      path: '/reset-password',
      element: <AuthResetPassword />
    }
  ]
};

export default LoginRoutes;
