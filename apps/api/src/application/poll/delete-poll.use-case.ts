import type { PollRepository } from '../../domain/poll/poll.repository';
import { NotFoundError } from '../../shared/errors';

export class DeletePollUseCase {
  constructor(private readonly polls: PollRepository) {}
  async execute(id: string): Promise<void> {
    const poll = await this.polls.findById(id);
    if (!poll) throw new NotFoundError('Sondage');
    await this.polls.delete(id);
  }
}
