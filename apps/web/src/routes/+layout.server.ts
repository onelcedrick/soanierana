import type { LayoutServerLoad } from './$types';
import { PUBLIC_API_URL } from '$env/static/public';

export const load: LayoutServerLoad = async ({ fetch }) => {
  try {
    const API_ROOT = PUBLIC_API_URL ? PUBLIC_API_URL.replace('/api', '') : 'http://localhost:3000';
    const res = await fetch(`${API_ROOT}/api/church/default`);
    if (res.ok) {
      const church = await res.json();
      return { church };
    }
  } catch (error) {
    console.error("Erreur chargement église SSR", error);
  }
  return { church: null };
};
