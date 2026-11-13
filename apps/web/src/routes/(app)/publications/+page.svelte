<script lang="ts">
  import { confirmStore } from '$lib/stores/confirm';
  import { auth } from '$lib/stores/auth';
  import { listAllPublications, createPublication, updatePublication, deletePublication, publishPublication } from '$lib/api/publications';
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';
  import { get } from 'svelte/store';
  import type { AdminPublication } from '$lib/api/publications';

  let publications: AdminPublication[] = [];
  let loading = true;
  
  let form = { 
    title: '', content: '', audience: 'PUBLIC' as 'PUBLIC' | 'MEMBERS_ONLY',
    coverImageUrl: ''
  };
  
  let editingId: string | null = null;
  let message = '';
  let error = '';

  onMount(async () => {
    if (!get(auth).token) return goto('/login');
    await load();
  });

  async function load() {
    loading = true;
    try {
      publications = await listAllPublications(get(auth).user!.churchId, get(auth).token!);
    } catch (err) {
      error = err instanceof Error ? err.message : 'Erreur';
    } finally {
      loading = false;
    }
  }

  function handleFileUpload(e: Event) {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width, height = img.height;
        if (width > 1200) { height *= 1200 / width; width = 1200; }
        canvas.width = width; canvas.height = height;
        canvas.getContext('2d')?.drawImage(img, 0, 0, width, height);
        form.coverImageUrl = canvas.toDataURL('image/jpeg', 0.8);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  }

  async function onSubmit(e: Event) {
    e.preventDefault();
    message = ''; error = '';
    
    if (!form.title || !form.content) {
      error = 'Veuillez remplir le titre et le contenu.';
      return;
    }

    try {
      if (editingId) {
        await updatePublication(editingId, form, get(auth).token!);
        message = 'Publication modifiée';
      } else {
        await createPublication({ ...form, churchId: get(auth).user!.churchId }, get(auth).token!);
        message = 'Publication créée et publiée';
      }
      form = { title: '', content: '', audience: 'PUBLIC', coverImageUrl: '' };
      editingId = null;
      await load();
    } catch (err) {
      error = err instanceof Error ? err.message : 'Erreur';
    }
  }

  function startEdit(pub: AdminPublication) {
    editingId = pub.id;
    form = { 
      title: pub.title, content: pub.content, 
      audience: pub.audience as 'PUBLIC' | 'MEMBERS_ONLY',
      coverImageUrl: pub.coverImageUrl || ''
    };
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function onPublish(id: string) {
    try {
      await publishPublication(id, get(auth).token!);
      message = 'Publication validée et rendue publique !';
      await load();
    } catch (err) {
      error = 'Erreur lors de la validation.';
    }
  }

  async function onDelete(id: string) {
    const confirmed = await confirmStore.confirm({ title: 'Confirmation', message: 'Supprimer cette publication ?', type: 'danger' });
          if (!confirmed) return;
    try {
      await deletePublication(id, get(auth).token!);
      message = 'Publication supprimée';
      await load();
    } catch (err) {
      error = err instanceof Error ? err.message : 'Erreur';
    }
  }
</script>

<!-- Titre de la page -->
<div class="mb-6">
  <h1 class="text-2xl md:text-3xl font-bold text-slate-900">Gérer les actualités</h1>
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

<!-- Formulaire -->
<form on:submit={onSubmit} class="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-slate-100 grid gap-4 md:gap-5 mb-8">
  <h2 class="font-bold text-lg text-slate-800 border-b border-slate-100 pb-2">
    {editingId ? 'Modifier la publication' : 'Nouvelle publication'}
  </h2>
  
  <div>
    <label class="block text-sm font-medium text-slate-700 mb-1">Titre</label>
    <input bind:value={form.title} required placeholder="Ex: Concert de louange" class="w-full border border-slate-300 rounded-xl px-4 py-2.5 outline-none focus:border-brand-500 text-sm md:text-base" />
  </div>

  <div>
    <label class="block text-sm font-medium text-slate-700 mb-1">Contenu</label>
    <textarea bind:value={form.content} rows="5" required placeholder="Écrivez votre actualité ici..." class="w-full border border-slate-300 rounded-xl px-4 py-2.5 outline-none focus:border-brand-500 text-sm md:text-base resize-y"></textarea>
  </div>
  
  <div class="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
    <div>
      <label for="audience" class="block text-sm font-medium text-slate-700 mb-1">Audience</label>
      <select id="audience" bind:value={form.audience} class="w-full border border-slate-300 rounded-xl px-4 py-2.5 outline-none focus:border-brand-500 bg-slate-50 text-sm md:text-base cursor-pointer">
        <option value="PUBLIC">Public</option>
        <option value="MEMBERS_ONLY">Membres uniquement</option>
      </select>
    </div>

    <div>
      <label for="cover-image" class="block text-sm font-medium text-slate-700 mb-1">Photo de couverture</label>
      <input id="cover-image" type="file" accept="image/*" on:change={handleFileUpload} class="w-full text-sm text-slate-500 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-xs md:file:text-sm file:font-semibold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100 cursor-pointer" />
    </div>
  </div>

  {#if form.coverImageUrl}
    <div class="relative w-32 h-24 md:w-48 md:h-32 rounded-lg overflow-hidden border border-slate-200 shadow-sm mt-2">
      <img src={form.coverImageUrl} alt="Apercu" class="w-full h-full object-cover" />
      <!-- Remplacement de l'emoji par une icône SVG -->
      <button type="button" aria-label="Supprimer l'image" on:click={() => form.coverImageUrl = ''} class="absolute top-1 right-1 bg-white/90 backdrop-blur-sm rounded-full p-1.5 shadow-sm text-slate-500 hover:text-red-500 hover:bg-red-50 transition">
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" x2="6" y1="6" y2="18"></line><line x1="6" x2="18" y1="6" y2="18"></line></svg>
      </button>
    </div>
  {/if}

  <div class="flex flex-wrap gap-3 mt-2">
    <button type="submit" class="bg-brand-600 text-white font-bold rounded-xl px-6 py-2.5 hover:bg-brand-500 transition text-sm md:text-base shadow-sm">
      {editingId ? 'Enregistrer les modifications' : 'Publier'}
    </button>
    {#if editingId}
      <button type="button" on:click={() => { editingId = null; form = { title: '', content: '', audience: 'PUBLIC', coverImageUrl: '' }; }} class="bg-slate-100 text-slate-700 font-bold rounded-xl px-6 py-2.5 hover:bg-slate-200 transition text-sm md:text-base">
        Annuler
      </button>
    {/if}
  </div>
</form>

<!-- Liste des publications -->
<h2 class="text-xl font-bold mb-4 text-slate-900">Toutes les publications</h2>
{#if loading}
  <div class="flex items-center gap-2 text-slate-500">
    <svg class="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
    Chargement...
  </div>
{:else}
  <div class="grid gap-4">
    {#each publications as pub}
      <!-- Flex layout : colonne sur mobile, ligne sur PC -->
      <div class="bg-white p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row justify-between items-start gap-4 shadow-sm hover:shadow-md transition">
        
        <div class="flex flex-col sm:flex-row gap-4 w-full min-w-0">
          {#if pub.coverImageUrl}
            <img src={pub.coverImageUrl} alt={pub.title} class="w-full sm:w-24 h-40 sm:h-24 object-cover rounded-lg shrink-0" />
          {:else}
            <div class="w-full sm:w-24 h-32 sm:h-24 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400 text-xs shrink-0 text-center px-2 border border-slate-200 border-dashed">
              Sans image
            </div>
          {/if}
          
          <div class="min-w-0 flex-1">
            <div class="flex flex-wrap items-center gap-2 mb-1">
              <h3 class="font-bold text-slate-900 text-base md:text-lg truncate w-full sm:w-auto">{pub.title}</h3>
              <span class="text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wide {pub.status === 'PUBLISHED' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}">
                {pub.status === 'DRAFT' ? 'En attente' : pub.status}
              </span>
              <span class="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-bold uppercase tracking-wide">{pub.audience === 'PUBLIC' ? 'Public' : 'Membres'}</span>
            </div>
            <p class="text-sm text-slate-600 mt-2 whitespace-pre-wrap line-clamp-3 md:line-clamp-4 leading-relaxed">{pub.content}</p>
          </div>
        </div>

        <!-- Actions : pleine largeur en bas sur mobile, à droite sur PC -->
        <div class="flex flex-wrap sm:flex-nowrap gap-2 sm:gap-3 shrink-0 w-full sm:w-auto items-center justify-end border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100 mt-2 sm:mt-0">
          {#if pub.status === 'DRAFT'}
            <button on:click={() => onPublish(pub.id)} class="bg-green-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-green-500 transition w-full sm:w-auto shadow-sm">
              Valider
            </button>
          {/if}
          <button on:click={() => startEdit(pub)} class="text-blue-600 text-sm font-bold hover:bg-blue-50 px-3 py-1.5 rounded-lg transition w-full sm:w-auto text-center border border-transparent hover:border-blue-100">
            Éditer
          </button>
          <button on:click={() => onDelete(pub.id)} class="text-red-600 text-sm font-bold hover:bg-red-50 px-3 py-1.5 rounded-lg transition w-full sm:w-auto text-center border border-transparent hover:border-red-100">
            Supprimer
          </button>
        </div>
        
      </div>
    {/each}
  </div>
{/if}
