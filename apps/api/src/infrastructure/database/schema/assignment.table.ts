import { pgTable, uuid, varchar, timestamp, text } from 'drizzle-orm/pg-core';
import { churches } from './church.table';
import { members } from './member.table';
import { tasks } from './task.table';
import { programSessions } from './program-session.table';
import { users } from './user.table';

export const assignments = pgTable('assignments', {
  id: uuid('id').primaryKey(),
  sessionId: uuid('session_id').notNull().references(() => programSessions.id, { onDelete: 'cascade' }),
  taskId: uuid('task_id').notNull().references(() => tasks.id, { onDelete: 'cascade' }),
  memberId: uuid('member_id').notNull().references(() => members.id, { onDelete: 'cascade' }),
  status: varchar('status', { length: 50 }).notNull().default('PROPOSED'),
  justification: text('justification'),
  proposedAt: timestamp('proposed_at', { withTimezone: true }).defaultNow(),
  respondedAt: timestamp('responded_at', { withTimezone: true }),
  
  // 👇 Nouvelles colonnes pour le verrouillage
  claimedBy: uuid('claimed_by').references(() => users.id),
  claimedAt: timestamp('claimed_at', { withTimezone: true }),
  completedAt: timestamp('completed_at', { withTimezone: true }),
  
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});
