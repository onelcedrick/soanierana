import { InvariantViolationError } from '../shared/errors';
import { generateId } from '../shared/identifier';

export type PublicationStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
export type PublicationAudience = 'PUBLIC' | 'MEMBERS_ONLY';

interface PublicationProps {
  id: string; churchId: string; categoryId: string | null;
  title: string; content: string; coverImageUrl: string | null;
  audience: PublicationAudience; status: PublicationStatus;
  eventDate: Date | null; eventTime: string | null; location: string | null;
  publishedAt: Date | null;
  createdAt: Date; updatedAt: Date;
}

export class Publication {
  readonly id: string;
  readonly churchId: string;
  readonly categoryId: string | null;
  readonly createdAt: Date;
  private _title: string;
  private _content: string;
  private _coverImageUrl: string | null;
  private _audience: PublicationAudience;
  private _status: PublicationStatus;
  private _eventDate: Date | null;
  private _eventTime: string | null;
  private _location: string | null;
  private _publishedAt: Date | null;
  private _updatedAt: Date;

  private constructor(props: PublicationProps) {
    this.id = props.id; this.churchId = props.churchId;
    this.categoryId = props.categoryId; this.createdAt = props.createdAt;
    this._title = props.title; this._content = props.content;
    this._coverImageUrl = props.coverImageUrl; this._audience = props.audience;
    this._status = props.status; this._eventDate = props.eventDate;
    this._eventTime = props.eventTime; this._location = props.location;
    this._publishedAt = props.publishedAt; this._updatedAt = props.updatedAt;
  }

  static create(input: {
    churchId: string; categoryId?: string | null;
    title: string; content: string; coverImageUrl?: string | null;
    audience: PublicationAudience;
    eventDate?: Date | null; eventTime?: string | null; location?: string | null;
  }): Publication {
    const now = new Date();
    const p = new Publication({
      id: generateId(), churchId: input.churchId, categoryId: input.categoryId ?? null,
      title: input.title.trim(), content: input.content,
      coverImageUrl: input.coverImageUrl ?? null, audience: input.audience,
      status: 'DRAFT', eventDate: input.eventDate ?? null, eventTime: input.eventTime ?? null,
      location: input.location ?? null, publishedAt: null, createdAt: now, updatedAt: now,
    });
    if (!p._title || p._title.length < 2) throw new InvariantViolationError('Titre trop court');
    if (!p._content || p._content.length < 2) throw new InvariantViolationError('Contenu trop court');
    return p;
  }

  static reconstitute(props: PublicationProps): Publication { return new Publication(props); }

  update(data: { title?: string; content?: string; audience?: PublicationAudience; coverImageUrl?: string | null }): void {
    if (data.title !== undefined) {
      if (data.title.trim().length < 2) throw new InvariantViolationError('Titre trop court');
      this._title = data.title.trim();
    }
    if (data.content !== undefined) {
      if (data.content.trim().length < 2) throw new InvariantViolationError('Contenu trop court');
      this._content = data.content;
    }
    if (data.audience !== undefined) this._audience = data.audience;
    if (data.coverImageUrl !== undefined) this._coverImageUrl = data.coverImageUrl;
    this._updatedAt = new Date();
  }

  publish(): void {
    if (this._status !== 'DRAFT') throw new InvariantViolationError('Seul un brouillon peut etre publie');
    this._status = 'PUBLISHED'; this._publishedAt = new Date(); this._updatedAt = new Date();
  }
  archive(): void {
    if (this._status !== 'PUBLISHED') throw new InvariantViolationError('Seule une publication peut etre archivee');
    this._status = 'ARCHIVED'; this._updatedAt = new Date();
  }

  get title(): string { return this._title; }
  get content(): string { return this._content; }
  get coverImageUrl(): string | null { return this._coverImageUrl; }
  get audience(): PublicationAudience { return this._audience; }
  get status(): PublicationStatus { return this._status; }
  get eventDate(): Date | null { return this._eventDate; }
  get eventTime(): string | null { return this._eventTime; }
  get location(): string | null { return this._location; }
  get publishedAt(): Date | null { return this._publishedAt; }
  get updatedAt(): Date { return this._updatedAt; }
}
