import { pgTable, uuid, varchar, timestamp, text, jsonb } from 'drizzle-orm/pg-core';

export const churches = pgTable('churches', {
  id: uuid('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  city: varchar('city', { length: 255 }).notNull(),
  country: varchar('country', { length: 255 }).notNull(),
  coverImageUrl: text('cover_image_url'),
  logoUrl: text('logo_url'),
  themeConfig: jsonb('theme_config'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull(),
});

export type ChurchRow = typeof churches.$inferSelect;
export type NewChurchRow = typeof churches.$inferInsert;
