import { eq } from 'drizzle-orm';
import type { ReplacementRequest } from '../../domain/assignment/replacement-request';
import type { ReplacementRequestRepository } from '../../domain/assignment/replacement-request.repository';
import type { Db } from '../database/client';
import { replacementRequests } from '../database/schema/assignment.table';
import { toDomain, toInsert } from '../database/mappers/replacement-request.mapper';

export class DrizzleReplacementRequestRepository implements ReplacementRequestRepository {
  constructor(private readonly db: Db) {}
  async findById(id: string): Promise<ReplacementRequest | null> {
    const [row] = await this.db.select().from(replacementRequests).where(eq(replacementRequests.id, id)).limit(1);
    return row ? toDomain(row) : null;
  }
  async findByAssignment(assignmentId: string): Promise<ReplacementRequest[]> {
    const rows = await this.db.select().from(replacementRequests).where(eq(replacementRequests.assignmentId, assignmentId));
    return rows.map(toDomain);
  }
  async save(r: ReplacementRequest): Promise<void> {
    await this.db.insert(replacementRequests).values(toInsert(r));
  }
  async update(r: ReplacementRequest): Promise<void> {
    await this.db.update(replacementRequests).set(toInsert(r)).where(eq(replacementRequests.id, r.id));
  }
}
