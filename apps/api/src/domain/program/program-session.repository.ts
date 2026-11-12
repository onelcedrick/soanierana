import type { ProgramSession } from './program-session';

export interface ProgramSessionRepository {
  findById(id: string): Promise<ProgramSession | null>;
  findByProgram(programId: string): Promise<ProgramSession[]>;
  save(session: ProgramSession): Promise<void>;
  update(session: ProgramSession): Promise<void>;
  delete(id: string): Promise<void>;
}
