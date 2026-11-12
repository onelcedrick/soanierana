import { ReplacementRequest } from '../../../domain/assignment/replacement-request';
import type { ReplacementRequestRow, NewReplacementRequestRow } from '../schema/assignment.table';

export function toDomain(row: ReplacementRequestRow): ReplacementRequest {
  return ReplacementRequest.reconstitute({
    id: row.id, assignmentId: row.assignmentId, candidateMemberId: row.candidateMemberId,
    status: row.status, decidedByUserId: row.decidedByUserId,
    decidedAt: row.decidedAt, createdAt: row.createdAt,
  });
}
export function toInsert(r: ReplacementRequest): NewReplacementRequestRow {
  return {
    id: r.id, assignmentId: r.assignmentId, candidateMemberId: r.candidateMemberId,
    status: r.status, decidedByUserId: r.decidedByUserId,
    decidedAt: r.decidedAt, createdAt: r.createdAt,
  };
}
