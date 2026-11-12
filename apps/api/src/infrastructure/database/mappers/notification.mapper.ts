import { Notification } from '../../../domain/notification/notification';
import type { NotificationRow, NewNotificationRow } from '../schema/notification.table';

export function toDomain(row: NotificationRow): Notification {
  return Notification.reconstitute({
    id: row.id, userId: row.userId, kind: row.kind, title: row.title,
    body: row.body, isRead: row.isRead,
    data: (row.data as Record<string, unknown> | null) ?? null, createdAt: row.createdAt,
  });
}
export function toInsert(n: Notification): NewNotificationRow {
  return {
    id: n.id, userId: n.userId, kind: n.kind, title: n.title,
    body: n.body, isRead: n.isRead, data: n.data ?? null, createdAt: n.createdAt,
  };
}
