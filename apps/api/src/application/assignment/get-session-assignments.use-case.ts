import { sql } from 'drizzle-orm';
import type { Db } from '../../infrastructure/database/client';

export class GetSessionAssignmentsUseCase {
  constructor(private readonly db: Db) {}

  async execute(sessionId: string) {
    try {
      const result = await this.db.execute(sql`
        SELECT 
          a.id, 
          a.status, 
          t.name as task, 
          CONCAT(m.first_name, ' ', m.last_name) as member
        FROM assignments a
        INNER JOIN tasks t ON a.task_id = t.id
        INNER JOIN members m ON a.member_id = m.id
        WHERE a.session_id = ${sessionId}
      `);

      return (result.rows as any[]).map(r => ({
        id: r.id,
        task: r.task,
        member: r.member,
        status: r.status
      }));
    } catch (error) {
      console.error('ERREUR SQL ASSIGNMENTS:', error);
      throw error;
    }
  }
}
