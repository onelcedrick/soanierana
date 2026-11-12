import { InvariantViolationError } from '../shared/errors';
import { generateId } from '../shared/identifier';
import { Email } from '../shared/email';

export type UserRole = 'ADMIN' | 'RESPONSABLE' | 'MEMBER';

interface UserProps {
  id: string;
  churchId: string;
  memberId: string | null;
  email: Email;
  passwordHash: string;
  role: UserRole;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class User {
  readonly id: string;
  readonly churchId: string;
  readonly memberId: string | null;
  readonly createdAt: Date;
  private _email: Email;
  private _passwordHash: string;
  private _role: UserRole;
  private _isActive: boolean;
  private _updatedAt: Date;

  private constructor(props: UserProps) {
    this.id = props.id;
    this.churchId = props.churchId;
    this.memberId = props.memberId;
    this._email = props.email;
    this._passwordHash = props.passwordHash;
    this._role = props.role;
    this._isActive = props.isActive;
    this.createdAt = props.createdAt;
    this._updatedAt = props.updatedAt;
  }

  static create(input: {
    churchId: string;
    memberId?: string | null;
    email: string;
    passwordHash: string;
    role: UserRole;
  }): User {
    if (!input.passwordHash || input.passwordHash.length < 20) {
      throw new InvariantViolationError('Hash de mot de passe invalide');
    }
    const now = new Date();
    return new User({
      id: generateId(),
      churchId: input.churchId,
      memberId: input.memberId ?? null,
      email: Email.create(input.email),
      passwordHash: input.passwordHash,
      role: input.role,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });
  }

  static reconstitute(props: UserProps): User {
    return new User(props);
  }

  changeRole(role: UserRole): void {
    this._role = role;
    this._updatedAt = new Date();
  }

  changePasswordHash(hash: string): void {
    if (!hash || hash.length < 20) throw new InvariantViolationError('Hash invalide');
    this._passwordHash = hash;
    this._updatedAt = new Date();
  }

  deactivate(): void {
    this._isActive = false;
    this._updatedAt = new Date();
  }

  activate(): void {
    this._isActive = true;
    this._updatedAt = new Date();
  }

  get email(): Email { return this._email; }
  get passwordHash(): string { return this._passwordHash; }
  get role(): UserRole { return this._role; }
  get isActive(): boolean { return this._isActive; }
  get updatedAt(): Date { return this._updatedAt; }
}
