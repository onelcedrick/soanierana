import { db } from '../../infrastructure/database/client';
import { members } from '../../infrastructure/database/schema/member.table';
import { memberSkills } from '../../infrastructure/database/schema/skill.table';
import { skills } from '../../infrastructure/database/schema/skill.table';
import { eq } from 'drizzle-orm';

export class ExportMembersUseCase {
  async execute(churchId: string): Promise<string> {
    const allMembers = await db.select().from(members).where(eq(members.churchId, churchId));
    
    // Récupérer toutes les compétences
    const allSkills = await db.select().from(skills).where(eq(skills.churchId, churchId));
    const skillMap = new Map(allSkills.map(s => [s.id, s.name]));

    // Récupérer les associations membre-compétence
    const allLinks = await db.select().from(memberSkills);
    const memberToSkills = new Map<string, string[]>();
    for (const link of allLinks) {
      const skillName = skillMap.get(link.skillId);
      if (skillName) {
        if (!memberToSkills.has(link.memberId)) memberToSkills.set(link.memberId, []);
        memberToSkills.get(link.memberId)!.push(skillName);
      }
    }

    // Générer le CSV
    const headers = ['Prenom', 'Nom', 'Email', 'Telephone', 'Statut', 'Responsabilite', 'Competences'];
    const rows = allMembers.map(m => {
      const memberSkillNames = memberToSkills.get(m.id) || [];
      return [
        m.firstName,
        m.lastName,
        m.email,
        m.phone,
        m.membershipStatus,
        m.responsibilityLevel,
        memberSkillNames.join(', ')
      ];
    });

    const csvContent = [headers, ...rows].map(e => e.join(';')).join('\n');
    return csvContent;
  }
}
