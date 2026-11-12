import type { ReplacementRequestRepository } from '../../domain/assignment/replacement-request.repository';
import type { AssignmentRepository } from '../../domain/assignment/assignment.repository';
import type { MemberRepository } from '../../domain/member/member.repository';
import { Assignment } from '../../domain/assignment/assignment';
import { NotFoundError } from '../../shared/errors';

export interface DecideReplacementInput {
  replacementId: string; userId: string; approve: boolean;
}

export class DecideReplacementUseCase {
  constructor(
    private readonly requests: ReplacementRequestRepository,
    private readonly assignments: AssignmentRepository,
    private readonly members: MemberRepository,
  ) {}
  async execute(input: DecideReplacementInput): Promise<{ replacementStatus: string; newAssignmentId: string | null }> {
    const req = await this.requests.findById(input.replacementId);
    if (!req) throw new NotFoundError('Demande de remplacement');
    if (input.approve) req.approve(input.userId); else req.reject(input.userId);
    await this.requests.update(req);

    let newAssignmentId: string | null = null;
    if (input.approve) {
      const original = await this.assignments.findById(req.assignmentId);
      if (!original) throw new NotFoundError('Affectation originale');
      original.markReplaced();
      await this.assignments.update(original);

      const newA = Assignment.propose({
        sessionId: original.sessionId,
        taskId: original.taskId,
        memberId: req.candidateMemberId,
        justification: `Remplacement de ${original.memberId}`,
      });
      await this.assignments.save(newA);
      newAssignmentId = newA.id;
    }
    return { replacementStatus: req.status, newAssignmentId };
  }
}
