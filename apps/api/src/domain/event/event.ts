import { InvariantViolationError } from '../shared/errors';
import { generateId } from '../shared/identifier';

interface EventProps {
  id: string; churchId: string; title: string; description: string | null;
  startDate: Date; endDate: Date | null; location: string | null;
  coverImageUrl: string | null; createdAt: Date; updatedAt: Date;
}

export class Event {
  readonly id: string;
  readonly churchId: string;
  readonly createdAt: Date;
  private _title: string;
  private _description: string | null;
  private _startDate: Date;
  private _endDate: Date | null;
  private _location: string | null;
  private _coverImageUrl: string | null;
  private _updatedAt: Date;

  private constructor(props: EventProps) {
    this.id = props.id; this.churchId = props.churchId; this.createdAt = props.createdAt;
    this._title = props.title; this._description = props.description;
    this._startDate = props.startDate; this._endDate = props.endDate;
    this._location = props.location; this._coverImageUrl = props.coverImageUrl;
    this._updatedAt = props.updatedAt;
  }

  static create(input: {
    churchId: string; title: string; description?: string | null;
    startDate: Date; endDate?: Date | null; location?: string | null;
    coverImageUrl?: string | null;
  }): Event {
    if (!input.title || input.title.length < 2) throw new InvariantViolationError('Titre trop court');
    const now = new Date();
    return new Event({
      id: generateId(), churchId: input.churchId, title: input.title.trim(),
      description: input.description ?? null, startDate: input.startDate,
      endDate: input.endDate ?? null, location: input.location ?? null,
      coverImageUrl: input.coverImageUrl ?? null, createdAt: now, updatedAt: now,
    });
  }

  static reconstitute(props: EventProps): Event { return new Event(props); }

  get title(): string { return this._title; }
  get description(): string | null { return this._description; }
  get startDate(): Date { return this._startDate; }
  get endDate(): Date | null { return this._endDate; }
  get location(): string | null { return this._location; }
  get coverImageUrl(): string | null { return this._coverImageUrl; }
  get updatedAt(): Date { return this._updatedAt; }
}
