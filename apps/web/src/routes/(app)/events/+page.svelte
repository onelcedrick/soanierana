<script lang="ts">
  import { auth } from '$lib/stores/auth';
  import { listEvents, createEvent, updateEvent, deleteEvent, type Event } from '$lib/api/events';
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';
  import { confirmStore } from '$lib/stores/confirm';

  let events: Event[] = [];
  let loading = true;
  let editingId: string | null = null;
  
  let form = {
    title: '', description: '', startDate: '', endDate: '', location: '',
    coverImageUrl: '', status: 'PUBLISHED'
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
      if (editingId) {
        await updateEvent(editingId, {
          ...form,
          startDate: new Date(form.startDate).toISOString(),
          endDate: form.endDate ? new Date(form.endDate).toISOString() : null,
        }, $auth.token!);
        message = 'Événement modifié avec succès !';
      } else {
        await createEvent({
          ...form,
          churchId: $auth.user!.churchId,
          startDate: new Date(form.startDate).toISOString(),
          endDate: form.endDate ? new Date(form.endDate).toISOString() : null,
        }, $auth.token!);
        message = 'Événement créé avec succès !';
      }
      cancelEdit();
      await load();
    } catch (err) { error = 'Erreur lors de l\'enregistrement.'; }
  }

  function startEdit(ev: Event) {
    editingId = ev.id;
    form = {
      title: ev.title,
      description: ev.description,
      startDate: ev.startDate.slice(0, 16),
      endDate: ev.endDate ? ev.endDate.slice(0, 16) : '',
      location: ev.location,
      coverImageUrl: ev.coverImageUrl || '',
      status: ev.status
    };
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function cancelEdit() {
    editingId = null;
    form = { title: '', description: '', startDate: '', endDate: '', location: '', coverImageUrl: '', status: 'PUBLISHED' };
  }

  async function onToggleStatus(id: string, currentStatus: string) {
    const isCancelling = currentStatus !== 'CANCELLED';
    const newStatus = isCancelling ? 'CANCELLED' : 'PUBLISHED';

    const confirmed = await confirmStore.confirm({
      title: isCancelling ? 'Suspendre l\'événement ?' : 'Publier l\'événement ?',
      message: isCancelling 
        ? 'Il ne sera plus visible sur le site public.' 
        : 'Il sera de nouveau visible sur le site public.',
      type: isCancelling ? 'warning' : 'info',
      confirmText: isCancelling ? 'Suspendre' : 'Publier'
    });
    if (!confirmed) return;

    try {
      await updateEvent(id, { status: newStatus }, $auth.token!);
      message = isCancelling ? 'Événement suspendu.' : 'Événement publié.';
      await load();
    } catch (err) { error = 'Erreur lors de la mise à jour du statut.'; }
  }

  async function onDelete(id: string) {
    const confirmed = await confirmStore.confirm({
      title: 'Supprimer l\'événement ?',
      message: 'Cette action est irréversible.',
      type: 'danger',
      confirmText: 'Supprimer'
    });
    if (!confirmed) return;
    try {
      await deleteEvent(id, $auth.token!);
      message = 'Événement supprimé.';
      await load();
    } catch (err) { error = 'Erreur lors de la suppression.'; }
  }
</script>

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

<form on:submit={onSubmit} class="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-slate-100 grid gap-4 md:gap-5 mb-8 md:grid-cols-2">
  <h2 class="md:col-span-2 font-bold text-lg text-slate-800 border-b border-slate-100 pb-2 flex items-center justify-between">
    <span>{editingId ? 'Modifier l\'événement' : 'Créer un événement'}</span>
    {#if editingId}
      <button type="button" on:click={cancelEdit} class="text-sm text-red-500 hover:underline">Annuler la modification</button>
    {/if}
  </h2>
  
  <div class="md:col-span-2">
    <label class="block text-sm font-medium text-slate-700 mb-1.5">Titre</label>
    <input bind:value={form.title} required class="w-full border border-slate-300 px-4 py-2.5 rounded-xl outline-none focus:border-brand-500" placeholder="Ex: Retraite Spirituelle" />
  </div>

  <div class="md:col-span-2">
    <label class="block text-sm font-medium text-slate-700 mb-1.5">Description</label>
    <textarea bind:value={form.description} rows="3" class="w-full border border-slate-300 px-4 py-2.5 rounded-xl outline-none focus:border-brand-500"></textarea>
  </div>

  <div>
    <label class="block text-sm font-medium text-slate-700 mb-1.5">Date de début</label>
    <input type="datetime-local" bind:value={form.startDate} required class="w-full border border-slate-300 px-4 py-2.5 rounded-xl outline-none focus:border-brand-500" />
  </div>
  <div>
    <label class="block text-sm font-medium text-slate-700 mb-1.5">Date de fin (optionnel)</label>
    <input type="datetime-local" bind:value={form.endDate} class="w-full border border-slate-300 px-4 py-2.5 rounded-xl outline-none focus:border-brand-500" />
  </div>

  <div>
    <label class="block text-sm font-medium text-slate-700 mb-1.5">Lieu</label>
    <input bind:value={form.location} class="w-full border border-slate-300 px-4 py-2.5 rounded-xl outline-none focus:border-brand-500" placeholder="Ex: Temple Principal" />
  </div>

  <div>
    <label class="block text-sm font-medium text-slate-700 mb-1.5">Photo de couverture</label>
    <input type="file" accept="image/*" on:change={handleFileUpload} class="w-full text-sm file:mr-3 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:bg-brand-50 file:text-brand-700" />
    {#if form.coverImageUrl}
      <div class="relative mt-3 w-40 h-24 rounded-lg overflow-hidden border">
        <img src={form.coverImageUrl} alt="Preview" class="w-full h-full object-cover" />
        <button type="button" on:click={() => form.coverImageUrl = ''} class="absolute top-1 right-1 bg-white p-1 rounded-full shadow text-red-500">✕</button>
      </div>
    {/if}
  </div>

  <button type="submit" class="md:col-span-2 bg-brand-600 text-white rounded-xl py-3.5 font-bold hover:bg-brand-500 transition text-sm md:text-base shadow-sm mt-2">
    {editingId ? 'Enregistrer les modifications' : 'Créer l\'événement'}
  </button>
</form>

<div class="flex items-center gap-2 mb-4">
  <h2 class="text-xl font-bold text-slate-900">Tous les événements</h2>
  <span class="bg-slate-200 text-slate-700 text-xs font-bold px-2.5 py-0.5 rounded-full">{events.length}</span>
</div>

{#if loading}
  <p class="text-slate-500">Chargement...</p>
{:else if events.length === 0}
  <div class="bg-white p-8 rounded-2xl border border-slate-200 text-center">
    <p class="text-slate-500 font-medium">Aucun événement pour le moment.</p>
  </div>
{:else}
  <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
    {#each events as ev}
      <div class="bg-white p-4 rounded-2xl border border-slate-200 flex flex-col gap-4 shadow-sm hover:shadow-md transition {ev.status === 'CANCELLED' ? 'opacity-60 bg-slate-50' : ''}">
        
        {#if ev.coverImageUrl}
          <div class="w-full h-40 shrink-0 rounded-xl overflow-hidden bg-slate-100">
            <img src={ev.coverImageUrl} alt={ev.title} class="w-full h-full object-cover" />
          </div>
        {/if}

        <div class="flex-1">
          <div class="flex items-center gap-2 mb-1">
            <h3 class="font-bold text-slate-900 text-lg leading-tight truncate">{ev.title}</h3>
            {#if ev.status === 'CANCELLED'}
              <span class="text-[10px] bg-red-100 text-red-700 px-2 py-0.5 rounded font-bold uppercase">Suspendu</span>
            {/if}
          </div>
          <p class="text-xs text-slate-500 mt-1 line-clamp-2">{ev.description}</p>
          <p class="text-xs text-brand-600 font-medium mt-2 flex items-center gap-1.5">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"></rect><line x1="16" x2="16" y1="2" y2="6"></line><line x1="8" x2="8" y1="2" y2="6"></line><line x1="3" x2="21" y1="10" y2="10"></line></svg>
            {new Date(ev.startDate).toLocaleDateString('fr-FR')}
          </p>
        </div>

        <div class="flex flex-wrap gap-2 pt-3 border-t border-slate-100 mt-auto">
          <button on:click={() => startEdit(ev)} class="flex-1 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 px-3 py-2 rounded-lg transition">Modifier</button>
          
          {#if ev.status === 'CANCELLED'}
            <button on:click={() => onToggleStatus(ev.id, ev.status)} class="flex-1 text-xs font-bold text-green-600 bg-green-50 hover:bg-green-100 px-3 py-2 rounded-lg transition">Publier</button>
          {:else}
            <button on:click={() => onToggleStatus(ev.id, ev.status)} class="flex-1 text-xs font-bold text-amber-600 bg-amber-50 hover:bg-amber-100 px-3 py-2 rounded-lg transition">Suspendre</button>
          {/if}
          
          <button on:click={() => onDelete(ev.id)} class="flex-1 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 px-3 py-2 rounded-lg transition">Supprimer</button>
        </div>

      </div>
    {/each}
  </div>
{/if}
