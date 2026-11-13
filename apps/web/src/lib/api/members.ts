import { PUBLIC_API_URL } from '$env/static/public';
import { apiFetch } from './client';
import type { Member } from './types';

export interface AdminMember extends Member {
  isActive: boolean;
}

export interface MemberProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  membershipStatus: string;
  responsibilityLevel: string;
  isActive: boolean;
}

export function listMembers(churchId: string, token: string): Promise<AdminMember[]> {
  return apiFetch<AdminMember[]>('/members?churchId=' + churchId, { token });
}

export function getMyProfile(token: string): Promise<MemberProfile> {
  return apiFetch<MemberProfile>('/members/me', { token });
}

export function createMember(input: Omit<Member, 'id'>, token: string): Promise<Member> {
  return apiFetch<Member>('/members', { method: 'POST', body: input, token });
}

export function createMemberAccount(memberId: string, password: string, token: string): Promise<{ userId: string }> {
  return apiFetch('/members/create-account', { method: 'POST', body: { memberId, password }, token });
}

export function assignSkill(memberId: string, skillId: string, token: string): Promise<void> {
  return apiFetch('/members/assign-skill', { method: 'POST', body: { memberId, skillId }, token });
}

export function exportMembers(churchId: string, token: string): Promise<Blob> {
  return fetch(`${PUBLIC_API_URL}/members/export?churchId=` + churchId, {
    headers: { Authorization: 'Bearer ' + token }
  }).then(res => res.blob());
}
