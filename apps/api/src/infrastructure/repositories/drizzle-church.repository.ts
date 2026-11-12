import { eq } from 'drizzle-orm';
import type { Church } from '../../domain/church/church';
import type { ChurchRepository } from '../../domain/church/church.repository';
import type { Db } from '../database/client';
import { churches } from '../database/schema/church.table';
import { toDomain, toInsert } from '../database/mappers/church.mapper';

export class DrizzleChurchRepository implements ChurchRepository {
  constructor(private readonly db: Db) {}

  async findById(id: string): Promise<Church | null> {
    const [row] = await this.db.select().from(churches).where(eq(churches.id, id)).limit(1);
    return row ? toDomain(row) : null;
  }

  async findAll(): Promise<Church[]> {
    const rows = await this.db.select().from(churches);
    return rows.map(toDomain);
  }

  async save(church: Church): Promise<void> {
    await this.db.insert(churches).values(toInsert(church));
  }

  async update(church: Church): Promise<void> {
    await this.db.update(churches).set(toInsert(church)).where(eq(churches.id, church.id));
  }

  async delete(id: string): Promise<void> {
    await this.db.delete(churches).where(eq(churches.id, id));
  }
}
