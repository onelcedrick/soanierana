import { User } from '../../domain/user/user';
import type { UserRepository } from '../../domain/user/user.repository';
import type { MemberRepository } from '../../domain/member/member.repository';
import { PasswordService } from '../auth/password.service';
import { ConflictError, NotFoundError } from '../../shared/errors';

export interface CreateMemberAccountInput {
  memberId: string;
  password: string;
}

export class CreateMemberAccountUseCase {
  constructor(
    private readonly users: UserRepository,
    private readonly members: MemberRepository,
    private readonly passwords: PasswordService,
  ) {}

  async execute(input: CreateMemberAccountInput): Promise<{ userId: string }> {
    const member = await this.members.findById(input.memberId);
    if (!member) throw new NotFoundError('Membre');

    const existing = await this.users.findByEmail(member.churchId, member.email.value);
    if (existing) throw new ConflictError('Un compte existe deja pour ce membre');

    const hash = await this.passwords.hash(input.password);
    const user = User.create({
      churchId: member.churchId,
      memberId: member.id,
      email: member.email.value,
      passwordHash: hash,
      role: 'MEMBER',
    });
    await this.users.save(user);
    return { userId: user.id };
  }
}
