import { pgTable, uuid, varchar, text, timestamp, boolean } from 'drizzle-orm/pg-core';
import { churches } from './church.table';

export const members = pgTable('members', {
  id: uuid('id').primaryKey(),
  churchId: uuid('church_id').notNull().references(() => churches.id, { onDelete: 'cascade' }),
  firstName: varchar('first_name', { length: 255 }).notNull(),
  lastName: varchar('last_name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }),
  phone: varchar('phone', { length: 50 }),
  photoUrl: text('photo_url'),
  membershipStatus: varchar('membership_status', { length: 50 }).default('UNBAPTIZED'),
  responsibilityLevel: varchar('responsibility_level', { length: 50 }).default('MAMBRA_TSOTRA'),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});
