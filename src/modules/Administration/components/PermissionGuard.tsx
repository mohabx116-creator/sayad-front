import { ReactNode } from 'react';

import useAuth from 'hooks/useAuth';
import { hasAllPermissions, hasAnyPermission, hasPermission } from '../utils/permission-utils';

type PermissionGuardProps = {
  permission?: string;
  anyPermissions?: readonly string[];
  allPermissions?: readonly string[];
  fallback?: ReactNode;
  children: ReactNode;
};

export default function PermissionGuard({ permission, anyPermissions, allPermissions, fallback = null, children }: PermissionGuardProps) {
  const { user } = useAuth();
  const allowed =
    (permission ? hasPermission(user, permission) : true) &&
    (anyPermissions ? hasAnyPermission(user, anyPermissions) : true) &&
    (allPermissions ? hasAllPermissions(user, allPermissions) : true);

  return allowed ? <>{children}</> : <>{fallback}</>;
}
