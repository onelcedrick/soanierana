import type { Db } from '../../infrastructure/database/client';
import { eq, count, and } from 'drizzle-orm';
import { members } from '../../infrastructure/database/schema/member.table';
import { assignments } from '../../infrastructure/database/schema/assignment.table';
import { programs } from '../../infrastructure/database/schema/program.table';

export interface ChurchStatsOutput {
  churchId: string;
  totalMembers: number;
  activeMembers: number;
  totalPrograms: number;
  totalAttendances: number;
  totalAbsences: number;
}

export class ChurchStatsUseCase {
  constructor(private readonly db: Db) {}
  async execute(churchId: string): Promise<ChurchStatsOutput> {
    const [total] = await this.db.select({ value: count() }).from(members).where(eq(members.churchId, churchId));
    const [active] = await this.db.select({ value: count() }).from(members).where(and(eq(members.churchId, churchId), eq(members.isActive, true)));
    const [progs] = await this.db.select({ value: count() }).from(programs).where(eq(programs.churchId, churchId));

    const memberRows = await this.db.select({ id: members.id }).from(members).where(eq(members.churchId, churchId));
    const memberIds = new Set(memberRows.map((m) => m.id));

    let attendances = 0;
    let absences = 0;
    if (memberIds.size > 0) {
      const att = await this.db.select({ memberId: assignments.memberId, status: assignments.status }).from(assignments);
      for (const a of att) {
        if (!memberIds.has(a.memberId)) continue;
        if (a.status === 'ATTENDED') attendances++;
        if (a.status === 'ABSENT') absences++;
      }
    }

    return {
      churchId,
      totalMembers: Number(total?.value ?? 0),
      activeMembers: Number(active?.value ?? 0),
      totalPrograms: Number(progs?.value ?? 0),
      totalAttendances: attendances,
      totalAbsences: absences,
    };
  }
}
