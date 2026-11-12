import { eq } from 'drizzle-orm';
import type { Notification } from '../../domain/notification/notification';
import type { NotificationRepository } from '../../domain/notification/notification.repository';
import type { Db } from '../database/client';
import { notifications } from '../database/schema/notification.table';
import { toDomain, toInsert } from '../database/mappers/notification.mapper';

export class DrizzleNotificationRepository implements NotificationRepository {
  constructor(private readonly db: Db) {}
  async findByUser(userId: string): Promise<Notification[]> {
    const rows = await this.db.select().from(notifications).where(eq(notifications.userId, userId));
    return rows.map(toDomain);
  }
  async save(n: Notification): Promise<void> { await this.db.insert(notifications).values(toInsert(n)); }
  async update(n: Notification): Promise<void> {
    await this.db.update(notifications).set(toInsert(n)).where(eq(notifications.id, n.id));
  }
}
