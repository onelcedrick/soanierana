import { InvariantViolationError } from '../shared/errors';
import { generateId } from '../shared/identifier';

export type ProgramFrequency = 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY' | 'ON_DEMAND';

interface ProgramProps {
  id: string; churchId: string; name: string;
  frequency: ProgramFrequency; dayOfWeek: number | null;
  startTime: string | null; isActive: boolean;
  createdAt: Date; updatedAt: Date;
}

export class Program {
  readonly id: string;
  readonly churchId: string;
  readonly createdAt: Date;
  private _name: string;
  private _frequency: ProgramFrequency;
  private _dayOfWeek: number | null;
  private _startTime: string | null;
  private _isActive: boolean;
  private _updatedAt: Date;

  private constructor(props: ProgramProps) {
    this.id = props.id; this.churchId = props.churchId; this._name = props.name;
    this._frequency = props.frequency; this._dayOfWeek = props.dayOfWeek;
    this._startTime = props.startTime; this._isActive = props.isActive;
    this.createdAt = props.createdAt; this._updatedAt = props.updatedAt;
  }

  static create(input: {
    churchId: string; name: string; frequency: ProgramFrequency;
    dayOfWeek?: number | null; startTime?: string | null;
  }): Program {
    const now = new Date();
    const p = new Program({
      id: generateId(), churchId: input.churchId, name: input.name.trim(),
      frequency: input.frequency, dayOfWeek: input.dayOfWeek ?? null,
      startTime: input.startTime ?? null, isActive: true,
      createdAt: now, updatedAt: now,
    });
    p.validate();
    return p;
  }

  static reconstitute(props: ProgramProps): Program { return new Program(props); }

  private validate(): void {
    if (!this._name || this._name.length < 2) throw new InvariantViolationError('Nom programme trop court');
    if (this._dayOfWeek !== null && (this._dayOfWeek < 0 || this._dayOfWeek > 6)) {
      throw new InvariantViolationError('Jour de semaine invalide (0-6)');
    }
  }

  rename(name: string): void {
    if (!name || name.trim().length < 2) throw new InvariantViolationError('Nom trop court');
    this._name = name.trim(); this._updatedAt = new Date();
  }

  deactivate(): void { this._isActive = false; this._updatedAt = new Date(); }
  activate(): void { this._isActive = true; this._updatedAt = new Date(); }

  get name(): string { return this._name; }
  get frequency(): ProgramFrequency { return this._frequency; }
  get dayOfWeek(): number | null { return this._dayOfWeek; }
  get startTime(): string | null { return this._startTime; }
  get isActive(): boolean { return this._isActive; }
  get updatedAt(): Date { return this._updatedAt; }
}
