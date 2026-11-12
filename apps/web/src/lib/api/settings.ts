import { apiFetch } from './client';

export interface SiteSettings {
  rotationStrategy: 'FAIR_ROTATION' | 'ROUND_ROBIN' | 'LEAST_ASSIGNED';
  rotationCycleWeeks: number;
  weightParticipation: number;
  weightRecency: number;
  weightAssignment: number;
  weightAvailability: number;
  weightSkill: number;
}

export function getSettings(churchId: string, token: string): Promise<SiteSettings> {
  return apiFetch(`/settings?churchId=${churchId}`, { token });
}

export function updateSettings(churchId: string, input: SiteSettings, token: string): Promise<{ success: boolean }> {
  return apiFetch(`/settings?churchId=${churchId}`, { method: 'PUT', body: input, token });
}

export function updateChurchBranding(churchId: string, input: { coverImageUrl?: string | null, logoUrl?: string | null }, token: string): Promise<{ success: boolean }> {
  return apiFetch(`/churches/${churchId}/branding`, { method: 'PUT', body: input, token });
}
