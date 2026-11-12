import { InvariantViolationError } from '../shared/errors';
import { generateId } from '../shared/identifier';

export type ReplacementStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

interface ReplacementProps {
  id: string; assignmentId: string; candidateMemberId: string;
  status: ReplacementStatus; decidedByUserId: string | null;
  decidedAt: Date | null; createdAt: Date;
}

export class ReplacementRequest {
  readonly id: string;
  readonly assignmentId: string;
  readonly candidateMemberId: string;
  readonly createdAt: Date;
  private _status: ReplacementStatus;
  private _decidedByUserId: string | null;
  private _decidedAt: Date | null;

  private constructor(props: ReplacementProps) {
    this.id = props.id; this.assignmentId = props.assignmentId;
    this.candidateMemberId = props.candidateMemberId; this.createdAt = props.createdAt;
    this._status = props.status; this._decidedByUserId = props.decidedByUserId;
    this._decidedAt = props.decidedAt;
  }

  static create(input: { assignmentId: string; candidateMemberId: string }): ReplacementRequest {
    return new ReplacementRequest({
      id: generateId(), assignmentId: input.assignmentId,
      candidateMemberId: input.candidateMemberId, status: 'PENDING',
      decidedByUserId: null, decidedAt: null, createdAt: new Date(),
    });
  }

  static reconstitute(props: ReplacementProps): ReplacementRequest { return new ReplacementRequest(props); }

  approve(userId: string): void {
    if (this._status !== 'PENDING') throw new InvariantViolationError('Demande deja traitee');
    this._status = 'APPROVED'; this._decidedByUserId = userId; this._decidedAt = new Date();
  }

  reject(userId: string): void {
    if (this._status !== 'PENDING') throw new InvariantViolationError('Demande deja traitee');
    this._status = 'REJECTED'; this._decidedByUserId = userId; this._decidedAt = new Date();
  }

  get status(): ReplacementStatus { return this._status; }
  get decidedByUserId(): string | null { return this._decidedByUserId; }
  get decidedAt(): Date | null { return this._decidedAt; }
}
