<script lang="ts">
  import { fade, fly } from 'svelte/transition';
  import Navbar from '$lib/components/public/Navbar.svelte';
  import Footer from '$lib/components/public/Footer.svelte';

  let form = { name: '', email: '', subject: '', message: '' };
  let status = { loading: false, success: false, error: '' };

  async function handleSubmit(e: Event) {
    e.preventDefault();
    status = { loading: true, success: false, error: '' };
    try {
      // Remplacer par un vrai appel API si tu as une route /api/messages
      await new Promise(resolve => setTimeout(resolve, 1000));
      status.success = true;
      form = { name: '', email: '', subject: '', message: '' };
    } catch (err) {
      status.error = "Erreur lors de l'envoi. Veuillez réessayer.";
    } finally {
      status.loading = false;
    }
  }
</script>

<svelte:head>
  <title>Contact - ChurchTask</title>
</svelte:head>

<div class="bg-slate-50 min-h-screen flex flex-col">
  <div class="bg-slate-900 h-20 md:h-24 relative w-full">
    <Navbar transparent={true} />
  </div>

  <main class="flex-1 max-w-4xl mx-auto w-full px-4 md:px-6 py-8 md:py-12">
    <div class="mb-8 bg-white p-6 rounded-2xl shadow-sm border border-slate-100" in:fade={{duration: 300}}>
      <h1 class="text-2xl md:text-3xl font-bold text-slate-900">Contactez-nous</h1>
      <p class="text-slate-600 mt-2">Une question, une demande de prière ou un message ? Nous vous répondrons dans les plus brefs délais.</p>
    </div>

    <div class="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-200" in:fly={{ y: 20, duration: 400 }}>
      {#if status.success}
        <div class="bg-green-50 text-green-700 p-6 rounded-xl border border-green-200 text-center" in:fade={{duration: 300}}>
          <div class="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
          </div>
          <h3 class="font-bold text-xl mb-2">Message envoyé !</h3>
          <p>Merci de nous avoir contactés. Nous reviendrons vers vous rapidement.</p>
          <button on:click={() => status.success = false} class="mt-6 bg-green-600 text-white font-bold px-6 py-2 rounded-xl hover:bg-green-500 transition">Envoyer un autre message</button>
        </div>
      {:else}
        {#if status.error}
          <div class="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-6 border border-red-200">{status.error}</div>
        {/if}
        <form on:submit={handleSubmit} class="space-y-5">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1.5">Nom complet</label>
              <input bind:value={form.name} required placeholder="Ex: Jean Rakoto" class="w-full border border-slate-300 px-4 py-3 rounded-xl outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 text-sm md:text-base transition bg-slate-50 focus:bg-white" />
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1.5">Adresse Email</label>
              <input type="email" bind:value={form.email} required placeholder="Ex: jean@gmail.com" class="w-full border border-slate-300 px-4 py-3 rounded-xl outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 text-sm md:text-base transition bg-slate-50 focus:bg-white" />
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1.5">Sujet</label>
            <input bind:value={form.subject} required placeholder="Ex: Demande d'information" class="w-full border border-slate-300 px-4 py-3 rounded-xl outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 text-sm md:text-base transition bg-slate-50 focus:bg-white" />
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1.5">Message</label>
            <textarea bind:value={form.message} required rows="5" placeholder="Écrivez votre message ici..." class="w-full border border-slate-300 px-4 py-3 rounded-xl outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 text-sm md:text-base transition bg-slate-50 focus:bg-white resize-y"></textarea>
          </div>
          <button type="submit" disabled={status.loading} class="w-full bg-brand-600 text-white font-bold py-3.5 rounded-xl hover:bg-brand-500 transition disabled:opacity-50 shadow-sm flex items-center justify-center gap-2">
            {#if status.loading}
              <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
              Envoi en cours...
            {:else}
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" x2="11" y1="2" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
              Envoyer le message
            {/if}
          </button>
        </form>
      {/if}
    </div>
  </main>

  <Footer />
</div>
