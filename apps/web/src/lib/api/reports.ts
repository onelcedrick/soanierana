import { apiFetch } from './client';

export interface Analytics {
  membersByStatus: Array<{ status: string; count: number }>;
  topParticipants: Array<{ name: string; count: number }>;
  attendance: { attended: number; absent: number; rate: number };
  eventsByProgram: Array<{ name: string; count: number }>;
}

export function getAnalytics(churchId: string, token: string): Promise<Analytics> {
  return apiFetch(`/reports/analytics?churchId=${churchId}`, { token });
}
