import { InvariantViolationError } from './errors';

const PHONE_PATTERN = /^\+?[0-9\s\-]{6,20}$/;

export class Phone {
  private readonly _value: string;
  private constructor(value: string) { this._value = value; }

  static create(value: string): Phone {
    const normalized = value.trim();
    if (!PHONE_PATTERN.test(normalized)) throw new InvariantViolationError(`Telephone invalide : ${value}`);
    return new Phone(normalized);
  }
  get value(): string { return this._value; }
  equals(other: Phone): boolean { return this._value === other._value; }
}
