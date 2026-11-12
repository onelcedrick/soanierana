import { InvariantViolationError } from '../shared/errors';
import { generateId } from '../shared/identifier';

interface CategoryProps { id: string; churchId: string; name: string; createdAt: Date; }

export class EventCategory {
  readonly id: string;
  readonly churchId: string;
  readonly name: string;
  readonly createdAt: Date;

  private constructor(props: CategoryProps) {
    this.id = props.id; this.churchId = props.churchId;
    this.name = props.name; this.createdAt = props.createdAt;
  }
  static create(input: { churchId: string; name: string }): EventCategory {
    if (!input.name || input.name.trim().length < 2) throw new InvariantViolationError('Nom categorie trop court');
    return new EventCategory({
      id: generateId(), churchId: input.churchId, name: input.name.trim(), createdAt: new Date(),
    });
  }
  static reconstitute(props: CategoryProps): EventCategory { return new EventCategory(props); }
}
