import type { SkillRepository } from '../../domain/skill/skill.repository';

export class ListSkillsUseCase {
  constructor(private readonly skills: SkillRepository) {}
  async execute(churchId: string) {
    const list = await this.skills.findByChurch(churchId);
    return list.map((s) => ({ id: s.id, name: s.name }));
  }
}
