import type { PageServerLoad } from './$types';
import { PUBLIC_API_URL } from '$env/static/public';

export const load: PageServerLoad = async ({ fetch, parent }) => {
  const { church } = await parent(); // Récupéré du layout
  if (!church || !church.id) return { publications: [] };

  try {
    const res = await fetch(`${PUBLIC_API_URL}/publications/public?churchId=${church.id}`);
    if (res.ok) {
      const publications = await res.json();
      // On trie les publications par date
      publications.sort((a: any, b: any) => new Date(b.publishedAt || 0).getTime() - new Date(a.publishedAt || 0).getTime());
      return { publications };
    }
  } catch (error) {
    console.error("Erreur SSR actualités", error);
  }
  return { publications: [] };
};
