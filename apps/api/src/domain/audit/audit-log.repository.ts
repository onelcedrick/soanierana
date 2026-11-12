import type { AuditLog } from './audit-log';

export interface AuditLogRepository {
  findLatestHash(churchId: string): Promise<string | null>;
  findByChurch(churchId: string, options: { limit: number; offset: number; severity?: string }): Promise<{ data: AuditLog[]; total: number }>;
  save(log: AuditLog): Promise<void>;
}
