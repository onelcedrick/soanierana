import { AuditLog, type LogSeverity } from '../../domain/audit/audit-log';
import type { AuditLogRepository } from '../../domain/audit/audit-log.repository';

export interface CreateLogInput {
  churchId: string; actorId: string; action: string; module: string;
  description: string; severity: LogSeverity;
  entityId?: string; oldValue?: any; newValue?: any; ipAddress?: string;
}

export class CreateLogUseCase {
  constructor(private readonly repo: AuditLogRepository) {}
  async execute(input: CreateLogInput): Promise<void> {
    const previousHash = await this.repo.findLatestHash(input.churchId);
    const log = AuditLog.create({ ...input, previousHash });
    await this.repo.save(log);
  }
}
