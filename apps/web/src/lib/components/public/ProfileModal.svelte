<script lang="ts">
  import { auth } from '$lib/stores/auth';
  import { getMyProfile } from '$lib/api/members';
  import { onMount } from 'svelte';
  import { get } from 'svelte/store';
  
  export let show = false;
  export let onClose = () => {};

  let profile: any = null;
  let loading = false;
  let error = '';

  function handleBackdropClick(e: MouseEvent) {
    if (e.target === e.currentTarget) onClose();
  }

  // Charger le profil quand le modal s'ouvre
  $: if (show && !profile && !loading) {
    loadProfile();
  }

  async function loadProfile() {
    const authState = get(auth);
    if (!authState.token || authState.user?.role !== 'MEMBER') return;

    loading = true;
    error = '';
    try {
      profile = await getMyProfile(authState.token);
    } catch (err) {
      error = "Impossible de charger le profil.";
    } finally {
      loading = false;
    }
  }

  function getStatusLabel(status: string) {
    if (status === 'LOCAL_BAPTIZED') return 'Baptisé local';
    if (status === 'EXTERNAL_BAPTIZED') return 'Baptisé externe';
    if (status === 'UNBAPTIZED') return 'Non baptisé';
    return status;
  }

  function getRoleLabel(role: string) {
    if (role === 'LOHOLONA') return 'Responsable';
    if (role === 'DIAKONA') return 'Diacre';
    if (role === 'MAMBRA_TSOTRA') return 'Membre';
    return role;
  }
</script>

{#if show}
  <div 
    class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-transparent" 
    on:click={handleBackdropClick}
    role="presentation"
  >
    <div class="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden relative border border-slate-100" on:click|stopPropagation role="dialog" aria-modal="true">
      
      <!-- Bouton Fermer -->
      <button on:click={onClose} class="absolute top-4 right-4 z-10 text-slate-400 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-full p-1.5 transition">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" x2="6" y1="6" y2="18"></line><line x1="6" x2="18" y1="6" y2="18"></line></svg>
      </button>

      <div class="bg-slate-900 p-6 text-center">
        <div class="w-20 h-20 bg-brand-600 rounded-full flex items-center justify-center mx-auto mb-3 text-white text-2xl font-bold shadow-lg">
          {#if profile}
            {profile.firstName.charAt(0).toUpperCase()}{profile.lastName.charAt(0).toUpperCase()}
          {:else}
            {$auth.user?.role === 'MEMBER' ? 'M' : 'A'}
          {/if}
        </div>
        <h2 class="text-xl font-bold text-white">
          {#if profile}
            {profile.firstName} {profile.lastName}
          {:else}
            {$auth.user?.role}
          {/if}
        </h2>
        <p class="text-slate-400 text-sm mt-1">{$auth.user?.role === 'MEMBER' ? 'Membre de l\'église' : 'Administrateur'}</p>
      </div>

      <div class="p-6 space-y-4">
        {#if loading}
          <p class="text-center text-sm text-slate-500">Chargement des informations...</p>
        {:else if error}
          <p class="text-center text-sm text-red-500">{error}</p>
        {:else if profile}
          
          <div class="flex items-start gap-3">
            <div class="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"></rect><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path></svg>
            </div>
            <div class="flex flex-col">
              <span class="text-xs text-slate-500 font-medium">Email</span>
              <span class="text-sm font-semibold text-slate-800 break-all">{profile.email}</span>
            </div>
          </div>

          <div class="flex items-start gap-3">
            <div class="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
            </div>
            <div class="flex flex-col">
              <span class="text-xs text-slate-500 font-medium">Téléphone</span>
              <span class="text-sm font-semibold text-slate-800">{profile.phone}</span>
            </div>
          </div>

          <div class="flex items-start gap-3">
            <div class="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
            </div>
            <div class="flex flex-col">
              <span class="text-xs text-slate-500 font-medium">Statut d'appartenance</span>
              <span class="text-sm font-semibold text-slate-800">{getStatusLabel(profile.membershipStatus)}</span>
            </div>
          </div>

          <div class="flex items-start gap-3">
            <div class="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
            </div>
            <div class="flex flex-col">
              <span class="text-xs text-slate-500 font-medium">Niveau de responsabilité</span>
              <span class="text-sm font-semibold text-slate-800">{getRoleLabel(profile.responsibilityLevel)}</span>
            </div>
          </div>

        {:else}
          <!-- Cas Administrateur sans profil membre lié -->
          <div class="text-center text-sm text-slate-500 py-4">
            Vous êtes connecté en tant qu'administrateur.
          </div>
          <a href="/dashboard" class="block w-full text-center bg-slate-900 text-white font-bold py-2.5 rounded-xl hover:bg-slate-800 transition">
            Aller au Dashboard Admin
          </a>
        {/if}
      </div>
    </div>
  </div>
{/if}
