import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import { CreateChurchUseCase } from '../../src/application/church/create-church.use-case';
import { CreateMemberUseCase } from '../../src/application/member/create-member.use-case';
import { ChurchStatsUseCase } from '../../src/application/report/church-stats.use-case';
import { DrizzleChurchRepository } from '../../src/infrastructure/repositories/drizzle-church.repository';
import { DrizzleMemberRepository } from '../../src/infrastructure/repositories/drizzle-member.repository';
import { db, pool } from '../../src/infrastructure/database/client';
import { members } from '../../src/infrastructure/database/schema/member.table';
import { churches } from '../../src/infrastructure/database/schema/church.table';

describe('Phase 8 report (integration)', () => {
  beforeEach(async () => {
    await db.delete(members);
    await db.delete(churches);
  });
  afterAll(async () => { await pool.end(); });

  it('retourne des stats coherentes', async () => {
    const churchRepo = new DrizzleChurchRepository(db);
    const memberRepo = new DrizzleMemberRepository(db);
    const church = await new CreateChurchUseCase(churchRepo).execute({
      name: 'Eglise Adventiste', city: 'Antananarivo', country: 'Madagascar',
    });
    await new CreateMemberUseCase(memberRepo, churchRepo).execute({
      churchId: church.id, firstName: 'A', lastName: 'B',
      email: 'a@example.com', phone: '+261340000000',
      membershipStatus: 'LOCAL_BAPTIZED', responsibilityLevel: 'MAMBRA_TSOTRA',
    });
    const stats = await new ChurchStatsUseCase(db).execute(church.id);
    expect(stats.totalMembers).toBe(1);
    expect(stats.activeMembers).toBe(1);
    expect(stats.totalPrograms).toBe(0);
  });
});
