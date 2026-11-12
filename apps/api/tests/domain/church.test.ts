import { describe, expect, it } from 'vitest';
import { Church } from '../../src/domain/church/church';
import { InvariantViolationError } from '../../src/domain/shared/errors';

describe('Church', () => {
  it('cree une eglise valide', () => {
    const c = Church.create({ name: 'Eglise Adventiste', city: 'Antananarivo', country: 'Madagascar' });
    expect(c.id).toBeDefined();
    expect(c.name).toBe('Eglise Adventiste');
  });
  it('rejette un nom trop court', () => {
    expect(() => Church.create({ name: 'A', city: 'Antananarivo', country: 'Madagascar' })).toThrow(InvariantViolationError);
  });
});
