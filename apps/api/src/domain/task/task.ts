import { InvariantViolationError } from '../shared/errors';
import { generateId } from '../shared/identifier';

export type TaskEligibility = 'PUBLIC' | 'MEMBER' | 'MINIMUM_GRADE' | 'EXACT_GRADE' | 'CUSTOM';
export type ResponsibilityLevel = 'LOHOLONA' | 'DIAKONA' | 'MAMBRA_TSOTRA';
export type MembershipStatus = 'LOCAL_BAPTIZED' | 'EXTERNAL_BAPTIZED' | 'UNBAPTIZED';

interface TaskProps {
  id: string; programId: string; name: string; description: string | null;
  requiredPeople: number; eligibilityMode: TaskEligibility;
  minimumGrade: ResponsibilityLevel | null; exactGrade: ResponsibilityLevel | null;
  allowedMembershipStatuses: MembershipStatus[];
  isActive: boolean; createdAt: Date; updatedAt: Date;
}

export class Task {
  readonly id: string;
  readonly programId: string;
  readonly createdAt: Date;
  private _name: string;
  private _description: string | null;
  private _requiredPeople: number;
  private _eligibilityMode: TaskEligibility;
  private _minimumGrade: ResponsibilityLevel | null;
  private _exactGrade: ResponsibilityLevel | null;
  private _allowedMembershipStatuses: MembershipStatus[];
  private _isActive: boolean;
  private _updatedAt: Date;

  private constructor(props: TaskProps) {
    this.id = props.id; this.programId = props.programId; this._name = props.name;
    this._description = props.description; this._requiredPeople = props.requiredPeople;
    this._eligibilityMode = props.eligibilityMode;
    this._minimumGrade = props.minimumGrade;
    this._exactGrade = props.exactGrade;
    this._allowedMembershipStatuses = props.allowedMembershipStatuses;
    this._isActive = props.isActive; this.createdAt = props.createdAt; this._updatedAt = props.updatedAt;
  }

  static create(input: {
    programId: string; name: string; description?: string | null; requiredPeople?: number;
    eligibilityMode?: TaskEligibility; minimumGrade?: ResponsibilityLevel | null; exactGrade?: ResponsibilityLevel | null;
    allowedMembershipStatuses?: MembershipStatus[];
  }): Task {
    const now = new Date();
    const t = new Task({
      id: generateId(), programId: input.programId, name: input.name.trim(),
      description: input.description ?? null, requiredPeople: input.requiredPeople ?? 1,
      eligibilityMode: input.eligibilityMode ?? 'MEMBER',
      minimumGrade: input.minimumGrade ?? null, exactGrade: input.exactGrade ?? null,
      allowedMembershipStatuses: input.allowedMembershipStatuses ?? ['LOCAL_BAPTIZED', 'EXTERNAL_BAPTIZED', 'UNBAPTIZED'],
      isActive: true, createdAt: now, updatedAt: now,
    });
    t.validate();
    return t;
  }

  static reconstitute(props: TaskProps): Task { return new Task(props); }

  private validate(): void {
    if (!this._name || this._name.length < 2) throw new InvariantViolationError('Nom tache trop court');
    if (this._requiredPeople < 1) throw new InvariantViolationError('Nombre de personnes >= 1');
  }

  deactivate(): void { this._isActive = false; this._updatedAt = new Date(); }
  activate(): void { this._isActive = true; this._updatedAt = new Date(); }

  get name(): string { return this._name; }
  get description(): string | null { return this._description; }
  get requiredPeople(): number { return this._requiredPeople; }
  get eligibilityMode(): TaskEligibility { return this._eligibilityMode; }
  get minimumGrade(): ResponsibilityLevel | null { return this._minimumGrade; }
  get exactGrade(): ResponsibilityLevel | null { return this._exactGrade; }
  get allowedMembershipStatuses(): MembershipStatus[] { return this._allowedMembershipStatuses; }
  get isActive(): boolean { return this._isActive; }
  get updatedAt(): Date { return this._updatedAt; }
}
