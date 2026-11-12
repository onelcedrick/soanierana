import { PollVote } from '../../domain/poll/poll-vote';
import type { PollRepository } from '../../domain/poll/poll.repository';
import { ConflictError, ForbiddenError, NotFoundError } from '../../shared/errors';

export interface CastMemberVoteInput {
  pollId: string; userId: string; optionIds: string[];
}

export class CastMemberVoteUseCase {
  constructor(private readonly polls: PollRepository) {}
  async execute(input: CastMemberVoteInput): Promise<{ pollId: string; votes: number }> {
    const poll = await this.polls.findById(input.pollId);
    if (!poll) throw new NotFoundError('Sondage');
    if (poll.audience !== 'MEMBERS_ONLY') throw new ForbiddenError('Ce vote est reserve aux membres');
    if (!poll.isOpen()) throw new ConflictError('Sondage ferme');
    if (!poll.isMultipleChoice && input.optionIds.length > 1) {
      throw new ForbiddenError('Un seul choix autorise');
    }
    const already = await this.polls.hasUserVoted(input.pollId, input.userId);
    if (already) throw new ConflictError('Vous avez deja vote');
    const options = await this.polls.findOptions(input.pollId);
    const validIds = new Set(options.map((o) => o.id));
    for (const id of input.optionIds) {
      if (!validIds.has(id)) throw new NotFoundError('Option');
    }
    for (const optionId of input.optionIds) {
      const vote = PollVote.create({ pollId: input.pollId, optionId, userId: input.userId });
      await this.polls.saveVote(vote);
    }
    return { pollId: input.pollId, votes: input.optionIds.length };
  }
}
