import { useEffect, useRef, useState } from 'react';
import type { MouseEvent as ReactMouseEvent, ReactNode } from 'react';
import { Link } from 'react-router-dom';

import { useTheme } from '@mui/material/styles';
import Avatar, { AvatarProps } from '@mui/material/Avatar';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import Grid from '@mui/material/Grid';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Paper from '@mui/material/Paper';
import Popper from '@mui/material/Popper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { IconAccessPoint, IconBuildingStore, IconDashboard, IconFileDescription, IconLock, IconPackage, IconSettings, IconUsers } from '@tabler/icons-react';

import MainCard from 'ui-component/cards/MainCard';
import Transitions from 'ui-component/extended/Transitions';
import { drawerWidth, gridSpacing } from 'store/constant';

interface HeaderAvatarProps extends AvatarProps {
  children: ReactNode;
}

function HeaderAvatar({ children, sx, ref, ...others }: HeaderAvatarProps) {
  const theme = useTheme();

  return (
    <Avatar
      ref={ref}
      sx={{
        ...theme.typography.commonAvatar,
        ...theme.typography.mediumAvatar,
        transition: 'all .2s ease-in-out',
        display: { xs: 'none', md: 'flex' },
        color: theme.vars.palette.secondary.dark,
        background: theme.vars.palette.secondary.light,
        '&:hover, &[aria-controls="menu-list-grow"]': {
          color: theme.vars.palette.secondary.light,
          background: theme.vars.palette.secondary.dark
        },
        ...theme.applyStyles('dark', {
          color: theme.vars.palette.secondary.main,
          background: theme.vars.palette.dark.main,
          '&:hover, &[aria-controls="menu-list-grow"]': {
            color: theme.vars.palette.secondary.light,
            background: theme.vars.palette.secondary.main
          }
        })
      }}
      {...others}
    >
      {children}
    </Avatar>
  );
}

const linkList = [
  {
    id: 'workspace',
    label: 'Workspace',
    children: [
      { link: '/dashboard', label: 'Dashboard', icon: IconDashboard },
      { link: '/inventory/items', label: 'Inventory Items', icon: IconPackage },
      { link: '/inventory/reports/stock', label: 'Stock Report', icon: IconFileDescription },
      { link: '/treasury/accounts', label: 'Treasury', icon: IconBuildingStore }
    ]
  },
  {
    id: 'account',
    label: 'Account',
    children: [
      { link: '/account/profile', label: 'My Profile', icon: IconUsers },
      { link: '/account/change-password', label: 'Change Password', icon: IconLock },
      { link: '/account/preferences', label: 'Preferences', icon: IconSettings }
    ]
  }
];

export default function MegaMenuSection() {
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const anchorRef = useRef<any>(null);

  const handleToggle = () => {
    setOpen((prevOpen) => !prevOpen);
  };

  const handleClose = (event: ReactMouseEvent<HTMLDivElement> | MouseEvent | TouchEvent) => {
    if (anchorRef.current && anchorRef.current.contains(event.target as Node)) {
      return;
    }
    setOpen(false);
  };

  const prevOpen = useRef(open);
  useEffect(() => {
    if (prevOpen.current === true && open === false) {
      anchorRef.current?.focus();
    }
    prevOpen.current = open;
  }, [open]);

  return (
    <>
      <HeaderAvatar variant="rounded" ref={anchorRef} aria-controls={open ? 'menu-list-grow' : undefined} aria-haspopup="true" onClick={handleToggle}>
        <IconAccessPoint stroke={1.5} size="20px" />
      </HeaderAvatar>
      <Popper
        placement="bottom-end"
        open={open}
        anchorEl={anchorRef.current}
        role={undefined}
        transition
        disablePortal
        modifiers={[
          {
            name: 'offset',
            options: {
              offset: [150, 20]
            }
          }
        ]}
      >
        {({ TransitionProps }) => (
          <ClickAwayListener onClickAway={handleClose}>
            <Transitions in={open} {...TransitionProps}>
              <Paper
                sx={{
                  width: {
                    md: `calc(100vw - 100px)`,
                    lg: `calc(100vw - ${drawerWidth + 100}px)`,
                    xl: `calc(100vw - ${drawerWidth + 140}px)`
                  },
                  maxWidth: { xl: 760, md: 700 }
                }}
              >
                <MainCard border={false} elevation={16} content={false} boxShadow shadow={theme.shadows[16]} sx={{ overflow: 'hidden' }}>
                  <Grid container spacing={gridSpacing} sx={{ p: 2 }}>
                    {linkList.map((section) => (
                      <Grid key={section.id} size={{ xs: 12, md: 6 }}>
                        <Stack spacing={1}>
                          <Typography variant="subtitle1">{section.label}</Typography>
                          <List
                            component="nav"
                            sx={{
                              '& .MuiListItemButton-root:hover': {
                                bgcolor: 'transparent',
                                '& .MuiTypography-root': {
                                  color: 'secondary.main'
                                }
                              },
                              '& .MuiListItemIcon-root': {
                                minWidth: 16
                              }
                            }}
                          >
                            {section.children.map((item) => {
                              const ItemIcon = item.icon;
                              return (
                                <ListItemButton component={Link} to={item.link} key={item.link} sx={{ borderRadius: 2 }}>
                                  <ListItemIcon>
                                    <ItemIcon stroke={1.5} size="18px" />
                                  </ListItemIcon>
                                  <ListItemText primary={item.label} />
                                </ListItemButton>
                              );
                            })}
                          </List>
                        </Stack>
                      </Grid>
                    ))}
                  </Grid>
                </MainCard>
              </Paper>
            </Transitions>
          </ClickAwayListener>
        )}
      </Popper>
    </>
  );
}
