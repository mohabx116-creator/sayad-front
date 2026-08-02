import { createContext, ReactElement, useEffect, useReducer } from 'react';

// reducer - state management
import { LOGIN, LOGOUT } from 'store/actions';
import accountReducer from 'store/accountReducer';

// project imports
import Loader from 'ui-component/Loader';

// types
import { InitialLoginContextProps, JWTContextType } from 'types/auth';
import {
  changePassword as changePasswordRequest,
  clearAccessToken,
  getAccessToken,
  loadCurrentUser,
  refreshSession,
  setAccessToken,
  signIn,
  signOut,
  updateCurrentUser as updateCurrentUserRequest
} from 'utils/auth-session';

const initialState: InitialLoginContextProps = {
  isLoggedIn: false,
  isInitialized: false,
  user: null
};

const JWTContext = createContext<JWTContextType | null>(null);

export function JWTProvider({ children }: { children: ReactElement }) {
  const [state, dispatch] = useReducer(accountReducer, initialState);

  useEffect(() => {
    const init = async () => {
      try {
        const accessToken = getAccessToken();
        if (accessToken) {
          setAccessToken(accessToken);
          const user = await loadCurrentUser();
          dispatch({
            type: LOGIN,
            payload: {
              isLoggedIn: true,
              user
            }
          });
          return;
        }

        const session = await refreshSession();
        setAccessToken(session.accessToken);
        dispatch({
          type: LOGIN,
          payload: {
            isLoggedIn: true,
            user: session.user
          }
        });
      } catch (error) {
        console.error(error);
        clearAccessToken();
        dispatch({
          type: LOGOUT
        });
      }
    };

    init();
  }, []);

  const login = async (email: string, password: string) => {
    const session = await signIn(email, password);
    dispatch({
      type: LOGIN,
      payload: {
        isLoggedIn: true,
        user: session.user
      }
    });
  };

  const logout = async () => {
    await signOut();
    dispatch({ type: LOGOUT });
  };

  const refreshAuthSession = async () => {
    const session = await refreshSession();
    dispatch({
      type: LOGIN,
      payload: {
        isLoggedIn: true,
        user: session.user
      }
    });
  };

  const updateProfile = async (displayName: string) => {
    const user = await updateCurrentUserRequest(displayName);
    dispatch({
      type: LOGIN,
      payload: {
        isLoggedIn: true,
        user
      }
    });
  };

  const changePassword = async (currentPassword: string, newPassword: string, confirmPassword: string) => {
    const session = await changePasswordRequest(currentPassword, newPassword, confirmPassword);
    dispatch({
      type: LOGIN,
      payload: {
        isLoggedIn: true,
        user: session.user
      }
    });
  };

  if (state.isInitialized !== undefined && !state.isInitialized) {
    return <Loader />;
  }

  return <JWTContext value={{ ...state, login, logout, refreshSession: refreshAuthSession, updateProfile, changePassword }}>{children}</JWTContext>;
}

export default JWTContext;
