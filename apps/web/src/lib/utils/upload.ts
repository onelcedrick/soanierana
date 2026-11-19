import { get } from 'svelte/store';
import { auth } from '$lib/stores/auth';
import { PUBLIC_API_URL } from '$env/static/public';

/**
 * Envoie un fichier sur Cloudinary et retourne l'URL sécurisée.
 * @param file Le fichier à uploader
 * @param folder Le dossier Cloudinary (ex: 'branding', 'publications')
 */
export async function uploadToCloudinary(file: File, folder: string = 'church_app'): Promise<string> {
  const token = get(auth).token;
  if (!token) throw new Error("Utilisateur non connecté");

  // 1. Obtenir la signature depuis le backend
  const signRes = await fetch(`${PUBLIC_API_URL}/cloudinary/sign`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` }
  });
  
  if (!signRes.ok) throw new Error("Erreur de signature Cloudinary");
  const { timestamp, signature, cloudName, apiKey } = await signRes.json();

  // 2. Uploader vers Cloudinary
  const formData = new FormData();
  formData.append('file', file);
  formData.append('api_key', apiKey);
  formData.append('timestamp', timestamp.toString());
  formData.append('signature', signature);
  formData.append('folder', folder);

  const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: 'POST',
    body: formData
  });
  
  if (!uploadRes.ok) throw new Error('Erreur lors de l\'upload sur Cloudinary');
  
  const data = await uploadRes.json();
  return data.secure_url;
}
