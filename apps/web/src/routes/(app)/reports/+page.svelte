<script lang="ts">
  import { auth } from '$lib/stores/auth';
  import { getAnalytics, type Analytics } from '$lib/api/reports';
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';

  let data: Analytics | null = null;
  let loading = true;
  let error = '';

  onMount(async () => {
    if (!$auth.token) return goto('/login');
    try {
      data = await getAnalytics($auth.user!.churchId, $auth.token!);
    } catch (err) {
      error = 'Erreur lors du chargement des statistiques.';
    } finally {
      loading = false;
    }
  });

  function getStatusLabel(status: string) {
    if (status === 'LOCAL_BAPTIZED') return 'Baptisés locaux';
    if (status === 'EXTERNAL_BAPTIZED') return 'Baptisés externes';
    if (status === 'UNBAPTIZED') return 'Non baptisés';
    return status;
  }
</script>

<!-- En-tête de la page -->
<div class="mb-6 md:mb-8 flex items-center gap-3">
  <div class="bg-brand-50 p-2.5 rounded-xl text-brand-600">
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v18h18"></path><path d="m19 9-5 5-4-4-3 3"></path></svg>
  </div>
  <h1 class="text-2xl md:text-3xl font-bold text-slate-900">Rapports & Statistiques</h1>
</div>

{#if loading}
  <div class="flex items-center gap-2 text-slate-500">
    <svg class="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
    Chargement des rapports...
  </div>
{:else if error}
  <div class="bg-red-50 text-red-600 p-4 rounded-xl border border-red-200 flex items-start gap-2 shadow-sm">
    <svg class="mt-0.5 shrink-0" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" x2="12" y1="8" y2="12"></line><line x1="12" x2="12.01" y1="16" y2="16"></line></svg>
    {error}
  </div>
{:else if data}
  <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
    
    <!-- Membres par statut -->
    <div class="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-slate-100">
      <h2 class="font-bold text-base md:text-lg text-slate-800 mb-4 flex items-center gap-2">
        <svg class="text-brand-500 shrink-0" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
        Répartition des membres
      </h2>
      <ul class="space-y-2 md:space-y-3">
        {#each data.membersByStatus as m}
          <li class="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
            <span class="font-medium text-sm md:text-base text-slate-700 truncate pr-2">{getStatusLabel(m.status)}</span>
            <span class="font-bold text-slate-900 bg-white px-3 py-1 rounded-md shadow-sm border border-slate-100 shrink-0">{m.count}</span>
          </li>
        {/each}
      </ul>
    </div>

    <!-- Taux de présence -->
    <div class="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-center items-center text-center">
      <h2 class="font-bold text-base md:text-lg text-slate-800 mb-4 w-full text-left flex items-center gap-2">
        <svg class="text-emerald-500 shrink-0" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
        Taux de présence global
      </h2>
      
      <div class="relative w-36 h-36 md:w-40 md:h-40 flex items-center justify-center rounded-full mb-4 shrink-0 shadow-sm" 
           style="background: conic-gradient(#10b981 {data.attendance.rate}%, #e2e8f0 0);">
        <div class="w-28 h-28 md:w-32 md:h-32 bg-white rounded-full flex items-center justify-center flex-col shadow-inner">
          <span class="text-2xl md:text-3xl font-bold text-slate-900">{data.attendance.rate}%</span>
          <span class="text-[10px] md:text-xs text-slate-500 font-medium">Présences</span>
        </div>
      </div>
      
      <div class="flex flex-wrap justify-center gap-2 md:gap-4 text-xs md:text-sm">
        <span class="text-emerald-600 font-bold bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100">{data.attendance.attended} Présences</span>
        <span class="text-red-500 font-bold bg-red-50 px-3 py-1.5 rounded-lg border border-red-100">{data.attendance.absent} Absences</span>
      </div>
    </div>

    <!-- Classement des participants -->
    <div class="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-slate-100">
      <h2 class="font-bold text-base md:text-lg text-slate-800 mb-4 flex items-center gap-2">
        <svg class="text-amber-500 shrink-0" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20"></path><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
        Top 5 des participants
      </h2>
      {#if data.topParticipants.length === 0}
        <div class="p-4 bg-slate-50 rounded-xl border border-slate-100 text-center">
          <p class="text-sm text-slate-500">Pas encore de données de participation.</p>
        </div>
      {:else}
        <ul class="space-y-2 md:space-y-3">
          {#each data.topParticipants as p, i}
            <li class="flex items-center gap-3 md:gap-4 p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span class="w-6 h-6 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-xs shrink-0">{i + 1}</span>
              <span class="font-medium text-sm md:text-base text-slate-700 flex-1 truncate">{p.name}</span>
              <span class="text-xs md:text-sm font-bold text-slate-900 shrink-0 bg-white px-2 py-1 rounded-md border border-slate-200">{p.count} fois</span>
            </li>
          {/each}
        </ul>
      {/if}
    </div>

    <!-- Événements par programme -->
    <div class="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-slate-100">
      <h2 class="font-bold text-base md:text-lg text-slate-800 mb-4 flex items-center gap-2">
        <svg class="text-brand-500 shrink-0" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"></rect><line x1="16" x2="16" y1="2" y2="6"></line><line x1="8" x2="8" y1="2" y2="6"></line><line x1="3" x2="21" y1="10" y2="10"></line></svg>
        Volume par programme
      </h2>
      <ul class="space-y-4">
        {#each data.eventsByProgram as ep}
          <li>
            <div class="flex justify-between text-xs md:text-sm font-medium text-slate-700 mb-1.5">
              <span class="truncate pr-2">{ep.name}</span>
              <span class="shrink-0">{ep.count} sessions</span>
            </div>
            <!-- Barre de progression au thème brand -->
            <div class="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
              <div class="bg-brand-500 h-2.5 rounded-full transition-all duration-1000" style="width: {ep.count > 0 ? Math.min(ep.count * 10, 100) : 0}%"></div>
            </div>
          </li>
        {/each}
      </ul>
    </div>

  </div>
{/if}
