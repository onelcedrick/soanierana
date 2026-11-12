import { InvariantViolationError } from '../shared/errors';
import { generateId } from '../shared/identifier';

interface PollVoteProps {
  id: string; pollId: string; optionId: string;
  participationId: string | null; userId: string | null;
  createdAt: Date;
}

export class PollVote {
  readonly id: string;
  readonly pollId: string;
  readonly optionId: string;
  readonly participationId: string | null;
  readonly userId: string | null;
  readonly createdAt: Date;

  private constructor(props: PollVoteProps) {
    this.id = props.id; this.pollId = props.pollId; this.optionId = props.optionId;
    this.participationId = props.participationId; this.userId = props.userId;
    this.createdAt = props.createdAt;
  }

  static create(input: {
    pollId: string; optionId: string;
    participationId?: string | null; userId?: string | null;
  }): PollVote {
    if (!input.participationId && !input.userId) {
      throw new InvariantViolationError('Un vote doit avoir une participation ou un utilisateur');
    }
    return new PollVote({
      id: generateId(), pollId: input.pollId, optionId: input.optionId,
      participationId: input.participationId ?? null, userId: input.userId ?? null,
      createdAt: new Date(),
    });
  }

  static reconstitute(props: PollVoteProps): PollVote { return new PollVote(props); }
}
