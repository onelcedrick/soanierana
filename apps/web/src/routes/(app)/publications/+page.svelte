<script lang="ts">
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
        message = 'Publication modifiee';
      } else {
        await createPublication({ ...form, churchId: get(auth).user!.churchId }, get(auth).token!);
        message = 'Publication creee et publiee';
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
  }

  async function onPublish(id: string) {
    try {
      await publishPublication(id, get(auth).token!);
      message = 'Publication validee et rendue publique !';
      await load();
    } catch (err) {
      error = 'Erreur lors de la validation.';
    }
  }

  async function onDelete(id: string) {
    if (!confirm('Supprimer cette publication ?')) return;
    try {
      await deletePublication(id, get(auth).token!);
      message = 'Publication supprimee';
      await load();
    } catch (err) {
      error = err instanceof Error ? err.message : 'Erreur';
    }
  }
</script>

<h1 class="text-2xl font-bold mb-6">Gerer les actualites</h1>
{#if message}<p class="text-green-700 text-sm mb-3 p-3 bg-green-50 rounded-lg">{message}</p>{/if}
{#if error}<p class="text-red-600 text-sm mb-3 p-3 bg-red-50 rounded-lg">{error}</p>{/if}

<form on:submit={onSubmit} class="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 grid gap-4 mb-8">
  <h2 class="font-bold text-lg text-slate-800 border-b pb-2">Nouvelle publication</h2>
  
  <div>
    <label class="block text-sm font-medium text-slate-700 mb-1">Titre</label>
    <input bind:value={form.title} required placeholder="Ex: Concert de louange" class="w-full border border-slate-300 rounded-xl px-4 py-2.5 outline-none focus:border-brand-500" />
  </div>

  <div>
    <label class="block text-sm font-medium text-slate-700 mb-1">Contenu</label>
    <textarea bind:value={form.content} rows="4" required placeholder="Ecrivez votre actualite ici..." class="w-full border border-slate-300 rounded-xl px-4 py-2.5 outline-none focus:border-brand-500"></textarea>
  </div>
  
  <div class="grid md:grid-cols-2 gap-4">
    <div>
      <label class="block text-sm font-medium text-slate-700 mb-1">Audience</label>
      <select bind:value={form.audience} class="w-full border border-slate-300 rounded-xl px-4 py-2.5 outline-none focus:border-brand-500 bg-slate-50">
        <option value="PUBLIC">Public</option>
        <option value="MEMBERS_ONLY">Membres uniquement</option>
      </select>
    </div>

    <div>
      <label class="block text-sm font-medium text-slate-700 mb-1">Photo de couverture</label>
      <input type="file" accept="image/*" on:change={handleFileUpload} class="w-full text-sm text-slate-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100" />
    </div>
  </div>

  {#if form.coverImageUrl}
    <div class="relative w-48 h-32 rounded-lg overflow-hidden border border-slate-200">
      <img src={form.coverImageUrl} alt="Apercu" class="w-full h-full object-cover" />
      <button type="button" on:click={() => form.coverImageUrl = ''} class="absolute top-1 right-1 bg-white rounded-full p-1 shadow text-slate-500 hover:text-red-500">✕</button>
    </div>
  {/if}

  <div class="flex gap-3 mt-2">
    <button type="submit" class="bg-brand-600 text-white font-medium rounded-xl px-6 py-2.5 hover:bg-brand-500 transition">
      {editingId ? 'Enregistrer les modifications' : 'Publier'}
    </button>
    {#if editingId}
      <button type="button" on:click={() => { editingId = null; form = { title: '', content: '', audience: 'PUBLIC', coverImageUrl: '' }; }} class="bg-slate-100 text-slate-700 font-medium rounded-xl px-6 py-2.5 hover:bg-slate-200 transition">
        Annuler
      </button>
    {/if}
  </div>
</form>

<h2 class="text-xl font-bold mb-4">Toutes les publications</h2>
{#if loading}
  <p>Chargement...</p>
{:else}
  <div class="grid gap-4">
    {#each publications as pub}
      <div class="bg-white p-4 rounded-xl border border-slate-200 flex justify-between items-start shadow-sm hover:shadow-md transition">
        <div class="flex gap-4">
          {#if pub.coverImageUrl}
            <img src={pub.coverImageUrl} alt={pub.title} class="w-24 h-24 object-cover rounded-lg shrink-0" />
          {:else}
            <div class="w-24 h-24 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400 text-xs shrink-0 text-center px-2">Sans image</div>
          {/if}
          <div>
            <div class="flex items-center gap-2 mb-1">
              <h3 class="font-bold text-slate-900">{pub.title}</h3>
              <span class="text-[10px] px-2 py-0.5 rounded font-bold {pub.status === 'PUBLISHED' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}">
                {pub.status === 'DRAFT' ? 'En attente' : pub.status}
              </span>
              <span class="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-bold">{pub.audience}</span>
            </div>
            <p class="text-sm text-slate-600 max-w-2xl whitespace-pre-wrap line-clamp-4">{pub.content}</p>
          </div>
        </div>
        <div class="flex gap-3 shrink-0 ml-4 items-center">
          {#if pub.status === 'DRAFT'}
            <button on:click={() => onPublish(pub.id)} class="bg-green-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-green-500 transition">Valider</button>
          {/if}
          <button on:click={() => startEdit(pub)} class="text-blue-600 text-sm font-medium hover:underline">Editer</button>
          <button on:click={() => onDelete(pub.id)} class="text-red-600 text-sm font-medium hover:underline">Supprimer</button>
        </div>
      </div>
    {/each}
  </div>
{/if}
