import { apiFetch } from './client';

export interface Skill { id: string; name: string; }

export function listSkills(churchId: string): Promise<Skill[]> {
  return apiFetch<Skill[]>(`/skills?churchId=${churchId}`);
}

export function createSkill(churchId: string, name: string, token: string): Promise<Skill> {
  return apiFetch('/skills', { method: 'POST', body: { churchId, name }, token });
}
