export function getAdministrationScope(pathname: string = typeof window !== 'undefined' ? window.location.pathname : '') {
  return pathname.startsWith('/system') ? 'system' : 'administration';
}

export function getAdministrationRouteBase(pathname: string = typeof window !== 'undefined' ? window.location.pathname : '') {
  return pathname.startsWith('/system') ? '/system' : '/administration';
}

export function getAdministrationApiBasePath(pathname: string = typeof window !== 'undefined' ? window.location.pathname : '') {
  return pathname.startsWith('/system') ? '/api/system' : '/api/administration';
}
