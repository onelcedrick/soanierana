import { InvariantViolationError } from '../shared/errors';
import { generateId } from '../shared/identifier';

interface SkillProps { id: string; churchId: string; name: string; createdAt: Date; }

export class Skill {
  readonly id: string;
  readonly churchId: string;
  readonly createdAt: Date;
  private _name: string;

  private constructor(props: SkillProps) {
    this.id = props.id; this.churchId = props.churchId;
    this._name = props.name; this.createdAt = props.createdAt;
  }

  static create(input: { churchId: string; name: string }): Skill {
    if (!input.name || input.name.trim().length < 2) {
      throw new InvariantViolationError('Nom competence trop court');
    }
    return new Skill({
      id: generateId(), churchId: input.churchId,
      name: input.name.trim(), createdAt: new Date(),
    });
  }

  static reconstitute(props: SkillProps): Skill { return new Skill(props); }
  get name(): string { return this._name; }
}
