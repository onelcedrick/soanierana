import { apiFetch } from './client';

export interface Event {
  id: string; title: string; description: string | null;
  startDate: string; endDate: string | null; location: string | null;
  coverImageUrl: string | null;
}

export function listEvents(churchId: string, upcomingOnly = false): Promise<Event[]> {
  return apiFetch(`/events?churchId=${churchId}&upcoming=${upcomingOnly}`);
}

export function createEvent(input: {
  churchId: string; title: string; description?: string | null;
  startDate: string; endDate?: string | null; location?: string | null;
  coverImageUrl?: string | null;
}, token: string): Promise<{ id: string }> {
  return apiFetch('/events', { method: 'POST', body: input, token });
}
