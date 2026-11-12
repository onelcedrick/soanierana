import { AuditLog } from '../../../domain/audit/audit-log';
import type { AuditLogRow, NewAuditLogRow } from '../schema/audit-log.table';

export function toDomain(row: AuditLogRow): AuditLog {
  return AuditLog.reconstitute({
    id: row.id, churchId: row.churchId, actorId: row.actorId,
    action: row.action, module: row.module, entityId: row.entityId,
    description: row.description, oldValue: row.oldValue, newValue: row.newValue,
    severity: row.severity, ipAddress: row.ipAddress, correlationId: row.correlationId,
    createdAt: row.createdAt, hash: row.hash, previousHash: row.previousHash,
  });
}
export function toInsert(log: AuditLog): NewAuditLogRow {
  return {
    id: log.id, churchId: log.churchId, actorId: log.actorId,
    action: log.action, module: log.module, entityId: log.entityId,
    description: log.description, oldValue: log.oldValue, newValue: log.newValue,
    severity: log.severity, ipAddress: log.ipAddress, correlationId: log.correlationId,
    createdAt: log.createdAt, hash: log.hash, previousHash: log.previousHash,
  };
}
