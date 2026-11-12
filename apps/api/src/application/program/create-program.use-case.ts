import { Program, type ProgramFrequency } from '../../domain/program/program';
import type { ProgramRepository } from '../../domain/program/program.repository';
import type { ChurchRepository } from '../../domain/church/church.repository';
import { NotFoundError } from '../../shared/errors';

export interface CreateProgramInput {
  churchId: string; name: string; frequency: ProgramFrequency;
  dayOfWeek?: number | null; startTime?: string | null;
}
export interface CreateProgramOutput {
  id: string; churchId: string; name: string; frequency: ProgramFrequency;
}

export class CreateProgramUseCase {
  constructor(private readonly programs: ProgramRepository, private readonly churches: ChurchRepository) {}
  async execute(input: CreateProgramInput): Promise<CreateProgramOutput> {
    const church = await this.churches.findById(input.churchId);
    if (!church) throw new NotFoundError('Eglise');
    const program = Program.create(input);
    await this.programs.save(program);
    return { id: program.id, churchId: program.churchId, name: program.name, frequency: program.frequency };
  }
}
