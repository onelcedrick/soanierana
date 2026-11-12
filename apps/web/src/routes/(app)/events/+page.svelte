<script lang="ts">
  import { auth } from '$lib/stores/auth';
  import { listEvents, createEvent, type Event } from '$lib/api/events';
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';

  let events: Event[] = [];
  let loading = true;
  let form = {
    title: '', description: '', startDate: '', endDate: '', location: '',
    coverImageUrl: '',
  };
  let message = '';
  let error = '';

  onMount(async () => {
    if (!$auth.token) return goto('/login');
    await load();
  });

  async function load() {
    loading = true;
    try {
      events = await listEvents($auth.user!.churchId);
    } catch (err) { error = 'Erreur chargement'; }
    finally { loading = false; }
  }

  async function handleFileUpload(e: Event) {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      form.coverImageUrl = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  }

  async function onSubmit(e: Event) {
    e.preventDefault();
    message = ''; error = '';
    try {
      await createEvent({
        ...form,
        churchId: $auth.user!.churchId,
        startDate: new Date(form.startDate).toISOString(),
        endDate: form.endDate ? new Date(form.endDate).toISOString() : null,
      }, $auth.token!);
      message = 'Événement créé !';
      form = { title: '', description: '', startDate: '', endDate: '', location: '', coverImageUrl: '' };
      await load();
    } catch (err) { error = 'Erreur creation'; }
  }
</script>

<h1 class="text-2xl font-bold mb-6">Gestion des événements</h1>
{#if message}<p class="text-green-700 text-sm mb-3">{message}</p>{/if}
{#if error}<p class="text-red-600 text-sm mb-3">{error}</p>{/if}

<form on:submit={onSubmit} class="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 grid gap-4 mb-8 md:grid-cols-2">
  <h2 class="md:col-span-2 font-bold text-lg text-slate-800">Créer un événement spécial</h2>
  
  <div class="md:col-span-2">
    <label class="block text-sm font-medium text-slate-700 mb-1">Titre de l'événement</label>
    <input bind:value={form.title} required class="w-full border px-3 py-2 rounded-lg" placeholder="Ex: Retraite Spirituelle" />
  </div>

  <div class="md:col-span-2">
    <label class="block text-sm font-medium text-slate-700 mb-1">Description</label>
    <textarea bind:value={form.description} rows="3" class="w-full border px-3 py-2 rounded-lg" placeholder="Détails de l'événement..."></textarea>
  </div>

  <div>
    <label class="block text-sm font-medium text-slate-700 mb-1">Date de début</label>
    <input type="datetime-local" bind:value={form.startDate} required class="w-full border px-3 py-2 rounded-lg" />
  </div>
  <div>
    <label class="block text-sm font-medium text-slate-700 mb-1">Date de fin (optionnel)</label>
    <input type="datetime-local" bind:value={form.endDate} class="w-full border px-3 py-2 rounded-lg" />
  </div>

  <div>
    <label class="block text-sm font-medium text-slate-700 mb-1">Lieu</label>
    <input bind:value={form.location} class="w-full border px-3 py-2 rounded-lg" placeholder="Ex: Temple Principal" />
  </div>

  <div>
    <label class="block text-sm font-medium text-slate-700 mb-1">Photo (Upload)</label>
    <input type="file" accept="image/*" on:change={handleFileUpload} class="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
    {#if form.coverImageUrl}
      <img src={form.coverImageUrl} alt="Preview" class="mt-2 h-20 w-32 object-cover rounded-lg border" />
    {/if}
  </div>

  <button type="submit" class="md:col-span-2 bg-brand-600 text-white rounded-xl py-3 font-medium hover:bg-brand-500 transition">Créer l'événement</button>
</form>

<h2 class="text-xl font-bold mb-4">Tous les événements</h2>
<div class="grid gap-4 md:grid-cols-2">
  {#each events as ev}
    <div class="bg-white p-4 rounded-xl border border-slate-200 flex gap-4 items-center">
      {#if ev.coverImageUrl}
        <img src={ev.coverImageUrl} alt={ev.title} class="w-20 h-20 object-cover rounded-lg" />
      {:else}
        <div class="w-20 h-20 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400 text-xs">Pas de photo</div>
      {/if}
      <div>
        <h3 class="font-bold text-slate-900">{ev.title}</h3>
        <p class="text-sm text-slate-500">{new Date(ev.startDate).toLocaleDateString('fr-FR')}</p>
        <p class="text-xs text-slate-400">{ev.location || 'Lieu non défini'}</p>
      </div>
    </div>
  {/each}
</div>
