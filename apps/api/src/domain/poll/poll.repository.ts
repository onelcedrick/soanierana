import type { Poll } from './poll';
import type { PollOption } from './poll-option';
import type { PollVote } from './poll-vote';

export interface PollResultRow { optionId: string; label: string; count: number; }
export interface PollParticipation { id: string; pollId: string; token: string; }
export interface DetailedVoteRow { 
  optionId: string; 
  optionLabel: string; 
  voterName: string | null; 
  voterEmail: string | null; 
}

export interface PollRepository {
  findById(id: string): Promise<Poll | null>;
  findByChurch(churchId: string): Promise<Poll[]>;
  save(poll: Poll): Promise<void>;
  update(poll: Poll): Promise<void>;
  delete(id: string): Promise<void>;

  findOptions(pollId: string): Promise<PollOption[]>;
  saveOption(option: PollOption): Promise<void>;

  findOrCreateParticipation(pollId: string, token: string): Promise<PollParticipation>;
  hasUserVoted(pollId: string, userId: string): Promise<boolean>;
  saveVote(vote: PollVote): Promise<void>;

  countVotesByOption(pollId: string): Promise<PollResultRow[]>;
  getDetailedVotes(pollId: string): Promise<DetailedVoteRow[]>; // <-- Nouveau
}
