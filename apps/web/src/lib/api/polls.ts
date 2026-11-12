import { apiFetch } from './client';

export interface AdminPoll {
  id: string; title: string; audience: string; status: string; opensAt: string; closesAt: string;
}

export interface PublicPoll {
  id: string; title: string; status: string; audience?: string;
  hasVoted?: boolean; opensAt: string; closesAt: string;
  options: Array<{ id: string; label: string }>;
}

export interface PollReport {
  poll: { id: string; title: string; isAnonymous: boolean; status: string };
  totals: Array<{ label: string; count: number }>;
  detailedVotes: Array<{ voterName: string | null; voterEmail: string | null; optionLabel: string }>;
}

export function listPublicPolls(churchId: string, token?: string | null): Promise<PublicPoll[]> {
  return apiFetch<PublicPoll[]>(`/polls/public?churchId=${churchId}`, { token });
}

export function listAllPolls(churchId: string, token: string): Promise<AdminPoll[]> {
  return apiFetch<AdminPoll[]>(`/polls/all?churchId=${churchId}`, { token });
}

export function createPoll(input: {
  churchId: string; title: string; description?: string | null;
  audience: 'PUBLIC' | 'MEMBERS_ONLY'; opensAt: string; closesAt: string;
  options: string[]; isAnonymous?: boolean;
}, token: string): Promise<{ id: string }> {
  return apiFetch('/polls', { method: 'POST', body: input, token });
}

export function publishPoll(id: string, token: string): Promise<void> {
  return apiFetch(`/polls/${id}/publish`, { method: 'POST', token });
}

export function closePoll(id: string, token: string): Promise<void> {
  return apiFetch(`/polls/${id}/close`, { method: 'POST', token });
}

export function deletePoll(id: string, token: string): Promise<void> {
  return apiFetch(`/polls/${id}`, { method: 'DELETE', token });
}

export function castPublicVote(pollId: string, token: string, optionIds: string[], authToken?: string | null): Promise<void> {
  return apiFetch(`/polls/${pollId}/public-vote`, { method: 'POST', body: { token, optionIds }, token: authToken });
}

export function castMemberVote(pollId: string, optionIds: string[], token: string): Promise<void> {
  return apiFetch(`/polls/${pollId}/vote`, { method: 'POST', body: { optionIds }, token });
}

export function getPollReport(pollId: string, token: string): Promise<PollReport> {
  return apiFetch<PollReport>(`/polls/${pollId}/report`, { token });
}

export function downloadPollReport(pollId: string, token: string): Promise<Blob> {
  return fetch(`http://localhost:3000/api/polls/${pollId}/export`, {
    headers: { Authorization: `Bearer ${token}` }
  }).then(res => res.blob());
}
