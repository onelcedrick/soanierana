import { apiFetch } from './client';

export interface Event {
  id: string;
  churchId: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string | null;
  location: string;
  coverImageUrl: string | null;
  status: string;
  createdAt: string;
}

export async function listEvents(churchId: string, upcomingOnly: boolean = false): Promise<Event[]> {
  return apiFetch(`/events?churchId=${churchId}&upcoming=${upcomingOnly}`);
}

export async function createEvent(data: any, token: string): Promise<{ id: string }> {
  return apiFetch('/events', { method: 'POST', body: data, token });
}

export async function updateEvent(id: string, data: any, token: string): Promise<void> {
  return apiFetch(`/events/${id}`, { method: 'PUT', body: data, token });
}

export async function deleteEvent(id: string, token: string): Promise<void> {
  return apiFetch(`/events/${id}`, { method: 'DELETE', token });
}
