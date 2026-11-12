import { InvariantViolationError } from '../shared/errors';
import { generateId } from '../shared/identifier';

export type RotationStrategy = 'FAIR_ROTATION' | 'ROUND_ROBIN' | 'LEAST_ASSIGNED';

interface SiteSettingsProps {
  id: string; churchId: string; rotationStrategy: RotationStrategy;
  rotationCycleWeeks: number;
  weightParticipation: number; weightRecency: number; weightAssignment: number;
  weightAvailability: number; weightSkill: number; updatedAt: Date;
}

export class SiteSettings {
  readonly id: string;
  readonly churchId: string;
  private _rotationStrategy: RotationStrategy;
  private _rotationCycleWeeks: number;
  private _weightParticipation: number;
  private _weightRecency: number;
  private _weightAssignment: number;
  private _weightAvailability: number;
  private _weightSkill: number;
  private _updatedAt: Date;

  private constructor(props: SiteSettingsProps) {
    this.id = props.id; this.churchId = props.churchId;
    this._rotationStrategy = props.rotationStrategy;
    this._rotationCycleWeeks = props.rotationCycleWeeks;
    this._weightParticipation = props.weightParticipation;
    this._weightRecency = props.weightRecency;
    this._weightAssignment = props.weightAssignment;
    this._weightAvailability = props.weightAvailability;
    this._weightSkill = props.weightSkill;
    this._updatedAt = props.updatedAt;
  }

  static createDefault(churchId: string): SiteSettings {
    return new SiteSettings({
      id: generateId(), churchId, rotationStrategy: 'FAIR_ROTATION',
      rotationCycleWeeks: 1,
      weightParticipation: 40, weightRecency: 25, weightAssignment: 15,
      weightAvailability: 10, weightSkill: 10, updatedAt: new Date(),
    });
  }

  static reconstitute(props: SiteSettingsProps): SiteSettings { return new SiteSettings(props); }

  updateWeights(input: {
    rotationStrategy: RotationStrategy; rotationCycleWeeks: number;
    weightParticipation: number; weightRecency: number; weightAssignment: number;
    weightAvailability: number; weightSkill: number;
  }): void {
    const total = input.weightParticipation + input.weightRecency + input.weightAssignment + input.weightAvailability + input.weightSkill;
    if (total !== 100) throw new InvariantViolationError('La somme des poids doit être de 100%');
    if (input.rotationCycleWeeks < 1) throw new InvariantViolationError('Le cycle doit être de 1 semaine minimum');

    this._rotationStrategy = input.rotationStrategy;
    this._rotationCycleWeeks = input.rotationCycleWeeks;
    this._weightParticipation = input.weightParticipation;
    this._weightRecency = input.weightRecency;
    this._weightAssignment = input.weightAssignment;
    this._weightAvailability = input.weightAvailability;
    this._weightSkill = input.weightSkill;
    this._updatedAt = new Date();
  }

  get rotationStrategy(): RotationStrategy { return this._rotationStrategy; }
  get rotationCycleWeeks(): number { return this._rotationCycleWeeks; }
  get weightParticipation(): number { return this._weightParticipation; }
  get weightRecency(): number { return this._weightRecency; }
  get weightAssignment(): number { return this._weightAssignment; }
  get weightAvailability(): number { return this._weightAvailability; }
  get weightSkill(): number { return this._weightSkill; }
  get updatedAt(): Date { return this._updatedAt; }
}
