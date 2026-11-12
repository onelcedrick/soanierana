import { pgTable, uuid, timestamp, pgEnum, text } from 'drizzle-orm/pg-core';
import { programSessions } from './program-session.table';
import { tasks } from './task.table';
import { members } from './member.table';
import { users } from './user.table';

export const assignmentStatusEnum = pgEnum('assignment_status', [
  'PROPOSED', 'ACCEPTED', 'DECLINED', 'REPLACED', 'ATTENDED', 'ABSENT',
]);
export const replacementStatusEnum = pgEnum('replacement_status', ['PENDING', 'APPROVED', 'REJECTED']);

export const assignments = pgTable('assignments', {
  id: uuid('id').primaryKey(),
  sessionId: uuid('session_id').notNull().references(() => programSessions.id, { onDelete: 'cascade' }),
  taskId: uuid('task_id').notNull().references(() => tasks.id, { onDelete: 'cascade' }),
  memberId: uuid('member_id').notNull().references(() => members.id, { onDelete: 'cascade' }),
  status: assignmentStatusEnum('status').notNull(),
  justification: text('justification'),
  proposedAt: timestamp('proposed_at', { withTimezone: true }).notNull(),
  respondedAt: timestamp('responded_at', { withTimezone: true }),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull(),
});

export const replacementRequests = pgTable('replacement_requests', {
  id: uuid('id').primaryKey(),
  assignmentId: uuid('assignment_id').notNull().references(() => assignments.id, { onDelete: 'cascade' }),
  candidateMemberId: uuid('candidate_member_id').notNull().references(() => members.id, { onDelete: 'cascade' }),
  status: replacementStatusEnum('status').notNull(),
  decidedByUserId: uuid('decided_by_user_id').references(() => users.id, { onDelete: 'set null' }),
  decidedAt: timestamp('decided_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull(),
});

export type AssignmentRow = typeof assignments.$inferSelect;
export type NewAssignmentRow = typeof assignments.$inferInsert;
export type ReplacementRequestRow = typeof replacementRequests.$inferSelect;
export type NewReplacementRequestRow = typeof replacementRequests.$inferInsert;
