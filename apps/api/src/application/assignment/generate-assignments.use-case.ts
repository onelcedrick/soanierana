import { randomUUID } from 'node:crypto';
import { and, eq, gte, lte } from 'drizzle-orm';
import type { Db } from '../../infrastructure/database/client';
import { 
  assignments, members, tasks, programSessions, programs, availabilities, siteSettings
} from '../../infrastructure/database/schema';
import { NotFoundError } from '../../shared/errors';

const GRADE_LEVEL: any = { 'MAMBRA_TSOTRA': 1, 'DIAKONA': 2, 'LOHOLONA': 3 };

// Fonction utilitaire : Mélange un tableau (Fisher-Yates)
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j]!, shuffled[i]!];
  }
  return shuffled;
}

export class GenerateAssignmentsUseCase {
  constructor(private readonly db: Db) {}

  async execute(input: { sessionId: string }): Promise<{ assigned: number; unassigned: number }> {
    const [session] = await this.db.select().from(programSessions).where(eq(programSessions.id, input.sessionId)).limit(1);
    if (!session) throw new NotFoundError('Session');

    const sessionTasks = await this.db.select().from(tasks).where(eq(tasks.programId, session.programId));
    const [program] = await this.db.select({ churchId: programs.churchId }).from(programs).where(eq(programs.id, session.programId)).limit(1);
    if (!program) throw new NotFoundError('Programme');
    const churchId = program.churchId;

    const [settings] = await this.db.select().from(siteSettings).where(eq(siteSettings.churchId, churchId)).limit(1);
    const cycleWeeks = settings?.rotationCycleWeeks || 1;

    const activeMembers = await this.db.select().from(members).where(and(eq(members.churchId, churchId), eq(members.isActive, true)));

    const cycleStartDate = new Date(session.date);
    cycleStartDate.setDate(cycleStartDate.getDate() - (cycleWeeks * 7));
    cycleStartDate.setHours(0, 0, 0, 0);

    const publishedAssignments = await this.db
      .select({ memberId: assignments.memberId })
      .from(assignments)
      .innerJoin(programSessions, eq(assignments.sessionId, programSessions.id))
      .where(and(
        gte(programSessions.date, cycleStartDate),
        lte(programSessions.date, session.date),
        eq(programSessions.status, 'PUBLISHED'),
        eq(assignments.status, 'PROPOSED')
      ));
      
    const occupiedInCycle = new Set(publishedAssignments.map(a => a.memberId));

    const allAttended = await this.db.select({ memberId: assignments.memberId }).from(assignments).where(eq(assignments.status, 'ATTENDED'));
    const totalParticipations = new Map<string, number>();
    for (const a of allAttended) {
      totalParticipations.set(a.memberId, (totalParticipations.get(a.memberId) || 0) + 1);
    }

    let assignedCount = 0;
    let unassignedCount = 0;
    const assignedInThisSession = new Set<string>();

    for (const task of sessionTasks) {
      let candidates = [];
      
      for (const member of activeMembers) {
        if (assignedInThisSession.has(member.id)) continue;

        if (task.eligibilityMode === 'MINIMUM_GRADE' && task.minimumGrade) {
          if ((GRADE_LEVEL[member.responsibilityLevel] || 0) < GRADE_LEVEL[task.minimumGrade]) continue;
        }

        const allowedStatuses = (task as any).allowedMembershipStatuses || ['LOCAL_BAPTIZED', 'EXTERNAL_BAPTIZED', 'UNBAPTIZED'];
        if (!allowedStatuses.includes(member.membershipStatus)) continue;

        const memberAvail = await this.db.select().from(availabilities).where(eq(availabilities.memberId, member.id));
        const isUnavailable = memberAvail.some(a => {
          if (a.type === 'UNAVAILABLE' && a.startDate && a.endDate) return session.date >= a.startDate && session.date <= a.endDate;
          if (a.type === 'EXCEPTION' && a.date) return session.date.toDateString() === a.date.toDateString();
          return false;
        });
        if (isUnavailable) continue;

        candidates.push({ 
          member, 
          count: totalParticipations.get(member.id) || 0, 
          isOccupiedInCycle: occupiedInCycle.has(member.id) 
        });
      }

      // ÉTAPE CLÉ : On mélange d'abord les candidats
      candidates = shuffleArray(candidates);

      // Puis on trie par priorité (le tri est stable, donc l'ordre aléatoire est conservé à égalité)
      candidates.sort((a, b) => {
        if (a.isOccupiedInCycle !== b.isOccupiedInCycle) {
          return a.isOccupiedInCycle ? 1 : -1;
        }
        return a.count - b.count;
      });

      const selected = candidates.slice(0, task.requiredPeople);
      if (selected.length < task.requiredPeople) unassignedCount++;

      for (const s of selected) {
        let justification = `Rotation aléatoire (${s.count} participations)`;
        if (s.isOccupiedInCycle) {
          justification = `Exception : membres insuffisants (Déjà affecté dans le cycle de ${cycleWeeks} semaines)`;
        }

        await this.db.insert(assignments).values({
          id: randomUUID(), sessionId: session.id, taskId: task.id, memberId: s.member.id,
          status: 'PROPOSED', justification: justification, proposedAt: new Date(), updatedAt: new Date(),
        });
        
        assignedInThisSession.add(s.member.id);
        assignedCount++;
      }
    }

    return { assigned: assignedCount, unassigned: unassignedCount };
  }
}
