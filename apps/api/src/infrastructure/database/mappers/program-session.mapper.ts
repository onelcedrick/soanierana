import { ProgramSession } from '../../../domain/program/program-session';
import type { ProgramSessionRow, NewProgramSessionRow } from '../schema/program-session.table';

export function toDomain(row: ProgramSessionRow): ProgramSession {
  return ProgramSession.reconstitute({
    id: row.id, programId: row.programId, date: row.date, 
    status: row.status, createdAt: row.createdAt,
  });
}
export function toInsert(s: ProgramSession): NewProgramSessionRow {
  return { id: s.id, programId: s.programId, date: s.date, status: s.status, createdAt: s.createdAt };
}
