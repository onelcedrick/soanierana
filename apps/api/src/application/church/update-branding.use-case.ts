import type { ChurchRepository } from '../../domain/church/church.repository';
import { NotFoundError } from '../../shared/errors';

export class UpdateBrandingUseCase {
  constructor(private readonly churches: ChurchRepository) {}
  async execute(churchId: string, coverImageUrl?: string | null, logoUrl?: string | null): Promise<void> {
    const church = await this.churches.findById(churchId);
    if (!church) throw new NotFoundError('Eglise');
    church.updateBranding(coverImageUrl, logoUrl);
    await this.churches.update(church);
  }
}
