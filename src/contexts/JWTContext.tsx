import { createContext, ReactElement, useEffect, useReducer } from 'react';

// reducer - state management
import { LOGIN, LOGOUT } from 'store/actions';
import accountReducer from 'store/accountReducer';

// project imports
import Loader from 'ui-component/Loader';

// types
import { InitialLoginContextProps, JWTContextType } from 'types/auth';
import { clearAccessToken, getAccessToken, loadCurrentUser, refreshSession, setAccessToken, signIn, signOut } from 'utils/auth-session';

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

  if (state.isInitialized !== undefined && !state.isInitialized) {
    return <Loader />;
  }

  return <JWTContext value={{ ...state, login, logout, refreshSession: refreshAuthSession }}>{children}</JWTContext>;
}

export default JWTContext;
