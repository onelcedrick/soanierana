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

  // Variable cruciale pour le mobile : gère l'affichage Liste OU Détail
  let showMobileDetail = false;

  onMount(async () => {
    const authState = get(auth);
    if (!authState.token) return goto('/login');
    
    try {
      messages = await getAdminMessages(authState.token);
      if (messages.length > 0) {
        // On sélectionne le premier message par défaut, mais on ne bascule pas sur le détail sur mobile
        selectedMessage = messages[0];
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
    showMobileDetail = true; // Bascule vers la vue détail sur mobile
    
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
  <div class="mb-4 md:mb-6 shrink-0">
    <h1 class="text-2xl md:text-3xl font-bold text-slate-900">Boîte de réception</h1>
    <p class="text-sm md:text-base text-slate-500 mt-1">Gérez les messages envoyés par les membres.</p>
  </div>

  {#if loading}
    <div class="flex items-center gap-2 text-slate-500">
      <svg class="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
      Chargement des messages...
    </div>
  {:else if error}
    <div class="bg-red-50 text-red-600 p-4 rounded-xl border border-red-200 flex items-start gap-2">
      <svg class="mt-0.5 shrink-0" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" x2="12" y1="8" y2="12"></line><line x1="12" x2="12.01" y1="16" y2="16"></line></svg>
      {error}
    </div>
  {:else if messages.length === 0}
    <div class="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 text-center text-slate-500 flex-1 flex flex-col items-center justify-center">
      <div class="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mb-4">
        <svg class="text-slate-300" xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"></rect><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path></svg>
      </div>
      <p class="text-lg font-bold text-slate-700">Boîte vide</p>
      <p class="text-sm mt-1">Aucun message n'a été reçu pour le moment.</p>
    </div>
  {:else}
    <!-- Conteneur principal (Liste + Détail) -->
    <div class="flex-1 flex bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden min-h-0">
      
      <!-- PANNEAU GAUCHE : LISTE DES MESSAGES -->
      <div class="w-full md:w-1/3 border-r border-slate-200 flex flex-col overflow-y-auto {showMobileDetail ? 'hidden md:flex' : 'flex'}">
        {#each messages as msg}
          <button 
            on:click={() => selectMessage(msg)}
            class="w-full text-left p-4 border-b border-slate-100 transition flex flex-col gap-1 border-l-4
              {selectedMessage?.id === msg.id ? 'bg-brand-50 border-l-brand-600' : 'hover:bg-slate-50 border-l-transparent'}"
          >
            <div class="flex justify-between items-center w-full gap-2">
              <div class="flex items-center gap-2 min-w-0">
                {#if !msg.isRead}
                  <div class="w-2.5 h-2.5 rounded-full bg-brand-500 shrink-0 shadow-sm"></div>
                {/if}
                <span class="font-bold text-sm text-slate-900 truncate">{msg.senderName}</span>
                {#if msg.isAnonymous}
                  <span class="text-[9px] font-bold bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded uppercase tracking-wide shrink-0">Anonyme</span>
                {/if}
              </div>
              <span class="text-[11px] font-medium text-slate-400 whitespace-nowrap shrink-0">{formatTime(msg.createdAt)}</span>
            </div>
            <span class="text-sm font-medium text-slate-700 truncate w-full mt-1">{msg.subject}</span>
            <span class="text-xs text-slate-500 truncate w-full">{msg.content}</span>
          </button>
        {/each}
      </div>

      <!-- PANNEAU DROIT : DÉTAIL DU MESSAGE -->
      <div class="w-full md:w-2/3 flex-col bg-slate-50 {showMobileDetail ? 'flex' : 'hidden md:flex'}">
        {#if selectedMessage}
          <!-- En-tête du message -->
          <div class="p-4 md:p-6 border-b border-slate-200 bg-white flex items-start gap-3 md:gap-0 justify-between">
            
            <div class="flex items-start gap-3 w-full">
              <!-- Bouton Retour (Mobile uniquement) -->
              <button 
                on:click={() => showMobileDetail = false} 
                class="md:hidden p-2 -ml-2 text-slate-600 hover:bg-slate-100 rounded-lg transition shrink-0 mt-0.5"
                title="Retour à la liste"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="19" x2="5" y1="12" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
              </button>

              <div class="flex-1 min-w-0">
                <h2 class="text-lg md:text-xl font-bold text-slate-900 mb-1.5 leading-tight">{selectedMessage.subject}</h2>
                <div class="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs md:text-sm text-slate-500">
                  <span class="font-medium text-slate-700 flex items-center gap-1.5">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                    {selectedMessage.senderName}
                  </span>
                  <span class="hidden md:inline">•</span>
                  <span>{new Date(selectedMessage.createdAt).toLocaleString('fr-FR')}</span>
                </div>
              </div>
            </div>

          </div>
          
          <!-- Contenu du message -->
          <div class="p-5 md:p-8 flex-1 overflow-y-auto">
            <div class="bg-white p-5 md:p-6 rounded-2xl border border-slate-200 shadow-sm text-slate-700 whitespace-pre-wrap leading-relaxed text-sm md:text-base">
              {selectedMessage.content}
            </div>
          </div>
        {:else}
          <!-- État vide sur PC (quand rien n'est sélectionné) -->
          <div class="flex-1 flex flex-col items-center justify-center text-slate-400">
            <svg class="mb-3 opacity-50" xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
            <p>Sélectionnez un message pour le lire.</p>
          </div>
        {/if}
      </div>

    </div>
  {/if}
</div>
