<script lang="ts">
  import { confirmStore } from '$lib/stores/confirm';
  import { auth } from '$lib/stores/auth';
  import { listAllPolls, createPoll, publishPoll, closePoll, deletePoll, getPollReport, downloadPollReport, type AdminPoll, type PollReport } from '$lib/api/polls';
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';
  import { get } from 'svelte/store';

  let polls: AdminPoll[] = [];
  let loading = true;
  let form = {
    title: '', audience: 'PUBLIC' as 'PUBLIC' | 'MEMBERS_ONLY', isAnonymous: false,
    opensAt: new Date().toISOString().slice(0, 16), closesAt: new Date(Date.now() + 86400000).toISOString().slice(0, 16),
    options: 'Oui\nNon',
  };
  let message = '';
  let error = '';

  // Rapport
  let showReportModal = false;
  let currentReport: PollReport | null = null;
  let loadingReport = false;

  onMount(async () => {
    if (!get(auth).token) return goto('/login');
    await load();
  });

  async function load() {
    loading = true;
    try {
      polls = await listAllPolls(get(auth).user!.churchId, get(auth).token!);
    } catch (err) { error = 'Erreur chargement'; }
    finally { loading = false; }
  }

  async function onSubmit(e: Event) {
    e.preventDefault();
    message = ''; error = '';
    try {
      await createPoll({
        ...form, churchId: get(auth).user!.churchId,
        opensAt: new Date(form.opensAt).toISOString(),
        closesAt: new Date(form.closesAt).toISOString(),
        options: form.options.split('\n').map(s => s.trim()).filter(Boolean),
      }, get(auth).token!);
      message = 'Sondage créé avec succès';
      form.title = ''; form.options = 'Oui\nNon'; form.isAnonymous = false;
      await load();
    } catch (err) { error = 'Erreur lors de la création'; }
  }

  async function onPublish(id: string) {
    try { await publishPoll(id, get(auth).token!); message = 'Sondage publié !'; await load(); } 
    catch (err) { error = 'Erreur publication'; }
  }

  async function onClose(id: string) {
    const confirmed = await confirmStore.confirm({ title: 'Confirmation', message: 'Voulez-vous vraiment clôturer ce sondage ?', type: 'warning' });
          if (!confirmed) return;
    try { await closePoll(id, get(auth).token!); message = 'Sondage clôturé'; await load(); } 
    catch (err) { error = 'Erreur lors de la clôture.'; }
  }

  async function onDelete(id: string) {
    const confirmed = await confirmStore.confirm({ title: 'Confirmation', message: 'Supprimer ce sondage ?', type: 'danger' });
          if (!confirmed) return;
    try { await deletePoll(id, get(auth).token!); message = 'Sondage supprimé'; await load(); } 
    catch (err) { error = 'Erreur suppression'; }
  }

  async function openReport(id: string) {
    showReportModal = true;
    loadingReport = true;
    currentReport = null;
    try {
      currentReport = await getPollReport(id, get(auth).token!);
    } catch (err) {
      await confirmStore.alert({ title: 'Information', message: 'Erreur lors du chargement du rapport' });
      showReportModal = false;
    } finally {
      loadingReport = false;
    }
  }

  async function onDownloadReport(id: string) {
    try {
      const blob = await downloadPollReport(id, get(auth).token!);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = `rapport_sondage_${id}.csv`; a.click();
    } catch (err) { await confirmStore.alert({ title: 'Information', message: 'Erreur export' }); }
  }
</script>

<!-- En-tête de la page -->
<div class="mb-6 md:mb-8 flex items-center gap-3">
  <div class="bg-brand-50 p-2.5 rounded-xl text-brand-600">
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 20V10"></path><path d="M12 20V4"></path><path d="M6 20v-6"></path></svg>
  </div>
  <h1 class="text-2xl md:text-3xl font-bold text-slate-900">Votes et sondages</h1>
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
<form on:submit={onSubmit} class="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-slate-100 grid gap-4 md:gap-5 mb-8">
  <h2 class="font-bold text-lg text-slate-800 border-b border-slate-100 pb-2 flex items-center gap-2">
    <svg class="text-brand-500" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14"></path><path d="M5 12h14"></path></svg>
    Créer un sondage
  </h2>

  <div>
    <label class="block text-sm font-medium text-slate-700 mb-1.5">Titre du sondage</label>
    <input bind:value={form.title} placeholder="Ex: Choix du thème de la prochaine retraite" required class="w-full border border-slate-300 rounded-xl px-4 py-2.5 md:py-3 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 text-sm md:text-base transition" />
  </div>

  <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-5">
    <div>
      <label class="block text-sm font-medium text-slate-700 mb-1.5">Audience</label>
      <select bind:value={form.audience} class="w-full border border-slate-300 rounded-xl px-4 py-2.5 md:py-3 outline-none focus:border-brand-500 bg-slate-50 text-sm md:text-base cursor-pointer">
        <option value="PUBLIC">Public (Tout le monde)</option>
        <option value="MEMBERS_ONLY">Membres uniquement</option>
      </select>
    </div>
    <div class="flex items-center mt-2 sm:mt-6">
      <label class="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
        <input type="checkbox" bind:checked={form.isAnonymous} class="rounded border-slate-300 w-4 h-4 text-brand-600 focus:ring-brand-500" />
        Sondage anonyme
      </label>
    </div>
  </div>

  <!-- Dates -->
  <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-5">
    <div>
      <label class="block text-sm font-medium text-slate-700 mb-1.5">Date d'ouverture</label>
      <input type="datetime-local" bind:value={form.opensAt} class="w-full border border-slate-300 rounded-xl px-4 py-2.5 md:py-3 outline-none focus:border-brand-500 text-sm md:text-base transition" />
    </div>
    <div>
      <label class="block text-sm font-medium text-slate-700 mb-1.5">Date de clôture</label>
      <input type="datetime-local" bind:value={form.closesAt} class="w-full border border-slate-300 rounded-xl px-4 py-2.5 md:py-3 outline-none focus:border-brand-500 text-sm md:text-base transition" />
    </div>
  </div>

  <div>
    <label class="block text-sm font-medium text-slate-700 mb-1.5">Options de vote (une par ligne)</label>
    <textarea bind:value={form.options} rows="4" class="w-full border border-slate-300 rounded-xl px-4 py-2.5 md:py-3 outline-none focus:border-brand-500 text-sm md:text-base resize-y transition" placeholder="Oui&#10;Non"></textarea>
  </div>

  <button type="submit" class="w-full sm:w-auto bg-slate-900 text-white rounded-xl py-3 px-8 font-bold hover:bg-slate-800 transition text-sm md:text-base shadow-sm flex items-center justify-center gap-2 mt-2">
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"></path><path d="M12 5v14"></path></svg>
    Créer le sondage
  </button>
</form>

<!-- Historique -->
<div class="flex items-center gap-2 mb-4">
  <h2 class="text-xl font-bold text-slate-900">Historique des sondages</h2>
  <span class="bg-slate-200 text-slate-700 text-xs font-bold px-2.5 py-0.5 rounded-full">{polls.length}</span>
</div>

{#if loading}
  <div class="flex items-center gap-2 text-slate-500">
    <svg class="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
    Chargement...
  </div>
{:else if polls.length === 0}
  <div class="bg-white p-8 rounded-2xl border border-slate-200 text-center">
    <div class="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
      <svg class="text-slate-400" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 20V10"></path><path d="M12 20V4"></path><path d="M6 20v-6"></path></svg>
    </div>
    <p class="text-slate-500 font-medium">Aucun sondage pour le moment.</p>
  </div>
{:else}
  <div class="grid gap-4">
    {#each polls as poll}
      <!-- Carte responsive : colonne sur mobile, ligne sur PC -->
      <div class="bg-white p-4 rounded-2xl border border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-sm hover:shadow-md transition">
        
        <div class="flex-1 min-w-0 w-full">
          <div class="flex flex-wrap items-center gap-2 mb-1.5">
            <h3 class="font-bold text-slate-900 text-base md:text-lg truncate">{poll.title}</h3>
            
            <!-- Badges de statut -->
            <span class="text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wide 
              {poll.status === 'PUBLISHED' ? 'bg-green-100 text-green-700' : poll.status === 'CLOSED' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}">
              {poll.status === 'DRAFT' ? 'Brouillon' : poll.status === 'PUBLISHED' ? 'En cours' : 'Clôturé'}
            </span>
            <span class="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-bold uppercase tracking-wide">{poll.audience === 'PUBLIC' ? 'Public' : 'Membres'}</span>
            {#if poll.isAnonymous}
              <span class="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-bold uppercase tracking-wide flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"></path><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"></path><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"></path><line x1="2" x2="22" y1="2" y2="22"></line></svg>
                Anonyme
              </span>
            {/if}
          </div>
          <p class="text-xs text-slate-500 flex items-center gap-1.5">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
            Ouvre : {new Date(poll.opensAt).toLocaleString('fr-FR')} 
            <span class="mx-1">&rarr;</span> 
            Ferme : {new Date(poll.closesAt).toLocaleString('fr-FR')}
          </p>
        </div>

        <!-- Actions : pleine largeur en bas sur mobile, alignées à droite sur PC -->
        <div class="flex flex-wrap md:flex-nowrap gap-2 shrink-0 w-full md:w-auto items-center justify-start md:justify-end border-t md:border-t-0 pt-3 md:pt-0 border-slate-100 mt-2 md:mt-0">
          
          <button on:click={() => openReport(poll.id)} class="text-blue-600 text-xs font-bold hover:bg-blue-50 px-3 py-2 rounded-lg transition flex items-center gap-1.5 border border-transparent hover:border-blue-100">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v18h18"></path><path d="m19 9-5 5-4-4-3 3"></path></svg>
            Rapport
          </button>
          
          {#if poll.status === 'DRAFT'}
            <button on:click={() => onPublish(poll.id)} class="text-green-600 text-xs font-bold hover:bg-green-50 px-3 py-2 rounded-lg transition flex items-center gap-1.5 border border-transparent hover:border-green-100">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
              Publier
            </button>
          {/if}
          {#if poll.status === 'PUBLISHED'}
            <button on:click={() => onClose(poll.id)} class="text-orange-600 text-xs font-bold hover:bg-orange-50 px-3 py-2 rounded-lg transition flex items-center gap-1.5 border border-transparent hover:border-orange-100">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"></rect><line x1="9" x2="15" y1="9" y2="15"></line><line x1="15" x2="9" y1="15" y2="9"></line></svg>
              Clôturer
            </button>
          {/if}
          
          <button on:click={() => onDelete(poll.id)} class="text-red-600 text-xs font-bold hover:bg-red-50 px-3 py-2 rounded-lg transition flex items-center gap-1.5 border border-transparent hover:border-red-100">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
            Supprimer
          </button>
        </div>
      </div>
    {/each}
  </div>
{/if}

<!-- MODALE DE RAPPORT -->
{#if showReportModal}
  <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm" on:click={() => showReportModal = false} role="presentation">
    <div class="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]" on:click|stopPropagation role="dialog" aria-modal="true">
      <div class="p-4 md:p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
        <div>
          <h3 class="text-lg font-bold text-slate-900">Rapport de sondage</h3>
          <p class="text-sm text-slate-500 truncate max-w-[200px] md:max-w-md">{currentReport?.poll.title || 'Chargement...'}</p>
        </div>
        <button on:click={() => showReportModal = false} class="text-slate-400 hover:text-slate-800 bg-white shadow-sm border border-slate-200 hover:bg-slate-100 rounded-full p-2 transition">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" x2="6" y1="6" y2="18"></line><line x1="6" x2="18" y1="6" y2="18"></line></svg>
        </button>
      </div>

      <div class="p-4 md:p-6 overflow-y-auto flex-1">
        {#if loadingReport}
          <div class="flex justify-center py-10">
            <svg class="animate-spin h-8 w-8 text-brand-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
          </div>
        {:else if currentReport}
          <div class="space-y-8">
            <!-- Totaux -->
            <div>
              <h4 class="font-bold text-slate-800 mb-4 border-b pb-2 flex items-center gap-2">
                <svg class="text-brand-500" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v18h18"></path><path d="m19 9-5 5-4-4-3 3"></path></svg>
                Résultats
              </h4>
              <div class="space-y-5">
                {#each currentReport.totals as total}
                  <div>
                    <div class="flex justify-between text-sm font-medium text-slate-700 mb-1.5">
                      <span>{total.label}</span>
                      <span class="bg-slate-100 px-2 py-0.5 rounded text-slate-800">{total.count} vote(s)</span>
                    </div>
                    <!-- Barre de progression -->
                    <div class="w-full bg-slate-100 rounded-full h-3">
                      <div class="bg-brand-500 h-3 rounded-full transition-all duration-1000" 
                           style="width: {Math.min(total.count * 10, 100)}%">
                      </div>
                    </div>
                  </div>
                {/each}
              </div>
            </div>

            <!-- Détails des votants -->
            {#if currentReport.poll.isAnonymous}
              <div class="bg-slate-50 p-4 rounded-xl border border-slate-200 text-center text-sm text-slate-500 flex flex-col items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"></path><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"></path><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"></path><line x1="2" x2="22" y1="2" y2="22"></line></svg>
                Ce sondage est anonyme. L'identité des votants n'est pas disponible.
              </div>
            {:else if currentReport.detailedVotes.length > 0}
              <div>
                <h4 class="font-bold text-slate-800 mb-3 border-b pb-2">Détail des votants</h4>
                <!-- Le conteneur overflow-x-auto est CRUCIAL pour le mobile -->
                <div class="overflow-x-auto rounded-xl border border-slate-200">
                  <table class="w-full text-left text-sm whitespace-nowrap">
                    <thead class="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
                      <tr>
                        <th class="px-4 py-3">Nom</th>
                        <th class="px-4 py-3">Email</th>
                        <th class="px-4 py-3">Choix</th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-100 bg-white">
                      {#each currentReport.detailedVotes as vote}
                        <tr class="hover:bg-slate-50 transition">
                          <td class="px-4 py-2.5 font-medium">{vote.voterName || 'Inconnu'}</td>
                          <td class="px-4 py-2.5 text-slate-500">{vote.voterEmail || '-'}</td>
                          <td class="px-4 py-2.5">
                            <span class="bg-brand-50 text-brand-700 px-2 py-1 rounded text-xs font-bold">{vote.optionLabel}</span>
                          </td>
                        </tr>
                      {/each}
                    </tbody>
                  </table>
                </div>
              </div>
            {/if}
          </div>
        {/if}
      </div>

      <div class="p-4 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row justify-end gap-3">
        <button on:click={() => showReportModal = false} class="text-slate-600 font-bold px-5 py-2.5 rounded-xl hover:bg-slate-200 transition order-2 sm:order-1">
          Fermer
        </button>
        <button on:click={() => currentReport && onDownloadReport(currentReport.poll.id)} class="bg-brand-600 text-white font-bold px-5 py-2.5 rounded-xl hover:bg-brand-500 transition flex items-center justify-center gap-2 shadow-sm order-1 sm:order-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" x2="12" y1="15" y2="3"></line></svg>
          Télécharger CSV
        </button>
      </div>
    </div>
  </div>
{/if}
