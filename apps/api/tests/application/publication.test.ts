import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import { CreateChurchUseCase } from '../../src/application/church/create-church.use-case';
import { CreatePublicationUseCase } from '../../src/application/publication/create-publication.use-case';
import { PublishPublicationUseCase } from '../../src/application/publication/publish-publication.use-case';
import { ListPublicationsUseCase } from '../../src/application/publication/list-publications.use-case';
import { DrizzleChurchRepository } from '../../src/infrastructure/repositories/drizzle-church.repository';
import { DrizzlePublicationRepository } from '../../src/infrastructure/repositories/drizzle-publication.repository';
import { db, pool } from '../../src/infrastructure/database/client';
import { publications, eventCategories } from '../../src/infrastructure/database/schema/publication.table';
import { churches } from '../../src/infrastructure/database/schema/church.table';

describe('Phase 8 publications (integration)', () => {
  beforeEach(async () => {
    await db.delete(publications);
    await db.delete(eventCategories);
    await db.delete(churches);
  });
  afterAll(async () => { await pool.end(); });

  it('cree, publie et liste', async () => {
    const churchRepo = new DrizzleChurchRepository(db);
    const pubRepo = new DrizzlePublicationRepository(db);
    const church = await new CreateChurchUseCase(churchRepo).execute({
      name: 'Eglise Adventiste', city: 'Antananarivo', country: 'Madagascar',
    });
    const create = new CreatePublicationUseCase(pubRepo, churchRepo);
    const publish = new PublishPublicationUseCase(pubRepo);
    const list = new ListPublicationsUseCase(pubRepo);

    const pub = await create.execute({
      churchId: church.id, title: 'Vaovao', content: 'Contenu', audience: 'PUBLIC',
    });
    expect(pub.status).toBe('DRAFT');
    await publish.execute(pub.id);
    const all = await list.execute({ churchId: church.id, audience: 'PUBLIC' });
    expect(all.length).toBe(1);
    expect(all[0]!.title).toBe('Vaovao');
  });
});
