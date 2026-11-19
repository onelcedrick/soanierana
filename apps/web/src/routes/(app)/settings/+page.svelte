<script lang="ts">
  import { auth } from '$lib/stores/auth';
  import { getSettings, updateSettings, updateChurchBranding, type SiteSettings } from '$lib/api/settings';
  import { generatePalette, applyTheme } from '$lib/theme/color-engine';
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';
  import { get } from 'svelte/store';
  import { uploadToCloudinary } from '$lib/utils/upload';
  import { PUBLIC_API_URL } from '$env/static/public';

  let loading = true;
  let message = '';
  let error = '';

  let settings: SiteSettings | null = null;
  let savingSettings = false;

  // Branding
  let coverImageUrl = ''; 
  let newCoverPreview = ''; 
  let savingImage = false;
  let logoUrl = ''; 
  let logoPreview = ''; 
  let savingLogo = false;

  // Thème
  let primaryColor = '#0ea5e9';
  let isDarkMode = false;
  let savingTheme = false;
  let themeMsg = '';

  $: totalWeight = settings ? 
    settings.weightParticipation + settings.weightRecency + settings.weightAssignment + 
    settings.weightAvailability + settings.weightSkill : 0;

  onMount(async () => {
    const authState = get(auth);
    if (!authState.token) return goto('/login');
    
    try {
      settings = await getSettings(authState.user!.churchId, authState.token);
      
      const API_ROOT = PUBLIC_API_URL ? PUBLIC_API_URL.replace('/api', '') : 'http://localhost:3000';
      const res = await fetch(`${API_ROOT}/api/church/default`, { cache: 'no-store' });
      
      if (res.ok) {
        const church = await res.json();
        coverImageUrl = church.coverImageUrl || '';
        newCoverPreview = coverImageUrl;
        logoUrl = church.logoUrl || '';
        logoPreview = logoUrl;
        
        if (church.themeConfig) {
          primaryColor = church.themeConfig.primaryColor || '#0ea5e9';
          isDarkMode = church.themeConfig.isDark || false;
        }
      }
    } catch (err) {
      console.error(err);
      error = "Erreur lors du chargement des paramètres.";
    } finally {
      loading = false;
    }
  });

  

  async function uploadToCloudinary(file: File): Promise<string> {
    const token = get(auth).token!;
    const signRes = await fetch(`${PUBLIC_API_URL}/cloudinary/sign`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!signRes.ok) throw new Error("Erreur de signature");
    const { timestamp, signature, cloudName, apiKey } = await signRes.json();

    const formData = new FormData();
    formData.append('file', file);
    formData.append('api_key', apiKey);
    formData.append('timestamp', timestamp.toString());
    formData.append('signature', signature);
    formData.append('folder', 'church_branding');

    const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: 'POST',
      body: formData
    });
    
    if (!uploadRes.ok) throw new Error('Erreur upload Cloudinary');
    const data = await uploadRes.json();
    return data.secure_url;
  }

  async function handleLogoUpload(e: Event) {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (!file) return;
    savingLogo = true; error = '';
    try {
      logoPreview = await uploadToCloudinary(file);
    } catch (err) {
      console.error(err);
      error = "Erreur lors de l'upload du logo sur Cloudinary.";
    } finally {
      savingLogo = false;
    }
  }

  async function handleFileUpload(e: Event) {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (!file) return;
    savingImage = true; error = '';
    try {
      newCoverPreview = await uploadToCloudinary(file);
    } catch (err) {
      console.error(err);
      error = "Erreur lors de l'upload de l'image de fond sur Cloudinary.";
    } finally {
      savingImage = false;
    }
  }

  // --- SAUVEGARDES ---
  async function onSaveLogo() {
    savingLogo = true; message = ''; error = '';
    try {
      await updateChurchBranding(get(auth).user!.churchId, { coverImageUrl, logoUrl: logoPreview }, get(auth).token!);
      logoUrl = logoPreview;
      message = 'Logo mis à jour !';
      setTimeout(() => window.location.reload(), 1000);
    } catch (err) { error = "Erreur logo."; } finally { savingLogo = false; }
  }

  async function onSaveImage() {
    savingImage = true; message = ''; error = '';
    try {
      await updateChurchBranding(get(auth).user!.churchId, { coverImageUrl: newCoverPreview, logoUrl }, get(auth).token!);
      coverImageUrl = newCoverPreview;
      message = 'Image de fond mise à jour !';
    } catch (err) { error = "Erreur image."; } finally { savingImage = false; }
  }

  function previewTheme() {
    const palette = generatePalette(primaryColor, isDarkMode);
    applyTheme(palette);
  }

  async function onSaveTheme() {
    savingTheme = true; themeMsg = '';
    try {
      await fetch(`${PUBLIC_API_URL}/churches/${get(auth).user!.churchId}/theme`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${get(auth).token}` },
        body: JSON.stringify({ themeConfig: { primaryColor, isDark: isDarkMode } })
      });
      
      if (typeof window !== 'undefined') {
        localStorage.setItem('church_theme', JSON.stringify({ primaryColor, isDark: isDarkMode }));
      }

      themeMsg = 'Thème enregistré !';
      setTimeout(() => window.location.reload(), 1000);
    } catch (err) { 
      themeMsg = 'Erreur thème.'; 
    } finally { 
      savingTheme = false; 
    }
  }

  async function onSaveSettings() {
    if (!settings) return;
    if (totalWeight !== 100) return error = 'Le total doit être de 100%.';
    savingSettings = true; message = ''; error = '';
    try {
      await updateSettings(get(auth).user!.churchId, settings, get(auth).token!);
      message = 'Paramètres de rotation enregistrés !';
    } catch (err) { error = 'Erreur sauvegarde.'; } finally { savingSettings = false; }
  }
</script>

<div class="max-w-4xl mx-auto space-y-6 md:space-y-8 pb-12">
  <div>
    <h1 class="text-2xl md:text-3xl font-bold text-slate-900">Paramètres du site</h1>
    <p class="text-sm md:text-base text-slate-500 mt-1">Configurez l'apparence et les règles de l'église.</p>
  </div>

  {#if loading}
    <div class="flex items-center gap-2 text-slate-500">
      <svg class="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">

  <path d="M12 2L3 9h18L12 2z"></path>
  <path d="M5 9v11h14V9"></path>
  <path d="M9 22V12h6v10"></path>
  <path d="M12 12v10"></path>
</svg>
        </div>
        <div><h2 class="text-lg md:text-xl font-bold text-slate-800">Stratégie de rotation</h2></div>
      </div>
      <div class="p-4 md:p-6">
        <select bind:value={settings.rotationStrategy} class="w-full md:w-1/2 border border-slate-300 rounded-xl px-4 py-3 outline-none focus:border-brand-500 bg-slate-50 font-medium text-slate-700 text-sm md:text-base cursor-pointer">
          <option value="FAIR_ROTATION">Rotation équitable pondérée</option>
          <option value="ROUND_ROBIN">Tourniquet (Round Robin)</option>
          <option value="LEAST_ASSIGNED">Moins d'attributions en premier</option>
        </select>
        
        <div class="mt-6 border-t border-slate-100 pt-6">
          <label class="block text-sm font-medium text-slate-700 mb-2">Cycle de rotation (en semaines)</label>
          <p class="text-xs text-slate-500 mb-3">Un membre publié ne sera plus affecté pendant ce nombre de semaines.</p>
          <div class="flex items-center gap-3">
            <input type="range" min="1" max="12" bind:value={settings.rotationCycleWeeks} class="flex-1 accent-brand-600 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer" />
            <span class="bg-brand-50 text-brand-700 font-bold px-3 py-1.5 rounded-lg min-w-[80px] text-center border border-brand-100">{settings.rotationCycleWeeks} sem.</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 5. PONDERATION -->
    <div class="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      <div class="p-4 md:p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 shrink-0 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 20V10"></path><path d="M12 20V4"></path><path d="M6 20v-6"></path></svg>
          </div>
          <div><h2 class="text-lg md:text-xl font-bold text-slate-800">Pondération des critères</h2></div>
        </div>
        <span class="text-sm font-bold px-4 py-1.5 rounded-full {totalWeight === 100 ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-red-100 text-red-700 border border-red-200'} w-fit">
          Total : {totalWeight}%
        </span>
      </div>
      <div class="p-4 md:p-6 space-y-6">
        <div>
          <div class="flex justify-between text-sm font-medium text-slate-700 mb-2"><span>Participations</span><span class="text-brand-600 font-bold">{settings.weightParticipation}%</span></div>
          <input type="range" min="0" max="100" bind:value={settings.weightParticipation} class="w-full accent-brand-600 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer" />
        </div>
        <div>
          <div class="flex justify-between text-sm font-medium text-slate-700 mb-2"><span>Récence</span><span class="text-brand-600 font-bold">{settings.weightRecency}%</span></div>
          <input type="range" min="0" max="100" bind:value={settings.weightRecency} class="w-full accent-brand-600 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer" />
        </div>
        <div>
          <div class="flex justify-between text-sm font-medium text-slate-700 mb-2"><span>Attributions</span><span class="text-brand-600 font-bold">{settings.weightAssignment}%</span></div>
          <input type="range" min="0" max="100" bind:value={settings.weightAssignment} class="w-full accent-brand-600 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer" />
        </div>
        <div>
          <div class="flex justify-between text-sm font-medium text-slate-700 mb-2"><span>Disponibilité</span><span class="text-brand-600 font-bold">{settings.weightAvailability}%</span></div>
          <input type="range" min="0" max="100" bind:value={settings.weightAvailability} class="w-full accent-brand-600 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer" />
        </div>
        <div>
          <div class="flex justify-between text-sm font-medium text-slate-700 mb-2"><span>Compétences</span><span class="text-brand-600 font-bold">{settings.weightSkill}%</span></div>
          <input type="range" min="0" max="100" bind:value={settings.weightSkill} class="w-full accent-brand-600 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer" />
        </div>
      </div>
      <div class="p-4 md:p-6 bg-slate-50 border-t border-slate-100">
        <button on:click={onSaveSettings} disabled={totalWeight !== 100 || savingSettings} class="w-full bg-brand-600 text-white font-bold rounded-xl py-3 hover:bg-brand-500 transition disabled:opacity-50 text-sm md:text-base shadow-sm">
          {savingSettings ? 'Enregistrement...' : 'Enregistrer les paramètres'}
        </button>
      </div>
    </div>
  {/if}
</div>
