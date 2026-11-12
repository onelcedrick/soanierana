import { pgTable, uuid, varchar, timestamp, uniqueIndex } from 'drizzle-orm/pg-core';
import { churches } from './church.table';
import { members } from './member.table';
import { tasks } from './task.table';

export const skills = pgTable('skills', {
  id: uuid('id').primaryKey(),
  churchId: uuid('church_id').notNull().references(() => churches.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 120 }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull(),
}, (table) => ({
  churchNameUnique: uniqueIndex('skills_church_name_unique').on(table.churchId, table.name),
}));

export const memberSkills = pgTable('member_skills', {
  id: uuid('id').primaryKey(),
  memberId: uuid('member_id').notNull().references(() => members.id, { onDelete: 'cascade' }),
  skillId: uuid('skill_id').notNull().references(() => skills.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull(),
}, (table) => ({
  memberSkillUnique: uniqueIndex('member_skill_unique').on(table.memberId, table.skillId),
}));

export const taskRequiredSkills = pgTable('task_required_skills', {
  id: uuid('id').primaryKey(),
  taskId: uuid('task_id').notNull().references(() => tasks.id, { onDelete: 'cascade' }),
  skillId: uuid('skill_id').notNull().references(() => skills.id, { onDelete: 'cascade' }),
}, (table) => ({
  taskSkillUnique: uniqueIndex('task_skill_unique').on(table.taskId, table.skillId),
}));

export type SkillRow = typeof skills.$inferSelect;
export type NewSkillRow = typeof skills.$inferInsert;
export type MemberSkillRow = typeof memberSkills.$inferSelect;
export type TaskRequiredSkillRow = typeof taskRequiredSkills.$inferSelect;
