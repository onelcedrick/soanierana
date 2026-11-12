import { pgTable, uuid, varchar, text, boolean, timestamp, jsonb, pgEnum } from 'drizzle-orm/pg-core';
import { users } from './user.table';

export const notificationKindEnum = pgEnum('notification_kind', [
  'ASSIGNMENT_PROPOSED', 'ASSIGNMENT_RESPONSE', 'REPLACEMENT_REQUEST',
  'REPLACEMENT_DECIDED', 'PUBLICATION_PUBLISHED', 'POLL_PUBLISHED',
]);

export const notifications = pgTable('notifications', {
  id: uuid('id').primaryKey(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  kind: notificationKindEnum('kind').notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  body: text('body').notNull(),
  isRead: boolean('is_read').notNull().default(false),
  data: jsonb('data'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull(),
});

export type NotificationRow = typeof notifications.$inferSelect;
export type NewNotificationRow = typeof notifications.$inferInsert;
