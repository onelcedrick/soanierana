import { SiteSettings } from '../../../domain/settings/site-settings';
import type { SiteSettingsRow, NewSiteSettingsRow } from '../schema/site-settings.table';

export function toDomain(row: SiteSettingsRow): SiteSettings {
  return SiteSettings.reconstitute({
    id: row.id, churchId: row.churchId, rotationStrategy: row.rotationStrategy,
    rotationCycleWeeks: row.rotationCycleWeeks,
    weightParticipation: row.weightParticipation, weightRecency: row.weightRecency,
    weightAssignment: row.weightAssignment, weightAvailability: row.weightAvailability,
    weightSkill: row.weightSkill, updatedAt: row.updatedAt,
  });
}
export function toInsert(s: SiteSettings): NewSiteSettingsRow {
  return {
    id: s.id, churchId: s.churchId, rotationStrategy: s.rotationStrategy,
    rotationCycleWeeks: s.rotationCycleWeeks,
    weightParticipation: s.weightParticipation, weightRecency: s.weightRecency,
    weightAssignment: s.weightAssignment, weightAvailability: s.weightAvailability,
    weightSkill: s.weightSkill, updatedAt: s.updatedAt,
  };
}
