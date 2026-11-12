import type { PollRepository } from '../../domain/poll/poll.repository';
import { NotFoundError } from '../../shared/errors';

export class GetPollReportUseCase {
  constructor(private readonly polls: PollRepository) {}
  async execute(pollId: string) {
    const poll = await this.polls.findById(pollId);
    if (!poll) throw new NotFoundError('Sondage');

    const totals = await this.polls.countVotesByOption(pollId);
    const detailedVotes = await this.polls.getDetailedVotes(pollId);

    return {
      poll: { id: poll.id, title: poll.title, isAnonymous: poll.isAnonymous, status: poll.status },
      totals,
      detailedVotes: poll.isAnonymous ? [] : detailedVotes // On ne renvoie pas les noms si anonyme
    };
  }
}
