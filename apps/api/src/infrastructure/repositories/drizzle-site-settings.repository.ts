import { eq } from 'drizzle-orm';
import type { SiteSettings } from '../../domain/settings/site-settings';
import type { SiteSettingsRepository } from '../../domain/settings/site-settings.repository';
import type { Db } from '../database/client';
import { siteSettings } from '../database/schema/site-settings.table';
import { toDomain, toInsert } from '../database/mappers/site-settings.mapper';

export class DrizzleSiteSettingsRepository implements SiteSettingsRepository {
  constructor(private readonly db: Db) {}

  async findByChurch(churchId: string): Promise<SiteSettings | null> {
    const [row] = await this.db.select().from(siteSettings).where(eq(siteSettings.churchId, churchId)).limit(1);
    return row ? toDomain(row) : null;
  }
  async save(settings: SiteSettings): Promise<void> { await this.db.insert(siteSettings).values(toInsert(settings)); }
  async update(settings: SiteSettings): Promise<void> {
    await this.db.update(siteSettings).set(toInsert(settings)).where(eq(siteSettings.id, settings.id));
  }
}
