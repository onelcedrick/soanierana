import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import { RegisterUseCase } from '../../src/application/auth/register.use-case';
import { LoginUseCase } from '../../src/application/auth/login.use-case';
import { BootstrapUseCase } from '../../src/application/auth/bootstrap.use-case';
import { PasswordService } from '../../src/application/auth/password.service';
import { CreateChurchUseCase } from '../../src/application/church/create-church.use-case';
import { DrizzleUserRepository } from '../../src/infrastructure/repositories/drizzle-user.repository';
import { DrizzleChurchRepository } from '../../src/infrastructure/repositories/drizzle-church.repository';
import { db, pool } from '../../src/infrastructure/database/client';
import { users } from '../../src/infrastructure/database/schema/user.table';
import { members } from '../../src/infrastructure/database/schema/member.table';
import { churches } from '../../src/infrastructure/database/schema/church.table';
import { ConflictError, UnauthorizedError } from '../../src/shared/errors';

describe('Auth Use Cases', () => {
  beforeEach(async () => {
    await db.delete(users);
    await db.delete(members);
    await db.delete(churches);
  });
  afterAll(async () => { await pool.end(); });

  async function setup() {
    const churchRepo = new DrizzleChurchRepository(db);
    const userRepo = new DrizzleUserRepository(db);
    const passwords = new PasswordService();
    const church = await new CreateChurchUseCase(churchRepo).execute({
      name: 'Eglise Adventiste', city: 'Antananarivo', country: 'Madagascar',
    });
    return {
      church, userRepo, churchRepo,
      register: new RegisterUseCase(userRepo, churchRepo, passwords),
      login: new LoginUseCase(userRepo, passwords),
      bootstrap: new BootstrapUseCase(churchRepo, userRepo, passwords),
    };
  }

  it('login par email uniquement', async () => {
    const { church, register, login } = await setup();
    await register.execute({
      churchId: church.id, email: 'admin@example.com', password: 'secret123', role: 'ADMIN',
    });
    const out = await login.execute({ email: 'admin@example.com', password: 'secret123' });
    expect(out.email).toBe('admin@example.com');
    expect(out.churchId).toBe(church.id);
  });

  it('rejette email deja utilise', async () => {
    const { church, register } = await setup();
    const input = { churchId: church.id, email: 'a@example.com', password: 'secret123', role: 'ADMIN' as const };
    await register.execute(input);
    await expect(register.execute(input)).rejects.toThrow(ConflictError);
  });

  it('rejette mauvais mot de passe', async () => {
    const { church, register, login } = await setup();
    await register.execute({ churchId: church.id, email: 'b@example.com', password: 'secret123', role: 'ADMIN' });
    await expect(login.execute({ email: 'b@example.com', password: 'wrong' })).rejects.toThrow(UnauthorizedError);
  });

  it('bootstrap cree eglise + admin', async () => {
    const { bootstrap, login } = await setup();
    // Nettoyer les donnees creees par setup() pour tester bootstrap a partir de zero
    await db.delete(users);
    await db.delete(members);
    await db.delete(churches);

    const out = await bootstrap.execute({
      churchName: 'Eglise Unique', city: 'Antananarivo', country: 'Madagascar',
      adminEmail: 'root@example.com', adminPassword: 'secret123',
    });
    expect(out.churchId).toBeDefined();
    const me = await login.execute({ email: 'root@example.com', password: 'secret123' });
    expect(me.role).toBe('ADMIN');
  });

  it('bootstrap refuse si deja initialise', async () => {
    const { bootstrap } = await setup();
    // Nettoyer les donnees creees par setup() pour tester bootstrap a partir de zero
    await db.delete(users);
    await db.delete(members);
    await db.delete(churches);

    await bootstrap.execute({
      churchName: 'Eglise Unique', city: 'Antananarivo', country: 'Madagascar',
      adminEmail: 'first@example.com', adminPassword: 'secret123',
    });
    await expect(bootstrap.execute({
      churchName: 'Autre Eglise', city: 'Toamasina', country: 'Madagascar',
      adminEmail: 'second@example.com', adminPassword: 'secret123',
    })).rejects.toThrow(ConflictError);
  });
});
