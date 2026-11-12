import { pgTable, uuid, varchar, integer, boolean, timestamp, text, pgEnum, jsonb } from 'drizzle-orm/pg-core';
import { programs } from './program.table';
import { responsibilityLevelEnum } from './member.table';

export const taskEligibilityEnum = pgEnum('task_eligibility', ['PUBLIC', 'MEMBER', 'MINIMUM_GRADE', 'EXACT_GRADE', 'CUSTOM']);

export const tasks = pgTable('tasks', {
  id: uuid('id').primaryKey(),
  programId: uuid('program_id').notNull().references(() => programs.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  requiredPeople: integer('required_people').notNull().default(1),
  eligibilityMode: taskEligibilityEnum('eligibility_mode').notNull().default('MEMBER'),
  minimumGrade: responsibilityLevelEnum('minimum_grade'),
  exactGrade: responsibilityLevelEnum('exact_grade'),
  allowedMembershipStatuses: jsonb('allowed_membership_statuses').notNull().default(['LOCAL_BAPTIZED', 'EXTERNAL_BAPTIZED', 'UNBAPTIZED']),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull(),
});

export type TaskRow = typeof tasks.$inferSelect;
export type NewTaskRow = typeof tasks.$inferInsert;
