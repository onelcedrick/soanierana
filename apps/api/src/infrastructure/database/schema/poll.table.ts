import { pgTable, uuid, varchar, text, boolean, timestamp, pgEnum, integer, index, uniqueIndex } from 'drizzle-orm/pg-core';
import { churches } from './church.table';
import { users } from './user.table';

export const pollStatusEnum = pgEnum('poll_status', ['DRAFT', 'PUBLISHED', 'CLOSED', 'ARCHIVED']);
export const pollAudienceEnum = pgEnum('poll_audience', ['PUBLIC', 'MEMBERS_ONLY']);

export const polls = pgTable('polls', {
  id: uuid('id').primaryKey(),
  churchId: uuid('church_id').notNull().references(() => churches.id, { onDelete: 'cascade' }),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  audience: pollAudienceEnum('audience').notNull(),
  isAnonymous: boolean('is_anonymous').notNull().default(false),
  isMultipleChoice: boolean('is_multiple_choice').notNull().default(false),
  opensAt: timestamp('opens_at', { withTimezone: true }).notNull(),
  closesAt: timestamp('closes_at', { withTimezone: true }).notNull(),
  status: pollStatusEnum('status').notNull(),
  showResultsBeforeClose: boolean('show_results_before_close').notNull().default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull(),
});

export const pollOptions = pgTable('poll_options', {
  id: uuid('id').primaryKey(),
  pollId: uuid('poll_id').notNull().references(() => polls.id, { onDelete: 'cascade' }),
  label: varchar('label', { length: 255 }).notNull(),
  position: integer('position').notNull(),
}, (table) => ({
  pollPosition: index('poll_options_poll_position').on(table.pollId, table.position),
}));

export const pollParticipations = pgTable('poll_participations', {
  id: uuid('id').primaryKey(),
  pollId: uuid('poll_id').notNull().references(() => polls.id, { onDelete: 'cascade' }),
  token: varchar('token', { length: 120 }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull(),
}, (table) => ({
  tokenUnique: uniqueIndex('poll_participations_token_unique').on(table.pollId, table.token),
}));

export const pollVotes = pgTable('poll_votes', {
  id: uuid('id').primaryKey(),
  pollId: uuid('poll_id').notNull().references(() => polls.id, { onDelete: 'cascade' }),
  optionId: uuid('option_id').notNull().references(() => pollOptions.id, { onDelete: 'cascade' }),
  participationId: uuid('participation_id').references(() => pollParticipations.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull(),
});

export type PollRow = typeof polls.$inferSelect;
export type NewPollRow = typeof polls.$inferInsert;
export type PollOptionRow = typeof pollOptions.$inferSelect;
export type NewPollOptionRow = typeof pollOptions.$inferInsert;
export type PollParticipationRow = typeof pollParticipations.$inferSelect;
export type NewPollParticipationRow = typeof pollParticipations.$inferInsert;
export type PollVoteRow = typeof pollVotes.$inferSelect;
export type NewPollVoteRow = typeof pollVotes.$inferInsert;
