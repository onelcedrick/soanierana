import { apiFetch } from './client';

export interface Album {
  id: string;
  title: string;
  description: string | null;
  images: string[];
  createdAt: string;
}

export function listAlbums(churchId: string): Promise<Album[]> {
  return apiFetch<Album[]>(`/albums?churchId=${churchId}`);
}

export function createAlbum(input: { churchId: string, title: string, description?: string, images: string[] }, token: string): Promise<{ id: string }> {
  return apiFetch('/albums', { method: 'POST', body: input, token });
}

export function updateAlbum(id: string, input: { title?: string, description?: string, images?: string[] }, token: string): Promise<void> {
  return apiFetch(`/albums/${id}`, { method: 'PUT', body: input, token });
}

export function deleteAlbum(id: string, token: string): Promise<void> {
  return apiFetch(`/albums/${id}`, { method: 'DELETE', token });
}
