import { EventCategory } from '../../domain/publication/event-category';
import type { EventCategoryRepository } from '../../domain/publication/event-category.repository';
import type { ChurchRepository } from '../../domain/church/church.repository';
import { NotFoundError } from '../../shared/errors';

export class CreateCategoryUseCase {
  constructor(private readonly cats: EventCategoryRepository, private readonly churches: ChurchRepository) {}
  async execute(input: { churchId: string; name: string }): Promise<{ id: string; name: string }> {
    const church = await this.churches.findById(input.churchId);
    if (!church) throw new NotFoundError('Eglise');
    const cat = EventCategory.create(input);
    await this.cats.save(cat);
    return { id: cat.id, name: cat.name };
  }
}
