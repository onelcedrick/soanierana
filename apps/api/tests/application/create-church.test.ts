import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import { CreateChurchUseCase } from '../../src/application/church/create-church.use-case';
import { DrizzleChurchRepository } from '../../src/infrastructure/repositories/drizzle-church.repository';
import { db, pool } from '../../src/infrastructure/database/client';
import { churches } from '../../src/infrastructure/database/schema/church.table';

describe('CreateChurchUseCase (integration)', () => {
  const repo = new DrizzleChurchRepository(db);

  beforeEach(async () => {
    await db.delete(churches);
  });

  afterAll(async () => {
    await pool.end();
  });

  it('persiste une eglise', async () => {
    const out = await new CreateChurchUseCase(repo).execute({
      name: 'Eglise Adventiste', city: 'Antananarivo', country: 'Madagascar',
    });
    expect(out.id).toBeDefined();
    const found = await repo.findById(out.id);
    expect(found?.name).toBe('Eglise Adventiste');
  });
});
