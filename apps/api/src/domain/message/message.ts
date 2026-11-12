import { generateId } from '../shared/identifier';
import { InvariantViolationError } from '../shared/errors';

export class Message {
  readonly id: string;
  readonly churchId: string;
  readonly senderId: string;
  readonly senderName: string;
  readonly subject: string;
  readonly content: string;
  readonly isAnonymous: boolean; // <-- Nouveau champ
  readonly isRead: boolean;
  readonly createdAt: Date;

  private constructor(props: any) {
    this.id = props.id;
    this.churchId = props.churchId;
    this.senderId = props.senderId;
    this.senderName = props.senderName;
    this.subject = props.subject;
    this.content = props.content;
    this.isAnonymous = props.isAnonymous;
    this.isRead = props.isRead;
    this.createdAt = props.createdAt;
  }

  static create(input: { churchId: string, senderId: string, senderName: string, subject: string, content: string, isAnonymous?: boolean }): Message {
    if (!input.content || input.content.length < 2) {
      throw new InvariantViolationError('Le message est trop court');
    }
    return new Message({
      id: generateId(), churchId: input.churchId, senderId: input.senderId,
      senderName: input.senderName, subject: input.subject, content: input.content,
      isAnonymous: input.isAnonymous ?? false,
      isRead: false, createdAt: new Date(),
    });
  }

  static reconstitute(props: any): Message { return new Message(props); }
}
