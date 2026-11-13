<script lang="ts">
  import { confirmStore } from '$lib/stores/confirm';
  import { auth } from '$lib/stores/auth';
  import { getActiveCampaign, updateCampaign, getAdminDonations, validateDonation } from '$lib/api/campaigns';
  import { listAlbums, createAlbum, updateAlbum, deleteAlbum, type Album } from "$lib/api/albums";
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';
  import { get } from 'svelte/store';

  let loading = true;
  let message = '';
  let error = '';

  // --- CAMPAGNE ---
  let campaignData = { 
    title: '', 
    description: '', 
    goalAmount: 0, 
    initialAmount: 0, 
    coverImageUrl: '' 
  };
  let savingCampaign = false;

  // --- ALBUMS ---
  let albums: Album[] = [];
  let showAlbumModal = false;
  let editingAlbumId: string | null = null;
  let albumForm = { title: "", description: "", images: [] as string[] };
  let savingAlbum = false;

  // --- DONS ---
  let donations: any[] = [];
  let validatingId: string | null = null;

  // --- MODAL PREUVE ---
  let showProofModal = false;
  let currentProofImage = '';

  onMount(async () => {
    if (!get(auth).token) return goto('/login');
    await loadData();
  });

  async function loadData() {
    loading = true;
    try {
      const [camp, dons, albs] = await Promise.all([
        getActiveCampaign(),
        getAdminDonations(get(auth).token!),
        listAlbums(get(auth).user!.churchId)
      ]);
      albums = albs;
      
      if (camp && camp.campaign) {
        campaignData = {
          title: camp.campaign.title,
          description: camp.campaign.description || '',
          goalAmount: Number(camp.campaign.goalAmount),
          initialAmount: Number(camp.campaign.initialAmount || 0),
          coverImageUrl: camp.campaign.coverImageUrl || ''
        };
      }
      donations = dons;
    } catch (err) {
      console.error(err);
      error = 'Erreur de chargement des données.';
    } finally {
      loading = false;
    }
  }

  // --- GESTION CAMPAGNE ---
  function handleImage(e: Event) {
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
        campaignData.coverImageUrl = canvas.toDataURL('image/jpeg', 0.8);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  }

  async function onSaveCampaign(e: Event) {
    e.preventDefault();
    savingCampaign = true; message = ''; error = '';
    try {
      await updateCampaign({ ...campaignData, churchId: get(auth).user!.churchId }, get(auth).token!);
      message = 'Campagne mise à jour avec succès !';
    } catch (err) {
      error = 'Erreur lors de la sauvegarde de la campagne.';
    } finally {
      savingCampaign = false;
    }
  }

  // --- GESTION DONS ---
  async function onValidate(id: string) {
    const confirmed = await confirmStore.confirm({ title: 'Confirmation', message: 'Confirmer la réception de ce don ?', type: 'warning' });
          if (!confirmed) return;
    validatingId = id;
    try {
      await validateDonation(id, get(auth).token!);
      message = 'Don validé ! La cagnotte a été mise à jour.';
      await loadData();
    } catch (err) {
      error = 'Erreur lors de la validation.';
    } finally {
      validatingId = null;
    }
  }

  // --- GESTION ALBUMS ---
  function handleMultipleImages(e: Event) {
    const files = (e.target as HTMLInputElement).files;
    if (!files) return;

    if (albumForm.images.length + files.length > 10) {
      error = "Vous ne pouvez pas ajouter plus de 10 images par album.";
      return;
    }

    for (let i = 0; i < files.length; i++) {
      const reader = new FileReader();
      reader.onload = (event) => {
        albumForm.images = [...albumForm.images, event.target?.result as string];
      };
      reader.readAsDataURL(files[i]);
    }
  }

  function startCreateAlbum() {
    editingAlbumId = null;
    albumForm = { title: "", description: "", images: [] };
    showAlbumModal = true;
  }

  function startEditAlbum(alb: Album) {
    editingAlbumId = alb.id;
    albumForm = { title: alb.title, description: alb.description || "", images: [...alb.images] };
    showAlbumModal = true;
  }

  async function onSaveAlbum(e: Event) {
    e.preventDefault();
    savingAlbum = true;
    try {
      if (editingAlbumId) {
        await updateAlbum(editingAlbumId, albumForm, get(auth).token!);
        message = "Album modifié !";
      } else {
        await createAlbum({ ...albumForm, churchId: get(auth).user!.churchId }, get(auth).token!);
        message = "Album créé !";
      }
      showAlbumModal = false;
      await loadData();
    } catch (err) {
      error = "Erreur lors de la sauvegarde de l'album.";
    } finally {
      savingAlbum = false;
    }
  }

  async function onDeleteAlbum(id: string) {
    const confirmed = await confirmStore.confirm({ title: 'Confirmation', message: "Supprimer cet album ?", type: 'danger' });
          if (!confirmed) return;
    try {
      await deleteAlbum(id, get(auth).token!);
      message = "Album supprimé";
      await loadData();
    } catch (err) { error = "Erreur suppression album."; }
  }

  function removeAlbumImage(index: number) {
    albumForm.images = albumForm.images.filter((_, i) => i !== index);
  }

  // --- PREUVE MODAL ---
  function openProof(url: string) {
    currentProofImage = url;
    showProofModal = true;
  }
</script>

<!-- Conteneur principal englobant TOUT -->
<div class="max-w-7xl mx-auto space-y-6 pb-12">
  
  <!-- En-tête -->
  <div class="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
    <div>
      <h1 class="text-2xl md:text-3xl font-bold text-slate-900">Campagne & Dons</h1>
      <p class="text-sm md:text-base text-slate-500 mt-1">Configurez le projet de reconstruction et validez les dons reçus.</p>
    </div>
    <button on:click={loadData} class="w-full sm:w-auto text-sm font-bold text-brand-600 bg-brand-50 hover:bg-brand-100 px-4 py-2 rounded-xl transition flex items-center justify-center gap-2">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"></path><path d="M21 3v5h-5"></path></svg>
      Actualiser
    </button>
  </div>

  {#if message}
    <div class="bg-green-50 text-green-700 p-4 rounded-xl border border-green-200 flex items-start gap-2 shadow-sm">
      <svg class="mt-0.5 shrink-0" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
      {message}
    </div>
  {/if}
  {#if error}
    <div class="bg-red-50 text-red-600 p-4 rounded-xl border border-red-200 flex items-start gap-2 shadow-sm">
      <svg class="mt-0.5 shrink-0" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" x2="12" y1="8" y2="12"></line><line x1="12" x2="12.01" y1="16" y2="16"></line></svg>
      {error}
    </div>
  {/if}

  {#if loading}
    <div class="flex items-center gap-2 text-slate-500">
      <svg class="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
      Chargement des données...
    </div>
  {:else}
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 items-start">
      
      <!-- COLONNE DE GAUCHE : Configuration de la campagne -->
      <div class="bg-white p-5 md:p-6 rounded-2xl shadow-sm border border-slate-100 lg:sticky lg:top-6">
        <h2 class="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
          <svg class="text-brand-600" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20"></path><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
          Configuration du projet
        </h2>
        
        <form on:submit={onSaveCampaign} class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">Titre du projet</label>
            <input bind:value={campaignData.title} required class="w-full border border-slate-300 px-4 py-2.5 rounded-xl outline-none focus:border-brand-500 text-sm md:text-base transition" />
          </div>
          
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">Objectif global (Ar)</label>
            <input type="number" bind:value={campaignData.goalAmount} required min="0" class="w-full border border-slate-300 px-4 py-2.5 rounded-xl outline-none focus:border-brand-500 text-sm md:text-base transition" />
          </div>

          <!-- UTILISATION DU THEME DYNAMIQUE (brand) -->
          <div class="bg-brand-50 p-4 rounded-xl border border-brand-100">
            <label class="block text-sm font-medium text-brand-900 mb-1">Trésorerie de départ (Ar)</label>
            <p class="text-[11px] text-brand-700 mb-2">Fonds déjà disponibles avant le lancement.</p>
            <input 
              type="number" 
              bind:value={campaignData.initialAmount} 
              required 
              min="0" 
              class="w-full border border-brand-200 px-3 py-2.5 rounded-lg bg-white outline-none focus:border-brand-500 font-bold text-brand-900 text-sm md:text-base" 
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">Description</label>
            <textarea bind:value={campaignData.description} rows="4" class="w-full border border-slate-300 px-4 py-2.5 rounded-xl outline-none focus:border-brand-500 text-sm md:text-base resize-y transition"></textarea>
          </div>

          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">Image de couverture</label>
            <div class="border-2 border-dashed border-slate-300 rounded-xl p-4 text-center hover:bg-slate-50 transition relative mb-2 h-40 flex items-center justify-center overflow-hidden">
              <input type="file" accept="image/*" on:change={handleImage} class="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
              {#if campaignData.coverImageUrl}
                <img src={campaignData.coverImageUrl} alt="Cover" class="w-full h-full object-cover rounded-lg" />
              {:else}
                <div class="flex flex-col items-center gap-2 text-slate-500">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                  <p class="text-sm font-medium">Cliquez pour uploader</p>
                </div>
              {/if}
            </div>
          </div>

          <button type="submit" disabled={savingCampaign} class="w-full bg-brand-600 text-white font-bold rounded-xl py-3 hover:bg-brand-500 transition disabled:opacity-50 text-sm md:text-base shadow-sm">
            {savingCampaign ? 'Enregistrement...' : 'Enregistrer la campagne'}
          </button>
        </form>
      </div>

      <!-- COLONNE DE DROITE : Liste des dons -->
      <div class="lg:col-span-2 space-y-4">
        <h2 class="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
          <svg class="text-green-600" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="12" x="2" y="6" rx="2"></rect><circle cx="12" cy="12" r="2"></circle><path d="M6 12h.01M18 12h.01"></path></svg>
          Dons reçus
        </h2>

        {#if donations.length === 0}
          <div class="bg-white p-8 rounded-2xl border border-slate-200 text-center text-slate-500 shadow-sm">
            Aucun don enregistré pour le moment.
          </div>
        {:else}
          <div class="grid gap-4">
            {#each donations as don}
              <div class="bg-white p-4 md:p-5 rounded-2xl border border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-sm hover:shadow-md transition">
                
                <!-- PREUVE (Cliquable) -->
                {#if don.proofImageUrl}
                  <button type="button" on:click={() => openProof(don.proofImageUrl)} class="relative w-full sm:w-24 h-40 sm:h-24 rounded-xl overflow-hidden border border-slate-200 shrink-0 group/img block cursor-pointer focus:outline-none bg-slate-50">
                    <img src={don.proofImageUrl} alt="Preuve" class="w-full h-full object-cover group-hover/img:scale-110 transition-transform duration-300" />
                    <div class="absolute inset-0 bg-slate-900/40 flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity">
                      <svg class="text-white" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" x2="16.65" y1="21" y2="16.65"></line><line x1="11" x2="11" y1="8" y2="14"></line><line x1="8" x2="14" y1="11" y2="11"></line></svg>
                    </div>
                  </button>
                {:else}
                  <div class="w-full sm:w-24 h-32 sm:h-24 rounded-xl bg-slate-50 flex items-center justify-center border border-slate-200 shrink-0 text-xs text-slate-400 font-medium text-center px-2 border-dashed">
                    Pas de preuve
                  </div>
                {/if}

                <div class="flex-1 min-w-0 w-full">
                  <div class="flex flex-wrap items-center gap-2 mb-1.5">
                    <span class="font-bold text-xl md:text-2xl text-slate-900">{Number(don.amount).toLocaleString('fr-FR')} Ar</span>
                    <span class="text-[10px] px-2.5 py-1 rounded-md font-bold uppercase tracking-wide 
                      {don.status === 'CONFIRMED' ? 'bg-green-100 text-green-700' : don.status === 'REJECTED' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'}">
                      {don.status === 'PENDING' ? 'En attente' : don.status}
                    </span>
                  </div>
                  <p class="text-sm text-slate-700 font-medium">Par : <span class="font-bold">{don.donorName || 'Anonyme'}</span></p>
                  <p class="text-xs text-slate-500 mt-1.5 flex items-center gap-2">
                    <span class="bg-slate-100 px-2 py-0.5 rounded text-slate-600">{don.paymentMethod}</span> 
                    <span class="text-slate-400">Réf : {don.referenceCode || 'Aucune'}</span>
                  </p>
                  <p class="text-[11px] text-slate-400 mt-1">Le {new Date(don.createdAt).toLocaleDateString('fr-FR')} à {new Date(don.createdAt).toLocaleTimeString('fr-FR', {hour: '2-digit', minute:'2-digit'})}</p>
                </div>

                <div class="flex flex-col gap-2 items-end shrink-0 w-full sm:w-auto mt-2 sm:mt-0">
                  {#if don.status === 'PENDING'}
                    <button 
                      on:click={() => onValidate(don.id)} 
                      disabled={validatingId === don.id}
                      class="w-full sm:w-auto bg-green-600 text-white font-bold px-6 py-2.5 rounded-xl text-sm hover:bg-green-500 transition disabled:opacity-50 flex justify-center items-center gap-2 shadow-sm"
                    >
                      {#if validatingId === don.id}
                        <svg class="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                        Validation...
                      {:else}
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                        Valider le don
                      {/if}
                    </button>
                  {/if}
                </div>
              </div>
            {/each}
          </div>
        {/if}
      </div>

    </div>

    <!-- SECTION ALBUMS (Maintenant DANS le conteneur principal) -->
    <div class="mt-12 pt-8 border-t border-slate-200">
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h2 class="text-lg md:text-xl font-bold text-slate-800 flex items-center gap-2">
          <svg class="text-brand-600" xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
          Albums Photos (Avancement des travaux)
        </h2>
        <button on:click={startCreateAlbum} class="w-full sm:w-auto bg-slate-900 text-white text-sm font-bold px-5 py-2.5 rounded-xl hover:bg-slate-800 transition shadow-sm flex items-center justify-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14"></path><path d="M5 12h14"></path></svg>
          Nouvel Album
        </button>
      </div>

      {#if albums.length === 0}
        <div class="bg-white p-8 rounded-2xl border border-slate-200 text-center">
          <p class="text-slate-500 text-sm">Aucun album créé pour le moment.</p>
        </div>
      {:else}
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {#each albums as alb}
            <div class="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden group flex flex-col">
              <div class="h-44 bg-slate-100 flex overflow-hidden relative">
                {#if alb.images.length > 0}
                  <img src={alb.images[0]} class="w-full h-full object-cover group-hover:scale-105 transition duration-500" alt={alb.title} />
                  <div class="absolute top-2 right-2 bg-slate-900/70 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-1 rounded-md">
                    {alb.images.length} photo(s)
                  </div>
                {:else}
                  <div class="w-full h-full flex items-center justify-center text-slate-400 text-sm">Aucune image</div>
                {/if}
              </div>
              <div class="p-4 flex-1 flex flex-col">
                <h3 class="font-bold text-slate-900 truncate">{alb.title}</h3>
                <p class="text-xs text-slate-500 line-clamp-2 mt-1 flex-1">{alb.description}</p>
                <div class="flex gap-3 mt-4 pt-3 border-t border-slate-100">
                  <button on:click={() => startEditAlbum(alb)} class="text-xs font-bold text-brand-600 hover:bg-brand-50 px-2 py-1 rounded-md transition flex-1">Modifier</button>
                  <button on:click={() => onDeleteAlbum(alb.id)} class="text-xs font-bold text-red-500 hover:bg-red-50 px-2 py-1 rounded-md transition flex-1">Supprimer</button>
                </div>
              </div>
            </div>
          {/each}
        </div>
      {/if}
    </div>
  {/if}
</div>

<!-- MODAL ALBUM -->
{#if showAlbumModal}
  <div class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm" on:click={() => showAlbumModal = false} role="presentation">
    <div class="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]" on:click|stopPropagation role="dialog" aria-modal="true">
      <div class="p-4 md:p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
        <h2 class="text-lg font-bold text-slate-900">{editingAlbumId ? "Modifier l'album" : "Nouvel Album"}</h2>
        <button on:click={() => showAlbumModal = false} class="text-slate-400 hover:text-slate-800 bg-white shadow-sm border border-slate-200 hover:bg-slate-100 rounded-full p-1.5 transition">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" x2="6" y1="6" y2="18"></line><line x1="6" x2="18" y1="6" y2="18"></line></svg>
        </button>
      </div>
      <div class="p-4 md:p-6 overflow-y-auto flex-1">
        <form on:submit={onSaveAlbum} class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1.5">Titre de l'album</label>
            <input bind:value={albumForm.title} required class="w-full border border-slate-300 px-4 py-2.5 rounded-xl outline-none focus:border-brand-500 text-sm md:text-base transition" placeholder="Ex: Fondations terminées" />
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1.5">Description</label>
            <textarea bind:value={albumForm.description} rows="3" class="w-full border border-slate-300 px-4 py-2.5 rounded-xl outline-none focus:border-brand-500 text-sm md:text-base resize-y transition"></textarea>
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1.5">Photos (Max 10)</label>
            <!-- UTILISATION DU THEME DYNAMIQUE (brand) POUR L'UPLOAD -->
            <input type="file" accept="image/*" multiple on:change={handleMultipleImages} class="w-full text-sm text-slate-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100 cursor-pointer border border-slate-200 rounded-xl bg-slate-50 transition" />
          </div>
          {#if albumForm.images.length > 0}
            <div class="grid grid-cols-3 gap-2 mt-3">
              {#each albumForm.images as img, i}
                <div class="relative h-24 rounded-lg overflow-hidden border border-slate-200 group shadow-sm">
                  <img src={img} class="w-full h-full object-cover" alt="Apercu" />
                  <button type="button" on:click={() => removeAlbumImage(i)} class="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1.5 shadow-md opacity-100 md:opacity-0 md:group-hover:opacity-100 transition">
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" x2="6" y1="6" y2="18"></line><line x1="6" x2="18" y1="6" y2="18"></line></svg>
                  </button>
                </div>
              {/each}
            </div>
          {/if}
          <button type="submit" disabled={savingAlbum} class="w-full bg-brand-600 text-white font-bold py-3 rounded-xl hover:bg-brand-500 transition disabled:opacity-50 mt-6 shadow-sm">
            {savingAlbum ? "Enregistrement..." : "Enregistrer l'album"}
          </button>
        </form>
      </div>
    </div>
  </div>
{/if}

<!-- MODAL POUR AFFICHER LA PREUVE -->
{#if showProofModal}
  <div 
    class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm" 
    on:click={() => showProofModal = false} 
    role="presentation"
  >
    <div class="relative max-w-3xl w-full max-h-[90vh] flex flex-col" on:click|stopPropagation role="dialog" aria-modal="true">
      <button 
        on:click={() => showProofModal = false} 
        class="absolute -top-12 right-0 bg-white/10 hover:bg-white/20 text-white p-2 rounded-full transition"
        title="Fermer"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" x2="6" y1="6" y2="18"></line><line x1="6" x2="18" y1="6" y2="18"></line></svg>
      </button>
      <img 
        src={currentProofImage} 
        alt="Preuve de paiement" 
        class="w-full h-auto max-h-[85vh] object-contain rounded-xl shadow-2xl bg-white" 
      />
    </div>
  </div>
{/if}
