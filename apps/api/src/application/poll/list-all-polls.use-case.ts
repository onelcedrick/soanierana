import type { PollRepository } from '../../domain/poll/poll.repository';

export class ListAllPollsUseCase {
  constructor(private readonly polls: PollRepository) {}
  async execute(churchId: string) {
    const list = await this.polls.findByChurch(churchId);
    return list.map((p) => ({
      id: p.id,
      title: p.title,
      audience: p.audience,
      status: p.status,
      opensAt: p.opensAt.toISOString(),
      closesAt: p.closesAt.toISOString(),
    }));
  }
}
