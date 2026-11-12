import type { AuditLogRepository } from '../../domain/audit/audit-log.repository';

export class ListLogsUseCase {
  constructor(private readonly repo: AuditLogRepository) {}
  async execute(churchId: string, page = 1, limit = 20, severity?: string) {
    const offset = (page - 1) * limit;
    const { data, total } = await this.repo.findByChurch(churchId, { limit, offset, severity });
    
    return {
      data: data.map(l => ({
        id: l.id, actorId: l.actorId, action: l.action, module: l.module,
        description: l.description, severity: l.severity, createdAt: l.createdAt.toISOString(),
      })),
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) }
    };
  }
}
