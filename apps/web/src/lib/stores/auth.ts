import { writable } from 'svelte/store';
import { browser } from '$app/environment';

export interface AuthUser {
  sub: string; churchId: string; role: string; memberId: string | null;
}

function createAuthStore() {
  const initial: { token: string | null; user: AuthUser | null } = { token: null, user: null };
  if (browser) {
    const token = localStorage.getItem('auth_token');
    const raw = localStorage.getItem('auth_user');
    if (token) initial.token = token;
    if (raw) try { initial.user = JSON.parse(raw); } catch {}
  }
  const { subscribe, set } = writable(initial);
  return {
    subscribe,
    login(token: string, user: AuthUser) {
      if (browser) {
        localStorage.setItem('auth_token', token);
        localStorage.setItem('auth_user', JSON.stringify(user));
      }
      set({ token, user });
    },
    logout() {
      if (browser) {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
      }
      set({ token: null, user: null });
    },
  };
}
export const auth = createAuthStore();
