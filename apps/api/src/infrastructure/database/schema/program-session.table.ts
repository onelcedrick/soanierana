import { pgTable, uuid, timestamp, pgEnum } from 'drizzle-orm/pg-core';
import { programs } from './program.table';

export const sessionStatusEnum = pgEnum('session_status', ['DRAFT', 'PUBLISHED']);

export const programSessions = pgTable('program_sessions', {
  id: uuid('id').primaryKey(),
  programId: uuid('program_id').notNull().references(() => programs.id, { onDelete: 'cascade' }),
  date: timestamp('date', { withTimezone: true }).notNull(),
  status: sessionStatusEnum('status').notNull().default('DRAFT'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull(),
});

export type ProgramSessionRow = typeof programSessions.$inferSelect;
export type NewProgramSessionRow = typeof programSessions.$inferInsert;
