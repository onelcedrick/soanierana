import { Skill } from '../../domain/skill/skill';
import type { SkillRepository } from '../../domain/skill/skill.repository';
import type { ChurchRepository } from '../../domain/church/church.repository';
import { NotFoundError } from '../../shared/errors';

export interface CreateSkillInput { churchId: string; name: string; }
export interface CreateSkillOutput { id: string; churchId: string; name: string; }

export class CreateSkillUseCase {
  constructor(private readonly skills: SkillRepository, private readonly churches: ChurchRepository) {}
  async execute(input: CreateSkillInput): Promise<CreateSkillOutput> {
    const church = await this.churches.findById(input.churchId);
    if (!church) throw new NotFoundError('Eglise');
    const skill = Skill.create(input);
    await this.skills.save(skill);
    return { id: skill.id, churchId: skill.churchId, name: skill.name };
  }
}
