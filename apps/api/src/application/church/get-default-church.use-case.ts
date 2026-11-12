import type { ChurchRepository } from '../../domain/church/church.repository';
import { NotFoundError } from '../../shared/errors';

export class GetDefaultChurchUseCase {
  constructor(private readonly churches: ChurchRepository) {}
  async execute() {
    const all = await this.churches.findAll();
    if (all.length === 0) throw new NotFoundError('Eglise');
    return all[0]!;
  }
}
