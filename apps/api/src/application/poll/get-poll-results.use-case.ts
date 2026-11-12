import type { PollRepository, PollResultRow } from '../../domain/poll/poll.repository';
import { NotFoundError } from '../../shared/errors';

export class GetPollResultsUseCase {
  constructor(private readonly polls: PollRepository) {}
  async execute(pollId: string): Promise<{ pollId: string; results: PollResultRow[]; visible: boolean }> {
    const poll = await this.polls.findById(pollId);
    if (!poll) throw new NotFoundError('Sondage');
    const visible = poll.canSeeResults();
    if (!visible) {
      return { pollId, results: [], visible: false };
    }
    const results = await this.polls.countVotesByOption(pollId);
    return { pollId, results, visible: true };
  }
}
