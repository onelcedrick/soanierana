import { Publication } from '../../../domain/publication/publication';
import { EventCategory } from '../../../domain/publication/event-category';
import type {
  PublicationRow, NewPublicationRow, EventCategoryRow, NewEventCategoryRow,
} from '../schema/publication.table';

export function categoryToDomain(row: EventCategoryRow): EventCategory {
  return EventCategory.reconstitute({ id: row.id, churchId: row.churchId, name: row.name, createdAt: row.createdAt });
}
export function categoryToInsert(c: EventCategory): NewEventCategoryRow {
  return { id: c.id, churchId: c.churchId, name: c.name, createdAt: c.createdAt };
}

export function toDomain(row: PublicationRow): Publication {
  return Publication.reconstitute({
    id: row.id, churchId: row.churchId, categoryId: row.categoryId,
    title: row.title, content: row.content, coverImageUrl: row.coverImageUrl,
    audience: row.audience, status: row.status,
    eventDate: row.eventDate, eventTime: row.eventTime, location: row.location,
    publishedAt: row.publishedAt, createdAt: row.createdAt, updatedAt: row.updatedAt,
  });
}
export function toInsert(p: Publication): NewPublicationRow {
  return {
    id: p.id, churchId: p.churchId, categoryId: p.categoryId,
    title: p.title, content: p.content, coverImageUrl: p.coverImageUrl,
    audience: p.audience, status: p.status,
    eventDate: p.eventDate, eventTime: p.eventTime, location: p.location,
    publishedAt: p.publishedAt, createdAt: p.createdAt, updatedAt: p.updatedAt,
  };
}
