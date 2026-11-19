<script lang="ts">
  import { auth } from '$lib/stores/auth';
  import { listMembers, createMember, createMemberAccount, updateMember, deleteMember, exportMembers, type AdminMember } from '$lib/api/members';
  import { uploadToCloudinary } from '$lib/utils/upload';
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';
  import { confirmStore } from '$lib/stores/confirm';

  let members: AdminMember[] = [];
  let loading = true;
  let form = {
    firstName: '', lastName: '', email: '', phone: '', photoUrl: '',
    membershipStatus: 'LOCAL_BAPTIZED', responsibilityLevel: 'MAMBRA_TSOTRA',
  };
  let message = '';
  let error = '';

  // Gestion de la création de compte
  let selectedMemberId: string | null = null;
  let selectedMemberName = '';
  let newPassword = '';
  let creatingAccount = false;

  // Gestion de la modification
  let editingMemberId: string | null = null;
  let editForm = { firstName: '', lastName: '', email: '', phone: '', photoUrl: '', membershipStatus: '', responsibilityLevel: '' };

  // 🔐 Vérification Super Admin (rendue plus robuste)
  $: canManageMembers = ['ADMIN', 'RESPONSABLE', 'LOHOLONA'].includes($auth.user?.role);
  
  // DEBUG : Affiche le contenu de l'utilisateur dans la console (F12)
  

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

  // --- UPLOAD PHOTO ---
  async function handlePhotoUpload(e: Event, target: 'form' | 'edit') {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (!file) return;
    try {
      const url = await uploadToCloudinary(file, 'member_photos');
      if (target === 'form') form.photoUrl = url;
      else editForm.photoUrl = url;
    } catch (err) {
      error = "Erreur lors de l'upload de la photo.";
    }
  }

  // --- CRÉATION ---
  async function onSubmitMember(e: Event) {
    e.preventDefault();
    message = ''; error = '';
    try {
      await createMember({ ...form, churchId: $auth.user!.churchId }, $auth.token!);
      message = 'Membre créé avec succès !';
      form = { ...form, firstName: '', lastName: '', email: '', phone: '', photoUrl: '' };
      await load();
    } catch (err) { error = err instanceof Error ? err.message : 'Erreur lors de la création'; }
  }

  // --- MODIFICATION ---
  function startEdit(member: AdminMember) {
    editingMemberId = member.id;
    editForm = { 
      firstName: member.firstName, 
      lastName: member.lastName, 
      email: member.email, 
      phone: member.phone,
      photoUrl: member.photoUrl || '',
      membershipStatus: member.membershipStatus,
      responsibilityLevel: member.responsibilityLevel
    };
  }

  async function onSaveEdit(e: Event) {
    e.preventDefault();
    if (!editingMemberId) return;
    try {
      await updateMember(editingMemberId, editForm, $auth.token!);
      message = 'Membre modifié avec succès.';
      editingMemberId = null;
      await load();
    } catch (err) { error = 'Erreur lors de la modification.'; }
  }

  // --- SUPPRESSION ---
  async function onDelete(member: AdminMember) {
    const confirmed = await confirmStore.confirm({
      title: 'Supprimer ce membre ?',
      message: `Voulez-vous vraiment supprimer ${member.firstName} ${member.lastName} ?`,
      type: 'danger',
      confirmText: 'Supprimer'
    });
    if (!confirmed) return;
    
    try {
      await deleteMember(member.id, $auth.token!);
      message = 'Membre supprimé.';
      await load();
    } catch (err) { error = 'Erreur lors de la suppression.'; }
  }

  // --- COMPTE ---
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
    } catch (err) { error = err instanceof Error ? err.message : 'Erreur'; }
    finally { creatingAccount = false; }
  }

  // --- EXPORT ---
  async function onExport() {
    try {
      const blob = await exportMembers($auth.user!.churchId, $auth.token!);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = 'membres.csv'; a.click();
    } catch (err) { error = 'Erreur lors de l\'export'; }
  }

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
  <div class="bg-green-50 text-green-700 p-4 rounded-xl border border-green-200 mb-6 flex items-start gap-2 shadow-sm">
    <svg class="mt-0.5 shrink-0" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
    {message}
  </div>
{/if}
{#if error}
  <div class="bg-red-50 text-red-600 p-4 rounded-xl border border-red-200 mb-6 flex items-start gap-2 shadow-sm">
    <svg class="mt-0.5 shrink-0" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" x2="12" y1="8" y2="12"></line><line x1="12" x2="12.01" y1="16" y2="16"></line></svg>
    {error}
  </div>
{/if}

<form on:submit={onSubmitMember} class="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-slate-100 grid gap-4 md:gap-5 mb-8">
  <h2 class="font-bold text-lg text-slate-800 border-b border-slate-100 pb-2">Ajouter un membre</h2>
  
  <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-5">
    <div><label for="m-first" class="block text-sm font-medium mb-1.5">Prénom</label><input id="m-first" bind:value={form.firstName} placeholder="Ex: Jean" required class="w-full border border-slate-300 rounded-xl px-4 py-2.5 outline-none focus:border-brand-500" /></div>
    <div><label for="m-last" class="block text-sm font-medium mb-1.5">Nom</label><input id="m-last" bind:value={form.lastName} placeholder="Ex: Rakoto" required class="w-full border border-slate-300 rounded-xl px-4 py-2.5 outline-none focus:border-brand-500" /></div>
    <div><label for="m-email" class="block text-sm font-medium mb-1.5">Email</label><input id="m-email" type="email" bind:value={form.email} placeholder="Ex: jean@gmail.com" required class="w-full border border-slate-300 rounded-xl px-4 py-2.5 outline-none focus:border-brand-500" /></div>
    <div><label for="m-phone" class="block text-sm font-medium mb-1.5">Téléphone</label><input id="m-phone" bind:value={form.phone} placeholder="Ex: +261 34 00 000 00" required class="w-full border border-slate-300 rounded-xl px-4 py-2.5 outline-none focus:border-brand-500" /></div>
  </div>

  <!-- Photo pour le formulaire d'ajout -->
  <div>
    <label class="block text-sm font-medium mb-1.5">Photo de profil (Optionnel)</label>
    <input type="file" accept="image/*" on:change={(e) => handlePhotoUpload(e, 'form')} class="w-full text-sm file:mr-3 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:bg-brand-50 file:text-brand-700" />
    {#if form.photoUrl}
      <img src={form.photoUrl} alt="Preview" class="mt-2 w-16 h-16 object-cover rounded-full border" />
    {/if}
  </div>

  <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-5">
    <div>
      <label for="m-status" class="block text-sm font-medium mb-1.5">Statut spirituel</label>
      <select id="m-status" bind:value={form.membershipStatus} class="w-full border border-slate-300 rounded-xl px-4 py-2.5 bg-slate-50"><option value="LOCAL_BAPTIZED">Baptisé local</option><option value="EXTERNAL_BAPTIZED">Baptisé externe</option><option value="UNBAPTIZED">Non baptisé</option></select>
    </div>
    <div>
      <label for="m-role" class="block text-sm font-medium mb-1.5">Responsabilité</label>
      <select id="m-role" bind:value={form.responsibilityLevel} class="w-full border border-slate-300 rounded-xl px-4 py-2.5 bg-slate-50"><option value="MAMBRA_TSOTRA">Membre</option><option value="DIAKONA">Diacre</option><option value="LOHOLONA">Responsable</option></select>
    </div>
  </div>

  <button type="submit" class="w-full sm:w-auto bg-slate-900 text-white rounded-xl py-3 px-8 font-bold hover:bg-slate-800 transition mt-2">Ajouter le membre</button>
</form>

<div class="flex items-center gap-2 mb-4">
  <h2 class="text-xl font-bold text-slate-900">Liste des membres</h2>
  <span class="bg-slate-200 text-slate-700 text-xs font-bold px-2.5 py-0.5 rounded-full">{members.length}</span>
</div>

{#if loading}
  <p class="text-slate-500">Chargement...</p>
{:else if members.length === 0}
  <div class="bg-white p-8 rounded-2xl border border-slate-200 text-center"><p class="text-slate-500 font-medium">Aucun membre enregistré.</p></div>
{:else}
  <div class="grid grid-cols-1 gap-4">
    {#each members as member}
      <div class="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:shadow-md transition">
        
        <div class="flex items-center gap-4 flex-1">
          <!-- Affichage de la photo -->
          {#if member.photoUrl}
            <img src={member.photoUrl} alt={member.firstName} class="w-14 h-14 rounded-full object-cover border-2 border-slate-100 shrink-0" />
          {:else}
            <div class="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-lg shrink-0">
              {member.firstName[0]}{member.lastName[0]}
            </div>
          {/if}
          
          <div>
            <div class="flex items-center gap-2 mb-1">
              <h3 class="font-bold text-slate-900 text-lg">{member.firstName} {member.lastName}</h3>
              <span class="text-[10px] px-2 py-0.5 rounded-md font-bold bg-blue-50 text-blue-700 border border-blue-100">{formatRole(member.responsibilityLevel)}</span>
            </div>
            <p class="text-sm text-slate-500">{member.email}</p>
            <div class="flex items-center gap-3 mt-2 text-xs text-slate-500">
              <span class="bg-slate-100 px-2 py-1 rounded-md">{formatStatus(member.membershipStatus)}</span>
              <span class="flex items-center gap-1"><svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>{member.phone || 'Non renseigné'}</span>
            </div>
          </div>
        </div>

        <div class="flex flex-wrap gap-2 w-full sm:w-auto mt-2 sm:mt-0 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100">
          <button on:click={() => openPasswordModal(member)} class="flex-1 sm:flex-none bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100 rounded-xl py-2 px-4 font-bold text-xs transition flex items-center justify-center gap-1.5">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
            Créer compte
          </button>

          <!-- Boutons SUPER ADMIN -->
          {#if canManageMembers}
            <button on:click={() => startEdit(member)} class="flex-1 sm:flex-none bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-xl py-2 px-4 font-bold text-xs transition border border-blue-100">Modifier</button>
            <button on:click={() => onDelete(member)} class="flex-1 sm:flex-none bg-red-50 text-red-600 hover:bg-red-100 rounded-xl py-2 px-4 font-bold text-xs transition border border-red-100">Supprimer</button>
          {/if}
        </div>
      </div>
    {/each}
  </div>
{/if}

<!-- MODAL MODIFICATION -->
{#if editingMemberId}
  <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm" on:click={() => editingMemberId = null}>
    <div class="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden" on:click|stopPropagation>
      <div class="p-4 border-b bg-slate-50 flex justify-between items-center">
        <h3 class="font-bold text-lg">Modifier le membre</h3>
        <button on:click={() => editingMemberId = null} class="text-slate-400 hover:text-slate-800">✕</button>
      </div>
      <form on:submit={onSaveEdit} class="p-6 space-y-4">
        <div class="grid grid-cols-2 gap-4">
          <div><label class="block text-sm mb-1">Prénom</label><input bind:value={editForm.firstName} required class="w-full border px-3 py-2 rounded-lg" /></div>
          <div><label class="block text-sm mb-1">Nom</label><input bind:value={editForm.lastName} required class="w-full border px-3 py-2 rounded-lg" /></div>
        </div>
        <div><label class="block text-sm mb-1">Email</label><input type="email" bind:value={editForm.email} required class="w-full border px-3 py-2 rounded-lg" /></div>
        <div><label class="block text-sm mb-1">Téléphone</label><input bind:value={editForm.phone} class="w-full border px-3 py-2 rounded-lg" /></div>
        
        <!-- Photo pour la modification -->
        <div>
          <label class="block text-sm mb-1">Photo de profil</label>
          <input type="file" accept="image/*" on:change={(e) => handlePhotoUpload(e, 'edit')} class="w-full text-sm file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:bg-blue-50 file:text-blue-700" />
          {#if editForm.photoUrl}
            <img src={editForm.photoUrl} alt="Preview" class="mt-2 w-16 h-16 object-cover rounded-full border" />
          {/if}
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm mb-1">Statut</label>
            <select bind:value={editForm.membershipStatus} class="w-full border px-3 py-2 rounded-lg bg-slate-50"><option value="LOCAL_BAPTIZED">Baptisé local</option><option value="EXTERNAL_BAPTIZED">Baptisé externe</option><option value="UNBAPTIZED">Non baptisé</option></select>
          </div>
          <div>
            <label class="block text-sm mb-1">Rôle</label>
            <select bind:value={editForm.responsibilityLevel} class="w-full border px-3 py-2 rounded-lg bg-slate-50"><option value="MAMBRA_TSOTRA">Membre</option><option value="DIAKONA">Diacre</option><option value="LOHOLONA">Responsable</option></select>
          </div>
        </div>
        <div class="flex gap-3 pt-4">
          <button type="button" on:click={() => editingMemberId = null} class="flex-1 bg-slate-100 font-bold py-3 rounded-xl hover:bg-slate-200">Annuler</button>
          <button type="submit" class="flex-1 bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-500">Enregistrer</button>
        </div>
      </form>
    </div>
  </div>
{/if}

<!-- MODAL MOT DE PASSE -->
{#if selectedMemberId}
  <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm" on:click={() => selectedMemberId = null}>
    <div class="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden" on:click|stopPropagation>
      <div class="p-4 border-b bg-slate-50 flex justify-between items-center">
        <h3 class="font-bold text-lg">Créer un compte</h3>
        <button on:click={() => selectedMemberId = null} class="text-slate-400 hover:text-slate-800">✕</button>
      </div>
      <div class="p-6">
        <p class="text-sm text-slate-600 mb-4">Définir un mot de passe pour : <strong>{selectedMemberName}</strong></p>
        <input type="password" bind:value={newPassword} placeholder="Min. 8 caractères" class="w-full border px-4 py-3 rounded-xl mb-4" />
        <div class="flex gap-3">
          <button on:click={() => selectedMemberId = null} class="flex-1 bg-slate-100 font-bold py-3 rounded-xl">Annuler</button>
          <button on:click={onCreateAccount} disabled={!newPassword || newPassword.length < 8 || creatingAccount} class="flex-1 bg-brand-600 text-white font-bold py-3 rounded-xl disabled:opacity-50">{creatingAccount ? 'Création...' : 'Créer'}</button>
        </div>
      </div>
    </div>
  </div>
{/if}
