import { apiFetch } from './client';

export interface AdminMessage {
  id: string;
  senderName: string;
  subject: string;
  content: string;
  isAnonymous: boolean;
  isRead: boolean;
  createdAt: string;
}

export function sendMessage(input: { subject: string, content: string, isAnonymous: boolean }, token: string): Promise<{ id: string }> {
  return apiFetch('/messages', { method: 'POST', body: input, token });
}

export function getAdminMessages(token: string): Promise<AdminMessage[]> {
  return apiFetch('/messages', { token });
}

export function markMessageRead(id: string, token: string): Promise<{ success: boolean }> {
  return apiFetch(`/messages/${id}/read`, { method: 'PATCH', token });
}
