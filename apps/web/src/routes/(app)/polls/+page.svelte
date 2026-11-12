<script lang="ts">
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
      message = 'Sondage cree';
      form.title = ''; form.options = 'Oui\nNon'; form.isAnonymous = false;
      await load();
    } catch (err) { error = 'Erreur creation'; }
  }

  async function onPublish(id: string) {
    try { await publishPoll(id, get(auth).token!); await load(); } 
    catch (err) { error = 'Erreur publication'; }
  }

  async function onClose(id: string) {
    if (!confirm('Voulez-vous vraiment clôturer ce sondage ?')) return;
    try { await closePoll(id, get(auth).token!); message = 'Sondage clôturé'; await load(); } 
    catch (err) { error = 'Erreur lors de la clôture.'; }
  }

  async function onDelete(id: string) {
    if (!confirm('Supprimer ce sondage ?')) return;
    try { await deletePoll(id, get(auth).token!); message = 'Sondage supprime'; await load(); } 
    catch (err) { error = 'Erreur suppression'; }
  }

  async function openReport(id: string) {
    showReportModal = true;
    loadingReport = true;
    currentReport = null;
    try {
      currentReport = await getPollReport(id, get(auth).token!);
    } catch (err) {
      alert('Erreur lors du chargement du rapport');
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
    } catch (err) { alert('Erreur export'); }
  }
</script>

<h1 class="text-2xl font-bold mb-6">Votes et sondages</h1>
{#if message}<p class="text-green-700 text-sm mb-3 p-3 bg-green-50 rounded-lg">{message}</p>{/if}
{#if error}<p class="text-red-600 text-sm mb-3 p-3 bg-red-50 rounded-lg">{error}</p>{/if}

<form on:submit={onSubmit} class="bg-white p-4 rounded-xl shadow-sm border border-slate-100 grid gap-3 mb-8">
  <input bind:value={form.title} placeholder="Titre du sondage" required class="border border-slate-300 rounded-lg px-3 py-2" />
  <select bind:value={form.audience} class="border border-slate-300 rounded-lg px-3 py-2">
    <option value="PUBLIC">Public</option>
    <option value="MEMBERS_ONLY">Membres uniquement</option>
  </select>
  <label class="flex items-center gap-2 text-sm text-slate-700">
    <input type="checkbox" bind:checked={form.isAnonymous} class="rounded border-slate-300" />
    Sondage anonyme (cacher l'identité des votants)
  </label>
  <div class="grid grid-cols-2 gap-3">
    <input type="datetime-local" bind:value={form.opensAt} class="border border-slate-300 rounded-lg px-3 py-2" />
    <input type="datetime-local" bind:value={form.closesAt} class="border border-slate-300 rounded-lg px-3 py-2" />
  </div>
  <textarea bind:value={form.options} rows="4" class="border border-slate-300 rounded-lg px-3 py-2" placeholder="Une option par ligne"></textarea>
  <button type="submit" class="bg-slate-900 text-white rounded-lg py-2">Creer le sondage</button>
</form>

<h2 class="text-xl font-bold mb-4">Historique des sondages</h2>
{#if loading}
  <p>Chargement...</p>
{:else if polls.length === 0}
  <p class="text-slate-500">Aucun sondage pour le moment.</p>
{:else}
  <div class="grid gap-4">
    {#each polls as poll}
      <div class="bg-white p-4 rounded-xl border border-slate-200 flex justify-between items-start shadow-sm">
        <div>
          <div class="flex items-center gap-2 mb-1">
            <h2 class="font-bold text-slate-900">{poll.title}</h2>
            <span class="text-xs px-2 py-0.5 rounded {poll.status === 'PUBLISHED' ? 'bg-green-100 text-green-700' : poll.status === 'CLOSED' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}">
              {poll.status}
            </span>
            <span class="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded">{poll.audience}</span>
          </div>
          <p class="text-xs text-slate-500">Ouvre : {new Date(poll.opensAt).toLocaleString('fr-FR')} - Ferme : {new Date(poll.closesAt).toLocaleString('fr-FR')}</p>
        </div>
        <div class="flex gap-3 ml-4 shrink-0 text-sm font-medium">
          <button on:click={() => openReport(poll.id)} class="text-blue-600 hover:underline">Rapport</button>
          
          {#if poll.status === 'DRAFT'}
            <button on:click={() => onPublish(poll.id)} class="text-green-600 hover:underline">Publier</button>
          {/if}
          {#if poll.status === 'PUBLISHED'}
            <button on:click={() => onClose(poll.id)} class="text-orange-600 hover:underline">Cloturer</button>
          {/if}
          <button on:click={() => onDelete(poll.id)} class="text-red-600 hover:underline">Supprimer</button>
        </div>
      </div>
    {/each}
  </div>
{/if}

<!-- MODALE DE RAPPORT -->
{#if showReportModal}
  <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm" on:click={() => showReportModal = false} role="presentation">
    <div class="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]" on:click|stopPropagation role="dialog" aria-modal="true">
      <div class="p-6 border-b border-slate-100 flex justify-between items-center">
        <div>
          <h3 class="text-lg font-bold text-slate-900">Rapport de fin de sondage</h3>
          <p class="text-sm text-slate-500">{currentReport?.poll.title || 'Chargement...'}</p>
        </div>
        <button on:click={() => showReportModal = false} class="text-slate-400 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-full p-1.5 transition">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" x2="6" y1="6" y2="18"></line><line x1="6" x2="18" y1="6" y2="18"></line></svg>
        </button>
      </div>

      <div class="p-6 overflow-y-auto flex-1">
        {#if loadingReport}
          <p class="text-center text-slate-500">Chargement du rapport...</p>
        {:else if currentReport}
          <div class="space-y-6">
            <!-- Totaux -->
            <div>
              <h4 class="font-bold text-slate-800 mb-3 border-b pb-2">Résultats</h4>
              <div class="space-y-4">
                {#each currentReport.totals as total}
                  <div>
                    <div class="flex justify-between text-sm font-medium text-slate-700 mb-1">
                      <span>{total.label}</span>
                      <span>{total.count} vote(s)</span>
                    </div>
                    <!-- Barre de progression simple -->
                    <div class="w-full bg-slate-100 rounded-full h-2.5">
                      <div class="bg-brand-600 h-2.5 rounded-full" 
                           style="width: {Math.min(total.count * 10, 100)}%">
                      </div>
                    </div>
                  </div>
                {/each}
              </div>
            </div>

            <!-- Détails des votants -->
            {#if currentReport.poll.isAnonymous}
              <div class="bg-slate-50 p-4 rounded-xl border border-slate-200 text-center text-sm text-slate-500">
                Ce sondage est anonyme. L'identité des votants n'est pas disponible.
              </div>
            {:else if currentReport.detailedVotes.length > 0}
              <div>
                <h4 class="font-bold text-slate-800 mb-3 border-b pb-2">Détail des votants</h4>
                <table class="w-full text-left text-sm">
                  <thead class="text-xs text-slate-500 uppercase bg-slate-50">
                    <tr>
                      <th class="px-3 py-2 rounded-l-lg">Nom</th>
                      <th class="px-3 py-2">Email</th>
                      <th class="px-3 py-2 rounded-r-lg">Choix</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-slate-100">
                    {#each currentReport.detailedVotes as vote}
                      <tr>
                        <td class="px-3 py-2 font-medium">{vote.voterName || 'Inconnu'}</td>
                        <td class="px-3 py-2 text-slate-500">{vote.voterEmail || '-'}</td>
                        <td class="px-3 py-2">
                          <span class="bg-brand-50 text-brand-700 px-2 py-0.5 rounded text-xs">{vote.optionLabel}</span>
                        </td>
                      </tr>
                    {/each}
                  </tbody>
                </table>
              </div>
            {/if}
          </div>
        {/if}
      </div>

      <div class="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
        <button on:click={() => showReportModal = false} class="text-slate-600 font-medium px-4 py-2">Fermer</button>
        <button on:click={() => currentReport && onDownloadReport(currentReport.poll.id)} class="bg-brand-600 text-white font-medium px-5 py-2 rounded-lg hover:bg-brand-500 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" x2="12" y1="15" y2="3"></line></svg>
          Télécharger CSV
        </button>
      </div>
    </div>
  </div>
{/if}
