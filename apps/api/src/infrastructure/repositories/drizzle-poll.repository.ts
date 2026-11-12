import { and, count, eq } from 'drizzle-orm';
import { randomUUID } from 'node:crypto';
import type { Poll } from '../../domain/poll/poll';
import type { PollOption } from '../../domain/poll/poll-option';
import type { PollVote } from '../../domain/poll/poll-vote';
import type { PollRepository, PollResultRow, PollParticipation, DetailedVoteRow } from '../../domain/poll/poll.repository';
import type { Db } from '../database/client';
import { polls, pollOptions, pollVotes, pollParticipations } from '../database/schema/poll.table';
import { users } from '../database/schema/user.table';
import { members } from '../database/schema/member.table';
import { toDomain, toInsert, optionToDomain, optionToInsert } from '../database/mappers/poll.mapper';

export class DrizzlePollRepository implements PollRepository {
  constructor(private readonly db: Db) {}

  async findById(id: string): Promise<Poll | null> {
    const [row] = await this.db.select().from(polls).where(eq(polls.id, id)).limit(1);
    return row ? toDomain(row) : null;
  }
  async findByChurch(churchId: string): Promise<Poll[]> {
    const rows = await this.db.select().from(polls).where(eq(polls.churchId, churchId));
    return rows.map(toDomain);
  }
  async save(p: Poll): Promise<void> { await this.db.insert(polls).values(toInsert(p)); }
  async update(p: Poll): Promise<void> {
    await this.db.update(polls).set(toInsert(p)).where(eq(polls.id, p.id));
  }
  async delete(id: string): Promise<void> {
    await this.db.delete(polls).where(eq(polls.id, id));
  }

  async findOptions(pollId: string): Promise<PollOption[]> {
    const rows = await this.db.select().from(pollOptions).where(eq(pollOptions.pollId, pollId));
    return rows.map(optionToDomain).sort((a, b) => a.position - b.position);
  }
  async saveOption(o: PollOption): Promise<void> {
    await this.db.insert(pollOptions).values(optionToInsert(o));
  }

  async findOrCreateParticipation(pollId: string, token: string): Promise<PollParticipation> {
    const [existing] = await this.db
      .select()
      .from(pollParticipations)
      .where(and(eq(pollParticipations.pollId, pollId), eq(pollParticipations.token, token)))
      .limit(1);
    if (existing) return { id: existing.id, pollId: existing.pollId, token: existing.token };
    const id = randomUUID();
    await this.db.insert(pollParticipations).values({ id, pollId, token, createdAt: new Date() });
    return { id, pollId, token };
  }

  async hasUserVoted(pollId: string, userId: string): Promise<boolean> {
    const [row] = await this.db
      .select({ value: count() })
      .from(pollVotes)
      .where(and(eq(pollVotes.pollId, pollId), eq(pollVotes.userId, userId)));
    return (row?.value ?? 0) > 0;
  }

  async saveVote(v: PollVote): Promise<void> {
    await this.db.insert(pollVotes).values({
      id: v.id, pollId: v.pollId, optionId: v.optionId,
      participationId: v.participationId, userId: v.userId, createdAt: v.createdAt,
    });
  }

  async countVotesByOption(pollId: string): Promise<PollResultRow[]> {
    const rows = await this.db
      .select({ optionId: pollVotes.optionId, label: pollOptions.label, count: count() })
      .from(pollVotes)
      .innerJoin(pollOptions, eq(pollOptions.id, pollVotes.optionId))
      .where(eq(pollVotes.pollId, pollId))
      .groupBy(pollVotes.optionId, pollOptions.label);
    return rows.map((r) => ({ optionId: r.optionId, label: r.label, count: Number(r.count) }));
  }

  async getDetailedVotes(pollId: string): Promise<DetailedVoteRow[]> {
    const rows = await this.db
      .select({
        optionId: pollVotes.optionId,
        optionLabel: pollOptions.label,
        userEmail: users.email,
        firstName: members.firstName,
        lastName: members.lastName
      })
      .from(pollVotes)
      .innerJoin(pollOptions, eq(pollOptions.id, pollVotes.optionId))
      .leftJoin(users, eq(pollVotes.userId, users.id))
      .leftJoin(members, eq(users.memberId, members.id))
      .where(eq(pollVotes.pollId, pollId));

    return rows.map(r => ({
      optionId: r.optionId,
      optionLabel: r.optionLabel,
      voterName: r.firstName ? `${r.firstName} ${r.lastName}` : null,
      voterEmail: r.userEmail ?? null
    }));
  }
}
