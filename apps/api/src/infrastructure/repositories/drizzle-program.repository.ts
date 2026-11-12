import { eq } from 'drizzle-orm';
import type { Program } from '../../domain/program/program';
import type { ProgramRepository } from '../../domain/program/program.repository';
import type { Db } from '../database/client';
import { programs } from '../database/schema/program.table';
import { toDomain, toInsert } from '../database/mappers/program.mapper';

export class DrizzleProgramRepository implements ProgramRepository {
  constructor(private readonly db: Db) {}

  async findById(id: string): Promise<Program | null> {
    const [row] = await this.db.select().from(programs).where(eq(programs.id, id)).limit(1);
    return row ? toDomain(row) : null;
  }

  async findByChurch(churchId: string): Promise<Program[]> {
    const rows = await this.db.select().from(programs).where(eq(programs.churchId, churchId));
    return rows.map(toDomain);
  }

  async save(p: Program): Promise<void> {
    await this.db.insert(programs).values(toInsert(p));
  }

  async update(p: Program): Promise<void> {
    await this.db.update(programs).set(toInsert(p)).where(eq(programs.id, p.id));
  }

  async delete(id: string): Promise<void> {
    await this.db.delete(programs).where(eq(programs.id, id));
  }
}
