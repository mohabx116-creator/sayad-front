import { Activity, Fragment, useEffect, useState } from 'react';
import { matchPath, useLocation } from 'react-router-dom';

// material-ui
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import Divider from '@mui/material/Divider';
import List from '@mui/material/List';
import Collapse from '@mui/material/Collapse';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Paper from '@mui/material/Paper';
import Popper from '@mui/material/Popper';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

// third party
import { FormattedMessage } from 'react-intl';

// project imports
import NavCollapse from '../NavCollapse';
import NavItem from '../NavItem';

import { MenuOrientation } from 'config';
import useConfig from 'hooks/useConfig';
import Transitions from 'ui-component/extended/Transitions';
import { useGetMenuMaster } from 'api/menu';

// assets
import { IconChevronDown, IconChevronRight, IconChevronUp, IconMinusVertical } from '@tabler/icons-react';

// types
import { NavItemType } from 'types';

type VirtualElement = {
  getBoundingClientRect: () => DOMRectReadOnly | DOMRect;
  contextElement?: Element;
};

interface NavGroupProps {
  item: NavItemType;
  lastItem: number;
  remItems: NavItemType[];
  lastItemId: string;
  setSelectedID: React.Dispatch<React.SetStateAction<string | undefined>>;
  selectedID: string | undefined;
}

// ==============================|| SIDEBAR MENU LIST GROUP ||============================== //

export default function NavGroup({ item, lastItem, remItems, lastItemId, selectedID, setSelectedID }: NavGroupProps) {
  const theme = useTheme();
  const downMD = useMediaQuery(theme.breakpoints.down('md'));
  const { pathname } = useLocation();

  const {
    state: { menuOrientation, borderRadius }
  } = useConfig();
  const { menuMaster } = useGetMenuMaster();
  const drawerOpen = menuMaster.isDashboardDrawerOpened;
  const isHorizontal = menuOrientation === MenuOrientation.HORIZONTAL && !downMD;

  const [anchorEl, setAnchorEl] = useState<VirtualElement | (() => VirtualElement) | null | undefined>(null);
  const [currentItem, setCurrentItem] = useState(item);

  const openMini = Boolean(anchorEl);

  useEffect(() => {
    if (lastItem) {
      if (item.id === lastItemId) {
        const localItem: any = { ...item };
        const elements = remItems.map((ele: NavItemType) => ele.elements);
        localItem.children = elements.flat(1);
        setCurrentItem(localItem);
      } else {
        setCurrentItem(item);
      }
    }
  }, [item, lastItem, menuOrientation, remItems, lastItemId]);

  const checkOpenForParent = (child: NavItemType[], id: string) => {
    child.forEach((ele: NavItemType) => {
      if (ele.children?.length) {
        checkOpenForParent(ele.children, currentItem.id!);
      }
      if (ele?.url && !!matchPath({ path: ele?.link ? ele.link : ele.url, end: true }, pathname)) {
        setSelectedID(id);
      }
    });
  };

  const checkSelectedOnload = (data: NavItemType) => {
    const childrens = data.children ? data.children : [];
    childrens.forEach((itemCheck: NavItemType) => {
      if (itemCheck?.children?.length) {
        checkOpenForParent(itemCheck.children, currentItem.id!);
      }
      if (itemCheck?.url && !!matchPath({ path: itemCheck?.link ? itemCheck.link : itemCheck.url, end: true }, pathname)) {
        setSelectedID(currentItem.id!);
      }
    });

    if (data?.url && !!matchPath({ path: data?.link ? data.link : data.url, end: true }, pathname)) {
      setSelectedID(currentItem.id!);
    }
  };

  // keep selected-menu on page load and use for horizontal menu close on change routes
  useEffect(() => {
    checkSelectedOnload(currentItem);
    if (openMini) setAnchorEl(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, currentItem]);

  const handleClick = (event: React.MouseEvent<HTMLAnchorElement> | React.MouseEvent<HTMLDivElement, MouseEvent> | undefined) => {
    if (!openMini) {
      setAnchorEl(event?.currentTarget);
    }
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleToggle = () => {
    setSelectedID(isSelected ? '' : currentItem.id!);
  };

  const Icon = currentItem?.icon!;
  const itemIcon = currentItem?.icon ? <Icon stroke={1.5} size="20px" /> : null;

  // menu list collapse & items
  const items = currentItem.children?.map((menu) => {
    switch (menu?.type) {
      case 'collapse':
        return <NavCollapse key={menu.id} menu={menu} level={1} parentId={currentItem.id!} />;
      case 'item':
        return <NavItem key={menu.id} item={menu} level={1} />;
      default:
        return (
          <Typography key={menu?.id} variant="h6" align="center" sx={{ color: 'error.main' }}>
            Menu Items Error
          </Typography>
        );
    }
  });

  const moreItems = remItems.map((itemRem: NavItemType, i) => (
    <Fragment key={i}>
      {itemRem.url ? (
        <NavItem item={itemRem} level={1} />
      ) : (
        <Activity mode={itemRem.title ? 'visible' : 'hidden'}>
          <Typography variant="caption" sx={{ pl: 2 }}>
            {itemRem.title} {itemRem.url}
          </Typography>
        </Activity>
      )}
      {itemRem?.elements?.map((menu) => {
        switch (menu?.type) {
          case 'collapse':
            return <NavCollapse key={menu.id} menu={menu} level={1} parentId={currentItem.id!} />;
          case 'item':
            return <NavItem key={menu.id} item={menu} level={1} />;
          default:
            return (
              <Typography key={menu.id} variant="h6" align="center" sx={{ color: 'error.main' }}>
                Menu Items Error
              </Typography>
            );
        }
      })}
    </Fragment>
  ));

  const popperId = openMini ? `group-pop-${item.id}` : undefined;
  const isSelected = selectedID === currentItem.id;

  // Handle single direct destination
  const validChildren = currentItem.children?.filter((c) => c) || [];
  const isSingleDirectDestination = validChildren.length === 1 && validChildren[0].type === 'item';

  return (
    <>
      {!isHorizontal ? (
        <>
          {isSingleDirectDestination || !drawerOpen ? (
            <List disablePadding={!drawerOpen} sx={{ py: 0 }}>
              {items}
            </List>
          ) : (
            <>
              <ListItemButton
                sx={{
                  zIndex: 1201,
                  borderRadius: `${borderRadius}px`,
                  mb: 0.5,
                  alignItems: 'center',
                  ...(!drawerOpen ? { pl: 1.25 } : {}),
                  ...(isSelected
                    ? {
                        bgcolor: 'secondary.light',
                        '&:hover': { bgcolor: 'secondary.light' },
                        color: 'secondary.main'
                      }
                    : {}),
                  ...theme.applyStyles('dark', {
                    ...(isSelected
                      ? {
                          bgcolor: 'secondary.dark',
                          '&:hover': { bgcolor: 'secondary.dark' },
                          color: 'secondary.light'
                        }
                      : {})
                  })
                }}
                selected={isSelected}
                onClick={handleToggle}
              >
                <Activity mode={itemIcon ? 'visible' : 'hidden'}>
                  <ListItemIcon sx={{ minWidth: 36, color: 'inherit' }}>{itemIcon}</ListItemIcon>
                </Activity>
                {drawerOpen && (
                  <ListItemText
                    primary={
                      <Typography variant={isSelected ? 'h5' : 'body1'} color="inherit" sx={{ fontWeight: isSelected ? 600 : 500 }}>
                        <FormattedMessage id={currentItem.title} />
                      </Typography>
                    }
                  />
                )}
                {drawerOpen &&
                  (isSelected ? (
                    <IconChevronUp stroke={1.5} size="16px" style={{ marginTop: 'auto', marginBottom: 'auto' }} />
                  ) : (
                    <IconChevronDown stroke={1.5} size="16px" style={{ marginTop: 'auto', marginBottom: 'auto' }} />
                  ))}
              </ListItemButton>
              <Collapse in={drawerOpen && isSelected} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                  {items}
                </List>
              </Collapse>
            </>
          )}

          {/* group divider */}
          <Activity mode={drawerOpen ? 'visible' : 'hidden'}>
            <Divider sx={{ mt: 0.25, mb: 1.25 }} />
          </Activity>
        </>
      ) : (
        <List>
          <ListItemButton
            selected={isSelected}
            sx={{
              borderRadius: `${borderRadius}px`,
              p: 1,
              my: 0.5,
              mr: 1,
              display: 'flex',
              alignItems: 'center',
              backgroundColor: 'inherit'
            }}
            onMouseEnter={handleClick}
            onClick={handleClick}
            onMouseLeave={handleClose}
            aria-describedby={popperId}
            className={anchorEl ? 'Mui-selected' : ''}
          >
            <Activity mode={itemIcon ? 'visible' : 'hidden'}>
              <ListItemIcon sx={{ minWidth: 36 }}>
                {currentItem.id === lastItemId ? <IconMinusVertical stroke={1.5} size="20px" /> : itemIcon}
              </ListItemIcon>
            </Activity>
            <ListItemText
              sx={{ mr: 1, mb: 0.25 }}
              primary={
                <Typography variant={isSelected ? 'h5' : 'body1'} sx={{ color: 'inherit' }}>
                  {currentItem.id === lastItemId ? <FormattedMessage id="more-items" /> : <FormattedMessage id={currentItem.title} />}
                </Typography>
              }
            />
            {openMini ? <IconChevronDown stroke={1.5} size="16px" /> : <IconChevronRight stroke={1.5} size="16px" />}

            <Activity mode={anchorEl ? 'visible' : 'hidden'}>
              <Popper
                id={popperId}
                open={openMini}
                anchorEl={anchorEl}
                placement="bottom-start"
                sx={{
                  overflow: 'visible',
                  zIndex: 2001,
                  minWidth: 180,
                  '&:before': {
                    content: '""',
                    display: 'block',
                    position: 'absolute',
                    top: 5,
                    left: 32,
                    width: 12,
                    height: 12,
                    transform: 'translateY(-50%) rotate(45deg)',
                    zIndex: 120,
                    borderWidth: '6px',
                    borderStyle: 'solid',
                    borderTopColor: 'background.paper',
                    borderLeftColor: 'background.paper',
                    borderRightColor: 'transparent',
                    borderBottomColor: 'transparent'
                  }
                }}
              >
                {({ TransitionProps }) => (
                  <Transitions in={openMini} {...TransitionProps}>
                    <Paper
                      sx={{
                        mt: 0.5,
                        py: 1.25,
                        boxShadow: theme.shadows[8],
                        backgroundImage: 'none'
                      }}
                    >
                      <ClickAwayListener onClickAway={handleClose}>
                        <Box
                          sx={{
                            minWidth: 200,
                            maxHeight: 'calc(100vh - 170px)',
                            overflowY: 'auto',
                            '&::-webkit-scrollbar': {
                              opacity: 0,
                              width: 4,
                              '&:hover': {
                                opacity: 0.7
                              }
                            },
                            '&::-webkit-scrollbar-track': {
                              bgcolor: 'transparent'
                            },
                            '&::-webkit-scrollbar-thumb': {
                              bgcolor: 'divider',
                              borderRadius: 4
                            }
                          }}
                        >
                          {currentItem.id !== lastItemId ? items : moreItems}
                        </Box>
                      </ClickAwayListener>
                    </Paper>
                  </Transitions>
                )}
              </Popper>
            </Activity>
          </ListItemButton>
        </List>
      )}
    </>
  );
}
