import type { TaskRepository } from '../../domain/task/task.repository';
import { NotFoundError } from '../../shared/errors';
import type { TaskEligibility, ResponsibilityLevel } from '../../domain/task/task';

export class UpdateTaskUseCase {
  constructor(private readonly tasks: TaskRepository) {}
  
  async execute(id: string, input: {
    name?: string; requiredPeople?: number;
    eligibilityMode?: TaskEligibility;
    minimumGrade?: ResponsibilityLevel | null;
  }) {
    const task = await this.tasks.findById(id);
    if (!task) throw new NotFoundError('Tache');
    
    // On utilise les setters publics ou on recrée l'entité avec les nouvelles valeurs
    // Pour simplifier, on utilise une méthode "update" si elle existe, sinon on force
    (task as any)._name = input.name || task.name;
    (task as any)._requiredPeople = input.requiredPeople || task.requiredPeople;
    (task as any)._eligibilityMode = input.eligibilityMode || task.eligibilityMode;
    (task as any)._minimumGrade = input.minimumGrade !== undefined ? input.minimumGrade : task.minimumGrade;
    (task as any)._updatedAt = new Date();
    
    await this.tasks.update(task);
    return { success: true };
  }
}
