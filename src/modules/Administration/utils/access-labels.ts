import enMessages from 'utils/locales/en.json';
import arMessages from 'utils/locales/ar.json';

export type PermissionScope = 'module' | 'page' | 'action';

export type PermissionPathInfo = {
  moduleKey: string;
  resourceKey: string | null;
  actionKey: string | null;
  scope: PermissionScope;
  routePath: string;
};

export function getBilingualLabel(key: string, locale: string) {
  const normalizedKey = key.toLowerCase().replace(/\s+/g, '-');
  const englishLabel = (enMessages as Record<string, string>)[normalizedKey] ?? key;
  const arabicLabel = (arMessages as Record<string, string>)[normalizedKey] ?? key;
  const first = locale.startsWith('ar') ? arabicLabel : englishLabel;
  const second = locale.startsWith('ar') ? englishLabel : arabicLabel;

  if (!second || second === first) {
    return first;
  }

  return `${first} (${second})`;
}

export function getBilingualPermissionLabel(arabic: string, english: string, locale: string) {
  const first = locale.startsWith('ar') ? arabic : english;
  const second = locale.startsWith('ar') ? english : arabic;

  if (!second || second === first) {
    return first;
  }

  return `${first} (${second})`;
}

export function getBilingualRoleLabel(arabic: string, english: string, fallback: string, locale: string) {
  const first = locale.startsWith('ar') ? (arabic || english || fallback) : (english || arabic || fallback);
  const second = locale.startsWith('ar') ? (english || fallback) : (arabic || fallback);

  if (!second || second === first) {
    return first;
  }

  return `${first} (${second})`;
}

function getPermissionSegments(code: string) {
  return code
    .toLowerCase()
    .trim()
    .split('.')
    .map((segment) => segment.trim())
    .filter(Boolean);
}

export function getPermissionPathInfo(code: string): PermissionPathInfo {
  const segments = getPermissionSegments(code);
  const moduleKey = segments[0] ?? code.toLowerCase().trim();
  const resourceKey = segments.length > 2 ? segments[1] ?? null : null;
  const actionKey = segments.length > 2 ? segments[segments.length - 1] ?? null : segments[1] ?? null;
  const scope: PermissionScope =
    segments.length <= 2 ? 'module' : segments[segments.length - 1] === 'view' ? 'page' : 'action';
  const routePath = resourceKey ? `/${moduleKey}/${resourceKey}` : `/${moduleKey}`;

  return {
    moduleKey,
    resourceKey,
    actionKey,
    scope,
    routePath
  };
}

export function getPermissionScopeLabel(scope: PermissionScope, locale: string) {
  return getBilingualLabel(`permission-scope-${scope}`, locale);
}

export function getPermissionScopeHelper(scope: PermissionScope, locale: string) {
  return getBilingualLabel(`permission-scope-${scope}-help`, locale);
}

export function getPermissionResourceLabel(code: string, locale: string) {
  const info = getPermissionPathInfo(code);

  if (!info.resourceKey) {
    return getBilingualLabel(info.moduleKey, locale);
  }

  const modulePrefixedKey = `${info.moduleKey}-${info.resourceKey}`;
  const modulePrefixedLabel = getBilingualLabel(modulePrefixedKey, locale);

  if (modulePrefixedLabel !== modulePrefixedKey) {
    return modulePrefixedLabel;
  }

  return getBilingualLabel(info.resourceKey, locale);
}

export function getPermissionActionLabel(code: string, locale: string) {
  const info = getPermissionPathInfo(code);

  if (!info.actionKey) {
    return '';
  }

  return getBilingualLabel(info.actionKey, locale);
}

export function getPermissionRoutePath(code: string) {
  return getPermissionPathInfo(code).routePath;
}
