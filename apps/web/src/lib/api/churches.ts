import { apiFetch } from './client';
import type { Church } from './types';

export function getDefaultChurch(): Promise<Church> {
  return apiFetch<Church>('/church/default');
}
