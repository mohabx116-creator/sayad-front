import { useNavigate } from 'react-router-dom';

// project imports
import useAuth from 'hooks/useAuth';
import { GuardProps } from 'types';
import { useEffect } from 'react';
import Loader from 'ui-component/Loader';

// ==============================|| AUTH GUARD ||============================== //

/**
 * Authentication guard for routes
 * @param {PropTypes.node} children children element/node
 */
export default function AuthGuard({ children }: GuardProps) {
  const { isInitialized, isLoggedIn } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isInitialized) {
      return;
    }

    if (!isLoggedIn) {
      navigate('/login', { replace: true });
    }
  }, [isInitialized, isLoggedIn, navigate]);

  if (!isInitialized) {
    return <Loader />;
  }

  return children;
}
