import { Poll, type PollAudience } from '../../domain/poll/poll';
import { PollOption } from '../../domain/poll/poll-option';
import type { PollRepository } from '../../domain/poll/poll.repository';
import type { ChurchRepository } from '../../domain/church/church.repository';
import { NotFoundError } from '../../shared/errors';

export interface CreatePollInput {
  churchId: string; title: string; description?: string | null;
  audience: PollAudience; isAnonymous?: boolean; isMultipleChoice?: boolean;
  opensAt: string; closesAt: string; showResultsBeforeClose?: boolean;
  options: string[];
}
export interface CreatePollOutput {
  id: string; churchId: string; status: string; optionCount: number;
}

export class CreatePollUseCase {
  constructor(private readonly polls: PollRepository, private readonly churches: ChurchRepository) {}
  async execute(input: CreatePollInput): Promise<CreatePollOutput> {
    const church = await this.churches.findById(input.churchId);
    if (!church) throw new NotFoundError('Eglise');
    if (!input.options || input.options.length < 2) {
      throw new Error('Au moins 2 options requises');
    }
    const poll = Poll.create({
      churchId: input.churchId,
      title: input.title,
      description: input.description ?? null,
      audience: input.audience,
      isAnonymous: input.isAnonymous ?? false,
      isMultipleChoice: input.isMultipleChoice ?? false,
      opensAt: new Date(input.opensAt),
      closesAt: new Date(input.closesAt),
      showResultsBeforeClose: input.showResultsBeforeClose ?? false,
    });
    
    // On le publie immédiatement à la création
    poll.publish();
    
    await this.polls.save(poll);
    
    for (let i = 0; i < input.options.length; i++) {
      const opt = PollOption.create({ pollId: poll.id, label: input.options[i]!, position: i });
      await this.polls.saveOption(opt);
    }
    return { id: poll.id, churchId: poll.churchId, status: poll.status, optionCount: input.options.length };
  }
}
