<script lang="ts">
  import { page } from '$app/stores';
  import { auth } from '$lib/stores/auth';
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';

  function logout() {
    auth.logout();
    goto('/');
  }
  
  $: isActive = (path: string) => $page.url.pathname === path;

  let logoUrl = '';
  let churchName = 'SDA Soanierana';

  onMount(async () => {
    try {
      const res = await fetch('http://localhost:3000/api/church/default', { cache: 'no-store' });
      if (res.ok) {
        const church = await res.json();
        if (church.name) churchName = church.name;
        if (church.logoUrl) logoUrl = church.logoUrl;
      }
    } catch (err) {
      console.error('Erreur chargement logo', err);
    }
  });
</script>

<aside class="w-64 bg-[#0b1120] text-slate-300 flex flex-col h-full flex-shrink-0 border-r border-slate-800">
  <!-- Logo & Nom -->
  <div class="h-20 flex items-center px-6 gap-3 flex-shrink-0 border-b border-slate-800">
    {#if logoUrl}
      <img src={logoUrl} alt="Logo" class="w-10 h-10 object-contain rounded-lg bg-white p-1" />
    {:else}
      <div class="text-amber-500">
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20"></path><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
      </div>
    {/if}
    <div class="leading-tight overflow-hidden">
      <span class="text-white font-bold text-lg block truncate">{churchName}</span>
    </div>
  </div>

  <!-- Navigation -->
  <nav class="flex-1 overflow-y-auto py-4 px-4 space-y-6">
    
    <!-- Section principale -->
    <div class="space-y-1">
      <a href="/dashboard" class="flex items-center gap-3 px-3 py-2.5 rounded-lg transition {isActive('/dashboard') ? 'bg-[#1e293b] text-white border-l-4 border-amber-500' : 'hover:bg-slate-800/50 hover:text-white'}">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="7" height="9" x="3" y="3" rx="1"></rect><rect width="7" height="5" x="14" y="3" rx="1"></rect><rect width="7" height="9" x="14" y="12" rx="1"></rect><rect width="7" height="5" x="3" y="16" rx="1"></rect></svg>
        <span class="font-medium text-sm">Tableau de bord</span>
      </a>
    </div>

    <!-- Gestion principale -->
    <div>
      <p class="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Gestion principale</p>
      <div class="space-y-0.5">
        <a href="/publications" class="flex items-center gap-3 px-3 py-2 rounded-lg transition {isActive('/publications') ? 'text-white bg-slate-800' : 'hover:text-white hover:bg-slate-800/50'}">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"></path><path d="M18 14h-8"></path><path d="M15 18h-5"></path><path d="M10 6h8v4h-8V6Z"></path></svg>
          <span class="text-sm">Actualités</span>
        </a>
        <a href="/events" class="flex items-center gap-3 px-3 py-2 rounded-lg transition {isActive('/events') ? 'text-white bg-slate-800' : 'hover:text-white hover:bg-slate-800/50'}">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"></rect><line x1="16" x2="16" y1="2" y2="6"></line><line x1="8" x2="8" y1="2" y2="6"></line><line x1="3" x2="21" y1="10" y2="10"></line></svg>
          <span class="text-sm">Événements</span>
        </a>
        <a href="/polls" class="flex items-center gap-3 px-3 py-2 rounded-lg transition {isActive('/polls') ? 'text-white bg-slate-800' : 'hover:text-white hover:bg-slate-800/50'}">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 20V10"></path><path d="M12 20V4"></path><path d="M6 20v-6"></path></svg>
          <span class="text-sm">Sondages</span>
        </a>
        <a href="/members" class="flex items-center gap-3 px-3 py-2 rounded-lg transition {isActive('/members') ? 'text-white bg-slate-800' : 'hover:text-white hover:bg-slate-800/50'}">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
          <span class="text-sm">Membres</span>
        </a>
        <a href="/programs" class="flex items-center gap-3 px-3 py-2 rounded-lg transition {isActive('/programs') ? 'text-white bg-slate-800' : 'hover:text-white hover:bg-slate-800/50'}">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 11 3 3L22 4"></path><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path></svg>
          <span class="text-sm">Programmes & Tâches</span>
        </a>
        <a href="/messages" class="flex items-center gap-3 px-3 py-2 rounded-lg transition {isActive('/messages') ? 'text-white bg-slate-800' : 'hover:text-white hover:bg-slate-800/50'}">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"></rect><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path></svg>
          <span class="text-sm">Messages</span>
        </a>
        <a href="/forms" class="flex items-center gap-3 px-3 py-2 rounded-lg transition {isActive('/forms') ? 'text-white bg-slate-800' : 'hover:text-white hover:bg-slate-800/50'}">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
          <span class="text-sm">Formulaires</span>
        </a>
        <a href="/campaigns" class="flex items-center gap-3 px-3 py-2 rounded-lg transition {isActive('/campaigns') ? 'text-white bg-slate-800' : 'hover:text-white hover:bg-slate-800/50'}">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20"></path><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
          <span class="text-sm">Campagne</span>
        </a>
        <a href="/donations" class="flex items-center gap-3 px-3 py-2 rounded-lg transition {isActive('/donations') ? 'text-white bg-slate-800' : 'hover:text-white hover:bg-slate-800/50'}">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="12" x="2" y="6" rx="2"></rect><circle cx="12" cy="12" r="2"></circle><path d="M6 12h.01M18 12h.01"></path></svg>
          <span class="text-sm">Campagne & Dons</span>
        </a>
      </div>
    </div>

    <!-- Paramètres -->
    <div>
      <p class="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Paramètres</p>
      <div class="space-y-0.5">
        <a href="/settings" class="flex items-center gap-3 px-3 py-2 rounded-lg transition {isActive('/settings') ? 'text-white bg-slate-800' : 'hover:text-white hover:bg-slate-800/50'}">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
          <span class="text-sm">Paramètres</span>
        </a>
        <a href="/reports" class="flex items-center gap-3 px-3 py-2 rounded-lg transition {isActive('/reports') ? 'text-white bg-slate-800' : 'hover:text-white hover:bg-slate-800/50'}">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
          <span class="text-sm">Rapports</span>
        </a>
        <a href="/logs" class="flex items-center gap-3 px-3 py-2 rounded-lg transition {isActive('/logs') ? 'text-white bg-slate-800' : 'hover:text-white hover:bg-slate-800/50'}">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
          <span class="text-sm">Journal d'activités</span>
        </a>
      </div>
    </div>
  </nav>

  <!-- Footer : Profil + Déconnexion -->
  <div class="p-4 border-t border-slate-800 flex-shrink-0">
    <div class="flex items-center justify-between bg-slate-800/50 p-2 rounded-lg">
      <div class="flex items-center gap-3 px-1">
        <div class="w-8 h-8 rounded-full bg-brand-600 flex items-center justify-center text-white text-xs font-bold">
          {$auth.user?.role === 'MEMBER' ? 'M' : 'AD'}
        </div>
        <div class="flex flex-col">
          <span class="text-sm font-medium text-white">{$auth.user?.role}</span>
          <span class="text-[10px] text-slate-400">Connecté</span>
        </div>
      </div>
      <button on:click={logout} class="text-slate-400 hover:text-red-400 p-2 rounded-lg transition" title="Déconnexion">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
      </button>
    </div>
  </div>
</aside>
