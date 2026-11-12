import { ProgramSession } from '../../domain/program/program-session';
import type { ProgramSessionRepository } from '../../domain/program/program-session.repository';
import type { ProgramRepository } from '../../domain/program/program.repository';
import { NotFoundError } from '../../shared/errors';

export interface CreateSessionInput { programId: string; date: string; }
export interface CreateSessionOutput { id: string; programId: string; date: string; }

export class CreateSessionUseCase {
  constructor(
    private readonly sessions: ProgramSessionRepository,
    private readonly programs: ProgramRepository,
  ) {}
  async execute(input: CreateSessionInput): Promise<CreateSessionOutput> {
    const program = await this.programs.findById(input.programId);
    if (!program) throw new NotFoundError('Programme');
    const session = ProgramSession.create({ programId: input.programId, date: new Date(input.date) });
    await this.sessions.save(session);
    return { id: session.id, programId: session.programId, date: session.date.toISOString() };
  }
}
