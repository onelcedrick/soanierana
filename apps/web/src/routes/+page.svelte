<script lang="ts">
  import { onMount } from 'svelte';
  import { fly } from 'svelte/transition';
  import { listPublicPublications } from '$lib/api/publications';
  import { listEvents, type Event } from '$lib/api/events';
  import { listPublicForms, submitResponse, type Form } from '$lib/api/forms';
  import NewsCard from '$lib/components/public/NewsCard.svelte';
  import EventCard from '$lib/components/public/EventCard.svelte';
  import Hero from '$lib/components/public/Hero.svelte';
  import Features from '$lib/components/public/Features.svelte';
  import Footer from '$lib/components/public/Footer.svelte';
  import type { Publication } from '$lib/api/types';

  let publications: Publication[] = [];
  let events: Event[] = [];
  let forms: Form[] = [];
  let coverImageUrl: string | null = null;
  let loading = true;

  // Gestion des formulaires
  let showFormId: string | null = null;
  let formData: Record<string, string> = {};
  let formStatus = { loading: false, success: false, error: '' };

  onMount(async () => {
    try {
      const res = await fetch('http://localhost:3000/api/church/default', { cache: 'no-store' });
      if (res.ok) {
        const church = await res.json();
        coverImageUrl = church.coverImageUrl;
        
        const [pubs, evs, frms] = await Promise.all([
          listPublicPublications(church.id),
          listEvents(church.id, true),
          listPublicForms(church.id)
        ]);
        
        publications = pubs;
        events = evs;
        forms = frms;
      }
    } catch (err) {
      console.error(err);
    } finally { 
      loading = false; 
    }
  });

  async function submitForm(formId: string) {
    formStatus = { loading: true, success: false, error: '' };
    try {
      await submitResponse(formId, formData);
      formStatus.success = true;
      formData = {};
      setTimeout(() => {
        showFormId = null;
        formStatus.success = false;
      }, 3000);
    } catch (err) {
      formStatus.error = "Erreur lors de l'envoi. Veuillez réessayer.";
    } finally {
      formStatus.loading = false;
    }
  }
</script>

<div class="bg-slate-50 min-h-screen flex flex-col">
  
  

  <Hero imageUrl={coverImageUrl} />
  <Features />

  <main class="flex-1 max-w-6xl mx-auto w-full px-4 md:px-6 py-12 space-y-16">
    
    <!-- SECTION ÉVÉNEMENTS -->
    {#if loading}
      <div class="space-y-6">
        <div class="h-8 bg-slate-200 animate-pulse rounded-lg w-64"></div>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div class="h-80 bg-slate-200 animate-pulse rounded-2xl"></div>
          <div class="h-80 bg-slate-200 animate-pulse rounded-2xl"></div>
          <div class="h-80 bg-slate-200 animate-pulse rounded-2xl"></div>
        </div>
      </div>
    {:else if events.length > 0}
      <div>
        <div class="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-2">
          <div>
            <h2 class="text-2xl font-bold text-slate-900">Prochains Événements</h2>
            <p class="text-slate-500 mt-1">Ne manquez pas les activités spéciales.</p>
          </div>
          <a href="/evenements" class="text-sm font-medium text-brand-600 hover:underline">Voir tous &rarr;</a>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          {#each events.slice(0, 3) as ev, i}
            <div in:fly={{ y: 30, duration: 600, delay: i * 150 }} class="h-full">
              <EventCard event={ev} />
            </div>
          {/each}
        </div>
      </div>
    {/if}

    <!-- SECTION FORMULAIRES D'ENQUETE -->
    {#if forms.length > 0}
      <div>
        <div class="mb-6">
          <h2 class="text-2xl font-bold text-slate-900">Formulaires d'enquête</h2>
          <p class="text-slate-500 mt-1">Participez à la vie de l'église en répondant à nos formulaires.</p>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          {#each forms as form, i}
            <div in:fly={{ y: 30, duration: 600, delay: i * 150 }} class="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden p-6">
              <div class="flex justify-between items-start mb-2">
                <div>
                  <h3 class="font-bold text-lg text-slate-900">{form.title}</h3>
                  <p class="text-sm text-slate-500 mt-1">{form.description}</p>
                </div>
                {#if showFormId !== form.id}
                  <button on:click={() => { showFormId = form.id; formStatus = { loading: false, success: false, error: '' }; }} class="bg-brand-50 text-brand-700 font-medium px-4 py-2 rounded-lg text-sm hover:bg-brand-100 transition shrink-0">
                    Remplir
                  </button>
                {/if}
              </div>

              {#if showFormId === form.id}
                <div class="mt-4 pt-4 border-t border-slate-100">
                  {#if formStatus.success}
                    <div class="bg-green-50 text-green-700 p-3 rounded-lg text-sm text-center border border-green-200">
                      Merci ! Votre réponse a bien été enregistrée.
                    </div>
                  {:else}
                    {#if formStatus.error}
                      <div class="bg-red-50 text-red-600 p-2 rounded-lg text-xs mb-3">{formStatus.error}</div>
                    {/if}
                    
                    <div class="grid gap-3">
                      {#if !form.fields || form.fields.length === 0}
                        <p class="text-sm text-orange-600 bg-orange-50 p-3 rounded-lg border border-orange-200">
                          Ce formulaire a été créé sans champs. Veuillez le modifier dans l administration pour ajouter des champs.
                        </p>
                      {/if}
                      {#each form.fields || [] as field}
                        <div>
                          <label class="block text-xs font-medium text-slate-700 mb-1">{field.label} {#if field.required}<span class="text-red-500">*</span>{/if}</label>
                          {#if field.type === 'textarea'}
                            <textarea bind:value={formData[field.id]} required={field.required} rows="3" class="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-brand-500"></textarea>
                          {:else if field.type === 'select'}
                            <select bind:value={formData[field.id]} required={field.required} class="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-brand-500">
                              <option value="">-- Choisir --</option>
                              {#each field.options || [] as opt}
                                <option value={opt}>{opt}</option>
                              {/each}
                            </select>
                          {:else}
                            <input type={field.type} bind:value={formData[field.id]} required={field.required} class="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-brand-500" />
                          {/if}
                        </div>
                      {/each}
                    </div>
                    <div class="flex gap-2 mt-4">
                      <button on:click={() => submitForm(form.id)} disabled={formStatus.loading} class="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-500 transition disabled:opacity-50">
                        {formStatus.loading ? 'Envoi...' : 'Envoyer'}
                      </button>
                      <button on:click={() => showFormId = null} class="text-slate-500 text-sm hover:underline px-2">
                        Annuler
                      </button>
                    </div>
                  {/if}
                </div>
              {/if}
            </div>
          {/each}
        </div>
      </div>
    {/if}

    <!-- SECTION ACTUALITÉS -->
    <div>
      <div class="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-2">
        <div>
          <h2 class="text-2xl font-bold text-slate-900">Dernières Actualités</h2>
          <p class="text-slate-500 mt-1">Restez informé de la vie de notre communauté.</p>
        </div>
        <a href="/actualites" class="text-sm font-medium text-brand-600 hover:underline">Voir toutes les actualités &rarr;</a>
      </div>
      
      {#if loading}
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          <div class="h-80 bg-slate-200 animate-pulse rounded-xl"></div>
          <div class="h-80 bg-slate-200 animate-pulse rounded-xl"></div>
          <div class="h-80 bg-slate-200 animate-pulse rounded-xl"></div>
        </div>
      {:else if publications.length === 0}
        <p class="text-slate-500 bg-white p-6 rounded-xl border border-slate-200 text-center">Aucune actualité pour le moment.</p>
      {:else}
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 items-start">
          {#each publications.slice(0, 3) as pub, i}
            <div in:fly={{ y: 40, duration: 700, delay: i * 200 }} class="h-full">
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
    </div>

  </main>
  <Footer />
</div>
