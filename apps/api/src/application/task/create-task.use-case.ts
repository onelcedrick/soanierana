import { Task, type TaskEligibility, type ResponsibilityLevel } from '../../domain/task/task';
import type { TaskRepository } from '../../domain/task/task.repository';
import type { ProgramRepository } from '../../domain/program/program.repository';
import { NotFoundError } from '../../shared/errors';

export interface CreateTaskInput {
  programId: string; name: string; description?: string | null; requiredPeople?: number;
  eligibilityMode?: TaskEligibility;
  minimumGrade?: ResponsibilityLevel | null;
  exactGrade?: ResponsibilityLevel | null;
}

export class CreateTaskUseCase {
  constructor(private readonly tasks: TaskRepository, private readonly programs: ProgramRepository) {}
  async execute(input: CreateTaskInput) {
    const program = await this.programs.findById(input.programId);
    if (!program) throw new NotFoundError('Programme');
    const task = Task.create(input);
    await this.tasks.save(task);
    return { id: task.id };
  }
}
