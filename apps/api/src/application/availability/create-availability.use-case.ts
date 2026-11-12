import { Availability, type AvailabilityType } from '../../domain/availability/availability';
import type { AvailabilityRepository } from '../../domain/availability/availability.repository';
import type { MemberRepository } from '../../domain/member/member.repository';
import { NotFoundError } from '../../shared/errors';

export interface CreateAvailabilityInput {
  memberId: string; type: AvailabilityType;
  date?: string | null; startDate?: string | null; endDate?: string | null; notes?: string | null;
}
export interface CreateAvailabilityOutput { id: string; memberId: string; type: AvailabilityType; }

export class CreateAvailabilityUseCase {
  constructor(private readonly availabilities: AvailabilityRepository, private readonly members: MemberRepository) {}
  async execute(input: CreateAvailabilityInput): Promise<CreateAvailabilityOutput> {
    const member = await this.members.findById(input.memberId);
    if (!member) throw new NotFoundError('Membre');
    const a = Availability.create({
      memberId: input.memberId,
      type: input.type,
      date: input.date ? new Date(input.date) : null,
      startDate: input.startDate ? new Date(input.startDate) : null,
      endDate: input.endDate ? new Date(input.endDate) : null,
      notes: input.notes ?? null,
    });
    await this.availabilities.save(a);
    return { id: a.id, memberId: a.memberId, type: a.type };
  }
}
