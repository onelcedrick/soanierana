import type { MemberRepository } from '../../domain/member/member.repository';
import { NotFoundError } from '../../shared/errors';

export class GetProfileUseCase {
  constructor(private readonly members: MemberRepository) {}
  
  async execute(memberId: string) {
    const member = await this.members.findById(memberId);
    if (!member) throw new NotFoundError('Membre');
    
    return {
      id: member.id,
      firstName: member.firstName,
      lastName: member.lastName,
      email: member.email.value,
      phone: member.phone.value,
      membershipStatus: member.membershipStatus,
      responsibilityLevel: member.responsibilityLevel,
      isActive: member.isActive
    };
  }
}
