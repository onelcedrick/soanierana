import type { Member } from '../../domain/member/member';
import type { MemberRepository } from '../../domain/member/member.repository';

export class InMemoryMemberRepository implements MemberRepository {
  private readonly store = new Map<string, Member>();
  async findById(id: string): Promise<Member | null> { return this.store.get(id) ?? null; }
  async findByEmail(churchId: string, email: string): Promise<Member | null> {
    for (const m of this.store.values()) {
      if (m.churchId === churchId && m.email.value === email.toLowerCase()) return m;
    }
    return null;
  }
  async findByChurch(churchId: string): Promise<Member[]> {
    return Array.from(this.store.values()).filter((m) => m.churchId === churchId);
  }
  async save(m: Member): Promise<void> { this.store.set(m.id, m); }
  async update(m: Member): Promise<void> { this.store.set(m.id, m); }
  async delete(id: string): Promise<void> { this.store.delete(id); }
}
