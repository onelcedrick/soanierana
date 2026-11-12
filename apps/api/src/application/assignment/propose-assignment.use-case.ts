import { Assignment } from '../../domain/assignment/assignment';
import type { AssignmentRepository } from '../../domain/assignment/assignment.repository';
import type { MemberRepository } from '../../domain/member/member.repository';
import type { TaskRepository } from '../../domain/task/task.repository';
import type { ProgramSessionRepository } from '../../domain/program/program-session.repository';
import { NotFoundError } from '../../shared/errors';

export interface ProposeAssignmentInput {
  sessionId: string; taskId: string; memberId: string; justification?: string | null;
}
export interface ProposeAssignmentOutput { id: string; status: string; }

export class ProposeAssignmentUseCase {
  constructor(
    private readonly assignments: AssignmentRepository,
    private readonly members: MemberRepository,
    private readonly tasks: TaskRepository,
    private readonly sessions: ProgramSessionRepository,
  ) {}
  async execute(input: ProposeAssignmentInput): Promise<ProposeAssignmentOutput> {
    const session = await this.sessions.findById(input.sessionId);
    if (!session) throw new NotFoundError('Session');
    const task = await this.tasks.findById(input.taskId);
    if (!task) throw new NotFoundError('Tache');
    const member = await this.members.findById(input.memberId);
    if (!member) throw new NotFoundError('Membre');
    if (!member.isActive) throw new NotFoundError('Membre actif');
    const a = Assignment.propose(input);
    await this.assignments.save(a);
    return { id: a.id, status: a.status };
  }
}
