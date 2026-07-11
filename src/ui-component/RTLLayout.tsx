import { useEffect, ReactNode } from 'react';

// material-ui
import createCache from '@emotion/cache';
import { CacheProvider } from '@emotion/react';

// third party
import rtlPlugin from 'stylis-plugin-rtl';

// project imports
import { ThemeDirection } from 'config';
import useConfig from 'hooks/useConfig';

// ==============================|| RTL LAYOUT ||============================== //

interface Props {
  children: ReactNode;
}

const rtlCache = createCache({
  key: 'muirtl',
  stylisPlugins: [rtlPlugin]
});

const ltrCache = createCache({
  key: 'mui'
});

export default function RTLLayout({ children }: Props) {
  const { state, setField } = useConfig();

  // When locale changes, update themeDirection automatically
  useEffect(() => {
    const isRtl = state.i18n?.toLowerCase().startsWith('ar'); // 'ar' or 'ar-EG'
    const nextDir = isRtl ? ThemeDirection.RTL : ThemeDirection.LTR;

    if (state.themeDirection !== nextDir) {
      setField('themeDirection', nextDir);
    }
  }, [state.i18n, state.themeDirection, setField]);

  useEffect(() => {
    const isAr = state.i18n?.toLowerCase().startsWith('ar');
  
    const nextFont = isAr
      ? `'Cairo', 'Roboto', sans-serif`
      : `'Roboto', sans-serif`;
  
    if (state.fontFamily !== nextFont) {
      setField('fontFamily', nextFont);
    }
  }, [state.i18n, state.fontFamily, setField]);
  

  
  // Apply direction + language to the document
  useEffect(() => {
    document.documentElement.setAttribute('dir', state.themeDirection);
    document.documentElement.setAttribute('lang', state.i18n || 'en');
  }, [state.themeDirection, state.i18n]);

  return (
    <CacheProvider value={state.themeDirection === ThemeDirection.RTL ? rtlCache : ltrCache}>{children}</CacheProvider>
  );
}
