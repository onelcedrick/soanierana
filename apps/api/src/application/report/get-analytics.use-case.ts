import { sql } from 'drizzle-orm';
import type { Db } from '../../infrastructure/database/client';

export interface AnalyticsOutput {
  membersByStatus: Array<{ status: string; count: number }>;
  topParticipants: Array<{ name: string; count: number }>;
  attendance: { attended: number; absent: number; rate: number };
  eventsByProgram: Array<{ name: string; count: number }>;
}

export class GetAnalyticsUseCase {
  constructor(private readonly db: Db) {}

  async execute(churchId: string): Promise<AnalyticsOutput> {
    // 1. Membres par statut (Grouping Algorithm)
    const membersStatusRes = await this.db.execute(sql`
      SELECT membership_status as status, COUNT(*) as count 
      FROM members 
      WHERE church_id = ${churchId}
      GROUP BY membership_status
    `);
    const membersByStatus = (membersStatusRes.rows as any[]).map(r => ({
      status: r.status, count: Number(r.count)
    }));

    // 2. Top 5 des participants (Ranking Algorithm)
    const topParticipantsRes = await this.db.execute(sql`
      SELECT m.first_name, m.last_name, COUNT(a.id) as total
      FROM members m
      JOIN assignments a ON m.id = a.member_id
      WHERE m.church_id = ${churchId} AND a.status = 'ATTENDED'
      GROUP BY m.id, m.first_name, m.last_name
      ORDER BY total DESC
      LIMIT 5
    `);
    const topParticipants = (topParticipantsRes.rows as any[]).map(r => ({
      name: `${r.first_name} ${r.last_name}`, count: Number(r.total)
    }));

    // 3. Taux de présence global (Percentage Calculation)
    const attendanceRes = await this.db.execute(sql`
      SELECT 
        COUNT(*) FILTER (WHERE a.status = 'ATTENDED') as attended,
        COUNT(*) FILTER (WHERE a.status = 'ABSENT') as absent
      FROM assignments a
      JOIN program_sessions ps ON a.session_id = ps.id
      JOIN programs p ON ps.program_id = p.id
      WHERE p.church_id = ${churchId}
    `);
    const attData = (attendanceRes.rows as any[])[0] || { attended: 0, absent: 0 };
    const attended = Number(attData.attended || 0);
    const absent = Number(attData.absent || 0);
    const totalAtt = attended + absent;
    const rate = totalAtt === 0 ? 0 : Math.round((attended / totalAtt) * 100);

    // 4. Événements par programme (Event Counting)
    const eventsRes = await this.db.execute(sql`
      SELECT p.name, COUNT(ps.id) as count
      FROM programs p
      LEFT JOIN program_sessions ps ON p.id = ps.program_id
      WHERE p.church_id = ${churchId}
      GROUP BY p.id, p.name
    `);
    const eventsByProgram = (eventsRes.rows as any[]).map(r => ({
      name: r.name, count: Number(r.count)
    }));

    return {
      membersByStatus,
      topParticipants,
      attendance: { attended, absent, rate },
      eventsByProgram
    };
  }
}
