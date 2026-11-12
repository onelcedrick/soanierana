import type { Member } from './member';

export interface MemberRepository {
  findById(id: string): Promise<Member | null>;
  findByEmail(churchId: string, email: string): Promise<Member | null>;
  findByChurch(churchId: string): Promise<Member[]>;
  save(member: Member): Promise<void>;
  update(member: Member): Promise<void>;
  delete(id: string): Promise<void>;
}
