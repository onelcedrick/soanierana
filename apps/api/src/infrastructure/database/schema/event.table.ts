import { pgTable, uuid, varchar, text, timestamp } from 'drizzle-orm/pg-core';
import { churches } from './church.table';

export const events = pgTable('events', {
  id: uuid('id').primaryKey(),
  churchId: uuid('church_id').notNull().references(() => churches.id, { onDelete: 'cascade' }),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  startDate: timestamp('start_date', { withTimezone: true }).notNull(),
  endDate: timestamp('end_date', { withTimezone: true }),
  location: varchar('location', { length: 255 }),
  coverImageUrl: text('cover_image_url'),
  status: varchar('status', { length: 50 }).default('PUBLISHED').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull(),
});

export type EventRow = typeof events.$inferSelect;
export type NewEventRow = typeof events.$inferInsert;
