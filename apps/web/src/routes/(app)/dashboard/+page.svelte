<script lang="ts">
  import StatCard from '$lib/components/admin/StatCard.svelte';
  import RecentActivity from '$lib/components/admin/RecentActivity.svelte';
  import { getDashboardStats, type DashboardStats } from '$lib/api/dashboard';
  import { listEvents, type Event } from '$lib/api/events';
  import { auth } from '$lib/stores/auth';
  import { get } from 'svelte/store';
  import { onMount } from 'svelte';

  let stats: DashboardStats | null = null;
  let nextEvent: Event | null = null;
  let loading = true;
  let errorMsg = '';
  
  // Variable pour l'image de fond
  let coverImage = 'https://images.unsplash.com/photo-1438032005730-c779502df39b?q=80&w=2071&auto=format&fit=crop';

  onMount(async () => {
    const authState = get(auth);
    if (!authState.token || !authState.user) {
      errorMsg = "Vous devez être connecté.";
      loading = false;
      return;
    }

    try {
      // 1. Charger l'image de fond de l'église
      const churchRes = await fetch('http://localhost:3000/api/church/default');
      if (churchRes.ok) {
        const churchData = await churchRes.json();
        if (churchData.coverImageUrl) {
          coverImage = churchData.coverImageUrl;
        }
      }

      // 2. Charger les stats
      stats = await getDashboardStats(authState.user.churchId, authState.token);
      
      // 3. Charger le prochain événement
      const evs = await listEvents(authState.user.churchId, true);
      if (evs.length > 0) nextEvent = evs[0];
    } catch (err) {
      console.error(err);
      errorMsg = "Erreur de chargement. Votre session a peut-être expiré.";
    } finally {
      loading = false;
    }
  });
</script>

{#if errorMsg}
  <div class="bg-red-50 text-red-600 p-4 rounded-xl border border-red-200 mb-6 font-medium">
    {errorMsg}
  </div>
{/if}

<!-- Bannière de bienvenue (Image dynamique) -->
<div class="relative rounded-2xl overflow-hidden mb-8 h-[140px] flex items-center px-8 shadow-sm group">
  <img src={coverImage} class="absolute inset-0 w-full h-full object-cover transition duration-500 group-hover:scale-105" alt="Church Background" />
  <!-- Overlay pour que le texte reste lisible peu importe l'image -->
  <div class="absolute inset-0 bg-gradient-to-r from-slate-900/90 via-slate-900/60 to-transparent"></div>
  
  <div class="relative z-10 text-white">
    <h1 class="text-2xl md:text-xl md:text-3xl font-bold">Tableau de bord 👋</h1>
    <p class="text-slate-200 text-sm md:text-base mt-1">Bienvenue sur votre espace d'administration, que la grâce de Dieu soit avec vous !</p>
  </div>
</div>

<!-- KPIs (Valeurs Réelles) -->
<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
  <StatCard title="Membres inscrits" value={loading ? "..." : String(stats?.members || 0)} trend="+0%" color="blue" icon="users" />
  <StatCard title="Événements publiés" value={loading ? "..." : String(stats?.events || 0)} trend="+0%" color="green" icon="calendar" />
  <StatCard title="Sondages actifs" value={loading ? "..." : String(stats?.polls || 0)} trend="+0%" color="purple" icon="poll" />
  <StatCard title="Tâches en cours" value={loading ? "..." : String(stats?.tasks || 0)} trend="+0%" color="orange" icon="task" />
</div>

<!-- Grille principale -->
<div class="grid grid-cols-1 lg:grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
  
  <!-- Colonne de gauche (2/3) -->
  <div class="lg:col-span-2 space-y-6">
    
    <!-- Activité & Graphique -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
      <RecentActivity logs={stats?.recentLogs || []} />
      
      <div class="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 h-full flex flex-col">
        <div class="flex justify-between items-center mb-4">
          <h3 class="font-bold text-slate-800 flex items-center gap-2">
            <svg class="text-blue-500" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v18h18"></path><path d="m19 9-5 5-4-4-3 3"></path></svg>
            Vue d'ensemble
          </h3>
        </div>
        <div class="flex-1 relative flex items-end">
          <div class="absolute inset-0 flex flex-col justify-between text-[10px] text-slate-400">
            <div class="border-b border-slate-100 w-full flex items-center"><span class="bg-white pr-2">100</span></div>
            <div class="border-b border-slate-100 w-full flex items-center"><span class="bg-white pr-2">50</span></div>
            <div class="border-b border-slate-100 w-full flex items-center"><span class="bg-white pr-2">0</span></div>
          </div>
          <svg viewBox="0 0 100 40" class="w-full h-full relative z-10" preserveAspectRatio="none">
            <path d="M0,35 Q10,32 20,35 T40,28 T60,32 T80,25 T100,20" fill="none" stroke="#2563eb" stroke-width="2"/>
          </svg>
        </div>
      </div>
    </div>

    <!-- Prochains événements -->
    <div class="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
      <div class="flex justify-between items-center mb-4">
        <h3 class="font-bold text-slate-800 flex items-center gap-2">
          <svg class="text-orange-500" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"></rect><line x1="16" x2="16" y1="2" y2="6"></line><line x1="8" x2="8" y1="2" y2="6"></line><line x1="3" x2="21" y1="10" y2="10"></line></svg>
          Prochains événements
        </h3>
        <a href="/events" class="text-sm font-medium text-blue-600 hover:underline">Voir tout &rarr;</a>
      </div>
      
      {#if nextEvent}
        <div class="flex gap-4 items-center bg-slate-50 p-4 rounded-xl border border-slate-100">
          {#if nextEvent.coverImageUrl}
            <img src={nextEvent.coverImageUrl} class="w-24 h-24 object-cover rounded-lg shadow-sm" alt="Event" />
          {:else}
            <div class="w-24 h-24 bg-slate-200 rounded-lg flex items-center justify-center text-slate-400 text-xs">Photo</div>
          {/if}
          <div>
            <span class="text-[10px] font-bold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded uppercase tracking-wide mb-1 inline-block">À venir</span>
            <h4 class="font-bold text-slate-900 text-base">{nextEvent.title}</h4>
            <p class="text-xs text-slate-500 flex items-center gap-1.5 mt-1 font-medium">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"></rect><line x1="16" x2="16" y1="2" y2="6"></line><line x1="8" x2="8" y1="2" y2="6"></line><line x1="3" x2="21" y1="10" y2="10"></line></svg>
              {new Date(nextEvent.startDate).toLocaleDateString('fr-FR')}
            </p>
            <p class="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5 font-medium">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path><circle cx="12" cy="10" r="3"></circle></svg>
              {nextEvent.location || 'Lieu non défini'}
            </p>
          </div>
        </div>
      {:else}
        <p class="text-sm text-slate-500 p-4">Aucun événement à venir pour le moment.</p>
      {/if}
    </div>
  </div>

  <!-- Colonne de droite (1/3) -->
  <div class="space-y-6">
    <!-- Citation Biblique -->
    <div class="relative bg-slate-900 rounded-2xl p-6 overflow-hidden text-white shadow-lg h-48 flex flex-col justify-end">
      <img src="https://images.unsplash.com/photo-1491841550275-ad7854e35ca6?q=80&w=600" class="absolute inset-0 w-full h-full object-cover opacity-20" alt="Bible" />
      <div class="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent"></div>
      <div class="relative z-10">
        <p class="text-sm italic leading-relaxed mb-2">« Car là où deux ou trois sont assemblés en mon nom, je suis au milieu d'eux. »</p>
        <p class="text-[10px] text-slate-400 mb-3 font-medium">Matthieu 18:20</p>
        <a href="/" target="_blank" class="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-slate-900 px-3 py-1.5 rounded-lg text-xs font-bold transition shadow-sm">
          Voir le site public &rarr;
        </a>
      </div>
    </div>

    <!-- Actions rapides -->
    <div class="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
      <h3 class="font-bold text-slate-800 mb-4 flex items-center gap-2">
        <svg class="text-amber-500" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m13 2-2 10h3L11 22l2-10h-3L13 2z"></path></svg>
        Actions rapides
      </h3>
      <div class="grid grid-cols-2 gap-2 md:gap-3">
        <a href="/events" class="flex flex-col items-center justify-center p-3 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50 transition text-center gap-2">
          <svg class="text-blue-500" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"></rect><line x1="16" x2="16" y1="2" y2="6"></line><line x1="8" x2="8" y1="2" y2="6"></line><line x1="3" x2="21" y1="10" y2="10"></line></svg>
          <span class="text-xs font-semibold text-slate-700 leading-tight">Créer un événement</span>
        </a>
        <a href="/publications" class="flex flex-col items-center justify-center p-3 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50 transition text-center gap-2">
          <svg class="text-blue-500" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
          <span class="text-xs font-semibold text-slate-700 leading-tight">Publier une actu</span>
        </a>
        <a href="/polls" class="flex flex-col items-center justify-center p-3 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50 transition text-center gap-2">
          <svg class="text-blue-500" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 20V10"></path><path d="M12 20V4"></path><path d="M6 20v-6"></path></svg>
          <span class="text-xs font-semibold text-slate-700 leading-tight">Créer un sondage</span>
        </a>
        <a href="/members" class="flex flex-col items-center justify-center p-3 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50 transition text-center gap-2">
          <svg class="text-blue-500" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
          <span class="text-xs font-semibold text-slate-700 leading-tight">Ajouter un membre</span>
        </a>
      </div>
    </div>
  </div>
</div>
