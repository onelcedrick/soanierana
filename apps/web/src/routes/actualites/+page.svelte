<script lang="ts">
  import { onMount } from 'svelte';
  import { fly } from 'svelte/transition';
  import { listPublicPublications } from '$lib/api/publications';
  import NewsCard from '$lib/components/public/NewsCard.svelte';
  import Navbar from '$lib/components/public/Navbar.svelte';
  import Footer from '$lib/components/public/Footer.svelte';
  import ShareButton from '$lib/components/ui/ShareButton.svelte';
  import { API_ROOT_URL } from '$lib/api/config';
  import type { Publication } from '$lib/api/types';

  let publications: Publication[] = [];
  let loading = true;
  let error = '';

  onMount(async () => {
    try {
      const res = await fetch(`${API_ROOT_URL}/api/church/default`);
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

  // --- LOGIQUE DE REGROUPEMENT PAR SEMAINE (Dimanche à Samedi) ---
  function getStartOfWeek(date: Date) {
    const d = new Date(date);
    // On remet l'heure à 00:00 pour éviter les décalages de fuseau horaire
    d.setHours(0, 0, 0, 0); 
    const day = d.getDay(); // 0 = Dimanche, 1 = Lundi, ..., 6 = Samedi
    const diff = d.getDate() - day; // On recule jusqu'au Dimanche
    return new Date(d.setDate(diff));
  }

  function addDays(date: Date, days: number) {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }

  $: groupedPublications = publications.reduce((acc, pub) => {
    const date = new Date(pub.publishedAt || Date.now());
    const startOfWeek = getStartOfWeek(date);
    const weekKey = startOfWeek.toISOString().split('T')[0];
    
    if (!acc[weekKey]) {
      acc[weekKey] = { startDate: startOfWeek, items: [] };
    }
    acc[weekKey].items.push(pub);
    return acc;
  }, {} as Record<string, { startDate: Date, items: Publication[] }>);

  $: sortedGroups = Object.values(groupedPublications).sort((a, b) => b.startDate.getTime() - a.startDate.getTime());
</script>

<svelte:head>
  <title>Actualités - ChurchTask</title>
</svelte:head>

<div class="bg-slate-50 min-h-screen flex flex-col">
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
      <div class="space-y-12">
        {#each sortedGroups as group}
          <div class="bg-slate-50/50 rounded-3xl p-4 md:p-6 border border-slate-100 shadow-sm">
            <!-- En-tête de la semaine -->
            <div class="flex items-center gap-3 mb-6 pb-4 border-b border-slate-200">
              <div class="w-2 h-8 bg-brand-500 rounded-full"></div>
              <div>
                <h2 class="text-xl font-bold text-slate-900">
                  Semaine du {group.startDate.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })} 
                  au {addDays(group.startDate, 6).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                </h2>
                <p class="text-xs text-slate-500 font-medium mt-1">{group.items.length} publication(s)</p>
              </div>
            </div>
            
            <!-- Grille de la semaine -->
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 items-start">
              {#each group.items as pub, i}
                <div in:fly={{ y: 20, duration: 400, delay: i * 100 }} class="relative group h-full">
                  <div class="absolute bottom-4 right-4 z-10 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-200">
                    <ShareButton url={`${typeof window !== 'undefined' ? window.location.origin : ''}/actualites`} title={pub.title} />
                  </div>
                  <NewsCard 
                    title={pub.title} 
                    date={new Date(pub.publishedAt || Date.now()).toLocaleDateString('fr-FR')} 
                    excerpt={pub.content} 
                    image={pub.coverImageUrl} 
                  />
                </div>
              {/each}
            </div>
          </div>
        {/each}
      </div>
    {/if}
  </main>

  <Footer />
</div>
