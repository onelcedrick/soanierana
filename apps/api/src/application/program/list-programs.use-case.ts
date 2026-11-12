import type { ProgramRepository } from '../../domain/program/program.repository';

export class ListProgramsUseCase {
  constructor(private readonly programs: ProgramRepository) {}
  async execute(churchId: string) {
    const list = await this.programs.findByChurch(churchId);
    return list.map((p) => ({
      id: p.id,
      name: p.name,
      frequency: p.frequency,
      dayOfWeek: p.dayOfWeek,
    }));
  }
}
