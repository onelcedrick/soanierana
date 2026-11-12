import type { MemberRepository } from '../../domain/member/member.repository';

export class ListMembersUseCase {
  constructor(private readonly members: MemberRepository) {}
  async execute(churchId: string) {
    const list = await this.members.findByChurch(churchId);
    return list.map((m) => ({
      id: m.id,
      firstName: m.firstName,
      lastName: m.lastName,
      email: m.email.value,
      phone: m.phone.value,
      membershipStatus: m.membershipStatus,
      responsibilityLevel: m.responsibilityLevel,
      isActive: m.isActive,
    }));
  }
}
