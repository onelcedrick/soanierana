<script lang="ts">
  import { PUBLIC_API_URL } from '$env/static/public';
  import { onMount } from 'svelte';
  import { fade, fly } from 'svelte/transition';
  import { listPublicPolls, castPublicVote, castMemberVote, type PublicPoll } from '$lib/api/polls';
  import ShareButton from '$lib/components/ui/ShareButton.svelte';
  import Navbar from '$lib/components/public/Navbar.svelte';
  import Footer from '$lib/components/public/Footer.svelte';
  import { auth } from '$lib/stores/auth';
  import { get } from 'svelte/store';

  let polls: PublicPoll[] = [];
  let loading = true;
  let votingPollId: string | null = null;
  let selectedOptionId: string | null = null;
  let publicToken = '';
  
  // Remplacement des alert() par des états
  let message = '';
  let errorMsg = '';

  if (typeof window !== 'undefined') {
    publicToken = localStorage.getItem('public_token') || Math.random().toString(36).substring(2);
    localStorage.setItem('public_token', publicToken);
  }

  onMount(async () => {
    try {
      const res = await fetch(`${PUBLIC_API_URL}/church/default`, { cache: 'no-store' });
      const church = await res.json();
      const token = get(auth).token;
      polls = await listPublicPolls(church.id, token);
    } catch (err) {
      console.error(err);
      errorMsg = "Impossible de charger les sondages.";
    } finally {
      loading = false;
    }
  });

  async function submitVote(poll: PublicPoll) {
    if (!selectedOptionId) return;
    const token = get(auth).token;
    message = ''; errorMsg = '';

    try {
      if (poll.audience === 'MEMBERS_ONLY') {
        if (!token) {
          errorMsg = 'Vous devez être connecté pour voter à ce sondage.';
          return;
        }
        await castMemberVote(poll.id, [selectedOptionId], token);
      } else {
        await castPublicVote(poll.id, publicToken, [selectedOptionId], token);
      }
      
      message = 'Votre vote a été enregistré avec succès !';
      if (poll.audience === 'MEMBERS_ONLY') {
        poll.hasVoted = true;
      }
      votingPollId = null;
      selectedOptionId = null;
      
      setTimeout(() => message = '', 4000);
    } catch (err) {
      errorMsg = 'Erreur lors de l\'enregistrement de votre vote.';
    }
  }
</script>

<svelte:head>
  <title>Sondages - SDA Soanierana</title>
</svelte:head>

<div class="bg-slate-50 min-h-screen flex flex-col">
  <div class="bg-slate-900 h-20 md:h-24 relative w-full">
    <Navbar transparent={true} />
  </div>

  <main class="flex-1 max-w-4xl mx-auto w-full px-4 md:px-6 py-8 md:py-12">
    <div class="mb-8 bg-white p-6 rounded-2xl shadow-sm border border-slate-100" in:fade={{duration: 300}}>
      <h1 class="text-2xl md:text-3xl font-bold text-slate-900">Sondages en cours</h1>
      <p class="text-slate-600 mt-2">Participez à la vie de l'église en donnant votre avis.</p>
    </div>

    <!-- Notifications inline -->
    {#if message}
      <div class="bg-green-50 text-green-700 p-4 rounded-xl border border-green-200 mb-6 flex items-center gap-3 shadow-sm" in:fade={{duration: 300}}>
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
        {message}
      </div>
    {/if}
    {#if errorMsg}
      <div class="bg-red-50 text-red-600 p-4 rounded-xl border border-red-200 mb-6 flex items-center gap-3 shadow-sm" in:fade={{duration: 300}}>
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" x2="12" y1="8" y2="12"></line><line x1="12" x2="12.01" y1="16" y2="16"></line></svg>
        {errorMsg}
      </div>
    {/if}

    {#if loading}
      <!-- Skeletons -->
      <div class="space-y-6" in:fade={{duration: 300}}>
        <div class="bg-white rounded-2xl border border-slate-200 p-6 animate-pulse">
          <div class="h-6 bg-slate-200 rounded w-1/2 mb-3"></div>
          <div class="h-4 bg-slate-200 rounded w-1/4 mb-6"></div>
          <div class="space-y-3">
            <div class="h-12 bg-slate-100 rounded-lg"></div>
            <div class="h-12 bg-slate-100 rounded-lg"></div>
          </div>
        </div>
      </div>
    {:else if polls.length === 0}
      <div class="bg-white p-8 rounded-2xl border border-slate-200 text-center text-slate-500" in:fade={{duration: 300}}>
        <div class="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
          <svg class="text-slate-400" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 20V10"></path><path d="M12 20V4"></path><path d="M6 20v-6"></path></svg>
        </div>
        <p class="font-medium">Aucun sondage en cours pour le moment.</p>
      </div>
    {:else}
      <div class="grid gap-6">
        {#each polls as poll, i}
          <div class="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 md:p-6" in:fly={{ y: 20, duration: 400, delay: i * 100 }}>
            <div class="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6">
              <div>
                <div class="flex flex-wrap items-center gap-2 mb-1">
                  <div class="flex items-center gap-2">
                  <h3 class="font-bold text-slate-900 text-lg md:text-xl">{poll.title}</h3>
                  <ShareButton url={`${typeof window !== 'undefined' ? window.location.origin : ''}/sondages`} title={poll.title} />
                </div>
                  {#if poll.audience === 'MEMBERS_ONLY'}
                    <span class="text-[10px] font-bold bg-brand-100 text-brand-700 px-2 py-0.5 rounded uppercase tracking-wide">Membres</span>
                  {/if}
                </div>
                <p class="text-xs md:text-sm text-slate-500">Clôture le {new Date(poll.closesAt).toLocaleDateString('fr-FR')}</p>
              </div>
              
              {#if poll.hasVoted}
                <span class="bg-green-50 text-green-700 border border-green-200 font-bold px-4 py-2 rounded-lg text-sm flex items-center gap-2 shrink-0 w-full sm:w-auto justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                  Déjà voté
                </span>
              {:else if poll.status === 'PUBLISHED' && votingPollId !== poll.id}
                {#if poll.audience === 'MEMBERS_ONLY' && !$auth.token}
                  <a href="/login" class="bg-slate-100 text-slate-600 font-bold px-5 py-2 rounded-xl text-sm hover:bg-slate-200 transition shrink-0 w-full sm:w-auto text-center">Connexion requise</a>
                {:else}
                  <button on:click={() => { votingPollId = poll.id; selectedOptionId = null; }} class="bg-brand-50 text-brand-700 font-bold px-6 py-2 rounded-xl text-sm hover:bg-brand-100 transition shrink-0 w-full sm:w-auto shadow-sm">Voter</button>
                {/if}
              {/if}
            </div>

            {#if votingPollId === poll.id}
              <div class="bg-slate-50 rounded-xl p-4 md:p-5 border border-slate-100" in:fade={{duration: 200}}>
                <div class="space-y-3">
                  {#each poll.options as opt}
                    <label class="flex items-center gap-3 p-4 bg-white border border-slate-200 rounded-xl cursor-pointer hover:border-brand-400 hover:shadow-sm transition">
                      <input type="radio" bind:group={selectedOptionId} value={opt.id} class="w-5 h-5 text-brand-600 focus:ring-brand-500 border-slate-300" />
                      <span class="text-slate-700 font-medium text-sm md:text-base">{opt.label}</span>
                    </label>
                  {/each}
                </div>
                <div class="flex flex-col sm:flex-row gap-3 mt-5">
                  <button on:click={() => submitVote(poll)} disabled={!selectedOptionId} class="bg-brand-600 text-white px-6 py-2.5 rounded-xl font-bold disabled:opacity-50 hover:bg-brand-500 transition shadow-sm w-full sm:w-auto">Valider mon vote</button>
                  <button on:click={() => votingPollId = null} class="text-slate-500 font-bold hover:bg-slate-200 px-4 py-2.5 rounded-xl transition w-full sm:w-auto">Annuler</button>
                </div>
              </div>
            {/if}
          </div>
        {/each}
      </div>
    {/if}
  </main>

  <Footer />
</div>
