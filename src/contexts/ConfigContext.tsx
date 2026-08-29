import { createContext, ReactNode, useEffect, useMemo, useRef } from 'react';
import { useSWRConfig } from 'swr';

// project imports
import config from 'config';
import { useLocalStorage } from 'hooks/useLocalStorage';

// types
import { ConfigContextValue, ConfigStates } from 'types/config';

export type Props = {
  children: ReactNode;
};

// ==============================|| CONFIG CONTEXT ||============================== //

export const ConfigContext = createContext<ConfigContextValue | undefined>(undefined);

// ==============================|| CONFIG PROVIDER ||============================== //

export function ConfigProvider({ children }: Props) {
  const { mutate } = useSWRConfig();
  const { state, setState, setField, resetState } = useLocalStorage<ConfigStates>('berry-config-vite-ts', config);
  const initialRender = useRef(true);

  useEffect(() => {
    if (initialRender.current) {
      initialRender.current = false;
      return;
    }

    void mutate(() => true);
  }, [mutate, state.i18n]);

  const memoizedValue = useMemo(() => ({ state, setState, setField, resetState }), [state, setField, setState, resetState]);

  return <ConfigContext.Provider value={memoizedValue}>{children}</ConfigContext.Provider>;
}
