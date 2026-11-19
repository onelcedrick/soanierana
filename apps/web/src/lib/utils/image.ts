/**
 * Optimise une URL Cloudinary en ajoutant la compression et le format automatique
 */
export function optimizeCloudinaryUrl(url: string | null | undefined, width: number = 800): string {
  if (!url) return '';
  
  // Si ce n'est pas une URL Cloudinary (ex: image Base64 ou autre), on la renvoie telle quelle
  if (!url.includes('res.cloudinary.com')) return url;

  // On injecte les paramètres de transformation dans l'URL
  // q_auto = qualité automatique, f_auto = format automatique (WebP/AVIF), w_800 = largeur max
  return url.replace('/image/upload/', `/image/upload/q_auto,f_auto,w_${width}/`);
}
