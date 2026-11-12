import { pgTable, uuid, varchar, text, timestamp, pgEnum, numeric, integer, boolean } from 'drizzle-orm/pg-core';
import { churches } from './church.table';

export const campaignStatusEnum = pgEnum('campaign_status', ['ACTIVE', 'COMPLETED', 'CLOSED']);
export const milestoneStatusEnum = pgEnum('milestone_status', ['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED']);
export const donationStatusEnum = pgEnum('donation_status', ['PENDING', 'CONFIRMED', 'REJECTED']);

export const campaigns = pgTable('campaigns', {
  id: uuid('id').primaryKey(),
  churchId: uuid('church_id').notNull().references(() => churches.id, { onDelete: 'cascade' }),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  goalAmount: numeric('goal_amount', { precision: 12, scale: 2 }).notNull(),
  initialAmount: numeric('initial_amount', { precision: 12, scale: 2 }).notNull().default('0'),
  coverImageUrl: text('cover_image_url'),
  status: campaignStatusEnum('status').notNull().default('ACTIVE'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull(),
});

export const milestones = pgTable('milestones', {
  id: uuid('id').primaryKey(),
  campaignId: uuid('campaign_id').notNull().references(() => campaigns.id, { onDelete: 'cascade' }),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  progressPercentage: integer('progress_percentage').notNull().default(0),
  status: milestoneStatusEnum('status').notNull().default('NOT_STARTED'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull(),
});

export const donations = pgTable('donations', {
  id: uuid('id').primaryKey(),
  campaignId: uuid('campaign_id').notNull().references(() => campaigns.id, { onDelete: 'cascade' }),
  donorName: varchar('donor_name', { length: 255 }),
  isAnonymous: boolean('is_anonymous').notNull().default(false),
  amount: numeric('amount', { precision: 12, scale: 2 }).notNull(),
  paymentMethod: varchar('payment_method', { length: 100 }),
  proofImageUrl: text('proof_image_url'),
  referenceCode: varchar('reference_code', { length: 255 }),
  status: donationStatusEnum('status').notNull().default('PENDING'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull(),
});

export type CampaignRow = typeof campaigns.$inferSelect;
export type MilestoneRow = typeof milestones.$inferSelect;
export type DonationRow = typeof donations.$inferSelect;
