import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import { CreateChurchUseCase } from '../../src/application/church/create-church.use-case';
import { CreateMemberUseCase } from '../../src/application/member/create-member.use-case';
import { DrizzleChurchRepository } from '../../src/infrastructure/repositories/drizzle-church.repository';
import { DrizzleMemberRepository } from '../../src/infrastructure/repositories/drizzle-member.repository';
import { db, pool } from '../../src/infrastructure/database/client';
import { members } from '../../src/infrastructure/database/schema/member.table';
import { churches } from '../../src/infrastructure/database/schema/church.table';
import { ConflictError, NotFoundError } from '../../src/shared/errors';

async function setup() {
  const churchRepo = new DrizzleChurchRepository(db);
  const memberRepo = new DrizzleMemberRepository(db);
  const church = await new CreateChurchUseCase(churchRepo).execute({
    name: 'Eglise Adventiste', city: 'Antananarivo', country: 'Madagascar',
  });
  return { church, createMember: new CreateMemberUseCase(memberRepo, churchRepo) };
}

describe('CreateMemberUseCase (integration)', () => {
  beforeEach(async () => {
    await db.delete(members);
    await db.delete(churches);
  });
  afterAll(async () => { await pool.end(); });

  it('cree un membre', async () => {
    const { church, createMember } = await setup();
    const m = await createMember.execute({
      churchId: church.id, firstName: 'Jean', lastName: 'Rakoto',
      email: 'jean@example.com', phone: '+261340000000',
      membershipStatus: 'LOCAL_BAPTIZED', responsibilityLevel: 'MAMBRA_TSOTRA',
    });
    expect(m.id).toBeDefined();
  });

  it('rejette eglise inconnue', async () => {
    const { createMember } = await setup();
    await expect(createMember.execute({
      churchId: '22222222-2222-4222-8222-222222222222',
      firstName: 'Jean', lastName: 'Rakoto',
      email: 'jean@example.com', phone: '+261340000000',
      membershipStatus: 'LOCAL_BAPTIZED', responsibilityLevel: 'MAMBRA_TSOTRA',
    })).rejects.toThrow(NotFoundError);
  });

  it('rejette email en double', async () => {
    const { church, createMember } = await setup();
    const input = {
      churchId: church.id, firstName: 'Jean', lastName: 'Rakoto',
      email: 'jean@example.com', phone: '+261340000000',
      membershipStatus: 'LOCAL_BAPTIZED' as const, responsibilityLevel: 'MAMBRA_TSOTRA' as const,
    };
    await createMember.execute(input);
    await expect(createMember.execute(input)).rejects.toThrow(ConflictError);
  });
});
