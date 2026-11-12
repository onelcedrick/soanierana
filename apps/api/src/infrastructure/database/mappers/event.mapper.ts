import { Event } from '../../../domain/event/event';
import type { EventRow, NewEventRow } from '../schema/event.table';

export function toDomain(row: EventRow): Event {
  return Event.reconstitute({
    id: row.id, churchId: row.churchId, title: row.title, description: row.description,
    startDate: row.startDate, endDate: row.endDate, location: row.location,
    coverImageUrl: row.coverImageUrl, createdAt: row.createdAt, updatedAt: row.updatedAt,
  });
}

export function toInsert(e: Event): NewEventRow {
  return {
    id: e.id, churchId: e.churchId, title: e.title, description: e.description,
    startDate: e.startDate, endDate: e.endDate, location: e.location,
    coverImageUrl: e.coverImageUrl, createdAt: e.createdAt, updatedAt: e.updatedAt,
  };
}
