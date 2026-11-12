import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import { CreateChurchUseCase } from '../../src/application/church/create-church.use-case';
import { CreatePollUseCase } from '../../src/application/poll/create-poll.use-case';
import { PublishPollUseCase } from '../../src/application/poll/publish-poll.use-case';
import { ClosePollUseCase } from '../../src/application/poll/close-poll.use-case';
import { CastPublicVoteUseCase } from '../../src/application/poll/cast-public-vote.use-case';
import { CastMemberVoteUseCase } from '../../src/application/poll/cast-member-vote.use-case';
import { GetPollResultsUseCase } from '../../src/application/poll/get-poll-results.use-case';
import { RegisterUseCase } from '../../src/application/auth/register.use-case';
import { PasswordService } from '../../src/application/auth/password.service';
import { DrizzleChurchRepository } from '../../src/infrastructure/repositories/drizzle-church.repository';
import { DrizzlePollRepository } from '../../src/infrastructure/repositories/drizzle-poll.repository';
import { DrizzleUserRepository } from '../../src/infrastructure/repositories/drizzle-user.repository';
import { db, pool } from '../../src/infrastructure/database/client';
import { pollVotes, pollParticipations, pollOptions, polls } from '../../src/infrastructure/database/schema/poll.table';
import { users } from '../../src/infrastructure/database/schema/user.table';
import { churches } from '../../src/infrastructure/database/schema/church.table';

describe('Phase 7 (integration)', () => {
  beforeEach(async () => {
    await db.delete(pollVotes);
    await db.delete(pollParticipations);
    await db.delete(pollOptions);
    await db.delete(polls);
    await db.delete(users);
    await db.delete(churches);
  });
  afterAll(async () => { await pool.end(); });

  async function setup() {
    const churchRepo = new DrizzleChurchRepository(db);
    const pollRepo = new DrizzlePollRepository(db);
    const userRepo = new DrizzleUserRepository(db);
    const church = await new CreateChurchUseCase(churchRepo).execute({
      name: 'Eglise Adventiste', city: 'Antananarivo', country: 'Madagascar',
    });
    const admin = await new RegisterUseCase(userRepo, churchRepo, new PasswordService()).execute({
      churchId: church.id, email: 'admin@example.com', password: 'secret123', role: 'ADMIN',
    });
    return { church, admin, churchRepo, pollRepo };
  }

  it('cree, publie, vote public et affiche resultats', async () => {
    const { church, pollRepo, churchRepo } = await setup();
    const create = new CreatePollUseCase(pollRepo, churchRepo);
    const publish = new PublishPollUseCase(pollRepo);
    const vote = new CastPublicVoteUseCase(pollRepo);
    const results = new GetPollResultsUseCase(pollRepo);

    const poll = await create.execute({
      churchId: church.id, title: 'Choix du chant', audience: 'PUBLIC',
      opensAt: '2026-01-01T00:00:00.000Z', closesAt: '2027-01-01T00:00:00.000Z',
      showResultsBeforeClose: true,
      options: ['Chant A', 'Chant B'],
    });
    expect(poll.status).toBe('DRAFT');
    await publish.execute(poll.id);
    const options = await pollRepo.findOptions(poll.id);
    const r = await vote.execute({ pollId: poll.id, token: 'token-12345678', optionIds: [options[0]!.id] });
    expect(r.votes).toBe(1);
    const out = await results.execute(poll.id);
    expect(out.visible).toBe(true);
    expect(out.results.find((x) => x.optionId === options[0]!.id)?.count).toBe(1);
  });

  it('vote membre reserve', async () => {
    const { church, admin, pollRepo, churchRepo } = await setup();
    const create = new CreatePollUseCase(pollRepo, churchRepo);
    const publish = new PublishPollUseCase(pollRepo);
    const memberVote = new CastMemberVoteUseCase(pollRepo);
    const close = new ClosePollUseCase(pollRepo);
    const results = new GetPollResultsUseCase(pollRepo);

    const poll = await create.execute({
      churchId: church.id, title: 'Sondage interne', audience: 'MEMBERS_ONLY',
      opensAt: '2026-01-01T00:00:00.000Z', closesAt: '2027-01-01T00:00:00.000Z',
      options: ['Oui', 'Non'],
    });
    await publish.execute(poll.id);
    const options = await pollRepo.findOptions(poll.id);
    await memberVote.execute({ pollId: poll.id, userId: admin.id, optionIds: [options[1]!.id] });
    const before = await results.execute(poll.id);
    expect(before.visible).toBe(false);
    await close.execute(poll.id);
    const after = await results.execute(poll.id);
    expect(after.visible).toBe(true);
    expect(after.results.find((x) => x.optionId === options[1]!.id)?.count).toBe(1);
  });
});
