import { and, count, desc, eq } from 'drizzle-orm';
import type { Assignment } from '../../domain/assignment/assignment';
import type { AssignmentRepository } from '../../domain/assignment/assignment.repository';
import type { Db } from '../database/client';
import { assignments } from '../database/schema/assignment.table';
import { toDomain, toInsert } from '../database/mappers/assignment.mapper';

export class DrizzleAssignmentRepository implements AssignmentRepository {
  constructor(private readonly db: Db) {}
  async findById(id: string): Promise<Assignment | null> {
    const [row] = await this.db.select().from(assignments).where(eq(assignments.id, id)).limit(1);
    return row ? toDomain(row) : null;
  }
  async findBySession(sessionId: string): Promise<Assignment[]> {
    const rows = await this.db.select().from(assignments).where(eq(assignments.sessionId, sessionId));
    return rows.map(toDomain);
  }
  async findByMember(memberId: string): Promise<Assignment[]> {
    const rows = await this.db.select().from(assignments).where(eq(assignments.memberId, memberId));
    return rows.map(toDomain);
  }
  async countAttendanceByMember(memberId: string): Promise<number> {
    const [row] = await this.db
      .select({ value: count() })
      .from(assignments)
      .where(and(eq(assignments.memberId, memberId), eq(assignments.status, 'ATTENDED')));
    return row?.value ? Number(row.value) : 0;
  }
  async lastAttendanceDate(memberId: string): Promise<Date | null> {
    const [row] = await this.db
      .select()
      .from(assignments)
      .where(and(eq(assignments.memberId, memberId), eq(assignments.status, 'ATTENDED')))
      .orderBy(desc(assignments.updatedAt))
      .limit(1);
    return row?.updatedAt ?? null;
  }
  async save(a: Assignment): Promise<void> {
    await this.db.insert(assignments).values(toInsert(a));
  }
  async update(a: Assignment): Promise<void> {
    await this.db.update(assignments).set(toInsert(a)).where(eq(assignments.id, a.id));
  }
}
