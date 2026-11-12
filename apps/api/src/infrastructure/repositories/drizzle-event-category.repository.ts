import { eq } from 'drizzle-orm';
import type { EventCategory } from '../../domain/publication/event-category';
import type { EventCategoryRepository } from '../../domain/publication/event-category.repository';
import type { Db } from '../database/client';
import { eventCategories } from '../database/schema/publication.table';
import { categoryToDomain, categoryToInsert } from '../database/mappers/publication.mapper';

export class DrizzleEventCategoryRepository implements EventCategoryRepository {
  constructor(private readonly db: Db) {}
  async findById(id: string): Promise<EventCategory | null> {
    const [row] = await this.db.select().from(eventCategories).where(eq(eventCategories.id, id)).limit(1);
    return row ? categoryToDomain(row) : null;
  }
  async findByChurch(churchId: string): Promise<EventCategory[]> {
    const rows = await this.db.select().from(eventCategories).where(eq(eventCategories.churchId, churchId));
    return rows.map(categoryToDomain);
  }
  async save(c: EventCategory): Promise<void> { await this.db.insert(eventCategories).values(categoryToInsert(c)); }
  async delete(id: string): Promise<void> { await this.db.delete(eventCategories).where(eq(eventCategories.id, id)); }
}
