<script lang="ts">
  import { auth } from '$lib/stores/auth';
  import { onMount } from 'svelte';
  import { listPublicPublications } from '$lib/api/publications';
  import { sendMessage } from '$lib/api/messages';
  import { get } from 'svelte/store';
  import type { Publication } from '$lib/api/types';

  let publications: Publication[] = [];
  let loading = true;
  
  let msgForm = { subject: '', content: '' };
  let msgStatus = { loading: false, success: '', error: '' };

  onMount(async () => {
    try {
      const authState = get(auth);
      if (!authState.user) return;
      publications = await listPublicPublications(authState.user.churchId);
    } catch (err) {}
    finally { loading = false; }
  });

  async function onSendMessage(e: Event) {
    e.preventDefault();
    msgStatus = { loading: true, success: '', error: '' };
    try {
      const authState = get(auth);
      await sendMessage(msgForm, authState.token!);
      msgStatus.success = 'Votre message a bien été envoyé à l\'administration.';
      msgForm = { subject: '', content: '' };
    } catch (err) {
      msgStatus.error = 'Erreur lors de l\'envoi du message.';
    } finally {
      msgStatus.loading = false;
    }
  }
</script>

<div class="space-y-8">
  <div class="bg-gradient-to-r from-slate-900 to-brand-900 rounded-2xl p-8 text-white shadow-md">
    <h1 class="text-3xl font-bold mb-2">Bienvenue dans votre espace</h1>
    <p class="text-brand-100 max-w-2xl">Retrouvez les dernières nouvelles de l'église et contactez directement l'administration si vous avez une question.</p>
  </div>

  <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
    <div class="lg:col-span-2 space-y-6">
      <h2 class="text-xl font-bold text-slate-800 flex items-center gap-2">
        <svg class="text-brand-600" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 11 18-5v12L3 14v-3z"></path><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"></path></svg>
        Dernières actualités
      </h2>
      
      {#if loading}
        <p class="text-slate-500">Chargement...</p>
      {:else if publications.length === 0}
        <p class="text-slate-500 bg-white p-6 rounded-xl border border-slate-200">Aucune actualité pour le moment.</p>
      {:else}
        <div class="grid gap-4">
          {#each publications as pub}
            <article class="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              {#if pub.coverImageUrl}
                <img src={pub.coverImageUrl} alt={pub.title} class="w-full h-48 object-cover" />
              {/if}
              <div class="p-6">
                <h3 class="text-lg font-bold text-slate-900 mb-2">{pub.title}</h3>
                <p class="text-slate-600 line-clamp-3">{pub.content}</p>
                <p class="text-xs text-slate-400 mt-4">{new Date(pub.publishedAt || Date.now()).toLocaleDateString('fr-FR')}</p>
              </div>
            </article>
          {/each}
        </div>
      {/if}
    </div>

    <div class="space-y-6">
      <div id="messages" class="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <h2 class="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
          <svg class="text-brand-600" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"></rect><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path></svg>
          Contacter l'administration
        </h2>
        
        {#if msgStatus.success}
          <div class="bg-green-50 text-green-700 p-3 rounded-lg text-sm mb-4">{msgStatus.success}</div>
        {/if}
        {#if msgStatus.error}
          <div class="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4">{msgStatus.error}</div>
        {/if}

        <form on:submit={onSendMessage} class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">Sujet</label>
            <input bind:value={msgForm.subject} required class="w-full border border-slate-300 rounded-xl px-4 py-2.5 outline-none focus:border-brand-500" placeholder="Ex: Question sur le programme..." />
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">Message</label>
            <textarea bind:value={msgForm.content} required rows="4" class="w-full border border-slate-300 rounded-xl px-4 py-2.5 outline-none focus:border-brand-500" placeholder="Écrivez votre message ici..."></textarea>
          </div>
          <button type="submit" disabled={msgStatus.loading} class="w-full bg-brand-600 hover:bg-brand-500 text-white font-medium py-2.5 rounded-xl transition disabled:opacity-50">
            {msgStatus.loading ? 'Envoi...' : 'Envoyer le message'}
          </button>
        </form>
      </div>

      <div class="bg-slate-900 rounded-2xl p-6 text-white text-center">
        <p class="text-sm italic mb-2">« Tout ce que vous voulez que les hommes fassent pour vous, faites-le de même pour eux. »</p>
        <p class="text-xs text-slate-400">Matthieu 7:12</p>
      </div>
    </div>
  </div>
</div>
