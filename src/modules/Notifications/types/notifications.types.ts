export type NotificationStatusFilter = 'all' | 'read' | 'unread';

export type NotificationDto = {
  id: string;
  userId: string | null;
  actorUserId: string | null;
  type: string;
  titleArabic: string;
  titleEnglish: string;
  messageArabic: string;
  messageEnglish: string;
  navigationPath: string | null;
  isRead: boolean;
  createdAtUtc: string;
  readAtUtc: string | null;
};

export type NotificationFeedMeta = {
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  unreadCount: number;
};

export type NotificationListParams = {
  page?: number;
  pageSize?: number;
  status?: NotificationStatusFilter;
};
