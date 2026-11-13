<script lang="ts">
  import { navigating } from '$app/stores';
  import '../app.css';
</script>

<!-- Barre de chargement ultra-fine en haut (sans faire clignoter l'écran) -->
{#if $navigating}
  <div class="fixed top-0 left-0 right-0 h-1 z-[999] bg-brand-500 transition-all duration-300 ease-out" style="width: 100%"></div>
{/if}

<!-- Remplacement instantané du contenu (pas de fade qui fait clignoter) -->
<slot />
