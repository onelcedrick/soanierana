import { Church } from '../../domain/church/church';
import { User } from '../../domain/user/user';
import { PasswordService } from './password.service';
import type { ChurchRepository } from '../../domain/church/church.repository';
import type { UserRepository } from '../../domain/user/user.repository';
import { ConflictError, NotFoundError } from '../../shared/errors';

export interface BootstrapInput {
  churchName: string;
  city: string;
  country: string;
  adminEmail: string;
  adminPassword: string;
}

export class BootstrapUseCase {
  constructor(
    private readonly churches: ChurchRepository,
    private readonly users: UserRepository,
    private readonly passwords: PasswordService,
  ) {}

  async execute(input: BootstrapInput): Promise<{ churchId: string; userId: string }> {
    const count = await this.users.countAll();
    if (count > 0) throw new ConflictError('Application deja initialisee');

    if (input.adminPassword.length < 8) {
      throw new ConflictError('Mot de passe admin trop court (8 caracteres minimum)');
    }

    const church = Church.create({
      name: input.churchName,
      city: input.city,
      country: input.country,
    });
    await this.churches.save(church);

    const hash = await this.passwords.hash(input.adminPassword);
    const user = User.create({
      churchId: church.id,
      email: input.adminEmail,
      passwordHash: hash,
      role: 'ADMIN',
    });
    await this.users.save(user);

    return { churchId: church.id, userId: user.id };
  }
}
