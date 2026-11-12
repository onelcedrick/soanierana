import { Member, type MembershipStatus, type ResponsibilityLevel } from '../../domain/member/member';
import type { MemberRepository } from '../../domain/member/member.repository';
import type { ChurchRepository } from '../../domain/church/church.repository';
import { ConflictError, NotFoundError } from '../../shared/errors';

export interface CreateMemberInput {
  churchId: string; firstName: string; lastName: string;
  email: string; phone: string;
  membershipStatus: MembershipStatus; responsibilityLevel: ResponsibilityLevel;
}

export interface CreateMemberOutput {
  id: string; churchId: string; firstName: string; lastName: string;
  email: string; phone: string;
  membershipStatus: MembershipStatus; responsibilityLevel: ResponsibilityLevel;
}

export class CreateMemberUseCase {
  constructor(
    private readonly members: MemberRepository,
    private readonly churches: ChurchRepository,
  ) {}

  async execute(input: CreateMemberInput): Promise<CreateMemberOutput> {
    const church = await this.churches.findById(input.churchId);
    if (!church) throw new NotFoundError('Eglise');

    const existing = await this.members.findByEmail(input.churchId, input.email);
    if (existing) throw new ConflictError('Un membre avec cet email existe deja');

    const member = Member.create(input);
    await this.members.save(member);

    return {
      id: member.id, churchId: member.churchId,
      firstName: member.firstName, lastName: member.lastName,
      email: member.email.value, phone: member.phone.value,
      membershipStatus: member.membershipStatus,
      responsibilityLevel: member.responsibilityLevel,
    };
  }
}
