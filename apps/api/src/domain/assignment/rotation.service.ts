import type { Member } from '../member/member';
import type { AssignmentRepository } from './assignment.repository';

export interface RotationCandidate {
  member: Member;
  attendanceCount: number;
  lastAttendanceDate: Date | null;
}

export interface RankedCandidate extends RotationCandidate {
  score: number;
  justification: string;
}

export class RotationService {
  constructor(private readonly assignments: AssignmentRepository) {}

  async rankCandidates(candidates: Member[]): Promise<RankedCandidate[]> {
    const ranked: RankedCandidate[] = [];
    for (const member of candidates) {
      const count = await this.assignments.countAttendanceByMember(member.id);
      const last = await this.assignments.lastAttendanceDate(member.id);
      const lastAgeDays = last ? Math.floor((Date.now() - last.getTime()) / 86_400_000) : 9999;
      const score = -count * 1000 + lastAgeDays;
      ranked.push({
        member, attendanceCount: count, lastAttendanceDate: last, score,
        justification: `participations=${count}, jours_depuis_derniere=${lastAgeDays}`,
      });
    }
    ranked.sort((a, b) => b.score - a.score);
    return ranked;
  }
}
