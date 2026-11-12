<script lang="ts">
  import { onMount } from 'svelte';
  import { listPublicPolls, castPublicVote, castMemberVote, type PublicPoll } from '$lib/api/polls';
  import Navbar from '$lib/components/public/Navbar.svelte';
  import Footer from '$lib/components/public/Footer.svelte';
  import { auth } from '$lib/stores/auth';
  import { get } from 'svelte/store';

  let polls: PublicPoll[] = [];
  let loading = true;
  let votingPollId: string | null = null;
  let selectedOptionId: string | null = null;
  let publicToken = '';

  if (typeof window !== 'undefined') {
    publicToken = localStorage.getItem('public_token') || Math.random().toString(36).substring(2);
    localStorage.setItem('public_token', publicToken);
  }

  onMount(async () => {
    try {
      const res = await fetch('http://localhost:3000/api/church/default', { cache: 'no-store' });
      const church = await res.json();
      const token = get(auth).token;
      polls = await listPublicPolls(church.id, token);
    } catch (err) {
      console.error(err);
    } finally {
      loading = false;
    }
  });

  async function submitVote(poll: PublicPoll) {
    if (!selectedOptionId) return;
    const token = get(auth).token;

    try {
      if (poll.audience === 'MEMBERS_ONLY') {
        if (!token) {
          alert('Vous devez être connecté pour voter à ce sondage.');
          return;
        }
        await castMemberVote(poll.id, [selectedOptionId], token);
      } else {
        await castPublicVote(poll.id, publicToken, [selectedOptionId], token);
      }
      
      alert('Vote enregistré avec succès !');
      if (poll.audience === 'MEMBERS_ONLY') {
        poll.hasVoted = true;
      }
      votingPollId = null;
      selectedOptionId = null;
    } catch (err) {
      alert('Erreur lors du vote');
    }
  }
</script>

<svelte:head>
  <title>Sondages - ChurchTask</title>
</svelte:head>

<div class="bg-slate-50 min-h-screen flex flex-col">
  <!-- Bandeau bleu foncé avec la Navbar -->
  <div class="bg-slate-900 h-20 md:h-24 relative w-full">
    <Navbar transparent={true} />
  </div>

  <main class="flex-1 max-w-4xl mx-auto w-full px-4 md:px-6 py-8">
    <div class="mb-8 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
      <h1 class="text-3xl font-bold text-slate-900">Sondages en cours</h1>
      <p class="text-slate-600 mt-2">Participez à la vie de l'église en donnant votre avis.</p>
    </div>

    {#if loading}
      <p>Chargement...</p>
    {:else if polls.length === 0}
      <div class="bg-white p-8 rounded-xl border border-slate-200 text-center text-slate-500">
        Aucun sondage en cours.
      </div>
    {:else}
      <div class="grid gap-6">
        {#each polls as poll}
          <div class="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <div class="flex justify-between items-start mb-6">
              <div>
                <div class="flex items-center gap-2 mb-1">
                  <h3 class="font-bold text-slate-900 text-xl">{poll.title}</h3>
                  {#if poll.audience === 'MEMBERS_ONLY'}
                    <span class="text-[10px] font-bold bg-blue-100 text-blue-700 px-2 py-0.5 rounded uppercase tracking-wide">Membres</span>
                  {/if}
                </div>
                <p class="text-sm text-slate-500">Clôture le {new Date(poll.closesAt).toLocaleDateString('fr-FR')}</p>
              </div>
              
              {#if poll.hasVoted}
                <span class="bg-green-100 text-green-700 font-medium px-4 py-2 rounded-lg text-sm flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                  Déjà voté
                </span>
              {:else if poll.status === 'PUBLISHED' && votingPollId !== poll.id}
                {#if poll.audience === 'MEMBERS_ONLY' && !$auth.token}
                  <a href="/login" class="bg-slate-100 text-slate-600 font-medium px-5 py-2 rounded-lg text-sm hover:bg-slate-200 transition">Connexion requise</a>
                {:else}
                  <button on:click={() => { votingPollId = poll.id; selectedOptionId = null; }} class="bg-brand-50 text-brand-700 font-medium px-5 py-2 rounded-lg text-sm hover:bg-brand-100 transition">Voter</button>
                {/if}
              {/if}
            </div>

            {#if votingPollId === poll.id}
              <div class="bg-slate-50 rounded-xl p-5 border border-slate-100">
                <div class="space-y-3">
                  {#each poll.options as opt}
                    <label class="flex items-center gap-3 p-4 bg-white border border-slate-200 rounded-lg cursor-pointer hover:border-brand-300 transition">
                      <input type="radio" bind:group={selectedOptionId} value={opt.id} class="w-5 h-5 text-brand-600 focus:ring-brand-500" />
                      <span class="text-slate-700 font-medium">{opt.label}</span>
                    </label>
                  {/each}
                </div>
                <div class="flex gap-3 mt-5">
                  <button on:click={() => submitVote(poll)} disabled={!selectedOptionId} class="bg-brand-600 text-white px-6 py-2.5 rounded-lg font-medium disabled:opacity-50 hover:bg-brand-500 transition">Valider le vote</button>
                  <button on:click={() => votingPollId = null} class="text-slate-500 font-medium hover:underline px-2">Annuler</button>
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
