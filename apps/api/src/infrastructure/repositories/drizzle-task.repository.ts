import { eq } from 'drizzle-orm';
import type { Task } from '../../domain/task/task';
import type { TaskRepository } from '../../domain/task/task.repository';
import type { Db } from '../database/client';
import { tasks } from '../database/schema/task.table';
import { toDomain, toInsert } from '../database/mappers/task.mapper';

export class DrizzleTaskRepository implements TaskRepository {
  constructor(private readonly db: Db) {}
  async findById(id: string): Promise<Task | null> {
    const [row] = await this.db.select().from(tasks).where(eq(tasks.id, id)).limit(1);
    return row ? toDomain(row) : null;
  }
  async findByProgram(programId: string): Promise<Task[]> {
    const rows = await this.db.select().from(tasks).where(eq(tasks.programId, programId));
    return rows.map(toDomain);
  }
  async save(t: Task): Promise<void> { await this.db.insert(tasks).values(toInsert(t)); }
  async update(t: Task): Promise<void> {
    await this.db.update(tasks).set(toInsert(t)).where(eq(tasks.id, t.id));
  }
  async delete(id: string): Promise<void> { await this.db.delete(tasks).where(eq(tasks.id, id)); }
}
