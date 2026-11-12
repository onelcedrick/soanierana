import type { User } from './user';

export interface UserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(churchId: string, email: string): Promise<User | null>;
  findByEmailAcrossChurches(email: string): Promise<User | null>;
  countAll(): Promise<number>;
  save(user: User): Promise<void>;
  update(user: User): Promise<void>;
  delete(id: string): Promise<void>;
}
