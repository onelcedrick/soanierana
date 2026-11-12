import { pgTable, uuid, timestamp, pgEnum, text } from 'drizzle-orm/pg-core';
import { members } from './member.table';

export const availabilityTypeEnum = pgEnum('availability_type', ['REGULAR', 'EXCEPTION', 'UNAVAILABLE']);

export const availabilities = pgTable('availabilities', {
  id: uuid('id').primaryKey(),
  memberId: uuid('member_id').notNull().references(() => members.id, { onDelete: 'cascade' }),
  type: availabilityTypeEnum('type').notNull(),
  date: timestamp('date', { withTimezone: true }),
  startDate: timestamp('start_date', { withTimezone: true }),
  endDate: timestamp('end_date', { withTimezone: true }),
  notes: text('notes'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull(),
});

export type AvailabilityRow = typeof availabilities.$inferSelect;
export type NewAvailabilityRow = typeof availabilities.$inferInsert;
