import { and, eq, desc } from 'drizzle-orm';
import type { Publication } from '../../domain/publication/publication';
import type { PublicationRepository } from '../../domain/publication/publication.repository';
import type { Db } from '../database/client';
import { publications } from '../database/schema/publication.table';
import { toDomain, toInsert } from '../database/mappers/publication.mapper';

export class DrizzlePublicationRepository implements PublicationRepository {
  constructor(private readonly db: Db) {}
  
  async findById(id: string): Promise<Publication | null> {
    const [row] = await this.db.select().from(publications).where(eq(publications.id, id)).limit(1);
    return row ? toDomain(row) : null;
  }

  async findByChurch(churchId: string, opts?: { audience?: 'PUBLIC' | 'MEMBERS_ONLY' }): Promise<Publication[]> {
    const where = opts?.audience
      ? and(eq(publications.churchId, churchId), eq(publications.audience, opts.audience))
      : eq(publications.churchId, churchId);
      
    // AJOUT DU TRI : Plus récent d'abord (desc)
    const rows = await this.db.select().from(publications)
      .where(where)
      .orderBy(desc(publications.publishedAt));
      
    return rows.map(toDomain);
  }

  async save(p: Publication): Promise<void> { 
    await this.db.insert(publications).values(toInsert(p)); 
  }
  
  async update(p: Publication): Promise<void> {
    await this.db.update(publications).set(toInsert(p)).where(eq(publications.id, p.id));
  }
  
  async delete(id: string): Promise<void> {
    await this.db.delete(publications).where(eq(publications.id, id));
  }
}
