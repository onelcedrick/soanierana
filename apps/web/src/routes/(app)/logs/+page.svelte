<script lang="ts">
  import { auth } from '$lib/stores/auth';
  import { listLogs, type AuditLog, type AuditResponse } from '$lib/api/audit';
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';

  let data: AuditResponse | null = null;
  let loading = true;
  let error = '';
  let currentSeverity = '';

  onMount(async () => {
    if (!$auth.token) return goto('/login');
    await loadLogs();
  });

  async function loadLogs() {
    loading = true;
    try {
      data = await listLogs($auth.user!.churchId, $auth.token!, 1, currentSeverity);
    } catch (err) {
      error = 'Erreur lors du chargement des logs';
    } finally {
      loading = false;
    }
  }

  function getSeverityBadge(severity: string) {
    if (severity === 'CRITICAL') return 'bg-red-100 text-red-700 border-red-200';
    if (severity === 'WARNING') return 'bg-orange-100 text-orange-700 border-orange-200';
    return 'bg-emerald-100 text-emerald-700 border-emerald-200';
  }
</script>

<!-- En-tête de la page -->
<div class="mb-6 md:mb-8 flex items-center gap-3">
  <div class="bg-brand-50 p-2.5 rounded-xl text-brand-600">
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
  </div>
  <h1 class="text-2xl md:text-3xl font-bold text-slate-900">Journal d'activité</h1>
</div>

<!-- Cartes de statistiques -->
<div class="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
  <!-- Carte 1 : Thème Brand -->
  <div class="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
    <div>
      <p class="text-xs md:text-sm font-medium text-slate-500 mb-1">Logs enregistrés</p>
      <h3 class="text-2xl md:text-3xl font-bold text-slate-900">{data?.meta.total || 0}</h3>
    </div>
    <div class="w-10 h-10 md:w-12 md:h-12 rounded-full bg-brand-50 text-brand-600 flex items-center justify-center shrink-0">
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
    </div>
  </div>
  
  <div class="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
    <div>
      <p class="text-xs md:text-sm font-medium text-slate-500 mb-1">Système opérationnel</p>
      <h3 class="text-2xl md:text-3xl font-bold text-emerald-600">100%</h3>
    </div>
    <div class="w-10 h-10 md:w-12 md:h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
    </div>
  </div>

  <div class="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
    <div>
      <p class="text-xs md:text-sm font-medium text-slate-500 mb-1">Alertes (Critiques)</p>
      <h3 class="text-2xl md:text-3xl font-bold text-red-600">
        {data?.data.filter(l => l.severity === 'CRITICAL').length || 0}
      </h3>
    </div>
    <div class="w-10 h-10 md:w-12 md:h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center shrink-0">
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
    </div>
  </div>
</div>

<!-- Liste des logs -->
<div class="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 md:p-6">
  
  <!-- En-tête de la liste (Titre + Filtre) -->
  <div class="flex flex-col sm:flex-row justify-between sm:items-center gap-3 mb-6">
    <h2 class="font-bold text-lg text-slate-800">Dernières activités</h2>
    <select bind:value={currentSeverity} on:change={loadLogs} class="w-full sm:w-auto text-sm border border-slate-200 rounded-xl px-4 py-2 bg-slate-50 outline-none focus:border-brand-500 font-medium cursor-pointer transition">
      <option value="">Tous les niveaux</option>
      <option value="INFO">Info</option>
      <option value="WARNING">Avertissement</option>
      <option value="CRITICAL">Critique</option>
    </select>
  </div>

  {#if loading}
    <div class="flex items-center gap-2 text-slate-500">
      <svg class="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
      Chargement des logs...
    </div>
  {:else if error}
    <p class="text-red-600 text-sm p-4 bg-red-50 rounded-xl border border-red-100">{error}</p>
  {:else if !data || data.data.length === 0}
    <p class="text-slate-500 text-sm p-4 text-center">Aucun log enregistré pour le moment.</p>
  {:else}
    <div class="space-y-3">
      {#each data.data as log}
        <!-- Carte Log Responsive -->
        <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 p-3 md:p-4 rounded-xl border border-slate-100 hover:bg-slate-50 transition bg-white group">
          
          <div class="flex items-start gap-3 md:gap-4 w-full min-w-0">
            <!-- Icônes selon le module -->
            <div class="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center shrink-0 text-slate-600 group-hover:bg-white group-hover:shadow-sm transition border border-slate-200">
              {#if log.module === 'auth'}
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              {:else if log.module === 'members'}
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              {:else if log.module === 'events'}
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
              {:else}
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
              {/if}
            </div>

            <!-- Contenu texte -->
            <div class="flex-1 min-w-0">
              <div class="flex flex-wrap items-center gap-2 mb-1">
                <h3 class="font-bold text-slate-900 text-sm md:text-base break-all">{log.action}</h3>
                <span class="text-[10px] font-bold px-2 py-0.5 rounded-md border uppercase tracking-wide {getSeverityBadge(log.severity)}">
                  {log.severity}
                </span>
              </div>
              <p class="text-xs md:text-sm text-slate-600 break-words">{log.description}</p>
              <p class="text-[11px] text-slate-400 mt-1.5 flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                ID : <span class="font-mono break-all text-slate-500 bg-slate-100 px-1 py-0.5 rounded">{log.actorId.substring(0,8)}...</span>
              </p>
            </div>
          </div>

          <!-- Date : sur mobile, elle s'affiche en bas séparée par une ligne -->
          <div class="text-[11px] md:text-xs font-medium text-slate-500 shrink-0 flex sm:flex-col justify-between sm:justify-center w-full sm:w-auto border-t sm:border-t-0 border-slate-100 pt-2.5 sm:pt-0 sm:text-right">
            <span class="text-slate-800 font-bold bg-slate-100 px-2 py-1 rounded sm:bg-transparent sm:p-0">{new Date(log.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
            <span class="text-slate-400">{new Date(log.createdAt).toLocaleDateString('fr-FR')}</span>
          </div>

        </div>
      {/each}
    </div>
  {/if}
</div>
