<script lang="ts">
  import { PUBLIC_API_URL } from '$env/static/public';
  import { onMount } from 'svelte';
  import { fly } from 'svelte/transition';
  import Navbar from '$lib/components/public/Navbar.svelte';
  import Footer from '$lib/components/public/Footer.svelte';
  import { getActiveCampaign, donate } from "$lib/api/campaigns";
  import { listAlbums, type Album } from "$lib/api/albums";

  let data: any = null;
  let albums: Album[] = [];
  let selectedAlbum: Album | null = null;
  let currentImageIndex = 0;

  function openAlbum(alb: Album) {
    selectedAlbum = alb;
    currentImageIndex = 0;
  }

  function nextImage() {
    if (selectedAlbum && currentImageIndex < selectedAlbum.images.length - 1) {
      currentImageIndex++;
    }
  }

  function prevImage() {
    if (currentImageIndex > 0) {
      currentImageIndex--;
    }
  }

  function handleKeydown(e: KeyboardEvent) {
    if (!selectedAlbum) return;
    if (e.key === 'ArrowRight') nextImage();
    if (e.key === 'ArrowLeft') prevImage();
    if (e.key === 'Escape') selectedAlbum = null;
  }
  let loading = true;
  
  // Formulaire de don
  let showDonateModal = false;
  let donateForm = { 
    amount: 10000, 
    donorName: '', 
    isAnonymous: false, 
    paymentMethod: 'Mobile Money',
    referenceCode: '',
    proofImageUrl: ''
  };
  let donateStatus = { loading: false, success: false, error: '' };

  const paymentInfo = {
    mobileMoney: '+261 34 00 000 00 (MVola/Orange/Airtel) - Nom: Eglise Adventiste',
    bankTransfer: 'BMOI - Compte N° 00000 00000 00000000000 00 - Eglise Adventiste'
  };

  onMount(async () => {
    // 1. Charger la campagne (bloquant)
    try {
      const campData = await getActiveCampaign();
      data = campData;
    } catch (err) {
      console.error("Erreur chargement campagne:", err);
    }

    // 2. Charger les albums (non-bloquant)
    try {
      const res = await fetch(`${PUBLIC_API_URL}/church/default`);
      if (res.ok) {
        const church = await res.json();
        if (church && church.id) {
          albums = await listAlbums(church.id);
        }
      }
    } catch (err) {
      console.error("Erreur chargement albums:", err);
    } finally {
      loading = false;
    }
  });

  function handleProofUpload(e: Event) {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width, height = img.height;
        if (width > 800) { height *= 800 / width; width = 800; }
        canvas.width = width; canvas.height = height;
        canvas.getContext('2d')?.drawImage(img, 0, 0, width, height);
        donateForm.proofImageUrl = canvas.toDataURL('image/jpeg', 0.7);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  }

  async function submitDonation(e: Event) {
    e.preventDefault();
    donateStatus = { loading: true, success: false, error: '' };
    try {
      await donate({ ...donateForm, campaignId: data.campaign.id });
      donateStatus.success = true;
    } catch (err) {
      donateStatus.error = "Erreur lors de l'enregistrement du don.";
    } finally {
      donateStatus.loading = false;
    }
  }

  function closeModal() {
    showDonateModal = false;
    donateStatus.success = false;
    // Réinitialiser le formulaire
    donateForm = { 
      amount: 10000, donorName: '', isAnonymous: false, paymentMethod: 'Mobile Money', referenceCode: '', proofImageUrl: '' 
    };
  }
</script>

<svelte:head>
  <title>Notre Église - Reconstruction</title>
</svelte:head>

<div class="bg-slate-50 min-h-screen flex flex-col">
  <div class="bg-slate-900 h-24 relative w-full">
    <Navbar transparent={true} />
  </div>

  <main class="flex-1 max-w-6xl mx-auto w-full px-4 md:px-6 py-8 relative z-10">
    
    {#if loading}
      <div class="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 text-center">
        <p class="text-slate-500">Chargement de la campagne...</p>
      </div>
    {:else if !data || !data.campaign}
      <div class="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 text-center">
        <h1 class="text-2xl font-bold text-slate-900 mb-2">Notre Église</h1>
        <p class="text-slate-500">La campagne de collecte n'est pas encore configurée.</p>
      </div>
    {:else}
      
      <!-- Bannière Projet -->
      <div class="bg-white rounded-3xl overflow-hidden shadow-xl border border-slate-100 mb-10" in:fly={{ y: 20, duration: 600 }}>
        
        <div class="relative h-72 md:h-96">
          <img 
            src={data.campaign.coverImageUrl || 'https://images.unsplash.com/photo-1548625361-ec85312b9e86'} 
            alt="Église" 
            class="w-full h-full object-cover object-center" 
          />
          <div class="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent"></div>
          
          <div class="absolute bottom-6 left-6 right-6 text-white">
            <h1 class="text-3xl md:text-4xl font-bold mb-2">{data.campaign.title}</h1>
            <p class="text-slate-200 max-w-2xl line-clamp-2 text-sm md:text-base">{data.campaign.description}</p>
          </div>
        </div>

        <!-- Barre de progression -->
        <div class="p-6 md:p-8 bg-slate-900 text-white">
          <div class="flex flex-col md:flex-row md:items-end justify-between mb-4 gap-4">
            <div>
              <p class="text-slate-400 text-sm mb-1">Objectif de collecte</p>
              <div class="text-3xl md:text-4xl font-bold text-brand-400">
                {Number(data.collected).toLocaleString('fr-FR')} Ar
              </div>
              <p class="text-sm text-slate-400 mt-1">sur {Number(data.campaign.goalAmount).toLocaleString('fr-FR')} Ar</p>
            </div>
            <button on:click={() => showDonateModal = true} class="bg-brand-600 hover:bg-brand-500 text-white font-bold px-8 py-3 rounded-xl transition shadow-lg">
              Faire un don
            </button>
          </div>
          
          {#if Number(data.campaign.goalAmount) > 0}
            <div class="w-full bg-slate-700 rounded-full h-4 mb-2">
              <div class="bg-brand-500 h-4 rounded-full text-[10px] flex items-center justify-end pr-2 font-bold text-white transition-all duration-1000" 
                   style="width: {Math.min((data.collected / Number(data.campaign.goalAmount)) * 100, 100)}%">
                {Math.round((data.collected / Number(data.campaign.goalAmount)) * 100)}%
              </div>
            </div>
            <div class="flex justify-between text-xs text-slate-400">
              <span>{Math.round((data.collected / Number(data.campaign.goalAmount)) * 100)}% atteint</span>
              <span>{Math.max(0, Number(data.campaign.goalAmount) - data.collected).toLocaleString('fr-FR')} Ar restants</span>
            </div>
          {/if}
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        <!-- Étapes -->
        <div class="lg:col-span-2 space-y-6">
          <h2 class="text-2xl font-bold text-slate-900">Les étapes de la reconstruction</h2>
          <div class="space-y-4">
            {#each data.milestones as m}
              <div class="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex gap-4 items-start">
                <div class="w-10 h-10 rounded-full flex items-center justify-center shrink-0 
                  {m.status === 'COMPLETED' ? 'bg-green-100 text-green-600' : m.status === 'IN_PROGRESS' ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-400'}">
                  {#if m.status === 'COMPLETED'}
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                  {:else if m.status === 'IN_PROGRESS'}
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                  {:else}
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle></svg>
                  {/if}
                </div>
                <div class="flex-1">
                  <h3 class="font-bold text-slate-900">{m.title}</h3>
                  <p class="text-sm text-slate-500 mt-1">{m.description}</p>
                  {#if m.status !== 'NOT_STARTED'}
                    <div class="mt-3 w-full bg-slate-100 rounded-full h-2">
                      <div class="bg-brand-500 h-2 rounded-full transition-all duration-1000" style="width: {m.progressPercentage}%"></div>
                    </div>
                    <p class="text-xs font-bold text-brand-600 mt-1 text-right">{m.progressPercentage}%</p>
                  {/if}
                </div>
              </div>
            {/each}
          </div>
        </div>

        <!-- Transparence & Donateurs -->
        <div class="space-y-6">
          <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h3 class="font-bold text-lg text-slate-800 mb-4 flex items-center gap-2">
              <svg class="text-brand-600" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
              Transparence
            </h3>
            <p class="text-sm text-slate-500 mb-4">Tous les dons sont vérifiés et validés par le trésorier de l'église avant d'être publiés.</p>
            <div class="bg-slate-50 p-4 rounded-xl border border-slate-100 flex justify-between items-center">
              <span class="text-sm font-medium text-slate-700">Fonds disponibles</span>
              <span class="font-bold text-green-600">{Number(data.collected).toLocaleString('fr-FR')} Ar</span>
            </div>
          </div>

          <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h3 class="font-bold text-lg text-slate-800 mb-4">Nos contributeurs</h3>
            {#if data.donors.length === 0}
              <p class="text-sm text-slate-500 text-center">Soyez le premier à contribuer !</p>
            {:else}
              <ul class="space-y-3">
                {#each data.donors as donor}
                  <li class="flex justify-between items-center text-sm border-b border-slate-50 pb-2">
                    <span class="font-medium text-slate-700">{donor.donorName}</span>
                    <span class="font-bold text-brand-600">{Number(donor.amount).toLocaleString('fr-FR')} Ar</span>
                  </li>
                {/each}
              </ul>
            {/if}
          </div>
        </div>
      </div>
    {/if}

      <!-- SECTION ALBUMS PUBLICS -->
      {#if albums.length > 0}
        <div class="mt-16">
          <div class="mb-6 border-b pb-2">
            <h2 class="text-2xl font-bold text-slate-900">Avancement des travaux en images</h2>
            <p class="text-slate-500 mt-1">Découvrez les étapes de la reconstruction à travers nos albums photos.</p>
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {#each albums as alb}
              <div 
                class="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden cursor-pointer hover:shadow-lg transition group"
                on:click={() => openAlbum(alb)}
                role="button"
                tabindex="0"
              >
                <div class="h-48 bg-slate-100 overflow-hidden relative">
                  {#if alb.images.length > 0}
                    <img src={alb.images[0]} loading="lazy" decoding="async" class="w-full h-full object-cover group-hover:scale-105 transition duration-500" alt={alb.title} />
                    <div class="absolute bottom-2 right-2 bg-slate-900/80 text-white text-xs font-bold px-2 py-1 rounded-lg backdrop-blur-sm">
                      {alb.images.length} photo(s)
                    </div>
                  {:else}
                    <div class="w-full h-full flex items-center justify-center text-slate-400 text-sm">Aucune image</div>
                  {/if}
                </div>
                <div class="p-5">
                  <h3 class="font-bold text-lg text-slate-900 group-hover:text-brand-600 transition">{alb.title}</h3>
                  <p class="text-sm text-slate-500 mt-1 line-clamp-2">{alb.description || "Cliquez pour voir les photos."}</p>
                </div>
              </div>
            {/each}
          </div>
        </div>
      {/if}

  </main>

  <Footer />
</div>

<!-- Modal de Don -->

<svelte:window on:keydown={handleKeydown} />

<!-- VISIONNEUSE D ALBUM -->
{#if selectedAlbum}
  <div class="fixed inset-0 z-[100] flex flex-col items-center justify-center p-4 bg-slate-900/95 backdrop-blur-md" on:click={() => selectedAlbum = null} role="presentation">
    
    <!-- En-tête -->
    <div class="absolute top-0 left-0 right-0 p-6 flex justify-between items-start z-10 bg-gradient-to-b from-slate-900/80 to-transparent pointer-events-none">
      <div class="pointer-events-auto">
        <h2 class="text-2xl font-bold text-white">{selectedAlbum.title}</h2>
        <p class="text-sm text-slate-300 mt-1 max-w-2xl">{selectedAlbum.description}</p>
      </div>
      <button on:click={() => selectedAlbum = null} class="pointer-events-auto bg-white/10 hover:bg-white/20 p-2 rounded-full transition text-white">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" x2="6" y1="6" y2="18"></line><line x1="6" x2="18" y1="6" y2="18"></line></svg>
      </button>
    </div>

    <!-- Zone Image -->
    <div class="relative w-full max-w-6xl flex items-center justify-center h-[75vh] mt-12" on:click|stopPropagation role="dialog" aria-modal="true">
      
      {#if selectedAlbum.images.length > 0}
        
        <!-- Flèche Gauche -->
        {#if currentImageIndex > 0}
          <button on:click={prevImage} class="absolute left-0 md:left-4 z-10 bg-black/50 hover:bg-black/80 text-white p-3 rounded-full transition backdrop-blur-sm shadow-xl">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
          </button>
        {/if}

        <!-- Image Principale -->
        <img 
          src={selectedAlbum.images[currentImageIndex]} 
          alt="Photo {currentImageIndex + 1}" 
          class="max-h-full max-w-full object-contain rounded-xl shadow-2xl transition-all duration-300" 
        />

        <!-- Flèche Droite -->
        {#if currentImageIndex < selectedAlbum.images.length - 1}
          <button on:click={nextImage} class="absolute right-0 md:right-4 z-10 bg-black/50 hover:bg-black/80 text-white p-3 rounded-full transition backdrop-blur-sm shadow-xl">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
          </button>
        {/if}

      {:else}
        <p class="text-white text-lg">Aucune image dans cet album.</p>
      {/if}
      
    </div>

    <!-- Compteur -->
    {#if selectedAlbum.images.length > 0}
      <div class="mt-6 text-white font-medium bg-slate-800/80 px-5 py-2 rounded-full text-sm backdrop-blur-sm border border-slate-700">
        {currentImageIndex + 1} / {selectedAlbum.images.length}
      </div>
    {/if}

  </div>
{/if}

{#if showDonateModal && data?.campaign}
  <div class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
    <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
      <div class="p-6 border-b border-slate-100 flex justify-between items-center">
        <h2 class="text-lg font-bold text-slate-900">Faire un don</h2>
        <button on:click={closeModal} class="text-slate-400 hover:text-slate-800">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" x2="6" y1="6" y2="18"></line><line x1="6" x2="18" y1="6" y2="18"></line></svg>
        </button>
      </div>
      
      <div class="p-6 max-h-[80vh] overflow-y-auto">
        {#if donateStatus.success}
          <div class="bg-green-50 text-green-700 p-4 rounded-xl text-center mb-4 border border-green-200">
            <p class="font-bold mb-2">Don enregistré !</p>
            <p class="text-sm">Votre don est bien enregistré et sera validé par le trésorier après vérification de votre preuve de paiement.</p>
          </div>
          <button on:click={closeModal} class="w-full bg-slate-900 text-white font-bold py-3 rounded-xl hover:bg-slate-800 transition">
            Fermer
          </button>
        {:else}
          {#if donateStatus.error}
            <div class="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4">{donateStatus.error}</div>
          {/if}
          
          <!-- ÉTAPE 1 : INSTRUCTIONS DE PAIEMENT EN PREMIER -->
          <div class="bg-brand-50 border border-brand-200 p-4 rounded-xl mb-6">
            <h3 class="font-bold text-brand-900 mb-2 flex items-center gap-2">
              <span class="bg-brand-600 text-white w-5 h-5 rounded-full flex items-center justify-center text-xs">1</span>
              Faites le transfert
            </h3>
            <p class="text-sm text-brand-800 mb-2">Envoyez votre don via :</p>
            <div class="bg-white p-3 rounded-lg border border-brand-100 font-medium text-slate-800 text-sm">
              {#if donateForm.paymentMethod === 'Mobile Money'}
                <p>{paymentInfo.mobileMoney}</p>
              {:else if donateForm.paymentMethod === 'Virement'}
                <p>{paymentInfo.bankTransfer}</p>
              {:else}
                <p>Au bureau de l'église (en espèces)</p>
              {/if}
            </div>
          </div>

          <form on:submit={submitDonation} class="space-y-4">
            
            <div class="flex items-center gap-2 mb-2">
              <span class="bg-slate-800 text-white w-5 h-5 rounded-full flex items-center justify-center text-xs">2</span>
              <h3 class="font-bold text-slate-800 text-sm">Déclarez votre don ci-dessous</h3>
            </div>

            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1">Montant envoyé (Ar)</label>
              <input type="number" min="1000" step="500" bind:value={donateForm.amount} required class="w-full border px-4 py-2.5 rounded-xl outline-none focus:border-brand-500 font-bold text-lg" />
            </div>

            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1">Moyen de paiement utilisé</label>
              <select bind:value={donateForm.paymentMethod} class="w-full border px-4 py-2.5 rounded-xl outline-none focus:border-brand-500 bg-slate-50">
                <option value="Mobile Money">MVola / Orange Money / Airtel</option>
                <option value="Virement">Virement Bancaire</option>
                <option value="Especes">Don en espèces</option>
              </select>
            </div>

            <!-- PREUVE DE PAIEMENT -->
            <div class="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
              <p class="text-sm font-bold text-slate-700">Preuve de paiement</p>
              
              <div>
                <label class="block text-xs text-slate-500 mb-1">Référence / N° de transaction</label>
                <input type="text" bind:value={donateForm.referenceCode} placeholder="Ex: MP240510.1234" required class="w-full border px-3 py-2 rounded-lg text-sm outline-none focus:border-brand-500" />
              </div>

              <div>
                <label class="block text-xs text-slate-500 mb-1">Capture d'écran (Optionnel)</label>
                <input type="file" accept="image/*" on:change={handleProofUpload} class="w-full text-xs text-slate-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100" />
                {#if donateForm.proofImageUrl}
                  <img src={donateForm.proofImageUrl} class="mt-2 h-16 object-contain rounded border bg-white" alt="Preuve" />
                {/if}
              </div>
            </div>

            <label class="flex items-center gap-2 text-sm text-slate-700 cursor-pointer pt-2">
              <input type="checkbox" bind:checked={donateForm.isAnonymous} class="rounded text-brand-600 focus:ring-brand-500 w-4 h-4" />
              Je souhaite rester anonyme
            </label>

            {#if !donateForm.isAnonymous}
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-1">Votre nom</label>
                <input type="text" bind:value={donateForm.donorName} required placeholder="Ex: Jean Rakoto" class="w-full border px-4 py-2.5 rounded-xl outline-none focus:border-brand-500" />
              </div>
            {/if}

            <button type="submit" disabled={donateStatus.loading} class="w-full bg-brand-600 hover:bg-brand-500 text-white font-bold py-3 rounded-xl transition disabled:opacity-50 mt-2">
              {donateStatus.loading ? 'Enregistrement...' : 'Confirmer le don'}
            </button>
          </form>
        {/if}
      </div>
    </div>
  </div>
{/if}
