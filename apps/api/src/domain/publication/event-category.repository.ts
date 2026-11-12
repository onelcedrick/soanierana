import type { EventCategory } from './event-category';

export interface EventCategoryRepository {
  findById(id: string): Promise<EventCategory | null>;
  findByChurch(churchId: string): Promise<EventCategory[]>;
  save(category: EventCategory): Promise<void>;
  delete(id: string): Promise<void>;
}
