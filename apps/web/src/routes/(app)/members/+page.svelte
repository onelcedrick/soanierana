<script lang="ts">
  import { auth } from '$lib/stores/auth';
  import { listMembers, createMember, createMemberAccount, exportMembers, type AdminMember } from '$lib/api/members';
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';

  let members: AdminMember[] = [];
  let loading = true;
  let form = {
    firstName: '', lastName: '', email: '', phone: '',
    membershipStatus: 'LOCAL_BAPTIZED', responsibilityLevel: 'MAMBRA_TSOTRA',
  };
  let message = '';
  let error = '';

  let selectedMemberId: string | null = null;
  let selectedMemberName = '';
  let newPassword = '';
  let creatingAccount = false;

  onMount(async () => {
    if (!$auth.token) return goto('/login');
    await load();
  });

  async function load() {
    loading = true;
    try {
      members = await listMembers($auth.user!.churchId, $auth.token!);
    } catch (err) { error = 'Erreur chargement des membres'; }
    finally { loading = false; }
  }

  async function onSubmitMember(e: Event) {
    e.preventDefault();
    message = ''; error = '';
    try {
      await createMember({ ...form, churchId: $auth.user!.churchId }, $auth.token!);
      message = 'Membre créé avec succès !';
      form = { ...form, firstName: '', lastName: '', email: '', phone: '' };
      await load();
    } catch (err) { error = err instanceof Error ? err.message : 'Erreur lors de la création'; }
  }

  function openPasswordModal(member: AdminMember) {
    selectedMemberId = member.id;
    selectedMemberName = member.firstName + ' ' + member.lastName;
    newPassword = '';
  }

  async function onCreateAccount() {
    if (!selectedMemberId || !newPassword) return;
    creatingAccount = true;
    try {
      await createMemberAccount(selectedMemberId, newPassword, $auth.token!);
      message = 'Compte créé pour ' + selectedMemberName;
      selectedMemberId = null;
    } catch (err) { 
      error = err instanceof Error ? err.message : 'Erreur'; 
    } finally {
      creatingAccount = false;
    }
  }

  async function onExport() {
    try {
      const blob = await exportMembers($auth.user!.churchId, $auth.token!);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = 'membres.csv'; a.click();
    } catch (err) { error = 'Erreur lors de l\'export'; }
  }

  // Fonctions utilitaires pour l'affichage propre des statuts
  function formatStatus(status: string) {
    if (status === 'LOCAL_BAPTIZED') return 'Baptisé local';
    if (status === 'EXTERNAL_BAPTIZED') return 'Baptisé externe';
    return 'Non baptisé';
  }
  function formatRole(role: string) {
    if (role === 'MAMBRA_TSOTRA') return 'Membre';
    if (role === 'DIAKONA') return 'Diacre';
    if (role === 'LOHOLONA') return 'Responsable';
    return role;
  }
</script>

<!-- En-tête -->
<div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 md:mb-8">
  <div class="flex items-center gap-3">
    <div class="bg-brand-50 p-2.5 rounded-xl text-brand-600">
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
    </div>
    <h1 class="text-2xl md:text-3xl font-bold text-slate-900">Membres</h1>
  </div>
  
  <button on:click={onExport} class="w-full sm:w-auto bg-white text-slate-700 border border-slate-300 px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-slate-50 transition shadow-sm flex items-center justify-center gap-2">
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" x2="12" y1="15" y2="3"></line></svg>
    Télécharger (CSV)
  </button>
</div>

{#if message}
  <div class="text-green-700 text-sm mb-4 p-3 bg-green-50 rounded-lg border border-green-100 flex items-start gap-2">
    <svg class="mt-0.5 shrink-0" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
    {message}
  </div>
{/if}
{#if error}
  <div class="text-red-600 text-sm mb-4 p-3 bg-red-50 rounded-lg border border-red-100 flex items-start gap-2">
    <svg class="mt-0.5 shrink-0" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" x2="12" y1="8" y2="12"></line><line x1="12" x2="12.01" y1="16" y2="16"></line></svg>
    {error}
  </div>
{/if}

<!-- Formulaire -->
<form on:submit={onSubmitMember} class="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-slate-100 grid gap-4 md:gap-5 mb-8">
  <h2 class="font-bold text-lg text-slate-800 border-b border-slate-100 pb-2 flex items-center gap-2">
    <svg class="text-brand-500" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><line x1="19" x2="19" y1="8" y2="14"></line><line x1="22" x2="16" y1="11" y2="11"></line></svg>
    Ajouter un membre
  </h2>
  
  <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-5">
    <div>
      <label class="block text-sm font-medium text-slate-700 mb-1.5">Prénom</label>
      <input bind:value={form.firstName} placeholder="Ex: Jean" required class="w-full border border-slate-300 rounded-xl px-4 py-2.5 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 text-sm md:text-base transition" />
    </div>
    <div>
      <label class="block text-sm font-medium text-slate-700 mb-1.5">Nom</label>
      <input bind:value={form.lastName} placeholder="Ex: Rakoto" required class="w-full border border-slate-300 rounded-xl px-4 py-2.5 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 text-sm md:text-base transition" />
    </div>
    <div>
      <label class="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
      <input type="email" bind:value={form.email} placeholder="Ex: jean@gmail.com" required class="w-full border border-slate-300 rounded-xl px-4 py-2.5 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 text-sm md:text-base transition" />
    </div>
    <div>
      <label class="block text-sm font-medium text-slate-700 mb-1.5">Téléphone</label>
      <input bind:value={form.phone} placeholder="Ex: +261 34 00 000 00" required class="w-full border border-slate-300 rounded-xl px-4 py-2.5 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 text-sm md:text-base transition" />
    </div>
  </div>

  <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-5">
    <div>
      <label class="block text-sm font-medium text-slate-700 mb-1.5">Statut spirituel</label>
      <select bind:value={form.membershipStatus} class="w-full border border-slate-300 rounded-xl px-4 py-2.5 outline-none focus:border-brand-500 bg-slate-50 text-sm md:text-base cursor-pointer">
        <option value="LOCAL_BAPTIZED">Baptisé local</option>
        <option value="EXTERNAL_BAPTIZED">Baptisé externe</option>
        <option value="UNBAPTIZED">Non baptisé</option>
      </select>
    </div>
    <div>
      <label class="block text-sm font-medium text-slate-700 mb-1.5">Responsabilité</label>
      <select bind:value={form.responsibilityLevel} class="w-full border border-slate-300 rounded-xl px-4 py-2.5 outline-none focus:border-brand-500 bg-slate-50 text-sm md:text-base cursor-pointer">
        <option value="MAMBRA_TSOTRA">Membre</option>
        <option value="DIAKONA">Diacre</option>
        <option value="LOHOLONA">Responsable</option>
      </select>
    </div>
  </div>

  <button type="submit" class="w-full sm:w-auto bg-slate-900 text-white rounded-xl py-3 px-8 font-bold hover:bg-slate-800 transition text-sm md:text-base shadow-sm flex items-center justify-center gap-2 mt-2">
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"></path><path d="M12 5v14"></path></svg>
    Ajouter le membre
  </button>
</form>

<!-- Liste des membres -->
<div class="flex items-center gap-2 mb-4">
  <h2 class="text-xl font-bold text-slate-900">Liste des membres</h2>
  <span class="bg-slate-200 text-slate-700 text-xs font-bold px-2.5 py-0.5 rounded-full">{members.length}</span>
</div>

{#if loading}
  <div class="flex items-center gap-2 text-slate-500">
    <svg class="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
    Chargement...
  </div>
{:else if members.length === 0}
  <div class="bg-white p-8 rounded-2xl border border-slate-200 text-center">
    <p class="text-slate-500 font-medium">Aucun membre enregistré.</p>
  </div>
{:else}
  
  <!-- VUE ORDINATEUR (Tableau) -->
  <div class="hidden md:block bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
    <table class="w-full text-left text-sm whitespace-nowrap">
      <thead class="bg-slate-50 border-b border-slate-200 text-slate-600 text-xs uppercase tracking-wider">
        <tr>
          <th class="px-6 py-4 font-bold">Nom complet</th>
          <th class="px-6 py-4 font-bold">Email</th>
          <th class="px-6 py-4 font-bold">Statut</th>
          <th class="px-6 py-4 font-bold">Responsabilité</th>
          <th class="px-6 py-4 font-bold text-right">Actions</th>
        </tr>
      </thead>
      <tbody class="divide-y divide-slate-100">
        {#each members as member}
          <tr class="hover:bg-slate-50/50 transition">
            <td class="px-6 py-4 font-bold text-slate-900">{member.firstName} {member.lastName}</td>
            <td class="px-6 py-4 text-slate-500">{member.email}</td>
            <td class="px-6 py-4">
              <span class="text-xs px-2.5 py-1 rounded-md font-medium bg-slate-100 text-slate-700">{formatStatus(member.membershipStatus)}</span>
            </td>
            <td class="px-6 py-4">
              <span class="text-xs px-2.5 py-1 rounded-md font-medium bg-blue-50 text-blue-700 border border-blue-100">{formatRole(member.responsibilityLevel)}</span>
            </td>
            <td class="px-6 py-4 text-right">
              <button on:click={() => openPasswordModal(member)} class="text-brand-600 hover:text-brand-800 bg-brand-50 hover:bg-brand-100 px-3 py-1.5 rounded-lg text-xs font-bold transition inline-flex items-center gap-1.5">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                Créer compte
              </button>
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>

  <!-- VUE MOBILE (Cartes empilées) -->
  <div class="grid grid-cols-1 gap-4 md:hidden">
    {#each members as member}
      <div class="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-3">
        <div class="flex justify-between items-start">
          <div>
            <h3 class="font-bold text-slate-900 text-base">{member.firstName} {member.lastName}</h3>
            <p class="text-sm text-slate-500 mt-0.5">{member.email}</p>
          </div>
          <span class="text-[10px] px-2 py-1 rounded-md font-bold bg-blue-50 text-blue-700 border border-blue-100 whitespace-nowrap">
            {formatRole(member.responsibilityLevel)}
          </span>
        </div>
        
        <div class="flex items-center gap-2">
          <span class="text-xs px-2 py-1 rounded-md font-medium bg-slate-100 text-slate-700">{formatStatus(member.membershipStatus)}</span>
          <span class="text-xs text-slate-400 flex items-center gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
            {member.phone || 'Non renseigné'}
          </span>
        </div>

        <div class="border-t border-slate-100 pt-3 mt-1">
          <button on:click={() => openPasswordModal(member)} class="w-full bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100 rounded-xl py-2 font-bold text-sm transition flex items-center justify-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
            Créer son compte
          </button>
        </div>
      </div>
    {/each}
  </div>

{/if}

<!-- MODALE MOT DE PASSE -->
{#if selectedMemberId}
  <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm" on:click={() => selectedMemberId = null} role="presentation">
    <div class="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden" on:click|stopPropagation role="dialog" aria-modal="true">
      
      <div class="p-4 md:p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
        <h3 class="text-lg font-bold text-slate-900">Créer un compte</h3>
        <button on:click={() => selectedMemberId = null} class="text-slate-400 hover:text-slate-800 bg-white shadow-sm border border-slate-200 hover:bg-slate-100 rounded-full p-1.5 transition">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" x2="6" y1="6" y2="18"></line><line x1="6" x2="18" y1="6" y2="18"></line></svg>
        </button>
      </div>

      <div class="p-6">
        <p class="text-sm text-slate-600 mb-4">Définir un mot de passe pour : <strong>{selectedMemberName}</strong></p>
        
        <label class="block text-sm font-medium text-slate-700 mb-1.5">Mot de passe</label>
        <input type="password" bind:value={newPassword} placeholder="Min. 8 caractères" class="w-full border border-slate-300 px-4 py-3 rounded-xl outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 text-sm md:text-base transition" />
        
        <p class="text-xs text-slate-500 mt-2">Le membre pourra utiliser ce mot de passe avec son adresse email pour se connecter.</p>
      </div>

      <div class="p-4 bg-slate-50 border-t border-slate-100 flex flex-col-reverse sm:flex-row justify-end gap-3">
        <button on:click={() => selectedMemberId = null} class="w-full sm:w-auto text-slate-600 font-bold px-5 py-2.5 rounded-xl hover:bg-slate-200 transition">
          Annuler
        </button>
        <button on:click={onCreateAccount} disabled={!newPassword || newPassword.length < 8 || creatingAccount} class="w-full sm:w-auto bg-brand-600 text-white font-bold px-5 py-2.5 rounded-xl hover:bg-brand-500 transition disabled:opacity-50 shadow-sm flex justify-center items-center gap-2">
          {#if creatingAccount}
            <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
            Création...
          {:else}
            Créer le compte
          {/if}
        </button>
      </div>

    </div>
  </div>
{/if}
