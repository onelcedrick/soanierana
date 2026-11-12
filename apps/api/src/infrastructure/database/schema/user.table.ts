import { pgTable, uuid, varchar, boolean, timestamp, pgEnum, uniqueIndex } from 'drizzle-orm/pg-core';
import { churches } from './church.table';
import { members } from './member.table';

export const userRoleEnum = pgEnum('user_role', ['ADMIN', 'RESPONSABLE', 'MEMBER']);

export const users = pgTable('users', {
  id: uuid('id').primaryKey(),
  churchId: uuid('church_id').notNull().references(() => churches.id, { onDelete: 'cascade' }),
  memberId: uuid('member_id').references(() => members.id, { onDelete: 'set null' }),
  email: varchar('email', { length: 255 }).notNull(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  role: userRoleEnum('role').notNull(),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull(),
}, (table) => ({
  churchEmailUnique: uniqueIndex('users_church_email_unique').on(table.churchId, table.email),
}));

export type UserRow = typeof users.$inferSelect;
export type NewUserRow = typeof users.$inferInsert;
