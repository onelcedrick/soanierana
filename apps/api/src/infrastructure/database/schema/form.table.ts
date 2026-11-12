import { pgTable, uuid, varchar, timestamp, pgEnum, text, jsonb } from 'drizzle-orm/pg-core';
import { churches } from './church.table';
import { members } from './member.table';

export const formStatusEnum = pgEnum('form_status', ['DRAFT', 'PUBLISHED', 'CLOSED']);
export const formAudienceEnum = pgEnum('form_audience', ['PUBLIC', 'MEMBERS_ONLY']);

export const forms = pgTable('forms', {
  id: uuid('id').primaryKey(),
  churchId: uuid('church_id').notNull().references(() => churches.id, { onDelete: 'cascade' }),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  audience: formAudienceEnum('audience').notNull(),
  status: formStatusEnum('status').notNull(),
  fields: jsonb('fields').notNull().default([]),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull(),
});

export const formResponses = pgTable('form_responses', {
  id: uuid('id').primaryKey(),
  formId: uuid('form_id').notNull().references(() => forms.id, { onDelete: 'cascade' }),
  memberId: uuid('member_id').references(() => members.id, { onDelete: 'set null' }),
  data: jsonb('data').notNull().default({}),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull(),
});

export type FormRow = typeof forms.$inferSelect;
export type NewFormRow = typeof forms.$inferInsert;
export type FormResponseRow = typeof formResponses.$inferSelect;
export type NewFormResponseRow = typeof formResponses.$inferInsert;
