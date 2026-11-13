<script lang="ts">
  import { navigating } from '$app/stores';
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';
  import { generatePalette, applyTheme } from '$lib/theme/color-engine';
  import { PUBLIC_API_URL } from '$env/static/public';
  import '../app.css';

  // On détermine l'URL de base de l'API
  const API_ROOT = PUBLIC_API_URL ? PUBLIC_API_URL.replace('/api', '') : 'http://localhost:3000';

  onMount(async () => {
    if (!browser) return;

    // 1. Appliquer le thème depuis le cache (localStorage) pour un affichage instantané
    try {
      const cached = localStorage.getItem('church_theme');
      if (cached) {
        const { primaryColor, isDark } = JSON.parse(cached);
        applyTheme(generatePalette(primaryColor, isDark));
      }
    } catch (e) {
      console.error("Erreur lecture cache thème", e);
    }

    // 2. Récupérer le thème depuis la base de données pour être sûr d'avoir le dernier
    try {
      const res = await fetch(`${API_ROOT}/api/church/default`, { cache: 'no-store' });
      if (res.ok) {
        const church = await res.json();
        if (church.themeConfig) {
          applyTheme(generatePalette(church.themeConfig.primaryColor, church.themeConfig.isDark));
          localStorage.setItem('church_theme', JSON.stringify(church.themeConfig));
        }
      }
    } catch (e) {
      console.error("Erreur récupération thème API", e);
    }
  });
</script>

<!-- Barre de chargement -->
{#if $navigating}
  <div class="fixed top-0 left-0 right-0 h-1 z-[999] bg-brand-500 transition-all duration-300 ease-out" style="width: 100%"></div>
{/if}

<slot />
