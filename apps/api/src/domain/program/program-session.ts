import { InvariantViolationError } from '../shared/errors';
import { generateId } from '../shared/identifier';

export type SessionStatus = 'DRAFT' | 'PUBLISHED';

interface SessionProps {
  id: string; programId: string; date: Date;
  status: SessionStatus; createdAt: Date;
}

export class ProgramSession {
  readonly id: string;
  readonly programId: string;
  readonly date: Date;
  readonly createdAt: Date;
  private _status: SessionStatus;

  private constructor(props: SessionProps) {
    this.id = props.id; this.programId = props.programId;
    this.date = props.date; this.createdAt = props.createdAt;
    this._status = props.status;
  }

  static create(input: { programId: string; date: Date }): ProgramSession {
    if (!(input.date instanceof Date) || isNaN(input.date.getTime())) {
      throw new InvariantViolationError('Date de session invalide');
    }
    return new ProgramSession({
      id: generateId(), programId: input.programId, date: input.date, 
      status: 'DRAFT', createdAt: new Date(),
    });
  }

  static reconstitute(props: SessionProps): ProgramSession { return new ProgramSession(props); }

  publish(): void {
    this._status = 'PUBLISHED';
  }

  get status(): SessionStatus { return this._status; }
}
