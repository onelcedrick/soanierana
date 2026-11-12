import { and, eq } from 'drizzle-orm';
import type { Member } from '../../domain/member/member';
import type { MemberRepository } from '../../domain/member/member.repository';
import type { Db } from '../database/client';
import { members } from '../database/schema/member.table';
import { toDomain, toInsert } from '../database/mappers/member.mapper';

export class DrizzleMemberRepository implements MemberRepository {
  constructor(private readonly db: Db) {}

  async findById(id: string): Promise<Member | null> {
    const [row] = await this.db.select().from(members).where(eq(members.id, id)).limit(1);
    return row ? toDomain(row) : null;
  }

  async findByEmail(churchId: string, email: string): Promise<Member | null> {
    const [row] = await this.db
      .select()
      .from(members)
      .where(and(eq(members.churchId, churchId), eq(members.email, email.toLowerCase())))
      .limit(1);
    return row ? toDomain(row) : null;
  }

  async findByChurch(churchId: string): Promise<Member[]> {
    const rows = await this.db.select().from(members).where(eq(members.churchId, churchId));
    return rows.map(toDomain);
  }

  async save(member: Member): Promise<void> {
    await this.db.insert(members).values(toInsert(member));
  }

  async update(member: Member): Promise<void> {
    await this.db.update(members).set(toInsert(member)).where(eq(members.id, member.id));
  }

  async delete(id: string): Promise<void> {
    await this.db.delete(members).where(eq(members.id, id));
  }
}
