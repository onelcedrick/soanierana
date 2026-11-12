import type { Availability } from './availability';

export interface AvailabilityRepository {
  findByMember(memberId: string): Promise<Availability[]>;
  save(a: Availability): Promise<void>;
  delete(id: string): Promise<void>;
}
