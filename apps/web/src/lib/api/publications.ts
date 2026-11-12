import { apiFetch } from './client';
import type { Publication } from './types';

export function listPublicPublications(churchId: string): Promise<Publication[]> {
  return apiFetch<Publication[]>(`/publications/public?churchId=${churchId}`);
}

export interface AdminPublication extends Publication {
  status: string;
  createdAt: string;
}

export function listAllPublications(churchId: string, token: string): Promise<AdminPublication[]> {
  return apiFetch<AdminPublication[]>(`/publications/all?churchId=${churchId}`, { token });
}

export function createPublication(input: {
  churchId: string; title: string; content: string; coverImageUrl?: string | null; audience: 'PUBLIC' | 'MEMBERS_ONLY';
}, token: string): Promise<{ id: string; status: string }> {
  return apiFetch('/publications', { method: 'POST', body: input, token });
}

export function updatePublication(id: string, input: {
  title?: string; content?: string; coverImageUrl?: string | null; audience?: 'PUBLIC' | 'MEMBERS_ONLY';
}, token: string): Promise<{ id: string }> {
  return apiFetch(`/publications/${id}`, { method: 'PUT', body: input, token });
}

export function deletePublication(id: string, token: string): Promise<void> {
  return apiFetch(`/publications/${id}`, { method: 'DELETE', token });
}

export function publishPublication(id: string, token: string): Promise<void> {
  return apiFetch(`/publications/${id}/publish`, { method: "POST", token });
}
