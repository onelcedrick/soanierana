import { InvariantViolationError } from '../shared/errors';
import { generateId } from '../shared/identifier';

export type AssignmentStatus = 'PROPOSED' | 'ACCEPTED' | 'DECLINED' | 'REPLACED' | 'ATTENDED' | 'ABSENT';

interface AssignmentProps {
  id: string; sessionId: string; taskId: string; memberId: string;
  status: AssignmentStatus; justification: string | null;
  proposedAt: Date; respondedAt: Date | null; updatedAt: Date;
}

export class Assignment {
  readonly id: string;
  readonly sessionId: string;
  readonly taskId: string;
  readonly memberId: string;
  readonly proposedAt: Date;
  private _status: AssignmentStatus;
  private _justification: string | null;
  private _respondedAt: Date | null;
  private _updatedAt: Date;

  private constructor(props: AssignmentProps) {
    this.id = props.id; this.sessionId = props.sessionId;
    this.taskId = props.taskId; this.memberId = props.memberId;
    this.proposedAt = props.proposedAt; this._status = props.status;
    this._justification = props.justification; this._respondedAt = props.respondedAt;
    this._updatedAt = props.updatedAt;
  }

  static propose(input: {
    sessionId: string; taskId: string; memberId: string; justification?: string | null;
  }): Assignment {
    const now = new Date();
    return new Assignment({
      id: generateId(), sessionId: input.sessionId, taskId: input.taskId,
      memberId: input.memberId, status: 'PROPOSED',
      justification: input.justification ?? null,
      proposedAt: now, respondedAt: null, updatedAt: now,
    });
  }

  static reconstitute(props: AssignmentProps): Assignment { return new Assignment(props); }

  accept(): void {
    if (this._status !== 'PROPOSED') throw new InvariantViolationError('Seule une proposition peut etre acceptee');
    this._status = 'ACCEPTED'; this._respondedAt = new Date(); this._updatedAt = new Date();
  }

  decline(): void {
    if (this._status !== 'PROPOSED') throw new InvariantViolationError('Seule une proposition peut etre refusee');
    this._status = 'DECLINED'; this._respondedAt = new Date(); this._updatedAt = new Date();
  }

  markReplaced(): void {
    const allowed: AssignmentStatus[] = ['PROPOSED', 'ACCEPTED', 'DECLINED'];
    if (!allowed.includes(this._status)) {
      throw new InvariantViolationError(`Statut ${this._status} incompatible avec un remplacement`);
    }
    this._status = 'REPLACED'; this._updatedAt = new Date();
  }

  markAttended(): void {
    if (this._status !== 'ACCEPTED') throw new InvariantViolationError('Seule une affectation acceptee peut etre confirmee');
    this._status = 'ATTENDED'; this._updatedAt = new Date();
  }

  markAbsent(): void {
    if (this._status !== 'ACCEPTED') throw new InvariantViolationError('Seule une affectation acceptee peut etre marquee absente');
    this._status = 'ABSENT'; this._updatedAt = new Date();
  }

  get status(): AssignmentStatus { return this._status; }
  get justification(): string | null { return this._justification; }
  get respondedAt(): Date | null { return this._respondedAt; }
  get updatedAt(): Date { return this._updatedAt; }
}
