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
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">

  <path d="M12 2L3 9h18L12 2z"></path>
  <path d="M5 9v11h14V9"></path>
  <path d="M9 22V12h6v10"></path>
  <path d="M12 12v10"></path>
</svg>
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
