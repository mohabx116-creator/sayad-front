import { ReactElement } from 'react';
import { Navigate } from 'react-router-dom';

import useAuth from 'hooks/useAuth';
import { hasAnyPermission, hasPermission } from '../utils/permission-utils';

type PermissionRouteGuardProps = {
  permission?: string;
  anyPermissions?: readonly string[];
  children: ReactElement;
};

export default function PermissionRouteGuard({ permission, anyPermissions, children }: PermissionRouteGuardProps) {
  const { user } = useAuth();
  const allowed = permission ? hasPermission(user, permission) : anyPermissions ? hasAnyPermission(user, anyPermissions) : true;

  return allowed ? children : <Navigate to="/dashboard" replace />;
}
