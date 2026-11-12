import { pgTable, uuid, varchar, text, timestamp, pgEnum, index } from 'drizzle-orm/pg-core';
import { churches } from './church.table';

export const publicationStatusEnum = pgEnum('publication_status', ['DRAFT', 'PUBLISHED', 'ARCHIVED']);
export const publicationAudienceEnum = pgEnum('publication_audience', ['PUBLIC', 'MEMBERS_ONLY']);

export const eventCategories = pgTable('event_categories', {
  id: uuid('id').primaryKey(),
  churchId: uuid('church_id').notNull().references(() => churches.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 120 }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull(),
});

export const publications = pgTable('publications', {
  id: uuid('id').primaryKey(),
  churchId: uuid('church_id').notNull().references(() => churches.id, { onDelete: 'cascade' }),
  categoryId: uuid('category_id').references(() => eventCategories.id, { onDelete: 'set null' }),
  title: varchar('title', { length: 255 }).notNull(),
  content: text('content').notNull(),
  coverImageUrl: text('cover_image_url'), // <-- TEXT
  audience: publicationAudienceEnum('audience').notNull(),
  status: publicationStatusEnum('status').notNull(),
  eventDate: timestamp('event_date', { withTimezone: true }),
  eventTime: varchar('event_time', { length: 8 }),
  location: varchar('location', { length: 255 }),
  publishedAt: timestamp('published_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull(),
}, (table) => ({
  churchStatus: index('publications_church_status').on(table.churchId, table.status),
}));

export type EventCategoryRow = typeof eventCategories.$inferSelect;
export type NewEventCategoryRow = typeof eventCategories.$inferInsert;
export type PublicationRow = typeof publications.$inferSelect;
export type NewPublicationRow = typeof publications.$inferInsert;
