import { generateId } from '../shared/identifier';

export type NotificationKind =
  | 'ASSIGNMENT_PROPOSED' | 'ASSIGNMENT_RESPONSE' | 'REPLACEMENT_REQUEST'
  | 'REPLACEMENT_DECIDED' | 'PUBLICATION_PUBLISHED' | 'POLL_PUBLISHED';

interface NotificationProps {
  id: string; userId: string; kind: NotificationKind;
  title: string; body: string; isRead: boolean;
  data: Record<string, unknown> | null; createdAt: Date;
}

export class Notification {
  readonly id: string;
  readonly userId: string;
  readonly kind: NotificationKind;
  readonly title: string;
  readonly body: string;
  readonly data: Record<string, unknown> | null;
  readonly createdAt: Date;
  private _isRead: boolean;

  private constructor(props: NotificationProps) {
    this.id = props.id; this.userId = props.userId; this.kind = props.kind;
    this.title = props.title; this.body = props.body; this.data = props.data;
    this.createdAt = props.createdAt; this._isRead = props.isRead;
  }

  static create(input: {
    userId: string; kind: NotificationKind; title: string; body: string;
    data?: Record<string, unknown> | null;
  }): Notification {
    return new Notification({
      id: generateId(), userId: input.userId, kind: input.kind,
      title: input.title, body: input.body, isRead: false,
      data: input.data ?? null, createdAt: new Date(),
    });
  }
  static reconstitute(props: NotificationProps): Notification { return new Notification(props); }
  markRead(): void { this._isRead = true; }
  get isRead(): boolean { return this._isRead; }
}
