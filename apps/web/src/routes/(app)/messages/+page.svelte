<script lang="ts">
  import { auth } from '$lib/stores/auth';
  import { getAdminMessages, markMessageRead, type AdminMessage } from '$lib/api/messages';
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';
  import { get } from 'svelte/store';

  let messages: AdminMessage[] = [];
  let selectedMessage: AdminMessage | null = null;
  let loading = true;
  let error = '';

  onMount(async () => {
    const authState = get(auth);
    if (!authState.token) return goto('/login');
    
    try {
      messages = await getAdminMessages(authState.token);
      if (messages.length > 0) {
        selectMessage(messages[0]);
      }
    } catch (err: any) {
      console.error('ERREUR API MESSAGES :', err);
      error = 'Erreur lors du chargement des messages. Vérifiez la console.';
    } finally {
      loading = false;
    }
  });

  async function selectMessage(msg: AdminMessage) {
    selectedMessage = msg;
    if (!msg.isRead) {
      const authState = get(auth);
      try {
        await markMessageRead(msg.id, authState.token!);
        msg.isRead = true;
        messages = [...messages]; 
      } catch (err) {
        console.error('Erreur mark read', err);
      }
    }
  }

  function formatTime(dateStr: string) {
    const d = new Date(dateStr);
    return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }) + ' ' + 
           d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  }
</script>

<div class="h-[calc(100vh-140px)] flex flex-col">
  <div class="mb-6">
    <h1 class="text-2xl font-bold text-slate-900">Boîte de réception</h1>
    <p class="text-slate-500 mt-1">Gérez les messages envoyés par les membres.</p>
  </div>

  {#if loading}
    <p class="text-slate-500">Chargement...</p>
  {:else if error}
    <div class="bg-red-50 text-red-600 p-4 rounded-xl border border-red-200">{error}</div>
  {:else if messages.length === 0}
    <div class="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 text-center text-slate-500 flex-1 flex flex-col items-center justify-center">
      <svg class="mb-4 text-slate-300" xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"></rect><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path></svg>
      <p class="text-lg font-medium text-slate-700">Aucun message reçu</p>
      <p class="text-sm mt-1">Les messages envoyés par les membres apparaîtront ici.</p>
    </div>
  {:else}
    <div class="flex-1 flex bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <!-- Liste -->
      <div class="w-full md:w-1/3 border-r border-slate-200 flex flex-col overflow-y-auto">
        {#each messages as msg}
          <button 
            on:click={() => selectMessage(msg)}
            class="w-full text-left p-4 border-b border-slate-100 transition flex flex-col gap-1
              {selectedMessage?.id === msg.id ? 'bg-blue-50 border-l-4 border-l-brand-600' : 'hover:bg-slate-50 border-l-4 border-l-transparent'}"
          >
            <div class="flex justify-between items-center w-full">
              <div class="flex items-center gap-2">
                {#if !msg.isRead}<div class="w-2.5 h-2.5 rounded-full bg-blue-500"></div>{/if}
                <span class="font-bold text-sm text-slate-900 truncate">{msg.senderName}</span>
                {#if msg.isAnonymous}
                  <span class="text-[9px] font-bold bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded uppercase tracking-wide">Anonyme</span>
                {/if}
              </div>
              <span class="text-[11px] font-medium text-slate-400">{formatTime(msg.createdAt)}</span>
            </div>
            <span class="text-sm font-medium text-slate-700 truncate w-full">{msg.subject}</span>
            <span class="text-xs text-slate-500 truncate w-full">{msg.content}</span>
          </button>
        {/each}
      </div>

      <!-- Détail -->
      <div class="hidden md:flex md:w-2/3 flex-col bg-slate-50">
        {#if selectedMessage}
          <div class="p-6 border-b border-slate-200 bg-white flex justify-between items-start">
            <div>
              <h2 class="text-xl font-bold text-slate-900 mb-2">{selectedMessage.subject}</h2>
              <div class="flex items-center gap-3 text-sm text-slate-500">
                <span class="font-medium text-slate-700 flex items-center gap-1.5">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                  {selectedMessage.senderName}
                </span>
                <span>•</span>
                <span>{new Date(selectedMessage.createdAt).toLocaleString('fr-FR')}</span>
              </div>
            </div>
          </div>
          <div class="p-6 flex-1 overflow-y-auto">
            <p class="text-slate-700 whitespace-pre-wrap leading-relaxed">{selectedMessage.content}</p>
          </div>
        {:else}
          <div class="flex-1 flex items-center justify-center text-slate-400">
            Sélectionnez un message pour le lire.
          </div>
        {/if}
      </div>
    </div>
  {/if}
</div>
