import { SiteSettings } from '../../domain/settings/site-settings';
import type { SiteSettingsRepository } from '../../domain/settings/site-settings.repository';

export class GetSettingsUseCase {
  constructor(private readonly repo: SiteSettingsRepository) {}
  async execute(churchId: string): Promise<SiteSettings> {
    let settings = await this.repo.findByChurch(churchId);
    if (!settings) {
      settings = SiteSettings.createDefault(churchId);
      await this.repo.save(settings);
    }
    return settings;
  }
}
