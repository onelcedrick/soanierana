<script lang="ts">
  import '../app.css';
  import { onMount } from 'svelte';
  import { generatePalette, applyTheme } from '$lib/theme/color-engine';
  import { browser } from '$app/environment';

  onMount(async () => {
    // 1. Charger le thème
    try {
      const res = await fetch('http://localhost:3000/api/church/default', { cache: 'no-store' });
      if (res.ok) {
        const church = await res.json();
        if (church.themeConfig && church.themeConfig.primaryColor) {
          const palette = generatePalette(church.themeConfig.primaryColor, church.themeConfig.isDark || false);
          applyTheme(palette);
        }
      }
    } catch (err) {
      console.error('Erreur chargement du thème', err);
    }

    // 2. Script Keep-Alive pour Render (toutes les 30s)
    if (browser) {
      const pingBackend = async () => {
        try {
          // Remplace l'URL par celle de ton backend sur Render en production
          const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
          await fetch(`${apiUrl}/api/health`);
          console.log('Keep-alive ping envoyé au backend');
        } catch (error) {
          console.warn('Backend en veille ou injoignable');
        }
      };

      // Ping immédiat au chargement
      pingBackend();

      // Puis toutes les 30 secondes
      const interval = setInterval(pingBackend, 30000);

      // Nettoyage si on quitte la page (pour éviter les fuites de mémoire)
      return () => clearInterval(interval);
    }
  });
</script>

<slot />
