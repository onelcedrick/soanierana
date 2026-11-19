import { get } from 'svelte/store';
import { auth } from '$lib/stores/auth';
import { PUBLIC_API_URL } from '$env/static/public';
import { normalizeHeicFile } from 'heic-normalize';

export async function uploadToCloudinary(file: File, folder: string = 'church_app'): Promise<string> {
  // 1. Normaliser le fichier (HEIC → JPEG) si nécessaire
  let processedFile = file;
  try {
    processedFile = await normalizeHeicFile(file);
  } catch (err) {
    console.warn("Impossible de normaliser le fichier, envoi du fichier original.", err);
    // On continue avec le fichier original, au cas où c'est un format supporté
  }

  const token = get(auth).token;
  if (!token) throw new Error("Utilisateur non connecté");

  // 2. Obtenir la signature depuis le backend
  const signRes = await fetch(`${PUBLIC_API_URL}/cloudinary/sign`, {
    method: 'POST',
    headers: { 
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json' 
    },
    body: JSON.stringify({ folder })
  });
  
  if (!signRes.ok) throw new Error("Erreur de signature Cloudinary");
  const { timestamp, signature, cloudName, apiKey } = await signRes.json();

  // 3. Uploader vers Cloudinary
  const formData = new FormData();
  formData.append('file', processedFile); // ← fichier normalisé
  formData.append('api_key', apiKey);
  formData.append('timestamp', timestamp.toString());
  formData.append('signature', signature);
  formData.append('folder', folder);

  // ⚠️ NE PAS définir manuellement 'Content-Type' pour FormData
  const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: 'POST',
    body: formData
  });
  
  if (!uploadRes.ok) throw new Error('Erreur lors de l\'upload sur Cloudinary');
  
  const data = await uploadRes.json();
  return data.secure_url;
}
