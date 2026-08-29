import { useEffect, useMemo } from 'react';
import { useIntl } from 'react-intl';
import { useLocation } from 'react-router-dom';

import { APP_BROWSER_TITLE, BrowserTitlePart, formatBrowserTitle, resolveRouteBrowserTitle } from 'shared/utils/browserTitle';

function normalizeParts(parts: BrowserTitlePart[] | BrowserTitlePart | undefined) {
  if (Array.isArray(parts)) {
    return parts;
  }

  return parts ? [parts] : [];
}

export function useBrowserTitle(parts: BrowserTitlePart[] | BrowserTitlePart | undefined) {
  const normalizedParts = normalizeParts(parts);
  const title = useMemo(() => formatBrowserTitle(...normalizedParts), [normalizedParts.join('\u0000')]);

  useEffect(() => {
    document.title = title;

    return () => {
      document.title = APP_BROWSER_TITLE;
    };
  }, [title]);
}

export function useRouteBrowserTitle() {
  const intl = useIntl();
  const { pathname } = useLocation();
  const routeTitle = useMemo(() => resolveRouteBrowserTitle(pathname, intl), [intl, pathname]);

  useBrowserTitle(routeTitle ? [routeTitle] : []);
}
