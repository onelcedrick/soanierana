import type { AssignmentRepository } from '../../domain/assignment/assignment.repository';
import { NotFoundError } from '../../shared/errors';

export interface ConfirmAttendanceInput { assignmentId: string; attended: boolean; }

export class ConfirmAttendanceUseCase {
  constructor(private readonly assignments: AssignmentRepository) {}
  async execute(input: ConfirmAttendanceInput): Promise<{ id: string; status: string }> {
    const a = await this.assignments.findById(input.assignmentId);
    if (!a) throw new NotFoundError('Affectation');
    if (input.attended) a.markAttended(); else a.markAbsent();
    await this.assignments.update(a);
    return { id: a.id, status: a.status };
  }
}
