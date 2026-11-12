import { Notification, type NotificationKind } from '../../domain/notification/notification';
import type { NotificationRepository } from '../../domain/notification/notification.repository';

export interface NotifyInput {
  userId: string; kind: NotificationKind; title: string; body: string;
  data?: Record<string, unknown> | null;
}

export class NotifyUseCase {
  constructor(private readonly notifications: NotificationRepository) {}
  async execute(input: NotifyInput): Promise<{ id: string }> {
    const n = Notification.create(input);
    await this.notifications.save(n);
    return { id: n.id };
  }
}
