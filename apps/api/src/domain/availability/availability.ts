import { InvariantViolationError } from '../shared/errors';
import { generateId } from '../shared/identifier';

export type AvailabilityType = 'REGULAR' | 'EXCEPTION' | 'UNAVAILABLE';

interface AvailabilityProps {
  id: string; memberId: string; type: AvailabilityType;
  date: Date | null; startDate: Date | null; endDate: Date | null;
  notes: string | null; createdAt: Date;
}

export class Availability {
  readonly id: string;
  readonly memberId: string;
  readonly type: AvailabilityType;
  readonly date: Date | null;
  readonly startDate: Date | null;
  readonly endDate: Date | null;
  readonly notes: string | null;
  readonly createdAt: Date;

  private constructor(props: AvailabilityProps) {
    this.id = props.id; this.memberId = props.memberId; this.type = props.type;
    this.date = props.date; this.startDate = props.startDate; this.endDate = props.endDate;
    this.notes = props.notes; this.createdAt = props.createdAt;
  }

  static create(input: {
    memberId: string; type: AvailabilityType;
    date?: Date | null; startDate?: Date | null; endDate?: Date | null; notes?: string | null;
  }): Availability {
    if (input.type === 'EXCEPTION' && !input.date) {
      throw new InvariantViolationError('Une exception doit avoir une date');
    }
    if (input.type === 'UNAVAILABLE') {
      if (!input.startDate || !input.endDate) {
        throw new InvariantViolationError('Periode d indisponibilite requiert debut et fin');
      }
      if (input.endDate < input.startDate) {
        throw new InvariantViolationError('Date de fin avant date de debut');
      }
    }
    return new Availability({
      id: generateId(), memberId: input.memberId, type: input.type,
      date: input.date ?? null, startDate: input.startDate ?? null,
      endDate: input.endDate ?? null, notes: input.notes ?? null, createdAt: new Date(),
    });
  }

  static reconstitute(props: AvailabilityProps): Availability { return new Availability(props); }
}
