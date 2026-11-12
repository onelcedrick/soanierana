import type { PollRepository } from '../../domain/poll/poll.repository';
import { NotFoundError } from '../../shared/errors';

export class ClosePollUseCase {
  constructor(private readonly polls: PollRepository) {}
  async execute(pollId: string): Promise<{ id: string; status: string }> {
    const poll = await this.polls.findById(pollId);
    if (!poll) throw new NotFoundError('Sondage');
    
    try {
      poll.close();
    } catch (err) {
      throw new Error(`Impossible de clôturer : ${err instanceof Error ? err.message : 'Erreur inconnue'}`);
    }

    await this.polls.update(poll);
    return { id: poll.id, status: poll.status };
  }
}
