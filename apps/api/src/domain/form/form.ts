import { InvariantViolationError } from '../shared/errors';
import { generateId } from '../shared/identifier';

export type FormStatus = 'DRAFT' | 'PUBLISHED' | 'CLOSED';
export type FormAudience = 'PUBLIC' | 'MEMBERS_ONLY';
export type FormFieldType = 'text' | 'email' | 'number' | 'textarea' | 'select';

export interface FormField {
  id: string;
  label: string;
  type: FormFieldType;
  required: boolean;
  options?: string[];
}

interface FormProps {
  id: string; churchId: string; title: string; description: string | null;
  audience: FormAudience; status: FormStatus; fields: FormField[];
  createdAt: Date; updatedAt: Date;
}

export class Form {
  readonly id: string;
  readonly churchId: string;
  readonly createdAt: Date;
  private _title: string;
  private _description: string | null;
  private _audience: FormAudience;
  private _status: FormStatus;
  private _fields: FormField[];
  private _updatedAt: Date;

  private constructor(props: FormProps) {
    this.id = props.id; this.churchId = props.churchId; this.createdAt = props.createdAt;
    this._title = props.title; this._description = props.description;
    this._audience = props.audience; this._status = props.status;
    this._fields = props.fields; this._updatedAt = props.updatedAt;
  }

  static create(input: { churchId: string; title: string; description?: string | null; audience: FormAudience; fields: FormField[]; }): Form {
    const now = new Date();
    const f = new Form({
      id: generateId(), churchId: input.churchId, title: input.title.trim(),
      description: input.description ?? null, audience: input.audience,
      status: 'DRAFT', fields: input.fields, createdAt: now, updatedAt: now,
    });
    if (!f._title || f._title.length < 2) throw new InvariantViolationError('Titre trop court');
    if (!f._fields || f._fields.length === 0) throw new InvariantViolationError('Ajoutez au moins un champ');
    return f;
  }

  static reconstitute(props: FormProps): Form { return new Form(props); }

  update(data: { title?: string; description?: string | null; audience?: FormAudience; fields?: FormField[] }): void {
    if (data.title !== undefined) {
      if (data.title.trim().length < 2) throw new InvariantViolationError('Titre trop court');
      this._title = data.title.trim();
    }
    if (data.description !== undefined) this._description = data.description;
    if (data.audience !== undefined) this._audience = data.audience;
    if (data.fields !== undefined) {
      if (data.fields.length === 0) throw new InvariantViolationError('Ajoutez au moins un champ');
      this._fields = data.fields;
    }
    this._updatedAt = new Date();
  }

  publish(): void {
    if (this._status !== 'DRAFT') throw new InvariantViolationError('Deja publie');
    this._status = 'PUBLISHED'; this._updatedAt = new Date();
  }

  get title(): string { return this._title; }
  get description(): string | null { return this._description; }
  get audience(): FormAudience { return this._audience; }
  get status(): FormStatus { return this._status; }
  get fields(): FormField[] { return this._fields; }
  get updatedAt(): Date { return this._updatedAt; }
}
