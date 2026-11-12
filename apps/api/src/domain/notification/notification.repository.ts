import type { Notification } from './notification';

export interface NotificationRepository {
  findByUser(userId: string): Promise<Notification[]>;
  save(n: Notification): Promise<void>;
  update(n: Notification): Promise<void>;
}
