import { eq } from 'drizzle-orm';
import type { ProgramSession } from '../../domain/program/program-session';
import type { ProgramSessionRepository } from '../../domain/program/program-session.repository';
import type { Db } from '../database/client';
import { programSessions } from '../database/schema/program-session.table';
import { toDomain, toInsert } from '../database/mappers/program-session.mapper';

export class DrizzleProgramSessionRepository implements ProgramSessionRepository {
  constructor(private readonly db: Db) {}

  async findById(id: string): Promise<ProgramSession | null> {
    const [row] = await this.db.select().from(programSessions).where(eq(programSessions.id, id)).limit(1);
    return row ? toDomain(row) : null;
  }

  async findByProgram(programId: string): Promise<ProgramSession[]> {
    const rows = await this.db.select().from(programSessions).where(eq(programSessions.programId, programId));
    return rows.map(toDomain);
  }

  async save(s: ProgramSession): Promise<void> {
    await this.db.insert(programSessions).values(toInsert(s));
  }

  async update(s: ProgramSession): Promise<void> {
    await this.db.update(programSessions).set(toInsert(s)).where(eq(programSessions.id, s.id));
  }

  async delete(id: string): Promise<void> {
    await this.db.delete(programSessions).where(eq(programSessions.id, id));
  }
}
