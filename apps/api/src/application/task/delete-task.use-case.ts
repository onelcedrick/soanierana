import type { TaskRepository } from '../../domain/task/task.repository';
import { NotFoundError } from '../../shared/errors';

export class DeleteTaskUseCase {
  constructor(private readonly tasks: TaskRepository) {}
  async execute(id: string) {
    const task = await this.tasks.findById(id);
    if (!task) throw new NotFoundError('Tache');
    await this.tasks.delete(id);
    return { success: true };
  }
}
