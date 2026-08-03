import { useMemo } from 'react';
import useSWR from 'swr';

import { fetcher } from 'utils/axios';
import type { ApiResponse } from 'types/api';
import type { NotificationDto, NotificationFeedMeta, NotificationListParams } from '../types/notifications.types';

function buildQuery(params: Record<string, string | number | boolean | undefined | null>) {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      search.set(key, String(value));
    }
  });
  return search.toString();
}

function toFeedResult(data?: ApiResponse<NotificationDto[]>) {
  return {
    items: data?.data ?? [],
    meta: (data?.meta as NotificationFeedMeta) ?? { page: 1, pageSize: 20, totalCount: 0, totalPages: 0, unreadCount: 0 }
  };
}

export function useNotifications(params: NotificationListParams, enabled = true) {
  const key = enabled ? `/api/notifications?${buildQuery(params)}` : null;
  const { data, error, isLoading, mutate } = useSWR<ApiResponse<NotificationDto[]>>(key, fetcher, {
    revalidateOnFocus: true,
    refreshInterval: 60000
  });

  return useMemo(() => ({ ...toFeedResult(data), error, isLoading, mutate, key }), [data, error, isLoading, key, mutate]);
}

export function useUnreadNotificationCount(enabled = true) {
  const { data, error, isLoading, mutate } = useSWR<ApiResponse<number>>(enabled ? '/api/notifications/unread-count' : null, fetcher, {
    revalidateOnFocus: true,
    refreshInterval: 60000
  });

  return useMemo(() => ({ count: data?.data ?? 0, error, isLoading, mutate }), [data, error, isLoading, mutate]);
}
