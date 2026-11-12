import { Availability } from '../../../domain/availability/availability';
import type { AvailabilityRow, NewAvailabilityRow } from '../schema/availability.table';

export function toDomain(row: AvailabilityRow): Availability {
  return Availability.reconstitute({
    id: row.id, memberId: row.memberId, type: row.type, date: row.date,
    startDate: row.startDate, endDate: row.endDate, notes: row.notes, createdAt: row.createdAt,
  });
}
export function toInsert(a: Availability): NewAvailabilityRow {
  return {
    id: a.id, memberId: a.memberId, type: a.type, date: a.date,
    startDate: a.startDate, endDate: a.endDate, notes: a.notes, createdAt: a.createdAt,
  };
}
