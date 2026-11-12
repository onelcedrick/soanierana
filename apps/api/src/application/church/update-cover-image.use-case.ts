import type { ChurchRepository } from '../../domain/church/church.repository';
import { NotFoundError } from '../../shared/errors';

export class UpdateCoverImageUseCase {
  constructor(private readonly churches: ChurchRepository) {}
  async execute(churchId: string, imageUrl: string | null): Promise<void> {
    const church = await this.churches.findById(churchId);
    if (!church) throw new NotFoundError('Eglise');
    church.updateCoverImage(imageUrl);
    await this.churches.update(church);
  }
}
