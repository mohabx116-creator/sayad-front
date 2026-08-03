import { useEffect, useRef, useState } from 'react';
import type { MouseEvent as ReactMouseEvent } from 'react';
import { useNavigate } from 'react-router-dom';

import { useIntl } from 'react-intl';

import { useTheme } from '@mui/material/styles';
import Avatar from '@mui/material/Avatar';
import Badge from '@mui/material/Badge';
import Box from '@mui/material/Box';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import Paper from '@mui/material/Paper';
import Popper from '@mui/material/Popper';

import { IconBell } from '@tabler/icons-react';

import MainCard from 'ui-component/cards/MainCard';
import Transitions from 'ui-component/extended/Transitions';
import useAuth from 'hooks/useAuth';
import useConfig from 'hooks/useConfig';
import { markAllNotificationsRead, markNotificationRead } from 'modules/Notifications/api/notificationsApi';
import { useNotifications, useUnreadNotificationCount } from 'modules/Notifications/hooks/useNotifications';
import type { NotificationDto } from 'modules/Notifications/types/notifications.types';
import NotificationList from './NotificationList';

export default function NotificationSection() {
  const theme = useTheme();
  const intl = useIntl();
  const navigate = useNavigate();
  const {
    state: { i18n }
  } = useConfig();
  const { isLoggedIn } = useAuth();
  const [open, setOpen] = useState(false);
  const anchorRef = useRef<any>(null);

  const { items, meta, isLoading, mutate: mutateNotifications } = useNotifications({ page: 1, pageSize: 5, status: 'all' }, isLoggedIn);
  const { count: unreadCount, mutate: mutateUnreadCount } = useUnreadNotificationCount(isLoggedIn);

  const handleToggle = () => {
    if (!isLoggedIn) {
      return;
    }

    setOpen((prevOpen) => !prevOpen);
  };

  const handleClose = (event: ReactMouseEvent<HTMLDivElement> | MouseEvent | TouchEvent) => {
    if (anchorRef.current && anchorRef.current.contains(event.target as Node)) {
      return;
    }
    setOpen(false);
  };

  const handleViewAll = () => {
    setOpen(false);
    navigate('/notifications');
  };

  const handleOpenNotification = async (notification: NotificationDto) => {
    try {
      await markNotificationRead(notification.id);
      await Promise.all([mutateNotifications(), mutateUnreadCount()]);
    } finally {
      setOpen(false);
      navigate(notification.navigationPath || '/notifications');
    }
  };

  const handleMarkAllRead = async () => {
    await markAllNotificationsRead();
    await Promise.all([mutateNotifications(), mutateUnreadCount()]);
  };

  const prevOpen = useRef(open);
  useEffect(() => {
    if (prevOpen.current === true && open === false) {
      anchorRef.current?.focus();
    }
    prevOpen.current = open;
  }, [open]);

  useEffect(() => {
    if (open) {
      void mutateNotifications();
      void mutateUnreadCount();
    }
  }, [open, mutateNotifications, mutateUnreadCount]);

  if (!isLoggedIn) {
    return null;
  }

  return (
    <>
      <Box sx={{ ml: 2 }}>
        <Badge badgeContent={unreadCount} color="error" overlap="circular" invisible={unreadCount === 0} sx={{ '& .MuiBadge-badge': { right: 2, top: 3 } }}>
          <Avatar
            variant="rounded"
            ref={anchorRef}
            onClick={handleToggle}
            sx={{
              ...theme.typography.commonAvatar,
              ...theme.typography.mediumAvatar,
              transition: 'all .2s ease-in-out',
              color: theme.vars.palette.warning.dark,
              background: theme.vars.palette.warning.light,
              '&:hover, &[aria-controls="menu-list-grow"]': {
                color: theme.vars.palette.warning.light,
                background: theme.vars.palette.warning.dark
              },
              ...theme.applyStyles('dark', {
                color: theme.vars.palette.warning.dark,
                background: theme.vars.palette.dark.main,
                '&:hover, &[aria-controls="menu-list-grow"]': {
                  color: theme.vars.palette.grey[800],
                  background: theme.vars.palette.warning.dark
                }
              })
            }}
          >
            <IconBell stroke={1.5} size="20px" />
          </Avatar>
        </Badge>
      </Box>
      <Popper
        placement="bottom-end"
        open={open}
        anchorEl={anchorRef.current}
        transition
        disablePortal
        modifiers={[{ name: 'offset', options: { offset: [0, 20] } }]}
      >
        {({ TransitionProps }) => (
          <ClickAwayListener onClickAway={handleClose}>
            <Transitions in={open} {...TransitionProps}>
              <Paper>
                {open && (
                  <MainCard border={false} elevation={16} content={false} boxShadow shadow={theme.shadows[16]} sx={{ maxWidth: 380 }}>
                    <Box sx={{ p: 2.5 }}>
                      <NotificationList
                        notifications={items}
                        unreadCount={meta.unreadCount}
                        locale={i18n}
                        loading={isLoading}
                        emptyTitle={intl.formatMessage({ id: 'notifications-empty-title' })}
                        emptyDescription={intl.formatMessage({ id: 'notifications-empty-description' })}
                        titleLabel={intl.formatMessage({ id: 'notifications-title' })}
                        markAllReadLabel={intl.formatMessage({ id: 'notifications-mark-all-read' })}
                        viewAllLabel={intl.formatMessage({ id: 'notifications-view-all' })}
                        unreadLabel={intl.formatMessage({ id: 'notifications-unread' })}
                        readLabel={intl.formatMessage({ id: 'notifications-read' })}
                        loadingLabel={intl.formatMessage({ id: 'notifications-loading' })}
                        onOpenNotification={handleOpenNotification}
                        onMarkAllRead={handleMarkAllRead}
                        onViewAll={handleViewAll}
                      />
                    </Box>
                  </MainCard>
                )}
              </Paper>
            </Transitions>
          </ClickAwayListener>
        )}
      </Popper>
    </>
  );
}
