import { describe, expect, it } from 'vitest';
import { Member } from '../../src/domain/member/member';
import { InvariantViolationError } from '../../src/domain/shared/errors';

const base = {
  churchId: '11111111-1111-4111-8111-111111111111',
  firstName: 'Jean', lastName: 'Rakoto',
  email: 'jean@example.com', phone: '+261 34 00 000 00',
  membershipStatus: 'LOCAL_BAPTIZED' as const,
  responsibilityLevel: 'MAMBRA_TSOTRA' as const,
};

describe('Member', () => {
  it('cree un membre valide', () => {
    const m = Member.create(base);
    expect(m.fullName).toBe('Jean Rakoto');
    expect(m.isActive).toBe(true);
  });
  it('normalise email', () => {
    const m = Member.create({ ...base, email: 'JEAN@EXAMPLE.COM' });
    expect(m.email.value).toBe('jean@example.com');
  });
  it('rejette email invalide', () => {
    expect(() => Member.create({ ...base, email: 'bad' })).toThrow(InvariantViolationError);
  });
  it('change statut', () => {
    const m = Member.create(base);
    m.changeMembershipStatus('UNBAPTIZED');
    expect(m.membershipStatus).toBe('UNBAPTIZED');
  });
});
