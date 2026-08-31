import { useMemo, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { useNavigate } from 'react-router-dom';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import List from '@mui/material/List';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemButton from '@mui/material/ListItemButton';
import Pagination from '@mui/material/Pagination';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';
import Divider from '@mui/material/Divider';

import { IconBell, IconExternalLink, IconLock } from '@tabler/icons-react';

import Breadcrumbs from 'ui-component/extended/Breadcrumbs';
import useConfig from 'hooks/useConfig';
import { markAllNotificationsRead, markNotificationRead } from '../api/notificationsApi';
import { useNotifications, useUnreadNotificationCount } from '../hooks/useNotifications';
import type { NotificationDto, NotificationStatusFilter } from '../types/notifications.types';
import { resolveLocalizedText } from 'shared/utils/localizedText';
import { withAlpha } from 'utils/colorUtils';

function NotificationAvatar({ type }: { type: string }) {
  if (type === 'account.password.changed') {
    return (
      <Avatar sx={{ bgcolor: 'warning.light', color: 'warning.dark' }}>
        <IconLock stroke={1.5} size="18px" />
      </Avatar>
    );
  }

  return (
    <Avatar sx={{ bgcolor: 'primary.light', color: 'primary.dark' }}>
      <IconBell stroke={1.5} size="18px" />
    </Avatar>
  );
}

function NotificationRow({
  notification,
  locale,
  readLabel,
  unreadLabel,
  onOpen
}: {
  notification: NotificationDto;
  locale: string;
  readLabel: string;
  unreadLabel: string;
  onOpen: (notification: NotificationDto) => void | Promise<void>;
}) {
  const title = resolveLocalizedText(locale, notification.titleArabic, notification.titleEnglish, notification.type);
  const message = resolveLocalizedText(locale, notification.messageArabic, notification.messageEnglish, '');
  const timeLabel = new Intl.DateTimeFormat(locale.toLowerCase().startsWith('ar') ? 'ar' : 'en', {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(new Date(notification.createdAtUtc));

  return (
    <ListItemButton
      onClick={() => onOpen(notification)}
      sx={{
        alignItems: 'flex-start',
        borderRadius: 3,
        mb: 1.5,
        px: 2,
        py: 2,
        bgcolor: notification.isRead ? 'transparent' : 'action.hover',
        border: '1px solid',
        borderColor: 'divider',
        '&:hover': {
          bgcolor: notification.isRead ? 'action.hover' : withAlpha('#1976d2', 0.08)
        }
      }}
    >
      <ListItemAvatar sx={{ minWidth: 54 }}>
        <NotificationAvatar type={notification.type} />
      </ListItemAvatar>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
          <Typography variant="h6" noWrap>
            {title}
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ whiteSpace: 'nowrap' }}>
            {timeLabel}
          </Typography>
        </Stack>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75, whiteSpace: 'normal' }}>
          {message}
        </Typography>
        <Stack direction="row" spacing={1} sx={{ mt: 1.5, flexWrap: 'wrap' }}>
          <Chip
            label={notification.isRead ? readLabel : unreadLabel}
            color={notification.isRead ? 'default' : 'error'}
            size="small"
            sx={{ fontWeight: 700 }}
          />
          {notification.navigationPath && (
            <Chip
              icon={<IconExternalLink size={14} />}
              label={notification.navigationPath}
              variant="outlined"
              size="small"
              sx={{ maxWidth: '100%' }}
            />
          )}
        </Stack>
      </Box>
    </ListItemButton>
  );
}

export default function NotificationsPage() {
  const intl = useIntl();
  const navigate = useNavigate();
  const {
    state: { i18n }
  } = useConfig();
  const [status, setStatus] = useState<NotificationStatusFilter>('all');
  const [page, setPage] = useState(1);
  const pageSize = 20;

  const { items, meta, isLoading, error, mutate } = useNotifications({ page, pageSize, status }, true);
  const { count: unreadCount, mutate: mutateUnreadCount } = useUnreadNotificationCount(true);

  const statusOptions = useMemo(
    () => [
      { value: 'all' as const, label: intl.formatMessage({ id: 'notifications.status.all' }) },
      { value: 'unread' as const, label: intl.formatMessage({ id: 'notifications.status.unread' }) },
      { value: 'read' as const, label: intl.formatMessage({ id: 'notifications.status.read' }) }
    ],
    [intl]
  );

  const handleOpen = async (notification: NotificationDto) => {
    if (!notification.isRead) {
      await markNotificationRead(notification.id);
      await Promise.all([mutate(), mutateUnreadCount()]);
    }

    navigate(notification.navigationPath || '/notifications');
  };

  const handleMarkAllRead = async () => {
    await markAllNotificationsRead();
    await Promise.all([mutate(), mutateUnreadCount()]);
  };

  const handleChangeStatus = (nextStatus: NotificationStatusFilter) => {
    setStatus(nextStatus);
    setPage(1);
  };

  const title = intl.formatMessage({ id: 'notifications.page-title' });
  const unreadLabel = intl.formatMessage({ id: 'notifications.unread' });
  const readLabel = intl.formatMessage({ id: 'notifications.read' });

  return (
    <Box>
      <Breadcrumbs custom card={false} title={false} divider={false} heading="notifications.page-title" links={[{ title: 'notifications.page-title' }]} sx={{ mb: 0 }} />

      <Card
        sx={{
          mt: 2,
          mb: 3,
          p: 3,
          borderRadius: 4,
          color: 'common.white',
          background: 'linear-gradient(135deg, rgba(25,118,210,0.96) 0%, rgba(63,81,181,0.92) 100%)',
          boxShadow: '0 20px 60px rgba(25,118,210,0.22)'
        }}
      >
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'center' }}>
          <Box>
            <Typography variant="overline" sx={{ letterSpacing: 1.2, opacity: 0.85 }}>
              {title}
            </Typography>
            <Typography variant="h4" sx={{ mt: 0.5 }}>
              <FormattedMessage id="notifications.page-subtitle" />
            </Typography>
          </Box>
          <Stack direction="row" spacing={1} flexWrap="wrap">
            <Chip label={`${meta.totalCount} ${intl.formatMessage({ id: 'notifications.total' })}`} sx={{ bgcolor: 'rgba(255,255,255,0.16)', color: 'common.white' }} />
            <Chip label={`${unreadCount} ${intl.formatMessage({ id: 'notifications.unread-count' })}`} sx={{ bgcolor: 'rgba(255,255,255,0.16)', color: 'common.white' }} />
          </Stack>
        </Stack>
      </Card>

      <Stack spacing={2}>
        <Card sx={{ p: 2.5, borderRadius: 3 }}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5} justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'center' }}>
            <Stack direction="row" spacing={1} flexWrap="wrap">
              {statusOptions.map((option) => (
                <Chip
                  key={option.value}
                  label={option.label}
                  clickable
                  color={status === option.value ? 'primary' : 'default'}
                  onClick={() => handleChangeStatus(option.value)}
                  sx={{ fontWeight: 700 }}
                />
              ))}
            </Stack>
            <Button variant="contained" onClick={handleMarkAllRead} disabled={unreadCount === 0}>
              <FormattedMessage id="notifications-mark-all-read" />
            </Button>
          </Stack>
        </Card>

        <Card sx={{ borderRadius: 3, overflow: 'hidden' }}>
          {error && !isLoading ? (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <Typography color="error" sx={{ mb: 2 }}>
                <FormattedMessage id="notifications.load-error" />
              </Typography>
              <Button variant="outlined" onClick={() => mutate()}>
                <FormattedMessage id="retry" />
              </Button>
            </Box>
          ) : isLoading ? (
            <Box sx={{ p: 4 }}>
              <Typography color="text.secondary">
                <FormattedMessage id="notifications-loading" />
              </Typography>
            </Box>
          ) : items.length === 0 ? (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="h6" sx={{ mb: 1 }}>
                <FormattedMessage id="notifications-empty-title" />
              </Typography>
              <Typography color="text.secondary">
                <FormattedMessage id="notifications-empty-description" />
              </Typography>
            </Box>
          ) : (
            <Box sx={{ p: 2 }}>
              <List disablePadding>
                {items.map((notification, index) => (
                  <Box key={notification.id}>
                    <NotificationRow
                      notification={notification}
                      locale={i18n}
                      readLabel={readLabel}
                      unreadLabel={unreadLabel}
                      onOpen={handleOpen}
                    />
                    {index < items.length - 1 && <Divider sx={{ my: 1.25 }} />}
                  </Box>
                ))}
              </List>
              {meta.totalPages > 1 && (
                <Stack direction="row" justifyContent="center" sx={{ mt: 3 }}>
                  <Pagination
                    count={meta.totalPages}
                    page={page}
                    onChange={(_, nextPage) => setPage(nextPage)}
                    color="primary"
                    shape="rounded"
                  />
                </Stack>
              )}
            </Box>
          )}
        </Card>
      </Stack>
    </Box>
  );
}
