import { apiFetch } from './client';

export interface DashboardStats {
  members: number;
  events: number;
  polls: number;
  tasks: number;
  recentLogs: Array<{ id: string; action: string; description: string; severity: string; created_at: string }>;
}

export function getDashboardStats(churchId: string, token: string): Promise<DashboardStats> {
  return apiFetch<DashboardStats>(`/dashboard/stats?churchId=${churchId}`, { token });
}
