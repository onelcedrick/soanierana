import { pgTable, uuid, varchar, text, timestamp, jsonb, pgEnum, index } from 'drizzle-orm/pg-core';
import { churches } from './church.table';

export const logSeverityEnum = pgEnum('log_severity', ['INFO', 'WARNING', 'CRITICAL']);

export const auditLogs = pgTable('audit_logs', {
  id: uuid('id').primaryKey(),
  churchId: uuid('church_id').notNull().references(() => churches.id, { onDelete: 'cascade' }),
  actorId: varchar('actor_id', { length: 255 }).notNull(),
  action: varchar('action', { length: 100 }).notNull(),
  module: varchar('module', { length: 100 }).notNull(),
  entityId: varchar('entity_id', { length: 255 }),
  description: text('description').notNull(),
  oldValue: jsonb('old_value'),
  newValue: jsonb('new_value'),
  severity: logSeverityEnum('severity').notNull(),
  ipAddress: varchar('ip_address', { length: 45 }),
  correlationId: varchar('correlation_id', { length: 100 }),
  hash: varchar('hash', { length: 64 }).notNull(),
  previousHash: varchar('previous_hash', { length: 64 }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull(),
}, (table) => ({
  churchDateIdx: index('audit_logs_church_date_idx').on(table.churchId, table.createdAt),
}));

export type AuditLogRow = typeof auditLogs.$inferSelect;
export type NewAuditLogRow = typeof auditLogs.$inferInsert;
