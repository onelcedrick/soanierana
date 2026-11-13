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
    } catch (err) { error = 'Erreur chargement des événements.'; }
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
      message = 'Événement créé avec succès !';
      form = { title: '', description: '', startDate: '', endDate: '', location: '', coverImageUrl: '' };
      await load();
    } catch (err) { error = 'Erreur lors de la création.'; }
  }
</script>

<!-- En-tête de la page -->
<div class="mb-6 md:mb-8 flex items-center gap-3">
  <div class="bg-brand-50 p-2.5 rounded-xl text-brand-600">
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"></rect><line x1="16" x2="16" y1="2" y2="6"></line><line x1="8" x2="8" y1="2" y2="6"></line><line x1="3" x2="21" y1="10" y2="10"></line></svg>
  </div>
  <h1 class="text-2xl md:text-3xl font-bold text-slate-900">Gestion des événements</h1>
</div>

{#if message}
  <div class="text-green-700 text-sm mb-4 p-3 bg-green-50 rounded-lg border border-green-100 flex items-start gap-2">
    <svg class="mt-0.5 shrink-0" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
    {message}
  </div>
{/if}
{#if error}
  <div class="text-red-600 text-sm mb-4 p-3 bg-red-50 rounded-lg border border-red-100 flex items-start gap-2">
    <svg class="mt-0.5 shrink-0" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" x2="12" y1="8" y2="12"></line><line x1="12" x2="12.01" y1="16" y2="16"></line></svg>
    {error}
  </div>
{/if}

<!-- Formulaire de création -->
<form on:submit={onSubmit} class="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-slate-100 grid gap-4 md:gap-5 mb-8 md:grid-cols-2">
  <h2 class="md:col-span-2 font-bold text-lg text-slate-800 border-b border-slate-100 pb-2 flex items-center gap-2">
    <svg class="text-brand-500" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14"></path><path d="M5 12h14"></path></svg>
    Créer un événement spécial
  </h2>
  
  <div class="md:col-span-2">
    <label class="block text-sm font-medium text-slate-700 mb-1.5">Titre de l'événement</label>
    <input bind:value={form.title} required class="w-full border border-slate-300 px-4 py-2.5 md:py-3 rounded-xl outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 text-sm md:text-base transition" placeholder="Ex: Retraite Spirituelle" />
  </div>

  <div class="md:col-span-2">
    <label class="block text-sm font-medium text-slate-700 mb-1.5">Description</label>
    <textarea bind:value={form.description} rows="3" class="w-full border border-slate-300 px-4 py-2.5 md:py-3 rounded-xl outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 text-sm md:text-base resize-y transition" placeholder="Détails de l'événement..."></textarea>
  </div>

  <div class="grid grid-cols-1 sm:grid-cols-2 md:col-span-2 gap-4 md:gap-5">
    <div>
      <label class="block text-sm font-medium text-slate-700 mb-1.5">Date de début</label>
      <input type="datetime-local" bind:value={form.startDate} required class="w-full border border-slate-300 px-4 py-2.5 md:py-3 rounded-xl outline-none focus:border-brand-500 text-sm md:text-base transition" />
    </div>
    <div>
      <label class="block text-sm font-medium text-slate-700 mb-1.5">Date de fin (optionnel)</label>
      <input type="datetime-local" bind:value={form.endDate} class="w-full border border-slate-300 px-4 py-2.5 md:py-3 rounded-xl outline-none focus:border-brand-500 text-sm md:text-base transition" />
    </div>
  </div>

  <div>
    <label class="block text-sm font-medium text-slate-700 mb-1.5">Lieu</label>
    <input bind:value={form.location} class="w-full border border-slate-300 px-4 py-2.5 md:py-3 rounded-xl outline-none focus:border-brand-500 text-sm md:text-base transition" placeholder="Ex: Temple Principal" />
  </div>

  <div>
    <label class="block text-sm font-medium text-slate-700 mb-1.5">Photo de couverture</label>
    <div class="relative">
      <input type="file" accept="image/*" on:change={handleFileUpload} class="w-full text-sm text-slate-500 file:mr-3 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100 cursor-pointer border border-slate-200 rounded-xl bg-slate-50" />
    </div>
    {#if form.coverImageUrl}
      <div class="relative mt-3 w-40 h-24 rounded-lg overflow-hidden border border-slate-200 shadow-sm">
        <img src={form.coverImageUrl} alt="Preview" class="w-full h-full object-cover" />
        <button type="button" on:click={() => form.coverImageUrl = ''} class="absolute top-1 right-1 bg-white/90 backdrop-blur-sm rounded-full p-1 shadow-sm text-slate-500 hover:text-red-500 hover:bg-red-50 transition">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" x2="6" y1="6" y2="18"></line><line x1="6" x2="18" y1="6" y2="18"></line></svg>
        </button>
      </div>
    {/if}
  </div>

  <button type="submit" class="md:col-span-2 bg-brand-600 text-white rounded-xl py-3.5 font-bold hover:bg-brand-500 transition text-sm md:text-base shadow-sm flex items-center justify-center gap-2 mt-2">
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"></path><path d="M12 5v14"></path></svg>
    Créer l'événement
  </button>
</form>

<!-- Liste des événements -->
<div class="flex items-center gap-2 mb-4">
  <h2 class="text-xl font-bold text-slate-900">Tous les événements</h2>
  <span class="bg-slate-200 text-slate-700 text-xs font-bold px-2.5 py-0.5 rounded-full">{events.length}</span>
</div>

{#if loading}
  <div class="flex items-center gap-2 text-slate-500">
    <svg class="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
    Chargement...
  </div>
{:else if events.length === 0}
  <div class="bg-white p-8 rounded-2xl border border-slate-200 text-center">
    <div class="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
      <svg class="text-slate-400" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"></rect><line x1="16" x2="16" y1="2" y2="6"></line><line x1="8" x2="8" y1="2" y2="6"></line><line x1="3" x2="21" y1="10" y2="10"></line></svg>
    </div>
    <p class="text-slate-500 font-medium">Aucun événement pour le moment.</p>
  </div>
{:else}
  <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
    {#each events as ev}
      <!-- Carte d'événement responsive -->
      <div class="bg-white p-4 rounded-2xl border border-slate-200 flex flex-col sm:flex-row gap-4 items-start sm:items-center shadow-sm hover:shadow-md transition group">
        
        {#if ev.coverImageUrl}
          <div class="w-full sm:w-24 h-40 sm:h-24 shrink-0 rounded-xl overflow-hidden bg-slate-100">
            <img src={ev.coverImageUrl} alt={ev.title} class="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
          </div>
        {:else}
          <div class="w-full sm:w-24 h-32 sm:h-24 shrink-0 rounded-xl bg-slate-50 border border-slate-100 border-dashed flex items-center justify-center text-slate-400">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
          </div>
        {/if}

        <div class="flex-1 min-w-0">
          <h3 class="font-bold text-slate-900 text-base md:text-lg leading-tight truncate">{ev.title}</h3>
          <p class="text-xs md:text-sm text-brand-600 font-medium mt-1.5 flex items-center gap-1.5">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"></rect><line x1="16" x2="16" y1="2" y2="6"></line><line x1="8" x2="8" y1="2" y2="6"></line><line x1="3" x2="21" y1="10" y2="10"></line></svg>
            {new Date(ev.startDate).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
          </p>
          <p class="text-xs text-slate-500 mt-1 flex items-center gap-1.5 truncate">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path><circle cx="12" cy="10" r="3"></circle></svg>
            {ev.location || 'Lieu non défini'}
          </p>
        </div>

      </div>
    {/each}
  </div>
{/if}
