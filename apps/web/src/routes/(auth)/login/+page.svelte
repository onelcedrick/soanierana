<script lang="ts">
  import { login, getStatus, getDefaultChurch } from '$lib/api/auth';
  import { auth } from '$lib/stores/auth';
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';

  let email = '';
  let password = '';
  let error = '';
  let loading = false;
  let churchName = '';
  let showPassword = false; // État pour l'icône de l'œil

  onMount(async () => {
    try {
      const status = await getStatus();
      if (!status.initialized) {
        goto('/init');
        return;
      }
      const church = await getDefaultChurch();
      churchName = church.name;
    } catch (err) {
      error = "Impossible de joindre le serveur. Veuillez rafraichir la page.";
    }
  });

  async function onSubmit(e: Event) {
    e.preventDefault();
    error = '';
    loading = true;
    try {
      const res = await login(email, password);
      auth.login(res.token, {
        sub: res.user.id, churchId: res.user.churchId,
        role: res.user.role, memberId: res.user.memberId,
      });
      goto('/');
    } catch (err) {
      error = err instanceof Error ? err.message : 'Erreur de connexion';
    } finally {
      loading = false;
    }
  }
</script>

<svelte:head>
  <title>Connexion - ChurchTask</title>
</svelte:head>

<div class="min-h-screen flex items-center justify-center bg-slate-50 relative overflow-hidden px-4 py-8">
  
  <!-- Bouton Retour à l'accueil (Flèche) -->
  <a href="/" class="absolute top-4 left-4 md:top-6 md:left-6 z-20 flex items-center gap-2 text-slate-500 hover:text-brand-600 transition bg-white/50 p-2 rounded-full hover:bg-white shadow-sm">
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
    <span class="hidden sm:inline text-sm font-medium pr-1">Retour</span>
  </a>

  <div class="absolute top-[-10%] left-[-10%] w-96 h-96 bg-brand-200 rounded-full blur-3xl opacity-50 pointer-events-none"></div>
  <div class="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-blue-200 rounded-full blur-3xl opacity-50 pointer-events-none"></div>

  <div class="relative z-10 w-full max-w-md mt-8">
    
    <div class="text-center mb-8">
      <div class="inline-flex items-center justify-center w-16 h-16 bg-white rounded-2xl shadow-lg mb-4">
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-brand-600"><path d="M12 2v20"></path><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
      </div>
      <h1 class="text-2xl font-bold text-slate-900 tracking-tight">ChurchTask</h1>
      {#if churchName}
        <p class="text-sm text-slate-500 mt-1">{churchName}</p>
      {/if}
    </div>

    <div class="bg-white/90 backdrop-blur-md p-6 sm:p-8 rounded-3xl shadow-xl border border-white/50">
      <h2 class="text-xl font-bold text-slate-900 mb-6">Connexion</h2>
      
      {#if error}
        <div class="bg-red-50 text-red-600 p-3 rounded-xl text-sm mb-6 flex items-start gap-2 border border-red-100">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mt-0.5 shrink-0"><circle cx="12" cy="12" r="10"></circle><line x1="12" x2="12" y1="8" y2="12"></line><line x1="12" x2="12.01" y1="16" y2="16"></line></svg>
          <span>{error}</span>
        </div>
      {/if}
      
      <form on:submit={onSubmit} class="space-y-5">
        <!-- Email -->
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1.5">Adresse email</label>
          <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"></rect><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path></svg>
            </div>
            <input 
              type="email" 
              bind:value={email} 
              required 
              placeholder="vous@exemple.com"
              class="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-white/50 focus:bg-white focus:border-brand-500 focus:ring-2 focus:ring-brand-200 transition outline-none text-slate-900" 
            />
          </div>
        </div>

        <!-- Mot de passe avec Œil -->
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1.5">Mot de passe</label>
          <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
            </div>
            <input 
              type={showPassword ? 'text' : 'password'} 
              bind:value={password} 
              required 
              placeholder="••••••••"
              class="w-full pl-10 pr-12 py-3 rounded-xl border border-slate-200 bg-white/50 focus:bg-white focus:border-brand-500 focus:ring-2 focus:ring-brand-200 transition outline-none text-slate-900" 
            />
            <!-- Bouton Œil -->
            <button 
              type="button" 
              on:click={() => showPassword = !showPassword}
              class="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-brand-600 transition focus:outline-none"
            >
              {#if showPassword}
                <!-- Œil barré (cacher) -->
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" x2="22" y1="2" y2="22"/></svg>
              {:else}
                <!-- Œil ouvert (voir) -->
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
              {/if}
            </button>
          </div>
        </div>

        <!-- Bouton Se connecter corrigé -->
        <button 
          type="submit" 
          disabled={loading} 
          class="w-full bg-brand-600 hover:bg-brand-500 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-brand-500/30 disabled:opacity-70 disabled:cursor-not-allowed text-base mt-2"
        >
          {loading ? 'Connexion en cours...' : 'Se connecter'}
        </button>
      </form>
    </div>

    <p class="text-center text-xs text-slate-500 mt-8">
      &copy; 2026 ChurchTask Manager.
    </p>
  </div>
</div>
