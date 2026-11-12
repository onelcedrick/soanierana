import { apiFetch } from './client';

export interface AuditLog {
  id: string; actorId: string; action: string; module: string;
  description: string; severity: 'INFO' | 'WARNING' | 'CRITICAL';
  createdAt: string;
}

export interface AuditResponse {
  data: AuditLog[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}

export function listLogs(churchId: string, token: string, page = 1, severity?: string): Promise<AuditResponse> {
  let url = `/logs?churchId=${churchId}&page=${page}`;
  if (severity) url += `&severity=${severity}`;
  return apiFetch<AuditResponse>(url, { token });
}
