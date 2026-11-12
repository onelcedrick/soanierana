<script lang="ts">
  export let logs: any[] = [];
</script>

<div class="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 h-full">
  <div class="flex justify-between items-center mb-6">
    <h3 class="font-bold text-slate-800 flex items-center gap-2">
      <svg class="text-blue-500" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
      Activité récente
    </h3>
    <a href="/logs" class="text-sm font-medium text-blue-600 hover:underline">Voir tout &rarr;</a>
  </div>
  
  <div class="space-y-5 relative before:absolute before:inset-0 before:ml-4 before:-translate-x-px before:h-full before:w-0.5 before:bg-slate-100">
    {#if logs.length === 0}
      <p class="text-sm text-slate-500 pl-8">Aucune activité récente.</p>
    {:else}
      {#each logs as log}
        <div class="relative flex items-center gap-4">
          <div class="w-8 h-8 rounded-full flex items-center justify-center shrink-0 z-10 border-2 border-white
            {log.severity === 'CRITICAL' ? 'bg-red-100 text-red-600' : log.severity === 'WARNING' ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'}">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
          </div>
          <div class="flex-1">
            <p class="text-sm font-bold text-slate-800">{log.action}</p>
            <p class="text-xs text-slate-500 line-clamp-1">{log.description}</p>
          </div>
          <span class="text-xs text-slate-400 font-medium shrink-0">
            {new Date(log.created_at).toLocaleDateString('fr-FR')}
          </span>
        </div>
      {/each}
    {/if}
  </div>
</div>
