import { User, type UserRole } from '../../domain/user/user';
import type { UserRepository } from '../../domain/user/user.repository';
import type { ChurchRepository } from '../../domain/church/church.repository';
import { PasswordService } from './password.service';
import { ConflictError, NotFoundError } from '../../shared/errors';

export interface RegisterInput {
  churchId: string;
  memberId?: string | null;
  email: string;
  password: string;
  role: UserRole;
}

export interface RegisterOutput {
  id: string;
  churchId: string;
  email: string;
  role: UserRole;
}

export class RegisterUseCase {
  constructor(
    private readonly users: UserRepository,
    private readonly churches: ChurchRepository,
    private readonly passwords: PasswordService,
  ) {}

  async execute(input: RegisterInput): Promise<RegisterOutput> {
    if (input.password.length < 8) {
      throw new ConflictError('Le mot de passe doit contenir au moins 8 caracteres');
    }
    const church = await this.churches.findById(input.churchId);
    if (!church) throw new NotFoundError('Eglise');

    const existing = await this.users.findByEmail(input.churchId, input.email);
    if (existing) throw new ConflictError('Email deja utilise');

    const hash = await this.passwords.hash(input.password);
    const user = User.create({
      churchId: input.churchId,
      memberId: input.memberId ?? null,
      email: input.email,
      passwordHash: hash,
      role: input.role,
    });
    await this.users.save(user);

    return {
      id: user.id,
      churchId: user.churchId,
      email: user.email.value,
      role: user.role,
    };
  }
}
