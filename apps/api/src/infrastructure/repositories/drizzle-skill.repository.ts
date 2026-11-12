import { eq } from 'drizzle-orm';
import type { Skill } from '../../domain/skill/skill';
import type { SkillRepository } from '../../domain/skill/skill.repository';
import type { Db } from '../database/client';
import { skills } from '../database/schema/skill.table';
import { toDomain, toInsert } from '../database/mappers/skill.mapper';

export class DrizzleSkillRepository implements SkillRepository {
  constructor(private readonly db: Db) {}
  async findById(id: string): Promise<Skill | null> {
    const [row] = await this.db.select().from(skills).where(eq(skills.id, id)).limit(1);
    return row ? toDomain(row) : null;
  }
  async findByChurch(churchId: string): Promise<Skill[]> {
    const rows = await this.db.select().from(skills).where(eq(skills.churchId, churchId));
    return rows.map(toDomain);
  }
  async save(s: Skill): Promise<void> { await this.db.insert(skills).values(toInsert(s)); }
  async delete(id: string): Promise<void> { await this.db.delete(skills).where(eq(skills.id, id)); }
}
