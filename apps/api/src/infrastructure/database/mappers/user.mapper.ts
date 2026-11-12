import { User } from '../../../domain/user/user';
import { Email } from '../../../domain/shared/email';
import type { UserRow, NewUserRow } from '../schema/user.table';

export function toDomain(row: UserRow): User {
  return User.reconstitute({
    id: row.id,
    churchId: row.churchId,
    memberId: row.memberId,
    email: Email.create(row.email),
    passwordHash: row.passwordHash,
    role: row.role,
    isActive: row.isActive,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  });
}

export function toInsert(user: User): NewUserRow {
  return {
    id: user.id,
    churchId: user.churchId,
    memberId: user.memberId,
    email: user.email.value,
    passwordHash: user.passwordHash,
    role: user.role,
    isActive: user.isActive,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}
