import { pgTable, uuid, varchar, boolean, timestamp, pgEnum, uniqueIndex } from 'drizzle-orm/pg-core';
import { churches } from './church.table';

export const membershipStatusEnum = pgEnum('membership_status', [
  'LOCAL_BAPTIZED', 'EXTERNAL_BAPTIZED', 'UNBAPTIZED',
]);
export const responsibilityLevelEnum = pgEnum('responsibility_level', [
  'LOHOLONA', 'DIAKONA', 'MAMBRA_TSOTRA',
]);

export const members = pgTable('members', {
  id: uuid('id').primaryKey(),
  churchId: uuid('church_id').notNull().references(() => churches.id, { onDelete: 'cascade' }),
  firstName: varchar('first_name', { length: 120 }).notNull(),
  lastName: varchar('last_name', { length: 120 }).notNull(),
  email: varchar('email', { length: 255 }).notNull(),
  phone: varchar('phone', { length: 40 }).notNull(),
  membershipStatus: membershipStatusEnum('membership_status').notNull(),
  responsibilityLevel: responsibilityLevelEnum('responsibility_level').notNull(),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull(),
}, (table) => ({
  churchEmailUnique: uniqueIndex('members_church_email_unique').on(table.churchId, table.email),
}));

export type MemberRow = typeof members.$inferSelect;
export type NewMemberRow = typeof members.$inferInsert;
