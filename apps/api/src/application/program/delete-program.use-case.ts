import type { ProgramRepository } from '../../domain/program/program.repository';
import { NotFoundError } from '../../shared/errors';

export class DeleteProgramUseCase {
  constructor(private readonly programs: ProgramRepository) {}
  async execute(id: string) {
    const program = await this.programs.findById(id);
    if (!program) throw new NotFoundError('Programme');
    await this.programs.delete(id);
    return { success: true };
  }
}
