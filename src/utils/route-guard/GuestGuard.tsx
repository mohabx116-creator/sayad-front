import { useNavigate } from 'react-router-dom';

// project imports
import useAuth from 'hooks/useAuth';
import { DASHBOARD_PATH } from 'config';
import { GuardProps } from 'types';
import { useEffect } from 'react';
import Loader from 'ui-component/Loader';

// ==============================|| GUEST GUARD ||============================== //

/**
 * Guest guard for routes having no auth required
 * @param {PropTypes.node} children children element/node
 */

export default function GuestGuard({ children }: GuardProps) {
  const { isInitialized, isLoggedIn } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isInitialized) {
      return;
    }

    if (isLoggedIn) {
      navigate(DASHBOARD_PATH, { replace: true });
    }
  }, [isInitialized, isLoggedIn, navigate]);

  if (!isInitialized) {
    return <Loader />;
  }

  return children;
}
