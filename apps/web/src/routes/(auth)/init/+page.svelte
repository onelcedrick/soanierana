<script lang="ts">
  import { bootstrap, getStatus } from '$lib/api/auth';
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';

  let form = {
    churchName: 'Eglise Adventiste', city: 'Antananarivo', country: 'Madagascar',
    adminEmail: '', adminPassword: '',
  };
  let error = '';
  let loading = false;

  onMount(async () => {
    try {
      const status = await getStatus();
      if (status.initialized) goto('/login');
    } catch {}
  });

  async function onSubmit(e: Event) {
    e.preventDefault();
    error = '';
    loading = true;
    try {
      await bootstrap(form);
      goto('/login');
    } catch (err) {
      error = err instanceof Error ? err.message : 'Erreur';
    } finally {
      loading = false;
    }
  }
</script>

<div class="max-w-md mx-auto bg-white p-6 rounded shadow-sm border border-slate-200">
  <h1 class="text-2xl font-bold mb-1">Premiere configuration</h1>
  <p class="text-sm text-slate-500 mb-4">Creez l'eglise et le compte administrateur.</p>
  {#if error}<p class="text-red-600 mb-3 text-sm">{error}</p>{/if}
  <form on:submit={onSubmit} class="space-y-3">
    <label class="block">
      <span class="text-sm text-slate-700">Nom de l'eglise</span>
      <input bind:value={form.churchName} required class="mt-1 w-full border border-slate-300 rounded px-3 py-2" />
    </label>
    <div class="grid grid-cols-2 gap-2">
      <label class="block">
        <span class="text-sm text-slate-700">Ville</span>
        <input bind:value={form.city} required class="mt-1 w-full border border-slate-300 rounded px-3 py-2" />
      </label>
      <label class="block">
        <span class="text-sm text-slate-700">Pays</span>
        <input bind:value={form.country} required class="mt-1 w-full border border-slate-300 rounded px-3 py-2" />
      </label>
    </div>
    <label class="block">
      <span class="text-sm text-slate-700">Email admin</span>
      <input type="email" bind:value={form.adminEmail} required class="mt-1 w-full border border-slate-300 rounded px-3 py-2" />
    </label>
    <label class="block">
      <span class="text-sm text-slate-700">Mot de passe admin (8+ caracteres)</span>
      <input type="password" bind:value={form.adminPassword} required minlength="8" class="mt-1 w-full border border-slate-300 rounded px-3 py-2" />
    </label>
    <button type="submit" disabled={loading} class="w-full bg-slate-900 text-white rounded py-2 disabled:opacity-50">
      {loading ? 'Initialisation...' : "Creer l'eglise et l'admin"}
    </button>
  </form>
</div>
