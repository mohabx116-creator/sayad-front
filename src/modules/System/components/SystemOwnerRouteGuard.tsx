import { ReactElement } from 'react';
import { Navigate } from 'react-router-dom';

import useAuth from 'hooks/useAuth';

type SystemOwnerRouteGuardProps = {
  children: ReactElement;
};

export default function SystemOwnerRouteGuard({ children }: SystemOwnerRouteGuardProps) {
  const { user } = useAuth();

  return user?.isSystemOwner ? children : <Navigate to="/dashboard" replace />;
}
