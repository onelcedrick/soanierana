import { InvariantViolationError } from '../shared/errors';
import { generateId } from '../shared/identifier';

interface PollOptionProps { id: string; pollId: string; label: string; position: number; }

export class PollOption {
  readonly id: string;
  readonly pollId: string;
  readonly label: string;
  readonly position: number;

  private constructor(props: PollOptionProps) {
    this.id = props.id; this.pollId = props.pollId;
    this.label = props.label; this.position = props.position;
  }

  static create(input: { pollId: string; label: string; position: number }): PollOption {
    if (!input.label || input.label.trim().length < 1) throw new InvariantViolationError('Label vide');
    return new PollOption({
      id: generateId(), pollId: input.pollId, label: input.label.trim(), position: input.position,
    });
  }

  static reconstitute(props: PollOptionProps): PollOption { return new PollOption(props); }
}
