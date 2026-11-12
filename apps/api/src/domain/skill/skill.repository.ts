import type { Skill } from './skill';

export interface SkillRepository {
  findById(id: string): Promise<Skill | null>;
  findByChurch(churchId: string): Promise<Skill[]>;
  save(skill: Skill): Promise<void>;
  delete(id: string): Promise<void>;
}
