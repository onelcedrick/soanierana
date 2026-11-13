<script lang="ts">
  import { browser } from '$app/environment';

  export let url: string = '';
  export let title: string = '';
  
  let copied = false;

  async function share() {
    if (!browser) return;
    
    const shareUrl = url || window.location.href;
    
    try {
      if (navigator.share) {
        // Partage natif (Mobile)
        await navigator.share({
          title: title,
          text: `Découvrez ceci sur le site de notre église : ${title}`,
          url: shareUrl
        });
      } else {
        // Fallback : Copier le lien (PC)
        await navigator.clipboard.writeText(shareUrl);
        copied = true;
        setTimeout(() => (copied = false), 2000);
      }
    } catch (err) {
      console.error('Erreur de partage:', err);
    }
  }
</script>

<button 
  on:click|stopPropagation={share} 
  class="p-2 bg-white/90 hover:bg-white backdrop-blur-sm text-slate-600 rounded-full shadow-md transition-all flex items-center justify-center group"
  title="Partager"
>
  {#if copied}
    <svg class="text-green-600 animate-in zoom-in" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
  {:else}
    <svg class="group-hover:text-brand-600 transition-colors" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" x2="15.42" y1="13.51" y2="17.49"></line><line x1="15.41" x2="8.59" y1="6.51" y2="10.49"></line></svg>
  {/if}
</button>
