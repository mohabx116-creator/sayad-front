import { AxiosResponse } from 'axios';

import axiosServices from 'utils/axios';
import type { ApiResponse } from 'types/api';
import type { NotificationDto, NotificationListParams } from '../types/notifications.types';

function buildQuery(params: Record<string, string | number | boolean | undefined | null>) {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      search.set(key, String(value));
    }
  });
  return search.toString();
}

function unwrap<T>(request: Promise<AxiosResponse<ApiResponse<T>>>): Promise<T> {
  return request.then((response) => {
    const payload = response.data;
    if (!payload.success || payload.data == null) {
      throw new Error(payload.message || payload.errors[0] || 'Request failed');
    }

    return payload.data;
  });
}

export function listNotifications(params: NotificationListParams) {
  return unwrap(axiosServices.get<ApiResponse<NotificationDto[]>>(`/api/notifications?${buildQuery(params)}`));
}

export function getUnreadNotificationsCount() {
  return unwrap(axiosServices.get<ApiResponse<number>>('/api/notifications/unread-count'));
}

export function markNotificationRead(id: string) {
  return unwrap(axiosServices.put<ApiResponse<NotificationDto>>(`/api/notifications/${id}/read`));
}

export function markAllNotificationsRead() {
  return unwrap(axiosServices.put<ApiResponse<object>>('/api/notifications/read-all'));
}
