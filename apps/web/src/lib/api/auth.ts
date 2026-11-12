import { apiFetch } from './client';
import type { AuthResponse } from './types';

export function login(email: string, password: string): Promise<AuthResponse> {
  return apiFetch<AuthResponse>('/auth/login', { method: 'POST', body: { email, password } });
}

export function bootstrap(input: {
  churchName: string; city: string; country: string;
  adminEmail: string; adminPassword: string;
}): Promise<{ churchId: string; userId: string }> {
  return apiFetch('/auth/bootstrap', { method: 'POST', body: input });
}

export function getStatus(): Promise<{ initialized: boolean }> {
  return apiFetch('/auth/status');
}

export function getDefaultChurch(): Promise<{ id: string; name: string; city: string; country: string }> {
  return apiFetch('/church/default');
}
