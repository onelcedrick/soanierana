import { randomUUID } from 'node:crypto';
import { z } from 'zod';

export const UuidSchema = z.string().uuid();

export function generateId(): string {
  return randomUUID();
}
