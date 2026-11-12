<script lang="ts">
  import type { Event } from '$lib/api/events';
  
  export let event: Event;
  let expanded = false;
</script>

<article 
  class="bg-white rounded-2xl shadow-sm border overflow-hidden flex flex-col h-full transition-all duration-300 ease-in-out
  {expanded ? 'border-brand-300 shadow-xl ring-2 ring-brand-100 scale-[1.02] z-10 relative' : 'border-slate-200 hover:shadow-md hover:border-slate-300'}"
>
  <!-- L'image et le badge de date sont cliquables -->
  <a href="/evenements" class="block relative h-48 bg-slate-100 overflow-hidden shrink-0 group/img">
    {#if event.coverImageUrl}
      <img 
        src={event.coverImageUrl} 
        alt={event.title} 
        class="w-full h-full object-cover transition-transform duration-700 {expanded ? 'scale-110' : 'group-hover/img:scale-105'}" 
      />
    {:else}
      <div class="w-full h-full flex items-center justify-center text-slate-300">
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"></rect><line x1="16" x2="16" y1="2" y2="6"></line><line x1="8" x2="8" y1="2" y2="6"></line><line x1="3" x2="21" y1="10" y2="10"></line></svg>
      </div>
    {/if}
    
    <div class="absolute top-3 left-3 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-lg text-center shadow-sm group-hover/img:bg-white transition-colors">
      <span class="block text-xs font-bold text-brand-600 uppercase tracking-wider">{new Date(event.startDate).toLocaleDateString('fr-FR', { month: 'short' })}</span>
      <span class="block text-xl font-black text-slate-900 leading-none">{new Date(event.startDate).getDate()}</span>
    </div>
  </a>

  <div class="p-5 flex flex-col flex-1 relative">
    <div class="absolute top-0 left-5 right-5 h-0.5 bg-gradient-to-r from-transparent via-brand-100 to-transparent transition-opacity duration-300 {expanded ? 'opacity-100' : 'opacity-0'}"></div>

    <!-- Le titre est cliquable -->
    <a href="/evenements" class="block mb-2">
      <h3 class="font-bold text-lg text-slate-900 leading-tight hover:text-brand-600 transition-colors line-clamp-2">{event.title}</h3>
    </a>
    
    <p class="text-sm text-slate-600 mb-4 flex-1 transition-all duration-300 {expanded ? 'whitespace-pre-wrap leading-relaxed' : 'line-clamp-3'}">
      {event.description || 'Aucune description fournie pour cet événement.'}
    </p>
    
    <div class="mt-auto space-y-2 text-sm font-medium text-slate-500 bg-slate-50/50 p-3 rounded-xl border border-slate-100/50">
      <div class="flex items-center gap-2">
        <div class="w-6 h-6 rounded-full bg-white flex items-center justify-center text-brand-500 shadow-sm shrink-0">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"></rect><line x1="16" x2="16" y1="2" y2="6"></line><line x1="8" x2="8" y1="2" y2="6"></line><line x1="3" x2="21" y1="10" y2="10"></line></svg>
        </div>
        <span>{new Date(event.startDate).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
      </div>
      <div class="flex items-center gap-2">
        <div class="w-6 h-6 rounded-full bg-white flex items-center justify-center text-brand-500 shadow-sm shrink-0">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path><circle cx="12" cy="10" r="3"></circle></svg>
        </div>
        <span>{event.location || 'Lieu à définir'}</span>
      </div>
    </div>

    <!-- Le bouton pour agrandir la carte -->
    <button 
      on:click={() => expanded = !expanded} 
      class="mt-4 flex items-center justify-between w-full bg-brand-50 hover:bg-brand-100 text-brand-700 font-bold text-sm px-4 py-2.5 rounded-xl transition-all group/btn"
    >
      {expanded ? 'Réduire' : 'Voir les détails'}
      <svg 
        xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" 
        class="transition-transform duration-300 {expanded ? '-rotate-90' : 'group-hover/btn:translate-x-1'}"
      >
        <path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path>
      </svg>
    </button>
  </div>
</article>
