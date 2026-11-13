<script lang="ts">
  import Navbar from './Navbar.svelte';
  export let imageUrl: string | null = null;

  const defaultImage = 'https://images.unsplash.com/photo-1438032005730-c779502df39b?q=80&w=2071&auto=format&fit=crop';
</script>

<div class="relative h-[600px] flex items-center">
  <div class="absolute inset-0 z-0">
    <img src={imageUrl || defaultImage} alt="Eglise" class="w-full h-full object-cover" />
    <div class="absolute inset-0 bg-gradient-to-r from-slate-900/90 to-slate-900/40"></div>
  </div>

  <Navbar transparent={true} />

  <div class="relative z-10 max-w-6xl mx-auto px-6 w-full mt-16">
    <div class="max-w-2xl text-white">
      <p class="text-brand-300 font-semibold tracking-widest text-sm mb-4 uppercase">Ensemble pour servir</p>
      <h1 class="text-5xl md:text-6xl font-bold leading-tight mb-6">
        Une Église Organisée,<br>Une Communauté Unie
      </h1>
      <p class="text-lg text-slate-200 mb-8 max-w-lg leading-relaxed">
        Découvrez nos activités, restez informés et participez à la vie de notre église.
      </p>
      <div class="flex flex-col sm:flex-row flex-wrap gap-4 w-full sm:w-auto">
        <a href="/evenements" class="bg-brand-600 hover:bg-brand-500 text-white px-6 py-3 rounded-full font-medium flex items-center gap-2 transition w-full sm:w-auto flex justify-center items-center">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"></rect><line x1="16" x2="16" y1="2" y2="6"></line><line x1="8" x2="8" y1="2" y2="6"></line><line x1="3" x2="21" y1="10" y2="10"></line></svg>
          Voir les événements
        </a>
        <a href="/sondages" class="bg-transparent border-2 border-white hover:bg-white/10 text-white px-6 py-3 rounded-full font-medium flex items-center gap-2 transition w-full sm:w-auto flex justify-center items-center">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 20V10"></path><path d="M12 20V4"></path><path d="M6 20v-6"></path></svg>
          Participer à un vote
        </a>
      </div>
    </div>
  </div>
</div>
