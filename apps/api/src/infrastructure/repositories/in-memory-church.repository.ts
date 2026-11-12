import type { Church } from '../../domain/church/church';
import type { ChurchRepository } from '../../domain/church/church.repository';

export class InMemoryChurchRepository implements ChurchRepository {
  private readonly store = new Map<string, Church>();
  async findById(id: string): Promise<Church | null> { return this.store.get(id) ?? null; }
  async findAll(): Promise<Church[]> { return Array.from(this.store.values()); }
  async save(c: Church): Promise<void> { this.store.set(c.id, c); }
  async update(c: Church): Promise<void> { this.store.set(c.id, c); }
  async delete(id: string): Promise<void> { this.store.delete(id); }
}
