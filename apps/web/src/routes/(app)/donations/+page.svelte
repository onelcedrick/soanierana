<script lang="ts">
  import { auth } from '$lib/stores/auth';
  import { getActiveCampaign, updateCampaign, getAdminDonations, validateDonation } from '$lib/api/campaigns';
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
      const [camp, dons] = await Promise.all([
        getActiveCampaign(),
        getAdminDonations(get(auth).token!)
      ]);
      
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
    if (!confirm('Confirmer la réception de ce don ?')) return;
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

  // --- PREUVE MODAL ---
  function openProof(url: string) {
    currentProofImage = url;
    showProofModal = true;
  }
</script>

<div class="max-w-7xl mx-auto space-y-6 pb-12">
  <div class="flex justify-between items-end">
    <div>
      <h1 class="text-2xl font-bold text-slate-900">Campagne & Dons</h1>
      <p class="text-slate-500 mt-1">Configurez le projet de reconstruction et validez les dons reçus.</p>
    </div>
    <button on:click={loadData} class="text-sm font-medium text-brand-600 hover:underline flex items-center gap-2">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"></path><path d="M21 3v5h-5"></path></svg>
      Actualiser
    </button>
  </div>

  {#if message}
    <div class="bg-green-50 text-green-700 p-4 rounded-xl border border-green-200">{message}</div>
  {/if}
  {#if error}
    <div class="bg-red-50 text-red-600 p-4 rounded-xl border border-red-200">{error}</div>
  {/if}

  {#if loading}
    <p class="text-slate-500">Chargement...</p>
  {:else}
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
      
      <!-- COLONNE DE GAUCHE : Configuration de la campagne -->
      <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 lg:sticky lg:top-6">
        <h2 class="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
          <svg class="text-brand-600" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20"></path><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
          Configuration du projet
        </h2>
        
        <form on:submit={onSaveCampaign} class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">Titre du projet</label>
            <input bind:value={campaignData.title} required class="w-full border px-3 py-2 rounded-lg" />
          </div>
          
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">Objectif global (Ar)</label>
            <input type="number" bind:value={campaignData.goalAmount} required min="0" class="w-full border px-3 py-2 rounded-lg" />
          </div>

          <div class="bg-blue-50 p-4 rounded-xl border border-blue-100">
            <label class="block text-sm font-medium text-blue-900 mb-1">Trésorerie de départ (Ar)</label>
            <p class="text-[10px] text-blue-700 mb-2">Fonds déjà disponibles avant le lancement de la plateforme.</p>
            <input 
              type="number" 
              bind:value={campaignData.initialAmount} 
              required 
              min="0" 
              class="w-full border border-blue-200 px-3 py-2 rounded-lg bg-white outline-none focus:border-brand-500 font-bold text-blue-900" 
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">Description</label>
            <textarea bind:value={campaignData.description} rows="4" class="w-full border px-3 py-2 rounded-lg"></textarea>
          </div>

          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">Image de couverture</label>
            <div class="border-2 border-dashed border-slate-300 rounded-xl p-4 text-center hover:bg-slate-50 transition relative mb-2 h-40 flex items-center justify-center overflow-hidden">
              <input type="file" accept="image/*" on:change={handleImage} class="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
              {#if campaignData.coverImageUrl}
                <img src={campaignData.coverImageUrl} alt="Cover" class="w-full h-full object-cover rounded-lg" />
              {:else}
                <p class="text-sm text-slate-500">Cliquez pour uploader</p>
              {/if}
            </div>
          </div>

          <button type="submit" disabled={savingCampaign} class="w-full bg-brand-600 text-white font-bold rounded-xl py-3 hover:bg-brand-500 transition disabled:opacity-50">
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
          <div class="bg-white p-8 rounded-xl border border-slate-200 text-center text-slate-500">
            Aucun don enregistré pour le moment.
          </div>
        {:else}
          <div class="grid gap-4">
            {#each donations as don}
              <div class="bg-white p-5 rounded-2xl border border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-sm">
                
                <!-- PREUVE (Cliquable pour ouvrir le modal) -->
                {#if don.proofImageUrl}
                  <button type="button" on:click={() => openProof(don.proofImageUrl)} class="relative w-24 h-24 rounded-lg overflow-hidden border border-slate-200 shrink-0 group/img block cursor-pointer focus:outline-none">
                    <img src={don.proofImageUrl} alt="Preuve" class="w-full h-full object-cover group-hover/img:scale-110 transition-transform duration-300" />
                    <div class="absolute inset-0 bg-slate-900/40 flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity">
                      <svg class="text-white" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" x2="16.65" y1="21" y2="16.65"></line><line x1="11" x2="11" y1="8" y2="14"></line><line x1="8" x2="14" y1="11" y2="11"></line></svg>
                    </div>
                  </button>
                {:else}
                  <div class="w-24 h-24 rounded-lg bg-slate-100 flex items-center justify-center border border-slate-200 shrink-0 text-xs text-slate-400 text-center px-2">
                    Pas de preuve
                  </div>
                {/if}

                <div class="flex-1">
                  <div class="flex items-center gap-2 mb-1">
                    <span class="font-bold text-xl text-slate-900">{Number(don.amount).toLocaleString('fr-FR')} Ar</span>
                    <span class="text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wide 
                      {don.status === 'CONFIRMED' ? 'bg-green-100 text-green-700' : don.status === 'REJECTED' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'}">
                      {don.status === 'PENDING' ? 'En attente' : don.status}
                    </span>
                  </div>
                  <p class="text-sm text-slate-700 font-medium">Par : {don.donorName || 'Anonyme'}</p>
                  <p class="text-xs text-slate-500 mt-1">Méthode : {don.paymentMethod} | Réf : {don.referenceCode || 'Aucune'}</p>
                  <p class="text-xs text-slate-400 mt-1">Le {new Date(don.createdAt).toLocaleDateString('fr-FR')} à {new Date(don.createdAt).toLocaleTimeString('fr-FR', {hour: '2-digit', minute:'2-digit'})}</p>
                </div>

                <div class="flex flex-col gap-2 items-end shrink-0 w-full md:w-auto">
                  {#if don.status === 'PENDING'}
                    <button 
                      on:click={() => onValidate(don.id)} 
                      disabled={validatingId === don.id}
                      class="w-full md:w-auto bg-green-600 text-white font-bold px-6 py-2 rounded-xl text-sm hover:bg-green-500 transition disabled:opacity-50 flex justify-center items-center gap-2"
                    >
                      {#if validatingId === don.id}
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
  {/if}
</div>

<!-- MODAL POUR AFFICHER LA PREUVE -->
{#if showProofModal}
  <div 
    class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm" 
    on:click={() => showProofModal = false} 
    role="presentation"
  >
    <div class="relative max-w-3xl w-full max-h-[90vh] flex flex-col" on:click|stopPropagation role="dialog" aria-modal="true">
      
      <!-- Bouton Fermer en haut à droite -->
      <button 
        on:click={() => showProofModal = false} 
        class="absolute -top-12 right-0 bg-white/10 hover:bg-white/20 text-white p-2 rounded-full transition"
        title="Fermer"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" x2="6" y1="6" y2="18"></line><line x1="6" x2="18" y1="6" y2="18"></line></svg>
      </button>

      <!-- Image de la preuve -->
      <img 
        src={currentProofImage} 
        alt="Preuve de paiement" 
        class="w-full h-auto max-h-[85vh] object-contain rounded-xl shadow-2xl bg-white" 
      />
    </div>
  </div>
{/if}
