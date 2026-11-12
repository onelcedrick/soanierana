import type { PollRepository } from '../../domain/poll/poll.repository';
import { NotFoundError } from '../../shared/errors';

export class PublishPollUseCase {
  constructor(private readonly polls: PollRepository) {}
  async execute(pollId: string): Promise<{ id: string; status: string }> {
    const poll = await this.polls.findById(pollId);
    if (!poll) throw new NotFoundError('Sondage');
    poll.publish();
    await this.polls.update(poll);
    return { id: poll.id, status: poll.status };
  }
}
