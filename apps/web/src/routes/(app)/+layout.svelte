<script lang="ts">
  import { auth } from '$lib/stores/auth';
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';
  import { get } from 'svelte/store';
  import { page } from '$app/stores';
  import ConfirmModal from '$lib/components/ui/ConfirmModal.svelte';
  import AdminSidebar from '$lib/components/admin/AdminSidebar.svelte';

  // --- ÉTAT DU MENU ---
  let isSidebarOpen = true; 

  // Fermer le menu automatiquement sur mobile lors d'un changement de page
  $: if ($page.url.pathname) {
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      setTimeout(() => { isSidebarOpen = false; }, 150);
    }
  }

  // --- RECHERCHE GLOBALE ---
  let searchQuery = '';
  let showSearchResults = false;

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

  function closeSearch() {
    setTimeout(() => showSearchResults = false, 200);
  }

  onMount(() => {
    if (!get(auth).token) goto('/login');

    // Fonction pour ajuster l'état en fonction de la taille de l'écran
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        isSidebarOpen = true; // Toujours ouvert sur PC
      } else {
        isSidebarOpen = false; // Fermé sur mobile
      }
    };

    // Appliquer immédiatement au chargement
    handleResize();

    // Écouter les changements de taille (ex: redimensionnement, rotation d'écran)
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  });
</script>

<div class="flex h-screen bg-[#f8fafc] overflow-hidden font-sans relative">
  
  <!-- OVERLAY (Fond sombre sur mobile quand le menu est ouvert) -->
  {#if isSidebarOpen}
    <div 
      class="fixed inset-0 bg-slate-900/50 z-40 md:hidden backdrop-blur-sm transition-opacity" 
      on:click={() => isSidebarOpen = false}
      role="presentation"
    ></div>
  {/if}

  <!-- SIDEBAR (Pliable) -->
  <aside 
    class="
      fixed md:relative inset-y-0 left-0 z-50 
      bg-white border-r border-slate-200 shadow-sm
      transition-all duration-300 ease-in-out overflow-hidden
      {isSidebarOpen ? 'translate-x-0 w-[260px]' : '-translate-x-full w-[260px] md:w-0 md:translate-x-0 border-none'}
    "
  >
    <div class="w-[260px] h-full">
      <AdminSidebar />
    </div>
  </aside>

  <!-- CONTENU PRINCIPAL -->
  <main class="flex-1 flex flex-col min-w-0 overflow-hidden">
    
    <!-- Header -->
    <header class="h-[72px] bg-white flex items-center px-4 md:px-6 flex-shrink-0 z-30 shadow-sm border-b border-slate-200 gap-4">
      
      <!-- Bouton pour plier/déplier le menu -->
      <button 
        on:click={() => isSidebarOpen = !isSidebarOpen} 
        class="p-2 -ml-2 text-slate-600 hover:bg-slate-100 rounded-lg transition"
        title={isSidebarOpen ? "Plier le menu" : "Déplier le menu"}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          {#if isSidebarOpen}
            <polyline points="15 18 9 12 15 6"></polyline>
          {:else}
            <line x1="4" x2="20" y1="12" y2="12"></line>
            <line x1="4" x2="20" y1="6" y2="6"></line>
            <line x1="4" x2="20" y1="18" y2="18"></line>
          {/if}
        </svg>
      </button>

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
            placeholder="Rechercher..." 
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

    <!-- Contenu principal (avec scroll indépendant) -->
    <div class="flex-1 overflow-y-auto p-4 md:p-8 bg-[#f8fafc]">
      <div class="max-w-[1400px] mx-auto">
        <slot />
      </div>
    </div>
  </main>

  <ConfirmModal />
</div>
