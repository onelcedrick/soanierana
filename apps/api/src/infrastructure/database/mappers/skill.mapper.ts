import { Skill } from '../../../domain/skill/skill';
import type { SkillRow, NewSkillRow } from '../schema/skill.table';

export function toDomain(row: SkillRow): Skill {
  return Skill.reconstitute({ id: row.id, churchId: row.churchId, name: row.name, createdAt: row.createdAt });
}
export function toInsert(s: Skill): NewSkillRow {
  return { id: s.id, churchId: s.churchId, name: s.name, createdAt: s.createdAt };
}
