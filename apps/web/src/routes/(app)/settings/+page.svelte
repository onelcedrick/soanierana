<script lang="ts">
  import { auth } from '$lib/stores/auth';
  import { getSettings, updateSettings, updateChurchBranding, type SiteSettings } from '$lib/api/settings';
  import { generatePalette, applyTheme } from '$lib/theme/color-engine';
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';
  import { get } from 'svelte/store';

  let loading = true;
  let message = '';
  let error = '';

  let settings: SiteSettings | null = null;
  let savingSettings = false;

  // Branding (Logo & Image)
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
      
      const res = await fetch('http://localhost:3000/api/church/default', { cache: 'no-store' });
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

  // --- COMPRESSION IMAGE ---
  function compressImage(file: File, maxW: number, format: string, quality: number, callback: (base64: string) => void) {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width, height = img.height;
        if (width > maxW) { height *= maxW / width; width = maxW; }
        canvas.width = width; canvas.height = height;
        canvas.getContext('2d')?.drawImage(img, 0, 0, width, height);
        callback(canvas.toDataURL(format, quality));
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  }

  function handleLogoUpload(e: Event) {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (file) compressImage(file, 400, 'image/png', 0.9, (b64) => logoPreview = b64);
  }

  function handleFileUpload(e: Event) {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (file) compressImage(file, 1200, 'image/jpeg', 0.8, (b64) => newCoverPreview = b64);
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
      await fetch(`http://localhost:3000/api/churches/${get(auth).user!.churchId}/theme`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${get(auth).token}` },
        body: JSON.stringify({ themeConfig: { primaryColor, isDark: isDarkMode } })
      });
      themeMsg = 'Thème enregistré !';
      setTimeout(() => window.location.reload(), 1000);
    } catch (err) { themeMsg = 'Erreur thème.'; } finally { savingTheme = false; }
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
      <svg class="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
      Chargement...
    </div>
  {:else if error && !settings}
    <div class="bg-red-50 text-red-600 p-4 rounded-xl border border-red-200 flex items-start gap-2">
      <svg class="mt-0.5 shrink-0" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" x2="12" y1="8" y2="12"></line><line x1="12" x2="12.01" y1="16" y2="16"></line></svg>
      {error}
    </div>
  {:else if settings}
    {#if message}
      <div class="bg-green-50 text-green-700 p-4 rounded-xl border border-green-200 flex items-start gap-2 shadow-sm">
        <svg class="mt-0.5 shrink-0" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
        {message}
      </div>
    {/if}
    {#if error}
      <div class="bg-red-50 text-red-600 p-4 rounded-xl border border-red-200 flex items-start gap-2 shadow-sm">
        <svg class="mt-0.5 shrink-0" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" x2="12" y1="8" y2="12"></line><line x1="12" x2="12.01" y1="16" y2="16"></line></svg>
        {error}
      </div>
    {/if}

    <!-- 1. THEME -->
    <div class="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      <div class="p-4 md:p-6 border-b border-slate-100 flex items-center gap-3">
        <div class="w-10 h-10 shrink-0 rounded-lg bg-pink-50 text-pink-600 flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="13.5" cy="6.5" r="2.5"></circle><circle cx="17.5" cy="10.5" r="2.5"></circle><circle cx="8.5" cy="7.5" r="2.5"></circle><circle cx="6.5" cy="12.5" r="2.5"></circle><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"></path></svg>
        </div>
        <div><h2 class="text-lg md:text-xl font-bold text-slate-800">Thème de l'application</h2></div>
      </div>
      <div class="p-4 md:p-6 space-y-4 md:space-y-6">
        {#if themeMsg}<div class="bg-green-50 text-green-700 p-3 rounded-lg text-sm border border-green-100">{themeMsg}</div>{/if}
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1.5">Couleur primaire</label>
              <div class="flex gap-2">
                <!-- Zone de clic agrandie pour mobile -->
                <input type="color" bind:value={primaryColor} on:input={previewTheme} class="w-14 h-12 md:w-12 md:h-10 rounded-lg cursor-pointer border border-slate-300 p-0 shrink-0" />
                <input type="text" bind:value={primaryColor} on:input={previewTheme} class="flex-1 w-full border border-slate-300 px-3 py-2 rounded-lg font-mono text-sm outline-none focus:border-brand-500 transition" />
              </div>
            </div>
            <label class="flex items-center gap-2 text-sm text-slate-700 cursor-pointer bg-slate-50 p-3 rounded-xl border border-slate-200">
              <input type="checkbox" bind:checked={isDarkMode} on:change={previewTheme} class="w-5 h-5 text-brand-600 rounded border-slate-300 focus:ring-brand-500" />
              Activer le mode sombre (Dark Mode)
            </label>
            <!-- Boutons de thème prédéfinis plus tactiles -->
            <div class="flex flex-wrap gap-2 text-xs">
              <button type="button" on:click={() => { primaryColor = '#0ea5e9'; isDarkMode = false; previewTheme(); }} class="bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium px-3 py-1.5 rounded-lg transition">Défaut</button>
              <button type="button" on:click={() => { primaryColor = '#E91E63'; previewTheme(); }} class="bg-pink-50 hover:bg-pink-100 text-pink-700 font-medium px-3 py-1.5 rounded-lg transition">Octobre Rose</button>
              <button type="button" on:click={() => { primaryColor = '#DC2626'; previewTheme(); }} class="bg-red-50 hover:bg-red-100 text-red-700 font-medium px-3 py-1.5 rounded-lg transition">Noël</button>
            </div>
            <button on:click={onSaveTheme} disabled={savingTheme} class="w-full bg-slate-900 text-white font-bold rounded-xl py-3 hover:bg-slate-800 transition disabled:opacity-50 text-sm md:text-base shadow-sm mt-2">
              {savingTheme ? 'Enregistrement...' : 'Enregistrer le thème'}
            </button>
          </div>
          <div class="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col justify-center">
            <p class="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Aperçu</p>
            <div class="bg-white p-4 rounded-lg shadow-sm border border-slate-100">
              <h3 class="font-bold text-slate-900 text-sm mb-1">Titre d'exemple</h3>
              <p class="text-xs text-slate-500 mb-3">Voici comment le texte s'affiche.</p>
              <button class="bg-brand-600 text-white text-xs font-bold px-3 py-2 rounded-lg w-full shadow-sm">Bouton Primaire</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 2. LOGO -->
    <div class="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      <div class="p-4 md:p-6 border-b border-slate-100 flex items-center gap-3">
        <div class="w-10 h-10 shrink-0 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
        </div>
        <div><h2 class="text-lg md:text-xl font-bold text-slate-800">Logo de l'église</h2></div>
      </div>
      <div class="p-4 md:p-6 grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        <div>
          <div class="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center hover:bg-slate-50 transition relative h-32 flex items-center justify-center">
            <input type="file" accept="image/*" on:change={handleLogoUpload} class="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
            <p class="text-sm font-bold text-slate-700">Choisir un logo</p>
          </div>
          <button on:click={onSaveLogo} disabled={savingLogo} class="mt-4 w-full bg-slate-900 text-white font-bold rounded-xl py-3 hover:bg-slate-800 transition disabled:opacity-50 text-sm md:text-base shadow-sm">
            {savingLogo ? 'Enregistrement...' : 'Enregistrer le logo'}
          </button>
        </div>
        <div class="rounded-xl border border-slate-200 bg-slate-50 h-40 flex items-center justify-center p-4">
          {#if logoPreview}
            <img src={logoPreview} alt="Logo" class="max-w-full max-h-full object-contain drop-shadow-sm" />
          {:else}
            <div class="text-slate-400 text-sm flex flex-col items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
              Aucun logo
            </div>
          {/if}
        </div>
      </div>
    </div>

    <!-- 3. IMAGE DE FOND -->
    <div class="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      <div class="p-4 md:p-6 border-b border-slate-100 flex items-center gap-3">
        <div class="w-10 h-10 shrink-0 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
        </div>
        <div><h2 class="text-lg md:text-xl font-bold text-slate-800">Image de fond (Accueil)</h2></div>
      </div>
      <div class="p-4 md:p-6 grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        <div>
          <div class="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center hover:bg-slate-50 transition relative h-32 flex items-center justify-center">
            <input type="file" accept="image/*" on:change={handleFileUpload} class="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
            <p class="text-sm font-bold text-slate-700">Choisir une image</p>
          </div>
          <button on:click={onSaveImage} disabled={savingImage} class="mt-4 w-full bg-slate-900 text-white font-bold rounded-xl py-3 hover:bg-slate-800 transition disabled:opacity-50 text-sm md:text-base shadow-sm">
            {savingImage ? 'Enregistrement...' : 'Enregistrer l\'image'}
          </button>
        </div>
        <div class="rounded-xl overflow-hidden border border-slate-200 bg-slate-50 h-40 flex items-center justify-center">
          {#if newCoverPreview}
            <img src={newCoverPreview} alt="Aperçu" class="w-full h-full object-cover" />
          {:else}
            <div class="text-slate-400 text-sm flex flex-col items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
              Aucune image
            </div>
          {/if}
        </div>
      </div>
    </div>

    <!-- 4. ROTATION -->
    <div class="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      <div class="p-4 md:p-6 border-b border-slate-100 flex items-center gap-3">
        <div class="w-10 h-10 shrink-0 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20"></path><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
        </div>
        <div><h2 class="text-lg md:text-xl font-bold text-slate-800">Stratégie de rotation</h2></div>
      </div>
      <div class="p-4 md:p-6">
        <select bind:value={settings.rotationStrategy} class="w-full md:w-1/2 border border-slate-300 rounded-xl px-4 py-3 outline-none focus:border-brand-500 bg-slate-50 font-medium text-slate-700 text-sm md:text-base cursor-pointer">
          <option value="FAIR_ROTATION">Rotation équitable pondérée</option>
          <option value="ROUND_ROBIN">Tourniquet (Round Robin)</option>
          <option value="LEAST_ASSIGNED">Moins d'attributions en premier</option>
        </select>
        
        <!-- AJOUT DU CYCLE -->
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
