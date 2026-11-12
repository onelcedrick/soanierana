import { and, count, desc, eq } from 'drizzle-orm';
import type { AuditLog } from '../../domain/audit/audit-log';
import type { AuditLogRepository } from '../../domain/audit/audit-log.repository';
import type { Db } from '../database/client';
import { auditLogs } from '../database/schema/audit-log.table';
import { toDomain, toInsert } from '../database/mappers/audit-log.mapper';

export class DrizzleAuditLogRepository implements AuditLogRepository {
  constructor(private readonly db: Db) {}

  async findLatestHash(churchId: string): Promise<string | null> {
    const [row] = await this.db.select({ hash: auditLogs.hash })
      .from(auditLogs)
      .where(eq(auditLogs.churchId, churchId))
      .orderBy(desc(auditLogs.createdAt))
      .limit(1);
    return row?.hash ?? null;
  }

  async findByChurch(churchId: string, options: { limit: number; offset: number; severity?: string }) {
    const where = options.severity 
      ? and(eq(auditLogs.churchId, churchId), eq(auditLogs.severity, options.severity as any))
      : eq(auditLogs.churchId, churchId);

    const rows = await this.db.select().from(auditLogs)
      .where(where)
      .orderBy(desc(auditLogs.createdAt))
      .limit(options.limit)
      .offset(options.offset);

    const [totalRow] = await this.db.select({ value: count() }).from(auditLogs).where(where);

    return { data: rows.map(toDomain), total: Number(totalRow?.value ?? 0) };
  }

  async save(log: AuditLog): Promise<void> {
    await this.db.insert(auditLogs).values(toInsert(log));
  }
}
