import { z } from 'zod';
import { InvariantViolationError } from './errors';

const EmailSchema = z.string().email().toLowerCase();

export class Email {
  private readonly _value: string;
  private constructor(value: string) { this._value = value; }

  static create(value: string): Email {
    const parsed = EmailSchema.safeParse(value.trim());
    if (!parsed.success) throw new InvariantViolationError(`Email invalide : ${value}`);
    return new Email(parsed.data);
  }
  get value(): string { return this._value; }
  equals(other: Email): boolean { return this._value === other._value; }
}
