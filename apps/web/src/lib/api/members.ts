import { apiFetch } from './client';

export interface AdminMember {
  id: string;
  churchId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  photoUrl?: string | null;
  membershipStatus: string;
  responsibilityLevel: string;
  isActive: boolean;
}

export function listMembers(churchId: string, token: string): Promise<AdminMember[]> {
  return apiFetch(`/members?churchId=${churchId}`, { token });
}

export function createMember(input: any, token: string): Promise<{ id: string }> {
  return apiFetch('/members', { method: 'POST', body: input, token });
}

export function updateMember(id: string, input: any, token: string): Promise<void> {
  return apiFetch(`/members/${id}`, { method: 'PUT', body: input, token });
}

export function deleteMember(id: string, token: string): Promise<void> {
  return apiFetch(`/members/${id}`, { method: 'DELETE', token });
}

export function createMemberAccount(memberId: string, password: string, token: string): Promise<void> {
  return apiFetch(`/members/${memberId}/create-account`, { method: 'POST', body: { password }, token });
}

export function getMyProfile(token: string): Promise<AdminMember> {
  return apiFetch('/members/me', { token });
}

export async function exportMembers(churchId: string, token: string): Promise<Blob> {
  const res = await fetch(`http://localhost:3000/api/members/export?churchId=${churchId}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.blob();
}
