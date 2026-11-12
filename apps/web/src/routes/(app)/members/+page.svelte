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

  onMount(async () => {
    if (!$auth.token) return goto('/login');
    await load();
  });

  async function load() {
    loading = true;
    try {
      members = await listMembers($auth.user!.churchId, $auth.token!);
    } catch (err) { error = 'Erreur chargement'; }
    finally { loading = false; }
  }

  async function onSubmitMember(e: Event) {
    e.preventDefault();
    message = ''; error = '';
    try {
      // ON PASSE LE TOKEN ICI
      await createMember({ ...form, churchId: $auth.user!.churchId }, $auth.token!);
      message = 'Membre cree avec succes !';
      form = { ...form, firstName: '', lastName: '', email: '', phone: '' };
      await load();
    } catch (err) { error = err instanceof Error ? err.message : 'Erreur'; }
  }

  function openPasswordModal(member: AdminMember) {
    selectedMemberId = member.id;
    selectedMemberName = member.firstName + ' ' + member.lastName;
    newPassword = '';
  }

  async function onCreateAccount() {
    if (!selectedMemberId || !newPassword) return;
    try {
      await createMemberAccount(selectedMemberId, newPassword, $auth.token!);
      message = 'Compte cree pour ' + selectedMemberName;
      selectedMemberId = null;
    } catch (err) { error = err instanceof Error ? err.message : 'Erreur'; }
  }

  async function onExport() {
    try {
      const blob = await exportMembers($auth.user!.churchId, $auth.token!);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = 'membres.csv'; a.click();
    } catch (err) { error = 'Erreur export'; }
  }
</script>

<h1 class="text-2xl font-bold mb-6">Membres</h1>
{#if message}<p class="text-green-700 text-sm mb-3">{message}</p>{/if}
{#if error}<p class="text-red-600 text-sm mb-3">{error}</p>{/if}

<div class="flex justify-end mb-4">
  <button on:click={onExport} class="bg-slate-800 text-white px-4 py-2 rounded text-sm hover:bg-slate-700">Telecharger la liste (CSV)</button>
</div>

<form on:submit={onSubmitMember} class="bg-white p-4 rounded border border-slate-200 grid gap-3 md:grid-cols-2 mb-8">
  <h2 class="md:col-span-2 font-bold text-lg text-slate-800">Ajouter un membre</h2>
  <input bind:value={form.firstName} placeholder="Prenom" required class="border px-3 py-2 rounded" />
  <input bind:value={form.lastName} placeholder="Nom" required class="border px-3 py-2 rounded" />
  <input type="email" bind:value={form.email} placeholder="Email" required class="border px-3 py-2 rounded" />
  <input bind:value={form.phone} placeholder="Telephone" required class="border px-3 py-2 rounded" />
  <select bind:value={form.membershipStatus} class="border px-3 py-2 rounded">
    <option value="LOCAL_BAPTIZED">Baptise local</option>
    <option value="EXTERNAL_BAPTIZED">Baptise externe</option>
    <option value="UNBAPTIZED">Non baptise</option>
  </select>
  <select bind:value={form.responsibilityLevel} class="border px-3 py-2 rounded">
    <option value="MAMBRA_TSOTRA">Membre</option>
    <option value="DIAKONA">Diacre</option>
    <option value="LOHOLONA">Responsable</option>
  </select>
  <button type="submit" class="md:col-span-2 bg-slate-900 text-white rounded py-2">Ajouter</button>
</form>

<h2 class="text-xl font-bold mb-4">Liste des membres</h2>
{#if loading}
  <p>Chargement...</p>
{:else if members.length === 0}
  <p class="text-slate-500">Aucun membre enregistre.</p>
{:else}
  <div class="bg-white rounded border border-slate-200 overflow-hidden">
    <table class="w-full text-left text-sm">
      <thead class="bg-slate-100 text-slate-700">
        <tr>
          <th class="px-4 py-2">Nom</th>
          <th class="px-4 py-2">Email</th>
          <th class="px-4 py-2">Statut</th>
          <th class="px-4 py-2">Responsabilite</th>
          <th class="px-4 py-2 text-right">Actions</th>
        </tr>
      </thead>
      <tbody class="divide-y divide-slate-100">
        {#each members as member}
          <tr class="hover:bg-slate-50">
            <td class="px-4 py-2 font-medium">{member.firstName} {member.lastName}</td>
            <td class="px-4 py-2 text-slate-600">{member.email}</td>
            <td class="px-4 py-2">
              <span class="text-xs px-2 py-0.5 rounded bg-slate-100">{member.membershipStatus}</span>
            </td>
            <td class="px-4 py-2">
              <span class="text-xs px-2 py-0.5 rounded bg-blue-100 text-blue-800">{member.responsibilityLevel}</span>
            </td>
            <td class="px-4 py-2 text-right">
              <button on:click={() => openPasswordModal(member)} class="text-blue-600 hover:underline text-xs font-medium">
                Creer son compte
              </button>
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
{/if}

{#if selectedMemberId}
  <div class="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
    <div class="bg-white rounded-lg p-6 w-full max-w-md">
      <h3 class="text-lg font-bold mb-2">Definir un mot de passe</h3>
      <p class="text-sm text-slate-600 mb-4">Pour : <strong>{selectedMemberName}</strong></p>
      <input type="password" bind:value={newPassword} placeholder="Mot de passe (min 8)" class="w-full border px-3 py-2 rounded mb-4" />
      <div class="flex gap-2 justify-end">
        <button on:click={() => selectedMemberId = null} class="text-slate-600 px-4 py-2">Annuler</button>
        <button on:click={onCreateAccount} disabled={!newPassword || newPassword.length < 8} class="bg-green-700 text-white rounded px-4 py-2 disabled:opacity-50">
          Creer le compte
        </button>
      </div>
    </div>
  </div>
{/if}
