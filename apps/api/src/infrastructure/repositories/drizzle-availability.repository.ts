import { eq } from 'drizzle-orm';
import type { Availability } from '../../domain/availability/availability';
import type { AvailabilityRepository } from '../../domain/availability/availability.repository';
import type { Db } from '../database/client';
import { availabilities } from '../database/schema/availability.table';
import { toDomain, toInsert } from '../database/mappers/availability.mapper';

export class DrizzleAvailabilityRepository implements AvailabilityRepository {
  constructor(private readonly db: Db) {}
  async findByMember(memberId: string): Promise<Availability[]> {
    const rows = await this.db.select().from(availabilities).where(eq(availabilities.memberId, memberId));
    return rows.map(toDomain);
  }
  async save(a: Availability): Promise<void> { await this.db.insert(availabilities).values(toInsert(a)); }
  async delete(id: string): Promise<void> { await this.db.delete(availabilities).where(eq(availabilities.id, id)); }
}
