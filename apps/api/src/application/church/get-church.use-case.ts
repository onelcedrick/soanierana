import { NotFoundError } from '../../shared/errors';
import type { ChurchRepository } from '../../domain/church/church.repository';

export interface GetChurchOutput {
  id: string; name: string; city: string; country: string; createdAt: string;
}

export class GetChurchUseCase {
  constructor(private readonly churches: ChurchRepository) {}

  async execute(id: string): Promise<GetChurchOutput> {
    const church = await this.churches.findById(id);
    if (!church) throw new NotFoundError('Eglise');
    return {
      id: church.id, name: church.name, city: church.city,
      country: church.country, createdAt: church.createdAt.toISOString(),
    };
  }
}
