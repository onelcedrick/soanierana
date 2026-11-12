import { sql } from 'drizzle-orm';
import type { Db } from '../../infrastructure/database/client';

export class GetDashboardStatsUseCase {
  constructor(private readonly db: Db) {}

  async execute(churchId: string) {
    // 1. Membres
    const membersRes = await this.db.execute(sql`SELECT COUNT(*)::int as count FROM members WHERE church_id = ${churchId}`);
    const members = (membersRes.rows[0] as any)?.count || 0;

    // 2. Événements
    const eventsRes = await this.db.execute(sql`SELECT COUNT(*)::int as count FROM events WHERE church_id = ${churchId}`);
    const events = (eventsRes.rows[0] as any)?.count || 0;

    // 3. Sondages actifs
    const pollsRes = await this.db.execute(sql`SELECT COUNT(*)::int as count FROM polls WHERE church_id = ${churchId} AND status = 'PUBLISHED'`);
    const polls = (pollsRes.rows[0] as any)?.count || 0;

    // 4. Tâches en cours
    const tasksRes = await this.db.execute(sql`
      SELECT COUNT(*)::int as count FROM assignments a
      JOIN program_sessions ps ON a.session_id = ps.id
      JOIN programs p ON ps.program_id = p.id
      WHERE p.church_id = ${churchId} AND a.status IN ('PROPOSED', 'ACCEPTED')
    `);
    const tasks = (tasksRes.rows[0] as any)?.count || 0;

    // 5. Derniers logs
    const recentLogsRes = await this.db.execute(sql`
      SELECT id, action, description, severity, created_at 
      FROM audit_logs 
      WHERE church_id = ${churchId} 
      ORDER BY created_at DESC 
      LIMIT 3
    `);

    return {
      members: Number(members),
      events: Number(events),
      polls: Number(polls),
      tasks: Number(tasks),
      recentLogs: recentLogsRes.rows || []
    };
  }
}
