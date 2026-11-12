import type { Program } from './program';

export interface ProgramRepository {
  findById(id: string): Promise<Program | null>;
  findByChurch(churchId: string): Promise<Program[]>;
  save(program: Program): Promise<void>;
  update(program: Program): Promise<void>;
  delete(id: string): Promise<void>;
}
