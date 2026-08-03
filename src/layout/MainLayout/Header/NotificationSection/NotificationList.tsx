import { useTheme } from '@mui/material/styles';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import List from '@mui/material/List';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemButton from '@mui/material/ListItemButton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { IconBell, IconExternalLink, IconLock } from '@tabler/icons-react';

import type { NotificationDto } from 'modules/Notifications/types/notifications.types';
import { resolveLocalizedText } from 'shared/utils/localizedText';
import { withAlpha } from 'utils/colorUtils';

type NotificationListProps = {
  notifications: NotificationDto[];
  unreadCount: number;
  locale: string;
  loading?: boolean;
  emptyTitle: string;
  emptyDescription: string;
  titleLabel: string;
  markAllReadLabel: string;
  viewAllLabel: string;
  unreadLabel: string;
  readLabel: string;
  loadingLabel: string;
  onOpenNotification: (notification: NotificationDto) => void | Promise<void>;
  onMarkAllRead: () => void | Promise<void>;
  onViewAll: () => void;
};

function NotificationAvatar({ type }: { type: string }) {
  const theme = useTheme();

  const baseSx = {
    color: 'primary.dark',
    bgcolor: 'primary.light',
    ...theme.applyStyles('dark', { bgcolor: 'dark.main' })
  } as const;

  if (type === 'account.password.changed') {
    return (
      <Avatar sx={{ color: 'warning.dark', bgcolor: 'warning.light', ...theme.applyStyles('dark', { bgcolor: 'dark.main' }) }}>
        <IconLock stroke={1.5} size="18px" />
      </Avatar>
    );
  }

  return (
    <Avatar sx={baseSx}>
      <IconBell stroke={1.5} size="18px" />
    </Avatar>
  );
}

function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <Stack spacing={1.25} sx={{ py: 1.5, px: 0.5 }}>
      <Typography variant="subtitle1">{title}</Typography>
      <Typography variant="body2" color="text.secondary">
        {description}
      </Typography>
    </Stack>
  );
}

export default function NotificationList({
  notifications,
  unreadCount,
  locale,
  loading,
  emptyTitle,
  emptyDescription,
  titleLabel,
  markAllReadLabel,
  viewAllLabel,
  unreadLabel,
  readLabel,
  loadingLabel,
  onOpenNotification,
  onMarkAllRead,
  onViewAll
}: NotificationListProps) {
  const theme = useTheme();
  const isArabic = locale.toLowerCase().startsWith('ar');

  const formatTime = (value: string) =>
    new Intl.DateTimeFormat(isArabic ? 'ar' : 'en', {
      dateStyle: 'short',
      timeStyle: 'short'
    }).format(new Date(value));

  return (
    <Stack spacing={1.5} sx={{ width: '100%', minWidth: { xs: 300, md: 360 } }}>
      <Stack direction="row" spacing={1.5} alignItems="center" justifyContent="space-between" sx={{ px: 0.25 }}>
        <Stack direction="row" spacing={1} alignItems="center">
          <Typography variant="h5">{titleLabel}</Typography>
          <Chip label={unreadCount} size="small" color={unreadCount > 0 ? 'error' : 'default'} sx={{ fontWeight: 700 }} />
        </Stack>
        <Button size="small" variant="text" onClick={onMarkAllRead} disabled={loading || unreadCount === 0}>
          {markAllReadLabel}
        </Button>
      </Stack>

      <Divider />

      {loading ? (
        <Stack spacing={1} alignItems="center" sx={{ py: 3 }}>
          <CircularProgress size={24} />
          <Typography variant="body2" color="text.secondary">
            {loadingLabel}
          </Typography>
        </Stack>
      ) : notifications.length === 0 ? (
        <EmptyState title={emptyTitle} description={emptyDescription} />
      ) : (
        <List sx={{ width: '100%', p: 0 }}>
          {notifications.map((notification) => {
            const title = resolveLocalizedText(locale, notification.titleArabic, notification.titleEnglish, notification.type);
            const message = resolveLocalizedText(locale, notification.messageArabic, notification.messageEnglish, '');
            const timeLabel = formatTime(notification.createdAtUtc);
            const isUnread = !notification.isRead;

            return (
              <ListItemButton
                key={notification.id}
                onClick={() => onOpenNotification(notification)}
                sx={{
                  px: 0,
                  py: 1.5,
                  borderRadius: 2,
                  alignItems: 'flex-start',
                  bgcolor: isUnread ? withAlpha(theme.palette.primary.light, 0.16) : 'transparent',
                  '&:hover': {
                    bgcolor: isUnread ? withAlpha(theme.palette.primary.light, 0.24) : withAlpha(theme.palette.grey[200], 0.35)
                  },
                  ...theme.applyStyles('dark', {
                    bgcolor: isUnread ? withAlpha(theme.palette.primary.dark, 0.18) : 'transparent',
                    '&:hover': {
                      bgcolor: isUnread ? withAlpha(theme.palette.primary.dark, 0.3) : 'dark.main'
                    }
                  })
                }}
              >
                <ListItemAvatar sx={{ minWidth: 48 }}>
                  <NotificationAvatar type={notification.type} />
                </ListItemAvatar>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
                    <Typography variant="subtitle1" noWrap sx={{ fontWeight: 700 }}>
                      {title}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ whiteSpace: 'nowrap', pl: 1 }}>
                      {timeLabel}
                    </Typography>
                  </Stack>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, whiteSpace: 'normal' }}>
                    {message}
                  </Typography>
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 1, flexWrap: 'wrap' }}>
                    <Chip
                      label={isUnread ? unreadLabel : readLabel}
                      color={isUnread ? 'error' : 'default'}
                      size="small"
                      sx={{ fontWeight: 700 }}
                    />
                    {notification.navigationPath && (
                      <Chip
                        icon={<IconExternalLink size={14} />}
                        label={notification.navigationPath}
                        size="small"
                        variant="outlined"
                        sx={{ maxWidth: '100%' }}
                      />
                    )}
                  </Stack>
                </Box>
              </ListItemButton>
            );
          })}
        </List>
      )}

      <Divider />

      <Stack direction="row" spacing={1} justifyContent="space-between">
        <Button variant="outlined" color="inherit" size="small" onClick={onViewAll}>
          {viewAllLabel}
        </Button>
        <Button variant="contained" size="small" onClick={onMarkAllRead} disabled={loading || unreadCount === 0}>
          {markAllReadLabel}
        </Button>
      </Stack>
    </Stack>
  );
}
