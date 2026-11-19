<script lang="ts">
  import { auth } from '$lib/stores/auth';
  import { login } from '$lib/api/auth';
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';
  import { PUBLIC_API_URL } from '$env/static/public';

  let email = '';
  let password = '';
  let error = '';
  let loading = false;
  let churchName = 'ChurchTask';
  let logoUrl = '';

  onMount(async () => {
    try {
      const res = await fetch(`${PUBLIC_API_URL}/church/default`, { cache: 'no-store' });
      if (res.ok) {
        const church = await res.json();
        if (church.name) churchName = church.name;
        if (church.logoUrl) logoUrl = church.logoUrl;
      }
    } catch (e) {
      console.error(e);
    }
  });

  async function handleSubmit(e: Event) {
    e.preventDefault();
    loading = true;
    error = '';
    try {
      const response = await login({ email, password });
      auth.login(response.token, response.user);
      goto('/dashboard');
    } catch (err: any) {
      error = err.message || 'Identifiants invalides';
    } finally {
      loading = false;
    }
  }
</script>

<svelte:head>
  <title>Connexion - {churchName}</title>
</svelte:head>

<div class="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4">
  <!-- Logo & Nom -->
  <div class="mb-8 text-center">
    {#if logoUrl}
      <img src={logoUrl} alt="Logo" class="w-20 h-20 object-contain mx-auto mb-4 rounded-2xl bg-white p-2 shadow-sm" />
    {:else}
      <div class="w-20 h-20 bg-brand-600 rounded-full flex items-center justify-center mx-auto mb-4 text-white shadow-sm">
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 9h4"></path><path d="M12 7v4"></path><path d="M4 21v-8l8-6 8 6v8"></path><path d="M8 21v-4a4 4 0 0 1 8 0v4"></path></svg>
      </div>
    {/if}
    <h1 class="text-2xl font-bold text-slate-900">{churchName}</h1>
    <p class="text-sm text-slate-500 mt-1">Connectez-vous à votre espace</p>
  </div>

  <!-- Carte de connexion -->
  <div class="bg-white p-6 sm:p-8 rounded-3xl shadow-xl border border-slate-100 w-full max-w-md">
    <form on:submit={handleSubmit} class="space-y-5">
      {#if error}
        <div class="bg-red-50 text-red-600 p-3 rounded-xl text-sm border border-red-100 flex items-start gap-2">
          <svg class="mt-0.5 shrink-0" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" x2="12" y1="8" y2="12"></line><line x1="12" x2="12.01" y1="16" y2="16"></line></svg>
          {error}
        </div>
      {/if}

      <div>
        <label for="login-email" class="block text-sm font-medium text-slate-700 mb-1.5">Adresse Email</label>
        <input 
          id="login-email" 
          type="email" 
          bind:value={email} 
          required 
          placeholder="votre@email.com" 
          class="w-full border border-slate-300 px-4 py-3 rounded-xl outline-none focus:border-brand-500 text-sm transition" 
        />
      </div>

      <div>
        <label for="login-password" class="block text-sm font-medium text-slate-700 mb-1.5">Mot de passe</label>
        <input 
          id="login-password" 
          type="password" 
          bind:value={password} 
          required 
          placeholder="••••••••" 
          class="w-full border border-slate-300 px-4 py-3 rounded-xl outline-none focus:border-brand-500 text-sm transition" 
        />
      </div>

      <button 
        type="submit" 
        disabled={loading} 
        class="w-full bg-brand-600 text-white font-bold py-3.5 rounded-xl hover:bg-brand-500 transition disabled:opacity-50 shadow-sm flex items-center justify-center gap-2 mt-2"
      >
        {#if loading}
          <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
          Connexion...
        {:else}
          Se connecter
        {/if}
      </button>
    </form>
  </div>
</div>
