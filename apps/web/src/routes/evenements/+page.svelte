<script lang="ts">
  import { PUBLIC_API_URL } from '$env/static/public';
  import { onMount } from 'svelte';
  import Navbar from '$lib/components/public/Navbar.svelte';
  import Footer from '$lib/components/public/Footer.svelte';
  import EventCard from '$lib/components/public/EventCard.svelte';
  import { listEvents, type Event } from '$lib/api/events';

  let events: Event[] = [];
  let loading = true;
  let error = '';

  onMount(async () => {
    try {
      const res = await fetch(`${PUBLIC_API_URL}/church/default`, { cache: 'no-store' });
      const church = await res.json();
      events = await listEvents(church.id, false);
    } catch (err) {
      console.error(err);
      error = "Impossible de charger les événements pour le moment.";
    } finally {
      loading = false;
    }
  });
</script>

<svelte:head>
  <title>Événements - ChurchTask</title>
</svelte:head>

<div class="bg-slate-50 min-h-screen flex flex-col">
  <!-- Bandeau bleu foncé avec la Navbar -->
  <div class="bg-slate-900 h-20 md:h-24 relative w-full">
    <Navbar transparent={true} />
  </div>

  <main class="flex-1 max-w-6xl mx-auto w-full px-4 md:px-6 py-8">
    <div class="mb-8 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
      <h1 class="text-2xl md:text-3xl font-bold text-slate-900">Nos Événements</h1>
      <p class="text-slate-600 mt-2">Découvrez toutes les activités spéciales et rassemblements de notre église.</p>
    </div>

    {#if loading}
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div class="h-64 bg-slate-200 animate-pulse rounded-xl"></div>
        <div class="h-64 bg-slate-200 animate-pulse rounded-xl"></div>
      </div>
    {:else if error}
      <div class="bg-red-50 text-red-600 p-6 rounded-xl border border-red-200 text-center">
        {error}
      </div>
    {:else if events.length === 0}
      <div class="bg-white p-8 rounded-xl border border-slate-200 text-center text-slate-500">
        Aucun événement publié pour le moment.
      </div>
    {:else}
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
        {#each events as ev}
          <EventCard event={ev} />
        {/each}
      </div>
    {/if}
  </main>

  <Footer />
</div>
