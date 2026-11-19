import { pgTable, uuid, varchar, text, timestamp, boolean, pgEnum } from 'drizzle-orm/pg-core';
import { churches } from './church.table';

// 👇 On restaure les Enums pour que task.table.ts puisse les importer
export const membershipStatusEnum = pgEnum('membership_status', ['LOCAL_BAPTIZED', 'EXTERNAL_BAPTIZED', 'UNBAPTIZED']);
export const responsibilityLevelEnum = pgEnum('responsibility_level', ['MAMBRA_TSOTRA', 'DIAKONA', 'LOHOLONA']);

export const members = pgTable('members', {
  id: uuid('id').primaryKey(),
  churchId: uuid('church_id').notNull().references(() => churches.id, { onDelete: 'cascade' }),
  firstName: varchar('first_name', { length: 255 }).notNull(),
  lastName: varchar('last_name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }),
  phone: varchar('phone', { length: 50 }),
  photoUrl: text('photo_url'),
  // On garde varchar pour la base de données car c'est ce que tu as déjà sur Neon
  membershipStatus: varchar('membership_status', { length: 50 }).default('UNBAPTIZED'),
  responsibilityLevel: varchar('responsibility_level', { length: 50 }).default('MAMBRA_TSOTRA'),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});
