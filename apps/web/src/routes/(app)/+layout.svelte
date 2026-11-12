<script lang="ts">
  import { auth } from '$lib/stores/auth';
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';
  import { get } from 'svelte/store';
  import AdminSidebar from '$lib/components/admin/AdminSidebar.svelte';

  // --- RECHERCHE GLOBALE ---
  let searchQuery = '';
  let showSearchResults = false;

  // Données pour la recherche
  const searchData = [
    { title: 'Tableau de bord', path: '/dashboard', keywords: 'accueil home' },
    { title: 'Actualités', path: '/publications', keywords: 'actus articles posts' },
    { title: 'Événements', path: '/events', keywords: 'programmes activités' },
    { title: 'Sondages', path: '/polls', keywords: 'votes enquêtes' },
    { title: 'Membres', path: '/members', keywords: 'utilisateurs fidèles' },
    { title: 'Programmes & Tâches', path: '/programs', keywords: 'affectations rotation' },
    { title: 'Messages', path: '/messages', keywords: 'boite réception contact' },
    { title: 'Formulaires', path: '/forms', keywords: 'enquêtes questions' },
    { title: 'Paramètres', path: '/settings', keywords: 'configuration logo' },
    { title: 'Rapports', path: '/reports', keywords: 'statistiques données' },
    { title: 'Journal d\'activités', path: '/logs', keywords: 'logs historique sécurité' },
  ];

  // Filtrer les résultats
  $: filteredResults = searchData.filter(item => 
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    item.keywords.toLowerCase().includes(searchQuery.toLowerCase())
  );

  function navigateTo(path: string) {
    goto(path);
    searchQuery = '';
    showSearchResults = false;
  }

  function handleSearchKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter' && filteredResults.length > 0) {
      navigateTo(filteredResults[0].path);
    }
  }

  // Fermer les résultats si on clique ailleurs
  function closeSearch() {
    setTimeout(() => showSearchResults = false, 200);
  }

  onMount(() => {
    if (!get(auth).token) goto('/login');
  });
</script>

<div class="flex h-screen bg-[#f8fafc] overflow-hidden font-sans">
  <AdminSidebar />
  <main class="flex-1 flex flex-col min-w-0 overflow-hidden">
    
    <!-- Header épuré -->
    <header class="h-[72px] bg-white flex items-center px-6 flex-shrink-0 z-20 shadow-sm border-b border-slate-200">
      
      <!-- Barre de recherche fonctionnelle -->
      <div class="relative w-full max-w-md">
        <div class="flex items-center gap-3 bg-slate-100/60 px-4 py-2.5 rounded-xl border border-transparent focus-within:border-brand-300 focus-within:bg-white transition">
          <svg class="text-slate-400 shrink-0" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" x2="16.65" y1="21" y2="16.65"></line></svg>
          <input 
            type="text" 
            bind:value={searchQuery} 
            on:focus={() => showSearchResults = true}
            on:blur={closeSearch}
            on:keydown={handleSearchKeydown}
            placeholder="Rechercher une page, un module..." 
            class="bg-transparent border-none outline-none text-sm w-full text-slate-700 placeholder-slate-400" 
          />
          {#if searchQuery}
            <button on:click={() => searchQuery = ''} class="text-slate-400 hover:text-slate-600">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" x2="6" y1="6" y2="18"></line><line x1="6" x2="18" y1="6" y2="18"></line></svg>
            </button>
          {/if}
        </div>

        <!-- Résultats de recherche -->
        {#if showSearchResults && searchQuery.length > 0}
          <div class="absolute top-full left-0 mt-2 w-full bg-white rounded-xl shadow-xl border border-slate-100 py-2 z-50 max-h-80 overflow-y-auto">
            {#if filteredResults.length === 0}
              <div class="px-4 py-3 text-sm text-slate-500 text-center">Aucun résultat pour "{searchQuery}"</div>
            {:else}
              {#each filteredResults as result}
                <button 
                  on:click={() => navigateTo(result.path)}
                  class="w-full text-left px-4 py-2.5 hover:bg-slate-50 flex items-center gap-3 transition text-sm font-medium text-slate-700"
                >
                  <div class="w-6 h-6 rounded-md bg-slate-100 flex items-center justify-center text-slate-500 shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"></path></svg>
                  </div>
                  {result.title}
                </button>
              {/each}
            {/if}
          </div>
        {/if}
      </div>

    </header>

    <!-- Contenu principal -->
    <div class="flex-1 overflow-y-auto p-6 md:p-8 bg-[#f8fafc]">
      <div class="max-w-[1400px] mx-auto">
        <slot />
      </div>
    </div>
  </main>
</div>
