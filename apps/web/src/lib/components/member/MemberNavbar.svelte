<script lang="ts">
  import { auth } from '$lib/stores/auth';
  import { goto } from '$app/navigation';
  import { get } from 'svelte/store';

  function logout() {
    auth.logout();
    goto('/login');
  }

  $: user = get(auth).user;
</script>

<nav class="sticky top-0 z-50 bg-slate-900 border-b border-slate-800 text-white">
  <div class="max-w-6xl mx-auto px-4 md:px-6 h-20 flex items-center justify-between">
    <!-- Logo -->
    <a href="/membre" class="flex items-center gap-3">
      <div class="w-10 h-10 bg-brand-600 rounded-full flex items-center justify-center text-white">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20"></path><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
      </div>
      <div class="font-bold text-lg leading-tight">SDA Soanierana<br><span class="text-[10px] font-normal text-slate-400">Espace Membre</span></div>
    </a>
    
    <!-- Menu Membre -->
    <div class="hidden md:flex items-center gap-8 font-medium text-sm">
      <a href="/membre" class="text-white border-b-2 border-brand-500 pb-1">Mon Espace</a>
      <a href="/" class="text-slate-300 hover:text-white transition">Site Public</a>
    </div>

    <!-- Profil & Déconnexion -->
    <div class="flex items-center gap-4">
      <div class="flex items-center gap-2">
        <div class="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold">
          M
        </div>
        <span class="text-sm font-medium hidden sm:block">Membre</span>
      </div>
      <button on:click={logout} class="bg-slate-800 hover:bg-red-500/20 text-slate-300 hover:text-red-400 px-3 py-2 rounded-lg transition flex items-center gap-2 text-sm font-medium">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
        <span class="hidden sm:inline">Déconnexion</span>
      </button>
    </div>
  </div>
</nav>
