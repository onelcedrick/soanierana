import { apiFetch } from './client';

export interface Program { id: string; name: string; frequency: string; dayOfWeek: number | null; }
export interface Task { id: string; name: string; requiredPeople: number; eligibilityMode: string; minimumGrade: string | null; exactGrade: string | null; allowedMembershipStatuses?: string[]; }
export interface SessionAssignment { id: string; task: string; member: string; status: string; }

export function listPrograms(churchId: string): Promise<Program[]> {
  return apiFetch<Program[]>(`/programs?churchId=${churchId}`);
}

export function createProgram(input: { churchId: string; name: string; frequency: string; dayOfWeek?: number }, token: string): Promise<Program> {
  return apiFetch('/programs', { method: 'POST', body: input, token });
}

export function deleteProgram(id: string, token: string): Promise<void> {
  return apiFetch(`/programs/${id}`, { method: 'DELETE', token });
}

export function listTasks(programId: string): Promise<Task[]> {
  return apiFetch<Task[]>(`/tasks?programId=${programId}`);
}

export function createTask(input: {
  programId: string; name: string; requiredPeople: number;
  eligibilityMode: string; minimumGrade?: string | null; allowedMembershipStatuses?: string[];
}, token: string): Promise<Task> {
  return apiFetch('/tasks', { method: 'POST', body: input, token });
}

export function updateTask(id: string, input: any, token: string): Promise<void> {
  return apiFetch(`/tasks/${id}`, { method: 'PUT', body: input, token });
}

export function deleteTask(id: string, token: string): Promise<void> {
  return apiFetch(`/tasks/${id}`, { method: 'DELETE', token });
}

export function createSession(input: { programId: string; date: string }, token: string): Promise<{ id: string }> {
  return apiFetch('/program-sessions', { method: 'POST', body: input, token });
}

export function generateAssignments(sessionId: string, token: string): Promise<{ assigned: number; unassigned: number }> {
  return apiFetch(`/program-sessions/${sessionId}/generate-assignments`, { method: 'POST', token });
}

export function getSessionAssignments(sessionId: string, token: string): Promise<SessionAssignment[]> {
  return apiFetch(`/program-sessions/${sessionId}/assignments`, { token });
}

export function publishSession(sessionId: string, token: string): Promise<void> {
  return apiFetch(`/program-sessions/${sessionId}/publish`, { method: 'POST', token });
}
