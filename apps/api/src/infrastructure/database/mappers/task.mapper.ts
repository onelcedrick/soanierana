import { Task } from '../../../domain/task/task';
import type { TaskRow, NewTaskRow } from '../schema/task.table';

export function toDomain(row: TaskRow): Task {
  return Task.reconstitute({
    id: row.id, programId: row.programId, name: row.name, description: row.description,
    requiredPeople: row.requiredPeople, eligibilityMode: row.eligibilityMode,
    minimumGrade: row.minimumGrade as any, exactGrade: row.exactGrade as any,
    allowedMembershipStatuses: (row.allowedMembershipStatuses as any) || ['LOCAL_BAPTIZED', 'EXTERNAL_BAPTIZED', 'UNBAPTIZED'],
    isActive: row.isActive, createdAt: row.createdAt, updatedAt: row.updatedAt,
  });
}
export function toInsert(t: Task): NewTaskRow {
  return {
    id: t.id, programId: t.programId, name: t.name, description: t.description,
    requiredPeople: t.requiredPeople, eligibilityMode: t.eligibilityMode,
    minimumGrade: t.minimumGrade as any, exactGrade: t.exactGrade as any,
    allowedMembershipStatuses: t.allowedMembershipStatuses,
    isActive: t.isActive, createdAt: t.createdAt, updatedAt: t.updatedAt,
  };
}
