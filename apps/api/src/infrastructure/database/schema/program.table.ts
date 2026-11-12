import { pgTable, uuid, varchar, integer, boolean, timestamp, pgEnum } from 'drizzle-orm/pg-core';
import { churches } from './church.table';

export const programFrequencyEnum = pgEnum('program_frequency', ['WEEKLY', 'BIWEEKLY', 'MONTHLY', 'ON_DEMAND']);

export const programs = pgTable('programs', {
  id: uuid('id').primaryKey(),
  churchId: uuid('church_id').notNull().references(() => churches.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 255 }).notNull(),
  frequency: programFrequencyEnum('frequency').notNull(),
  dayOfWeek: integer('day_of_week'),
  startTime: varchar('start_time', { length: 8 }),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull(),
});

export type ProgramRow = typeof programs.$inferSelect;
export type NewProgramRow = typeof programs.$inferInsert;
