<script lang="ts">
  import { onMount } from 'svelte';
  import { fly } from 'svelte/transition';
  import { listPublicPublications } from '$lib/api/publications';
  import NewsCard from '$lib/components/public/NewsCard.svelte';
  import Navbar from '$lib/components/public/Navbar.svelte';
  import Footer from '$lib/components/public/Footer.svelte';
  import type { Publication } from '$lib/api/types';

  let publications: Publication[] = [];
  let loading = true;
  let error = '';

  onMount(async () => {
    try {
      const res = await fetch('http://localhost:3000/api/church/default', { cache: 'no-store' });
      if (!res.ok) throw new Error('Impossible de charger les informations.');
      const church = await res.json();

      const pubs = await listPublicPublications(church.id);
      publications = pubs.sort((a, b) => {
        const dateA = new Date(a.publishedAt || 0).getTime();
        const dateB = new Date(b.publishedAt || 0).getTime();
        return dateB - dateA;
      });
    } catch (err) {
      error = err instanceof Error ? err.message : 'Erreur de connexion.';
    } finally {
      loading = false;
    }
  });
</script>

<svelte:head>
  <title>Actualités - ChurchTask</title>
</svelte:head>

<div class="bg-slate-50 min-h-screen flex flex-col">
  <!-- Bandeau bleu foncé avec la Navbar -->
  <div class="bg-slate-900 h-20 md:h-24 relative w-full">
    <Navbar transparent={true} />
  </div>

  <main class="flex-1 max-w-6xl mx-auto w-full px-4 md:px-6 py-8 md:py-12">
    <div class="mb-8 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
      <h1 class="text-2xl md:text-3xl font-bold text-slate-900">Toutes les actualités</h1>
      <p class="text-slate-600 mt-2">Retrouvez les dernières nouvelles de notre église.</p>
    </div>

    {#if loading}
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        <div class="h-80 bg-slate-200 animate-pulse rounded-xl"></div>
        <div class="h-80 bg-slate-200 animate-pulse rounded-xl"></div>
        <div class="h-80 bg-slate-200 animate-pulse rounded-xl"></div>
      </div>
    {:else if error}
      <div class="bg-red-50 text-red-600 p-6 rounded-xl border border-red-200 text-center">
        {error}
      </div>
    {:else if publications.length === 0}
      <div class="bg-white p-8 rounded-xl border border-slate-200 text-center text-slate-500">
        Aucune actualité n'a été publiée pour le moment.
      </div>
    {:else}
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 items-start">
        {#each publications as pub, i}
          <div in:fly={{ y: 40, duration: 600, delay: i * 100 }} class="h-full">
            <NewsCard 
              title={pub.title} 
              date={new Date(pub.publishedAt || Date.now()).toLocaleDateString('fr-FR')} 
              excerpt={pub.content} 
              image={pub.coverImageUrl} 
            />
          </div>
        {/each}
      </div>
    {/if}
  </main>

  <Footer />
</div>
