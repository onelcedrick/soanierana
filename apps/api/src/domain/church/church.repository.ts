import type { Church } from './church';

export interface ChurchRepository {
  findById(id: string): Promise<Church | null>;
  findAll(): Promise<Church[]>;
  save(church: Church): Promise<void>;
  update(church: Church): Promise<void>;
  delete(id: string): Promise<void>;
}
