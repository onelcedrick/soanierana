import { Member } from '../../../domain/member/member';
import { Email } from '../../../domain/shared/email';
import { Phone } from '../../../domain/shared/phone';
import type { MemberRow, NewMemberRow } from '../schema/member.table';

export function toDomain(row: MemberRow): Member {
  return Member.reconstitute({
    id: row.id,
    churchId: row.churchId,
    firstName: row.firstName,
    lastName: row.lastName,
    email: Email.create(row.email),
    phone: Phone.create(row.phone),
    membershipStatus: row.membershipStatus,
    responsibilityLevel: row.responsibilityLevel,
    isActive: row.isActive,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  });
}

export function toInsert(member: Member): NewMemberRow {
  return {
    id: member.id,
    churchId: member.churchId,
    firstName: member.firstName,
    lastName: member.lastName,
    email: member.email.value,
    phone: member.phone.value,
    membershipStatus: member.membershipStatus,
    responsibilityLevel: member.responsibilityLevel,
    isActive: member.isActive,
    createdAt: member.createdAt,
    updatedAt: member.updatedAt,
  };
}
