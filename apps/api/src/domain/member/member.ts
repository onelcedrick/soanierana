import { InvariantViolationError } from '../shared/errors';
import { generateId } from '../shared/identifier';
import { Email } from '../shared/email';
import { Phone } from '../shared/phone';

export type MembershipStatus = 'LOCAL_BAPTIZED' | 'EXTERNAL_BAPTIZED' | 'UNBAPTIZED';
export type ResponsibilityLevel = 'LOHOLONA' | 'DIAKONA' | 'MAMBRA_TSOTRA';

interface MemberProps {
  id: string; churchId: string; firstName: string; lastName: string;
  email: Email; phone: Phone; membershipStatus: MembershipStatus;
  responsibilityLevel: ResponsibilityLevel; isActive: boolean;
  createdAt: Date; updatedAt: Date;
}

export class Member {
  readonly id: string;
  readonly churchId: string;
  readonly createdAt: Date;
  private _firstName: string;
  private _lastName: string;
  private _email: Email;
  private _phone: Phone;
  private _membershipStatus: MembershipStatus;
  private _responsibilityLevel: ResponsibilityLevel;
  private _isActive: boolean;
  private _updatedAt: Date;

  private constructor(props: MemberProps) {
    this.id = props.id; this.churchId = props.churchId;
    this._firstName = props.firstName; this._lastName = props.lastName;
    this._email = props.email; this._phone = props.phone;
    this._membershipStatus = props.membershipStatus;
    this._responsibilityLevel = props.responsibilityLevel;
    this._isActive = props.isActive; this.createdAt = props.createdAt; this._updatedAt = props.updatedAt;
  }

  static create(input: {
    churchId: string; firstName: string; lastName: string;
    email: string; phone: string;
    membershipStatus: MembershipStatus; responsibilityLevel: ResponsibilityLevel;
  }): Member {
    const now = new Date();
    const m = new Member({
      id: generateId(), churchId: input.churchId,
      firstName: input.firstName.trim(), lastName: input.lastName.trim(),
      email: Email.create(input.email), phone: Phone.create(input.phone),
      membershipStatus: input.membershipStatus,
      responsibilityLevel: input.responsibilityLevel,
      isActive: true, createdAt: now, updatedAt: now,
    });
    m.validate();
    return m;
  }

  static reconstitute(props: MemberProps): Member { return new Member(props); }

  private validate(): void {
    if (!this._firstName || this._firstName.length < 1) throw new InvariantViolationError('Prenom obligatoire');
    if (!this._lastName || this._lastName.length < 1) throw new InvariantViolationError('Nom obligatoire');
  }

  changeMembershipStatus(status: MembershipStatus): void {
    this._membershipStatus = status; this._updatedAt = new Date();
  }

  changeResponsibilityLevel(level: ResponsibilityLevel): void {
    this._responsibilityLevel = level; this._updatedAt = new Date();
  }

  updateContact(email: string, phone: string): void {
    this._email = Email.create(email); this._phone = Phone.create(phone);
    this._updatedAt = new Date();
  }

  activate(): void { this._isActive = true; this._updatedAt = new Date(); }
  deactivate(): void { this._isActive = false; this._updatedAt = new Date(); }

  get firstName(): string { return this._firstName; }
  get lastName(): string { return this._lastName; }
  get fullName(): string { return `${this._firstName} ${this._lastName}`; }
  get email(): Email { return this._email; }
  get phone(): Phone { return this._phone; }
  get membershipStatus(): MembershipStatus { return this._membershipStatus; }
  get responsibilityLevel(): ResponsibilityLevel { return this._responsibilityLevel; }
  get isActive(): boolean { return this._isActive; }
  get updatedAt(): Date { return this._updatedAt; }
}
