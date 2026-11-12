<script lang="ts">
  export let title: string;
  export let date: string;
  export let image: string | null;
  export let excerpt: string;

  let expanded = false;
  let imageLoaded = false;
  
  const defaultImage = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MDAiIGhlaWdodD0iMjAwIiB2aWV3Qm94PSIwIDAgNDAwIDIwMCI+PHJlY3Qgd2lkdGg9IjQwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiNmOTczMTYiLz48Y2lyY2xlIGN4PSIxMDAiIGN5PSI1MCIgcj0iMzAiIGZpbGw9IiNmZmQ3YjIiLz48cGF0aCBkPSJNMCAxNTAgTDEwMCAxMDAgTDIwMCAxNTAgTDMwMCA4MCBMNDAwIDEyMCBMNDAwIDIwMCBMMCAyMDAgWiIgZmlsbD0iI2M2MmQwMCIvPjwvc3ZnPg==';
</script>

<article 
  class="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-full transition-all duration-300 ease-in-out
  {expanded ? 'shadow-xl ring-2 ring-brand-100 scale-[1.02] z-10 relative' : 'hover:shadow-md hover:-translate-y-1'}"
>
  <!-- L'image est maintenant un lien vers /actualites -->
  <a href="/actualites" class="block relative h-48 overflow-hidden shrink-0 bg-slate-100 group/img">
    {#if !imageLoaded}
      <div class="absolute inset-0 bg-slate-200 animate-pulse"></div>
    {/if}

    <img 
      src={image || defaultImage} 
      alt={title} 
      on:load={() => imageLoaded = true}
      class="w-full h-full object-cover transition-all duration-700 {imageLoaded ? 'opacity-100' : 'opacity-0'} {expanded ? 'scale-110' : 'group-hover/img:scale-105'}" 
    />
    
    <div class="absolute top-3 right-3 bg-slate-900/80 text-white text-xs font-medium px-3 py-1 rounded-full backdrop-blur-sm shadow-sm transition-colors group-hover/img:bg-brand-600">
      {date}
    </div>
  </a>
  
  <div class="p-5 flex-1 flex flex-col relative">
    <!-- Le titre est maintenant un lien vers /actualites -->
    <a href="/actualites" class="block mb-2 group/title">
      <h3 class="font-bold text-lg text-slate-900 leading-tight transition-colors line-clamp-2 group-hover/title:text-brand-600">{title}</h3>
    </a>
    
    <p class="text-slate-600 text-sm mb-4 flex-1 transition-all duration-300 {expanded ? 'whitespace-pre-wrap leading-relaxed' : 'line-clamp-3'}">
      {excerpt}
    </p>
    
    <button 
      on:click={() => expanded = !expanded} 
      class="text-brand-600 font-medium text-sm flex items-center gap-1 hover:gap-2 transition-all mt-auto self-start group/btn"
    >
      {expanded ? 'Lire moins' : 'Lire plus'} 
      <svg 
        xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" 
        class="transition-transform duration-300 {expanded ? '-rotate-90' : 'group-hover/btn:translate-x-1'}"
      >
        <path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path>
      </svg>
    </button>
  </div>
</article>
