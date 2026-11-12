import { Assignment } from '../../../domain/assignment/assignment';
import type { AssignmentRow, NewAssignmentRow } from '../schema/assignment.table';

export function toDomain(row: AssignmentRow): Assignment {
  return Assignment.reconstitute({
    id: row.id, sessionId: row.sessionId, taskId: row.taskId, memberId: row.memberId,
    status: row.status, justification: row.justification,
    proposedAt: row.proposedAt, respondedAt: row.respondedAt, updatedAt: row.updatedAt,
  });
}
export function toInsert(a: Assignment): NewAssignmentRow {
  return {
    id: a.id, sessionId: a.sessionId, taskId: a.taskId, memberId: a.memberId,
    status: a.status, justification: a.justification,
    proposedAt: a.proposedAt, respondedAt: a.respondedAt, updatedAt: a.updatedAt,
  };
}
