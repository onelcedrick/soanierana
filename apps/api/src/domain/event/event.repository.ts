import type { Event } from './event';

export interface EventRepository {
  findById(id: string): Promise<Event | null>;
  findByChurch(churchId: string): Promise<Event[]>;
  findUpcoming(churchId: string): Promise<Event[]>;
  save(event: Event): Promise<void>;
  delete(id: string): Promise<void>;
}
