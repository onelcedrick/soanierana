import { ReplacementRequest } from '../../domain/assignment/replacement-request';
import type { ReplacementRequestRepository } from '../../domain/assignment/replacement-request.repository';
import type { AssignmentRepository } from '../../domain/assignment/assignment.repository';
import type { MemberRepository } from '../../domain/member/member.repository';
import { NotFoundError } from '../../shared/errors';

export interface RequestReplacementInput { assignmentId: string; candidateMemberId: string; }

export class RequestReplacementUseCase {
  constructor(
    private readonly requests: ReplacementRequestRepository,
    private readonly assignments: AssignmentRepository,
    private readonly members: MemberRepository,
  ) {}
  async execute(input: RequestReplacementInput): Promise<{ id: string; status: string }> {
    const a = await this.assignments.findById(input.assignmentId);
    if (!a) throw new NotFoundError('Affectation');
    const candidate = await this.members.findById(input.candidateMemberId);
    if (!candidate) throw new NotFoundError('Candidat');
    const req = ReplacementRequest.create(input);
    await this.requests.save(req);
    return { id: req.id, status: req.status };
  }
}
