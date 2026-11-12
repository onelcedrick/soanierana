<script lang="ts">import Navbar from '$lib/components/public/Navbar.svelte'; import Footer from '$lib/components/public/Footer.svelte';</script>
<div class="bg-slate-50 min-h-screen flex flex-col">
  <div class="bg-slate-900 pt-4 pb-12"><Navbar transparent={true} /></div>
  <main class="flex-1 max-w-4xl mx-auto w-full px-6 py-12 -mt-8">
    <h1 class="text-3xl font-bold text-slate-900 mb-8">Événements à venir</h1>
    <p class="text-slate-600">La liste des événements sera bientôt disponible.</p>
  </main>
  <Footer />
</div>
