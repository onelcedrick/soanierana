import { Program } from '../../../domain/program/program';
import type { ProgramRow, NewProgramRow } from '../schema/program.table';

export function toDomain(row: ProgramRow): Program {
  return Program.reconstitute({
    id: row.id, churchId: row.churchId, name: row.name,
    frequency: row.frequency, dayOfWeek: row.dayOfWeek, startTime: row.startTime,
    isActive: row.isActive, createdAt: row.createdAt, updatedAt: row.updatedAt,
  });
}
export function toInsert(p: Program): NewProgramRow {
  return {
    id: p.id, churchId: p.churchId, name: p.name,
    frequency: p.frequency, dayOfWeek: p.dayOfWeek, startTime: p.startTime,
    isActive: p.isActive, createdAt: p.createdAt, updatedAt: p.updatedAt,
  };
}
