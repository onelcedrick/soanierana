import type { SiteSettings } from './site-settings';

export interface SiteSettingsRepository {
  findByChurch(churchId: string): Promise<SiteSettings | null>;
  save(settings: SiteSettings): Promise<void>;
  update(settings: SiteSettings): Promise<void>;
}
