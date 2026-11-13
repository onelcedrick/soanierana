<script lang="ts">
  import { confirmStore } from '$lib/stores/confirm';
  import { fly, fade } from 'svelte/transition';
</script>

{#if $confirmStore.isOpen && $confirmStore.options}
  <div class="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm" transition:fade={{ duration: 200 }} on:click={() => confirmStore.handleCancel()} role="presentation">
    <div class="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden" transition:fly={{ y: 20, duration: 300 }} on:click|stopPropagation role="dialog" aria-modal="true">
      <div class="p-6 text-center">
        <div class="mx-auto flex items-center justify-center h-16 w-16 rounded-full mb-4 {$confirmStore.options.type === 'danger' ? 'bg-red-100 text-red-600' : $confirmStore.options.type === 'warning' ? 'bg-amber-100 text-amber-600' : 'bg-brand-100 text-brand-600'}">
          {#if $confirmStore.options.type === 'danger'}
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
          {:else if $confirmStore.options.type === 'warning'}
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
          {:else}
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" x2="12" y1="8" y2="12"></line><line x1="12" x2="12.01" y1="16" y2="16"></line></svg>
          {/if}
        </div>
        <h3 class="text-xl font-bold text-slate-900 mb-2">{$confirmStore.options.title}</h3>
        <p class="text-sm text-slate-500 mb-6">{$confirmStore.options.message}</p>
        
        <div class="flex gap-3 w-full">
          {#if $confirmStore.options.cancelText}
            <button on:click={() => confirmStore.handleCancel()} class="flex-1 bg-slate-100 text-slate-700 font-bold py-3 rounded-xl hover:bg-slate-200 transition">
              {$confirmStore.options.cancelText}
            </button>
          {/if}
          <button on:click={() => confirmStore.handleConfirm()} class="flex-1 text-white font-bold py-3 rounded-xl transition shadow-sm {$confirmStore.options.type === 'danger' ? 'bg-red-600 hover:bg-red-500' : $confirmStore.options.type === 'warning' ? 'bg-amber-600 hover:bg-amber-500' : 'bg-brand-600 hover:bg-brand-500'}">
            {$confirmStore.options.confirmText || 'Confirmer'}
          </button>
        </div>
      </div>
    </div>
  </div>
{/if}
