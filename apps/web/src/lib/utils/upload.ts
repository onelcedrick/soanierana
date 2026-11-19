import { get } from 'svelte/store';
import { auth } from '$lib/stores/auth';
import { PUBLIC_API_URL } from '$env/static/public';

export async function uploadToCloudinary(file: File, folder: string = 'church_app'): Promise<string> {
  const token = get(auth).token;
  if (!token) throw new Error("Utilisateur non connecté");

  // 🚨 CORRECTION MOBILE : On force le type MIME en image/jpeg
  // Certains navigateurs Android envoient un type MIME vide ou incorrect.
  const safeFile = new File([file], file.name || 'photo.jpg', { type: 'image/jpeg' });

  // 1. Signature
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

  // 2. Envoi
  const formData = new FormData();
  formData.append('file', safeFile); // On envoie le fichier "habillé"
  formData.append('api_key', apiKey);
  formData.append('timestamp', timestamp.toString());
  formData.append('signature', signature);
  formData.append('folder', folder);

  const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: 'POST',
    body: formData
  });
  
  if (!uploadRes.ok) {
    // On affiche la vraie erreur de Cloudinary si ça plante
    const errData = await uploadRes.json().catch(() => ({}));
    throw new Error(errData.error?.message || 'Erreur lors de l\'upload sur Cloudinary');
  }
  
  const data = await uploadRes.json();
  return data.secure_url;
}
