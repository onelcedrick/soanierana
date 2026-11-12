import type { AssignmentRepository } from '../../domain/assignment/assignment.repository';
import type { MemberRepository } from '../../domain/member/member.repository';
import { ForbiddenError, NotFoundError } from '../../shared/errors';

export interface RespondAssignmentInput {
  assignmentId: string; memberId: string; accept: boolean;
}

export class RespondAssignmentUseCase {
  constructor(
    private readonly assignments: AssignmentRepository,
    private readonly members: MemberRepository,
  ) {}
  async execute(input: RespondAssignmentInput): Promise<{ id: string; status: string }> {
    const assignment = await this.assignments.findById(input.assignmentId);
    if (!assignment) throw new NotFoundError('Affectation');
    if (assignment.memberId !== input.memberId) throw new ForbiddenError('Affectation d un autre membre');
    if (input.accept) assignment.accept(); else assignment.decline();
    await this.assignments.update(assignment);
    return { id: assignment.id, status: assignment.status };
  }
}
