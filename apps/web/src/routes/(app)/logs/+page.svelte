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
    if (severity === 'CRITICAL') return 'bg-red-100 text-red-700';
    if (severity === 'WARNING') return 'bg-orange-100 text-orange-700';
    return 'bg-emerald-100 text-emerald-700';
  }
</script>

<h1 class="text-2xl font-bold mb-6 text-slate-900">Journal d'activité</h1>

<div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
  <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
    <div>
      <p class="text-sm font-medium text-slate-500 mb-1">Logs enregistrés</p>
      <h3 class="text-3xl font-bold text-slate-900">{data?.meta.total || 0}</h3>
    </div>
    <div class="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
    </div>
  </div>
  
  <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
    <div>
      <p class="text-sm font-medium text-slate-500 mb-1">Système opérationnel</p>
      <h3 class="text-3xl font-bold text-emerald-600">100%</h3>
    </div>
    <div class="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
    </div>
  </div>

  <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
    <div>
      <p class="text-sm font-medium text-slate-500 mb-1">Alertes (Critiques)</p>
      <h3 class="text-3xl font-bold text-red-600">
        {data?.data.filter(l => l.severity === 'CRITICAL').length || 0}
      </h3>
    </div>
    <div class="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center">
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
    </div>
  </div>
</div>

<div class="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
  <div class="flex justify-between items-center mb-6">
    <h2 class="font-bold text-lg text-slate-800">Dernières activités</h2>
    <select bind:value={currentSeverity} on:change={loadLogs} class="text-sm border border-slate-200 rounded-lg px-3 py-1.5 bg-slate-50 outline-none focus:border-brand-500">
      <option value="">Tous les niveaux</option>
      <option value="INFO">Info</option>
      <option value="WARNING">Avertissement</option>
      <option value="CRITICAL">Critique</option>
    </select>
  </div>

  {#if loading}
    <p class="text-slate-500">Chargement des logs...</p>
  {:else if error}
    <p class="text-red-600">{error}</p>
  {:else if !data || data.data.length === 0}
    <p class="text-slate-500">Aucun log enregistré pour le moment.</p>
  {:else}
    <div class="space-y-4">
      {#each data.data as log}
        <div class="flex items-start gap-4 p-4 rounded-xl border border-slate-100 hover:bg-slate-50 transition">
          
          <!-- Icônes officielles selon le module -->
          <div class="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center shrink-0 text-slate-600">
            {#if log.module === 'auth'}
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            {:else if log.module === 'members'}
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            {:else if log.module === 'events'}
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
            {:else}
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
            {/if}
          </div>

          <div class="flex-1">
            <div class="flex items-center gap-2 mb-1">
              <h3 class="font-bold text-slate-900">{log.action}</h3>
              <span class="text-[10px] font-bold px-2 py-0.5 rounded {getSeverityBadge(log.severity)}">
                {log.severity}
              </span>
            </div>
            <p class="text-sm text-slate-600">{log.description}</p>
            <p class="text-xs text-slate-400 mt-1">Par : {log.actorId.substring(0,8)}...</p>
          </div>
          <div class="text-xs font-medium text-slate-500 shrink-0 text-right">
            {new Date(log.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}<br>
            <span class="text-slate-400">{new Date(log.createdAt).toLocaleDateString('fr-FR')}</span>
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>
