import { PollVote } from '../../domain/poll/poll-vote';
import type { PollRepository } from '../../domain/poll/poll.repository';
import { ConflictError, ForbiddenError, NotFoundError } from '../../shared/errors';

export interface CastPublicVoteInput {
  pollId: string;
  token: string;
  optionIds: string[];
  userId?: string | null; // Si présent ET sondage non-anonyme
}

export class CastPublicVoteUseCase {
  constructor(private readonly polls: PollRepository) {}
  
  async execute(input: CastPublicVoteInput): Promise<{ pollId: string; votes: number }> {
    const poll = await this.polls.findById(input.pollId);
    if (!poll) throw new NotFoundError('Sondage');
    if (poll.audience !== 'PUBLIC') throw new ForbiddenError('Ce vote est reserve aux membres');
    if (!poll.isOpen()) throw new ConflictError('Sondage ferme');
    if (!poll.isMultipleChoice && input.optionIds.length > 1) {
      throw new ForbiddenError('Un seul choix autorise');
    }

    const options = await this.polls.findOptions(input.pollId);
    const validIds = new Set(options.map((o) => o.id));
    for (const id of input.optionIds) if (!validIds.has(id)) throw new NotFoundError('Option');

    const participation = await this.polls.findOrCreateParticipation(input.pollId, input.token);

    // Si le sondage est anonyme, on force userId à null
    const finalUserId = poll.isAnonymous ? null : (input.userId ?? null);
    
    // Si non-anonyme ET connecté, on vérifie qu'il n'a pas déjà voté
    if (!poll.isAnonymous && finalUserId) {
      const alreadyVoted = await this.polls.hasUserVoted(input.pollId, finalUserId);
      if (alreadyVoted) throw new ConflictError('Vous avez deja vote a ce sondage');
    }

    for (const optionId of input.optionIds) {
      const vote = PollVote.create({
        pollId: input.pollId,
        optionId,
        participationId: participation.id, // Toujours lié au token
        userId: finalUserId, // null si anonyme
      });
      await this.polls.saveVote(vote);
    }
    return { pollId: input.pollId, votes: input.optionIds.length };
  }
}
