<script lang="ts">
  import { login } from '$lib/api/auth';
  import { auth } from '$lib/stores/auth';
  import { goto } from '$app/navigation';
  
  export let show = false;
  export let onClose = () => {};

  let email = '';
  let password = '';
  let error = '';
  let loading = false;
  let showPassword = false;

  async function onSubmit(e: Event) {
    e.preventDefault();
    error = '';
    loading = true;
    
    try {
      const res = await login(email, password);
      
      auth.login(res.token, {
        sub: res.user.id, 
        churchId: res.user.churchId,
        role: res.user.role, 
        memberId: res.user.memberId,
      });

      onClose();

      if (res.user.role === 'ADMIN' || res.user.role === 'RESPONSABLE') {
        goto('/dashboard');
      } else {
        goto('/');
      }
    } catch (err) {
      error = err instanceof Error ? err.message : 'Identifiants invalides';
    } finally {
      loading = false;
    }
  }
</script>

{#if show}
  <!-- Conteneur positionné en absolu sous le bouton parent -->
  <div 
    class="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-100 p-5 z-[100] text-slate-800"
    on:click|stopPropagation 
    role="dialog" 
    aria-modal="true"
  >
    <!-- Petite flèche pointant vers le bouton -->
    <div class="absolute -top-2 right-6 w-4 h-4 bg-white rotate-45 border-l border-t border-slate-100"></div>

    <div class="flex justify-between items-center mb-4">
      <h2 class="text-lg font-bold text-slate-900">Connexion</h2>
      <button on:click={onClose} class="text-slate-400 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-full p-1 transition">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" x2="6" y1="6" y2="18"></line><line x1="6" x2="18" y1="6" y2="18"></line></svg>
      </button>
    </div>

    {#if error}
      <div class="bg-red-50 text-red-600 p-2.5 rounded-lg text-xs mb-4 flex items-start gap-2 border border-red-100">
        <span>{error}</span>
      </div>
    {/if}

    <form on:submit={onSubmit} class="space-y-3">
      <div>
        <label class="block text-xs font-medium text-slate-700 mb-1">Email</label>
        <input type="email" bind:value={email} required placeholder="vous@exemple.com" class="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:border-brand-500 focus:ring-2 focus:ring-brand-200 transition outline-none" />
      </div>

      <div>
        <label class="block text-xs font-medium text-slate-700 mb-1">Mot de passe</label>
        <div class="relative">
          <input type={showPassword ? 'text' : 'password'} bind:value={password} required placeholder="••••••••" class="w-full pl-3 pr-10 py-2 text-sm rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:border-brand-500 focus:ring-2 focus:ring-brand-200 transition outline-none" />
          <button type="button" on:click={() => showPassword = !showPassword} class="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-brand-600 transition">
            {#if showPassword}
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" x2="22" y1="2" y2="22"/></svg>
            {:else}
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
            {/if}
          </button>
        </div>
      </div>

      <button type="submit" disabled={loading} class="w-full bg-brand-600 hover:bg-brand-500 text-white font-medium py-2.5 rounded-lg transition shadow-md disabled:opacity-70 mt-1 text-sm">
        {loading ? 'Connexion...' : 'Se connecter'}
      </button>
    </form>
  </div>
{/if}
