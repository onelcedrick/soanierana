import { and, asc, eq, gte } from 'drizzle-orm';
import type { Event } from '../../domain/event/event';
import type { EventRepository } from '../../domain/event/event.repository';
import type { Db } from '../database/client';
import { events } from '../database/schema/event.table';
import { toDomain, toInsert } from '../database/mappers/event.mapper';

export class DrizzleEventRepository implements EventRepository {
  constructor(private readonly db: Db) {}

  async findById(id: string): Promise<Event | null> {
    const [row] = await this.db.select().from(events).where(eq(events.id, id)).limit(1);
    return row ? toDomain(row) : null;
  }

  async findByChurch(churchId: string): Promise<Event[]> {
    const rows = await this.db.select().from(events)
      .where(eq(events.churchId, churchId))
      .orderBy(asc(events.startDate));
    return rows.map(toDomain);
  }

  async findUpcoming(churchId: string): Promise<Event[]> {
    const now = new Date();
    const rows = await this.db.select().from(events)
      .where(and(eq(events.churchId, churchId), gte(events.startDate, now)))
      .orderBy(asc(events.startDate))
      .limit(3);
    return rows.map(toDomain);
  }

  async save(e: Event): Promise<void> {
    await this.db.insert(events).values(toInsert(e));
  }

  async delete(id: string): Promise<void> {
    await this.db.delete(events).where(eq(events.id, id));
  }
}
