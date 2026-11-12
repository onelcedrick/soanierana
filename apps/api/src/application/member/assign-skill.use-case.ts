import type { MemberRepository } from '../../domain/member/member.repository';
import { NotFoundError } from '../../shared/errors';
import { db } from '../../infrastructure/database/client';
import { memberSkills } from '../../infrastructure/database/schema/skill.table';
import { randomUUID } from 'node:crypto';

export interface AssignSkillInput {
  memberId: string;
  skillId: string;
}

export class AssignSkillUseCase {
  constructor(private readonly members: MemberRepository) {}

  async execute(input: AssignSkillInput): Promise<{ success: boolean }> {
    const member = await this.members.findById(input.memberId);
    if (!member) throw new NotFoundError('Membre');
    
    // Vérifier si déjà assigné (optionnel, on peut utiliser ON CONFLICT DO NOTHING)
    try {
      await db.insert(memberSkills).values({
        id: randomUUID(),
        memberId: input.memberId,
        skillId: input.skillId,
        createdAt: new Date(),
      });
    } catch (e) {
      // Ignore les erreurs de doublons
    }
    return { success: true };
  }
}
