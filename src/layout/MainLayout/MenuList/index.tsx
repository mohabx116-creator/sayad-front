import { Activity, memo, useLayoutEffect, useState } from 'react';

// material-ui
import { Theme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import Divider from '@mui/material/Divider';
import List from '@mui/material/List';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

// project imports
import NavItem from './NavItem';
import NavGroup from './NavGroup';
import { MenuOrientation } from 'config';
import menuItem from 'menu-items';
import useConfig from 'hooks/useConfig';
import useAuth from 'hooks/useAuth';
import { hasAnyPermission, hasPermission } from 'modules/Administration/utils/permission-utils';

import { useGetMenuMaster } from 'api/menu';
import { HORIZONTAL_MAX_ITEM } from 'config';

// types
import { NavItemType } from 'types';

// ==============================|| SIDEBAR MENU LIST ||============================== //

function MenuList() {
  const downMD = useMediaQuery((theme: Theme) => theme.breakpoints.down('md'));

  const {
    state: { menuOrientation }
  } = useConfig();
  const { user } = useAuth();
  const { menuMaster } = useGetMenuMaster();
  const drawerOpen = menuMaster.isDashboardDrawerOpened;
  const isHorizontal = menuOrientation === MenuOrientation.HORIZONTAL && !downMD;

  const [selectedID, setSelectedID] = useState<string | undefined>('');
  const [menuItems, setMenuItems] = useState<{ items: NavItemType[] }>({ items: [] });

  const filterMenuByPermissions = (items: NavItemType[]): NavItemType[] =>
    items
      .map((item) => ({
        ...item,
        children: item.children ? filterMenuByPermissions(item.children) : undefined
      }))
      .filter((item) => {
        const permissionAllowed = item.permission ? hasPermission(user, item.permission) : true;
        const anyPermissionAllowed = item.anyPermissions ? hasAnyPermission(user, item.anyPermissions) : true;
        const systemOwnerAllowed = item.systemOwnerOnly ? Boolean(user?.isSystemOwner) : true;
        const hasVisibleChildren = item.children ? item.children.length > 0 : true;
        return permissionAllowed && anyPermissionAllowed && systemOwnerAllowed && hasVisibleChildren;
      });

  useLayoutEffect(() => {
    setMenuItems({ items: filterMenuByPermissions([...menuItem.items]) });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // last menu-item to show in horizontal menu bar
  const lastItem = isHorizontal ? HORIZONTAL_MAX_ITEM : null;

  let lastItemIndex = menuItems.items.length - 1;
  let remItems: NavItemType[] = [];
  let lastItemId: string;

  if (lastItem && lastItem < menuItems.items.length) {
    lastItemId = menuItems.items[lastItem - 1].id!;
    lastItemIndex = lastItem - 1;
    remItems = menuItems.items.slice(lastItem - 1, menuItems.items.length).map((item) => ({
      title: item.title,
      elements: item.children,
      icon: item.icon,
      ...(item.url && {
        url: item.url
      })
    }));
  }

  const navItems = menuItems.items.slice(0, lastItemIndex + 1).map((item, index) => {
    switch (item.type) {
      case 'group':
        if (item.url && item.id !== lastItemId) {
          return (
            <List key={item.id}>
              <NavItem item={item} level={1} isParents setSelectedID={() => setSelectedID('')} />
              <Activity mode={!isHorizontal && index !== 0 ? 'visible' : 'hidden'}>
                <Divider sx={{ py: 0.5 }} />
              </Activity>
            </List>
          );
        }

        return (
          <NavGroup
            key={item.id}
            setSelectedID={setSelectedID}
            selectedID={selectedID}
            item={item}
            lastItem={lastItem!}
            remItems={remItems}
            lastItemId={lastItemId}
          />
        );
      default:
        return (
          <Typography key={item.id} variant="h6" align="center" sx={{ color: 'error.main' }}>
            Menu Items Error
          </Typography>
        );
    }
  });

  return !isHorizontal ? <Box {...(drawerOpen && { sx: { mt: 1.5 } })}>{navItems}</Box> : <>{navItems}</>;
}

export default memo(MenuList);
