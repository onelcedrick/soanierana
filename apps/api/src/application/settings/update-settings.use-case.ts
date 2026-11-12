import type { SiteSettingsRepository } from '../../domain/settings/site-settings.repository';
import type { RotationStrategy } from '../../domain/settings/site-settings';
import { NotFoundError } from '../../shared/errors';

export interface UpdateSettingsInput {
  churchId: string;
  rotationStrategy: RotationStrategy;
  weightParticipation: number;
  weightRecency: number;
  weightAssignment: number;
  weightAvailability: number;
  weightSkill: number;
}

export class UpdateSettingsUseCase {
  constructor(private readonly repo: SiteSettingsRepository) {}
  async execute(input: UpdateSettingsInput): Promise<{ success: boolean }> {
    const settings = await this.repo.findByChurch(input.churchId);
    if (!settings) throw new NotFoundError('Parametres');
    
    settings.updateWeights(input);
    await this.repo.update(settings);
    return { success: true };
  }
}
