<script lang="ts">
  import { auth } from '$lib/stores/auth';
  import { sendMessage } from '$lib/api/messages';
  export let show = false;
  export let onClose = () => {};

  let form = { subject: '', content: '', isAnonymous: false };
  let status = { loading: false, success: '', error: '' };

  function handleBackdropClick(e: MouseEvent) {
    if (e.target === e.currentTarget) {
      onClose();
    }
  }

  async function onSubmit(e: Event) {
    e.preventDefault();
    status = { loading: true, success: '', error: '' };
    try {
      await sendMessage(form, $auth.token!);
      status.success = 'Message envoyé avec succès !';
      form = { subject: '', content: '', isAnonymous: false };
      setTimeout(onClose, 2000); // Ferme la modale après 2 secondes
    } catch (err) {
      status.error = "Erreur lors de l'envoi du message.";
    } finally {
      status.loading = false;
    }
  }
</script>

{#if show}
  <div 
    class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-transparent" 
    on:click={handleBackdropClick}
    role="presentation"
  >
    <div class="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden relative border border-slate-100" on:click|stopPropagation role="dialog" aria-modal="true">
      
      <!-- Bouton Fermer -->
      <button on:click={onClose} class="absolute top-4 right-4 text-slate-400 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-full p-1.5 transition z-10">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" x2="6" y1="6" y2="18"></line><line x1="6" x2="18" y1="6" y2="18"></line></svg>
      </button>

      <div class="p-6 border-b border-slate-100">
        <h2 class="text-lg font-bold text-slate-900 flex items-center gap-2">
          <svg class="text-brand-600" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"></rect><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path></svg>
          Contacter l'administration
        </h2>
      </div>
      
      <div class="p-6">
        {#if status.success}
          <div class="bg-green-50 text-green-700 p-3 rounded-lg text-sm mb-4">{status.success}</div>
        {/if}
        {#if status.error}
          <div class="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4">{status.error}</div>
        {/if}

        <form on:submit={onSubmit} class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">Sujet</label>
            <input bind:value={form.subject} required class="w-full border border-slate-300 rounded-xl px-4 py-2.5 outline-none focus:border-brand-500" placeholder="Ex: Question sur le programme..." />
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">Message</label>
            <textarea bind:value={form.content} required rows="4" class="w-full border border-slate-300 rounded-xl px-4 py-2.5 outline-none focus:border-brand-500" placeholder="Écrivez votre message ici..."></textarea>
          </div>
          
          <!-- Case à cocher pour l'anonymat -->
          <label class="flex items-center gap-2 p-3 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50 transition">
            <input type="checkbox" bind:checked={form.isAnonymous} class="w-4 h-4 text-brand-600 rounded border-slate-300 focus:ring-brand-500" />
            <div class="flex flex-col">
              <span class="text-sm font-bold text-slate-800">Envoyer anonymement</span>
              <span class="text-xs text-slate-500">L'administration ne verra pas votre nom.</span>
            </div>
          </label>

          <button type="submit" disabled={status.loading} class="w-full bg-brand-600 hover:bg-brand-500 text-white font-bold py-3 rounded-xl transition disabled:opacity-50 mt-2">
            {status.loading ? 'Envoi en cours...' : 'Envoyer le message'}
          </button>
        </form>
      </div>
    </div>
  </div>
{/if}
