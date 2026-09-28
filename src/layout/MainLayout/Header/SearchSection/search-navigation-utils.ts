import type { IntlShape } from 'react-intl';

import type { NavItemType } from 'types';
import type { UserProfile } from 'types/user-profile';
import { hasAnyPermission, hasPermission } from 'modules/Administration/utils/permission-utils';

export type GlobalNavigationEntry = {
  id: string;
  title: string;
  route: string;
  icon?: NavItemType['icon'];
  parentTitle?: string;
};

export type GlobalSearchEntry = GlobalNavigationEntry & {
  kind: 'navigation' | 'party' | 'item' | 'worker';
  subtitle?: string;
  detail?: string;
};

type PermissionContext = {
  user: UserProfile | null | undefined;
  parentTitle?: string;
};

function isAllowed(item: NavItemType, user: UserProfile | null | undefined) {
  const permissionAllowed = item.permission ? hasPermission(user, item.permission) : true;
  const anyPermissionAllowed = item.anyPermissions ? hasAnyPermission(user, item.anyPermissions) : true;
  const systemOwnerAllowed = item.systemOwnerOnly ? Boolean(user?.isSystemOwner) : true;

  return permissionAllowed && anyPermissionAllowed && systemOwnerAllowed;
}

function getTitle(item: NavItemType, intl: IntlShape) {
  const messageId = item.title ?? item.id ?? item.url ?? item.link ?? '';
  return intl.formatMessage({ id: messageId, defaultMessage: messageId });
}

export function flattenSearchableNavigation(
  items: NavItemType[],
  intl: IntlShape,
  user: UserProfile | null | undefined,
  context: PermissionContext = { user }
): GlobalNavigationEntry[] {
  return items.flatMap((item) => {
    if (!isAllowed(item, user)) {
      return [];
    }

    const title = getTitle(item, intl);
    const route = item.link ?? item.url;
    const entry =
      route && !item.disabled && !item.external
        ? [{ id: item.id ?? route, title, route, icon: item.icon, parentTitle: context.parentTitle }]
        : [];
    const children = item.children ?? item.elements ?? [];

    return [
      ...entry,
      ...flattenSearchableNavigation(children, intl, user, {
        user,
        parentTitle: route ? title : context.parentTitle
      })
    ];
  });
}

function matchRank(title: string, query: string) {
  const normalizedTitle = title.toLocaleLowerCase();
  const normalizedQuery = query.toLocaleLowerCase();

  if (normalizedTitle === normalizedQuery) return 0;
  if (normalizedTitle.startsWith(normalizedQuery)) return 1;
  return 2;
}

export function searchNavigation(entries: GlobalNavigationEntry[], query: string) {
  const normalizedQuery = query.trim();

  if (!normalizedQuery) {
    return entries.slice(0, 8);
  }

  return entries
    .filter((entry) => entry.title.toLocaleLowerCase().includes(normalizedQuery.toLocaleLowerCase()))
    .sort((left, right) => matchRank(left.title, normalizedQuery) - matchRank(right.title, normalizedQuery));
}
