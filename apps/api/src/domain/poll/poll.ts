import { InvariantViolationError } from '../shared/errors';
import { generateId } from '../shared/identifier';

export type PollStatus = 'DRAFT' | 'PUBLISHED' | 'CLOSED' | 'ARCHIVED';
export type PollAudience = 'PUBLIC' | 'MEMBERS_ONLY';

interface PollProps {
  id: string; churchId: string; title: string; description: string | null;
  audience: PollAudience; isAnonymous: boolean; isMultipleChoice: boolean;
  opensAt: Date; closesAt: Date; status: PollStatus;
  showResultsBeforeClose: boolean;
  createdAt: Date; updatedAt: Date;
}

export class Poll {
  readonly id: string;
  readonly churchId: string;
  readonly createdAt: Date;
  private _title: string;
  private _description: string | null;
  private _audience: PollAudience;
  private _isAnonymous: boolean;
  private _isMultipleChoice: boolean;
  private _opensAt: Date;
  private _closesAt: Date;
  private _status: PollStatus;
  private _showResultsBeforeClose: boolean;
  private _updatedAt: Date;

  private constructor(props: PollProps) {
    this.id = props.id; this.churchId = props.churchId; this.createdAt = props.createdAt;
    this._title = props.title; this._description = props.description;
    this._audience = props.audience; this._isAnonymous = props.isAnonymous;
    this._isMultipleChoice = props.isMultipleChoice;
    this._opensAt = props.opensAt; this._closesAt = props.closesAt;
    this._status = props.status; this._showResultsBeforeClose = props.showResultsBeforeClose;
    this._updatedAt = props.updatedAt;
  }

  static create(input: {
    churchId: string; title: string; description?: string | null;
    audience: PollAudience; isAnonymous?: boolean; isMultipleChoice?: boolean;
    opensAt: Date; closesAt: Date; showResultsBeforeClose?: boolean;
  }): Poll {
    const now = new Date();
    const p = new Poll({
      id: generateId(), churchId: input.churchId, title: input.title.trim(),
      description: input.description ?? null, audience: input.audience,
      isAnonymous: input.isAnonymous ?? false, isMultipleChoice: input.isMultipleChoice ?? false,
      opensAt: input.opensAt, closesAt: input.closesAt, status: 'DRAFT',
      showResultsBeforeClose: input.showResultsBeforeClose ?? false,
      createdAt: now, updatedAt: now,
    });
    p.validate();
    return p;
  }

  static reconstitute(props: PollProps): Poll { return new Poll(props); }

  private validate(): void {
    if (!this._title || this._title.length < 2) throw new InvariantViolationError('Titre trop court');
    if (this._closesAt <= this._opensAt) throw new InvariantViolationError('Cloture avant ouverture');
  }

  publish(): void {
    if (this._status !== 'DRAFT') throw new InvariantViolationError('Seul un brouillon peut etre publie');
    this._status = 'PUBLISHED'; this._updatedAt = new Date();
  }

  close(): void {
    if (this._status !== 'PUBLISHED') throw new InvariantViolationError('Seul un vote publie peut etre cloture');
    this._status = 'CLOSED'; this._updatedAt = new Date();
  }

  archive(): void {
    if (this._status !== 'CLOSED') throw new InvariantViolationError('Seul un vote cloture peut etre archive');
    this._status = 'ARCHIVED'; this._updatedAt = new Date();
  }

  isOpen(at: Date = new Date()): boolean {
    return this._status === 'PUBLISHED' && at >= this._opensAt && at <= this._closesAt;
  }

  canSeeResults(at: Date = new Date()): boolean {
    if (this._status === 'CLOSED' || this._status === 'ARCHIVED') return true;
    return this._showResultsBeforeClose && this._status === 'PUBLISHED';
  }

  get title(): string { return this._title; }
  get description(): string | null { return this._description; }
  get audience(): PollAudience { return this._audience; }
  get isAnonymous(): boolean { return this._isAnonymous; }
  get isMultipleChoice(): boolean { return this._isMultipleChoice; }
  get opensAt(): Date { return this._opensAt; }
  get closesAt(): Date { return this._closesAt; }
  get status(): PollStatus { return this._status; }
  get showResultsBeforeClose(): boolean { return this._showResultsBeforeClose; }
  get updatedAt(): Date { return this._updatedAt; }
}
