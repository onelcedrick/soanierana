import type { ChurchRepository } from '../../domain/church/church.repository';
import { NotFoundError } from '../../shared/errors';

export class UpdateThemeUseCase {
  constructor(private readonly churches: ChurchRepository) {}
  async execute(churchId: string, themeConfig: any): Promise<void> {
    const church = await this.churches.findById(churchId);
    if (!church) throw new NotFoundError('Eglise');
    church.updateTheme(themeConfig);
    await this.churches.update(church);
  }
}
