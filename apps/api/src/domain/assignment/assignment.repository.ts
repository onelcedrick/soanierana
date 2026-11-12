import type { Assignment } from './assignment';

export interface AssignmentRepository {
  findById(id: string): Promise<Assignment | null>;
  findBySession(sessionId: string): Promise<Assignment[]>;
  findByMember(memberId: string): Promise<Assignment[]>;
  countAttendanceByMember(memberId: string): Promise<number>;
  lastAttendanceDate(memberId: string): Promise<Date | null>;
  save(assignment: Assignment): Promise<void>;
  update(assignment: Assignment): Promise<void>;
}
