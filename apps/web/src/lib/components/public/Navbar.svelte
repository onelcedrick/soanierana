<script lang="ts">
  import { PUBLIC_API_URL } from '$env/static/public';
  import { auth } from '$lib/stores/auth';
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';
  import { donationBell } from '$lib/stores/donationBell'; // Import du nouveau store
  import ProfileModal from './ProfileModal.svelte';
  import MessageModal from './MessageModal.svelte';
  import LoginModal from './LoginModal.svelte';
  
  export let transparent = false;
  
  let showDropdown = false;
  let showMobileMenu = false;
  let showProfileModal = false;
  let showMessageModal = false;
  let showLoginModal = false;

  let logoUrl = '';
  let churchName = 'Eglise Adventiste';
  let scrolled = false;

  onMount(async () => {
    const handleScroll = () => {
      scrolled = window.scrollY > 20;
    };
    window.addEventListener('scroll', handleScroll);
    handleScroll();

    try {
      const res = await fetch(`${PUBLIC_API_URL}/church/default`, { cache: 'no-store' });
      if (res.ok) {
        const church = await res.json();
        if (church.name) churchName = church.name;
        if (church.logoUrl) logoUrl = church.logoUrl;
      }
    } catch (err) {
      console.error('Erreur chargement logo', err);
    }

    return () => window.removeEventListener('scroll', handleScroll);
  });

  function logout() {
    auth.logout();
    goto('/');
    showMobileMenu = false;
  }

  function closeDropdown() { showDropdown = false; }
  function openProfile() { showProfileModal = true; showDropdown = false; }
  function openMessage() { showMessageModal = true; showDropdown = false; }
</script>

<svelte:window on:click={closeDropdown} />

<nav class="fixed top-0 left-0 right-0 z-50 transition-all duration-300 {scrolled || !transparent || showMobileMenu ? 'bg-slate-900 text-white shadow-md' : 'bg-transparent text-white'}">
  <div class="max-w-6xl mx-auto px-4 md:px-6 h-16 md:h-20 flex items-center justify-between relative z-50">
    
    <!-- Logo, Nom et Cloche -->
    <div class="flex items-center gap-3">
      <a href="/" class="flex items-center gap-2 md:gap-3" on:click={() => showMobileMenu = false}>
        {#if logoUrl}
          <img src={logoUrl} alt="Logo" class="w-10 h-10 object-contain rounded-full bg-white p-0.5" />
        {:else}
          <div class="w-10 h-10 bg-brand-600 rounded-full flex items-center justify-center text-white">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2L3 9h18L12 2z"></path><path d="M5 9v11h14V9"></path><path d="M9 22V12h6v10"></path><path d="M12 12v10"></path></svg>
          </div>
        {/if}
        <div class="font-bold text-base md:text-xl leading-tight max-w-[150px] md:max-w-[200px] truncate">
          {churchName}
        </div>
      </a>

      <!-- CLOCHE ANIMÉE -->
      {#if $donationBell}
        <a href="/notre-eglise" on:click={() => donationBell.hide()} class="relative p-2 bg-white/10 hover:bg-brand-500 rounded-full transition-colors group cursor-pointer" title="Faire un don pour la reconstruction">
          <div class="animate-bell">
            <svg class="text-brand-400 group-hover:text-white transition-colors" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"></path>
              <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"></path>
            </svg>
          </div>
          <span class="absolute top-1 right-1 flex h-2.5 w-2.5">
            <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span class="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500 border border-slate-900"></span>
          </span>
        </a>
      {/if}
    </div>
    
    <!-- Menu Desktop -->
    <div class="hidden md:flex items-center gap-8 font-medium text-sm">
      <a href="/" class="hover:opacity-80 transition">Accueil</a>
      <a href="/actualites" class="hover:opacity-80 transition">Actualités</a>
      <a href="/evenements" class="hover:opacity-80 transition">Événements</a>
      <a href="/sondages" class="hover:opacity-80 transition">Sondages</a>
      <a href="/notre-eglise" class="hover:opacity-80 transition">Notre Église</a>
      <a href="/contact" class="hover:opacity-80 transition">Contact</a>
    </div>

    <!-- Zone de connexion / Profil / Menu Mobile -->
    <div class="flex items-center gap-1 sm:gap-4">
      
      {#if $auth.token}
        <div class="relative" on:click|stopPropagation={() => {}}>
          <button on:click={() => { showDropdown = !showDropdown; showMobileMenu = false; }} class="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 border border-white/20 px-3 py-2 rounded-full transition text-white">
            <div class="w-6 h-6 rounded-full bg-brand-600 flex items-center justify-center text-xs font-bold">
              {$auth.user?.role === 'MEMBER' ? 'M' : 'AD'}
            </div>
            <span class="text-sm font-medium hidden sm:block">Connecté</span>
            <svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>
          </button>

          {#if showDropdown}
            <div class="fixed inset-0 z-40 md:hidden" on:click={() => showDropdown = false} role="presentation"></div>
            <div class="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl shadow-2xl p-6 pb-10 text-slate-800 md:absolute md:bottom-auto md:left-auto md:right-0 md:top-full md:mt-3 md:w-64 md:rounded-xl md:border md:border-slate-100 md:p-2 md:pb-2 md:shadow-xl">
              <div class="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-6 md:hidden"></div>
              <button on:click={openProfile} class="flex items-center gap-3 px-4 py-3 md:py-2 hover:bg-slate-50 rounded-lg text-sm font-medium w-full text-left transition">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-slate-400"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                Mon Profil
              </button>
              <button on:click={openMessage} class="flex items-center gap-3 px-4 py-3 md:py-2 hover:bg-slate-50 rounded-lg text-sm font-medium w-full text-left transition">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-slate-400"><rect width="20" height="16" x="2" y="4" rx="2"></rect><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path></svg>
                Envoyer un message
              </button>
              {#if $auth.user?.role !== 'MEMBER'}
                <a href="/dashboard" class="flex items-center gap-3 px-4 py-3 md:py-2 hover:bg-slate-50 rounded-lg text-sm font-medium transition">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-slate-400"><rect width="7" height="9" x="3" y="3" rx="1"></rect><rect width="7" height="5" x="14" y="3" rx="1"></rect><rect width="7" height="9" x="14" y="12" rx="1"></rect><rect width="7" height="5" x="3" y="16" rx="1"></rect></svg>
                  Dashboard Admin
                </a>
              {/if}
              <div class="border-t border-slate-100 mt-2 pt-2 md:my-1"></div>
              <button on:click={logout} class="flex items-center gap-3 px-4 py-3 md:py-2 hover:bg-red-50 rounded-lg text-red-600 text-sm font-medium w-full text-left transition">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                Déconnexion
              </button>
            </div>
          {/if}
        </div>
      {:else}
        <div class="relative" on:click|stopPropagation={() => {}}>
          <button on:click={() => { showLoginModal = true; showMobileMenu = false; }} class="bg-white text-slate-900 p-2.5 sm:px-6 sm:py-2.5 rounded-full font-medium text-xs md:text-sm flex items-center gap-2 shadow-sm hover:shadow-md transition">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
            <span class="hidden sm:inline">Se connecter</span>
          </button>
          
          <LoginModal bind:show={showLoginModal} onClose={() => showLoginModal = false} />
        </div>
      {/if}

      <!-- Bouton Hamburger (Mobile) -->
      <button on:click={() => { showMobileMenu = !showMobileMenu; showDropdown = false; }} class="md:hidden text-white p-2 -mr-2 relative z-50 shrink-0">
        {#if showMobileMenu}
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" x2="6" y1="6" y2="18"></line><line x1="6" x2="18" y1="6" y2="18"></line></svg>
        {:else}
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="4" x2="20" y1="12" y2="12"></line><line x1="4" x2="20" y1="6" y2="6"></line><line x1="4" x2="20" y1="18" y2="18"></line></svg>
        {/if}
      </button>

    </div>
  </div>
</nav>

<!-- Menu Mobile Plein Écran -->
{#if showMobileMenu}
  <div class="fixed inset-0 z-40 bg-[#0b1120] md:hidden flex flex-col pt-20 animate-in slide-in-from-top-4 duration-200">
    <div class="flex flex-col gap-2 text-white text-lg font-medium px-6 pt-4">
      <a href="/" class="py-4 border-b border-white/10 hover:text-brand-400 transition flex justify-between items-center" on:click={() => showMobileMenu = false}>
        Accueil
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
      </a>
      <a href="/actualites" class="py-4 border-b border-white/10 hover:text-brand-400 transition flex justify-between items-center" on:click={() => showMobileMenu = false}>
        Actualités
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
      </a>
      <a href="/evenements" class="py-4 border-b border-white/10 hover:text-brand-400 transition flex justify-between items-center" on:click={() => showMobileMenu = false}>
        Événements
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
      </a>
      <a href="/sondages" class="py-4 border-b border-white/10 hover:text-brand-400 transition flex justify-between items-center" on:click={() => showMobileMenu = false}>
        Sondages
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
      </a>
      <a href="/notre-eglise" class="py-4 border-b border-white/10 hover:text-brand-400 transition flex justify-between items-center" on:click={() => showMobileMenu = false}>
        Notre Église
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
      </a>
      <a href="/contact" class="py-4 hover:text-brand-400 transition flex justify-between items-center" on:click={() => showMobileMenu = false}>
        Contact
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
      </a>
    </div>
  </div>
{/if}

<ProfileModal bind:show={showProfileModal} onClose={() => showProfileModal = false} />
<MessageModal bind:show={showMessageModal} onClose={() => showMessageModal = false} />
