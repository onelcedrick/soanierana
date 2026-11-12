import { pgTable, uuid, integer, timestamp, pgEnum } from 'drizzle-orm/pg-core';
import { churches } from './church.table';

export const rotationStrategyEnum = pgEnum('rotation_strategy', ['FAIR_ROTATION', 'ROUND_ROBIN', 'LEAST_ASSIGNED']);

export const siteSettings = pgTable('site_settings', {
  id: uuid('id').primaryKey(),
  churchId: uuid('church_id').notNull().references(() => churches.id, { onDelete: 'cascade' }).unique(),
  rotationStrategy: rotationStrategyEnum('rotation_strategy').notNull(),
  rotationCycleWeeks: integer('rotation_cycle_weeks').notNull().default(1),
  weightParticipation: integer('weight_participation').notNull(),
  weightRecency: integer('weight_recency').notNull(),
  weightAssignment: integer('weight_assignment').notNull(),
  weightAvailability: integer('weight_availability').notNull(),
  weightSkill: integer('weight_skill').notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull(),
});

export type SiteSettingsRow = typeof siteSettings.$inferSelect;
export type NewSiteSettingsRow = typeof siteSettings.$inferInsert;
