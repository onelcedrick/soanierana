import type { UserRepository } from '../../domain/user/user.repository';
import type { UserRole } from '../../domain/user/user';
import { PasswordService } from './password.service';
import { UnauthorizedError } from '../../shared/errors';

export interface LoginInput {
  email: string;
  password: string;
}

export interface LoginOutput {
  id: string;
  churchId: string;
  email: string;
  role: UserRole;
  memberId: string | null;
}

export class LoginUseCase {
  constructor(
    private readonly users: UserRepository,
    private readonly passwords: PasswordService,
  ) {}

  async execute(input: LoginInput): Promise<LoginOutput> {
    const user = await this.users.findByEmailAcrossChurches(input.email);
    if (!user) throw new UnauthorizedError('Identifiants invalides');
    if (!user.isActive) throw new UnauthorizedError('Compte desactive');
    const valid = await this.passwords.verify(input.password, user.passwordHash);
    if (!valid) throw new UnauthorizedError('Identifiants invalides');

    return {
      id: user.id,
      churchId: user.churchId,
      email: user.email.value,
      role: user.role,
      memberId: user.memberId,
    };
  }
}
