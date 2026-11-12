import { and, count, eq } from 'drizzle-orm';
import type { User } from '../../domain/user/user';
import type { UserRepository } from '../../domain/user/user.repository';
import type { Db } from '../database/client';
import { users } from '../database/schema/user.table';
import { toDomain, toInsert } from '../database/mappers/user.mapper';

export class DrizzleUserRepository implements UserRepository {
  constructor(private readonly db: Db) {}

  async findById(id: string): Promise<User | null> {
    const [row] = await this.db.select().from(users).where(eq(users.id, id)).limit(1);
    return row ? toDomain(row) : null;
  }

  async findByEmail(churchId: string, email: string): Promise<User | null> {
    const [row] = await this.db
      .select()
      .from(users)
      .where(and(eq(users.churchId, churchId), eq(users.email, email.toLowerCase())))
      .limit(1);
    return row ? toDomain(row) : null;
  }

  async findByEmailAcrossChurches(email: string): Promise<User | null> {
    const [row] = await this.db
      .select()
      .from(users)
      .where(eq(users.email, email.toLowerCase()))
      .limit(1);
    return row ? toDomain(row) : null;
  }

  async countAll(): Promise<number> {
    const [row] = await this.db.select({ value: count() }).from(users);
    return Number(row?.value ?? 0);
  }

  async save(user: User): Promise<void> {
    await this.db.insert(users).values(toInsert(user));
  }
  async update(user: User): Promise<void> {
    await this.db.update(users).set(toInsert(user)).where(eq(users.id, user.id));
  }
  async delete(id: string): Promise<void> {
    await this.db.delete(users).where(eq(users.id, id));
  }
}
